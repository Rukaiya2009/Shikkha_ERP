/**
 * Audit, security events and login history — LIVE API.
 *
 * Mapped directly from the Spring controllers:
 *
 *   AuditController          @RequestMapping("/audit")
 *     GET  /audit/all
 *     GET  /audit/recent?limit=50
 *     GET  /audit/action/{action}
 *     GET  /audit/user/{userId}
 *
 *   SecurityAuditController  @RequestMapping("/security")
 *     GET  /security/events/all
 *     GET  /security/events/recent?limit=50
 *     GET  /security/events/type/{eventType}
 *     GET  /security/events/high-severity
 *     GET  /security/account-lock/{userId}/status
 *     GET  /security/account-lock/{userId}/is-locked
 *     POST /security/account-lock/{userId}/lock?email=&reason=
 *     POST /security/account-lock/{userId}/unlock?email=&reason=
 *     GET  /security/audit-logs/{all,recent,action/{a},user/{id}}   (duplicate of /audit)
 *
 *   LoginHistoryController   @RequestMapping("/login-history")   ← SEE NOTE
 *
 * NOTE — login history has no controller in the backend yet. The entity,
 * repository, service and DTO all exist; nothing exposes them over HTTP. This
 * file calls the endpoints the accompanying LoginHistoryController.java adds.
 * Until that file is deployed, LoginHistoryPage shows its "endpoint missing"
 * state rather than pretending to have data.
 *
 * Two things the controllers do NOT offer, so the screens compensate:
 *   1. No pagination — everything comes back as a plain List. We pull a bounded
 *      window with ?limit= and page in memory.
 *   2. No server-side filtering by severity, date or actor. Same approach.
 * Both are noted on screen so nobody mistakes a client-side filter for a query.
 */
import { axiosInstance } from '../../../core/api/axiosInstance';

/* ══════════════════════════════ types ══════════════════════════════ */

/** Mirrors AuditDTO.java. Everything optional — the backend nulls plenty of it. */
export interface AuditEntry {
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  fullName?: string;
  action?: string;
  actionCategory?: string;
  resource?: string;
  resourceId?: string;
  resourceType?: string;
  oldValue?: string;
  newValue?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
  status?: string;
  severity?: string;
  errorMessage?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  performedBy?: string;
  tenantId?: string;
  schoolId?: string;
  success?: boolean;
}

/**
 * SecurityDTO is not in the files I was given, so this is deliberately loose —
 * every field optional, and the screen falls back gracefully. Tighten it once
 * SecurityDTO.java is confirmed.
 */
export interface SecurityEvent {
  id?: string;
  userId?: string;
  email?: string;
  eventType?: string;
  severity?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  success?: boolean;
  createdAt?: string;
  timestamp?: string;
}

/** Mirrors LoginHistoryDTO.java. */
export interface LoginEntry {
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  fullName?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
  status?: string;
  loginType?: string;
  failureReason?: string;
  source?: string;
  country?: string;
  city?: string;
  region?: string;
  success?: boolean;
  loginTime?: string;
  logoutTime?: string;
  sessionDuration?: number;
  notes?: string;
}

export interface LockStatus {
  userId?: string;
  email?: string;
  isLocked?: boolean;
  locked?: boolean;
  reason?: string;
  lockedAt?: string;
  unlockedAt?: string;
  failedAttempts?: number;
}

/* ═════════════════════════════ plumbing ═════════════════════════════ */

/**
 * The user endpoints wrap payloads as { data: … }; the audit and security
 * controllers return the bare list. Handle both so neither surprises us.
 */
const unwrap = <T,>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && !Array.isArray(payload)) {
    return payload.data as T;
  }
  return payload as T;
};

const asList = <T,>(payload: any): T[] => {
  const body = unwrap<any>(payload);
  if (Array.isArray(body)) return body as T[];
  if (body && Array.isArray(body.content)) return body.content as T[];
  return [];
};

/** A 404 here means "controller not deployed", which is worth distinguishing. */
export const isMissingEndpoint = (err: any) => err?.response?.status === 404;

export const errorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

/* ══════════════════════════════ audit ══════════════════════════════ */

