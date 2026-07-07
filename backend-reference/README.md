# Lua WhatsApp Assistant — Backend Reference

> **This is reference material, not live code.** The actual backend project lives zipped up in this folder as [`lua-whatsapp-bot-master.zip`](./lua-whatsapp-bot-master.zip) — it is a separate codebase from the frontend web app tracked in the rest of this repo. Unzip it if you need to build or run it. This document merges that project's two original README files (root + `lua-assistant/`) so the setup and architecture notes aren't lost.

Lua is a friendly, **Dutch-language WhatsApp assistant** that helps people through the stress of moving house. A user chats with Lua on WhatsApp; Lua remembers their move date, builds a personal moving checklist, sends gentle reminders, and points them to helpful partner services along the way.

The zip contains everything needed to run that assistant.

---

## 1. What this project does (in plain words)

1. A person sends a WhatsApp message.
2. The message arrives at our **backend** (a small server program).
3. The backend remembers who the person is, looks at the conversation so far, and asks an **AI model** to write a natural, human-sounding reply in the person's own language.
4. The backend checks the reply against a set of strict safety and business rules, then sends it back to the person on WhatsApp.
5. Along the way it keeps a **checklist** of moving tasks, sends **one reminder a day** when a task is due soon, and shows the full task list on a simple **web page**.

> **Guiding principle:** *the AI proposes, the backend disposes.*
> The AI only writes the conversational text. Every hard rule — one reminder per day, partner-link limits, crisis handling, never promising savings — is enforced by our own code, never left to the AI to decide. Messages that must be exact (onboarding summary, crisis text, affiliate disclosure, deflections) are **code-rendered templates**, not AI output.

---

## 2. What it is built with

| Part | Technology | What it's for |
| --- | --- | --- |
| **Backend** (`lua-assistant/`) | Node.js + TypeScript + Express | The brain: receives WhatsApp messages, talks to the AI, applies the rules, sends replies |
| **AI model** | OpenRouter (e.g. GPT-4.1-mini) | Writes the natural-language conversation |
| **Database** | Supabase (PostgreSQL) | Stores users, conversations, checklists, reminders |
| **Queue** | Redis + BullMQ | Schedules and sends the daily reminders |
| **WhatsApp** | Bird | The channel that connects Lua to real WhatsApp users |
| **Frontend** (`lua-frontend/`) | React + Vite | The web page where a user sees their full moving task list (unrelated to the main frontend web app in this repo) |
| **Packaging** | Docker + Docker Compose | Lets you run everything with one command |

---

## 3. Folder map (inside the zip)

```
lua-whatsapp-bot/
├── lua-assistant/      ← the backend server (the main application)
│   ├── src/            ← all the source code
│   ├── migrations/     ← database setup files (SQL)
│   ├── ops/             ← scripts to install the Supabase database
│   ├── docker-compose.yml
│   └── .env.example    ← template for your settings/secrets
├── lua-frontend/       ← the task-list web page (React)
├── requirement-docs/   ← the client's original briefing (read-only)
└── README.md
```

### Backend source layout (`lua-assistant/src/`)

```
src/
├── index.ts          ← entry point: boots config, starts the HTTP server
├── app.ts            ← builds the Express app (middleware + routes)
├── worker.ts         ← entry point for the reminder worker process
│
├── config/           ← settings & startup
│   ├── index.ts        env vars, validated with Zod (fails fast if missing)
│   └── prompts.ts      loads the 6 behaviour-spec files + computes a version hash
│
├── routes/           ← thin HTTP endpoints (no business logic)
│   ├── health.routes.ts    GET /health
│   ├── webhook.routes.ts   POST — inbound WhatsApp from Bird
│   └── tasklist.routes.ts  task-list page + its data API
│
├── features/         ← the business logic, grouped by topic
│   ├── conversation/   orchestrator (the conductor) + promptBuilder
│   ├── onboarding/     first-contact state machine (collect name, move date…)
│   ├── memory/         recent-message window + rolling summary
│   ├── checklist/      generate the moving task list + update task status
│   ├── reminders/      scheduler, queue, worker, opt-out logic
│   ├── affiliate/      partner links, eligibility, the 1-in-5 guard, disclosure
│   ├── safety/         crisis, jailbreak, and sensitive-data detection
│   └── language/       detect & lock the user's language for the session
│
├── services/         ← talk to the outside world (one file per system)
│   ├── llm.service.ts       OpenRouter (the AI)
│   ├── bird.service.ts      Bird (WhatsApp send)
│   └── supabase.service.ts  Supabase (database client)
│
├── repositories/     ← database access, one file per table
│   (user, message, session, summary, task, reminder, affiliate)
│
├── templates/        ← fixed-text messages, rendered in code (never the AI)
│   (welcome, summary, checklist, crisis, deflection, reminder, date)
│
├── prompts/          ← the behaviour spec (used VERBATIM as the system prompt)
│   SOUL.md, flow.md, instructions.md, knowledge.md, monetization.md, privacy.md
│
├── web/              ← server-rendered task-list HTML page
├── utils/            ← logger, plain-text formatter, CORS, dates, language…
└── types/            ← shared TypeScript types (db, llm)

migrations/           ← SQL files (0001…0013), the database schema
ops/                  ← scripts to install & control self-hosted Supabase
```

