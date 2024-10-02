from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models import TestCase, TestCaseResponse
from app.database import get_db
from typing import List, Optional
from app.services.test_case_service import (
    add_test_case,
    get_test_case_by_id,
    get_test_cases_by_problem_name,
    delete_test_case_by_id,
    get_all_test_cases
)
from app.config import settings  # Import the settings to get the collection name

# Initialize router
router = APIRouter()

# Root endpoint for the test cases API
@router.get("/")
async def read_root():
    return {"message": "Welcome to the Test Cases API!"}

# Route to add a new test case
@router.post("/test_cases", response_model=TestCaseResponse)
async def create_test_case(
    test_case: TestCase, 
    db: AsyncIOMotorCollection = Depends(lambda: get_db(settings.TEST_CASES_COLLECTION_NAME))
):
    """
    Adds a new test case to the MongoDB collection.
    """
    test_case_id = await add_test_case(db, test_case)
    return {"message": "Test case added successfully", "test_case_id": test_case_id}

# Route to get a test case by test_case_id
@router.get("/test_cases/{test_case_id}", response_model=TestCase)
async def fetch_test_case(
    test_case_id: str, 
    db: AsyncIOMotorCollection = Depends(lambda: get_db(settings.TEST_CASES_COLLECTION_NAME))
):
    """
    Fetches a test case by its test_case_id.
    """
    test_case = await get_test_case_by_id(db, test_case_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    return test_case

# Route to get all test cases for a specific problem_name
@router.get("/test_cases/problem/{problem_name}", response_model=List[TestCase])
async def fetch_test_cases_by_problem(
    problem_name: str, 
    db: AsyncIOMotorCollection = Depends(lambda: get_db(settings.TEST_CASES_COLLECTION_NAME))
):
    """
    Fetches all test cases for a specific problem name (case-insensitive).
    """
    test_cases = await get_test_cases_by_problem_name(db, problem_name)
    if not test_cases:
        raise HTTPException(status_code=404, detail="No test cases found for this problem")
    return test_cases

# Route to delete a test case by test_case_id
@router.delete("/test_cases/{test_case_id}")
async def delete_test_case(
    test_case_id: str, 
    db: AsyncIOMotorCollection = Depends(lambda: get_db(settings.TEST_CASES_COLLECTION_NAME))
):
    """
    Deletes a test case by its test_case_id.
    """
    deleted = await delete_test_case_by_id(db, test_case_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Test case not found")
    return {"message": f"Test case '{test_case_id}' deleted successfully."}

# Route to get all test cases (with optional limit)
@router.get("/test_cases", response_model=List[TestCase])
async def fetch_all_test_cases(
    limit: Optional[int] = 100, 
    db: AsyncIOMotorCollection = Depends(lambda: get_db(settings.TEST_CASES_COLLECTION_NAME))
):
    """
    Fetches all test cases with an optional limit.
    """
    test_cases = await get_all_test_cases(db, limit)
    if not test_cases:
        raise HTTPException(status_code=404, detail="No test cases found")
    return test_cases
