export const CATEGORIES = [
  { id: "plumbing", label: "سباكة" },
  { id: "electrical", label: "كهرباء" },
  { id: "carpentry", label: "نجارة" },
  { id: "painting", label: "دهان" },
  { id: "ac", label: "تكييف وتبريد" },
  { id: "cleaning", label: "تنظيف" },
  { id: "moving", label: "نقل عفش" },
  { id: "gardening", label: "بستنة" },
  { id: "construction", label: "بناء وترميم" },
  { id: "tiling", label: "بلاط ورخام" },
  { id: "welding", label: "حدادة" },
  { id: "appliance", label: "صيانة أجهزة منزلية" },
  { id: "other", label: "أخرى" },
] as const;

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
