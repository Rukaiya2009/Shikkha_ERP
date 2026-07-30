# ShikkhaERP frontend — Phase 1

## Run it
```bash
npm install      # framer-motion + recharts are already in package.json
npm run dev      # http://localhost:5173
```

## What changed

### Sidebar — navy rail, three switchable layouts
`src/layouts/Sidebars.tsx` exports three variants over the same nav data:

| Variant | Width | Best for |
|---|---|---|
| `grouped` (default) | 264px | Platform console — 31 screens across 8 groups |
| `profile` | 256px | School-side roles — account card on top, flat list |
| `compact` | 72px → 248px on hover | Maximum canvas |

Switch live from the **layout icon in the header** — the choice persists in
`localStorage` under `shikkha.sidebarVariant`. To change the shipped default,
edit `SIDEBAR_DEFAULT` in that file.

Colours are in `tailwind.config.js` under `rail.*`, sampled from the marketing
hero and the reference design: rail `#0B1B2E → #08192C`, active pill teal
`#12AEA9`, canvas `#F7FBFE`.

### Layouts are role-based, not page-based
`src/layouts/RoleLayout.tsx` is the single shell — rail, header, content, footer.
Only the nav tree and the rail caption change per role, from
`src/layouts/navConfig.ts`. Six trees: super_admin, developer, school_admin,
teacher, student, parent.

`DEVELOPER_BLOCKED` in that file is what makes Super Admin senior to Developer:
billing, platform team, roles, and payment gateways are filtered out.

### Header
No logo (the rail owns the brand — that was the duplicate-ShikkhaERP bug).
Carries: breadcrumb, search, sidebar picker, fullscreen, notifications with
All / Messages / Alerts tabs and an unread count, and an account menu with
profile, change password and sign out.

### Routing
`src/AppRoutes.tsx` generates one route per nav leaf from the config, guarded to
the owning role. Leaves whose `phase` exceeds `DELIVERED_THROUGH` render
`PlannedPage` — a real screen stating what's coming and when. **No dead links.**

Old paths (`/super-admin/*`, `/developer/*`, `/admin/*`) redirect to the new ones.

### Dashboard
`src/pages/PlatformDashboard.tsx` — tenant runway strip, four animated KPIs with
sparklines, growth area chart, plan-mix donut, demo-request queue with inline
approve/decline, trials ending, activity feed, quick actions.

Reads live `/v1/dashboard/superadmin/stats` and falls back to the demo dataset
in `src/platform/data/mock.ts`, so it never renders four zeroes.

### Removed
- `src/features/auth/components/common/Navbar.tsx` — dead, wouldn't typecheck
- `src/features/dashboard/containers/Login.container.tsx` — dead duplicate

Both would have failed a Vercel build. `npx tsc --noEmit` is now clean.

## Still to come
Phases 2–7. Set `DELIVERED_THROUGH` in `navConfig.ts` as each lands.
