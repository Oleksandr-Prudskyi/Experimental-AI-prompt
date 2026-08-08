# Evidence Frontend Redesign — Full Website

**Date:** 2026-08-08
**Approach:** Evolutionary — keep glassmorphism identity, Tailwind v4, existing tech stack
**Scope:** Frontend only — no backend, API, database, or auth changes

## Constraints

- No new npm dependencies (all changes use existing: React 19, Tailwind v4, Zustand 5, TanStack Query 5, React Hook Form 7, Zod, Axios)
- API response shapes stay the same — frontend adapts with graceful fallbacks
- Czech UI strings stay hardcoded (no i18n migration)
- All existing routes preserved, no URL changes

---

## 1. Layout System

### 1.1 AppLayout (`components/layout/AppLayout.tsx`)

**Current:** 3-column flex: Sidebar (220px) | Main (flex-1, max-w-6xl) | RightPanel (280px)
**Change:** Remove RightPanel. Main content gets full width on xl+. Sidebar unchanged structurally.

```
Before:  [Sidebar 220px] [Main max-6xl] [RightPanel 280px]
After:   [Sidebar 220px] [Main max-7xl, centered]
```

- Remove `<RightPanel />` import and render
- Bump `max-w-6xl` to `max-w-7xl` for wider content area

### 1.2 RightPanel (`components/layout/RightPanel.tsx`)

**Delete this file.** The 280px placeholder added no value and stole horizontal space.

### 1.3 Sidebar (`components/layout/Sidebar.tsx`)

**Current footer:** User avatar + name + role + ThemeToggle + logout button — all crammed in.
**Change:** Compact user row that opens a popup menu upward on click.

Footer redesign:
- Single row: gradient avatar circle (32px) + truncated name + chevron-up icon
- Click opens a popup (positioned above, inside sidebar bounds):
  - Role badge (StatusBadge)
  - ThemeToggle row ("Tmavý režim" + toggle)
  - Divider
  - "Odhlásit se" button with logout icon
- Popup closes on click-outside or Escape
- Remove inline ThemeToggle and logout button from footer

### 1.4 SidebarNav (`components/layout/SidebarNav.tsx`)

**Current:** Two flat sections (Hlavní, Správa), all items always visible.
**Change:** Admin section ("Správa") becomes collapsible.

- Section header "Správa" gets a chevron icon that rotates on toggle
- Collapsed state stored in localStorage (`evidence-nav-collapsed`)
- Items animate with max-height + opacity transition (300ms)
- "Hlavní" section stays always open (no toggle)
- Persist collapse state across page reloads

### 1.5 PageHeader (`components/layout/PageHeader.tsx`)

**Current:** Title + subtitle + hamburger + actions slot.
**Change:** Add breadcrumbs above title. No search input (YAGNI — only 10 routes).

- New prop: `breadcrumbs?: { label: string; path?: string }[]`
- Breadcrumbs render above the title row, small text (text-xs), slate-400 color
- Each segment except last is a `<Link>` (react-router-dom)
- Segments separated by "/"
- On pages with depth 1 (Dashboard, Evidence list, Machines): no breadcrumbs prop passed
- On nested pages (WorkRecordForm, edit): parent passes breadcrumbs array

No separate Breadcrumbs component — inline in PageHeader to keep it simple.

### 1.6 ThemeToggle (`components/layout/ThemeToggle.tsx`)

**No changes.** Moves from sidebar footer into the user popup menu.

---

## 2. Dashboard (`pages/dashboard/`)

### 2.1 DashboardPage

**Current:** PageHeader + 4 StatsCards + RecentRecords (2/3) + QuickActions (1/3)
**Change:** PageHeader + 4 StatsCards (with trends) + RecentRecords (2/3) + CategoryBreakdown (1/3)

- QuickActions removed (duplicates sidebar navigation)
- CategoryBreakdown replaces it — shows record distribution by category
- Stats refetch interval stays 30s
- Add loading skeleton when `isLoading` is true

