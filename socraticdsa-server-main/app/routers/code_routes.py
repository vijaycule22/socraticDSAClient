from fastapi import APIRouter, HTTPException
from app.models import CodeRequestModel, CodeResponseModel
from app.services.code_service import add_handling_code

router = APIRouter()

@router.post("/process_code", response_model=CodeResponseModel)
def process_code(request: CodeRequestModel):
    try:
        # Use the service to add handling logic
        combined_code = add_handling_code(request.user_code)
        return CodeResponseModel(combined_code=combined_code)
    except Exception as e:
        # Raise an HTTP exception in case of errors
        raise HTTPException(status_code=500, detail=f"Error processing code: {str(e)}")
