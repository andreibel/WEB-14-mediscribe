# MediScribe — Database Design
> Postgres · Supabase · JSONB

---

## App Overview

**MediScribe** is a real-time trauma team transcription system for Ziv Medical Center.  
It captures live audio via Soniox WebSocket STT, assigns speakers to staff members, and produces a Ministry of Health Appendix Z (נספח ז) resuscitation form.

### Core flows

1. Staff authenticate → enter dashboard
2. Transcript session starts → speaker enrollment (roll-call) → live audio streams to Soniox → segments appear in real time → speakers assigned to staff
3. MoH form filled in parallel → signed → saved

---

## Entity Map

```
auth.users (Supabase managed)
  └─ users (1:1)  ←── single table: auth + staff directory merged
        │ created_by / assigned_by / actor_id
        ├─► sessions
        │       │ session_id
        │       ├─► transcript_segments   (append-only, partitioned)
        │       ├─► speaker_mappings      (token → user, upserted live)
        │       ├─► enrollment_slots      (roll-call audit trail)
        │       └─► moh_forms
        │
        └─► audit_log                     (immutable, partitioned)

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
The old design had `profiles` (auth) and `staff_members` (directory) as separate tables — meaning a doctor had two rows and two different IDs. Every FK that needed "who is this person" had to decide which table to point at. Merging gives one ID per person used consistently across `sessions`, `speaker_mappings`, `enrollment_slots`, `moh_forms`, and `audit_log`.

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
| `department` | `text` | e.g. `מיון טראומה` |
| `status` | `text` | `active` · `paused` · `ended` · `error` |
| `started_at` | `timestamptz` | Set on `connect()` |
| `ended_at` | `timestamptz` | Set on `disconnect()` |
| `segment_count` | `int` | Denormalized counter |
| `unique_speaker_count` | `int` | Denormalized counter |
| `soniox_model` | `text` | `stt-rt-v4` |
| `notes` | `text` | Free-text |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### `transcript_segments`
Append-only. Partitioned by `created_at` for query performance at volume.  
Uses a **hybrid layout**: hot query fields as real columns, full Soniox payload in JSONB.

| Column | Type | Notes |
|---|---|---|
| `session_id` | `uuid` | FK → `sessions(id)` · part of PK |
| `seq` | `bigint` | Identity, part of PK — insertion order |
| `speaker_token` | `varchar(10)` | `S1` … `S9` — promoted for btree index |
| `start_ms` | `bigint` | ms from session start — promoted for timeline ORDER BY |
| `is_final` | `boolean` | Promoted — filter partials on read |
| `created_at` | `timestamptz` | Partition key |
| `payload` | `jsonb` | Full Soniox token blob (see shape below) |

**`payload` shape**
```jsonc
{
  "id":            "m1",
  "text":          "מתחילים פרוטוקול טראומה — כולם לתפקידים.",
  "speaker_token": "S1",
  "start_ms":      67278000,
  "is_final":      true,
  "words":         [],          // reserved — future per-word timestamps
  "language":      "he",        // future Soniox field
  "confidence":    0.94         // future Soniox field
}
```

**Why hybrid?**  
`speaker_token`, `start_ms`, and `is_final` are filtered/sorted in every timeline query — btree indexes on real columns are significantly faster than GIN expression scans at this volume. Everything else lives in `payload` and absorbs future Soniox schema changes without migrations.

**Indexes**
```sql
-- timeline read (most common)
create index on transcript_segments (session_id, start_ms);
-- per-speaker filtering
create index on transcript_segments (session_id, speaker_token);
-- arbitrary payload queries
create index on transcript_segments using gin (payload);
```

**Partitions** (add annually)
```
transcript_segments_2025  → 2025-01-01 … 2026-01-01
transcript_segments_2026  → 2026-01-01 … 2027-01-01
```

---

### `speaker_mappings`
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

### `enrollment_slots`
Full audit trail of the roll-call speaker identification process.

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

### `moh_forms`
Ministry of Health Appendix Z (נספח ז) — resuscitation documentation form.  
~70 fields grouped into JSONB blocks. Signed forms are immutable.

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
create index on moh_forms using gin (patient);
create index on moh_forms using gin (summary);
```

---

### `audit_log`
Immutable append-only log of every entity mutation. Medical compliance requires this never be updated or deleted.  
Partitioned annually.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` | Generated identity |
| `occurred_at` | `timestamptz` | Partition key |
| `actor_id` | `uuid` | FK → `users(id)` · null = system |
| `session_id` | `uuid` | FK → `sessions(id)` · null if not session-scoped |
| `entity_type` | `text` | See table below |
| `entity_id` | `text` | Stringified PK of the changed row |
| `action` | `text` | See table below |
| `before_state` | `jsonb` | Row snapshot before change · null on create |
| `after_state` | `jsonb` | Row snapshot after change · null on delete |
| `meta` | `jsonb` | IP, user agent, request ID, etc. |

**`entity_type` values**

| entity_type | entity_id |
|---|---|
| `session` | session UUID |
| `speaker_mapping` | mapping UUID |
| `enrollment_slot` | slot UUID |
| `moh_form` | form UUID |
| `user` | user UUID |

**`action` values**

| Domain | Actions |
|---|---|
| Generic | `create` · `update` · `delete` |
| Session | `session.started` · `session.paused` · `session.resumed` · `session.stopped` |
| Speaker | `speaker.assigned` · `speaker.unassigned` · `speaker.reassigned` |
| Enrollment | `enrollment.started` · `enrollment.slot_confirmed` · `enrollment.skipped` · `enrollment.finished` |
| Form | `form.saved` · `form.signed` · `form.printed` |
| Auth | `auth.login` · `auth.logout` · `auth.failed` |

**Partitions**
```
audit_log_2025  → 2025-01-01 … 2026-01-01
audit_log_2026  → 2026-01-01 … 2027-01-01
```

**Indexes**
```sql
create index on audit_log (session_id, occurred_at desc);
create index on audit_log (actor_id,   occurred_at desc);
create index on audit_log (entity_type, entity_id);
```

---

## Full DDL

```sql
-- ─────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

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

