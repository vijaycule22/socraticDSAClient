# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import problem_routes, openai_routes, code_routes, test_case_routes, submission_routes
import os

app = FastAPI()

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. For more security, specify the allowed origins.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.).
    allow_headers=["*"],  # Allows all headers.
)


# Include the problem routes
app.include_router(problem_routes.router)
app.include_router(openai_routes.router)
app.include_router(code_routes.router)
app.include_router(test_case_routes.router)
app.include_router(submission_routes.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, loop="asyncio")
    # uvicorn.run(app, host="0.0.0.0", port=8000)
