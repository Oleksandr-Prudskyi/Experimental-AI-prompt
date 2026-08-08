# Evidence — Phase 2: Comprehensive UI/UX Audit

**Date:** 2026-08-08
**Method:** Code review of all 53 frontend source files + live production inspection
**Production URL:** https://evidence-test-promt.vercel.app

---

## UX AUDIT

### UX-001: No loading states anywhere

**PROBLEM:** No page shows a skeleton, spinner, or loading indicator while data is being fetched.
**EVIDENCE:** Every page destructures data with fallback to empty arrays (`data?.data || []`) and renders immediately. DashboardPage, EvidencePage, UsersPage, MachinesPage, ShiftsPage, AuditLogPage, TrashPage — none check `isLoading` to show feedback. DashboardPage.tsx:15 uses `const stats = data?.data || data || {};` — stats are all `0` during load, identical to "no data."
**UX IMPACT:** Users see blank/zero content and cannot distinguish "loading" from "empty." In a manufacturing environment with slow network (factory floor), this creates confusion about whether the system is working.
**SEVERITY:** HIGH
**RECOMMENDATION:** Add Skeleton components for each page type. Show skeletons while `isLoading && !data`. Use existing `shimmer` keyframe animation.

### UX-002: QuickActions duplicates sidebar navigation

**PROBLEM:** The 4 QuickActions buttons (Nový záznam, Evidence, Stroje, Uživatelé) duplicate items already present in the sidebar.
**EVIDENCE:** QuickActions.tsx:5-9 defines the same paths as SidebarNav.tsx:18-20,26. Both are visible simultaneously on desktop.
**UX IMPACT:** Wastes 1/3 of the dashboard bottom row on redundant navigation. No new information or context is provided. Creates the impression the dashboard has content when it's mostly navigation repeated.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Replace with content that adds value — category breakdown, production summary, or shift overview.

### UX-003: RightPanel is an empty placeholder

**PROBLEM:** 280px of screen width is occupied by a panel showing only "Žádná nová oznámení" (no new notifications).
**EVIDENCE:** RightPanel.tsx — 14 lines total, entire content is a hardcoded Czech string. No notification system exists anywhere in the codebase.
**UX IMPACT:** Steals horizontal space from main content on xl+ viewports. Creates false expectations about a notification feature. On a 1280px viewport, main content area is reduced to ~780px effective width.
**SEVERITY:** HIGH
**RECOMMENDATION:** Remove entirely. The 280px returns to main content area.

### UX-004: No breadcrumbs on nested routes

**PROBLEM:** Nested routes (`/evidence/new`, `/evidence/:id/edit`) show no navigational context.
**EVIDENCE:** PageHeader.tsx accepts title/subtitle/actions but has no breadcrumb support. WorkRecordForm.tsx:98-99 shows "Upravit záznam" / "Evidence práce" — user cannot click to return to the evidence list (must use browser back or the "Zpět na seznam" ghost button).
**UX IMPACT:** Users lose orientation in nested flows. The "Zpět na seznam" button is easy to miss — it's a ghost button in the action slot, visually identical to secondary UI.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Add breadcrumbs prop to PageHeader. Display only on depth > 1 routes.

### UX-005: No filter reset capability

**PROBLEM:** Filter bars on EvidencePage and AuditLogPage have no "clear all" action.
**EVIDENCE:** EvidenceFilters.tsx and AuditLogPage.tsx lines 37-68 render filter controls but no reset mechanism. Users must manually reset each dropdown to "Vše" individually.
**UX IMPACT:** Filter state persists in component state. Users who set multiple filters must reset each one separately — tedious and error-prone.
**SEVERITY:** LOW
**RECOMMENDATION:** Add "Vyčistit filtry" ghost button, visible only when any filter is active.

### UX-006: Dashboard stat cards show no context for numbers

