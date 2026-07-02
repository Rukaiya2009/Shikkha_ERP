# ShikkhaERP — Project Notes
> Last updated: July 1, 2026
> Always paste this file at the start of a new AI chat session to resume work.

---

## 1. Project Overview

**ShikkhaERP** is a multi-tenant SaaS school management platform for schools in Bangladesh.

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2.1, Java 21, Maven |
| Database | Supabase PostgreSQL (ap-southeast-2) |
| Backend deployment | Render.com (Docker, free tier) |
| Frontend | Next.js (Vercel) |
| Email | ZeptoMail HTTP API (NOT SMTP — Render blocks all SMTP ports 25/465/587) |
| Auth | JWT (jjwt 0.12.6) |

---

## 2. Live URLs

| Service | URL |
|---------|-----|
| Backend | https://shikkha-erp.onrender.com |
| Frontend | https://shikka-erp-website.vercel.app |
| GitHub | Rukaiya2009/Shikkha_ERP (branch: main) |

**Important:** Backend has `server.servlet.context-path: /api`
All endpoints are `/api/...` — controllers use mappings WITHOUT `/api` prefix.

---

## 3. Render Environment Variables

```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.auarlihikwutxylhqyfc
SPRING_DATASOURCE_PASSWORD=ShikkhaERP-2026
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_PROFILES_ACTIVE=prod
ZEPTOMAIL_TOKEN=<raw token from ZeptoMail — no prefix>
SPRING_MAIL_USERNAME=shikkhaerp@itdatascience.com
CORS_ALLOWED_ORIGINS=https://shikka-erp-website.vercel.app
BASE_URL=https://shikkha-erp.onrender.com
FRONTEND_URL=https://shikka-erp-website.vercel.app
COMPANY_ADMIN_EMAIL=farhanahoque251@gmail.com,hasanhabib2009@gmail.com
JWT_SECRET=<your secret>
```

---

## 4. Database (Supabase)

**Connection:** Supavisor session pooler (NOT direct connection — Render free tier is IPv4 only, direct Supabase is IPv6)
**Pooler host:** `aws-1-ap-southeast-2.pooler.supabase.com:5432`
**Username format:** `postgres.auarlihikwutxylhqyfc`

### Key Tables

| Table | Notes |
|-------|-------|
| `app_users` | UUID primary key, has `email_verification_token` and `email_verification_token_expiry` columns |
| `pending_demo_requests` | Full demo request pipeline table — see schema below |

### pending_demo_requests Schema
```sql
-- Core fields
uuid VARCHAR UNIQUE NOT NULL
school_name VARCHAR NOT NULL
school_address VARCHAR
school_phone VARCHAR
school_email VARCHAR
school_type VARCHAR
number_of_students INTEGER
number_of_teachers INTEGER
super_admin_name VARCHAR NOT NULL
super_admin_email VARCHAR NOT NULL
super_admin_phone VARCHAR
status VARCHAR DEFAULT 'PENDING'
expires_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
approved_at TIMESTAMP
rejected_at TIMESTAMP
school_id UUID
reject_reason VARCHAR
request_data TEXT  -- was jsonb, changed to TEXT

-- Token fields (added for one-click email approve/reject)
approval_token VARCHAR(255) UNIQUE
rejection_token VARCHAR(255) UNIQUE
approval_token_used BOOLEAN DEFAULT FALSE
rejection_token_used BOOLEAN DEFAULT FALSE
```

---

## 5. Package Structure

