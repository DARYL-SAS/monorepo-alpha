import dotenv
import os
from langchain_openai import AzureOpenAIEmbeddings,AzureChatOpenAI
from pinecone import Pinecone,ServerlessSpec
from pinecone.grpc import PineconeGRPC

from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference.tracing import AIInferenceInstrumentor 
import os
import dotenv

import json

from app.schemas import *

from openai import AzureOpenAI
from langchain_openai import AzureOpenAIEmbeddings
from langchain_azure_ai.chat_models import AzureAIChatCompletionsModel

from textwrap import dedent

import base64
from openai import OpenAI
print("Loading OpenAI client...")
openai_api_key = os.getenv("OPENAI_API_KEY")
print("OpenAI API Key:", openai_api_key)
client_image = OpenAI(api_key=openai_api_key)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

#read config.yaml file
# Load the config.yaml file
import yaml
config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
with open(config_path, "r",encoding="utf-8") as file:
    config = yaml.safe_load(file)


# Extract industry name and description
industry_name = config.get("industry_name", "Default Industry")
description = config.get("description", "Default Description")
print("Industry Name:", industry_name)
print("Description:", description)

dotenv.load_dotenv()

pinecone_key = os.getenv("PINECONE_API_KEY")

dotenv.load_dotenv()

endpoint = os.getenv("AZURE_OPENAI_ENDPOINT_COMP_PLUS")
endpoint_mini = os.getenv("AZURE_OPENAI_ENDPOINT_COMP_MINI")
endpoint_nano = os.getenv("AZURE_OPENAI_ENDPOINT_COMP_NANO")

key = os.getenv("AZURE_OPENAI_API_KEY")
model_name = "gpt-4.1"
model_deployment = "gpt-4.1"
endpoint_openai = os.getenv("AZURE_OPENAI_ENDPOINT")

model_name_embedding = "text-embedding-3-large"
deployment_embedding = "text-embedding-3-large"

client_embedding = AzureOpenAIEmbeddings(
    model="text-embedding-3-large",
    api_version="2024-12-01-preview",
)

client_langchain = AzureAIChatCompletionsModel(
    endpoint=endpoint,
    credential=key,
    model=model_deployment,
    model_name=model_name,
    cache=False
)

client_final = client_langchain.with_config(tags=["final"])

client_langchain_mini = AzureAIChatCompletionsModel(
    endpoint=endpoint_mini,
    credential=key,
    model="gpt-4.1-mini",
    model_name="gpt-4.1-mini",
    cache=False,
    disable_streaming=True,
)

client_langchain_nano = AzureAIChatCompletionsModel(
    endpoint=endpoint_nano,
    credential=key,
    model="gpt-4.1-nano",
    model_name="gpt-4.1-nano",
    cache=False,
    disable_streaming=True,
)


pc = PineconeGRPC(api_key=pinecone_key)
index = pc.Index("kag-hybrid")

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, RemoveMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END

#function to format history
def prepare_history(history:list[InputMessage]):
    formatted_history = []
    for message in history:
        if message.role == "user":
            formatted_history.append(HumanMessage(content=message.content))
        elif message.role == "assistant":
            formatted_history.append(AIMessage(content=message.content))
    return formatted_history

def format_history(history:list) -> str:
    formatted_history = ""
    for message in history:
        #if message is of class HumanMessage
        if isinstance(message, HumanMessage):
            formatted_history += f"User: {message.content}\n"
        #if message is of class AIMessage
        elif isinstance(message, AIMessage):
            formatted_history += f"Assistant: {message.content}\n"
    return formatted_history



from app.prompt import query_enhancing

industry_name = config.get("industry_name", "Default Industry")
description = config.get("description", "Default Description")

def enhance_query(state:State):

    print("###### Enhancing query... ######")
    # Define the system message
    last_message = state["messages"][-1]
    formatted_history = format_history(state["conversation_history"])
    attachement = "No attachement provided"
    if state["image_description"] is not None:
        attachement = state["image_description"]
    prompt = query_enhancing.format(raw_query=last_message.content,industry_name=industry_name,description=description,conversation_history=formatted_history,attachment=attachement)

    # Call the chat model with the messages
    response = client_langchain_nano.invoke(prompt)

    print("enhanced query: ", response.content)
    print("###### Finished enhancing query... ######")
    print("-"*50)
    return {"enhanced_query": response.content}

from langchain_neo4j import Neo4jGraph, GraphCypherQAChain

URI = os.getenv("URI")
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

print("URI:", URI)
print("USERNAME:", USERNAME)

print("Connecting to Neo4j...")
graph_rag=Neo4jGraph(
    url=URI,
    username=USERNAME,
    password=PASSWORD,
    enhanced_schema=True,
)
print("Connected to Neo4j!")

#print(graph_rag.schema)