**PROBLEM:** Each StatsCard shows a bare number with a label. No trend, comparison, or context.
**EVIDENCE:** StatsCard.tsx accepts only `icon`, `label`, `value`, `gradient`, `delay`. No comparison data. DashboardPage.tsx:28-50 passes raw numbers. Value "0" for "Stroje v poruše" is ambiguous — good news (no breakdowns) or no data?
**UX IMPACT:** Numbers without context are noise. A manufacturing manager needs to know if "12 records today" is normal, high, or low. Without trends, the dashboard is just a number display, not an operational tool.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Add optional trend indicators (↑↓ %). If API doesn't return trend data, degrade gracefully — show just the number (current behavior).

---

## UI AUDIT

### UI-001: Glassmorphism-heavy design creates generic AI appearance

**PROBLEM:** The entire application is built around glassmorphism: transparent cards with backdrop-blur, gradient backgrounds, gradient text, gradient icon boxes. This creates a design that looks visually homogeneous and stylistically indistinguishable from a template or AI-generated output.
**EVIDENCE:**
- `globals.css:59-62`: `.glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); }`
- `globals.css:50-52`: `.bg-app-gradient { background: linear-gradient(135deg, #f0f4ff, #faf5ff, #f0fdf4); }`
- Sidebar.tsx:29: `bg-white/50 dark:bg-slate-900/70 backdrop-blur-2xl`
- GradientButton.tsx:19: `bg-gradient-to-r from-primary-500 to-violet-500`
- LoginPage.tsx:35-37: gradient text on "Evidence"
- StatsCard.tsx:16: gradient icon boxes
- EmptyState.tsx:6: gradient icon background
- The visual formula is: glass card + indigo-violet gradient + blur = every element
**UX IMPACT:** Manufacturing users need a system that conveys trust, reliability, and professionalism. The current design conveys "tech demo" or "template." Glassmorphism reduces readability when content behind the blur changes. On low-end factory terminals, backdrop-filter is GPU-intensive.
**SEVERITY:** HIGH
**RECOMMENDATION:** Redesign around solid, opaque surfaces with clear hierarchy. Use color purposefully for status, not decoration. Reserve subtle effects for specific interactive elements, not entire surfaces.

### UI-002: Indigo-violet gradient used for everything

**PROBLEM:** The same indigo-to-violet gradient is the brand color, button color, avatar color, active nav highlight, login header, sidebar header, and stat card accent.
**EVIDENCE:**
- Sidebar.tsx:37: `from-primary-500 to-violet-500` (brand text)
- Sidebar.tsx:48: `from-primary-500 to-violet-500` (avatar)
- GradientButton.tsx:19: `from-primary-500 to-violet-500` (buttons)
- SidebarNav.tsx:60: `from-primary-500/15` (active state)
- LoginPage.tsx:35: `from-primary-500 to-violet-500` (login header)
- StatsCard.tsx:16: four different gradients per card, but primary is indigo-violet
**UX IMPACT:** No visual hierarchy when everything shares the same color treatment. Buttons, brand, avatars, and navigation all blend together. Users cannot instantly identify the primary action on a page.
**SEVERITY:** HIGH
**RECOMMENDATION:** Define semantic color tokens. Use accent color sparingly — primary actions only. Brand identity through typography and layout, not gradient-on-everything.

### UI-003: Excessive border-radius (rounded-2xl and rounded-3xl everywhere)

**PROBLEM:** Nearly every surface uses `rounded-2xl` (16px) or `rounded-3xl` (24px).
**EVIDENCE:**
- GlassCard.tsx:13: `rounded-2xl`
- LoginPage.tsx:33: `rounded-3xl`
- ConfirmDialog.tsx:20: `rounded-3xl`
- GradientButton.tsx:16: `rounded-xl`
- SidebarNav.tsx:58: `rounded-xl`
- StatusBadge.tsx:21: `rounded-lg`
- Every input: `rounded-xl`
**UX IMPACT:** Excessive rounding reduces the distinction between cards, buttons, inputs, and modals. Everything feels soft and imprecise — not appropriate for data-dense manufacturing interface.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Reduce to a controlled radius scale: sm (4px inputs/badges), md (8px cards/buttons), lg (12px modals/special elements). No 24px radius.

