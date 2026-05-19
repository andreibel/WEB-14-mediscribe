# 🏥 MedScript — Trauma Room Transcription System
### **מערכת תמלול טראומה** · Real-time Medical Documentation for Emergency Rooms

> ⚠️ **Work in Progress** — This project is in early development. The current codebase represents the initial prototype stage. Features, structure, and design are subject to significant change as the project evolves.

---

## 📋 Overview

**MedScript** (also referred to as *MediScribe*) is a real-time trauma room documentation web application designed to assist emergency medical teams during high-pressure resuscitation events. It automatically transcribes spoken conversations in the trauma room, tracks clinical protocols, and auto-fills a standardized Ministry of Health (MoH) incident report — all in a single, unified interface.

The system is built for bilingual (Hebrew/English) clinical environments and follows **ACLS (Advanced Cardiovascular Life Support)** protocol guidelines.

---

## ✨ Features

### 🎙️ Real-Time Transcript Panel
- Streams audio transcription entries as they occur during a trauma session
- Speaker-identified entries, color-coded per team member (Doctor, Nurse, Paramedic, etc.)
- Toggleable **absolute** (wall-clock) and **relative** (T+MM:SS) timestamp display
- Keyword highlighting for critical medical terms (e.g., CPR, Epinephrine, protocols)
- Auto-scrolling feed with smooth entry animation

### 📊 ACLS Protocol Flowchart Panel
- Interactive, step-by-step ACLS cardiac arrest flowchart
- Two parallel branches: **VF/pVT (shockable)** and **PEA/Asystole (non-shockable)**
- Clickable nodes that mark steps as ✅ done, recording the exact timestamp
- Auto-activates relevant protocol steps when keywords are detected in the transcript
- Nodes include: CPR initiation, defibrillation, medication administration, intubation, ROSC

### 📝 MoH Summary Form (Auto-Filled)
- Structured incident form compliant with Israeli Ministry of Health standards (`טופס רישום ומוניטורינג החייאה`)
- **Auto-populated in real time** from transcript events:
  - CPR start time
  - Defibrillation count and timestamps
  - Medication doses (Epinephrine, Atropine, Amiodarone, etc.)
  - Intubation details
  - ROSC time and patient transfer destination
- Supports manual editing for any field
- **Sign & Finalize** workflow with charge nurse name and timestamp

### ⏱️ Contextual Timers
- Automatically spawns countdown timers when time-critical keywords are detected (e.g., "Epinephrine" triggers a 4-minute next-dose reminder)
- Slide-in timer cards, each with pause/resume and dismiss controls
- Color-coded urgency states

### 📁 Incident History Dashboard (`index.html`)
- Lists all past trauma sessions with date, ID, trauma type, duration, and status (Signed / Draft)
- Summary stat cards: total incidents, signed count, pending count, average duration
- Search and filter by incident ID, trauma type, or status
- Click-to-expand modal showing transcript snippet, interventions, medications, and outcome

### 🌙 Dark Mode
- Full dark/light theme toggle with persistent state per session
- Consistent theming across all panels and the history dashboard

### 📐 Collapsible Panel Layout
- Each of the three panels (Protocol · Transcript · MoH Form) can be independently minimized
- Smooth CSS transitions — maximize the panel you need most

---

## 🗂️ Project Structure

