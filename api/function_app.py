import azure.functions as func 
from formagentsystem.app import app as fastapi_app

app = func.AsgiFunctionApp(app=fastapi_app, 
                           function_name= "messageagent",
                           http_auth_level=func.AuthLevel.FUNCTION)