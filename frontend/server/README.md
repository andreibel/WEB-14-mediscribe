# `server/` — the backend layer

All server-side **business logic** lives here. This is "the backend" of the app,
separated from the frontend (pages/components under `app/`).

## Why this exists

Next.js is a full-stack framework: the backend and frontend share one project.
We keep them cleanly separated by **responsibility**, not by deployment:

- **Transport layer** — `app/**/route.ts`. These files *must* live under `app/`
  because that is how Next.js maps a URL to a handler. They stay **thin**: parse
  the incoming request, call a function in `server/`, turn the result into an
  HTTP response. No business logic here.
- **Backend layer** — `server/**` (this folder). Plain TypeScript modules with the
  real logic (calling Anthropic, minting Soniox tokens, auth exchange). No React,
  no `"use client"`, no HTTP plumbing — just functions that take inputs and
  return data (or throw a typed error).

## Rule

> A `route.ts` never contains business logic. It only translates
> HTTP ⇄ a `server/` function call.

This keeps the logic testable, reusable, and easy to move to a standalone server
later if we ever need to.

## Map

| Backend module                   | Used by route                    | Does                                               |
|----------------------------------|----------------------------------|----------------------------------------------------|
| `server/ai/form-fill.ts`         | `app/api/form-fill/route.ts`     | Fills the MoH form from a transcript via Anthropic |
| `server/transcription/soniox.ts` | `app/api/soniox-token/route.ts`  | Mints a short-lived Soniox API key                 |
| `server/auth/callback.ts`        | `app/api/auth/callback/route.ts` | Exchanges an email-link code/OTP for a session     |
| `server/http.ts`                 | all of the above                 | Shared auth gate + response helpers                |

> Note: `lib/supabase/server.ts` is server-only Supabase infrastructure (the SSR
> client). It stays under `lib/` next to its browser counterpart `client.ts`, but
> conceptually it belongs to this backend layer.