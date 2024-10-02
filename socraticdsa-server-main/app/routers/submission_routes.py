from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models import APIRequest
from app.database import get_db
from typing import List
from app.services.submission_service import generate_result_string
from app.config import settings  # Import settings to use the collection name

router = APIRouter()


# Create FastAPI router
router = APIRouter()

# Route for the service
@router.post("/process-submission")
async def process_submission(payload: APIRequest):
    try:
        # Generate the result string asynchronously
        result_string = await generate_result_string(payload)
        return {"result": result_string}
    except Exception as e:
        # Catch and handle errors
        raise HTTPException(status_code=500, detail=str(e))