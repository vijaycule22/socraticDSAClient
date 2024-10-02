import random
import requests
from typing import List, Dict, Optional

def generate_and_insert_test_case(seed_value: int, start: int, end: int, size: int, problem_name: str, api_url: str):
    """
    Generates a random array and inserts a test case into the MongoDB collection via the API.

    Parameters:
    - seed_value: The seed for the random generator (ensures repeatability).
    - start: The start range for generating random integers.
    - end: The end range for generating random integers.
    - size: The number of elements in the array.
    - problem_name: The problem name for the test case.
    - api_url: The API endpoint to insert the test case.
    
    Returns:
    - The response from the API call or error message if something goes wrong.
    """

    # Set the random seed for repeatability
    random.seed(seed_value)

    # Generate random array of integers within the specified range
    random_array = [random.randint(start, end) for _ in range(size)]
    
    # Sort the array to create the expected result
    expected_result = sorted(random_array)

    # Create the test case dictionary
    test_case_data = {
        "problem_name": problem_name,
        "test_case_id": f"TC_{1002}",  # Static test case ID, change as needed
        "input_params": {"nums": random_array},  # Input parameters (random array)
        "expected_result": expected_result,  # Expected sorted array
        "actual_result": None,
        "status": "not_tested"
    }

    # Make a POST request to the API to insert the test case
    headers = {'Content-Type': 'application/json'}
    response = requests.post(api_url, json=test_case_data, headers=headers)

    # Check if the response status is 200 OK
    if response.status_code != 200:
        return {"error": f"Failed with status code {response.status_code}", "content": response.text}
    
    try:
        return response.json()  # Return the API's JSON response
    except requests.exceptions.JSONDecodeError:
        return {"error": "Response is not in JSON format", "content": response.text}

# Example usage:
# Assuming your FastAPI app is running on localhost at port 8000
seed_value = 42
start = -5000
end = 15000
size = 100000
problem_name = "sort_an_array"
api_url = "http://localhost:8000/test_cases"  # The API endpoint to insert the test case

response = generate_and_insert_test_case(seed_value, start, end, size, problem_name, api_url)
print(response)
