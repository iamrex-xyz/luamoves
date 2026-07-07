# Lua — WhatsApp Moving Assistant

Lua is a friendly, **Dutch-language WhatsApp assistant** that helps people through the stress of moving house. A user chats with Lua on WhatsApp; Lua remembers their move date, builds a personal moving checklist, sends gentle reminders, and points them to helpful partner services along the way.

This repository contains everything needed to run that assistant.

---

## 1. What this project does (in plain words)

1. A person sends a WhatsApp message.
2. The message arrives at our **backend** (a small server program).
3. The backend remembers who the person is, looks at the conversation so far, and asks an **AI model** to write a natural, human-sounding reply in the person's own language.
4. The backend checks the reply against a set of strict safety and business rules, then sends it back to the person on WhatsApp.
5. Along the way it keeps a **checklist** of moving tasks, sends **one reminder a day** when a task is due soon, and shows the full task list on a simple **web page**.

> **Guiding principle:** *the AI proposes, the backend disposes.*
> The AI only writes the conversational text. Every hard rule — only one reminder per day, partner-link limits, crisis handling, never promising savings — is enforced by our own code, never left to the AI to decide.

---

## 2. What it is built with

| Part                                   | Technology                       | What it's for                                                                            |
| -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| **Backend** (`lua-assistant/`) | Node.js + TypeScript + Express   | The brain: receives WhatsApp messages, talks to the AI, applies the rules, sends replies |
| **AI model**                     | OpenRouter (e.g. GPT‑4.1‑mini) | Writes the natural-language conversation                                                 |
| **Database**                     | Supabase (PostgreSQL)            | Stores users, conversations, checklists, reminders                                       |
| **Queue**                        | Redis + BullMQ                   | Schedules and sends the daily reminders                                                  |
| **WhatsApp**                     | Bird                             | The channel that connects Lua to real WhatsApp users                                     |
| **Frontend** (`lua-frontend/`) | React + Vite                     | The web page where a user sees their full moving task list                               |
| **Packaging**                    | Docker + Docker Compose          | Lets you run everything with one command                                                 |

---

## 3. Folder map

```
lua-whatsapp-bot/
├── lua-assistant/      ← the backend server (the main application)
│   ├── src/            ← all the source code
│   ├── migrations/     ← database setup files (SQL)
│   ├── ops/            ← scripts to install the Supabase database
│   ├── docker-compose.yml
│   └── .env.example    ← template for your settings/secrets
├── lua-frontend/       ← the task-list web page (React)
├── requirement-docs/   ← the client's original briefing (read-only)
└── README.md           ← this file
```

---

## 4. Before you start — what you need installed

You need these on your computer first. They are free.

1. **Docker Desktop** — runs the app in self-contained boxes so you don't have to install databases by hand.
   Download: https://www.docker.com/products/docker-desktop/
2. **Node.js (version 20 or newer)** — only needed if you want to run the backend *without* Docker, or run the frontend.
   Download: https://nodejs.org/
3. **Git** — to download this code.

You will also need a few **accounts / keys** to make the assistant fully work (the project starts up without them, but won't talk to WhatsApp or the AI until they are filled in):

- An **OpenRouter** API key — for the AI model. (https://openrouter.ai/)
- A **Bird** account — for WhatsApp messaging. (https://bird.com/)
- A **Supabase** database — you can self-host one locally using the included script (see step 5b).

> If you only want to *see the project start up and respond at `/health`*, you can skip the keys for now and come back to them.

---

## 5. Running it locally — step by step

All backend commands are run from inside the `lua-assistant` folder.

```bash
# Download the code (skip if you already have it)
git clone <your-git-url>
cd lua-whatsapp-bot/lua-assistant
```

### 5a. Create your settings file

The app reads its secrets and settings from a file called `.env`. We ship a template:

```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in the values you have. The most important ones:

| Setting                                                      | What to put                      |
| ------------------------------------------------------------ | -------------------------------- |
| `OPENROUTER_API_KEY`                                       | Your OpenRouter key (for the AI) |
| `SUPABASE_URL`                                             | Your Supabase address            |
| `SUPABASE_SERVICE_ROLE_KEY`                                | Your Supabase secret key         |
| `BIRD_API_KEY`, `BIRD_WORKSPACE_ID`, `BIRD_CHANNEL_ID` | Your WhatsApp/Bird details       |

Every setting in `.env.example` is explained with a comment right above it. You can leave the ones you don't have yet empty for a first test run.

### 5b. Set up the database (Supabase)

Lua needs a Supabase (PostgreSQL) database. You have two options:

- **Option A — use a database the client gives you.** Just paste its `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into `.env`. Done.
- **Option B — run your own locally** (Linux, with Docker). We include a one-shot installer that downloads Supabase, creates all the secrets, applies the database tables, and writes the two needed values straight into your `.env`:

  ```bash
  bash ops/setup-supabase.sh
  ```

  This is safe to run more than once — it never wipes existing data.

> The database tables themselves are defined in the `migrations/` folder. Option B applies them automatically. If you use Option A, the migration `.sql` files there need to be run against the database once.

### 5c. Start the backend

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

### 5d. Start the task-list web page (frontend)

This is the page a user opens to see their moving checklist. From the **`lua-frontend`** folder:

```bash
cd ../lua-frontend
npm install
npm run dev
```

It opens at **http://localhost:8080**.

---

## 6. Handy commands (backend)

Run these from inside `lua-assistant/`.

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `make local`      | Start the whole local stack (app + worker + Redis) |
| `make local-logs` | Same, plus a Grafana dashboard for logs            |
| `make down`       | Stop the stack                                     |
| `make ps`         | Show what's running and on which ports             |
| `npm run dev`     | Run the backend directly with auto-reload          |
| `npm run build`   | Compile the code for production                    |
| `npm test`        | Run the automated tests                            |

(See `lua-assistant/RUN.md` for the full list, including production deployment.)

---

## 7. Connecting real WhatsApp messages (optional)

To receive real WhatsApp messages on your local machine, Bird needs a public web address that points back to your computer. A tool like **ngrok** gives you one:

```bash
ngrok http 3100
```

Copy the public URL it prints into `BIRD_WEBHOOK_URL` in your `.env`, and register the same URL as the webhook in your Bird dashboard. Restart the backend afterwards.

---

## 8. Where to read more

- **`lua-assistant/README.md`** — backend-specific notes and project layout.
- **`lua-assistant/RUN.md`** — exact run commands, including production.
- **`requirement-docs/`** — the client's original briefing and the files that define Lua's personality and rules. **Read-only — do not edit.**

---

## 9. Quick troubleshooting

| Problem                         | Likely cause / fix                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `docker: command not found`   | Docker Desktop isn't installed or isn't running.                                             |
| `/health` doesn't respond     | The app may still be building — wait a moment, then retry. Check`docker compose logs`.    |
| AI replies don't work           | `OPENROUTER_API_KEY` is missing or invalid in `.env`.                                    |
| Nothing saves / database errors | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing, or migrations weren't applied. |
| WhatsApp messages don't arrive  | The Bird webhook URL doesn't match`BIRD_WEBHOOK_URL`, or ngrok isn't running.              |