-- ─────────────────────────────────────────────────────────────────
-- TRANSCRIPT SEGMENTS  (hybrid layout + partitioned)
-- ─────────────────────────────────────────────────────────────────
create table public.transcript_segments (
  session_id    uuid        not null references public.sessions(id) on delete cascade,
  seq           bigint      not null generated always as identity,
  speaker_token varchar(10) not null,
  start_ms      bigint      not null,
  is_final      boolean     not null,
  created_at    timestamptz not null default now(),
  payload       jsonb       not null,
  primary key (session_id, seq)
) partition by range (created_at);

create table transcript_segments_2025
  partition of public.transcript_segments
  for values from ('2025-01-01') to ('2026-01-01');

create table transcript_segments_2026
  partition of public.transcript_segments
  for values from ('2026-01-01') to ('2027-01-01');

create index on public.transcript_segments (session_id, start_ms);
create index on public.transcript_segments (session_id, speaker_token);
create index on public.transcript_segments using gin (payload);

-- ─────────────────────────────────────────────────────────────────
-- SPEAKER MAPPINGS
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
-- ENROLLMENT SLOTS
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
-- MOH FORMS
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
create index on public.moh_forms using gin (patient);
create index on public.moh_forms using gin (summary);

-- ─────────────────────────────────────────────────────────────────
-- AUDIT LOG  (immutable, partitioned)
-- ─────────────────────────────────────────────────────────────────
create table public.audit_log (
  id           bigint      primary key generated always as identity,
  occurred_at  timestamptz not null default now(),
  actor_id     uuid        references public.users(id),
  session_id   uuid        references public.sessions(id),
  entity_type  text        not null,
  entity_id    text        not null,
  action       text        not null,
  before_state jsonb,
  after_state  jsonb,
  meta         jsonb       not null default '{}'::jsonb
) partition by range (occurred_at);

create table audit_log_2025
  partition of public.audit_log
  for values from ('2025-01-01') to ('2026-01-01');

create table audit_log_2026
  partition of public.audit_log
  for values from ('2026-01-01') to ('2027-01-01');

create index on public.audit_log (session_id,  occurred_at desc);
create index on public.audit_log (actor_id,    occurred_at desc);
create index on public.audit_log (entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────
-- TRIGGERS — auto updated_at
-- ─────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

```sql
-- ── users ─────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "own row"
  on public.users for all
  using (auth.uid() = id);

create policy "admin reads all"
  on public.users for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "all authenticated can read directory"
  on public.users for select
  using (auth.uid() is not null and active = true);

-- ── sessions ──────────────────────────────────────────────────────
alter table public.sessions enable row level security;

create policy "session owner or admin"
  on public.sessions for all
  using (
    created_by = auth.uid()
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ── transcript_segments ───────────────────────────────────────────
alter table public.transcript_segments enable row level security;

create policy "via session ownership"
  on public.transcript_segments for all
  using (exists (
    select 1 from public.sessions s
    where s.id = session_id
      and (s.created_by = auth.uid()
           or exists (select 1 from public.users where id = auth.uid() and role = 'admin'))
  ));

-- ── moh_forms ─────────────────────────────────────────────────────
alter table public.moh_forms enable row level security;

create policy "form owner or admin can read"
  on public.moh_forms for select
  using (
    created_by = auth.uid()
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "owner can write unsigned form"
  on public.moh_forms for update
  using (created_by = auth.uid() and not signed);

-- ── audit_log ─────────────────────────────────────────────────────
alter table public.audit_log enable row level security;

create policy "authenticated can insert"
  on public.audit_log for insert
  with check (auth.uid() is not null);

create policy "admin reads audit"
  on public.audit_log for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));
```

---

## Design Decisions

| Decision | Reason |
|---|---|
| `users` merges auth + staff directory | Every trauma team member is both a system user and a transcript participant. Two tables meant one person had two IDs, two rows, and every FK had to pick a side. One table, one ID, used everywhere |
| `can_appear_in_transcript` flag | Handles the edge case of pure admin accounts (e.g. IT, management) that log in but are never in the trauma room — no need for a separate table |
| `transcript_segments` hybrid layout | Hot query fields (`speaker_token`, `start_ms`, `is_final`) stay as real columns for btree index performance. `payload` JSONB absorbs future Soniox schema changes without migrations |
| `transcript_segments` + `audit_log` partitioned | Both are append-only, high-volume. Annual partitions keep the query planner efficient and enable cheap archival (detach old partition) |
| MoH form as JSONB blocks | 70+ fields in nested groups that evolve with MoH regulations. JSONB blocks absorb structural changes; GIN indexes enable field-level queries when needed |
| `audit_log` immutable | Medical compliance. No UPDATE or DELETE ever. RLS insert-only for non-admins |
| `speaker_mappings` unique constraint | Enforces one canonical token→user mapping per session. Re-assignments upsert the row and write an `audit_log` entry |
| `enrollment_slots` stores `fuzzy_score` + `match_method` | Full auditability — can reconstruct exactly how each speaker was identified (auto fuzzy match vs manual override vs skipped) |
| JSONB not BSON | Postgres uses JSONB (binary JSON) — equivalent storage efficiency and indexing to BSON. The `pg` / Supabase JS client deserializes JSONB to plain JS objects automatically |
