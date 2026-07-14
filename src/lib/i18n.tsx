import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "nl";

const DICT = {
  // nav / header
  "nav.requests": { ar: "كل الطلبات", nl: "Alle aanvragen" },
  "nav.myRequests": { ar: "طلباتي", nl: "Mijn aanvragen" },
  "nav.myBids": { ar: "عروضي", nl: "Mijn offertes" },
  "nav.newRequest": { ar: "طلب جديد", nl: "Nieuwe aanvraag" },
  "nav.profile": { ar: "ملفي الشخصي", nl: "Mijn profiel" },
  "nav.signOut": { ar: "تسجيل الخروج", nl: "Uitloggen" },
  "nav.signIn": { ar: "تسجيل الدخول", nl: "Inloggen" },
  "nav.start": { ar: "ابدأ الآن", nl: "Begin nu" },

  // brand
  "brand.name": { ar: "مِهنتي", nl: "Mihnati" },
  "brand.tagline": {
    ar: "منصة السوريين في هولندا للخدمات المهنية الحرة",
    nl: "Platform voor Syrische freelancers in Nederland",
  },

  // landing hero
  "hero.badge": {
    ar: "منصة الخدمات المهنية للسوريين في هولندا",
    nl: "Professionele diensten door Syriërs in Nederland",
  },
  "hero.title": {
    ar: "اطلب خدمتك، واختر أفضل عرض من أهل الخبرة في هولندا",
    nl: "Vraag jouw dienst aan en kies de beste offerte in Nederland",
  },
  "hero.subtitle": {
    ar: "محامون، مترجمون، مدرسون، استشاريون، مصممون ومهنيون سوريون في مدينتك — بلغتك وبفهم كامل لظروفك.",
    nl: "Advocaten, vertalers, docenten, consultants, ontwerpers en Syrische professionals in jouw stad — in jouw taal.",
  },
  "hero.cta.post": { ar: "انشر طلبك الآن", nl: "Plaats je aanvraag" },
  "hero.cta.pro": { ar: "أنا مقدم خدمة", nl: "Ik ben professional" },
  "hero.feature.noCommission": { ar: "بدون عمولة على العروض", nl: "Geen commissie op offertes" },
  "hero.feature.local": { ar: "مهنيون في مدينتك", nl: "Professionals in jouw stad" },
  "hero.feature.bilingual": { ar: "عربي / هولندي", nl: "Arabisch / Nederlands" },

  // how it works
  "how.title": { ar: "كيف تعمل المنصة؟", nl: "Hoe werkt het?" },
  "how.subtitle": {
    ar: "ثلاث خطوات بسيطة تفصلك عن إنجاز طلبك",
    nl: "Drie eenvoudige stappen tot jouw dienst",
  },
  "how.s1.title": { ar: "١. انشر طلبك", nl: "1. Plaats je aanvraag" },
  "how.s1.desc": {
    ar: "أضف تفاصيل الخدمة والوثائق أو الصور اللازمة.",
    nl: "Voeg de details van je vraag en eventuele documenten of foto's toe.",
  },
  "how.s2.title": { ar: "٢. استقبل العروض", nl: "2. Ontvang offertes" },
  "how.s2.desc": {
    ar: "مهنيون سوريون في هولندا يقدمون عروضاً مع السعر والمدة.",
    nl: "Syrische professionals in Nederland sturen offertes met prijs en levertijd.",
  },
  "how.s3.title": { ar: "٣. قارن واختر", nl: "3. Vergelijk en kies" },
  "how.s3.desc": {
    ar: "قارن العروض والخبرات ثم اختر ما يناسبك.",
    nl: "Vergelijk offertes en ervaring en kies wat bij je past.",
  },

  // for pros
  "pros.badge": { ar: "لأصحاب المهن", nl: "Voor professionals" },
  "pros.title": { ar: "وسّع مصادر دخلك في هولندا", nl: "Vergroot je inkomen in Nederland" },
  "pros.desc": {
    ar: "تصفح طلبات المجتمع السوري في هولندا، قدم عرضك مباشرة مع السعر والمدة، وابدأ العمل بمجرد قبول الزبون. بدون عمولة على العروض.",
    nl: "Bekijk aanvragen van de Syrische gemeenschap in Nederland, dien je offerte in en start zodra de klant je kiest. Geen commissie op offertes.",
  },
  "pros.point1": {
    ar: "عملاء حقيقيون بالعربية والهولندية",
    nl: "Echte klanten in het Arabisch en Nederlands",
  },
  "pros.point2": { ar: "عرض واحد لكل طلب", nl: "Eén offerte per aanvraag" },
  "pros.point3": {
    ar: "تواصل مباشر مع العميل بعد الاختيار",
    nl: "Direct contact met de klant na keuze",
  },
  "pros.cta": { ar: "سجّل كمقدم خدمة", nl: "Meld je aan als professional" },

  // cta
  "cta.ready": { ar: "جاهز تبدأ؟", nl: "Klaar om te beginnen?" },
  "cta.readyDesc": {
    ar: "سواء تبحث عن خدمة أو تقدمها، منصتك تنتظرك.",
    nl: "Of je nu een dienst zoekt of aanbiedt — het platform staat voor je klaar.",
  },
  "cta.signup": { ar: "إنشاء حساب مجاني", nl: "Gratis account aanmaken" },

  // auth
  "auth.welcome": { ar: "أهلاً بك", nl: "Welkom" },
  "auth.subtitle": {
    ar: "سجّل دخولك أو أنشئ حساباً جديداً للبدء",
    nl: "Log in of maak een account om te beginnen",
  },
  "auth.signin": { ar: "تسجيل الدخول", nl: "Inloggen" },
  "auth.signup": { ar: "حساب جديد", nl: "Nieuw account" },
  "auth.fullName": { ar: "الاسم الكامل", nl: "Volledige naam" },
  "auth.email": { ar: "البريد الإلكتروني", nl: "E-mailadres" },
  "auth.password": { ar: "كلمة المرور", nl: "Wachtwoord" },
  "auth.createBtn": { ar: "إنشاء الحساب", nl: "Account aanmaken" },
  "auth.or": { ar: "أو", nl: "of" },
  "auth.google": { ar: "متابعة عبر Google", nl: "Doorgaan met Google" },
  "auth.side": {
    ar: "انضم لمجتمع السوريين المحترفين في هولندا",
    nl: "Sluit je aan bij de Syrische professionals in Nederland",
  },
  "auth.sideDesc": {
    ar: "انشر طلبك، استقبل عروضاً، واختر الأنسب.",
    nl: "Plaats je aanvraag, ontvang offertes en kies de beste.",
  },

  // common
  "common.language": { ar: "اللغة", nl: "Taal" },
  "common.currency": { ar: "€", nl: "€" },
} as const;

type Key = keyof typeof DICT;

const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key) => string;
}>({
  lang: "ar",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "nl") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", l);
  }

  function t(key: Key) {
    return DICT[key]?.[lang] ?? key;
  }

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "ar" ? "nl" : "ar")}
      className={
        "inline-flex h-8 items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 text-xs font-medium hover:bg-accent " +
        className
      }
      aria-label="Switch language"
    >
      <span className={lang === "ar" ? "font-bold text-foreground" : "text-muted-foreground"}>AR</span>
      <span className="text-muted-foreground">/</span>
      <span className={lang === "nl" ? "font-bold text-foreground" : "text-muted-foreground"}>NL</span>
    </button>
  );
}