export const auditService = {
  /** Bounded window. `limit` is the only server-side control available. */
  recent: async (limit = 500): Promise<AuditEntry[]> => {
    const res = await axiosInstance.get('/audit/recent', { params: { limit } });
    return asList<AuditEntry>(res.data);
  },

  all: async (): Promise<AuditEntry[]> => {
    const res = await axiosInstance.get('/audit/all');
    return asList<AuditEntry>(res.data);
  },

  byAction: async (action: string): Promise<AuditEntry[]> => {
    const res = await axiosInstance.get(`/audit/action/${encodeURIComponent(action)}`);
    return asList<AuditEntry>(res.data);
  },

  byUser: async (userId: string): Promise<AuditEntry[]> => {
    const res = await axiosInstance.get(`/audit/user/${encodeURIComponent(userId)}`);
    return asList<AuditEntry>(res.data);
  },
};

/* ═════════════════════════ security events ═════════════════════════ */

export const securityService = {
  recentEvents: async (limit = 300): Promise<SecurityEvent[]> => {
    const res = await axiosInstance.get('/security/events/recent', { params: { limit } });
    return asList<SecurityEvent>(res.data);
  },

  allEvents: async (): Promise<SecurityEvent[]> => {
    const res = await axiosInstance.get('/security/events/all');
    return asList<SecurityEvent>(res.data);
  },

  highSeverity: async (): Promise<SecurityEvent[]> => {
    const res = await axiosInstance.get('/security/events/high-severity');
    return asList<SecurityEvent>(res.data);
  },

  eventsByType: async (type: string): Promise<SecurityEvent[]> => {
    const res = await axiosInstance.get(`/security/events/type/${encodeURIComponent(type)}`);
    return asList<SecurityEvent>(res.data);
  },

  lockStatus: async (userId: string): Promise<LockStatus> => {
    const res = await axiosInstance.get(`/security/account-lock/${encodeURIComponent(userId)}/status`);
    return unwrap<LockStatus>(res.data);
  },

  isLocked: async (userId: string): Promise<boolean> => {
    const res = await axiosInstance.get(`/security/account-lock/${encodeURIComponent(userId)}/is-locked`);
    return Boolean(unwrap<boolean>(res.data));
  },

  /** Note: the controller takes email and reason as query params, not a body. */
  lock: async (userId: string, email: string, reason: string): Promise<LockStatus> => {
    const res = await axiosInstance.post(
      `/security/account-lock/${encodeURIComponent(userId)}/lock`,
      null,
      { params: { email, reason } },
    );
    return unwrap<LockStatus>(res.data);
  },

  unlock: async (userId: string, email: string, reason: string): Promise<LockStatus> => {
    const res = await axiosInstance.post(
      `/security/account-lock/${encodeURIComponent(userId)}/unlock`,
      null,
      { params: { email, reason } },
    );
    return unwrap<LockStatus>(res.data);
  },
};

/* ═══════════════════════════ login history ═══════════════════════════ */

export const loginHistoryService = {
  recent: async (limit = 500): Promise<LoginEntry[]> => {
    const res = await axiosInstance.get('/login-history/recent', { params: { limit } });
    return asList<LoginEntry>(res.data);
  },

  all: async (): Promise<LoginEntry[]> => {
    const res = await axiosInstance.get('/login-history/all');
    return asList<LoginEntry>(res.data);
  },

  byUser: async (userId: string): Promise<LoginEntry[]> => {
    const res = await axiosInstance.get(`/login-history/user/${encodeURIComponent(userId)}`);
    return asList<LoginEntry>(res.data);
  },

  byEmail: async (email: string): Promise<LoginEntry[]> => {
    const res = await axiosInstance.get(`/login-history/email/${encodeURIComponent(email)}`);
    return asList<LoginEntry>(res.data);
  },

  range: async (start: string, end: string): Promise<LoginEntry[]> => {
    const res = await axiosInstance.get('/login-history/range', { params: { start, end } });
    return asList<LoginEntry>(res.data);
  },
};

/* ════════════════════ derivation the backend leaves out ════════════════════ */

export type Severity = 'CRITICAL' | 'WARN' | 'INFO';

const CRITICAL_HINTS = ['DELETE', 'DELETED', 'DESTROY', 'PERMISSION', 'ROLE', 'PAYMENT', 'KEY', 'IMPERSONAT', 'SUPER_ADMIN'];
const WARN_HINTS = ['SUSPEND', 'LOCK', 'REVOKE', 'REJECT', 'DEACTIVAT', 'DISABLE', 'FAIL', 'RESET'];

/** Backend severity when present; otherwise inferred from the action verb. */
export const severityOf = (e: AuditEntry): Severity => {
  const raw = (e.severity || '').toUpperCase();
  if (raw.includes('CRITICAL') || raw === 'HIGH' || raw === 'SEVERE') return 'CRITICAL';
  if (raw.includes('WARN') || raw === 'MEDIUM') return 'WARN';
  if (raw.includes('INFO') || raw === 'LOW') return 'INFO';

  const action = (e.action || '').toUpperCase();
  if (e.success === false || (e.status && e.status.toUpperCase() === 'FAILED')) return 'WARN';
  if (CRITICAL_HINTS.some((h) => action.includes(h))) return 'CRITICAL';
  if (WARN_HINTS.some((h) => action.includes(h))) return 'WARN';
  return 'INFO';
};

