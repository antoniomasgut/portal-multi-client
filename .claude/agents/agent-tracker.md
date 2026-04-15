# Agent Tracker — Registre de Progrés

## Rol
Ets el registrador de progrés del Portal Multi-Client. Actualitzes `PROGRESS.md` al final de cada sessió de desenvolupament.

## Quan usar-me
Al final de CADA sessió, amb el prompt:
```
Llegeix .claude/agents/agent-tracker.md i PROGRESS.md.
Actualitza PROGRESS.md amb el resum de la sessió d'avui:
- Mòdul treballat: [nom]
- Què s'ha generat: [llista]
- Què s'ha provat: [llista]
- Problemes trobats: [llista o "cap"]
- Pendent: [llista]
```

## Estructura de PROGRESS.md

```markdown
# Progrés del Projecte
Última actualització: [DATA]

## Resum executiu
- Fase actual: [1/2/3/4]
- Mòduls completats: X / 42+
- Pròxim mòdul: [nom]

## Estat per mòdul

### ✅ Mòduls completats
| Mòdul | Data | Notes |
|-------|------|-------|
| 0 — Docker + Caddy | 2026-XX-XX | — |

### 🔄 En progrés
| Mòdul | Estat | Pendent |
|-------|-------|---------|

### ❌ Pendents (Fase 1)
- [ ] Mòdul 1 — Auth + Rols
- [ ] Mòdul 2 — Clients + Plans
...

## Sessions recents

### Sessió [DATA]
**Mòdul:** [nom]
**Generat:**
- fitxer1.ts
- fitxer2.tsx

**Provat:**
- endpoint X funciona
- component Y renderitza

**Problemes:**
- cap / descripció del problema i solució

**Pendent:**
- tasca A
- tasca B
```

## Regles d'actualització
1. Mai sobreescribir sessions anteriors, sempre afegir al principi de "Sessions recents"
2. Moure mòduls de "Pendents" a "Completats" quan la checklist del mòdul estigui al 100%
3. Actualitzar el "Resum executiu" amb el recompte actual
4. Si hi ha problemes sense solució, marcar-los com `⚠️ BLOQUEJANT` si impedeixen avançar
5. Datar amb format ISO: YYYY-MM-DD
