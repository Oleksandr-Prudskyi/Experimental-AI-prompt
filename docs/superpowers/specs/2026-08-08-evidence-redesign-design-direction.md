# Evidence — Phase 3+4: Design Direction & Implementation Plan

**Date:** 2026-08-08
**Chosen Direction:** Hybrid A+B — Industrial Utility + Contemporary Data Product
**Scope:** Frontend only — no backend, API, database, or auth changes
**Constraints:** No new npm dependencies. No URL changes. Czech UI stays hardcoded.

---

## DESIGN DIRECTION: Hybrid A+B

### Philosophy

Tool, not decoration. Every pixel earns its space. The interface disappears into the workflow. But surfaces feel polished and considered — not raw. Industrial density meets contemporary quality.

### Visual Character

Dense, confident, clean. High contrast text. Flat surfaces with subtle ring borders. Consistent spacing. Looks like a well-engineered tool that someone cared about.

### Color System

**Light mode:**
- Background: `#f8f9fa` (near-white warm gray)
- Surface: `#ffffff` (white cards)
- Border: `#e2e8f0` (slate-200)
- Text primary: `#0f172a` (slate-900)
- Text secondary: `#64748b` (slate-500)
- Text muted: `#94a3b8` (slate-400)

**Dark mode:**
- Background: `#0f1117` (near-black)
- Surface: `#1a1d27` (dark card)
- Border: `#2a2d3a` (subtle border)
- Text primary: `#f1f5f9` (slate-100)
- Text secondary: `#94a3b8` (slate-400)
- Text muted: `#64748b` (slate-500)

**Accent:** `#3b82f6` (blue-500) — single accent for primary actions.
**Semantic only:**
- Success: `#10b981` (emerald-500)
- Warning: `#f59e0b` (amber-500)
- Error: `#ef4444` (red-500)
- Info: `#3b82f6` (blue-500)

**No gradients on surfaces, buttons, or backgrounds.** Gradients removed everywhere.

### Typography

System font stack: `system-ui, -apple-system, 'Segoe UI', sans-serif`. No Inter download — fastest possible paint.
Monospace stays: `ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace`.
Tabular nums on all numeric data.

### Spacing

4px base grid. Compact but breathable:
- Card inner padding: 16px (p-4)
- Between cards: 12-16px (gap-3 to gap-4)
- Section gaps: 20-24px (gap-5 to gap-6)
- Page margins: 16-24px (existing responsive p-4 md:p-6)

### Borders & Radius

- 1px solid borders, `slate-200` light / custom dark border
- Radius: 6px (inputs, badges, buttons) = `rounded-md`
- Radius: 8px (cards, modals) = `rounded-lg`
- No `rounded-2xl` or `rounded-3xl` anywhere. Max is `rounded-xl` (12px) on modals only.

### Shadows

- Cards: no box-shadow. Use `ring-1 ring-slate-200 dark:ring-slate-700/50` instead.
- Modals/dropdowns: subtle `shadow-lg` only.
- No glassmorphism. No `backdrop-blur`. No `bg-white/50`.

### Buttons

Solid fill, no gradient:
- Primary: `bg-blue-600 hover:bg-blue-700 text-white`
- Danger: `bg-red-600 hover:bg-red-700 text-white`
- Ghost: `text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800`
- No scale transforms on hover. Simple bg color change. `transition-colors duration-150`.

### Status Badges

Dot + text pattern for accessibility (not color-only):
- Colored dot (6px circle) + text label
- Background tint stays for visual grouping
- Adds icon-level reinforcement for colorblind users

### Cards

Solid background + ring border. No glass effect:
- Light: `bg-white ring-1 ring-slate-200`
- Dark: `bg-slate-800/80 ring-1 ring-slate-700/50`
- No hover lift. Optional subtle `hover:ring-slate-300` on interactive cards.

### Motion

