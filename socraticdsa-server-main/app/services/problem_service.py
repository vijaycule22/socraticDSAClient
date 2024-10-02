# app/services/problem_service.py
from app.models import Problem
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId  # MongoDB ObjectId handling

# Insert a new problem into MongoDB
async def add_problem(db: AsyncIOMotorCollection, problem: Problem):
    problem_dict = problem.model_dump()  # Convert Pydantic model to dictionary
    result = await db.insert_one(problem_dict)
    return str(result.inserted_id)  # Convert ObjectId to a string

# Retrieve a problem by name (API-friendly name), case-insensitive query
async def get_problem_by_name(db: AsyncIOMotorCollection, name: str):
    # Use a case-insensitive search to avoid issues with case mismatch
    problem = await db.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    
    if not problem:
        return None
    
    # Convert ObjectId to a string before returning the document
    problem["_id"] = str(problem["_id"])
    
    return problem

# Delete a problem by name (case-insensitive)
async def delete_problem_by_name(db: AsyncIOMotorCollection, name: str):
    # Use a case-insensitive search to delete the problem by name
    result = await db.delete_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    return result.deleted_count > 0  # Return True if a document was deleted

async def get_all_problems(db: AsyncIOMotorCollection):
    # Fetch only the required fields: name, custom_name, difficulty
    problems = await db.find({}, {"name": 1, "custom_name": 1, "difficulty": 1, "_id": 0}).to_list(100)  # Adjust limit if necessary
    return problems