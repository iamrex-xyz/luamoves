# Lua — Digital Moving Assistant

Lua is a **Dutch-language digital moving assistant** for young adults (25–35) buying or renting a new home in the Netherlands. It turns the stress of moving into a personalized, prioritized checklist and offers to handle tasks on the user's behalf ("Regel dit voor mij") — energy contracts, notary, insurance, and more.

This repository is the **frontend web app**: the PWA users interact with in the browser and via the wrapped mobile apps.

---

## Tech stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (mobile-first PWA)
- **Backend**: Supabase — database, auth, edge functions, file storage
- **AI**: in-app Lua chat is served by the `lua-chat` Supabase edge function (Gemini 2.5 Flash)
- **Native**: Capacitor wrapping for iOS/Android
- **Deployment**: Vercel (SPA rewrites configured in `vercel.json`)

See [`docs/lua-overview.md`](docs/lua-overview.md) for the full product/architecture write-up (onboarding flow, data model, intake dialogs, etc.) and [`docs/`](docs/) for the design system.

---

## Project layout

```
src/
├── App.tsx           ← routes
├── main.tsx          ← entry point
├── pages/            ← route-level views (incl. Blog, BlogPost)
├── components/       ← UI components
├── features/         ← feature-specific logic
├── content/blog/     ← static Markdown blog posts (see below)
├── integrations/      ← Supabase client, etc.
├── data/, lib/, hooks/, types/

public/                ← static assets, service worker
supabase/              ← migrations + edge functions (backend)
docs/                  ← product overview & design system reference
backend-reference/     ← the WhatsApp bot backend (separate codebase, zipped — see its own README)
```

---

## Local development

```bash
npm install
npm run dev          # starts Vite dev server on http://localhost:8080
npm run build        # production build
npm run lint         # ESLint
```

### Blog automation

`npm run blog` runs the daily blog-generation script (`scripts/generate-blog.ts`) that writes new Dutch posts to `src/content/blog/`. In practice this now runs as a scheduled Claude Code task rather than manually.

---

## Environment variables

Copy the client-side config into a local `.env` (Vite requires the `VITE_` prefix to expose vars to the browser bundle):

```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_API_BASE_URL=
```

The Supabase *publishable* key is safe to expose client-side by design. Production values are configured directly in the Vercel project settings — the committed `.env` is for local development only.

---

## The WhatsApp bot backend

A separate WhatsApp-based assistant backend (Node/Express/Bird/OpenRouter) exists as its own codebase and is kept here for reference as a zip archive, not as tracked source: see [`backend-reference/README.md`](backend-reference/README.md) for what it is, how it's built, and how to run it.
