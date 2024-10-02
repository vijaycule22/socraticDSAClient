from app.models import TestCase  # Assuming TestCase model is defined in app/models.py
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId  # MongoDB ObjectId handling
from typing import Optional, List

# Insert a new test case into MongoDB
async def add_test_case(db: AsyncIOMotorCollection, test_case: TestCase) -> str:
    """
    Inserts a new test case document into the MongoDB collection.
    
    :param db: The MongoDB collection (AsyncIOMotorCollection).
    :param test_case: The Pydantic TestCase model.
    :return: The ID of the inserted document as a string.
    """
    test_case_dict = test_case.model_dump()  # Convert Pydantic model to dictionary
    result = await db.insert_one(test_case_dict)
    return str(result.inserted_id)  # Convert ObjectId to a string and return it


# Retrieve a test case by its test_case_id
async def get_test_case_by_id(db: AsyncIOMotorCollection, test_case_id: str) -> Optional[TestCase]:
    """
    Retrieves a test case from MongoDB by its test_case_id.
    
    :param db: The MongoDB collection (AsyncIOMotorCollection).
    :param test_case_id: The ID of the test case to retrieve.
    :return: The TestCase object or None if not found.
    """
    test_case = await db.find_one({"test_case_id": test_case_id})
    
    if not test_case:
        return None
    
    # Convert MongoDB ObjectId to string if present
    if "_id" in test_case:
        test_case["_id"] = str(test_case["_id"])
    
    return TestCase(**test_case)  # Convert the dictionary to a Pydantic TestCase model


# Retrieve all test cases for a particular problem by problem_name (case-insensitive)
async def get_test_cases_by_problem_name(db: AsyncIOMotorCollection, problem_name: str) -> List[TestCase]:
    """
    Retrieves all test cases for a specific problem name from MongoDB (case-insensitive).
    
    :param db: The MongoDB collection (AsyncIOMotorCollection).
    :param problem_name: The name of the problem (case-insensitive search).
    :return: A list of TestCase objects.
    """
    test_cases = await db.find({"problem_name": {"$regex": f"^{problem_name}$", "$options": "i"}}).to_list(100)  # Adjust the limit if needed
    
    # Convert ObjectId to string for each test case and return as Pydantic models
    return [TestCase(**{**tc, "_id": str(tc["_id"])}) if "_id" in tc else TestCase(**tc) for tc in test_cases]


# Delete a test case by its test_case_id
async def delete_test_case_by_id(db: AsyncIOMotorCollection, test_case_id: str) -> bool:
    """
    Deletes a test case by its test_case_id from MongoDB.
    
    :param db: The MongoDB collection (AsyncIOMotorCollection).
    :param test_case_id: The ID of the test case to delete.
    :return: True if the deletion was successful, False otherwise.
    """
    result = await db.delete_one({"test_case_id": test_case_id})
    return result.deleted_count > 0  # Return True if a document was deleted


# Retrieve all test cases in the database with a limit (default 100)
async def get_all_test_cases(db: AsyncIOMotorCollection, limit: int = 100) -> List[TestCase]:
    """
    Retrieves all test cases from MongoDB, limited to the specified number of documents.
    
    :param db: The MongoDB collection (AsyncIOMotorCollection).
    :param limit: The maximum number of test cases to retrieve (default is 100).
    :return: A list of TestCase objects.
    """
    test_cases = await db.find({}).to_list(limit)
    
    # Convert ObjectId to string for each test case and return as Pydantic models
    return [TestCase(**{**tc, "_id": str(tc["_id"])}) if "_id" in tc else TestCase(**tc) for tc in test_cases]
