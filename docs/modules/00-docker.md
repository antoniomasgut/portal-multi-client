# Mòdul 0 — Docker + Caddy + Infraestructura

## Fase: 1 — MVP
## Branca Git: `infra/docker`

## Descripció
Infraestructura base del projecte amb Docker Compose i Caddy com a reverse proxy.
Caddy gestiona SSL automàtic via Let's Encrypt per a tots els dominis i subdominis.

## Serveis Docker
| Servei | Imatge | Port intern |
|--------|--------|------------|
| caddy | caddy:2-alpine | 80, 443 |
| frontend | node:20-alpine | 3000 |
| backend | node:20-alpine | 4000 |
| db | postgres:15-alpine | 5432 |
| ai | python:3.11-slim | 8000 |
| n8n | n8nio/n8n | 5678 |
| qdrant | qdrant/qdrant | 6333 |

## Fitxers a generar
- docker-compose.yml
- docker/Dockerfile.frontend
- docker/Dockerfile.backend
- docker/Dockerfile.ai
- docker/Caddyfile
- .env.example

## Caddyfile bàsic
```
portal.com {
  reverse_proxy frontend:3000
}

api.portal.com {
  reverse_proxy backend:4000
}

*.portal.com {
  reverse_proxy frontend:3000
}
```

## Notes per Claude Code
- Multi-stage builds per frontend i backend
- Volums persistents per db, qdrant i caddy (certificats SSL)
- Health checks per tots els serveis
- Network interna: portal-network
- Caddy gestiona SSL automàticament, no cal Certbot
