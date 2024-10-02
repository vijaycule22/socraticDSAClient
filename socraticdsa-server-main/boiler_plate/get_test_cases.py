import requests

def get_test_cases_by_problem_name(problem_name: str, api_url: str):
    """
    Fetches test cases from the API for a specific problem name.

    Parameters:
    - problem_name: The name of the problem for which to fetch test cases.
    - api_url: The base URL of the API (e.g., "http://localhost:8000").

    Returns:
    - The response from the API call or an error message if something goes wrong.
    """
    
    # Construct the full URL for the API endpoint
    full_url = f"{api_url}/test_cases/problem/{problem_name}"
    
    try:
        # Send a GET request to the API
        response = requests.get(full_url)
        
        # Check if the request was successful
        if response.status_code != 200:
            return {"error": f"Failed with status code {response.status_code}", "content": response.text}
        
        # Return the response data
        return response.json()
    
    except requests.exceptions.RequestException as e:
        # Handle connection or other errors
        return {"error": str(e)}

# Example usage:
api_url = "http://localhost:8000"  # Your FastAPI base URL
problem_name = "sort_an_array"  # The problem name you're querying

# Call the function to get test cases by problem name
response = get_test_cases_by_problem_name(problem_name, api_url)
print(response)
