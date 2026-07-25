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
  "common.back": { ar: "العودة للرئيسية", nl: "Terug naar home", en: "Back to home" },

  // footer / legal
  "footer.privacy": { ar: "سياسة الخصوصية", nl: "Privacybeleid", en: "Privacy Policy" },
  "footer.terms": { ar: "شروط الخدمة", nl: "Servicevoorwaarden", en: "Terms of Service" },
  "footer.rights": {
    ar: "جميع الحقوق محفوظة",
    nl: "Alle rechten voorbehouden",
    en: "All rights reserved",
  },

  // privacy
  "privacy.title": { ar: "سياسة الخصوصية", nl: "Privacybeleid", en: "Privacy Policy" },
  "privacy.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "privacy.intro": {
    ar: "تحترم منصة مِهنتي خصوصيتك. توضح هذه السياسة كيف نجمع بياناتك ونستخدمها ونحميها عند استخدامك للمنصة في هولندا.",
    nl: "Mihnati respecteert je privacy. Dit beleid legt uit hoe wij je gegevens verzamelen, gebruiken en beschermen wanneer je het platform in Nederland gebruikt.",
    en: "Mihnati respects your privacy. This policy explains how we collect, use and protect your data when you use the platform in the Netherlands.",
  },
  "privacy.s1.title": { ar: "١. البيانات التي نجمعها", nl: "1. Gegevens die wij verzamelen", en: "1. Data we collect" },
  "privacy.s1.body": {
    ar: "الاسم، البريد الإلكتروني، رقم الهاتف، المدينة، الفئة المهنية، صور ووصف الطلبات، والعروض والتقييمات التي تنشرها على المنصة.",
    nl: "Naam, e-mail, telefoonnummer, stad, beroepscategorie, foto's en beschrijvingen van aanvragen, en offertes en beoordelingen die je plaatst.",
    en: "Name, email, phone number, city, professional category, images and descriptions of your requests, and the bids and reviews you post.",
  },
  "privacy.s2.title": { ar: "٢. كيف نستخدم البيانات", nl: "2. Hoe wij gegevens gebruiken", en: "2. How we use data" },
  "privacy.s2.body": {
    ar: "لتشغيل خدمة المزايدة، وربط الزبائن بأصحاب المهن في نفس المدينة، وإدارة الاشتراكات، وإرسال إشعارات الخدمة، وتحسين تجربة المستخدم.",
    nl: "Om de dienst te leveren, klanten te koppelen aan professionals in dezelfde stad, abonnementen te beheren, meldingen te sturen en de ervaring te verbeteren.",
    en: "To operate the bidding service, match clients with professionals in the same city, manage subscriptions, send notifications, and improve the experience.",
  },
  "privacy.s3.title": { ar: "٣. مشاركة البيانات", nl: "3. Delen van gegevens", en: "3. Sharing data" },
  "privacy.s3.body": {
    ar: "لا نبيع بياناتك. نشاركها فقط مع مزودي الخدمة الضروريين (الاستضافة، معالجة الدفع، البريد) أو عند الالتزام قانونياً.",
    nl: "Wij verkopen je gegevens niet. Wij delen ze alleen met noodzakelijke leveranciers (hosting, betaling, e-mail) of wanneer wettelijk vereist.",
    en: "We do not sell your data. We share it only with essential providers (hosting, payments, email) or when legally required.",
  },
  "privacy.s4.title": { ar: "٤. حقوقك (GDPR)", nl: "4. Jouw rechten (AVG)", en: "4. Your rights (GDPR)" },
  "privacy.s4.body": {
    ar: "لك الحق في الوصول إلى بياناتك وتصحيحها وحذفها ونقلها. للتواصل: privacy@mihnati.nl",
    nl: "Je hebt recht op inzage, correctie, verwijdering en overdraagbaarheid. Contact: privacy@mihnati.nl",
    en: "You have the right to access, correct, delete and port your data. Contact: privacy@mihnati.nl",
  },
  "privacy.s5.title": { ar: "٥. أمان البيانات", nl: "5. Beveiliging", en: "5. Data security" },
  "privacy.s5.body": {
    ar: "نستخدم تشفيراً وسياسات وصول صارمة (RLS) لحماية بياناتك ونطبق أفضل الممارسات المتاحة.",
    nl: "Wij gebruiken encryptie en strikt toegangsbeheer (RLS) en passen best practices toe.",
    en: "We use encryption and strict access controls (RLS) and apply industry best practices.",
  },

  // terms
  "terms.title": { ar: "شروط الخدمة", nl: "Servicevoorwaarden", en: "Terms of Service" },
  "terms.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "terms.intro": {
    ar: "باستخدامك منصة مِهنتي فأنت توافق على هذه الشروط. يرجى قراءتها بعناية.",
    nl: "Door Mihnati te gebruiken ga je akkoord met deze voorwaarden.",
    en: "By using Mihnati you agree to these terms. Please read them carefully.",
  },
  "terms.s1.title": { ar: "١. طبيعة الخدمة", nl: "1. Aard van de dienst", en: "1. Nature of service" },
  "terms.s1.body": {
    ar: "مِهنتي منصة وسيطة تربط الزبائن بأصحاب المهن في هولندا. المنصة ليست طرفاً في العقد بين الزبون ومقدم الخدمة.",
    nl: "Mihnati is een tussenplatform dat klanten en professionals in Nederland verbindt. Het platform is geen partij bij de overeenkomst.",
    en: "Mihnati is an intermediary platform connecting clients with professionals in the Netherlands. It is not a party to the contract.",
  },
  "terms.s2.title": { ar: "٢. الحساب والاستخدام", nl: "2. Account en gebruik", en: "2. Account and use" },
  "terms.s2.body": {
    ar: "يجب تقديم معلومات صحيحة، أن يكون عمرك 18 سنة فأكثر، والحفاظ على سرية بيانات الدخول. أي استخدام احتيالي يؤدي إلى إغلاق الحساب.",
    nl: "Verstrek correcte informatie, wees minstens 18 en houd je inloggegevens vertrouwelijk. Misbruik leidt tot accountsluiting.",
    en: "Provide accurate information, be at least 18, and keep credentials confidential. Abuse leads to account termination.",
  },
  "terms.s3.title": { ar: "٣. الاشتراكات والمدفوعات", nl: "3. Abonnementen en betalingen", en: "3. Subscriptions and payments" },
  "terms.s3.body": {
    ar: "استخدام المنصة مجاني للزبائن. يحصل أصحاب المهن على شهرين تجريبيين مجاناً، وبعدها يلزم اشتراك مدفوع لتقديم عروض غير محدودة. يمكن إلغاء الاشتراك في أي وقت ويبقى ساري المفعول حتى نهاية الفترة المدفوعة.",
    nl: "Gratis voor klanten. Professionals krijgen twee gratis proefmaanden; daarna is een betaald abonnement vereist voor onbeperkte offertes. Opzeggen kan altijd; blijft actief tot einde van de betaalde periode.",
    en: "Free for clients. Professionals get a two-month free trial; a paid subscription is then required for unlimited bids. Cancellation is possible anytime and remains active until the end of the paid period.",
  },
  "terms.s4.title": { ar: "٤. المحتوى والسلوك", nl: "4. Inhoud en gedrag", en: "4. Content and conduct" },
  "terms.s4.body": {
    ar: "أنت مسؤول عن أي محتوى تنشره. يُحظر المحتوى غير القانوني أو المسيء أو المضلل، وانتحال هوية الغير، ومحاولة التحايل على المنصة.",
    nl: "Je bent verantwoordelijk voor je inhoud. Illegale, aanstootgevende of misleidende content en misbruik zijn verboden.",
    en: "You are responsible for content you post. Illegal, offensive or misleading content and platform circumvention are prohibited.",
  },
  "terms.s5.title": { ar: "٥. إخلاء المسؤولية", nl: "5. Aansprakelijkheid", en: "5. Disclaimer" },
  "terms.s5.body": {
    ar: "لا تضمن المنصة جودة الخدمة المقدمة من أصحاب المهن ولا تتحمل مسؤولية النزاعات. جميع الاتفاقيات وتنفيذ العمل تتم مباشرة بين الطرفين.",
    nl: "Het platform garandeert geen dienstkwaliteit en is niet aansprakelijk voor geschillen. Afspraken en uitvoering zijn tussen partijen onderling.",
    en: "The platform does not guarantee service quality and is not liable for disputes. Arrangements and delivery occur directly between the parties.",
  },
  "terms.s6.title": { ar: "٦. القانون المطبق", nl: "6. Toepasselijk recht", en: "6. Governing law" },
  "terms.s6.body": {
    ar: "تخضع هذه الشروط للقانون الهولندي وتختص محاكم هولندا بأي نزاع.",
    nl: "Op deze voorwaarden is Nederlands recht van toepassing; geschillen bij de Nederlandse rechter.",
    en: "Governed by Dutch law; disputes fall under Dutch courts.",
  },

  // cookie policy
  "cookies.title": { ar: "سياسة ملفات تعريف الارتباط", nl: "Cookiebeleid", en: "Cookie Policy" },
  "cookies.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "cookies.intro": {
    ar: "تستخدم منصة مِهنتي ملفات تعريف الارتباط (Cookies) لتحسين تجربتك وفهم كيفية استخدام المنصة. توضح هذه السياسة أنواع الملفات التي نستخدمها وأغراضها وكيف يمكنك التحكم بها.",
    nl: "Mihnati gebruikt cookies om je ervaring te verbeteren en te begrijpen hoe het platform wordt gebruikt. Dit beleid legt uit welke cookies wij gebruiken, waarvoor en hoe je ze kunt beheren.",
    en: "Mihnati uses cookies to improve your experience and understand how the platform is used. This policy explains what cookies we use, why, and how you can manage them.",
  },
  "cookies.s1.title": { ar: "١. ما هي ملفات تعريف الارتباط؟", nl: "1. Wat zijn cookies?", en: "1. What are cookies?" },
  "cookies.s1.body": {
    ar: "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزّن على جهازك عند زيارة الموقع. تساعدنا على تذكر تفضيلاتك والحفاظ على تسجيل دخولك وتحليل استخدام المنصة.",
    nl: "Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je de site bezoekt. Ze helpen ons om je voorkeuren te onthouden, je sessie te behouden en het gebruik te analyseren.",
    en: "Cookies are small text files stored on your device when you visit the site. They help us remember your preferences, keep you signed in, and analyze platform usage.",
  },
  "cookies.s2.title": { ar: "٢. أنواع ملفات الارتباط التي نستخدمها", nl: "2. Welke cookies wij gebruiken", en: "2. Types of cookies we use" },
  "cookies.s2.body": {
    ar: "نستخدم ملفات ضرورية لتشغيل الموقع (مثل تسجيل الدخول واللغة)، وملفات تحليلية لفهم التفاعل مع المنصة، وملفات وظيفية لتذكر اختياراتك مثل اللغة المفضلة.",
    nl: "Wij gebruiken noodzakelijke cookies voor de werking van de site (zoals inloggen en taal), analytische cookies om interactie met het platform te begrijpen, en functionele cookies om je keuzes zoals je voorkeurstaal te onthouden.",
    en: "We use essential cookies for site operation (such as login and language), analytics cookies to understand interaction with the platform, and functional cookies to remember your choices such as preferred language.",
  },
  "cookies.s3.title": { ar: "٣. أغراض الاستخدام", nl: "3. Doeleinden", en: "3. Purposes" },
  "cookies.s3.body": {
    ar: "نستخدم ملفات الارتباط لتأمين حسابك، وتذكر لغتك المختارة، وقياس أداء المنصة، وتحسين الخدمات المقدمة. لا نبيع بيانات ملفات الارتباط الخاصة بك.",
    nl: "Wij gebruiken cookies om je account te beveiligen, je gekozen taal te onthouden, de prestaties van het platform te meten en onze diensten te verbeteren. Wij verkopen je cookiegegevens niet.",
    en: "We use cookies to secure your account, remember your selected language, measure platform performance, and improve our services. We do not sell your cookie data.",
  },
  "cookies.s4.title": { ar: "٤. كيف تتحكم في ملفات الارتباط", nl: "4. Cookies beheren", en: "4. Managing cookies" },
  "cookies.s4.body": {
    ar: "يمكنك حذف ملفات تعريف الارتباط أو حظرها من إعدادات المتصفح. لاحظ أن تعطيل بعض الملفات الضرورية قد يؤثر على عمل الموقع.",
    nl: "Je kunt cookies verwijderen of blokkeren via je browserinstellingen. Houd er rekening mee dat het uitschakelen van essentiële cookies de werking van de site kan beïnvloeden.",
    en: "You can delete or block cookies through your browser settings. Please note that disabling essential cookies may affect site functionality.",
  },
  "cookies.s5.title": { ar: "٥. التواصل", nl: "5. Contact", en: "5. Contact" },
  "cookies.s5.body": {
    ar: "إذا كان لديك أي سؤال حول سياسة ملفات الارتباط، يمكنك التواصل معنا على: privacy@mihnati.nl",
    nl: "Als je vragen hebt over dit cookiebeleid, kun je contact opnemen via: privacy@mihnati.nl",
    en: "If you have any questions about this cookie policy, you can contact us at: privacy@mihnati.nl",
  },

  // footer
  "footer.cookies": { ar: "سياسة ملفات تعريف الارتباط", nl: "Cookiebeleid", en: "Cookie Policy" },
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