- 150ms transitions for hover/focus (faster than current 300ms)
- Page entry: single fade-in on main content container (not per-item stagger)
- No per-card stagger animations (remove animationDelay patterns)
- Modal: 150ms fade + scale
- Respect user animations preference

### Icons

Keep existing 25+ inline SVG icon system. Add needed icons:
- `chevron-down`, `chevron-up` for collapsible sections
- `copy` for duplicate action
- `spinner` for loading on buttons

### Mobile

- Keep slide-out sidebar pattern (improved styling)
- Bottom sticky action bar on forms
- 44px minimum touch targets
- Card views for data (existing pattern, kept)

---

## IMPLEMENTATION PLAN

### Guiding Principles

1. **Foundation first** — design tokens and globals before any component
2. **Inside-out** — shared components before page-specific ones
3. **One file at a time** — each step produces a working state
4. **No regressions** — verify after each major step
5. **Delete before create** — remove old patterns before adding new ones

### Protected Files (DO NOT MODIFY)

- `apps/web/src/api/client.ts`
- `apps/api/src/main.ts`
- `apps/api/src/modules/auth/auth.controller.ts` (lines 33-38, 57-62)
- `apps/web/dist/.vercel/`
- `apps/web/dist/vercel.json`

---

### STEP 1: Design Tokens & Global Styles

**File:** `apps/web/src/styles/globals.css`

Changes:
1. Replace `@theme` color palette — remove indigo primary-50..900, add:
   - `--color-accent-500: #3b82f6` (blue)
   - `--color-accent-600: #2563eb`
   - `--color-accent-700: #1d4ed8`
   - `--color-surface-dark: #1a1d27`
   - `--color-surface-dark-border: #2a2d3a`
2. Replace font-sans: remove Inter, use `system-ui, -apple-system, 'Segoe UI', sans-serif`
3. Replace `.bg-app-gradient` — flat solid backgrounds:
   - Light: `background: #f8f9fa`
   - Dark: `background: #0f1117`
4. Replace `.glass-card` — solid card:
   - Light: `background: #fff; border: 1px solid #e2e8f0` (via ring)
   - Dark: `background: rgba(26, 29, 39, 0.8); border: 1px solid #2a2d3a`
   - Remove `backdrop-filter: blur(...)`
5. Keep all keyframe animations but reduce durations: fade-in 250ms, fade-in-up 250ms, scale-in 200ms
6. Add shake keyframe for form validation

**Verification:** App loads without visual breaks. Background is flat. Cards are solid.

---

### STEP 2: Shared Components — Cards & Buttons

**File:** `apps/web/src/components/shared/GlassCard.tsx`
- Rename internally to just "Card" behavior but keep filename to avoid mass import changes
- Remove `glass-card` class usage, replace with: `bg-white ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700/50`
- Remove hover lift (`hover:-translate-y-0.5`), replace with `hover:ring-slate-300 dark:hover:ring-slate-600`
- Remove `shadow-[0_4px_24px...]` — no shadows on cards
- Change `rounded-2xl` to `rounded-lg`
- Reduce `transition-all duration-300` to `transition-colors duration-150`

**File:** `apps/web/src/components/shared/GradientButton.tsx`
- Remove all `bg-gradient-to-r` patterns
- Primary: `bg-blue-600 hover:bg-blue-700 text-white shadow-sm`
- Danger: `bg-red-600 hover:bg-red-700 text-white shadow-sm`
- Ghost: `text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`
- Remove `hover:scale-[1.02] active:scale-[0.98]` — just color transitions
- Remove `shadow-md shadow-primary-500/25` — simple `shadow-sm` on solid buttons
- Change `rounded-xl` to `rounded-md`
- Reduce `transition-all duration-300` to `transition-colors duration-150`

