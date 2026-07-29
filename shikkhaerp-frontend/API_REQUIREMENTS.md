# Admin Dashboard — Backend API Requirements

For the backend team. These endpoints power the School Admin dashboard. Each maps
to a block currently rendered from mock data (`src/features/dashboard/admin/mockData.ts`).
The frontend already unwraps the standard `ApiResponse { success, message, data }`
envelope and expects all of these under `/v1/dashboard/admin/...`.

Legend: **EXISTS** = already implemented (may need extra fields) · **NEW** = to build.

---

### 1. Summary KPIs — `GET /v1/dashboard/admin/summary` — **EXISTS (extend)**
Currently returns: totalStudents, totalTeachers, totalUsers, totalClasses, totalRevenue, monthlyRevenue, pendingFees, todayAttendance, attendancePercentage.
Please add: `totalStaff`, `avgPerformance` (%), `feeCollectedThisMonth`, `outstandingDues`, and month-over-month trend % for each KPI. Optional: an 8-point sparkline array per KPI (`studentsSpark`, etc.).

### 2. Enrolment & revenue trend — `GET /v1/dashboard/admin/enrollment-trend` — **EXISTS (verify shape)**
Array of 12 months: `[{ month: "Jul", students: 1284, revenue: 1.875 }]` (revenue in Cr or raw BDT — tell us which).

### 3. Weekly attendance — `GET /v1/dashboard/admin/attendance/weekly` — **NEW**
`[{ day: "Sat", present: 1180, absent: 104 }, ...]` for the current week.

### 4. Gender ratio — `GET /v1/dashboard/admin/gender-ratio` — **EXISTS (verify)**
`[{ name: "Boys", value: 712 }, { name: "Girls", value: 572 }]`.

### 5. Class distribution — `GET /v1/dashboard/admin/class-distribution` — **EXISTS (verify)**
`[{ class: "Class 9", students: 205 }, ...]`.

### 6. Fee summary — `GET /v1/dashboard/admin/fees/summary` — **NEW**
`{ target: 2300000, collected: 1875000, defaulters: [{ name, class, due }] }`.

### 7. Recent activity — `GET /v1/dashboard/admin/recent-activities` — **EXISTS (verify)**
`[{ who, action, when, tone }]` where tone ∈ info | success | warning.

### 8. Announcements — `GET & POST /v1/dashboard/admin/announcements` — **NEW**
GET → `[{ title, body, date }]`. POST `{ title, body }` → creates a notice.

### 9. Events — `GET /v1/dashboard/admin/events` — **NEW**
`[{ title, date, tag }]` (tag ∈ Exam | Event | Academic).

### 10. Pending approvals — `GET /v1/dashboard/admin/approvals` + actions — **NEW**
GET → `[{ id, type, label }]` (type ∈ Admission | Leave | Transfer).
`POST /v1/dashboard/admin/approvals/{id}/approve` and `/reject`.

### 11. Top performers — `GET /v1/dashboard/admin/top-performers` — **NEW**
`[{ name, class, score }]`.

---

**Notes**
- All money is BDT.
- Keep the existing `ApiResponse` envelope for consistency.
- School scoping comes from the authenticated user's `schoolId` (JWT) — no need to pass it from the client.
- Until each endpoint is live, the matching widget shows realistic mock data, so the dashboard is fully demo-able today.