### 2.2 StatsCard (`pages/dashboard/components/StatsCard.tsx`)

**Current:** Gradient icon + big number + label
**Change:** Add optional trend indicator below the value.

New props:
- `trend?: number` — percentage change (positive = up, negative = down)
- `trendLabel?: string` — comparison label ("vs. včera")

Rendering:
- If `trend` is provided and nonzero: show "↑ 12%" in emerald or "↓ 5%" in rose, below the value
- If `trend` is 0 or undefined: show nothing (graceful fallback)
- `trendLabel` renders as text-xs slate-400 next to the arrow
- Trend data comes from API — if API doesn't return it, StatsCard renders without it

### 2.3 CategoryBreakdown (`pages/dashboard/components/CategoryBreakdown.tsx`)

**New component** replacing QuickActions.

- GlassCard container with title "Rozdělení podle kategorií"
- Horizontal bar chart (pure CSS, no SVG or chart library):
  - Each category = one row: label (left), bar (middle, colored), count (right)
  - Bar width = percentage of total, uses category-specific colors
  - Colors: seřízení=indigo, údržba=amber, porucha=rose, kontrola=sky, jiné=slate
- Data: `stats.categoryBreakdown` array of `{ category, count }` from API response
- If API does not return `categoryBreakdown`: compute client-side from `stats.recentRecords` by grouping on `record.category`
- Fallback if both empty: show "Žádná data" text
- Max 6 bars, sorted by count descending

### 2.4 RecentRecords (`pages/dashboard/components/RecentRecords.tsx`)

**Minimal changes:**
- Add `EmptyState` import for zero-records case (currently just text)
- No structural changes — component works well

### 2.5 Dashboard Skeleton

When `isLoading === true`, show:
- 4 skeleton stat cards (gradient icon placeholder + shimmer text lines)
- Skeleton recent records (5 shimmer rows)
- Skeleton category breakdown (4 shimmer bars)

Uses new `Skeleton` shared component.

---

## 3. Login Page (`pages/auth/LoginPage.tsx`)

**Current:** Centered glass card with logo, email/password fields, submit button.
**Changes — polish only:**

- Add subtle animated gradient border on the card (CSS `background: conic-gradient(...)` behind the glass card via a wrapper div with padding-1 and rounded-3xl, overflow hidden)
- Better disabled state on submit: show spinner SVG instead of text change
- Error message: add Icon "warning" before text
- Add `autoComplete="email"` and `autoComplete="current-password"` on inputs
- Focus first input on mount via `autoFocus`

No "remember me" checkbox — auth uses HTTP-only refresh cookies already.

---

## 4. Evidence Pages (`pages/evidence/`)

### 4.1 EvidencePage

**Current:** PageHeader + filters + table/cards + pagination. Works well.
**Changes:**

- Add loading skeleton (table skeleton with shimmer rows) when `isLoading && records.length === 0`
- Filters card: add "Vyčistit filtry" ghost button when any filter is active
- Count badge in subtitle: use `data?.meta?.total` if available, fallback to `records.length`

### 4.2 EvidenceFilters

**Changes:**
- Add clear filters button: `GradientButton variant="ghost" size="sm"` that resets all filters to `{}`
- Show only when at least one filter has a value

### 4.3 EvidenceTable

**Changes:**
- Replace inline SVG icons (edit, duplicate, delete) in action buttons with `<Icon>` component
- Add new icons to Icon.tsx: `copy` (for duplicate)
- Consistent icon button styling: extract to a pattern (rounded-lg p-1.5 hover states)

### 4.4 EvidenceCard

**Changes:**
- Same as EvidenceTable: replace inline SVGs with `<Icon>` component

### 4.5 WorkRecordForm

**Changes:**
- Add breadcrumbs via PageHeader: `[{ label: 'Evidence práce', path: '/evidence' }, { label: isEdit ? 'Upravit' : 'Nový záznam' }]`
- Add loading skeleton when `isEdit && !existingRecord` (editing mode, data not yet loaded)
- Error state: show toast-like error at top with Icon "warning" instead of plain red text at bottom
- Form validation errors: add shake animation (new `animate-shake` keyframe)

