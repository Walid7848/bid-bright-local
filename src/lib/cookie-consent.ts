export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = ConsentCategories & {
  version: number;
  updatedAt: string;
};

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "cookie-consent";
export const CONSENT_OPEN_EVENT = "cookie-consent:open";
export const CONSENT_CHANGE_EVENT = "cookie-consent:change";

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed?.version !== CONSENT_VERSION) return null;
    return { ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function writeConsent(categories: Omit<ConsentCategories, "necessary">): ConsentRecord {
  const record: ConsentRecord = {
    necessary: true,
    analytics: !!categories.analytics,
    marketing: !!categories.marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: record }));
  }
  return record;
}

export function openCookiePreferences() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