**File:** `apps/web/src/components/shared/StatusBadge.tsx`
- Add dot indicator: prepend `<span className="w-1.5 h-1.5 rounded-full bg-current" />` before label text
- Wrap in flex with gap-1.5
- Change `rounded-lg` to `rounded-md`
- Keep existing color variants (they're well-structured)

**File:** `apps/web/src/components/shared/EmptyState.tsx`
- Remove gradient icon box: `bg-gradient-to-br from-primary-100...`
- Replace with: `bg-slate-100 dark:bg-slate-800 text-slate-400`
- Change `rounded-2xl` to `rounded-lg`

**File:** `apps/web/src/components/shared/ConfirmDialog.tsx`
- Remove `glass-card`, `backdrop-blur-2xl`, `bg-white/85`
- Replace with: `bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700`
- Change `rounded-3xl` to `rounded-xl`
- Backdrop: keep `bg-black/20` but remove `backdrop-blur-sm` → just `bg-black/40`
- Add `role="dialog"` and `aria-modal="true"`

**Verification:** All existing buttons, cards, badges render with new flat styling. No gradients visible.

---

### STEP 3: Layout — AppLayout, Sidebar, PageHeader

**File:** `apps/web/src/components/layout/AppLayout.tsx`
- Remove `<RightPanel />` import and render
- Change `max-w-6xl` to `max-w-7xl`
- Change `bg-app-gradient` (already flat from Step 1)

**File:** `apps/web/src/components/layout/RightPanel.tsx`
- DELETE this file

**File:** `apps/web/src/components/layout/Sidebar.tsx`
- Remove glassmorphism: `bg-white/50 dark:bg-slate-900/70 backdrop-blur-2xl`
- Replace with: `bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`
- Logo: remove `bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent`
- Replace with: `text-blue-600 dark:text-blue-400 font-bold`
- User avatar: remove gradient, use `bg-blue-600 text-white`
- Footer: add user menu popup (click to open upward):
  - Role badge, theme toggle row, divider, logout button
  - Popup: `bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg shadow-lg`
  - Close on click-outside or Escape
- Mobile overlay: keep `bg-black/20` but remove `backdrop-blur-sm`

**File:** `apps/web/src/components/layout/SidebarNav.tsx`
- Remove active state gradient: `bg-gradient-to-r from-primary-500/15 to-transparent`
- Replace with: `bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400`
- Change inactive hover: `hover:bg-slate-100 dark:hover:bg-slate-800`
- Change `rounded-xl` to `rounded-md`
- Reduce `transition-all duration-300` to `transition-colors duration-150`
- Remove per-item `animationDelay` stagger — just show items
- Make "Správa" section collapsible with chevron toggle, persisted in localStorage

**File:** `apps/web/src/components/layout/PageHeader.tsx`
- Add optional `breadcrumbs` prop: `{ label: string; path?: string }[]`
- Render breadcrumbs above title in small text
- Replace inline hamburger SVG with `<Icon name="menu" />`
- Change hover styling to match new system

**File:** `apps/web/src/components/layout/ThemeToggle.tsx`
- No changes to logic. Moves into user popup menu.

**File:** `apps/web/src/stores/sidebar.store.ts`
- Add `adminCollapsed: boolean` and `toggleAdmin()` method
- Persist to localStorage key `evidence-nav-collapsed`

**Verification:** Layout is solid backgrounds. Sidebar has flat styling. RightPanel gone. Main content wider.

---

### STEP 4: New Shared Component — Skeleton

**File:** `apps/web/src/components/shared/Skeleton.tsx` (NEW)

```
Props: variant ('text' | 'card' | 'circle' | 'bar'), width?, height?, className?
```

- Uses `animate-shimmer` from globals.css
- Light bg: `bg-slate-200/60` / Dark: `bg-slate-700/40`
- Background gradient for shimmer effect
- Variant sizing:
  - text: h-4 rounded-md full width
  - card: h-32 rounded-lg full width
  - circle: w-10 h-10 rounded-full
  - bar: h-6 rounded-md

---

### STEP 5: Icon Additions

**File:** `apps/web/src/components/shared/Icon.tsx`

Add new icons:
- `chevron-down`: rotated chevron for collapsible sections
- `chevron-up`: for user menu trigger
- `copy`: duplicate action icon
- `spinner`: rotating loader for button states

Total: 4 new icons (29 total).

---

### STEP 6: Login Page

**File:** `apps/web/src/pages/auth/LoginPage.tsx`
- Remove `bg-app-gradient` (flat from globals)
- Remove `glass-card rounded-3xl` on form card
- Replace with: `bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl`
- Logo: solid blue text, no gradient
- Submit button: solid `bg-blue-600`, no gradient
- Input styling: `rounded-md` instead of `rounded-xl`, remove `bg-white/50`
- Replace with: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700`
- Add `autoComplete="email"` and `autoComplete="current-password"`
- Add `autoFocus` on email input
- Add spinner icon on submit when `isSubmitting`
- Add Icon "warning" before error message

**Verification:** Login page renders flat, no gradients, no glass effect. Form inputs match new system.

---

### STEP 7: Dashboard

**File:** `apps/web/src/pages/dashboard/DashboardPage.tsx`
- Add `isLoading` from useQuery
- Show Skeleton grid when loading
- Replace QuickActions with CategoryBreakdown
- Remove stagger animations from stat card grid

**File:** `apps/web/src/pages/dashboard/components/StatsCard.tsx`
- Remove gradient icon box: `bg-gradient-to-r ${gradient}`
- Replace with: semantic solid colors per stat type (passed as `color` prop instead of `gradient`)
  - Blue for records, amber for downtime, red for breakdowns, emerald for open
- Change icon box: `rounded-lg` instead of `rounded-2xl`
- Add optional `trend` prop with up/down indicator
- Remove per-card `animationDelay`

**File:** `apps/web/src/pages/dashboard/components/QuickActions.tsx`
- DELETE this file (replaced by CategoryBreakdown)

**File:** `apps/web/src/pages/dashboard/components/CategoryBreakdown.tsx` (NEW)
- GlassCard (now solid card) with title "Rozdělení podle kategorií"
- Horizontal bar chart in pure CSS
- Data from `stats.categoryBreakdown` or computed from `stats.recentRecords`
- Colors: category-specific solid colors (no gradients)

**File:** `apps/web/src/pages/dashboard/components/RecentRecords.tsx`
- Add EmptyState for zero records case
- No structural changes needed

**Verification:** Dashboard shows flat stat cards, loading skeleton, category breakdown instead of quick actions.

---

### STEP 8: Evidence Pages

**File:** `apps/web/src/pages/evidence/EvidencePage.tsx`
- Add loading skeleton when `isLoading && records.length === 0`
- Add count from `data?.meta?.total` if available

**File:** `apps/web/src/pages/evidence/components/EvidenceFilters.tsx`
- Add "Vyčistit filtry" ghost button when any filter is active
- Restyle selects: `rounded-md`, solid borders, no glass

**File:** `apps/web/src/pages/evidence/components/EvidenceTable.tsx`
- Replace inline SVG action icons with `<Icon>` component
- Add alternating row tints: `even:bg-slate-50 dark:even:bg-slate-800/30`

**File:** `apps/web/src/pages/evidence/components/EvidenceCard.tsx`
- Replace inline SVGs with `<Icon>` component

**File:** `apps/web/src/pages/evidence/forms/WorkRecordForm.tsx`
- Add breadcrumbs via PageHeader
- Add loading skeleton for edit mode
- Better error display with Icon "warning"

**Verification:** Evidence list, filters, table, cards all use new flat styling.

---

### STEP 9: Machines Page

**File:** `apps/web/src/pages/machines/MachinesPage.tsx`
- Add loading skeleton (grid of 6 shimmer cards)
- Add status filter row above grid (client-side filtering)
- Add machine count by status in subtitle

**Verification:** Machines page has status filter, loading state, flat cards.

---

### STEP 10: Admin Pages

Apply to each admin page:
- Breadcrumbs via PageHeader
- Loading skeleton
- Flat card/table styling (inherited from shared components)

**Files:**
- `apps/web/src/pages/admin/UsersPage.tsx` — breadcrumbs, skeleton, icon action buttons
- `apps/web/src/pages/admin/WorkshopsPage.tsx` — breadcrumbs, skeleton
- `apps/web/src/pages/admin/ShiftsPage.tsx` — breadcrumbs, skeleton, `role="switch"` + `aria-checked`
- `apps/web/src/pages/admin/AuditLogPage.tsx` — breadcrumbs, skeleton, clear filters button
- `apps/web/src/pages/admin/TrashPage.tsx` — breadcrumbs, skeleton

**Verification:** All admin pages have breadcrumbs, loading states, consistent styling.

---

## FILE CHANGE SUMMARY

### DELETE (2):
- `components/layout/RightPanel.tsx`
- `pages/dashboard/components/QuickActions.tsx`

### CREATE (2):
- `components/shared/Skeleton.tsx`
- `pages/dashboard/components/CategoryBreakdown.tsx`

### MODIFY (22):
- `styles/globals.css` — tokens, animations, remove glass/gradient classes
- `components/shared/GlassCard.tsx` — solid card, ring border
- `components/shared/GradientButton.tsx` — solid buttons, no gradient
- `components/shared/StatusBadge.tsx` — add dot indicator
- `components/shared/EmptyState.tsx` — flat icon box
- `components/shared/ConfirmDialog.tsx` — solid modal, a11y attrs
- `components/shared/Icon.tsx` — 4 new icons
- `components/layout/AppLayout.tsx` — remove RightPanel, widen max-w
- `components/layout/Sidebar.tsx` — flat sidebar, user popup menu
- `components/layout/SidebarNav.tsx` — flat nav, collapsible admin
- `components/layout/PageHeader.tsx` — breadcrumbs, Icon for hamburger
- `stores/sidebar.store.ts` — adminCollapsed field
- `pages/auth/LoginPage.tsx` — flat login, autoComplete, spinner
- `pages/dashboard/DashboardPage.tsx` — skeleton, CategoryBreakdown
- `pages/dashboard/components/StatsCard.tsx` — solid icon, trend
- `pages/dashboard/components/RecentRecords.tsx` — EmptyState
- `pages/evidence/EvidencePage.tsx` — skeleton
- `pages/evidence/components/EvidenceFilters.tsx` — clear button, restyle
- `pages/evidence/components/EvidenceTable.tsx` — Icon actions, row tints
- `pages/evidence/components/EvidenceCard.tsx` — Icon actions
- `pages/evidence/forms/WorkRecordForm.tsx` — breadcrumbs, skeleton, errors
- `pages/machines/MachinesPage.tsx` — status filter, skeleton
- `pages/admin/UsersPage.tsx` — breadcrumbs, skeleton, icon actions
- `pages/admin/WorkshopsPage.tsx` — breadcrumbs, skeleton
- `pages/admin/ShiftsPage.tsx` — breadcrumbs, skeleton, a11y
- `pages/admin/AuditLogPage.tsx` — breadcrumbs, skeleton, clear filters
- `pages/admin/TrashPage.tsx` — breadcrumbs, skeleton

### TOTAL: 2 deleted, 2 created, 22+ modified

---

## WHAT IS NOT IN SCOPE

- No new npm packages
- No backend/API/database changes
- No new routes or route restructuring
- No i18n/localization changes
- No auth flow changes
- No form section components (BasicInfoSection, DescriptionSection, DowntimeSection)
- No UserFormDialog changes
- No `apps/web/src/api/client.ts` changes
