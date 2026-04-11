---
name: api-doc
description: Documente un endpoint NestJS à partir du controller et des DTOs correspondants
---

Documente l'endpoint ou le controller passé en argument (`$ARGUMENTS`).

## Étape 1 — Lire les sources

Lis :
1. Le fichier controller concerné
2. Les DTOs associés (`dto/` du même module)
3. L'entity si la réponse inclut des champs du schéma Mongoose

## Étape 2 — Générer la documentation

Produis un bloc Markdown structuré pour chaque route du controller :

```
### METHOD /chemin

**Auth** : JWT requis / Public (@Public())
**Rôles** : USER / ADMIN / tous

**Corps de la requête** (si applicable)
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| ...   | ...  | ...    | ...         |

**Réponse 200**
| Champ | Type | Description |
|-------|------|-------------|
| ...   | ...  | ...         |

**Erreurs**
- `400` : validation échouée
- `401` : non authentifié
- `404` : ressource introuvable
```

## Étape 3 — Où placer la doc

- Si le module a un `README.md` → l'y intégrer
- Sinon → afficher dans la réponse pour que l'utilisateur décide où la mettre

## Style

Texte en français. Noms de champs exacts tels qu'ils apparaissent dans les DTOs.