**Rule of thumb:** routes receive HTTP → features do the thinking → services & repositories talk to the outside world. Add a new capability → add a folder under `features/`. Talk to a new external system → add a file under `services/`. Touch a new table → add a file under `repositories/`.

---

## 4. How a message flows

```
WhatsApp user
   │
   ▼
Bird  ──HTTP POST──▶  routes/webhook.routes.ts   (verify signature, dedupe by message_id)
                          │
                          ▼
                  features/conversation/orchestrator.ts   ← the conductor
                          │
        ┌─────────────────┼──────────────────────────────────┐
        ▼                 ▼                                    ▼
   safety checks     onboarding / checklist / memory      promptBuilder
   (crisis,          (business logic)                     (builds the AI input)
    jailbreak,                                                  │
    sensitive)                                                  ▼
                                                        services/llm.service.ts  ──▶ OpenRouter
                          │                                     │
                          ▼                                     ▼
                  apply rules + templates  ◀───────────  AI draft reply
                          │
                          ▼
                  services/bird.service.ts  ──▶  Bird  ──▶  WhatsApp user
```

Reminders run on a **separate track**: a scheduler scans for due tasks on a cron, queues jobs in Redis (BullMQ), and a worker process sends them.

---

## 5. Before you start — what you need installed

You need these on your computer first. They are free.

1. **Docker Desktop** — runs the app in self-contained boxes so you don't have to install databases by hand.
   Download: https://www.docker.com/products/docker-desktop/
2. **Node.js (version 20 or newer)** — only needed if you want to run the backend *without* Docker, or run the frontend.
   Download: https://nodejs.org/
3. **Git** — to download this code.

