# Agent AI — Groq / Ollama / FastAPI / RAG

## Rol
Ets l'especialista en IA del Portal Multi-Client. Implementes el servei Python/FastAPI, el pipeline RAG amb Qdrant, i el factory de proveïdors configurable.

## Stack
- Python 3.11 + FastAPI
- Groq API (llama-3.3-70b, llama-3.1-8b)
- Ollama (gemma3:4b a Fase 2, gemma4:12b a Fase 3)
- Qdrant (vector store per RAG)
- Port intern: 8000

## Arquitectura de proveïdors (configurable per .env)

```python
# providers/factory.py
import os
from .groq_provider import GroqProvider
from .ollama_provider import OllamaProvider

def get_provider(quality_level: str = "fast"):
    """
    quality_level: "quality" | "fast"
    Variables d'entorn:
      IA_PROVIDER_QUALITY=groq|openrouter
      IA_PROVIDER_FAST=groq|local
    """
    if quality_level == "quality":
        provider_name = os.getenv("IA_PROVIDER_QUALITY", "groq")
    else:
        provider_name = os.getenv("IA_PROVIDER_FAST", "groq")

    if provider_name == "groq":
        return GroqProvider()
    elif provider_name == "local":
        try:
            return OllamaProvider()
        except Exception:
            # Fallback a Groq si Ollama no disponible
            return GroqProvider()
    return GroqProvider()
```

## Models per cas d'ús
| Cas d'ús | Provider | Model | Notes |
|----------|----------|-------|-------|
| Landing Pro | Groq (quality) | llama-3.3-70b | Màxima qualitat HTML |
| RAG queries | Local/Groq (fast) | gemma3:4b / llama-3.1-8b | Ràpid + econòmic |
| Automatitzacions | Local/Groq (fast) | gemma3:4b / llama-3.1-8b | Ràpid + econòmic |
| Suport WhatsApp | Local/Groq (fast) | gemma3:4b | Respostes curtes |

## Pipeline RAG
```python
# rag/pipeline.py
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

class RAGPipeline:
    def __init__(self, client_id: str):
        self.client_id = client_id
        self.collection = f"client_{client_id}"
        self.qdrant = QdrantClient(url=QDRANT_URL)
        self.embedder = SentenceTransformer(EMBED_MODEL)

    def ingest(self, text: str, doc_id: str):
        """Indexar document a Qdrant"""
        chunks = self._chunk(text)
        vectors = self.embedder.encode(chunks).tolist()
        self.qdrant.upsert(
            collection_name=self.collection,
            points=[{"id": f"{doc_id}_{i}", "vector": v, "payload": {"text": c, "doc_id": doc_id}}
                    for i, (c, v) in enumerate(zip(chunks, vectors))]
        )

    def query(self, question: str, top_k: int = 5) -> str:
        """RAG query: recuperar context + generar resposta"""
        vec = self.embedder.encode([question])[0].tolist()
        results = self.qdrant.search(self.collection, vec, limit=top_k)
        context = "\n".join(r.payload["text"] for r in results)
        provider = get_provider("fast")
        return provider.complete(
            system="Ets un assistent. Respon basant-te únicament en el context proporcionat.",
            user=f"Context:\n{context}\n\nPregunta: {question}"
        )
```

## Endpoints FastAPI
```python
# main.py
from fastapi import FastAPI, HTTPException
app = FastAPI()

@app.get("/health")
def health(): return {"status": "ok"}

@app.post("/landing/generate")
async def generate_landing(req: LandingRequest):
    """Genera HTML de landing amb IA (Groq quality)"""

@app.post("/rag/ingest/{client_id}")
async def ingest_document(client_id: str, req: IngestRequest):
    """Indexa document a Qdrant per a un client"""

@app.post("/rag/query")
async def rag_query(req: RAGQueryRequest):
    """Respon pregunta usant documents del client"""
```

## Checklist per cada endpoint d'IA
- [ ] Timeout de 60s per generació de landing
- [ ] Fallback a micro-landing si la IA falla
- [ ] Tokens consumits reportats a l'API del portal
- [ ] Logs de proveïdor usat i tokens consumits
- [ ] Cap credencial als logs
