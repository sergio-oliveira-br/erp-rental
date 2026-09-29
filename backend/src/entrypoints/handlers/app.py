# backend/src/entrypoints/handlers/app.py

from fastapi import FastAPI
from mangum import Mangum
from aws_lambda_powertools import Logger

logger = Logger(service="erp-rental-api")

app = FastAPI(
    title="ERP Rental API",
    version="1.0.0",
    description="API Serverless para gestão de aluguel de materiais"
)

@app.get("/health", tags=["Health"])
def health_check():
    logger.info("Health check endpoint chamado")
    return {
        "status": "healthy",
        "service": "erp-rental-backend",
        "environment": "local"
    }

# Handler que o AWS Lambda executará
handler = Mangum(app)