### UI-004: Font not loaded — no Inter or JetBrains Mono import

**PROBLEM:** globals.css:15-16 specifies `'Inter'` and `'JetBrains Mono'` as fonts, but there is no font import anywhere — no `<link>`, no `@font-face`, no Google Fonts import.
**EVIDENCE:** No font import in `index.html`, `globals.css`, or any component. The font-family declaration falls back to `system-ui, -apple-system, sans-serif` on every system.
**UX IMPACT:** The typography choices listed in the theme are purely aspirational. Users see system fonts (Segoe UI on Windows, SF Pro on Mac). This means the typographic identity is accidental and platform-dependent.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Either import the chosen fonts properly (via `@font-face` with self-hosted woff2, or via font service) or intentionally choose a system font stack and remove the unused font names.

### UI-005: Staggered animations on every list item create slow page perception

**PROBLEM:** Every list, table row, and card uses staggered `animationDelay` (40-60ms per item) with 400ms fade-in-up animations.
**EVIDENCE:**
- SidebarNav.tsx:55: `animationDelay: ${i * 40}ms`
- EvidenceTable.tsx:44: `animationDelay: ${150 + i * 50}ms` — 20 records = 1150ms before last row appears
- UsersPage.tsx:63: `animationDelay: ${i * 30}ms`
- MachinesPage.tsx:32: `animationDelay: ${i * 40}ms`
- RecentRecords.tsx:25: `animationDelay: ${350 + i * 40}ms`
**UX IMPACT:** A table with 20 rows takes over a second to fully render visually. In a factory setting where workers check data quickly between tasks, this delay feels sluggish. The animation serves decoration, not orientation — there's no functional reason to reveal table rows one by one.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Remove per-item stagger. Use a single fade-in on the container, or no animation at all on data tables. Reserve subtle motion for meaningful state changes (page entry, modal open/close).

### UI-006: Inline SVGs in EvidenceTable action buttons — inconsistent with Icon system

**PROBLEM:** EvidenceTable.tsx and EvidenceCard.tsx use raw inline `<svg>` for action icons (edit, duplicate, delete) instead of the centralized `<Icon>` component.
**EVIDENCE:** EvidenceTable.tsx:83-104 contains three separate 5-line SVG blocks. EvidenceCard.tsx:67-78 duplicates two of them. Meanwhile, Icon.tsx defines `edit` and `trash` icons.
**UX IMPACT:** Inconsistent visual weight and styling between Icon-based and inline SVG icons. Maintenance burden — changes to icon style require updating multiple files.
**SEVERITY:** LOW
**RECOMMENDATION:** Replace inline SVGs with `<Icon name="edit">`, `<Icon name="copy">`, `<Icon name="trash">`.

### UI-007: Color as sole status indicator

**PROBLEM:** StatusBadge.tsx uses only color to distinguish statuses.
**EVIDENCE:** StatusBadge.tsx:4-17 maps 13 statuses to color classes. No icons, no shapes, no patterns differentiate them. "operational" (emerald) and "resolved" (emerald) share the same color. "maintenance" (amber) and "in_progress" (amber) also share.
**UX IMPACT:** Color-blind users (~8% of males in manufacturing) cannot distinguish statuses. Two different statuses sharing the same color creates semantic confusion even for users with normal vision.
**SEVERITY:** HIGH
**RECOMMENDATION:** Add a dot, icon, or text-only mode alongside color. Ensure each status has a unique visual treatment beyond hue.

---

## RESPONSIVE AUDIT

### RESP-001: Sidebar has no mini/icon-only mode