const CATEGORY_MAP: [string, string][] = [
  ['SCHOOL', 'Schools'], ['TENANT', 'Schools'], ['DEMO', 'Schools'],
  ['USER', 'Users'], ['ACCOUNT', 'Users'], ['LOGIN', 'Authentication'],
  ['AUTH', 'Authentication'], ['PASSWORD', 'Authentication'], ['TOKEN', 'Authentication'],
  ['ROLE', 'Access'], ['PERMISSION', 'Access'], ['LOCK', 'Access'],
  ['INVOICE', 'Billing'], ['PAYMENT', 'Billing'], ['PLAN', 'Billing'], ['SUBSCRIPTION', 'Billing'],
  ['EMAIL', 'Communication'], ['SMS', 'Communication'], ['ANNOUNCEMENT', 'Communication'],
  ['FLAG', 'Configuration'], ['SETTING', 'Configuration'], ['CONFIG', 'Configuration'],
  ['KEY', 'Developer tools'], ['JOB', 'Developer tools'], ['CACHE', 'Developer tools'],
];

/** `actionCategory` from the DTO when set; otherwise derived from the action. */
export const categoryOf = (e: AuditEntry): string => {
  if (e.actionCategory) return e.actionCategory;
  if (e.resourceType) return e.resourceType;
  const action = (e.action || '').toUpperCase();
  const hit = CATEGORY_MAP.find(([k]) => action.includes(k));
  return hit ? hit[1] : 'Other';
};

/** Who did it — the DTO offers four possible fields. */
export const actorOf = (e: AuditEntry | LoginEntry): string =>
  (e as AuditEntry).performedBy || e.fullName || e.email || e.username || (e as AuditEntry).userId || 'system';

/** SCHOOL_APPROVED → "School approved". Machine constants read badly in prose. */
export const humanAction = (action?: string) => {
  if (!action) return 'Unknown action';
  const s = action.replace(/[_.]+/g, ' ').trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Coarse user-agent parse. Good enough to say "Chrome on Windows". */
export const parseAgent = (ua?: string) => {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' as const };

  const os =
    /Windows NT/i.test(ua) ? 'Windows'
      : /Android/i.test(ua) ? 'Android'
        : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
          : /Mac OS X/i.test(ua) ? 'macOS'
            : /Linux/i.test(ua) ? 'Linux'
              : 'Unknown';

  const browser =
    /Edg\//i.test(ua) ? 'Edge'
      : /OPR\/|Opera/i.test(ua) ? 'Opera'
        : /Chrome\//i.test(ua) ? 'Chrome'
          : /Safari\//i.test(ua) ? 'Safari'
            : /Firefox\//i.test(ua) ? 'Firefox'
              : /PostmanRuntime|curl|axios|okhttp/i.test(ua) ? 'API client'
                : 'Unknown';

  const device: 'Mobile' | 'Tablet' | 'Desktop' | 'Unknown' =
    /iPad|Tablet/i.test(ua) ? 'Tablet'
      : /Mobi|Android|iPhone/i.test(ua) ? 'Mobile'
        : os === 'Unknown' ? 'Unknown'
          : 'Desktop';

  return { browser, os, device };
};

/** Best available timestamp across the three DTO shapes. */
export const whenOf = (e: AuditEntry | SecurityEvent | LoginEntry): string | undefined =>
  (e as AuditEntry).createdAt
  ?? (e as LoginEntry).loginTime
  ?? (e as SecurityEvent).timestamp
  ?? undefined;

/** Parse oldValue/newValue into a field-by-field diff when they hold JSON. */
export const diffOf = (oldValue?: string, newValue?: string) => {
  const parse = (v?: string) => {
    if (!v) return null;
    try {
      const p = JSON.parse(v);
      return p && typeof p === 'object' ? (p as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };
  const a = parse(oldValue);
  const b = parse(newValue);
  if (!a && !b) return null;

  const keys = [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].sort();
  return keys
    .map((k) => ({
      field: k,
      before: a?.[k] === undefined ? '—' : String(a[k]),
      after: b?.[k] === undefined ? '—' : String(b[k]),
    }))
    .filter((r) => r.before !== r.after);
};
