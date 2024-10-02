# app/models.py
from pydantic import BaseModel
from typing import List, Dict, Any, Union, Optional

# class Example(BaseModel):
#     input: Dict[str, Any]
#     output: float
#     explanation: str

class Example(BaseModel):
    input: str  # Input example, e.g., "nums1 = [1,3], nums2 = [2]"
    custom_input: Optional[Union[str, List]] = None  # Customized input format for API processing
    output: str  # The corresponding output of the example
    explanation: str  # Explanation for the result of the example

class Problem(BaseModel):
    name: str  # API-friendly name, e.g., "median_of_two_sorted_arrays"
    custom_name: str  # UI-friendly name, e.g., "Median of Two Sorted Arrays"
    difficulty: str  # Difficulty level of the problem, e.g., "Easy", "Medium", "Hard"
    description: str  # Full description of the problem
    examples: List[Example]  # A list of examples for the problem
    constraints: List[str]  # List of constraints as strings
    start: str  # Starting code
    end: str  # Ending code
    submit_example: Optional[Example] = None  # Optional single example to be submitted
    
class ProblemSummary(BaseModel):
    name: str
    custom_name: str
    difficulty: str

class CodeRequestModel(BaseModel):
    user_code: str  

class CodeResponseModel(BaseModel):
    combined_code: str  

# Define the Pydantic model for the test case structure
class TestCase(BaseModel):
    problem_name: str
    test_case_id: str
    input_params: Dict[str, List[int]]  # Dictionary to accommodate different parameters
    expected_result: List[int]
    actual_result: Optional[List[int]] = None  # Can be None initially
    status: str = "not_tested"  # Default value is "not_tested"

class TestCaseResponse(BaseModel):
    message: str
    test_case_id: str

class Status(BaseModel):
    id: int
    description: str

class Submission(BaseModel):
    stdout: Optional[str]
    time: str
    memory: int
    stderr: Optional[str]
    token: str
    compile_output: Optional[str]
    message: Optional[str]
    status: Status

class PaylodItem(BaseModel):
    cpu_extra_time: Optional[float]
    cpt_time_limit: int
    memory_limit: int
    stack_limit: Optional[int]
    wall_time_limit: Optional[int]
    max_file_size: Optional[int]

class APIRequest(BaseModel):
    submissions: List[Submission]
    paylod: List[PaylodItem]