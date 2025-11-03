# Copilot instructions for this repo

Nuxt 4 SPA + Nitro APIs, Drizzle(Postgres), Redis sessions, and @nuxt/ui. Use these conventions to move fast.

## Architecture & flow

- UI: Pages under `app/pages/**` (components in `app/components/**`). SSR disabled (`ssr: false`). Page scan excludes `**/components/**`.
- HTTP: Use `http.{get,post,put,delete}` from `app/utils/http.ts` (wraps `$api` with auth header from `app/plugins/api.ts`).
- Auth: Client stores `token`/`user` in localStorage (`app/composables/use-auth.ts`); server middleware `server/middleware/auth.ts` protects `/api/**` except allowlist (`/api/auth/login`, `/api/auth/register`, `/api/system/status`, `/api/system/init`, ...). Admin gates via `/api/admin/**`.
- Persistence: Drizzle + Postgres. Schema in `server/db/schema.ts`, helper in `server/utils/db.ts`. Passwords via Argon2 (`server/utils/password.ts`).
- Sessions: Redis via `unstorage` mounted in `server/plugins/storage.ts` and helpers in `server/utils/redis.ts`.
- Settings & LDAP: `server/utils/settings.ts`, `server/utils/ldap.ts`. Login supports `provider: 'ldap'`.

## Patterns to follow

- Forms/validation: `valibot` schemas (see `app/utils/validate.ts`), prefer `UAuthForm` for auth pages (see `app/pages/auth/{login.vue,register.vue,init.vue}`).
- Data fetching: `useApi()` for fetch bound to `$api` (SSR‑safe), imperative calls use `http.*`.
- Modals: `useOverlay()` + `overlay.create(Component)`; await `instance.result` (see `app/pages/group/index.vue`).
- API routes: Under `server/api/**`, file suffix with method (e.g., `login.post.ts`). Use `createError`, `db`, and return types from `shared/types/**`.
- Types: `shared/types/**` are the stable source of truth for API request/response shapes.

## Dev workflows

- Dev server: `pnpm dev` (VS Code task: "dev"). Build/preview: `pnpm build` / `pnpm preview`.
- Drizzle migrations: `pnpm db:generate` and `pnpm db:migrate` (use `NUXT_DATABASE_URL`).
- Required env: set `NUXT_DATABASE_URL=postgresql://user:pass@host:5432/dbname`, `NUXT_REDIS_URL=redis://localhost:6379`.

## When adding features

- Client: Prefer auto‑imports (`http`, `passwordSchema`, `useSettings`, `useAuth`); keep UI with `@nuxt/ui` + valibot.
- Server: Rely on `server/middleware/auth.ts` for auth/roles (add public routes to its allowlist). Use `db` helpers and `shared/types/**`. Use `redis.setUserSession/getUserSession/deleteUserSession` for sessions.

## References

- Config: `nuxt.config.ts`
- HTTP wrapper: `app/utils/http.ts`
- Auth client + API plugin: `app/composables/use-auth.ts`, `app/plugins/api.ts`
- System: `server/api/system/{init.post.ts,status.get.ts}`
- Auth: `server/api/auth/{login.post.ts,register.post.ts}`
- Modals/tabs example: `app/pages/group/index.vue`