```
com.shikkhaerp
├── bootstrap
│   ├── DatabaseSeeder.java          (seeds admin users on startup)
│   ├── api/TestController.java
│   └── security/
│       ├── CustomUserDetailsService.java
│       ├── JwtAuthenticationFilter.java
│       ├── JwtTokenProvider.java
│       └── JwtUtil.java
├── config
│   ├── AuditorAwareImpl.java
│   ├── CorsConfig.java
│   ├── EmailTemplateProperties.java
│   └── SecurityConfig.java
├── core.dto
│   ├── ApiResponse.java
│   └── PageResponse.java
├── dashboard
│   ├── api/ (AdminDashboard, StudentDashboard, SuperAdminDashboard controllers)
│   ├── dto/ (ChartData, DashboardSummary, GenderRatio, etc.)
│   └── service/ (AdminDashboardService, SuperAdminDashboardService)
└── modules
    ├── auth/
    │   ├── api/ (Auth, AdvancedSecurity, Audit, Compliance, Integration,
    │   │         Lock, Password, SecurityAudit, Security controllers)
    │   ├── dto/ (Login, Register, Logout, SetupPassword, etc.)
    │   ├── entity/ (AccountLock, ApiKey, AuditLog, BlacklistedToken,
    │   │            FailedLoginAttempt, LoginHistory, PasswordResetToken,
    │   │            RefreshToken, SecurityEvent, UserSession, etc.)
    │   ├── repository/ (one per entity)
    │   ├── service/ (AuthService, UserCreationService, TokenBlacklistService,
    │   │             AuditLogService, LoginHistoryService, PasswordService, etc.)
    │   └── workflow/AuthWorkflow.java
    ├── demo/
    │   ├── api/DemoController.java
    │   ├── dto/ (DemoRequestDTO, DemoRequestResponse, ApprovalResponseDTO,
    │   │         PendingRequestDTO, RejectionRequestDTO)
    │   ├── entity/PendingDemoRequest.java
    │   ├── repository/PendingDemoRequestRepository.java
    │   └── service/DemoService.java
    ├── notification/
    │   └── service/EmailService.java   (ZeptoMail HTTP API)
    ├── school/
    │   ├── entity/School.java          (entity only — NO service/controller yet)
    │   └── repository/SchoolRepository.java
    ├── student/  (full CRUD — entity, dto, mapper, repository, service, controller, workflow)
    ├── teacher/  (full CRUD — entity, dto, mapper, repository, service, controller, workflow)
    ├── tenant/
    │   └── service/TenantService.java  (stub only)
    ├── user/     (full CRUD — entity, dto, mapper, repository, service, controller, workflow)
    └── dashboard/
        └── api/TrialController.java
```

---

## 6. Key Architecture Decisions

### Email
- **ZeptoMail HTTP API** — NOT JavaMailSender/SMTP
- Render free tier **blocks all outbound SMTP ports** (25, 465, 587) since Sept 2025
- `EmailService.java` uses `RestTemplate` to POST to `https://api.zeptomail.com/v1.1/email`
- Auth header: `"Zoho-enczapikey " + zeptoMailToken` (prefix hardcoded in Java, env var has raw token only)
- Sending domain: `itdatascience.com` (verified in ZeptoMail)
- Sender address: `shikkhaerp@itdatascience.com`
- ZeptoMail agent alias: `35f26f9e5d7aa47e`

### CORS
- Uses `setAllowedOriginPatterns` (NOT `setAllowedOrigins`) to support Vercel preview URLs
- Pattern `https://shikka-erp-website-*.vercel.app` covers all preview deployments
- CORS is configured in `SecurityConfig.java` (hardcoded patterns, NOT from env var)
- `CorsConfig.java` also exists — ensure no conflict

### Security
- JWT stateless authentication
- `SecurityConfig.java` permits: `/auth/**`, `/public/**`, `/demo/**`, `/actuator/health`
- All demo endpoints are public (no auth required) including one-click approve/reject
- Controller mappings have NO `/api` prefix — context-path handles it

### Database
- `ddl-auto: validate` in production — schema changes require manual SQL in Supabase
- Hikari `auto-commit: false` + `provider_disables_autocommit: true` required together
- All IDs are UUID type
- `pending_demo_requests.request_data` is TEXT (changed from jsonb)

