# 🧾 Resumen rápido: Dev vs Prod (Docker)

## Archivos

-    `Dockerfile` → imagen del backend.
-    `docker-compose.yml` → **prod-like** (api + db).
-    `docker-compose.override.yml` → **dev** (hot-reload).
-    `.env` (local, no git) y `.env.example` (sí git).

## Dev (hot-reload)

```bash
# Primera vez o si cambiaste deps/Dockerfile
docker compose up -d --build

# Iterar normalmente (solo código en src/)
docker compose up -d
docker compose logs -f api
```

-    Cambios en `src/` → **NO build** (se recarga solo).
-    Cambios en `schema.prisma` →
     `docker compose exec api pnpm prisma migrate dev && pnpm prisma generate`
-    Cambios en dependencias (`package.json`/lock) →
     `docker compose build api && docker compose up -d`

## Prod / Prod-like (compilado)

```bash
docker compose -f docker-compose.yml up -d --build
```

## Cambiar de modo

```bash
# Dev → Prod
docker compose down
docker compose -f docker-compose.yml up -d

# Prod → Dev
docker compose -f docker-compose.yml down
docker compose up -d
```

## ¿Cuándo usar `--build`?

-    **Sí**: cambiaste `Dockerfile` o dependencias.
-    **No**: solo cambiaste código en `src/`, `.env` (reinicia), o `schema.prisma` (migrate/generate).

## URLs mentales

-    Dentro de Docker (api↔db): `db:5432`
-    Prisma CLI desde host: `localhost:5433`

## Override (dev) — mínimo

```yaml
# docker-compose.override.yml
services:
     api:
          environment:
               NODE_ENV: development
          volumes:
               - ./src:/app/src
               - ./prisma:/app/prisma
          command: >
               sh -c "
               pnpm prisma generate &&
               pnpm ts-node-dev --respawn --transpile-only src/index.ts
               "
```