**PROBLEM:** The sidebar is either fully visible (220px, lg+) or completely hidden (mobile). No intermediate state.
**EVIDENCE:** Sidebar.tsx:27-34 uses binary `translate-x-0` / `-translate-x-full`. No collapsed/icon-only variant.
**UX IMPACT:** On laptop screens (1024-1280px), the 220px sidebar consumes 17-21% of viewport width. Users cannot reclaim this space. Combined with the RightPanel (on xl+), main content gets significantly compressed.
**SEVERITY:** LOW
**RECOMMENDATION:** Consider a collapsible sidebar that reduces to icon-only mode (48-64px). Lower priority than removing RightPanel.

### RESP-002: Tables hidden entirely on mobile — no alternative for some pages

**PROBLEM:** EvidencePage has both table and card views. But UsersPage, ShiftsPage, and AuditLogPage show only tables — no mobile alternative.
**EVIDENCE:** EvidenceTable.tsx is wrapped in `hidden md:block`. EvidenceCard exists for mobile. But UsersPage.tsx:48-79 renders a table without any mobile card alternative. Same for ShiftsPage, AuditLogPage.
**UX IMPACT:** Admin pages are barely usable on mobile devices. Table columns overflow or get cut off.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** For admin pages used primarily on desktop, add `overflow-x-auto` wrapper (already done in some). For Evidence-style high-traffic pages, maintain the dual table/card pattern.

---

## ACCESSIBILITY AUDIT

### A11Y-001: Toggle switch has no ARIA attributes

**PROBLEM:** ShiftsPage.tsx:51-56 renders a custom toggle switch using divs. No `role="switch"`, no `aria-checked`, no keyboard support.
**EVIDENCE:** The toggle is a `<button>` with visual-only state representation. It has no `role`, `aria-checked`, or `aria-label`.
**UX IMPACT:** Screen readers announce it as a generic button. Users cannot determine its current state without seeing the visual toggle position.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Add `role="switch"`, `aria-checked={shift.isActive}`, and descriptive `aria-label`.

### A11Y-002: ThemeToggle button has no accessible label text

**PROBLEM:** ThemeToggle renders only an SVG icon inside a button.
**EVIDENCE:** ThemeToggle.tsx renders `<button>` with only a sun/moon SVG. The `aria-label` comes only from the SVG `aria-label` on the Icon component, which may or may not be set.
**UX IMPACT:** Screen readers may announce "button" with no context.
**SEVERITY:** LOW
**RECOMMENDATION:** Add `aria-label="Přepnout tmavý režim"` to the button.

### A11Y-003: ConfirmDialog has no focus trap

**PROBLEM:** The confirmation modal opens but does not trap keyboard focus.
**EVIDENCE:** ConfirmDialog.tsx:17-28 renders a fixed overlay but has no `onKeyDown` handler for Escape, no focus trap logic, and no `role="dialog"` / `aria-modal="true"`.
**UX IMPACT:** Keyboard users can tab behind the modal into the main content. Focus is not returned to the trigger element on close.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Add `role="dialog"`, `aria-modal="true"`, Escape key handler, and auto-focus on the first interactive element.

### A11Y-004: Inputs lack autocomplete attributes

**PROBLEM:** LoginPage email and password inputs have no `autoComplete` attributes.
**EVIDENCE:** LoginPage.tsx:54-58 (email input), lines 70-74 (password input) — neither specifies `autoComplete`.
**UX IMPACT:** Password managers cannot properly identify and fill these fields.
**SEVERITY:** LOW
**RECOMMENDATION:** Add `autoComplete="email"` and `autoComplete="current-password"`.

---

## DESIGN SYSTEM AUDIT

### DS-001: No design tokens — colors are ad-hoc

**PROBLEM:** The application defines a primary palette in `@theme` (primary-50 through primary-900) but all other colors are referenced directly as Tailwind utilities (slate-400, rose-500, amber-100, etc.).
**EVIDENCE:** globals.css:3-14 defines only the primary palette. No semantic tokens (surface, text-primary, text-secondary, border, success, warning, error, info). StatusBadge.tsx:4-17 hardcodes 13 different color combinations. Each component independently chooses its text/bg colors.
**UX IMPACT:** Color usage is inconsistent across components. Changing the color scheme requires modifying dozens of files. Dark mode is implemented per-component with separate `dark:` classes, making theme coherence fragile.
**SEVERITY:** HIGH
**RECOMMENDATION:** Define semantic design tokens in `@theme`. Use tokens consistently across all components. Map light/dark themes through token values, not per-component overrides.

