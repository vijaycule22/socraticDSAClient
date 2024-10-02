import os
import httpx
from dotenv import load_dotenv
from typing import Tuple
import re
import asyncio
import time

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# Retry decorator
async def fetch_openai_response(messages: list, retries: int = 3, backoff_factor: float = 1.0) -> dict:
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # Convert the list of Message objects to a list of dictionaries
    messages_dict = [message.dict() for message in messages]

    data = {
        "model": "gpt-4o-mini",
        "messages": messages_dict
    }

    attempt = 0
    while attempt <= retries:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(OPENAI_API_URL, headers=headers, json=data)
                response.raise_for_status()  # Raise an error for bad responses (e.g., 4xx or 5xx)
                return response.json()

        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            print(f"Request failed: {exc}")
            attempt += 1
            if attempt > retries:
                raise Exception(f"Max retries exceeded after {retries} attempts")
            # Wait for exponentially increasing time before the next retry
            wait_time = backoff_factor * (2 ** (attempt - 1))
            print(f"Retrying in {wait_time} seconds...")
            await asyncio.sleep(wait_time)

def parse_openai_response(response: dict) -> Tuple[str, str]:
    content = response['choices'][0]['message']['content']
    
    # Regex to find code blocks enclosed by triple backticks
    code_blocks = re.findall(r"```(.*?)```", content, re.DOTALL)
    code_output = "\n".join(code_blocks)
    
    # Remove code blocks from the content to get the text output
    text_output = re.sub(r"```.*?```", "", content, flags=re.DOTALL).strip()
    
    return text_output, code_output
