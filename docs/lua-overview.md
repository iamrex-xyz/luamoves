# Lua — Digital Moving Assistant

## Concept
Lua is a **Dutch-language digital moving assistant** targeting young adults (25-35) going through the process of buying or renting a new home in the Netherlands. It acts as a "smart, involved friend" — reducing the overwhelming stress of moving by breaking it into a personalized, prioritized checklist and offering to handle tasks on the user's behalf ("Regel dit voor mij").

## Brand & Voice
- **Tone**: Warm, practical, slightly playful — never corporate or pushy
- **Language**: Conversational Dutch (e.g., "Lua regelt dit", "Nu niet", "Verhuischecklist")
- **Principles**: Calm over completeness, no dark patterns, no fake urgency
- **CTA pattern**: "Regel dit voor mij" triggers intake dialogs where users provide details, then Lua handles the rest (energy contracts, notary, insurance, etc.)

## Technical Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (mobile-first PWA)
- **Backend**: Lovable Cloud (Supabase) — database, auth, edge functions, file storage
- **AI**: Lovable AI Gateway (Gemini/GPT models) powers the in-app Lua AI chat
- **Native**: Capacitor wrapping for iOS/Android
- **Auth flow**: Anonymous-first → Google SSO or email magic link after task engagement (soft prompt at 2 tasks, hard block at 5)

## Architecture

### 1. Anonymous-first onboarding
Users start without an account. A unique `anonymous_user_id` (localStorage + cookie) tracks all progress. Profile data is stored directly in the `profiles` table with this anonymous ID.

### 2. Account creation
After engaging with tasks, users are prompted to create an account (Google SSO primary, email magic link secondary). On sign-in, `merge_anonymous_to_user` RPC consolidates all anonymous data into the authenticated profile.

### 3. Task system
Tasks are generated dynamically based on user profile (moving date, property type, buy/rent, has garden, etc.) via `taskGenerator.tsx`. Each task has a category, phase, deadline, and optional affiliate/intake flow.

### 4. Intake dialogs
~20+ specialized question dialogs (Energy, Internet, Notary, Mortgage, Insurance, Taxatie, etc.) collect user preferences and sync to the `profiles` table via `useProfileSync`. When intake is completed, the task shows "Lua regelt dit" and becomes non-checkable.

### 5. Data model
Single `profiles` table is the source of truth with 70+ fields covering personal info, household, property, energy, internet, insurance, renovation, and moving preferences. Tasks are tracked in a separate `tasks` table with status enum (todo/in_progress/done).

## Key Features

| Feature | Description |
|---|---|
| **Personalized checklist** | Auto-generated tasks based on moving date, property type, buy vs rent, household size |
| **"Regel dit voor mij"** | Intake dialogs collect details → Lua handles the service (energy, notary, etc.) |
| **AI chat (Lua)** | Context-aware assistant with full profile + task progress knowledge |
| **Task assignment** | Assign tasks to household members via email/WhatsApp notifications |
| **Household management** | Invite household members via secure token-based system |
| **Document uploads** | Attach documents to specific tasks (stored in Supabase Storage) |
| **Budget tracking** | Moving expense tracking with categories |
| **Reminders** | Scheduled email reminders for upcoming task deadlines |
| **Progress milestones** | Celebration dialogs at completion milestones (confetti!) |
| **Collaborator chat** | Messaging between household members |
| **Admin dashboard** | Internal view of all user profiles, feedback, and engagement metrics |
| **PWA + native** | Service worker for offline support, Capacitor for app stores |

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User/anonymous profile data (70+ fields) |
| `tasks` | Task status tracking per user |
| `custom_tasks` | User-created custom tasks |
| `task_deadlines` | Custom deadline overrides |
| `household_members` | Invited household members |
| `moving_collaborators` | Shared access partners |
| `collaborator_messages` | In-app messaging |
| `moving_documents` | Uploaded files |
| `moving_expenses` | Budget tracking |
| `scheduled_reminders` | Email reminder queue |
| `soft_launch_feedback` | In-app feedback collection |
| `user_roles` | Admin role management (RLS-secured) |

## Security
- RLS policies on all tables (authenticated + anonymous access patterns)
- Admin access via email domain (`@lua.nl`, `@luamoves.nl`) + `user_roles` table
- OTP codes use SHA-256 hashing with phone-number salt
- Anonymous data access is intentional for conversion but scoped via RLS to matching anonymous IDs