### DS-002: Duplicated styling patterns

**PROBLEM:** Several styling patterns are duplicated across files.
**EVIDENCE:**
- `selectClass` is defined identically in EvidenceFilters.tsx:11 and AuditLogPage.tsx:11-12
- Table header styling (`py-3 px-4 font-semibold text-slate-500 dark:text-slate-400`) is duplicated across UsersPage, ShiftsPage, AuditLogPage, EvidenceTable — 4 files
- The same `statusLabels` mapping exists in EvidenceTable.tsx:13-19 and EvidenceCard.tsx:14-20
**UX IMPACT:** Inconsistency risk when one instance is updated and others are not. Maintenance burden.
**SEVERITY:** LOW
**RECOMMENDATION:** Extract shared input components (SelectInput, DateInput). Move shared label maps to `@evidence/shared` or a constants file.

### DS-003: Only 6 shared components — most UI is per-page

**PROBLEM:** The design system contains only 6 shared components. Most UI patterns (tables, filter bars, form inputs, toggle switches) are implemented inline in each page.
**EVIDENCE:** `components/shared/` contains: GlassCard, GradientButton, StatusBadge, Icon, ConfirmDialog, EmptyState. But every table is hand-built HTML. Every form input is raw `<input>` with inline Tailwind classes. The toggle switch is a one-off in ShiftsPage.
**UX IMPACT:** No guarantee of consistency. A change to table styling requires editing 4+ files. New pages must reinvent table/form/filter patterns.
**SEVERITY:** MEDIUM
**RECOMMENDATION:** Not a Phase 1 priority — extract only when the pattern is used 3+ times and the abstraction is clear. Focus on SelectInput and form input styling first.

---

## SUMMARY: Severity Ranking

| # | Finding | Severity | Category |
|---|---------|----------|----------|
| UX-001 | No loading states | HIGH | UX |
| UI-001 | Glassmorphism creates generic AI look | HIGH | UI |
| UI-002 | Same gradient for everything | HIGH | UI |
| UI-007 | Color as sole status indicator | HIGH | A11y/UI |
| DS-001 | No design tokens | HIGH | Design System |
| UX-003 | RightPanel is empty placeholder | HIGH | UX |
| UX-002 | QuickActions duplicates sidebar | MEDIUM | UX |
| UX-004 | No breadcrumbs | MEDIUM | UX |
| UX-006 | Stat cards lack context | MEDIUM | UX |
| UI-003 | Excessive border-radius | MEDIUM | UI |
| UI-004 | Fonts not loaded | MEDIUM | UI |
| UI-005 | Staggered animations slow perception | MEDIUM | UI |
| RESP-002 | Tables-only on mobile for admin | MEDIUM | Responsive |
| A11Y-001 | Toggle has no ARIA | MEDIUM | A11y |
| A11Y-003 | ConfirmDialog no focus trap | MEDIUM | A11y |
| DS-003 | Only 6 shared components | MEDIUM | Design System |
| UX-005 | No filter reset | LOW | UX |
| UI-006 | Inline SVGs vs Icon system | LOW | UI |
| RESP-001 | No sidebar mini mode | LOW | Responsive |
| A11Y-002 | ThemeToggle no label | LOW | A11y |
| A11Y-004 | No autocomplete on login | LOW | A11y |
| DS-002 | Duplicated patterns | LOW | Design System |

**HIGH findings: 5** — all relate to visual identity, semantic design, and loading states
**MEDIUM findings: 11** — UX polish, accessibility, responsive gaps
**LOW findings: 6** — consistency and minor improvements
