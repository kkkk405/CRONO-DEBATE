# crono-debate

React + Vite debate timer application.

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Project Structure

- Entry: `src/main.jsx` → `src/App.jsx`
- State: `src/store/useCronoStore.js` (custom hook, uses localStorage with key `cronoDebate:{format}`)
- Components: `src/components/` (ConfigPanel, TimerCard, PrepTimerPanel, ReportPanel, ModerationPanel, DebateFormato, AppMenu)
- Utils: `src/utils/time.js`

## Tech Stack

- React 19 + Vite
- PrimeReact (UI components)
- styled-components
- No TypeScript, no tests

## Notes

- ESLint allows uppercase-prefixed vars (e.g., `CONSTANT`): `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]`
- Some components intentionally use `useEffect` with `setState` for format-dependent initialization (suppress with eslint-disable if needed)