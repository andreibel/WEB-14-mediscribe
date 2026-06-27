# Hooks Map

A reference for every React hook in this project: built-in (regular) hooks and
where they matter most, the custom hooks defined here, and hooks imported from
libraries. Paths are relative to `frontend/`.

> The heart of the app is the live session screen
> (`app/(inApp)/session/[id]/page.tsx`), which composes the two heaviest custom
> hooks — `useProtocolEngine` and `useTranscript`. Start there.

---

## 1. Built-in React hooks (regular)

| Hook | Uses | What it does here | Most important place |
|------|-----:|-------------------|----------------------|
| `useState` | 80 | All local state — form fields, connection state, transcript segments, speaker maps, settings, UI toggles. | `session/[id]/page.tsx:21-26` (`formData`, `isUpdating`, `aiEnabled`, `loaded`) |
| `useEffect` | 40 | Side effects: WebSocket lifecycle, Supabase fetches, `localStorage` hydration, `resize`/event listeners, 1s timer ticks. | `useTranscript.ts` (Soniox socket), `useProtocolEngine.ts` (timer tick) |
| `useCallback` | 36 | Stable function identities for children & effect deps. | `useTranscript.ts` (`connect`/`disconnect`/`assignSpeaker`), `settings.ts:update` |
| `useRef` | 34 | Mutable non-render values: socket/AudioContext refs, "latest-state" refs read inside intervals, DOM refs. | `session/[id]/page.tsx:31` (`aiEnabledRef`), `:72` (`allSegmentsRef`), `:74` (`pendingCountRef`) |
| `useMemo` | 17 | Memoized derived values & singletons. **Pattern:** the Supabase client is memoized once per hook. | `useTranscript.ts:53` & `useStaff.ts:35` → `useMemo(() => createClient(), [])` |
| `useTransition` | 4 | Non-blocking pending UI around async server writes (form stays responsive). | `profile/ProfileEditForm.tsx`, `settings/ProtocolDefaults.tsx` |
| `useSyncExternalStore` | 3 | Subscribe to external/browser state without an effect-driven render. | `nav/ThemeToggle.tsx:27` — reads `<html>.dark` via `subscribe`/`getSnapshot` (`:15`, `:23`) |
| `useId` | 2 | Stable SSR-safe element ids (labels / SVG defs). | form & graph components |
| `use` (React 19) | 1 | Unwraps a promise during render — reads the async route `params`. | `session/[id]/page.tsx:16` → `const { id: sessionId } = use(params)` |

---

## 2. Custom hooks (defined in this project)

### `useProtocolEngine` — the live protocol runtime
- **File:** `app/(inApp)/session/_protocol/useProtocolEngine.ts:94`
- **Returns:** a `ProtocolEngine` interface (`useProtocolEngine.ts:69`, return block `:255`)
  with `activeProtocol`, `runtimes`, `timerViews`, `activeNodeId`, `notifications`,
  `now`, plus actions `loadProtocol`, `unload`, `fireNode`, `focus`, `toggleDone`,
  `pushSegment`, `dismissNotification`, `updateSettings`.
- **Does:** drives the resuscitation protocol — per-node `NodeRuntime`, 1s ticks
  (`TICK_MS`), due→overdue escalation after `GRACE_MS` (30s), WebAudio beeps
  (`beep`/`unlockAudio`, no audio asset), and notifications.
- **Composes:** `useProtocolSettings`.
- **Used by:** `session/[id]/page.tsx:18`, `_protocol/ProtocolPanel.tsx`,
  `_protocol/ProtocolFlow.tsx` (re-exported via `_protocol/index.ts`).

### `useTranscript` — real-time speech-to-text
- **File:** `app/(inApp)/session/_transcript/useTranscript.ts:49`
- **Returns:** `UseTranscriptReturn` (`:36`) — `connectionState`, `segments`,
  `partialSegment`, `audioLevel`, speaker/segment maps, and controls
  `connect`/`disconnect`/`pause`/`resume`/`clearSegments` plus
  `assignSpeaker`/`assignSegment`.
