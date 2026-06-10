## Plan: Add `/tasklist` page wired to backend API

### Scope guardrails
- Only add new files for the tasklist feature + one route entry in `src/App.tsx`.
- No changes to home page or any other existing page/component.
- Reuse existing UI components (`Card`, `Checkbox`, `Progress`, `Skeleton`, `useToast`, `Badge`) and current theme/tokens — no new styling system.

### Files to add
1. `src/lib/tasklistApi.ts` — tiny fetch helper
   - Reads `import.meta.env.VITE_API_BASE_URL`.
   - Always sends `ngrok-skip-browser-warning: true`.
   - Exports `fetchTasklist(token)` → GET `/api/tasklist/{token}`.
   - Exports `updateTaskStatus(id, token, status)` → PATCH `/api/tasks/{id}`.
   - Defines TS types for `TasklistResponse`, `Phase`, `Task`.

2. `src/hooks/useTasklist.ts` — local state hook
   - Loads checklist on mount given a token.
   - Holds `data | loading | error | notFound` states.
   - `toggleTask(id)`: optimistic flip, recompute `progress.done/pct` locally, PATCH, revert + toast on failure.

3. `src/pages/Tasklist.tsx` — the page
   - Reads `?token=` via `useSearchParams`.
   - If no token or 404 → friendly Dutch "Deze link is ongeldig of verlopen." panel.
   - Loading → existing skeleton style (reuse `TaskListSkeleton`).
   - Empty `phases` → "Je checklist wordt nog voorbereid."
   - Header: "Verhuizing van {name} — {formatted move_date}" (NL locale via `Intl.DateTimeFormat('nl-NL')`), progress bar (`Progress` component) + "{done} / {total} — {pct}%".
   - Sections grouped by phase using `phase.name` as header; tasks rendered in returned order.

4. `src/components/tasklist/TasklistTaskItem.tsx` — single task row
   - Uses existing `Checkbox`; bound to `status === "completed"`.
   - Shows title; optional `Badge` for category; due date formatted NL (`"15 mei 2026"`).
   - Renders `explanation` and `tip` only when non-null (small muted text / collapsible).

### Files to change
- `src/App.tsx` — add one `<Route path="/tasklist" element={<Tasklist />} />` line and an import. Nothing else.

### Secret
- Add project secret `VITE_API_BASE_URL` = `https://unhumiliated-taren-uncontrovertedly.ngrok-free.dev` (via the secrets tool in build mode). Code reads it only via `import.meta.env.VITE_API_BASE_URL` — never hardcoded.

### Behaviour summary
- GET on mount with `ngrok-skip-browser-warning` header.
- Optimistic toggle → PATCH with `{ token, status }` → revert + toast on failure.
- Local recompute of `done`/`pct` after each toggle for instant feedback.
- All static copy in Dutch; visual design unchanged.

### Out of scope (will not touch)
- Home page, onboarding, dashboard, explore page, existing routes, styling tokens, design system.
