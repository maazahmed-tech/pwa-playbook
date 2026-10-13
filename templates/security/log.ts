/**
 * apps/web/lib/log.ts — log hygiene (copy to the admin app too, or share it).
 *
 * `scrub` masks anything that looks like an email address, a bearer token, a provider key
 * or a long secret-shaped run, and blanks any field named like a credential, before a value
 * reaches a log line or an error report. `logError` is the ONE way route handlers report a
 * failure: the route and the message, never the request body. `scrubEvent` is the Sentry
 * `beforeSend` hook (with `sendDefaultPii: false`). No Node imports, so the same code runs
 * on the edge and in the browser. Unit-test it (a test that feeds it an email, a key and a
 * `{ password }` object and asserts all three vanish).
 */
export const MASK = "[redacted]";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const BEARER_RE = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
// add your providers' key prefixes
const PROVIDER_KEY_RE = /\b(?:AIza[0-9A-Za-z_-]{10,}|sk_[A-Za-z0-9_]{6,}|rk_[A-Za-z0-9_]{6,}|re_[A-Za-z0-9_]{6,}|ghp_[A-Za-z0-9]{6,}|github_pat_[A-Za-z0-9_]{6,}|vcp_[A-Za-z0-9]{6,}|tsk_[A-Za-z0-9]{6,})\b/g;
const LONG_RUN_RE = /[A-Za-z0-9+/_-]{32,}={0,2}/g;
const SECRET_FIELD_RE = /password|code|token|secret|authorization|cookie/i;

export function scrubText(text: string): string {
  return text
    .replace(EMAIL_RE, "[email]")
    .replace(BEARER_RE, "Bearer [redacted]")
    .replace(PROVIDER_KEY_RE, MASK)
    .replace(LONG_RUN_RE, MASK);
}

/** Deep copy with strings masked and credential-named fields blanked; other primitives pass through. */
export function scrub<T>(value: T, depth = 0): T {
  if (typeof value === "string") return scrubText(value) as T;
  if (!value || typeof value !== "object" || depth > 8) return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1)) as T;
  if (value instanceof Date) return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SECRET_FIELD_RE.test(k) ? MASK : scrub(v, depth + 1);
  }
  return out as T;
}

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

/** Route + message only. */
export function logError(route: string, err: unknown): void {
  console.error(`[${route}] ${scrubText(errorMessage(err))}`);
}

interface ReportShape {
  message?: string;
  extra?: object;
  request?: object;
  user?: { email?: string | null; ip_address?: string | null; username?: string | null };
  exception?: { values?: { value?: string }[] };
  breadcrumbs?: { message?: string; data?: object }[];
}

/** Sentry `beforeSend`: masks the message, exception text, breadcrumbs, extra and request data; drops user identity. */
export function scrubEvent<E extends object>(raw: E): E {
  const event = raw as ReportShape;
  if (event.message) event.message = scrubText(event.message);
  if (event.extra) event.extra = scrub(event.extra);
  if (event.request) event.request = scrub(event.request);
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }
  for (const v of event.exception?.values ?? []) if (v.value) v.value = scrubText(v.value);
  for (const b of event.breadcrumbs ?? []) {
    if (b.message) b.message = scrubText(b.message);
    if (b.data) b.data = scrub(b.data);
  }
  return raw;
}
