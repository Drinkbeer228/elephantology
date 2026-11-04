# Implementation Plan - GitHub Pages Export & Build Audit

## Proposed Changes

### 1. Vite Configuration (`vite.config.ts`)
- Ensure `base: './'` is set so assets resolve correctly relative to GitHub Pages subpaths.

### 2. Git Ignore (`.gitignore`)
- Verify and update `.gitignore` to include: `node_modules`, `dist`, `site`, `.vite`, `.env`, `.env.local`, `*.log`, `*.zip`, `.DS_Store`.

### 3. Strict Audit & Unused Code Removal
- Check all source files for any unused imports (`Printer`, `Share2`, `Quote`, `Clock`, `Tag`, `Languages`, etc.) and unused variables.
- Run `npm run build` (tsc && vite build) to verify 0 errors and 0 warnings.

### 4. Artifact Hygiene
- Clean up any temporary files or debug logs.

## Verification Plan
1. Run `npm run build` via `run_command` (or `compile_applet`) to ensure clean production bundle creation.
2. Verify git status and `.gitignore`.