### Demo Request DTO
- Frontend sends nested JSON: `{school: {...}, superAdmin: {...}}`
- `DemoRequestDTO` has nested static classes `School` and `SuperAdmin`
- Compatibility getters (`getSchoolName()`, `getSuperAdminEmail()`, etc.) delegate to nested objects
- `DemoService` uses flat getters — no changes needed there

---

## 7. Completed Features

- [x] Demo request 3-step form → backend → Supabase
- [x] ZeptoMail email sending (submission confirmation + admin notification)
- [x] Secure one-click approve/reject links in admin email (single-use tokens, 7-day expiry)
- [x] Styled HTML confirmation pages for approve/reject actions
- [x] JWT authentication system (login, logout, refresh, blacklist)
- [x] User CRUD module
- [x] Student CRUD module
- [x] Teacher CRUD module
- [x] CORS wildcard for Vercel preview deployments
- [x] Supabase connection via IPv4-compatible Supavisor pooler

---

## 8. Pending / In Progress

- [ ] **School provisioning on approval** ← NEXT IMMEDIATE TASK
  - When admin clicks Approve → create School record → create User account
    for super admin → link User to School → send credentials email
  - `DemoService.approveRequest()` currently only marks APPROVED + sends email
  - No real login account is created yet
  - School module has entity + repository but NO service or controller

- [ ] Multi-tenancy (row-level data isolation per school)
- [ ] Academic modules (classes, subjects, attendance, exams, grades)
- [ ] Fee management
- [ ] Timetable/scheduling
- [ ] Admin frontend dashboards (Next.js)
- [ ] Reports and analytics
- [ ] Billing/subscription management
- [ ] GDPR compliance
- [ ] CI/CD pipeline

---

## 9. Known Issues / Gotchas

| Issue | Status | Notes |
|-------|--------|-------|
| Render free tier cold starts | Ongoing | ~3 min boot, 50s+ spin-up delay. Frontend axios timeout set to 60s. |
| ZeptoMail token in Render env var | Fixed | Must be raw token only — code adds `Zoho-enczapikey ` prefix |
| Vercel preview URL CORS | Fixed | Using `setAllowedOriginPatterns` with wildcard |
| `request_data` column type | Fixed | Changed from jsonb to TEXT via Supabase SQL |
| SMTP blocked on Render | Fixed | Switched to ZeptoMail HTTP API |
| `PendingDemoRequestRepository` | Fixed | Changed from `JpaRepository<..., Long>` to `JpaRepository<..., UUID>` |
| `DemoController` doubled path | Fixed | Was `/api/demo`, changed to `/demo` |
| Approval email links | Working | GET `/api/demo/approve?token=...` and `/api/demo/reject?token=...` |

---

## 10. How to Resume in a New Chat

1. Paste this entire file into the new chat
2. State what you want to work on next
3. Paste any relevant Java files when asked

**Recommended workflow:**
- One chat per major feature (school provisioning, multi-tenancy, etc.)
- Update this file after each completed feature
- Keep git commit messages descriptive — they help trace what changed

---

## 11. Admin Accounts (seeded on startup)

```
farhanahoque251@gmail.com  (SUPER_ADMIN)
hasanhabib2009@gmail.com   (SUPER_ADMIN)
```
Password set via `ADMIN_PASSWORD` env var on Render.

---

## 12. Files to Paste When Starting School Provisioning Task

Ask AI to help with school provisioning, then paste these files:
- `src/main/java/com/shikkhaerp/modules/school/entity/School.java`
- `src/main/java/com/shikkhaerp/modules/user/entity/User.java`
- `src/main/java/com/shikkhaerp/modules/auth/service/UserCreationService.java`
- `src/main/java/com/shikkhaerp/modules/tenant/service/TenantService.java`
- `src/main/java/com/shikkhaerp/bootstrap/DatabaseSeeder.java`