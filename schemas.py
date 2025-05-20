from pydantic import BaseModel, ConfigDict, Field
from typing import List,Annotated, Sequence
from langgraph.graph import MessagesState
import operator

class InputMessage(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    human_query: str
    conversation_history: list[InputMessage]

class QueryResponse(BaseModel):
    answer: str
    enhanced_query: str
    context_aggregator: list

class State(MessagesState):
    enhanced_query:str
    context_aggregator: Annotated[list, operator.add]
    conversation_history: Annotated[list, operator.add]
    image_path: str | None = None
    image_description: str | None = None
