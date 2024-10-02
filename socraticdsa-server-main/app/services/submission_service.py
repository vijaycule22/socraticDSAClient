from typing import List, Optional
from pydantic import BaseModel
import json
from itertools import zip_longest
from app.models import APIRequest

# class Status(BaseModel):
#     id: int
#     description: str

# class Submission(BaseModel):
#     stdout: Optional[str]
#     time: str
#     memory: int
#     stderr: Optional[str]
#     token: str
#     compile_output: Optional[str]
#     message: Optional[str]
#     status: Status

# class PaylodItem(BaseModel):
#     cpu_extra_time: Optional[float]
#     cpt_time_limit: int
#     memory_limit: int
#     stack_limit: Optional[int]
#     wall_time_limit: Optional[int]
#     max_file_size: Optional[int]

# class APIRequest(BaseModel):
#     submissions: List[Submission]
#     paylod: List[PaylodItem]

# # Sample payload received as a JSON string
# payload_json = """
# {
#   "submissions": [
#       {
#           "stdout": "5212 5819 5869 5976 6041 6051 6423 6501 6832 7168 7279 7339 7582 7614 7848 8039 8070 8169 8309 8349 8358 8648 9090 9572 9575 9681 10094 10231 10329 10354 10607 11300 11515 11865 11913 11967 12055 12164 12196 12223 12314 12467 12505 12623 12628 13021 13024 13081 13667 13679 13748 13773 13845 14012 14105 14108 14115 14482 14606 15311 15336 15626 16029 16149 16270 16641 16763 16850 16954 17130 17403 17433 17449 17455 17964 18145 18746 18825 18848 19719 19857 20035 20054 20147 21358 21559 22502 22571 22856 22870 23089 23250 23390 23585 23918 24309 24349 24726 24782 24960\\n5096 5328 5361 5553 5695 5707 5743 5906 5950 6054 6171 6630 6874 6961 7026 7183 7370 7456 7683 7830 7943 8072 8115 8366 8763 8857 9424 9679 9700 9871 10050 10110 10509 10643 10992 11569 11870 11878 11914 12375 12940 13181 13253 13332 13443 13607 13870 13899 13908 14121 14159 14301 14452 14626 14858 14934 15192 15387 15428 15486 15507 15764 15792 16099 16512 16683 16870 17244 17452 17596 17620 17673 18147 18373 18480 18582 18686 18894 19037 19389 19907 19924 20715 20868 20991 21144 21180 21382 21880 21993 22057 22388 22592 22801 23165 23354 23871 24148 24436 24582\\n",
#           "time": "0.013",
#           "memory": 3364,
#           "stderr": null,
#           "token": "dfb96fbe-e530-4ecf-9618-25473a42dfc4",
#           "compile_output": null,
#           "message": null,
#           "status": {
#               "id": 3,
#               "description": "Accepted"
#           }
#       },
#       {
#           "stdout": null,
#           "time": "1.096",
#           "memory": 4580,
#           "stderr": null,
#           "token": "5630f635-2287-4c41-ac31-58b296f043f2",
#           "compile_output": null,
#           "message": "Time limit exceeded",
#           "status": {
#               "id": 5,
#               "description": "Time Limit Exceeded"
#           }
#       }
#   ],
#   "paylod" :[
#     {
#       "cpu_extra_time" : null,
#       "cpt_time_limit": 1,
#       "memory_limit" : 12000,
#       "stack_limit" : null,
#       "wall_time_limit":null,
#       "max_file_size":null
#     }
#   ]
# }
# """

# The asynchronous function to generate the result string
async def generate_result_string(api_request_object: APIRequest) -> str:
    # Initialize an empty string to store all information
    result_string = ""

    # Iterate through both submissions and paylod items using zip_longest to handle unequal lengths
    for index, (submission, paylod_item) in enumerate(zip_longest(api_request_object.submissions, api_request_object.paylod), start=1):
        # Handle missing (None) paylod_item values
        if paylod_item is None:
            cpu_extra_time = 0
            cpt_time_limit = 0
        else:
            # Handle null values by using 0 when the value is None for paylod item
            cpu_extra_time = paylod_item.cpu_extra_time if paylod_item.cpu_extra_time is not None else 0
            cpt_time_limit = paylod_item.cpt_time_limit if paylod_item.cpt_time_limit is not None else 0

        # Calculate the sum
        total_time = cpu_extra_time + cpt_time_limit

        # Create the string for the current test case
        if submission is not None:
            test_case_info = (f"Total CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case {index}: {total_time} "
                              f"seconds and Time taken for Test Case {index}: {submission.time} seconds and Memory: {submission.memory} "
                              f"and the status of Test Case {index}: {submission.status.description}\n")
        else:
            test_case_info = (f"Total CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case {index}: {total_time} "
                              f"and No submission data available for this test case\n")

        # Append the current test case information to the result string
        result_string += test_case_info

    # Return the result string
    return result_string

# # Convert the JSON string into a Python dictionary
# payload_dict = json.loads(payload_json)

# # Parse the dictionary into an APIRequest object
# api_request_object = APIRequest(**payload_dict)
  
# from itertools import zip_longest

# # Initialize an empty string to store all information
# result_string = ""

# from itertools import zip_longest

# # Initialize an empty string to store all information
# result_string = ""

# # Iterate through both submissions and paylod items using zip_longest to handle unequal lengths
# for index, (submission, paylod_item) in enumerate(zip_longest(api_request_object.submissions, api_request_object.paylod), start=1):
#     # Handle missing (None) paylod_item values
#     if paylod_item is None:
#         cpu_extra_time = 0
#         cpt_time_limit = 0
#     else:
#         # Handle null values by using 0 when the value is None for paylod item
#         cpu_extra_time = paylod_item.cpu_extra_time if paylod_item.cpu_extra_time is not None else 0
#         cpt_time_limit = paylod_item.cpt_time_limit if paylod_item.cpt_time_limit is not None else 0

#     # Calculate the sum
#     total_time = cpu_extra_time + cpt_time_limit

#     # Create the string for the current test case
#     if submission is not None:
#         test_case_info = (f"Total CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case {index}: {total_time} "
#                           f"and Time taken for Test Case {index}: {submission.time} and Memory: {submission.memory} "
#                           f"and the status of Test Case {index}: {submission.status.description}\n")
#     else:
#         test_case_info = (f"Total CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case {index}: {total_time} "
#                           f"and No submission data available for this test case\n")

#     # Append the current test case information to the result string
#     result_string += test_case_info

# # Now result_string contains all the information as a single string
# print(result_string)


# {
#   "messages": [
#     {
#       "role": "system",
#       "content": "You are an AI assistant focused on teaching Data Structures and Algorithms, particularly sorting algorithms, using the Socratic method. Guide students to discover solutions through insightful, context-aware questioning rather than direct answers. Provide real-time feedback based on their code execution, personalize guidance to their understanding level, and encourage exploration and reflection. Always be patient, supportive, and focused on deepening their understanding through guided discovery."
#     },
#     {
#       "role": "user",
#       "content": "Total CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case 1: 1 and Time taken for Test Case 1: 0.013 and Memory: 3364 and the status of Test Case 1: Accepted\nTotal CPU Time allocated (cpu_extra_time + cpt_time_limit) for Test Case 2: 1 and Time taken for Test Case 2: 1.096 and Memory: 4580 and the status of Test Case 2: Time Limit Exceeded"
#     }
#   ]
# }
