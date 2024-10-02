from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.openai_service import fetch_openai_response, parse_openai_response

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

@router.post("/openai-chat")
async def openai_chat(chat_request: ChatRequest):
    try:
        # Fetch the response from OpenAI
        response = await fetch_openai_response(chat_request.messages)
        
        # Parse the response
        text_output, code_output = parse_openai_response(response)
        
        return {
            "text_output": text_output,
            "code_output": code_output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
