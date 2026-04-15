# Portal Multi-Client — Context Global

## Descripció
SaaS multi-client per gestionar automatitzacions, landings i dominis amb IA integrada.

## Arquitectura
- **Frontend:** Next.js 14 (App Router) + TailwindCSS + Zustand + React Query
- **Backend:** Node.js 20 (Express) + Prisma + PostgreSQL
- **IA / RAG:** Python 3.11 + FastAPI + Gemma4 / Ollama + Qdrant
- **Automatitzacions:** n8n
- **PDFs:** PDFKit (Node.js)
- **Emmagatzematge fitxers:** Google Cloud Storage (GCS)
- **Reverse proxy:** Caddy (SSL automàtic)
- **Infraestructura:** Docker Compose
- **Multiidioma:** next-i18next (ca, es, en)

## Arquitectura IA (configurable per fase)
- **Fase 1:** Groq API per tot (llama-3.3-70b per qualitat, llama-3.1-8b per RAG)
- **Fase 2+:** Groq per landings Pro + Ollama local per RAG i automatitzacions
- Veure [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) per detalls per fase

## Rols
- `ADMIN`: accés total al portal
- `CLIENT`: accés limitat al seu panell personal
- `VISITOR`: accés públic a landings

## Panell del client (accés limitat)
| Funcionalitat | Veure | Fer |
|--------------|-------|-----|
| Dashboard personal | ✅ | — |
| Pla actiu + límits d'ús | ✅ | — |
| Landing activa + URL | ✅ | — |
| Factures i historial | ✅ | Descarregar PDF |
| Domini i renovació | ✅ | — |
| Automatitzacions actives | ✅ | Pausar/activar |
| Connectar Google (OAuth) | ✅ | ✅ |
| Codi referral | ✅ | Compartir |
| Idioma | ✅ | Canviar |
| Exportar dades (RGPD) | ✅ | Sol·licitar |

## ⚠️ El client MAI pot veure:
- Dades d'altres clients
- Credencials tècniques
- Configuració del sistema
- Preus d'altres plans
- Logs del sistema

## Ports dels serveis
- Caddy: 80 / 443
- Frontend: 3000
- Backend: 4000
- PostgreSQL: 5432
- IA (FastAPI): 8000
- n8n: 5678
- Qdrant: 6333

## Format de resposta API estàndard
```json
{ "success": true, "message": "Descripció", "data": {} }
```

## Fases del projecte
- Fase 1 (MVP): mòduls 0-15
- Fase 2 (Creixement): mòduls 16-21
- Fase 3 (Escala): mòduls 22-26
