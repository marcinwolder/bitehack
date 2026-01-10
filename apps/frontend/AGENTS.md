# Repository Guidelines

## Project Structure & Module Organization
This app is a Vite + React + TypeScript frontend.
- `src/main.tsx` bootstraps the app and mounts React.
- `src/App.tsx` is the main UI component entry.
- `src/index.css` holds Tailwind CSS v4 and daisyUI setup.
- `src/assets/` stores static assets (e.g., `src/assets/logo.png`).
- `index.html` is the Vite HTML template.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with hot reload.
- `npm run build` type-checks (`tsc -b`) and produces the production build.
- `npm run lint` runs ESLint across the codebase.
- `npm run preview` serves the production build locally for verification.

## Coding Style & Naming Conventions
- Use TypeScript for logic and `.tsx` for React components.
- Components use `PascalCase` (e.g., `HeroBanner`), hooks/vars use `camelCase`.
- Prefer Tailwind/daisyUI utility classes over custom CSS; keep custom styles in `src/index.css` when needed.
- Use daisyUI for ready-made components; follow the usage guide in `daisyui-agents.md`.
- Follow ESLint rules in `eslint.config.js`; run `npm run lint` before PRs.

## Testing Guidelines
There is no test runner or test script configured yet. If you add tests, also add a script in `package.json` and document the framework and conventions here.

## Commit & Pull Request Guidelines
Git history only contains “Initial commit”, so no established commit convention yet. Use concise, imperative messages (e.g., “Add hero layout”).
PRs should include a brief summary, testing notes (commands run), and screenshots or a short clip for UI changes.

## Configuration Tips
Vite config lives in `vite.config.ts`, and TypeScript settings in `tsconfig*.json`. Keep environment-specific changes localized there and document any new env vars.
