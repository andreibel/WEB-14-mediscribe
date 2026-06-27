# Mediscribe App

A full-stack Next.js application for real-time medical transcription, speaker-aware trauma session capture, and AI-assisted Ministry of Health form completion.

## Overview

It is a modern Next.js 16 app with Supabase authentication, Soniox real-time transcription, and Anthropic-powered form filling.

### Key capabilities

- Email/password authentication with Supabase
- Register, login, forgot-password, reset-password flows
- Authenticated dashboard with session history
- Live trauma session UI with browser microphone capture
- Soniox WebSocket transcription and speaker diarization
- AI-assisted incident form generation via Anthropic Claude
- Server-side business logic in `server/`, thin API transport in `app/api`

## Features

- `app/(auth)`
  - `login` — sign in with email and password
  - `register` — create a new account with name and role metadata
  - `forgot-password` — request a password reset link
  - `reset-password` — complete a recovery flow after the callback exchange
- `app/(inApp)`
  - `dashboard` — list recent sessions and create a new one
  - `profile` — view and manage signed-in user information
  - `settings` — app preferences and protocol defaults
  - `session` — live transcript, protocol engine, and form filling
- `app/api/soniox-token/route.ts` — issues a temporary Soniox API key for browser transcription
- `app/api/form-fill/route.ts` — sends finalized transcript segments to Anthropic for smart form updates
- `server/` contains backend logic and keeps API routes thin

## Project structure

- `app/` — Next.js App Router pages, layouts, and API routes
- `server/` — server-only business logic for transcription and AI
- `lib/supabase/` — browser and server Supabase client wrappers plus auth middleware
- `components/` — reusable UI and navigation components
- `public/` — static assets
- `Dockerfile` — production container build
- `deploy.sh` — build and push Docker image
- `package.json` — npm scripts and dependencies

## Environment variables

Create a `.env.local` file in `mediscribeApp/` with the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SONIOX_API_KEY=your-soniox-secret-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required by both browser and server-side Supabase clients.
- `SONIOX_API_KEY` is used only on the backend to mint temporary Soniox tokens.
- `ANTHROPIC_API_KEY` is used by the server-side Anthropic SDK.

## Local development

From the `mediscribeApp` folder:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

From the `mediscribeApp` folder:

```bash
npm run build
npm start
```

## Docker deployment

This app includes a multi-stage `Dockerfile` and a helper script for building and pushing an amd64 image.

From `mediscribeApp`:

```bash
./deploy.sh
```

The script uses `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` build args.

## Auth flow details

- `app/api/auth/callback/route.ts` exchanges Supabase email link and OTP codes.
- `app/(auth)/forgot-password/page.tsx` sends a reset email with redirect to `/api/auth/callback?next=/reset-password`.
- `app/(auth)/reset-password/page.tsx` verifies the recovery session and updates the password.

## Live transcription flow

- `app/(inApp)/session/_transcript/useTranscript.ts` captures microphone audio and connects to `wss://stt-rt.soniox.com/transcribe-websocket`.
- The browser requests a temporary token from `/api/soniox-token`.
- Transcript segments are parsed and displayed with speaker tokens.
- `app/api/form-fill/route.ts` calls Anthropic to merge transcript events into the Ministry of Health form JSON.

## Notes

- Backend business logic lives in `server/`; API routes in `app/api` remain thin transport wrappers.
- `lib/supabase/client.ts` is the browser Supabase client.
- `lib/supabase/server.ts` is the server Supabase client and reads cookies for auth.
- `app/layout.tsx` resolves auth claims server-side to render the nav state correctly.
- There are no automated tests configured in `package.json`; use `npm run lint` for code checks.

## Related docs

- `server/README.md` explains the backend layering and transport rules.
- `DATABASE.md` documents the Supabase schema and table design.

## License

This project is currently a private/experimental codebase. Review the repo owner for licensing details.
