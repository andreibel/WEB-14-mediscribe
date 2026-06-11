# MediScribe — Database Design
> Postgres · Supabase · JSONB
>
> **Scope:** course project / PoC. Kept deliberately lean — plain tables, no
> partitioning, no audit log, simple owner-based RLS. See
> [Deliberately omitted](#deliberately-omitted) for what was cut and why.

---

## App Overview

**MediScribe** is a real-time trauma team transcription system for Ziv Medical Center.
It captures live audio via Soniox WebSocket STT, assigns speakers to staff members, and produces a Ministry of Health Appendix Z (נספח ז) resuscitation form.

### Core flows

1. Staff authenticate → enter dashboard
2. Transcript session starts → speaker enrollment (roll-call) → live audio streams to Soniox → segments appear in real time → speakers assigned to staff
3. MoH form filled in parallel → signed → saved

---

## Status

| Table | State |
|---|---|
| `users` | ✅ created |
| `sessions` | ✅ created |
| `transcript_segments` | ✅ created |
| `speaker_mappings` | 📝 planned |
| `enrollment_slots` | 📝 planned |
| `moh_forms` | 📝 planned |

Helper function `is_admin()` and the `touch_updated_at()` trigger are live.

---

## Entity Map

```
auth.users (Supabase managed)
  └─ users (1:1)  ←── single table: auth + staff directory merged
        │ created_by / assigned_by
        └─► sessions
                │ session_id
                ├─► transcript_segments   (append-only)
                ├─► speaker_mappings      (token → user, upserted live)
                ├─► enrollment_slots      (roll-call)
                └─► moh_forms

users ◄── user_id ── speaker_mappings
      ◄── user_id ── enrollment_slots
```

---

## Tables

### `users`
Single table for both authentication and staff directory.
Every person who appears in a transcript **is** a system user — there is no reason to split them.
Extends Supabase `auth.users` 1-to-1.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | FK → `auth.users(id)` |
| `name` | `text` | Hebrew display name: `ד״ר כהן` |
| `name_he` | `text` | Fuzzy match key: `כהן` |
| `name_en` | `text` | English alias: `cohen` |
| `role` | `text` | Auth role: `physician` · `nurse` · `charge-nurse` · `paramedic` · `admin` |
| `role_display` | `text` | Hebrew label for transcript bubbles: `רופא מוביל` |
| `initials` | `varchar(4)` | Avatar label: `כה` |
| `color` | `varchar(7)` | Hex color for avatar: `#3b82f6` |
| `active` | `boolean` | Soft-delete — false hides user from pickers |
| `can_appear_in_transcript` | `boolean` | False for pure admin accounts that are never in the room |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**Why merged?**
The old design had `profiles` (auth) and `staff_members` (directory) as separate tables — meaning a doctor had two rows and two different IDs. Every FK that needed "who is this person" had to decide which table to point at. Merging gives one ID per person used consistently across `sessions`, `speaker_mappings`, `enrollment_slots`, and `moh_forms`.

**Seed data**

| name | name_he | name_en | role | role_display | initials | color |
|---|---|---|---|---|---|---|
| ד״ר כהן | כהן | cohen | physician | רופא מוביל | כה | #3b82f6 |
| אחות כץ | כץ | katz | nurse | אחות תרופות | כץ | #8b5cf6 |
| ד״ר שטרן | שטרן | stern | physician | הרדמה | שט | #ec4899 |
| אחות לוי | לוי | levi | charge-nurse | אחות אחראית | לו | #10b981 |
| פרמדיק בן | בן | ben | paramedic | פרמדיק | בן | #f59e0b |
| ד״ר מזרחי | מזרחי | mizrahi | physician | כירורג | מז | #ef4444 |
| אחות שפירא | שפירא | shapira | nurse | טיפול נמרץ | שפ | #06b6d4 |

---

### `sessions`
One row per trauma event / resuscitation session.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `created_by` | `uuid` | FK → `users(id)` |
| `department` | `text` | Optional |
| `status` | `text` | `active` · `paused` · `ended` · `error` |
| `started_at` | `timestamptz` | Set on `connect()` |
| `ended_at` | `timestamptz` | Set on `disconnect()` |
| `segment_count` | `int` | Denormalized counter |
| `unique_speaker_count` | `int` | Denormalized counter |
| `soniox_model` | `text` | STT model used, default `stt-rt-v4` |
| `notes` | `text` | Free-text |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

---

### `transcript_segments`
Append-only. **Plain table** — no partitioning (PoC volume doesn't need it).
**Only finalized segments are stored.** Partial (in-progress) tokens live client-side as live preview and are never persisted — so there's no `is_final` column: every row here is final by definition.
**Flat column layout** — every field is a real, typed, indexable column. No JSONB: a segment is a small, stable record.

| Column | Type | Notes |
|---|---|---|
| `session_id` | `uuid` | FK → `sessions(id)` · part of PK |
| `seq` | `bigint` | Identity, part of PK — insertion order |
| `speaker_token` | `varchar(10)` | `S1` … `S9` |
| `text` | `text` | Transcribed segment text (finalized) |
| `start_ms` | `bigint` | ms from session start — timeline ORDER BY |
| `created_at` | `timestamptz` | |

**PK:** `(session_id, seq)`

**Indexes**
```sql
create index on transcript_segments (session_id, start_ms);      -- timeline read
create index on transcript_segments (session_id, speaker_token); -- per-speaker
```

---

### `speaker_mappings` _(planned)_
Maps a Soniox speaker token to a user for a given session.
Upserted on every assignment (enrollment confirm or manual picker).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `session_id` | `uuid` | FK → `sessions(id)` |
| `speaker_token` | `varchar(10)` | `S1` … `S9` |
| `user_id` | `uuid` | FK → `users(id)` · nullable if unresolved |
| `confidence` | `text` | `enrolled` · `manual` · `unresolved` |
| `assigned_at` | `timestamptz` | |
| `assigned_by` | `uuid` | FK → `users(id)` — who made the assignment |

**Constraint:** `unique(session_id, speaker_token)` — one canonical mapping per token per session.

---

### `enrollment_slots` _(planned)_
Audit trail of the roll-call speaker identification process.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `session_id` | `uuid` | FK → `sessions(id)` |
| `slot_index` | `smallint` | 0-based position in roll-call |
| `user_id` | `uuid` | FK → `users(id)` · confirmed match |
| `detected_text` | `text` | Accumulated STT text during this slot |
| `assigned_token` | `varchar(10)` | Dominant Soniox token captured |
| `fuzzy_score` | `smallint` | Match confidence 0–10 |
| `match_method` | `text` | `auto` · `manual` · `skipped` |
| `confirmed` | `boolean` | User accepted this mapping |
| `confirmed_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

**Constraint:** `unique(session_id, slot_index)`

**Fuzzy matching logic** (from `staffDb.ts`)

| Match | Points |
|---|---|
| `name_he` substring found | +10 |
| `name_en` substring found | +8 |
| First 2 chars of `name_he` found | +3 |
| Accept threshold | ≥ 3 |

---

### `moh_forms` _(planned)_
Ministry of Health Appendix Z (נספח ז) — resuscitation documentation form.
~70 fields grouped into JSONB blocks. Signed forms are immutable (enforced via RLS).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `session_id` | `uuid` | FK → `sessions(id)` · nullable (form can exist without session) |
| `created_by` | `uuid` | FK → `users(id)` |
| `patient` | `jsonb` | Patient demographics (see below) |
| `pre_resuscitation` | `jsonb` | Times, witnesses, background, consciousness |
| `heart_rhythm` | `jsonb` | Array of 5 rhythm slots |
| `medications` | `jsonb` | Array of 11 medication rows × 9 time columns |
| `procedures` | `boolean[]` | 11 procedure checkboxes |
| `defibrillation` | `jsonb` | Times, energies, IV access |
| `summary` | `jsonb` | End-of-resuscitation vitals and transfer info |
| `form_staff` | `jsonb` | Team member names and approver |
| `signed` | `boolean` | Once true → row is read-only |
| `signed_by` | `text` | Name of signer |
| `signed_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**`patient` shape**
```jsonc
{
  "name": "",
  "id_number": "",
  "address": "",
  "phone": "",
  "emergency_contact": "",
  "emergency_phone": "",
  "hmo": "",
  "age": ""
}
```

**`pre_resuscitation` shape**
```jsonc
{
  "date": "DD/MM/YYYY",
  "time_found": "HH:MM",
  "time_started": "HH:MM",
  "time_team_arrived": "HH:MM",
  "location": "",
  "witness": {
    "team_medical": false,
    "team_nursing": false,
    "family": false,
    "other": false,
    "other_text": ""
  },
  "reason": {
    "cardiac_arrest": false,
    "respiratory_arrest": false
  },
  "consciousness": "",       // "מעורפל" | "ללא הכרה"
  "responsive": "",          // "כן" | "לא"
  "respiratory_status": "",  // "נושם" | "לא נושם" | "מונשם"
  "background": {
    "cardiac": false,
    "respiratory": false,
    "trauma": false,
    "electrolyte": false,
    "other": ""
  }
}
```

**`heart_rhythm` shape**
```jsonc
[
  { "time": "HH:MM", "assessment": "" },
  // × 5 slots
]
```

**`medications` shape**
```jsonc
[
  { "name": "ADRENALINE", "dose": "", "times": ["", "", "", "", "", "", "", "", ""] },
  { "name": "ATROPINE",   "dose": "", "times": ["", "", "", "", "", "", "", "", ""] },
  // … 11 rows, last row has editable name ("אחר")
]
```

**`defibrillation` shape**
```jsonc
{
  "times":     ["HH:MM", …],   // 9 slots
  "energies":  ["200J", …],    // 9 slots
  "iv_access": false
}
```

**`summary` shape**
```jsonc
{
  "end_time": "HH:MM",
  "death_declared": "",          // "כן" | "לא"
  "spontaneous_breathing": "",   // "כן" | "לא" | "מונשם"
  "heart_rate_end": "",
  "saturation": "",
  "etco2_end": "",
  "bp_end": "",
  "consciousness_end": "",       // "מעורפל" | "ללא הכרה" | "מורדם"
  "transferred_to": "",
  "transfer_method": "",
  "transfer_time": "HH:MM",
  "not_transferred": false
}
```

**Indexes**
```sql
create index on moh_forms (session_id);
create index on moh_forms (created_by);
```

---

## Full DDL

```sql
-- ─────────────────────────────────────────────────────────────────
-- EXTENSIONS  (already installed on Supabase)
-- ─────────────────────────────────────────────────────────────────
-- pgcrypto (gen_random_uuid) and uuid-ossp live in the `extensions` schema.

-- ─────────────────────────────────────────────────────────────────
-- HELPERS
-- ─────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- admin check as SECURITY DEFINER so it bypasses RLS on users
-- (avoids recursive policy evaluation and re-checks per row)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ─────────────────────────────────────────────────────────────────
-- USERS  (auth + staff directory merged)
-- ─────────────────────────────────────────────────────────────────
create table public.users (
  id                       uuid        primary key references auth.users(id) on delete cascade,
  name                     text        not null,
  name_he                  text        not null,
  name_en                  text,
  role                     text        not null check (role in (
                             'physician','nurse','charge-nurse','paramedic','admin'
                           )),
  role_display             text,
  initials                 varchar(4)  not null,
  color                    varchar(7)  not null,
  active                   boolean     not null default true,
  can_appear_in_transcript boolean     not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────────────────────────
create table public.sessions (
  id                   uuid        primary key default gen_random_uuid(),
  created_by           uuid        not null references public.users(id),
  department           text,
  status               text        not null default 'active'
                         check (status in ('active','paused','ended','error')),
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  segment_count        int         not null default 0,
  unique_speaker_count int         not null default 0,
  soniox_model         text        not null default 'stt-rt-v4',
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index on public.sessions (created_by, started_at desc);

-- ─────────────────────────────────────────────────────────────────
-- TRANSCRIPT SEGMENTS  (flat columns, plain table)
-- ─────────────────────────────────────────────────────────────────
create table public.transcript_segments (
  session_id    uuid        not null references public.sessions(id) on delete cascade,
  seq           bigint      not null generated always as identity,
  speaker_token varchar(10) not null,
  text          text        not null,
  start_ms      bigint      not null,
  created_at    timestamptz not null default now(),
  primary key (session_id, seq)
);

create index on public.transcript_segments (session_id, start_ms);
create index on public.transcript_segments (session_id, speaker_token);

-- ─────────────────────────────────────────────────────────────────
-- SPEAKER MAPPINGS  (planned)
-- ─────────────────────────────────────────────────────────────────
create table public.speaker_mappings (
  id            uuid        primary key default gen_random_uuid(),
  session_id    uuid        not null references public.sessions(id) on delete cascade,
  speaker_token varchar(10) not null,
  user_id       uuid        references public.users(id),
  confidence    text        not null check (confidence in ('enrolled','manual','unresolved')),
  assigned_at   timestamptz not null default now(),
  assigned_by   uuid        references public.users(id),
  unique (session_id, speaker_token)
);

-- ─────────────────────────────────────────────────────────────────
-- ENROLLMENT SLOTS  (planned)
-- ─────────────────────────────────────────────────────────────────
create table public.enrollment_slots (
  id             uuid        primary key default gen_random_uuid(),
  session_id     uuid        not null references public.sessions(id) on delete cascade,
  slot_index     smallint    not null,
  user_id        uuid        references public.users(id),
  detected_text  text,
  assigned_token varchar(10),
  fuzzy_score    smallint,
  match_method   text        check (match_method in ('auto','manual','skipped')),
  confirmed      boolean     not null default false,
  confirmed_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (session_id, slot_index)
);

-- ─────────────────────────────────────────────────────────────────
-- MOH FORMS  (planned)
-- ─────────────────────────────────────────────────────────────────
create table public.moh_forms (
  id                uuid      primary key default gen_random_uuid(),
  session_id        uuid      references public.sessions(id),
  created_by        uuid      not null references public.users(id),
  patient           jsonb     not null default '{}'::jsonb,
  pre_resuscitation jsonb     not null default '{}'::jsonb,
  heart_rhythm      jsonb     not null default '[]'::jsonb,
  medications       jsonb     not null default '[]'::jsonb,
  procedures        boolean[] not null default array_fill(false, array[11]),
  defibrillation    jsonb     not null default '{}'::jsonb,
  summary           jsonb     not null default '{}'::jsonb,
  form_staff        jsonb     not null default '{}'::jsonb,
  signed            boolean   not null default false,
  signed_by         text,
  signed_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index on public.moh_forms (session_id);
create index on public.moh_forms (created_by);

-- ─────────────────────────────────────────────────────────────────
-- TRIGGERS — auto updated_at
-- ─────────────────────────────────────────────────────────────────
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

create trigger trg_sessions_updated_at
  before update on public.sessions
  for each row execute function public.touch_updated_at();

create trigger trg_moh_forms_updated_at
  before update on public.moh_forms
  for each row execute function public.touch_updated_at();
```

---

## Row Level Security

Owner-based throughout: you see your own rows, admin sees everything. The
`is_admin()` SECURITY DEFINER helper is called instead of an inline subquery so
it evaluates once per query (not per row) and doesn't recurse on `users`' own RLS.

```sql
-- ── users ─────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "own row"
  on public.users for all
  using (auth.uid() = id);

create policy "authenticated reads directory"
  on public.users for select
  using (auth.uid() is not null and active = true);

create policy "admin reads all"
  on public.users for select
  to authenticated
  using (public.is_admin());

-- ── sessions ──────────────────────────────────────────────────────
alter table public.sessions enable row level security;

create policy "session owner or admin"
  on public.sessions for all
  to authenticated
  using      (created_by = (select auth.uid()) or public.is_admin())
  with check (created_by = (select auth.uid()) or public.is_admin());

-- ── transcript_segments ───────────────────────────────────────────
alter table public.transcript_segments enable row level security;

create policy "via session ownership"
  on public.transcript_segments for all
  to authenticated
  using (exists (
    select 1 from public.sessions s
    where s.id = session_id
      and (s.created_by = (select auth.uid()) or public.is_admin())
  ))
  with check (exists (
    select 1 from public.sessions s
    where s.id = session_id
      and (s.created_by = (select auth.uid()) or public.is_admin())
  ));

-- ── speaker_mappings / enrollment_slots (planned) ─────────────────
-- same pattern as transcript_segments: access via owning session.

-- ── moh_forms (planned) ───────────────────────────────────────────
alter table public.moh_forms enable row level security;

create policy "form owner or admin can read"
  on public.moh_forms for select
  to authenticated
  using (created_by = (select auth.uid()) or public.is_admin());

create policy "owner can write unsigned form"
  on public.moh_forms for update
  to authenticated
  using (created_by = (select auth.uid()) and not signed);
```

---

## Design Decisions

| Decision | Reason |
|---|---|
| `users` merges auth + staff directory | Every trauma team member is both a system user and a transcript participant. One table, one ID, used everywhere |
| `can_appear_in_transcript` flag | Handles pure admin accounts (IT, management) that log in but are never in the trauma room — no separate table needed |
| `transcript_segments` flat columns | The segment is a small, stable record — every field is queried, sorted, or displayed, so each is a typed, indexed column. No JSONB blob to justify |
| Store only finalized segments | The client only persists a segment once finalized; partial tokens stay client-side as live preview. So there's no `is_final` column — it would be a constant |
| `is_admin()` SECURITY DEFINER helper | Evaluates the admin check once per query instead of per row, and avoids RLS recursion on `users` |
| MoH form as JSONB blocks | 70+ fields in nested groups that evolve with MoH regulations. JSONB blocks absorb structural changes |

---

## Deliberately omitted

This is a course PoC; the following enterprise pieces from earlier drafts were
intentionally cut to avoid over-engineering. Revisit only if the production
build actually needs them.

| Cut | Why it was dropped |
|---|---|
| **Table partitioning** (`transcript_segments`, annual partitions) | A single hospital's volume never approaches the scale where partitioning pays off — it only added a parent + N child tables of clutter. Plain table instead |
| **`audit_log`** (immutable, partitioned mutation log) | Full medical-compliance audit trail is out of scope for a PoC. Add later if real deployment requires it |
| **GIN indexes on `moh_forms` JSONB** | No field-level JSON querying in the PoC; the blobs are read whole by `id`/`session_id`. Add a GIN index when an actual query needs one |
```