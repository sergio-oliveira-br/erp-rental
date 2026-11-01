# finance/backend/src/entrypoints/handlers/app.py

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from mangum import Mangum
from starlette.middleware.cors import CORSMiddleware

# Exceções próprias do domínio Finance.
from src.domain.exceptions.domain_exceptions import (
    EntityNotFoundException,
    BusinessRuleException,
    DomainException,
)

app = FastAPI(
    title="Finance API",
    version="0.1.0",
    description="API para gestão e acompanhamento de despesas",
)

# Permite que o frontend do Finance acesse a API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # URL do frontend Finance será adicionada aqui.
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- MAPEAMENTO GLOBAL DE EXCEÇÕES ---

@app.exception_handler(EntityNotFoundException)
async def entity_not_found_handler(
    request: Request,
    exc: EntityNotFoundException,
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "NOT_FOUND",
            "message": exc.message,
        },
    )


@app.exception_handler(BusinessRuleException)
async def business_rule_handler(
    request: Request,
    exc: BusinessRuleException,
):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "BUSINESS_RULE_VIOLATION",
            "message": exc.message,
        },
    )


@app.exception_handler(DomainException)
async def generic_domain_handler(
    request: Request,
    exc: DomainException,
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "UNPROCESSABLE_ENTITY",
            "message": exc.message,
        },
    )


# --- ENDPOINTS ---

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "finance-backend",
    }


# Adaptador que permite executar a aplicação FastAPI no AWS Lambda.
handler = Mangum(app)