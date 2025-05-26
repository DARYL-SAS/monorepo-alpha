from fastapi import FastAPI
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from fastapi.responses import StreamingResponse
from app.agent import graph,prepare_history
import json
from app.utils import *


class InputMessage(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    human_query: str
    conversation_history: list[InputMessage]
    stream: bool = False
    image: str | None = None

class QueryResponse(BaseModel):
    answer: str
    enhanced_query: str
    context_aggregator: list

class QueryResponseStreaming(BaseModel):
    answer: str

app = FastAPI()

### add CORS middleware to allow requests from the frontend
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ok"}



@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    # wrap user input
    input_message = HumanMessage(content=request.human_query)
    # wrap conversation history
    conversation_history = prepare_history(request.conversation_history)

    # add image to conversation history if present
    #print("request:",request.image)
    image_path = None
    if request.image:
        #image = base64_to_pil(request.image_base64)
        image_path = base64_to_tempfile(request.image)
        print("#### image_path ####", image_path)
        

    # invoke your state graph
    if not request.stream:
        output = graph.invoke({"messages": [input_message],"conversation_history": conversation_history,"image_path": image_path})
        # extract reply and state
        last_msg = output["messages"][-1]
        return QueryResponse(
            answer=last_msg.content,
            enhanced_query=output.get("enhanced_query", ""),
            context_aggregator=output.get("context_aggregator", []),
        )

    async def event_source():
        async for chunk, meta in graph.astream(
            {"messages": [input_message],"conversation_history": conversation_history,"image_path": image_path}, stream_mode="messages"
        ):
            if meta["langgraph_node"] == "answer_query" and chunk.content:
                yield json.dumps({"answer":chunk.content,"finish_reason":chunk.response_metadata["finish_reason"]})
            if chunk.response_metadata["finish_reason"] == "stop":
                yield json.dumps({"answer":"","finish_reason":"stop"})
    if request.stream:
        print("streaming")
        return StreamingResponse(event_source(), media_type="application/json")
    


    
