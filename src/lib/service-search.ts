import { CATEGORIES } from "./categories";
import type { Lang } from "./i18n";

/**
 * Search layer on top of the EXISTING categories in the system.
 * No new data is invented: every term maps to a real category id used by
 * `requests.category` / `profiles.profession`.
 */

export type ServiceTerm = {
  /** existing category id */
  category: string;
  ar: string;
  nl: string;
  en: string;
};

export const SERVICE_TERMS: ServiceTerm[] = [
  // handyman (مهن حرة / صيانة وتركيب)
  { category: "handyman", ar: "كهربائي", nl: "Elektricien", en: "Electrician" },
  { category: "handyman", ar: "إصلاح أعطال كهربائية", nl: "Elektrische storingen", en: "Electrical repairs" },
  { category: "handyman", ar: "تركيب إنارة", nl: "Verlichting installeren", en: "Lighting installation" },
  { category: "handyman", ar: "سباك", nl: "Loodgieter", en: "Plumber" },
  { category: "handyman", ar: "دهان", nl: "Schilder", en: "Painter" },
  { category: "handyman", ar: "نجار", nl: "Timmerman", en: "Carpenter" },
  { category: "handyman", ar: "تركيب أثاث", nl: "Meubels monteren", en: "Furniture assembly" },
  { category: "handyman", ar: "صيانة منزلية", nl: "Klussen in huis", en: "Home maintenance" },
  { category: "handyman", ar: "تنظيف", nl: "Schoonmaak", en: "Cleaning" },
  { category: "handyman", ar: "نقل أثاث", nl: "Verhuizen", en: "Moving / removals" },

  // legal & consulting
  { category: "lawyer", ar: "محامي", nl: "Advocaat", en: "Lawyer" },
  { category: "lawyer", ar: "استشارة قانونية", nl: "Juridisch advies", en: "Legal advice" },
  { category: "consultant", ar: "استشاري", nl: "Consultant", en: "Consultant" },
  { category: "notary_help", ar: "مساعدة إدارية", nl: "Administratieve hulp", en: "Administrative help" },
  { category: "notary_help", ar: "تعبئة استمارات", nl: "Formulieren invullen", en: "Form filling" },

  // languages
  { category: "translator", ar: "مترجم", nl: "Vertaler", en: "Translator" },
  { category: "translator", ar: "ترجمة مستندات", nl: "Documenten vertalen", en: "Document translation" },
  { category: "translator", ar: "مترجم فوري", nl: "Tolk", en: "Interpreter" },
  { category: "tutor_dutch", ar: "معلم لغة هولندية", nl: "Nederlandse taalcoach", en: "Dutch language coach" },
  { category: "teacher", ar: "مدرّس", nl: "Docent", en: "Teacher" },
  { category: "teacher", ar: "دروس خصوصية", nl: "Bijles", en: "Tutoring" },

  // business
  { category: "accountant", ar: "محاسب", nl: "Boekhouder", en: "Accountant" },
  { category: "accountant", ar: "إقرار ضريبي", nl: "Belastingaangifte", en: "Tax return" },
  { category: "marketing", ar: "تسويق", nl: "Marketing", en: "Marketing" },
  { category: "marketing", ar: "إدارة سوشيال ميديا", nl: "Social media beheer", en: "Social media management" },

  // creative & tech
  { category: "designer", ar: "مصمم", nl: "Ontwerper", en: "Designer" },
  { category: "designer", ar: "تصميم شعار", nl: "Logo-ontwerp", en: "Logo design" },
  { category: "photographer", ar: "مصور", nl: "Fotograaf", en: "Photographer" },
  { category: "writer", ar: "كاتب محتوى", nl: "Tekstschrijver", en: "Copywriter" },
  { category: "developer", ar: "مطور برمجيات", nl: "Softwareontwikkelaar", en: "Software developer" },
  { category: "developer", ar: "تصميم موقع", nl: "Website bouwen", en: "Website building" },
];

export type ServiceGroup = {
  id: string;
  emoji: string;
  categories: string[];
  ar: string;
  nl: string;
  en: string;
};

/** Groups over EXISTING category ids only. */
export const SERVICE_GROUPS: ServiceGroup[] = [
  { id: "maintenance", emoji: "🔧", categories: ["handyman"], ar: "صيانة وإصلاح", nl: "Onderhoud & reparatie", en: "Maintenance & repair" },
  { id: "legal", emoji: "⚖️", categories: ["lawyer"], ar: "قانون", nl: "Juridisch", en: "Legal" },
  { id: "consulting", emoji: "💼", categories: ["consultant", "notary_help"], ar: "استشارات وإدارة", nl: "Advies & administratie", en: "Consulting & admin" },
  { id: "translation", emoji: "🌐", categories: ["translator"], ar: "ترجمة", nl: "Vertalen", en: "Translation" },
  { id: "education", emoji: "📚", categories: ["teacher", "tutor_dutch"], ar: "تعليم ولغات", nl: "Onderwijs & talen", en: "Education & languages" },
  { id: "finance", emoji: "📊", categories: ["accountant"], ar: "محاسبة", nl: "Boekhouding", en: "Accounting" },
  { id: "marketing", emoji: "📣", categories: ["marketing", "writer"], ar: "تسويق ومحتوى", nl: "Marketing & content", en: "Marketing & content" },
  { id: "design", emoji: "🎨", categories: ["designer", "photographer"], ar: "تصميم وإبداع", nl: "Design & creatief", en: "Design & creative" },
  { id: "tech", emoji: "💻", categories: ["developer"], ar: "تقنية", nl: "Techniek & IT", en: "Tech & IT" },
  { id: "other", emoji: "✨", categories: ["other"], ar: "خدمات أخرى", nl: "Overige diensten", en: "Other services" },
];

export function groupLabel(g: ServiceGroup, lang: Lang) {
  return g[lang];
}

export function categoryLabel(id: string, lang: Lang) {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) return id;
  if (lang === "ar") return c.label;
  return c.labelNl;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Suggestion = { label: string; category: string; categoryLabel: string };

/** Suggests real services matching free text in AR / NL / EN. */
export function suggestServices(query: string, lang: Lang, limit = 6): Suggestion[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { s: Suggestion; score: number }[] = [];

  const push = (label: string, category: string, haystacks: string[]) => {
    let best = -1;
    for (const h of haystacks) {
      const n = normalize(h);
      if (!n) continue;
      if (n.startsWith(q)) best = Math.max(best, 3);
      else if (n.includes(q)) best = Math.max(best, 2);
      else if (q.length >= 3 && n.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 1);
    }
    if (best > 0) scored.push({ s: { label, category, categoryLabel: categoryLabel(category, lang) }, score: best });
  };

  for (const t of SERVICE_TERMS) {
    push(t[lang], t.category, [t.ar, t.nl, t.en]);
  }
  for (const c of CATEGORIES) {
    push(categoryLabel(c.id, lang), c.id, [c.label, c.labelNl, c.id]);
  }

  const seen = new Set<string>();
  return scored
    .sort((a, b) => b.score - a.score)
    .filter((x) => {
      const k = x.s.label + x.s.category;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit)
    .map((x) => x.s);
}

/** Free-text -> best matching existing category id (or null). */
export function matchCategory(query: string, lang: Lang): string | null {
  const s = suggestServices(query, lang, 1);
  return s[0]?.category ?? null;
}
