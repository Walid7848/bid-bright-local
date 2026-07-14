export const CATEGORIES = [
  { id: "lawyer", label: "محامي", labelNl: "Advocaat" },
  { id: "translator", label: "مترجم", labelNl: "Vertaler / Tolk" },
  { id: "teacher", label: "مدرّس", labelNl: "Docent / Bijles" },
  { id: "consultant", label: "استشاري", labelNl: "Consultant" },
  { id: "designer", label: "مصمم", labelNl: "Ontwerper" },
  { id: "developer", label: "مطور برمجيات", labelNl: "Softwareontwikkelaar" },
  { id: "accountant", label: "محاسب", labelNl: "Boekhouder" },
  { id: "photographer", label: "مصور", labelNl: "Fotograaf" },
  { id: "marketing", label: "تسويق", labelNl: "Marketing" },
  { id: "writer", label: "كاتب محتوى", labelNl: "Tekstschrijver" },
  { id: "handyman", label: "مهن حرة (صيانة، تركيب)", labelNl: "Klusjesman" },
  { id: "tutor_dutch", label: "معلم لغة هولندية", labelNl: "Nederlandse taalcoach" },
  { id: "notary_help", label: "مساعدة إدارية / كتابية", labelNl: "Administratieve hulp" },
  { id: "other", label: "أخرى", labelNl: "Overig" },
] as const;

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
export const CATEGORY_MAP_NL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.labelNl]));

export function getCategoryLabel(id: string, lang: "ar" | "nl" = "ar") {
  return (lang === "nl" ? CATEGORY_MAP_NL[id] : CATEGORY_MAP[id]) || id;
}
