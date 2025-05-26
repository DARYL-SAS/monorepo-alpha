import uvicorn
from dotenv import load_dotenv

load_dotenv()

def start():
    uvicorn.run("messageagent.app:app", host="0.0.0.0", port=8001, reload=True)

if __name__ == "__main__":
    start()