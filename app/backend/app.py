from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.core.ai_agent import get_response_from_ai_agents
from app.config.settings import settings
from app.common.logger import get_logger

logger = get_logger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


'''
Needed to validate request data
'''
class ChatRequest(BaseModel):
    model_name:str
    system_prompt:str
    messages: List[str]
    allow_search: bool


@app.post('/chat')
def chat_endpoint(request_state: ChatRequest):
    logger.info(f'Received request for model:{request_state.model_name}')
    if request_state.model_name not in settings.ALLOWED_MODELS:
        logger.warn(f'Model {request_state.model_name} is not available. Available models: {settings.ALLOWED_MODELS}')
        raise HTTPException(status_code=400, detail=f'Model {request_state.model_name} is not available. Available models: {settings.ALLOWED_MODELS}')
    try:
        response = get_response_from_ai_agents(
            request_state.model_name,
            request_state.messages,
            request_state.allow_search,
            request_state.system_prompt,
        )
        logger.info(f'Successfully processed and received response {response}')
        return {"response": response}
    except Exception as e:
        logger.error(f"An error occurred: {e}") 
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    


@app.get('/supported-models')
def get_available_models():
    logger.info('Received request for available models')
    return settings.ALLOWED_MODELS