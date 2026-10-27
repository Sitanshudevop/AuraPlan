# MANDATORY ENGINEERING & UI DESIGN RULES (100/100 RUBRIC)

## 1. ANTI-AI DESIGN SYSTEM (LUMA + LINEAR + NOTION AESTHETIC)
- NEVER use generic AI tropes: NO purple-to-blue neon gradients, NO floating glowing blobs, NO giant marketing hero sections, NO excessive emojis in headers, and NO heavy drop shadows (`shadow-2xl`).
- COLOR PALETTE:
  - Light Mode: Warm alabaster background (`#FAF9F6` / `bg-stone-50`), pure crisp white surfaces (`#FFFFFF`), 1px solid hairline borders (`#E7E5E4` / `border-stone-200`), deep charcoal primary text (`#18181B`), muted stone secondary text (`#71717A`).
  - Dark Mode: Carbon obsidian background (`#09090B`), elevated zinc surfaces (`#121215`), 1px subtle borders (`#27272A`), crisp off-white text (`#FAFAFA`).
  - Primary Accent: High-contrast obsidian (`#18181B` in light mode) paired with refined semantic tokens: Emerald (`#059669`) for on-budget/confirmed, Amber (`#D97706`) for warnings/pending, Rose (`#E11D48`) for over-budget/conflicts, and Indigo (`#4F46E5`) for subtle interactive highlights.
- TYPOGRAPHY: Use `Inter` or `Plus Jakarta Sans` for UI with tight tracking (`tracking-tight`) on headings. Use `JetBrains Mono` with `tabular-nums` (`font-mono tabular-nums`) for ALL currency values, percentages, dates, countdowns, and budget tables so numbers align vertically to the pixel.
- DENSITY & LAYOUT: Build an app-first workspace with a collapsible left navigation rail, a top context bar with breadcrumb + Command Palette trigger (`Cmd+K`), a responsive 12-column Bento grid main canvas, and a slide-over right drawer for the AI Co-Pilot & Ripple Simulator.

## 2. SIX JUDGING PARAMETERS (100/100 ENFORCEMENT)
- CODE QUALITY (100/100): Strict TypeScript (`strict: true`, zero `any` types, explicit interfaces). Modular folder structure (`src/types`, `src/schemas`, `src/services`, `src/hooks`, `src/features`, `src/components/ui`). Max 250 lines per file.
- SECURITY (100/100): Validate all user inputs and AI JSON responses with `zod`. Strip HTML/script tags using a dedicated sanitizer utility (`sanitizeInput`). Never use `dangerouslySetInnerHTML` or `eval`. Implement request rate-limiting/debouncing and a 100% functional deterministic local fallback engine if `VITE_GEMINI_API_KEY` is absent or rate-limited.
- EFFICIENCY (100/100): Wrap heavy calculations in `useMemo`, callbacks in `useCallback`, and lazy-load feature tabs via `React.lazy` + `<Suspense>` with accessible skeleton loaders. Sync state to versioned `localStorage`.
- ACCESSIBILITY (100/100): WCAG 2.1 AA compliance (minimum 4.5:1 contrast). Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`). Full keyboard support (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape` to close modals/drawers). Include a "Skip to main content" link and `aria-live="polite"` screen-reader announcer for dynamic budget/AI updates.
- TESTING (100/100): Write comprehensive unit and integration tests using Vitest and React Testing Library in `src/__tests__/`.