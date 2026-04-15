"""
Portal Multi-Client — Servei IA (FastAPI)
Mòdul 0: Esquelet bàsic amb health check.
Els routers de RAG i landing-generator s'afegiran als mòduls 7 i 8.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Portal AI Service",
    version="1.0.0",
    docs_url="/docs" if os.getenv("NODE_ENV") == "development" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BASE_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


# TODO Mòdul 7 — Landing Pro (IA):
# from routers import landing
# app.include_router(landing.router, prefix="/landing", tags=["landing"])

# TODO Mòdul 8 — RAG:
# from routers import rag
# app.include_router(rag.router, prefix="/rag", tags=["rag"])