---

## 5. Machines Page (`pages/machines/MachinesPage.tsx`)

**Current:** Grid of GlassCards with name, code, status, line info.
**Changes:**

- Add loading skeleton (grid of 6 shimmer cards) when data is loading
- Add machine count by status in subtitle: "12 strojů · 10 v provozu · 1 údržba · 1 porucha"
- Add simple status filter: row of clickable status badges above the grid
  - "Vše" (default), "V provozu", "Údržba", "Porucha", "Vyřazeno"
  - Client-side filtering only (no API call)
  - Active filter gets highlighted ring

---

## 6. Admin Pages

### 6.1 UsersPage (`pages/admin/UsersPage.tsx`)

**Changes:**
- Add breadcrumbs: `[{ label: 'Správa' }, { label: 'Uživatelé' }]` (first segment not clickable — no single "admin" page)
- Add loading skeleton for table
- Replace inline action button text ("Upravit", "Smazat") with Icon buttons (`edit`, `trash`) with tooltips via `title` attribute

### 6.2 WorkshopsPage (`pages/admin/WorkshopsPage.tsx`)

**Changes:**
- Add breadcrumbs: `[{ label: 'Správa' }, { label: 'Dílny / Týmy' }]`
- Add loading skeleton
- Add "Nová dílna" placeholder button in PageHeader actions (button only — form dialog is a separate task, button shows alert "Bude doplněno")

### 6.3 ShiftsPage (`pages/admin/ShiftsPage.tsx`)

**Changes:**
- Add breadcrumbs: `[{ label: 'Správa' }, { label: 'Směny' }]`
- Add loading skeleton
- Toggle switch: add accessible `role="switch"` and `aria-checked` attributes

### 6.4 AuditLogPage (`pages/admin/AuditLogPage.tsx`)

**Changes:**
- Add breadcrumbs: `[{ label: 'Správa' }, { label: 'Audit log' }]`
- Add loading skeleton
- Extract `selectClass` constant to a shared utility or component (duplicated between AuditLogPage and EvidenceFilters)
- Add "Vyčistit filtry" button like EvidenceFilters

### 6.5 TrashPage (`pages/admin/TrashPage.tsx`)

**Changes:**
- Add breadcrumbs: `[{ label: 'Správa' }, { label: 'Koš' }]`
- Add loading skeleton
- No structural changes — component is well-built

---

## 7. Shared Components

### 7.1 NEW: Skeleton (`components/shared/Skeleton.tsx`)

Shimmer placeholder component for loading states.

Props:
- `variant: 'text' | 'card' | 'circle' | 'bar'`
- `width?: string` (CSS width, default '100%')
- `height?: string` (CSS height, default varies by variant)
- `className?: string`

Rendering:
- Rounded div with glassmorphism-like bg (`bg-slate-200/50 dark:bg-slate-700/30`)
- `animate-shimmer` animation (already defined in globals.css)
- Background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)` with `background-size: 200%`

Variant defaults:
- `text`: h-4, rounded-lg, full width
- `card`: h-32, rounded-2xl, full width
- `circle`: w-10 h-10, rounded-full
- `bar`: h-6, rounded-lg, width varies

### 7.2 NEW: SelectInput (`components/shared/SelectInput.tsx`)

Extract the repeated `selectClass` styling from EvidenceFilters and AuditLogPage into a reusable component.

Props:
- `label?: string`
- `value: string`
- `onChange: (value: string) => void`
- `options: { value: string; label: string }[]`
- `placeholder?: string` (default empty option label)

Renders:
- Label (text-xs font-medium) + styled select using the existing selectClass pattern
- Replaces raw `<select>` + `<label>` combos across filters

### 7.3 NEW: DateInput (`components/shared/DateInput.tsx`)

Same extraction for `<input type="date">` with label, using the same styling pattern.

### 7.4 Icon (`components/shared/Icon.tsx`)

**Add new icons:**
- `chevron-down`: for collapsible sidebar sections
- `chevron-up`: for user menu popup trigger
- `copy`: for duplicate action (replaces inline SVG in EvidenceTable/Card)
- `trend-up`: upward arrow for positive trends in StatsCard
- `trend-down`: downward arrow for negative trends in StatsCard
- `settings`: gear icon for user menu
- `spinner`: circular spinner for loading states on buttons

Total: 7 new icons, bringing Icon.tsx from 25 to 32 icons.

### 7.5 GlassCard — no changes
### 7.6 GradientButton — no changes
### 7.7 StatusBadge — no changes
### 7.8 ConfirmDialog — no changes
### 7.9 EmptyState — no changes

---

## 8. Styles (`styles/globals.css`)

**Add new animations:**

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
```