def rag_from_graph(state:State):
    print("#######Entering RAG from Graph#######")
    print("RAW QUERY:", state["enhanced_query"])

    #chain = GraphCypherQAChain.from_llm(llm=client_langchain_mini,graph=graph_rag,verbose=True, allow_dangerous_requests=True,validate_cypher=True)
    #response = chain.invoke(state["enhanced_query"])

    #mock response
    response = {
        "result": "Je n'ai pas trouvé de réponse dans la base de données Graph."
    }
    #print("RAG RESPONSE:", response["result"])
    print("########Exiting RAG from Graph#######")
    print("-"*50)
    return {"context_aggregator": [{"result":response["result"],"type_kag": "graph"}]}

from langchain_pinecone import PineconeVectorStore

print("Connecting to Graph DB...")
pc = PineconeGRPC(api_key=pinecone_key)
index = pc.Index("kag-hybrid")
print("Connected to Graph DB!")

vector_store = PineconeVectorStore(index=index, embedding=client_embedding)

def get_doc_by_id(documents:list,doc_id):
    for doc in documents:
        if doc.id == doc_id:
            return doc
    return None

def rag_from_vectorDB(state:State,threshold=0.1,namespace=industry_name,k=20,rerank_model = "cohere-rerank-3.5"):
    print("#######Entering RAG from VectorDB#######")
    print("RAW QUERY:", state["enhanced_query"])
    results = vector_store.similarity_search_with_score(
    query=state["enhanced_query"],
    k=k,
    namespace=namespace,
    )

    #rerank the results
    compatible_docs = [{"id": doc[0].id, "text": doc[0].page_content,'metadata':doc[0].metadata} for doc in results]

    reranked_results =pc.inference.rerank(
        model=rerank_model,
        query=state["enhanced_query"],
        documents=compatible_docs,
        top_n=k,
        return_documents=True
    )

    reranked_results_content = [{"text":doc["document"]["text"],
                                 "score":doc["score"],
                                 "metadata":doc["document"]["metadata"]}
                                 for doc in reranked_results.data if doc["score"] > threshold]
    #print("RERANKED RESULTS:", reranked_results)
    print("########Exiting RAG from VectorDB#######")
    print("-"*50)
    return {"context_aggregator": [{"result":reranked_results_content,"type_kag": "vector"}]}

from app.prompt import assistant_query

def answer_query(state:State):
    print("#######Entering Answering Query#######")
    
    # Define the system message
    last_message = state["messages"][-1]
    print("RAW QUERY:", last_message.content)
    print("industry_name:", industry_name)

    graph_context = ""
    vector_context = ""
    for context in state["context_aggregator"]:
        if context["type_kag"] == "graph":
            print("context graph!")
            graph_context = context["result"]
        if context["type_kag"] == "vector":
            print("context vector!")
            vector_context = context["result"]

    # prepare prompt
    
    attachement = "No attachement provided"

    if state["image_description"] is not None:
        attachement = state["image_description"]

    print("attachement:", attachement)
    prompt_messages = [
        SystemMessage(content=assistant_query),
    ] + state["conversation_history"] + [
        HumanMessage(content=last_message.content),
        HumanMessage(content=f"attachement: {attachement}"),
        SystemMessage(content="Graph Context: " + str(graph_context)),
        SystemMessage(content="Vector Context: " + str(vector_context)),
    ]

    # Call the chat model with the messages
    response = client_langchain.invoke(prompt_messages)

    return {"messages": [response]}

def describe_image(state:State):
    print("#######Entering Describe Image#######")

    if state["image_path"] is not None:
        # Call the image description model
        base64_image = encode_image(state["image_path"])
        response = client_langchain_mini.invoke(
            [HumanMessage(
             content=[
             {"type": "text", "text": "**You are** a senior agronomist and GIS specialist. Describe the image below, extract everything useful to qualify the project, this inlcudes dimensions, metrics, lines, parcels... everything that a that a farm manager can hand directly to field staff. Be concise provide a concise description, just the general overview only." },
             {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
             ])]
        )
        # Extract the description from the response
        description_image = response.content
        print("Image description:", description_image)
        print("#######Exiting Describe Image#######")
        return{"image_description": description_image}
    
    print("No image provided.")
    print("#######Exiting Describe Image#######")
    return {"image_description": None}


from IPython.display import Image, display
from langgraph.graph import StateGraph, START,END

print("BULDING THE MOST POWERFUL MULTIAGENT GRAPH EVER!")
builder = StateGraph(State)

builder.add_node("describe_image",describe_image)
builder.add_node("enhancer",enhance_query)
builder.add_node("rag_from_graph",rag_from_graph)
builder.add_node("rag_from_vectorDB",rag_from_vectorDB)
builder.add_node("answer_query",answer_query)

builder.add_edge(START,"describe_image")
#builder.add_edge(START,"enhancer")
builder.add_edge("describe_image","enhancer")
builder.add_edge("enhancer","rag_from_graph")
builder.add_edge("enhancer","rag_from_vectorDB")

builder.add_edge("rag_from_graph","answer_query")
builder.add_edge("rag_from_vectorDB","answer_query")

builder.add_edge("answer_query",END)


graph = builder.compile()