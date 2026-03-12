# AGENTS.md

## Cursor Cloud specific instructions

### Overview

"My English DB" is a client-only PWA (React 19 + TypeScript + Vite 7). No backend, database, or external services are required. All data is stored in `localStorage`.

### Commands

Standard commands are defined in `package.json`:

- **Dev server:** `npm run dev` (Vite, default port 5173)
- **Lint:** `npm run lint` (ESLint 9)
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Preview:** `npm run preview`

### Notes

- There is a pre-existing lint error in `src/App.tsx` (`react-hooks/set-state-in-effect` rule). This is not a setup issue.
- The project uses `package-lock.json` — always use `npm` (not pnpm/yarn).
- No tests framework is configured; there are no automated test suites.
