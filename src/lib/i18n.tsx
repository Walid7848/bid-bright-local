import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "nl" | "en";

const DICT = {
  // nav / header
  "nav.requests": { ar: "كل الطلبات", nl: "Alle aanvragen", en: "All requests" },
  "nav.myRequests": { ar: "طلباتي", nl: "Mijn aanvragen", en: "My requests" },
  "nav.myBids": { ar: "عروضي", nl: "Mijn offertes", en: "My bids" },
  "nav.newRequest": { ar: "طلب جديد", nl: "Nieuwe aanvraag", en: "New request" },
  "nav.profile": { ar: "ملفي الشخصي", nl: "Mijn profiel", en: "My profile" },
  "nav.signOut": { ar: "تسجيل الخروج", nl: "Uitloggen", en: "Sign out" },
  "nav.signIn": { ar: "تسجيل الدخول", nl: "Inloggen", en: "Sign in" },
  "nav.start": { ar: "ابدأ الآن", nl: "Begin nu", en: "Get started" },

  // brand
  "brand.name": { ar: "مِهنتي", nl: "Mihnati", en: "Mihnati" },
  "brand.tagline": {
    ar: "منصة الخدمات المهنية والحرفية في هولندا",
    nl: "Platform voor professionele en ambachtelijke diensten in Nederland",
    en: "Platform for professional and skilled services in the Netherlands",
  },

  // landing hero
  "hero.badge": {
    ar: "منصة لربط أصحاب المهن والحرفيين بالزبائن في هولندا",
    nl: "Verbindt professionals en vakmensen met klanten in Nederland",
    en: "Connecting professionals and tradespeople with clients in the Netherlands",
  },
  "hero.title": {
    ar: "اطلب خدمتك، واختر أفضل عرض من أصحاب المهن في هولندا",
    nl: "Vraag jouw dienst aan en kies de beste offerte in Nederland",
    en: "Post your request and pick the best offer from pros in the Netherlands",
  },
  "hero.subtitle": {
    ar: "سباكون، كهربائيون، عمال نظافة، محامون، مترجمون، مدرسون، مصممون واستشاريون — لجميع القاطنين في هولندا، بلغة تناسبك.",
    nl: "Loodgieters, elektriciens, schoonmakers, advocaten, vertalers, docenten, ontwerpers en consultants — voor iedereen in Nederland, in jouw taal.",
    en: "Plumbers, electricians, cleaners, lawyers, translators, teachers, designers and consultants — for everyone living in the Netherlands, in your language.",
  },
  "hero.cta.post": { ar: "انشر طلبك الآن", nl: "Plaats je aanvraag", en: "Post your request" },
  "hero.cta.pro": { ar: "أنا مقدم خدمة", nl: "Ik ben professional", en: "I'm a professional" },
  "hero.feature.noCommission": {
    ar: "بدون عمولة على العروض",
    nl: "Geen commissie op offertes",
    en: "No commission on bids",
  },
  "hero.feature.local": {
    ar: "مهنيون في مدينتك",
    nl: "Professionals in jouw stad",
    en: "Pros in your city",
  },
  "hero.feature.bilingual": {
    ar: "عربي / هولندي / إنجليزي",
    nl: "Arabisch / Nederlands / Engels",
    en: "Arabic / Dutch / English",
  },

  // how it works
  "how.title": { ar: "كيف تعمل المنصة؟", nl: "Hoe werkt het?", en: "How it works" },
  "how.subtitle": {
    ar: "ثلاث خطوات بسيطة تفصلك عن إنجاز طلبك",
    nl: "Drie eenvoudige stappen tot jouw dienst",
    en: "Three simple steps to get your job done",
  },
  "how.s1.title": { ar: "١. انشر طلبك", nl: "1. Plaats je aanvraag", en: "1. Post your request" },
  "how.s1.desc": {
    ar: "أضف تفاصيل الخدمة والوثائق أو الصور اللازمة.",
    nl: "Voeg de details van je vraag en eventuele documenten of foto's toe.",
    en: "Add the details of your job and any documents or photos.",
  },
  "how.s2.title": { ar: "٢. استقبل العروض", nl: "2. Ontvang offertes", en: "2. Receive offers" },
  "how.s2.desc": {
    ar: "مهنيون في هولندا يقدمون عروضاً مع السعر والمدة.",
    nl: "Professionals in Nederland sturen offertes met prijs en levertijd.",
    en: "Professionals in the Netherlands send offers with price and timeline.",
  },
  "how.s3.title": { ar: "٣. قارن واختر", nl: "3. Vergelijk en kies", en: "3. Compare and choose" },
  "how.s3.desc": {
    ar: "قارن العروض والخبرات ثم اختر ما يناسبك.",
    nl: "Vergelijk offertes en ervaring en kies wat bij je past.",
    en: "Compare offers and experience, then pick what fits you best.",
  },

  // for pros
  "pros.badge": { ar: "لأصحاب المهن", nl: "Voor professionals", en: "For professionals" },
  "pros.title": {
    ar: "وسّع مصادر دخلك في هولندا",
    nl: "Vergroot je inkomen in Nederland",
    en: "Grow your income in the Netherlands",
  },
  "pros.desc": {
    ar: "تصفح طلبات العملاء في هولندا، قدم عرضك مباشرة مع السعر والمدة، وابدأ العمل بمجرد قبول الزبون. بدون عمولة على العروض.",
    nl: "Bekijk klantaanvragen in Nederland, dien je offerte in met prijs en levertijd en start zodra de klant je kiest. Geen commissie op offertes.",
    en: "Browse client requests across the Netherlands, submit your offer with price and timeline, and start as soon as the client picks you. No commission on bids.",
  },
  "pros.point1": {
    ar: "عملاء حقيقيون بعدة لغات",
    nl: "Echte klanten in meerdere talen",
    en: "Real clients in multiple languages",
  },
  "pros.point2": {
    ar: "عرض واحد لكل طلب",
    nl: "Eén offerte per aanvraag",
    en: "One offer per request",
  },
  "pros.point3": {
    ar: "تواصل مباشر مع العميل بعد الاختيار",
    nl: "Direct contact met de klant na keuze",
    en: "Direct contact with the client after selection",
  },
  "pros.cta": {
    ar: "سجّل كمقدم خدمة",
    nl: "Meld je aan als professional",
    en: "Sign up as a professional",
  },

  // cta
  "cta.ready": { ar: "جاهز تبدأ؟", nl: "Klaar om te beginnen?", en: "Ready to start?" },
  "cta.readyDesc": {
    ar: "سواء تبحث عن خدمة أو تقدمها، منصتك تنتظرك.",
    nl: "Of je nu een dienst zoekt of aanbiedt — het platform staat voor je klaar.",
    en: "Whether you need a service or offer one — the platform is ready for you.",
  },
  "cta.signup": {
    ar: "إنشاء حساب مجاني",
    nl: "Gratis account aanmaken",
    en: "Create a free account",
  },

  // auth
  "auth.welcome": { ar: "أهلاً بك", nl: "Welkom", en: "Welcome" },
  "auth.subtitle": {
    ar: "سجّل دخولك أو أنشئ حساباً جديداً للبدء",
    nl: "Log in of maak een account om te beginnen",
    en: "Sign in or create an account to get started",
  },
  "auth.signin": { ar: "تسجيل الدخول", nl: "Inloggen", en: "Sign in" },
  "auth.signup": { ar: "حساب جديد", nl: "Nieuw account", en: "New account" },
  "auth.fullName": { ar: "الاسم الكامل", nl: "Volledige naam", en: "Full name" },
  "auth.email": { ar: "البريد الإلكتروني", nl: "E-mailadres", en: "Email" },
  "auth.password": { ar: "كلمة المرور", nl: "Wachtwoord", en: "Password" },
  "auth.createBtn": { ar: "إنشاء الحساب", nl: "Account aanmaken", en: "Create account" },
  "auth.or": { ar: "أو", nl: "of", en: "or" },
  "auth.google": {
    ar: "متابعة عبر Google",
    nl: "Doorgaan met Google",
    en: "Continue with Google",
  },
  "auth.side": {
    ar: "انضم لمجتمع أصحاب المهن والحرفيين في هولندا",
    nl: "Sluit je aan bij de professionals en vakmensen in Nederland",
    en: "Join the community of professionals and tradespeople in the Netherlands",
  },
  "auth.sideDesc": {
    ar: "انشر طلبك، استقبل عروضاً، واختر الأنسب.",
    nl: "Plaats je aanvraag, ontvang offertes en kies de beste.",
    en: "Post your request, receive offers and pick the best one.",
  },

  // common
  "common.language": { ar: "اللغة", nl: "Taal", en: "Language" },
  "common.currency": { ar: "€", nl: "€", en: "€" },
} as const;

type Key = keyof typeof DICT;

const LANGS: Lang[] = ["ar", "nl", "en"];

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
    if (saved && LANGS.includes(saved)) setLangState(saved);
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
    <div
      className={
        "inline-flex h-8 items-center rounded-md border border-border/60 bg-background/50 p-0.5 text-xs font-medium " +
        className
      }
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={
            "rounded px-2 py-1 transition " +
            (lang === l
              ? "bg-accent font-bold text-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