- **Does:** manages the **Soniox** WebSocket (`SONIOX_WS_URL`, model `stt-rt-v4`),
  accumulates final + partial segments, and persists speaker/segment identity to
  Supabase (`session_speakers` / `segment_speakers`).
- **Used by:** `session/[id]/page.tsx`, `_transcript/TranscriptPanel.tsx`.

### `useStaff` — speaker roster
- **File:** `app/(inApp)/session/_transcript/useStaff.ts:34`
- **Returns:** `{ staff, byId }`.
- **Does:** loads active staff from Supabase `users` where
  `active = true AND can_appear_in_transcript = true`, maps rows → `StaffMember`,
  for the speaker picker.
- **Used by:** `_transcript/TranscriptPanel.tsx`, `profile/actions.ts`.

### `useMoHForm` — controlled-form mutators
- **File:** `app/(inApp)/session/_form/useMoHForm.ts:9`
- **Takes:** the parent's `setData: Dispatch<SetStateAction<MoHFormData>>`.
- **Does:** pure immutable updaters over `MoHFormData` (meds name/dose/time,
  procedures, defibrillation times/energies) so `MoHForm.tsx` only handles layout.
- **Used by:** `_form/MoHForm.tsx`.

### `useProtocolSettings` — in-session settings
- **File:** `app/(inApp)/session/_protocol/settings.ts:19`
- **Returns:** `[settings, update]`.
- **Does:** `localStorage`-backed protocol settings (`PROTOCOL_SETTINGS_KEY`),
  starting from `DEFAULT_PROTOCOL_SETTINGS` and hydrating **after mount** to avoid
  a hydration mismatch. Type/defaults/key live in `lib/preferences` (shared with
  the Supabase-backed settings page).
- **Used by:** `useProtocolEngine.ts`.

### `useResponsiveFontSize` — local 404 helper
- **File:** `app/not-found.tsx:17` (used at `:29`)
- **Does:** clamps font size to viewport width via a `resize` listener.
- **Note:** currently inline to the 404 page; the only non-`session` custom hook.

---

## 3. Imported library hooks

| Hook | From | Uses | Most important place |
|------|------|-----:|----------------------|
| `useRouter` | `next/navigation` | 12 | Post-action navigation — `dashboard/NewSessionButton.tsx`, `nav/AppNav.tsx`, `(auth)/login` & `register`, `profile/ProfileActions.tsx` & `ProfileEditForm.tsx` |
| `usePathname` | `next/navigation` | 2 | Active-link highlighting in `nav/AppNav.tsx` |
| `useReactFlow` | `@xyflow/react` | 2 | Protocol node-graph control (viewport/fit) in `_protocol/ProtocolFlow.tsx` |

---

## Composition diagram (session screen)

```
app/(inApp)/session/[id]/page.tsx
├─ use(params)                         # React 19 — unwrap async route params
├─ useProtocolEngine()                 # _protocol/useProtocolEngine.ts
│    └─ useProtocolSettings()          # _protocol/settings.ts (localStorage)
├─ useTranscript(sessionId, onFinal)   # _transcript/useTranscript.ts (Soniox WS + Supabase)
└─ useState / useRef / useEffect       # AI toggle, form data, latest-state refs
```

`TranscriptPanel.tsx` additionally calls `useStaff()` for the speaker picker, and
`MoHForm.tsx` calls `useMoHForm(setData)` for form mutations.

---

## Conventions worth keeping

- **Memoize the Supabase client:** always `useMemo(() => createClient(), [])` in a
  hook so connections aren't re-created every render (`useTranscript`, `useStaff`).
- **Hydrate browser-only state in an effect**, starting from a constant, to avoid
  SSR hydration mismatches (`useProtocolSettings`, `useResponsiveFontSize`).
- **Prefer `useSyncExternalStore`** over `useState`+`useEffect` for reading
  external/browser state like the theme class (`ThemeToggle.tsx`).
- **"Latest-state" refs** (`aiEnabledRef`, `pendingCountRef`) let interval/timer
  callbacks read current values without re-subscribing every render.
