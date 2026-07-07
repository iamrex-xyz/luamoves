# Lua Assistant — Backend

The backend for the **Lua WhatsApp moving assistant**. It receives WhatsApp messages from Bird, runs them through an AI model (via OpenRouter), applies all the safety and business rules in plain TypeScript, and sends a reply back. It also stores everything in Supabase, builds each user's moving checklist, sends the daily reminders, and serves the task-list web page.

> New here? Start with the project-wide [`../README.md`](../README.md) for the big picture and full local setup. This file is for working **inside the backend**.

---

## Core principle

> **The LLM proposes, the backend disposes.**

The AI only writes the natural-language conversation. Every hard guarantee — one reminder per day, the affiliate link limit, exact-format messages, crisis routing, never promising savings, the 24h WhatsApp window — is enforced in **deterministic TypeScript**, never left to the model. Messages that must be exact (onboarding summary, crisis text, affiliate disclosure, deflections) are **code-rendered templates**, not AI output.

---

## How a message flows

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

## Where to find what

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

## Key concepts

- **Behaviour spec (`src/prompts/`)** — six Markdown files define Lua's personality and rules. They are loaded once at boot, used as-is, and a SHA-256 **config version** is logged at startup and exposed on `/health`. Do not rewrite Lua's tone here; this is the client's source material.
- **Templates vs. AI** — anything that must be word-for-word exact lives in `src/templates/` and is rendered by code. Only free conversation comes from the AI.
- **Plain text** — WhatsApp gets plain text only. All markdown/bold/bullets are stripped (`utils/plaintext.ts`) before sending.
- **Idempotent webhook** — inbound messages are de-duplicated by `message_id` (Bird can retry the same message).
- **Stable prompt prefix** — the static system prompt comes first, changing per-turn data last, so the AI provider can cache the prefix and keep replies cheaper/faster.
- **Config from env/files only** — models, partner URLs, and disclosure text are never hard-coded.

---

## Running it

All commands run from inside this `lua-assistant/` folder. See the root [`../README.md`](../README.md) for full prerequisites and `RUN.md` for every run command.

```bash
cp .env.example .env     # then fill in your keys (each line is explained in the file)

# With Docker (starts app + reminder worker + Redis together)
docker compose up --build      # or:  make local

# Or directly with Node, for development (needs Redis + Supabase available)
npm install
npm run dev                    # auto-reload

curl http://localhost:3100/health   # check it's alive
```

### npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` + copy the prompt files |
| `npm start` | Run the compiled build (`dist/index.js`) |
| `npm test` | Run the unit tests (vitest) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

### `make` shortcuts

| Command | What it does |
|---|---|
| `make local` | Start the local stack (app + worker + Redis) |
| `make local-logs` | Same, plus the Grafana/Loki logging stack |
| `make down` | Stop the stack |
| `make ps` | Show running services + ports |

---

## Database

The schema lives in `migrations/` as numbered SQL files (`0001_init.sql` … `0013_…`).

- **Self-hosted Supabase:** `bash ops/setup-supabase.sh` installs Supabase and applies every migration once (safe to re-run). Use `ops/supabase-ctl.sh up|down|status|logs` to control it afterwards.
- **Client-provided Supabase:** apply the migration files against the database once, in numeric order, then put `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

---

## Configuration

Everything is set through `.env` (copy from `.env.example`, which documents every option). Highlights:

- `OPENROUTER_API_KEY`, `MAIN_MODEL`, `SUMMARY_MODEL` — the AI. **Never hard-code a model**; it comes from env.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — the database.
- `BIRD_API_KEY`, `BIRD_WORKSPACE_ID`, `BIRD_CHANNEL_ID`, `BIRD_WEBHOOK_SIGNING_KEY`, `BIRD_WEBHOOK_URL` — WhatsApp.
- `REDIS_URL`, `REMINDER_CRON`, `REMINDER_MIN_DAYS`/`MAX_DAYS`, `SESSION_WINDOW_HOURS` — reminders.

---

## Testing

```bash
npm test
```

Tests live in `tests/`. The important guarantees to keep covered are the ones the AI must **not** be trusted with: the affiliate 1-in-5 guard, webhook dedupe, disclosure-shown-once, the onboarding state machine, and the plain-text formatter.

---

## Conventions

- All application code lives under `src/`. Keep external integrations in `services/`, DB access in `repositories/`, fixed text in `templates/`.
- Validate AI-extracted data in code before persisting it.
- Log decisions: token usage (including cached prompt tokens) and **why** a guard fired (offer suppressed, reminder skipped).
- Don't edit anything in `../requirement-docs/` — it is the client's read-only source material.
