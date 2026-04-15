# Flux de Treball per Mòdul

## Procés per cada mòdul

```
1. Crear branca:     git checkout -b feature/nom-modul
2. Prompt a Claude:  agent + skill + .md del mòdul
3. Claude genera:    codi del mòdul
4. Verificació:      agent-integration revisa consistència
5. Proves locals:    docker-compose up → testejar manualment
6. Si funciona:      git add . && git commit -m "feat: nom-modul"
7. Push + PR:        git push origin feature/nom-modul
8. Merge a develop
9. Registre sessió:  agent-tracker actualitza PROGRESS.md
10. Següent mòdul
```

## Prompt estàndard per Claude Code

```
Llegeix els fitxers següents com a context:
- docs/PROJECT_CONTEXT.md
- docs/CONVENTIONS.md
- .claude/agents/[agent].md
- .claude/skills/[skill].md
- docs/modules/[XX-modul].md

Tasca: [descripció de la tasca]
```

## Prompt de verificació (agent-integration)

```
Llegeix .claude/agents/agent-integration.md
i verifica la consistència del mòdul [nom] acabat de generar.
```

## Prompt de registre (agent-tracker)

```
Llegeix .claude/agents/agent-tracker.md i PROGRESS.md.
Actualitza PROGRESS.md amb el resum de la sessió d'avui:
- Mòdul treballat: [nom]
- Què s'ha generat: [llista]
- Què s'ha provat: [llista]
- Problemes trobats: [llista o "cap"]
- Pendent: [llista]
```

## Checklist de revisió manual
- [ ] El servidor arrenca sense errors
- [ ] Els endpoints responen correctament
- [ ] El frontend carrega sense errors de consola
- [ ] Les dades es guarden i es recuperen bé
- [ ] Els errors es gestionen correctament
- [ ] Els fitxers generats es pugen a GCS i no queden al disc local
- [ ] Les URLs retornades apunten a GCS (no a rutes locals)
- [ ] El rate limiting funciona correctament
- [ ] Les accions importants queden registrades als audit logs

## Nota sobre Staging
⚠️ Fins a la Fase 2 no hi ha entorn de staging.
Totes les proves es fan en local amb docker-compose.
