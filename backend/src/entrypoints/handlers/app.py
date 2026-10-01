# backend/src/entrypoints/handlers/app.py

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from mangum import Mangum
from aws_lambda_powertools import Logger

from src.domain.exceptions.domain_exceptions import (
    EntityNotFoundException,
    BusinessRuleException,
    DomainException,
)
from src.entrypoints.routers import clients, materials, rentals

logger = Logger(service="erp-rental-api")

app = FastAPI(
    title="ERP Rental API",
    version="1.0.0",
    description="API Serverless para gestão de aluguel de materiais"
)

# --- MAPEAMENTO GLOBAL DE EXCEÇÕES ---
@app.exception_handler(EntityNotFoundException)
async def entity_not_found_handler(request: Request, exc: EntityNotFoundException):
    logger.warning(f"Recurso nao encontrado: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "NOT_FOUND", "message": exc.message}
    )

@app.exception_handler(BusinessRuleException)
async def business_rule_handler(request: Request, exc: BusinessRuleException):
    logger.warning(f"Violacao de regra de negocio: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": "BUSINESS_RULE_VIOLATION", "message": exc.message}
    )

@app.exception_handler(DomainException)
async def generic_domain_handler(request: Request, exc: DomainException):
    logger.error(f"Erro interno do dominio: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "UNPROCESSABLE_ENTITY", "message": exc.message}
    )


# Registro dos Roteadores
app.include_router(clients.router)
app.include_router(materials.router)
app.include_router(rentals.router)

# --- ENDPOINTS ---
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "erp-rental-backend"}

handler = Mangum(app)