Add to `@theme`:
```
--animate-shake: shake 400ms ease;
```

**Update shimmer animation** to work as a background on skeleton elements:
The existing `shimmer` keyframe works — just ensure Skeleton component uses proper `background-size: 200% 100%`.

---

## 9. Stores

### 9.1 sidebar.store.ts

**Add field:** `adminCollapsed: boolean` with `toggleAdmin()` method.
Persist to localStorage key `evidence-nav-collapsed`.

No other store changes.

---

## 10. File Change Summary

### Files to DELETE (1):
- `components/layout/RightPanel.tsx`

### Files to CREATE (4):
- `components/shared/Skeleton.tsx`
- `components/shared/SelectInput.tsx`
- `components/shared/DateInput.tsx`
- `pages/dashboard/components/CategoryBreakdown.tsx`

### Files to REPLACE (1):
- `pages/dashboard/components/QuickActions.tsx` → replaced by `CategoryBreakdown.tsx`

### Files to MODIFY (19):
- `components/layout/AppLayout.tsx` — remove RightPanel, widen max-w
- `components/layout/Sidebar.tsx` — user menu popup footer
- `components/layout/SidebarNav.tsx` — collapsible admin section
- `components/layout/PageHeader.tsx` — breadcrumbs support
- `components/shared/Icon.tsx` — 8 new icons
- `stores/sidebar.store.ts` — adminCollapsed field
- `styles/globals.css` — shake animation
- `pages/auth/LoginPage.tsx` — gradient border, autoFocus, spinner
- `pages/dashboard/DashboardPage.tsx` — loading skeleton, CategoryBreakdown
- `pages/dashboard/components/StatsCard.tsx` — trend indicator
- `pages/dashboard/components/RecentRecords.tsx` — minor EmptyState
- `pages/evidence/EvidencePage.tsx` — loading skeleton
- `pages/evidence/components/EvidenceFilters.tsx` — clear filters button, use SelectInput
- `pages/evidence/components/EvidenceTable.tsx` — Icon components for actions
- `pages/evidence/components/EvidenceCard.tsx` — Icon components for actions
- `pages/evidence/forms/WorkRecordForm.tsx` — breadcrumbs, loading, error UX
- `pages/machines/MachinesPage.tsx` — status filter, loading skeleton, subtitle
- `pages/admin/UsersPage.tsx` — breadcrumbs, skeleton, icon actions
- `pages/admin/WorkshopsPage.tsx` — breadcrumbs, skeleton
- `pages/admin/ShiftsPage.tsx` — breadcrumbs, skeleton, a11y
- `pages/admin/AuditLogPage.tsx` — breadcrumbs, skeleton, clear filters
- `pages/admin/TrashPage.tsx` — breadcrumbs, skeleton

### Total: 2 deleted, 4 created, 19+ modified

---

## 11. What Is NOT In Scope

- No new npm packages
- No backend/API/database changes
- No new routes or route restructuring
- No i18n/localization changes
- No auth flow changes
- No WorkRecordForm section components (BasicInfoSection, DescriptionSection, DowntimeSection) — they stay as-is
- No UserFormDialog changes
