# ShikkhaERP — Feature List & Roadmap

_A working reference for the School Admin dashboard and the wider product. Items marked **(national)** are Bangladesh-specific. Anything without a live API is built on **mock data** now and swaps to real data once the endpoint ships (see `API_REQUIREMENTS.md`)._

---

## 1. What's on the Admin dashboard right now (built, mock data)

- **6 live KPIs** with animated counters, trend %, and sparklines: Total students, Teachers, Attendance today, Fee collected (month), Outstanding dues, Average performance.
- **Enrolment & revenue trend** — 12-month area chart with a Students/Revenue toggle.
- **Weekly attendance** — present vs absent bar chart.
- **Gender ratio** — donut chart.
- **Students by class** — horizontal bar chart.
- **Fee collection** — animated progress ring vs monthly target.
- **Recent activity** feed.
- **Pending approvals** — approve/dismiss inline (admissions, leave, transfers).
- **Upcoming events** calendar strip.
- **Announcements** — post a notice inline (composer).
- **Top performers** leaderboard.
- **Fee defaulters** with "remind all".
- **Quick actions** bar: add student, add teacher, collect fee, mark attendance, send notice.

---

## 2. Full feature catalogue (target product)

### Students & Admissions
Student profiles, enrolment, admission enquiry/CRM, online admission forms, document uploads, ID-card generation, promotion/transfer, alumni. **(national)** EIIN/registration & roll numbers, board registration form fill-up, government stipend (*upobritti*) tracking.

### Staff & HR
Staff profiles, roles, attendance, leave management, payroll, appraisals, recruitment. **(national)** MPO / BANBEIS staff data fields.

### Academics
Classes, sections, subjects, curriculum/syllabus, lesson plans, timetable/routine, substitution. **(national)** Bangla & English medium, JSC/SSC/HSC structure, GPA-5 grading.

### Attendance
Student & staff daily attendance, subject-wise, biometric/RFID import, absentee SMS to guardians, monthly reports.

### Examinations & Grading
Exam scheduling, marks entry, grade/GPA calculation, report cards, transcripts, merit lists, progress tracking. **(national)** Board-exam prep, Bangla report cards, tabulation sheets.

### Fees & Finance
Fee heads, invoicing, online collection, dues & defaulters, scholarships/waivers, refunds, expenses, payroll, accounting ledgers, financial reports. **(national)** bKash / Nagad / Rocket / SSLCommerz gateways.

### Communication
Notice board, SMS & email (Bangla SMS), parent & student portals, in-app messaging, push notifications, event invites.

### Modules
Library (catalogue, issue/return, fines), Transport (routes, vehicles, GPS, fees), Hostel/dormitory, Inventory & assets, Health/infirmary records, Certificates (transfer, character, testimonial), LMS (assignments, resources, live classes, quizzes).

### Platform
Reports & analytics/MIS, custom report builder, roles & permissions, multi-branch, multi-tenant (already core to ShikkhaERP), audit logs, data import/export, backups, settings & branding.

---

## 3. Pending job list (phased)

**Phase 0 — Foundation (done)**
- Consistent reskin of all role dashboards; fixed dashboard data-wiring bugs; brought over the "Welcome Back" login + register with the setup-password flow preserved.
- New design system: navy→ocean→teal palette, Space Grotesk + Plus Jakarta Sans, animation system.
- Rebuilt Admin dashboard (rich, animated, mock data).

**Phase 1 — Admin experience (in progress)**
- 1a. Admin dashboard — **done (mock)**; wire each widget to real APIs as they ship.
- 1b. **User Management redesign** — next; keep every existing feature (Active/Deleted tabs, search, status filter, Add/Edit, activate/deactivate, lock/unlock, delete/restore, resend invite), new look.
- 1c. Roll the new palette to the remaining dashboards (Super Admin, Teacher, Student, Parent, Developer) — mostly automatic via shared tokens.

**Phase 2 — Core modules (page by page)**
Students, Staff, Attendance, Examinations, Fees & Finance — each as a full CRUD screen on the new design system.

**Phase 3 — Extended modules**
Library, Transport, Timetable, Communication/Notices, LMS, Reports.

**Phase 4 — National & integrations**
Board/EIIN integration, local payment gateways, Bangla SMS, stipend tracking, report-card formats.

**Cross-cutting**
Wire mock widgets to live APIs, add code-splitting to trim bundle size, accessibility & mobile passes, tests.