You will also need a few **accounts / keys** to make the assistant fully work (the project starts up without them, but won't talk to WhatsApp or the AI until they are filled in):

- An **OpenRouter** API key — for the AI model. (https://openrouter.ai/)
- A **Bird** account — for WhatsApp messaging. (https://bird.com/)
- A **Supabase** database — you can self-host one locally using the included script (see step 6b).

> If you only want to *see the project start up and respond at `/health`*, you can skip the keys for now and come back to them.

---

## 6. Running it locally — step by step

First, unzip [`lua-whatsapp-bot-master.zip`](./lua-whatsapp-bot-master.zip) somewhere. All backend commands are run from inside the extracted `lua-assistant` folder.

```bash
unzip lua-whatsapp-bot-master.zip
cd lua-whatsapp-bot-master/lua-assistant
```

### 6a. Create your settings file

The app reads its secrets and settings from a file called `.env`. A template ships in the zip:

```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in the values you have. The most important ones:

| Setting | What to put |
| --- | --- |
| `OPENROUTER_API_KEY` | Your OpenRouter key (for the AI) |
| `SUPABASE_URL` | Your Supabase address |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase secret key |
| `BIRD_API_KEY`, `BIRD_WORKSPACE_ID`, `BIRD_CHANNEL_ID` | Your WhatsApp/Bird details |

Every setting in `.env.example` is explained with a comment right above it. You can leave the ones you don't have yet empty for a first test run.

> **Never commit a real `.env` for this backend to this (public) repo.** `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security — treat it like a root database password.

### 6b. Set up the database (Supabase)

Lua needs a Supabase (PostgreSQL) database. You have two options:

- **Option A — use a database the client gives you.** Just paste its `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into `.env`. Done.
- **Option B — run your own locally** (Linux, with Docker). A one-shot installer downloads Supabase, creates all the secrets, applies the database tables, and writes the two needed values straight into your `.env`:

  ```bash
  bash ops/setup-supabase.sh
  ```

  This is safe to run more than once — it never wipes existing data.

> The database tables themselves are defined in the `migrations/` folder. Option B applies them automatically. If you use Option A, the migration `.sql` files there need to be run against the database once, in numeric order.

### 6c. Start the backend

The easiest way is with Docker — it starts the app, the reminder worker, and Redis together:

```bash
docker compose up --build
```

Or, if you have the `make` shortcut available:

```bash
make local
```

When it's running, check that it's alive:

```bash
curl http://localhost:3100/health
# → {"status":"ok", ...}
```

That's it — the backend is now listening for WhatsApp messages on **http://localhost:3100**.

#### Without Docker (optional)

If you prefer to run it directly with Node (handy while developing):

```bash
npm install      # install dependencies (first time only)
npm run dev      # starts with auto-reload
```

Note: this path still needs a running Redis and Supabase for full functionality.

### 6d. Start the task-list web page (frontend, inside the zip)

This is the page a user opens to see their moving checklist — it's the zip's own `lua-frontend/`, separate from the main app in this repo. From the **`lua-frontend`** folder:

```bash
cd ../lua-frontend
npm install
npm run dev
```

It opens at **http://localhost:8080**.

---

## 7. Handy commands (backend)

Run these from inside `lua-assistant/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Run with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` + copy the prompt files |
| `npm start` | Run the compiled build (`dist/index.js`) |
| `npm test` | Run the unit tests (vitest) |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `make local` | Start the whole local stack (app + worker + Redis) |
| `make local-logs` | Same, plus a Grafana/Loki dashboard for logs |
| `make down` | Stop the stack |
| `make ps` | Show what's running and on which ports |

(See `lua-assistant/RUN.md` inside the zip for the full list, including production deployment.)

---

## 8. Connecting real WhatsApp messages (optional)

To receive real WhatsApp messages on your local machine, Bird needs a public web address that points back to your computer. A tool like **ngrok** gives you one:

```bash
ngrok http 3100
```

Copy the public URL it prints into `BIRD_WEBHOOK_URL` in your `.env`, and register the same URL as the webhook in your Bird dashboard. Restart the backend afterwards.

---

## 9. Key concepts

- **Behaviour spec (`src/prompts/`)** — six Markdown files define Lua's personality and rules. They are loaded once at boot, used as-is, and a SHA-256 **config version** is logged at startup and exposed on `/health`. Do not rewrite Lua's tone here; this is the client's source material.
- **Templates vs. AI** — anything that must be word-for-word exact lives in `src/templates/` and is rendered by code. Only free conversation comes from the AI.
- **Plain text** — WhatsApp gets plain text only. All markdown/bold/bullets are stripped (`utils/plaintext.ts`) before sending.
- **Idempotent webhook** — inbound messages are de-duplicated by `message_id` (Bird can retry the same message).
- **Stable prompt prefix** — the static system prompt comes first, changing per-turn data last, so the AI provider can cache the prefix and keep replies cheaper/faster.
- **Config from env/files only** — models, partner URLs, and disclosure text are never hard-coded.

---

## 10. Configuration reference

Everything is set through `.env` (copy from `.env.example`, which documents every option). Highlights:

- `OPENROUTER_API_KEY`, `MAIN_MODEL`, `SUMMARY_MODEL` — the AI. **Never hard-code a model**; it comes from env.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — the database.
- `BIRD_API_KEY`, `BIRD_WORKSPACE_ID`, `BIRD_CHANNEL_ID`, `BIRD_WEBHOOK_SIGNING_KEY`, `BIRD_WEBHOOK_URL` — WhatsApp.
- `REDIS_URL`, `REMINDER_CRON`, `REMINDER_MIN_DAYS`/`MAX_DAYS`, `SESSION_WINDOW_HOURS` — reminders.

---

## 11. Testing

```bash
npm test
```

Tests live in `tests/`. The important guarantees to keep covered are the ones the AI must **not** be trusted with: the affiliate 1-in-5 guard, webhook dedupe, disclosure-shown-once, the onboarding state machine, and the plain-text formatter.

---

## 12. Conventions

- All application code lives under `src/`. Keep external integrations in `services/`, DB access in `repositories/`, fixed text in `templates/`.
- Validate AI-extracted data in code before persisting it.
- Log decisions: token usage (including cached prompt tokens) and **why** a guard fired (offer suppressed, reminder skipped).
- Don't edit anything in `requirement-docs/` inside the zip — it is the client's read-only source material.

---

## 13. Where to read more (inside the zip)

- `lua-assistant/README.md` — backend-specific notes and project layout (merged into this document).
- `lua-assistant/RUN.md` — exact run commands, including production.
- `requirement-docs/` — the client's original briefing and the files that define Lua's personality and rules. **Read-only — do not edit.**

---

## 14. Quick troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| `docker: command not found` | Docker Desktop isn't installed or isn't running. |
| `/health` doesn't respond | The app may still be building — wait a moment, then retry. Check `docker compose logs`. |
| AI replies don't work | `OPENROUTER_API_KEY` is missing or invalid in `.env`. |
| Nothing saves / database errors | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing, or migrations weren't applied. |
| WhatsApp messages don't arrive | The Bird webhook URL doesn't match `BIRD_WEBHOOK_URL`, or ngrok isn't running. |