```
WEB-14-mediscribe/
│
├── index.html          # Incident History Dashboard — lists all past trauma sessions
├── room.html           # Live Trauma Room — the main real-time documentation UI
│
├── HW1-WEB.docx        # Project assignment / homework document
├── נספח ז.pdf          # Appendix document (Hebrew)
├── ראיון - תמלול.docx  # Interview transcription document (Hebrew)
└── רעיון - תמלות - מסוכם.docx  # Concept summary document (Hebrew)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (CDN) with JIT dark mode |
| **Layout** | CSS Flexbox panel system with custom minimization |
| **Animations** | Pure CSS keyframe animations (fade, slide, pulse, bar waveform) |
| **Localization** | Hebrew (`he-IL`) + English bilingual UI; RTL/LTR mixed layout |
| **Date/Time** | Native `Intl` / `toLocaleString` with `he-IL` locale |
| **Backend / AI** | *(Planned integration)* SONIOX speech-to-text API for live audio |
| **No dependencies** | Zero npm packages — runs entirely in the browser |

---

## 🚀 Getting Started

No build step or server required. Simply open the files in a browser.

```bash
# Clone the repository
git clone https://github.com/andreibel/WEB-14-mediscribe.git
cd WEB-14-mediscribe

# Open the app
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

> **Tip:** For the best experience, use a modern Chromium-based browser (Chrome, Edge, Arc) or Firefox.

---

## 🖥️ How to Use

### Starting a New Session
1. Open `index.html` — the **Incident History Dashboard**
2. Click **+ New Session** in the top-right header
3. You'll be taken to `room.html` — the **Live Trauma Room**

### Running the Simulation
1. In the Trauma Room, press **▶ Simulate** in the header
2. A scripted cardiac arrest scenario plays out in real time:
   - Transcript entries appear from Dr. Cohen, Nurse Levi, Nurse Katz, Dr. Stern, and Paramedic Ben
   - The ACLS flowchart auto-progresses as clinical events are detected
   - The MoH form fields populate automatically
   - Timers spawn for medication re-dosing and intubation
3. Once complete, enter the charge nurse name and click **✍️ Sign & Finalize**

### Reviewing Past Incidents
- Return to `index.html` to browse the incident log
- Click **View →** on any row to open the incident modal with the full report

---

## 🧠 Key Design Decisions

### Real-Time Keyword Detection
The transcript engine scans each incoming speech entry against a keyword dictionary (`KW`). Matches trigger one of two actions:
- **`type: 'protocol'`** — advances the ACLS flowchart node
- **`type: 'timer'`** — spawns a countdown card (e.g., Epinephrine every 240 seconds)

### Form Auto-Fill Architecture
The `pushFormUpdate()` function runs on every transcript entry using regex pattern matching against Hebrew and English clinical keywords to populate the MoH form fields without manual input. This mirrors the concept of ambient clinical documentation.

### Bilingual RTL/LTR Support
The UI uses `dir="rtl"` on Hebrew text nodes while keeping the structural layout LTR. This allows clean rendering of mixed-language content without full page direction switching.

---

## 🗺️ Roadmap / Planned Improvements

> This is an early-stage prototype. The following are planned directions for future development:

- [ ] **Live audio integration** via SONIOX WebSocket API (infrastructure already stubbed in UI)
- [ ] **Persistent storage** — save sessions to `localStorage` or a backend database
- [ ] **PDF export** of the signed MoH form
- [ ] **Multi-room support** — manage several simultaneous trauma rooms
- [ ] **User authentication** — role-based access (Doctor, Nurse, Admin)
- [ ] **Editable protocol templates** — support additional protocols (ATLS, sepsis, stroke)
- [ ] **Backend integration** — server-side storage and session management
- [ ] **Mobile-responsive layout** — optimized for tablet use at bedside

---

## 📸 Pages at a Glance

| Page | Description |
|---|---|
| `index.html` | Incident history table with stat cards, search, filter, and detail modal |
| `room.html` | Three-panel live room: Protocol flowchart · Transcript feed · MoH form |

---

## 👤 Authors

**Linoy Cohen**
**Asaf Eliyahu**
**Tehila Ben Dahan**
**Etay Ofir**
**Andrei Bel**

Information Systems Engineering & Software Engineering Students
Course: Advanced Web Technologies

---

## 📄 License

This project was created for academic purposes as part of a web engineering course.

---

> *"Reducing the documentation burden so clinicians can focus on what matters — the patient."*
