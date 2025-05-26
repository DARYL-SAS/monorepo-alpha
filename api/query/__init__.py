import azure.functions as func
import json
from app.agent import graph, prepare_history
from langchain_core.messages import HumanMessage
from app.utils import base64_to_tempfile

import azure.functions as func
import json
from app.agent import graph, prepare_history
from langchain_core.messages import HumanMessage
from app.utils import base64_to_tempfile

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        # Lecture du corps de la requête
        human_query = req_body.get("human_query")
        history = req_body.get("conversation_history", [])
        image = req_body.get("image", None)

        input_message = HumanMessage(content=human_query)
        conversation_history = prepare_history(history)

        image_path = base64_to_tempfile(image) if image else None

        output = graph.invoke({
            "messages": [input_message],
            "conversation_history": conversation_history,
            "image_path": image_path
        })

        last_msg = output["messages"][-1]

        response_body = {
            "answer": last_msg.content,
            "enhanced_query": output.get("enhanced_query", ""),
            "context_aggregator": output.get("context_aggregator", [])
        }

        return func.HttpResponse(
            body=json.dumps(response_body),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        return func.HttpResponse(
            body=json.dumps({ "error": str(e) }),
            status_code=500,
            mimetype="application/json"
        )

# test