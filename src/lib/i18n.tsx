import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "nl" | "en";

const DICT = {
  // nav / header
  "nav.requests": { ar: "كل الطلبات", nl: "Alle aanvragen", en: "All requests" },
  "nav.myRequests": { ar: "طلباتي", nl: "Mijn aanvragen", en: "My requests" },
  "nav.myBids": { ar: "عروضي", nl: "Mijn offertes", en: "My bids" },
  "nav.dashboard": { ar: "لوحتي", nl: "Mijn dashboard", en: "Dashboard" },
  "dash.title": { ar: "لوحتي", nl: "Mijn dashboard", en: "My dashboard" },
  "dash.subtitle": {
    ar: "طلباتي وعروضي في مكان واحد",
    nl: "Mijn aanvragen en offertes op één plek",
    en: "My requests and bids in one place",
  },
  "dash.noRequests": { ar: "لا توجد طلبات مطابقة", nl: "Geen aanvragen gevonden", en: "No matching requests" },
  "dash.noBids": { ar: "لا توجد عروض مطابقة", nl: "Geen offertes gevonden", en: "No matching bids" },
  "dash.needClient": {
    ar: "فعّل وضع «طالب خدمة» لنشر طلب جديد",
    nl: "Schakel naar de klantmodus om een aanvraag te plaatsen",
    en: "Switch to client mode to post a request",
  },
  "dash.needPro": {
    ar: "فعّل وضع «مقدم خدمة» لتقديم عروض",
    nl: "Schakel naar de professionalmodus om offertes te sturen",
    en: "Switch to professional mode to place bids",
  },
  "status.all": { ar: "الكل", nl: "Alles", en: "All" },
  "status.open": { ar: "مفتوح", nl: "Open", en: "Open" },
  "status.awarded": { ar: "تم الاختيار", nl: "Gegund", en: "Awarded" },
  "status.in_progress": { ar: "قيد التنفيذ", nl: "In uitvoering", en: "In progress" },
  "status.completed": { ar: "مكتمل", nl: "Afgerond", en: "Completed" },
  "status.closed": { ar: "مغلق", nl: "Gesloten", en: "Closed" },
  "status.pending": { ar: "قيد الانتظار", nl: "In afwachting", en: "Pending" },
  "status.accepted": { ar: "مقبول", nl: "Geaccepteerd", en: "Accepted" },
  "status.rejected": { ar: "مرفوض", nl: "Afgewezen", en: "Rejected" },
  "nav.newRequest": { ar: "طلب جديد", nl: "Nieuwe aanvraag", en: "New request" },
  "nav.profile": { ar: "ملفي الشخصي", nl: "Mijn profiel", en: "My profile" },
  "nav.signOut": { ar: "تسجيل الخروج", nl: "Uitloggen", en: "Sign out" },
  "nav.signIn": { ar: "تسجيل الدخول", nl: "Inloggen", en: "Sign in" },
  "nav.start": { ar: "ابدأ الآن", nl: "Begin nu", en: "Get started" },
  "nav.home": { ar: "الرئيسية", nl: "Home", en: "Home" },
  "nav.services": { ar: "الخدمات", nl: "Diensten", en: "Services" },
  "nav.providers": { ar: "مقدمو الخدمات", nl: "Professionals", en: "Professionals" },
  "nav.how": { ar: "كيف تعمل المنصة", nl: "Hoe het werkt", en: "How it works" },
  "nav.about": { ar: "عن وصلة", nl: "Over Wasla", en: "About Wasla" },
  "nav.menu": { ar: "القائمة", nl: "Menu", en: "Menu" },
  "nav.close": { ar: "إغلاق", nl: "Sluiten", en: "Close" },
  "nav.language": { ar: "اللغة", nl: "Taal", en: "Language" },

  // account mode / roles
  "role.client": { ar: "طالب خدمة", nl: "Klant", en: "Client" },
  "role.professional": { ar: "مقدم خدمة", nl: "Professional", en: "Professional" },
  "role.mode": { ar: "وضع الحساب", nl: "Accountmodus", en: "Account mode" },
  "role.switch": { ar: "تبديل الوضع", nl: "Wissel modus", en: "Switch mode" },
  "role.switched": { ar: "تم تبديل وضع الحساب", nl: "Accountmodus gewijzigd", en: "Account mode switched" },
  "role.enableHint": {
    ar: "يمكنك تفعيل الوضع الآخر في أي وقت والتنقل بينهما بحرية.",
    nl: "Je kunt de andere modus altijd activeren en vrij wisselen.",
    en: "You can enable the other mode anytime and switch freely.",
  },
  "role.required": {
    ar: "هذا الإجراء يتطلب الوضع",
    nl: "Deze actie vereist de modus",
    en: "This action requires the mode",
  },
  "role.requiredHint": {
    ar: "فعّل الوضع المطلوب للمتابعة. يمكنك التبديل بين الوضعين في أي وقت.",
    nl: "Activeer de vereiste modus om door te gaan. Je kunt altijd wisselen.",
    en: "Activate the required mode to continue. You can switch anytime.",
  },
  "role.activate": {
    ar: "تفعيل الوضع",
    nl: "Modus activeren",
    en: "Activate mode",
  },


  // brand
  "brand.name": { ar: "وصلة", nl: "Wasla", en: "Wasla" },
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
    ar: "خدمتك المناسبة، من الشخص المناسب في هولندا",
    nl: "De juiste dienst, van de juiste persoon in Nederland",
    en: "The right service, from the right person in the Netherlands",
  },
  "hero.badges.legal": { ar: "محاماة واستشارات", nl: "Recht & advies", en: "Legal & advice" },
  "hero.badges.translation": { ar: "ترجمة وتدقيق", nl: "Vertalen & proeflezen", en: "Translation & proofreading" },
  "hero.badges.accounting": { ar: "محاسبة وضرائب", nl: "Boekhouding & belasting", en: "Accounting & tax" },
  "hero.badges.home": { ar: "صيانة وتجهيز منازل", nl: "Klussen & woninginrichting", en: "Home repair & setup" },
  "hero.badges.moving": { ar: "نقل وخدمات", nl: "Verhuizen & diensten", en: "Moving & services" },

  "hero.subtitle": {
    ar: "من الحرفيين وأصحاب المهن الحرة إلى الخبراء والمتخصصين، تساعدك وصلة في العثور على الخدمة التي تحتاجها بسهولة وثقة.",
    nl: "Van vakmensen en zelfstandigen tot experts en specialisten: Wasla helpt je eenvoudig en vertrouwd de dienst te vinden die je nodig hebt.",
    en: "From tradespeople and freelancers to experts and specialists, Wasla helps you find the service you need, easily and confidently.",
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
  "hero.trust.professionals": {
    ar: "جميعهم محترفون في مجال عملهم",
    nl: "Allemaal professionals in hun vakgebied",
    en: "All professionals in their field",
  },
  "hero.why.title": { ar: "لماذا وصلة؟", nl: "Waarom Wasla?", en: "Why Wasla?" },
  "hero.why.point1": {
    ar: "بلغة تفهمها، وبدون عمولات: منصة مجانية بالكامل تربطك بأفضل المهنيين والحرفيين بلغات متعددة.",
    nl: "In een taal die je begrijpt, zonder commissie: een volledig gratis platform dat je verbindt met de beste professionals en vakmensen in meerdere talen.",
    en: "In a language you understand, with no commissions: a completely free platform connecting you with the best professionals and tradespeople in multiple languages.",
  },
  "hero.why.point2": {
    ar: "حساب واحد لجميع احتياجاتك: تنقّل بسلاسة بين تقديم الخدمات أو طلبها من نفس الحساب.",
    nl: "Eén account voor al je behoeften: schakel naadloos tussen het aanbieden van diensten en het aanvragen ervan vanuit hetzelfde account.",
    en: "One account for all your needs: seamlessly switch between offering services and requesting them from the same account.",
  },
  "hero.why.point3": {
    ar: "أفضل العروض والفرص: سواء كنت تبحث عن منفّذ لخدمتك بأفضل سعر، أو ترغب في زيادة دخلك كمهني، فأنت في المكان المناسب.",
    nl: "De beste aanbiedingen en kansen: of je nu op zoek bent naar iemand die je dienst tegen de beste prijs uitvoert, of je inkomen als professional wilt vergroten, je bent op de juiste plek.",
    en: "The best offers and opportunities: whether you're looking for someone to perform your service at the best price, or want to increase your income as a professional, you're in the right place.",
  },

  // how it works
  "how.title": { ar: "كيف تعمل المنصة؟", nl: "Hoe werkt het?", en: "How it works" },
  "how.subtitle": {
    ar: "خمس خطوات بسيطة تفصلك عن إنجاز طلبك",
    nl: "Vijf eenvoudige stappen tot jouw dienst",
    en: "Five simple steps to get your job done",
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
  "how.s3.title": { ar: "٣. اختر الأنسب", nl: "3. Kies de beste", en: "3. Choose the best fit" },
  "how.s3.desc": {
    ar: "قارن الأسعار والمدة والتقييمات ثم اختر العرض الأنسب لك.",
    nl: "Vergelijk prijs, levertijd en beoordelingen en kies de beste offerte.",
    en: "Compare price, timeline and ratings, then pick the best offer.",
  },
  "how.s4.title": { ar: "٤. تنفيذ الخدمة", nl: "4. Dienst uitvoeren", en: "4. Get the job done" },
  "how.s4.desc": {
    ar: "تواصل مباشرة مع مقدم الخدمة وتابع تنفيذ العمل حتى الانتهاء.",
    nl: "Neem direct contact op met de professional en volg het werk tot oplevering.",
    en: "Contact the professional directly and follow the work to completion.",
  },
  "how.s5.title": { ar: "٥. تقييم الخدمة", nl: "5. Beoordeel de dienst", en: "5. Rate the service" },
  "how.s5.desc": {
    ar: "قيّم مقدم الخدمة بالنجوم واكتب تجربتك لمساعدة الآخرين.",
    nl: "Geef sterren en deel je ervaring om anderen te helpen kiezen.",
    en: "Leave a star rating and share your experience to help others.",
  },

  // for pros
  "pros.badge": { ar: "لأصحاب المهن", nl: "Voor professionals", en: "For professionals" },
  "pros.title": {
    ar: "حوّل مهارتك إلى فرصة جديدة",
    nl: "Zet je vaardigheid om in een nieuwe kans",
    en: "Turn your skill into a new opportunity",
  },
  "pros.desc": {
    ar: "لديك مهنة أو حرفة أو خبرة؟ اعرض خدماتك، وصل إلى عملاء جدد، وابنِ سمعتك المهنية عبر وصلة.",
    nl: "Heb je een beroep, vak of ervaring? Bied je diensten aan, bereik nieuwe klanten en bouw je professionele reputatie via Wasla.",
    en: "Have a profession, trade or experience? Offer your services, reach new clients and build your professional reputation through Wasla.",
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
  "common.loadError": {
    ar: "تعذر تحميل البيانات",
    nl: "Gegevens konden niet worden geladen",
    en: "Couldn't load data",
  },
  "common.retry": { ar: "إعادة المحاولة", nl: "Opnieuw proberen", en: "Try again" },

  // footer / legal
  "footer.privacy": { ar: "سياسة الخصوصية", nl: "Privacybeleid", en: "Privacy Policy" },
  "footer.terms": { ar: "شروط الخدمة", nl: "Servicevoorwaarden", en: "Terms of Service" },
  "footer.about": { ar: "من نحن", nl: "Over ons", en: "About us" },
  "footer.rights": {
    ar: "جميع الحقوق محفوظة",
    nl: "Alle rechten voorbehouden",
    en: "All rights reserved",
  },

  // privacy
  "privacy.title": { ar: "سياسة الخصوصية", nl: "Privacybeleid", en: "Privacy Policy" },
  "privacy.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "privacy.intro": {
    ar: "مرحبًا بكم في منصة وصلة. تحترم المنصة خصوصية جميع مستخدميها وتلتزم بحماية البيانات الشخصية وفقًا للائحة العامة لحماية البيانات (GDPR) والقوانين الهولندية المعمول بها. باستخدام المنصة أو إنشاء حساب، فإنك توافق على معالجة بياناتك الشخصية وفقًا لهذه السياسة.",
    nl: "Welkom bij Wasla. Het platform respecteert de privacy van alle gebruikers en beschermt persoonsgegevens conform de AVG (GDPR) en de toepasselijke Nederlandse wetgeving. Door het platform te gebruiken of een account aan te maken, ga je akkoord met de verwerking van je persoonsgegevens volgens dit beleid.",
    en: "Welcome to Wasla. The platform respects the privacy of all users and protects personal data in accordance with the GDPR and applicable Dutch law. By using the platform or creating an account, you consent to the processing of your personal data under this policy.",
  },
  "privacy.s1.title": { ar: "١. المسؤول عن معالجة البيانات", nl: "1. Verwerkingsverantwoordelijke", en: "1. Data controller" },
  "privacy.s1.body": {
    ar: "تعد منصة وصلة هي المسؤول عن معالجة البيانات الشخصية للمستخدمين. للاستفسارات المتعلقة بالخصوصية أو ممارسة حقوقك، يمكنك التواصل عبر البريد الإلكتروني: privacy@wasla.nl",
    nl: "Wasla is verwerkingsverantwoordelijke voor de persoonsgegevens van gebruikers. Voor privacyvragen of het uitoefenen van je rechten kun je contact opnemen via: privacy@wasla.nl",
    en: "Wasla is the controller of users' personal data. For privacy questions or to exercise your rights, contact: privacy@wasla.nl",
  },
  "privacy.s2.title": { ar: "٢. البيانات التي نجمعها", nl: "2. Gegevens die wij verzamelen", en: "2. Data we collect" },
  "privacy.s2.body": {
    ar: "قد نجمع: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، المدينة أو العنوان، صورة الملف الشخصي (إن وجدت)، بيانات النشاط داخل المنصة، الرسائل المرسلة عبر المنصة، عنوان IP، نوع الجهاز والمتصفح، ملفات تعريف الارتباط (Cookies)، وبيانات الاشتراك الخاصة بالحرفيين مثل معلومات الفوترة والاشتراك عند الاقتضاء. لا تقوم المنصة بمعالجة أو تخزين بيانات بطاقات الدفع إذا تمت المدفوعات من خلال مزود دفع خارجي.",
    nl: "Wij kunnen verzamelen: volledige naam, e-mailadres, telefoonnummer, stad of adres, profielfoto (indien aanwezig), activiteitsgegevens op het platform, berichten via het platform, IP-adres, apparaat- en browsergegevens, cookies en abonnementsgegevens van vakmensen zoals facturatie- en abonnementsinformatie waar van toepassing. Het platform verwerkt of bewaart geen betaalkaartgegevens wanneer betalingen via een externe betaaldienst verlopen.",
    en: "We may collect: full name, email, phone number, city or address, profile picture (if any), platform activity data, messages sent via the platform, IP address, device and browser type, cookies, and subscription data for professionals such as billing and subscription information where applicable. The platform does not process or store payment card data when payments go through an external payment provider.",
  },
  "privacy.s3.title": { ar: "٣. أغراض معالجة البيانات", nl: "3. Doeleinden van verwerking", en: "3. Purposes of processing" },
  "privacy.s3.body": {
    ar: "نعالج البيانات من أجل: إنشاء الحسابات وإدارتها، ربط الحرفيين بالزبائن، إدارة الاشتراكات الشهرية، إصدار الفواتير عند الحاجة، التواصل مع المستخدمين، تحسين خدمات المنصة، حماية المنصة من الاحتيال أو إساءة الاستخدام، والامتثال للالتزامات القانونية.",
    nl: "Wij verwerken gegevens voor: het aanmaken en beheren van accounts, het koppelen van vakmensen aan klanten, het beheren van maandelijkse abonnementen, facturatie waar nodig, communicatie met gebruikers, verbetering van onze diensten, bescherming tegen fraude of misbruik, en naleving van wettelijke verplichtingen.",
    en: "We process data to: create and manage accounts, connect professionals with clients, manage monthly subscriptions, issue invoices where needed, communicate with users, improve the service, protect the platform from fraud or abuse, and comply with legal obligations.",
  },
  "privacy.s4.title": { ar: "٤. الأساس القانوني للمعالجة", nl: "4. Rechtsgrondslag", en: "4. Legal basis" },
  "privacy.s4.body": {
    ar: "تتم معالجة البيانات استنادًا إلى أحد الأسس التالية: تنفيذ العقد، موافقة المستخدم، الالتزام القانوني، أو المصالح المشروعة للمنصة بما لا يتعارض مع حقوق المستخدم.",
    nl: "Verwerking gebeurt op basis van: uitvoering van de overeenkomst, toestemming van de gebruiker, wettelijke verplichting of gerechtvaardigd belang van het platform voor zover dit de rechten van de gebruiker niet schaadt.",
    en: "Processing is based on one of the following: performance of a contract, user consent, legal obligation, or the platform's legitimate interests where these do not override user rights.",
  },
  "privacy.s5.title": { ar: "٥. مشاركة البيانات", nl: "5. Delen van gegevens", en: "5. Sharing data" },
  "privacy.s5.body": {
    ar: "قد تتم مشاركة البيانات مع: مزودي الاستضافة، مزودي خدمات البريد الإلكتروني، مزودي خدمات الفوترة أو الاشتراكات، الجهات الحكومية إذا تطلب القانون ذلك، والمستشارين القانونيين أو المحاسبين عند الضرورة. لا تقوم المنصة ببيع البيانات الشخصية لأي طرف ثالث.",
    nl: "Gegevens kunnen worden gedeeld met: hostingproviders, e-mailproviders, facturatie- of abonnementsproviders, overheidsinstanties indien wettelijk vereist, en juridisch of boekhoudkundig adviseurs waar nodig. Het platform verkoopt geen persoonsgegevens aan derden.",
    en: "Data may be shared with: hosting providers, email providers, billing or subscription providers, government authorities when legally required, and legal or accounting advisors when necessary. The platform does not sell personal data to any third party.",
  },
  "privacy.s6.title": { ar: "٦. مدة الاحتفاظ بالبيانات", nl: "6. Bewaartermijn", en: "6. Data retention" },
  "privacy.s6.body": {
    ar: "يتم الاحتفاظ بالبيانات فقط للمدة اللازمة لتحقيق الأغراض التي جُمعت من أجلها، أو للمدة التي يفرضها القانون.",
    nl: "Gegevens worden slechts bewaard zolang dat nodig is voor de doeleinden waarvoor ze zijn verzameld, of zolang de wet dat vereist.",
    en: "Data is retained only for as long as necessary for the purposes for which it was collected, or as required by law.",
  },
  "privacy.s7.title": { ar: "٧. حقوق المستخدم", nl: "7. Rechten van de gebruiker", en: "7. User rights" },
  "privacy.s7.body": {
    ar: "وفقًا للائحة GDPR يحق لك: طلب الوصول إلى بياناتك، تصحيح البيانات غير الصحيحة، طلب حذف البيانات، طلب تقييد المعالجة، الاعتراض على المعالجة، طلب نقل البيانات، وسحب الموافقة في أي وقت إذا كانت المعالجة تستند إليها.",
    nl: "Op grond van de AVG heb je recht op: inzage in je gegevens, correctie van onjuiste gegevens, verwijdering, beperking van de verwerking, bezwaar tegen verwerking, dataportabiliteit, en intrekking van je toestemming op elk moment wanneer de verwerking daarop is gebaseerd.",
    en: "Under GDPR you have the right to: access your data, correct inaccurate data, request deletion, restrict processing, object to processing, request data portability, and withdraw consent at any time where processing is based on it.",
  },
  "privacy.s8.title": { ar: "٨. حذف الحساب والبيانات", nl: "8. Verwijdering van account en gegevens", en: "8. Account and data deletion" },
  "privacy.s8.body": {
    ar: "يجوز للمستخدم طلب حذف حسابه في أي وقت. بعد التحقق من الطلب: يتم حذف البيانات الشخصية أو جعلها مجهولة الهوية متى كان ذلك ممكنًا، وقد يتم الاحتفاظ ببعض البيانات إذا كان القانون الهولندي أو الأوروبي يفرض ذلك مثل بيانات الفواتير أو الاشتراكات أو السجلات المحاسبية، ويتم حذف البيانات المحتفظ بها بعد انتهاء مدة الاحتفاظ القانونية.",
    nl: "De gebruiker kan op elk moment verwijdering van zijn account aanvragen. Na verificatie worden persoonsgegevens verwijderd of geanonimiseerd waar mogelijk. Bepaalde gegevens kunnen worden bewaard als de Nederlandse of Europese wet dit vereist, zoals facturatie-, abonnements- of boekhoudgegevens. Deze worden na de wettelijke bewaartermijn verwijderd.",
    en: "Users may request deletion of their account at any time. After verification, personal data is deleted or anonymised where possible. Some data may be retained where Dutch or European law requires, such as invoicing, subscription or accounting records, and is deleted after the statutory retention period.",
  },
  "privacy.s9.title": { ar: "٩. أمن المعلومات", nl: "9. Informatiebeveiliging", en: "9. Information security" },
  "privacy.s9.body": {
    ar: "تطبق المنصة إجراءات تقنية وتنظيمية مناسبة لحماية البيانات من الوصول غير المصرح به أو الفقدان أو التعديل أو الإفصاح غير المشروع.",
    nl: "Het platform treft passende technische en organisatorische maatregelen om gegevens te beschermen tegen ongeoorloofde toegang, verlies, wijziging of openbaarmaking.",
    en: "The platform applies appropriate technical and organisational measures to protect data against unauthorised access, loss, alteration or disclosure.",
  },
  "privacy.s10.title": { ar: "١٠. ملفات تعريف الارتباط (Cookies)", nl: "10. Cookies", en: "10. Cookies" },
  "privacy.s10.body": {
    ar: "قد تستخدم المنصة ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل أداء الموقع. يمكن للمستخدم التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.",
    nl: "Het platform kan cookies gebruiken om de gebruikerservaring te verbeteren en het gebruik van de site te analyseren. Je kunt cookies beheren via de instellingen van je browser.",
    en: "The platform may use cookies to improve the user experience and analyse site performance. You can control cookies through your browser settings.",
  },
  "privacy.s11.title": { ar: "١١. التعديلات", nl: "11. Wijzigingen", en: "11. Changes" },
  "privacy.s11.body": {
    ar: "يجوز للمنصة تعديل سياسة الخصوصية في أي وقت، ويتم نشر النسخة المحدثة مع تاريخ آخر تعديل.",
    nl: "Het platform kan het privacybeleid op elk moment wijzigen. De bijgewerkte versie wordt gepubliceerd met de datum van laatste wijziging.",
    en: "The platform may amend this privacy policy at any time. The updated version is published with the date of the latest change.",
  },
  "privacy.s12.title": { ar: "١٢. التواصل", nl: "12. Contact", en: "12. Contact" },
  "privacy.s12.body": {
    ar: "لأي استفسار متعلق بالخصوصية أو لممارسة حقوقك، يرجى التواصل عبر البريد الإلكتروني: privacy@wasla.nl",
    nl: "Voor privacyvragen of het uitoefenen van je rechten kun je contact opnemen via: privacy@wasla.nl",
    en: "For any privacy question or to exercise your rights, contact: privacy@wasla.nl",
  },

  // terms
  "terms.title": { ar: "شروط الاستخدام", nl: "Gebruiksvoorwaarden", en: "Terms of Use" },
  "terms.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "terms.intro": {
    ar: "توضح هذه الشروط قواعد استخدام منصة وصلة. باستخدامك المنصة فإنك توافق على الالتزام بها. يرجى قراءتها بعناية.",
    nl: "Deze voorwaarden bepalen de regels voor het gebruik van Wasla. Door het platform te gebruiken ga je akkoord met deze voorwaarden. Lees ze zorgvuldig.",
    en: "These terms set out the rules for using Wasla. By using the platform you agree to them. Please read them carefully.",
  },
  "terms.s1.title": { ar: "١. التعريفات", nl: "1. Definities", en: "1. Definitions" },
  "terms.s1.body": {
    ar: "المنصة: منصة وصلة. الحرفي: الشخص أو المؤسسة التي تعرض خدماتها عبر المنصة. الزبون: الشخص الذي يستخدم المنصة للبحث عن الحرفيين والتواصل معهم.",
    nl: "Platform: Wasla. Vakman/professional: de persoon of organisatie die diensten aanbiedt via het platform. Klant: de persoon die het platform gebruikt om vakmensen te zoeken en te contacteren.",
    en: "Platform: Wasla. Professional: the person or organisation offering services via the platform. Client: the person using the platform to find and contact professionals.",
  },
  "terms.s2.title": { ar: "٢. طبيعة الخدمة", nl: "2. Aard van de dienst", en: "2. Nature of the service" },
  "terms.s2.body": {
    ar: "توفر المنصة وسيلة إلكترونية لربط الحرفيين بالزبائن. ولا تعتبر المنصة طرفًا في أي عقد يتم بين الحرفي والزبون، كما لا تمثل أي طرف أو وكيل عن أي منهما.",
    nl: "Het platform biedt een online middel om vakmensen en klanten te verbinden. Het platform is geen partij bij enige overeenkomst tussen vakman en klant en vertegenwoordigt geen van beide partijen.",
    en: "The platform provides an online means to connect professionals and clients. It is not a party to any contract between them and does not represent or act as an agent for either.",
  },
  "terms.s3.title": { ar: "٣. إنشاء الحساب", nl: "3. Account aanmaken", en: "3. Account creation" },
  "terms.s3.body": {
    ar: "يلتزم المستخدم بتقديم بيانات صحيحة، وتحديث بياناته عند الحاجة، والمحافظة على سرية بيانات تسجيل الدخول، وعدم إنشاء حسابات مزيفة أو انتحال شخصية الغير.",
    nl: "De gebruiker verstrekt juiste gegevens, werkt deze bij wanneer nodig, houdt zijn inloggegevens vertrouwelijk en maakt geen valse accounts aan of neemt de identiteit van een ander niet aan.",
    en: "Users must provide accurate information, keep it up to date, keep login credentials confidential, and not create fake accounts or impersonate others.",
  },
  "terms.s4.title": { ar: "٤. اشتراك الحرفيين", nl: "4. Abonnement voor professionals", en: "4. Professional subscription" },
  "terms.s4.body": {
    ar: "يتطلب استخدام بعض خدمات المنصة اشتراكًا شهريًا مدفوعًا. ويمنح الاشتراك حق استخدام خدمات المنصة خلال مدة الاشتراك فقط. ولا يشكل الاشتراك ضمانًا للحصول على عدد معين من العملاء أو الطلبات أو الأرباح.",
    nl: "Voor bepaalde functies is een betaald maandabonnement vereist. Het abonnement geeft alleen recht op gebruik tijdens de looptijd en biedt geen garantie op een bepaald aantal klanten, opdrachten of inkomsten.",
    en: "Some features require a paid monthly subscription. The subscription only grants access during its term and offers no guarantee of a specific number of clients, requests or earnings.",
  },
  "terms.s5.title": { ar: "٥. المدفوعات بين الحرفي والزبون", nl: "5. Betalingen tussen partijen", en: "5. Payments between parties" },
  "terms.s5.body": {
    ar: "تتم جميع الاتفاقات المالية المتعلقة بالخدمات مباشرة بين الحرفي والزبون. ولا تستقبل المنصة أي مبالغ تخص تنفيذ الأعمال، ولا تقوم بتحصيل أو إدارة أو ضمان أي مدفوعات بين الطرفين.",
    nl: "Alle financiële afspraken over de diensten worden rechtstreeks tussen vakman en klant gemaakt. Het platform ontvangt geen betalingen voor uitgevoerd werk en incasseert, beheert of garandeert deze niet.",
    en: "All financial arrangements for services are made directly between the professional and the client. The platform does not receive payments for work performed and does not collect, manage or guarantee them.",
  },
  "terms.s6.title": { ar: "٦. مسؤوليات الحرفي", nl: "6. Verplichtingen van de professional", en: "6. Professional's obligations" },
  "terms.s6.body": {
    ar: "يلتزم الحرفي بتقديم معلومات صحيحة، والالتزام بالقوانين المعمول بها، وتنفيذ الأعمال المتفق عليها، واحترام المواعيد المتفق عليها، والالتزام بالأسعار التي يعرضها.",
    nl: "De professional verstrekt juiste informatie, houdt zich aan de geldende wetgeving, voert het overeengekomen werk uit, respecteert afgesproken termijnen en houdt zich aan de aangeboden prijzen.",
    en: "The professional must provide accurate information, comply with applicable law, perform the agreed work, meet agreed deadlines and honour the prices offered.",
  },
  "terms.s7.title": { ar: "٧. مسؤوليات الزبون", nl: "7. Verplichtingen van de klant", en: "7. Client's obligations" },
  "terms.s7.body": {
    ar: "يلتزم الزبون بتقديم معلومات دقيقة عن طلب الخدمة، والتعامل بحسن نية، واحترام الاتفاقات التي يبرمها مع الحرفيين.",
    nl: "De klant verstrekt nauwkeurige informatie over de aanvraag, handelt te goeder trouw en respecteert de gemaakte afspraken met vakmensen.",
    en: "The client must provide accurate information about the request, act in good faith and honour agreements made with professionals.",
  },
  "terms.s8.title": { ar: "٨. إخلاء المسؤولية", nl: "8. Disclaimer", en: "8. Disclaimer" },
  "terms.s8.body": {
    ar: "تعمل المنصة كوسيط إلكتروني فقط. ولا تقوم بفحص جودة الخدمات، أو الإشراف على تنفيذ الأعمال، أو ضمان خبرة الحرفيين، أو ضمان الالتزام بالمواعيد، أو ضمان الأسعار، أو ضمان النتائج. ولا تتحمل المنصة أي مسؤولية عن جودة الأعمال المنفذة، أو أي أضرار تنتج عن الخدمات، أو أي نزاعات بين الحرفيين والزبائن، أو أي خسائر مباشرة أو غير مباشرة أو تبعية، أو أي مطالبات تتعلق بتنفيذ الأعمال أو تأخيرها أو إلغائها. ويقع كامل عبء المسؤولية عن الخدمات المقدمة على الحرفي والزبون وفقًا للعقد المبرم بينهما.",
    nl: "Het platform fungeert uitsluitend als online tussenpersoon. Het controleert de kwaliteit van diensten niet, houdt geen toezicht op de uitvoering en garandeert geen ervaring, tijdigheid, prijzen of resultaten. Het platform is niet aansprakelijk voor de kwaliteit van uitgevoerd werk, schade door diensten, geschillen tussen partijen, directe, indirecte of gevolgschade, of claims over uitvoering, vertraging of annulering. De volledige verantwoordelijkheid voor de dienst ligt bij vakman en klant volgens hun overeenkomst.",
    en: "The platform acts solely as an online intermediary. It does not vet service quality, supervise delivery or guarantee expertise, timeliness, prices or results. The platform is not liable for the quality of work performed, damages arising from services, disputes between parties, direct, indirect or consequential losses, or claims regarding delivery, delay or cancellation. Full responsibility for the service lies with the professional and the client under their agreement.",
  },
  "terms.s9.title": { ar: "٩. التقييمات", nl: "9. Beoordelingen", en: "9. Reviews" },
  "terms.s9.body": {
    ar: "يجوز للمستخدمين نشر تقييمات حقيقية. ويحق للمنصة حذف أي تقييم مخالف للقانون أو مضلل أو مسيء أو يحتوي على تشهير أو سب أو معلومات كاذبة.",
    nl: "Gebruikers mogen echte beoordelingen plaatsen. Het platform mag beoordelingen verwijderen die in strijd zijn met de wet, misleidend, beledigend, lasterlijk of feitelijk onjuist zijn.",
    en: "Users may post genuine reviews. The platform may remove any review that is unlawful, misleading, offensive, defamatory or contains false information.",
  },
  "terms.s10.title": { ar: "١٠. الاشتراكات والإلغاء", nl: "10. Abonnementen en opzegging", en: "10. Subscriptions and cancellation" },
  "terms.s10.body": {
    ar: "يمكن للحرفي إلغاء الاشتراك في أي وقت. ويستمر الاشتراك حتى نهاية الفترة المدفوعة. ولا تُرد رسوم الاشتراك عن الفترات التي بدأ استخدامها، إلا إذا كان القانون يوجب خلاف ذلك.",
    nl: "De professional kan het abonnement op elk moment opzeggen. Het blijft actief tot het einde van de betaalde periode. Reeds aangevangen periodes worden niet terugbetaald, tenzij de wet anders bepaalt.",
    en: "The professional may cancel at any time. The subscription remains active until the end of the paid period. Fees for periods already started are not refunded unless required by law.",
  },
  "terms.s11.title": { ar: "١١. تعليق أو حذف الحساب", nl: "11. Opschorting of verwijdering van account", en: "11. Account suspension or removal" },
  "terms.s11.body": {
    ar: "يجوز للمنصة تعليق أو حذف الحساب إذا تم تقديم بيانات غير صحيحة، أو تمت إساءة استخدام المنصة، أو تمت مخالفة هذه الشروط، أو تم ارتكاب احتيال أو نشاط غير قانوني.",
    nl: "Het platform kan een account opschorten of verwijderen bij onjuiste gegevens, misbruik van het platform, schending van deze voorwaarden, fraude of illegale activiteit.",
    en: "The platform may suspend or delete an account for false information, platform abuse, breach of these terms, fraud or illegal activity.",
  },
  "terms.s12.title": { ar: "١٢. الملكية الفكرية", nl: "12. Intellectueel eigendom", en: "12. Intellectual property" },
  "terms.s12.body": {
    ar: "جميع حقوق الملكية الفكرية المتعلقة بالمنصة، بما في ذلك الاسم التجاري والشعار والتصميم والبرمجيات والمحتوى، مملوكة للمنصة أو للجهات المرخصة لها، ولا يجوز نسخها أو استخدامها دون موافقة كتابية مسبقة.",
    nl: "Alle intellectuele eigendomsrechten op het platform, waaronder handelsnaam, logo, ontwerp, software en inhoud, berusten bij het platform of zijn licentiegevers. Zonder voorafgaande schriftelijke toestemming mag hier niets van worden gekopieerd of gebruikt.",
    en: "All intellectual property rights in the platform — including trade name, logo, design, software and content — belong to the platform or its licensors and may not be copied or used without prior written consent.",
  },
  "terms.s13.title": { ar: "١٣. حدود المسؤولية", nl: "13. Aansprakelijkheidsbeperking", en: "13. Limitation of liability" },
  "terms.s13.body": {
    ar: "إلى أقصى حد يسمح به القانون، لا تتحمل المنصة المسؤولية عن فقدان الأرباح، أو خسارة الفرص التجارية، أو فقدان البيانات، أو توقف الأعمال، أو الأضرار غير المباشرة أو العرضية أو التبعية. ويقتصر دور المنصة على توفير خدمة إلكترونية للتواصل بين الحرفيين والزبائن.",
    nl: "Voor zover wettelijk toegestaan is het platform niet aansprakelijk voor winstderving, gemiste zakelijke kansen, verlies van gegevens, bedrijfsonderbreking of indirecte, incidentele of gevolgschade. De rol van het platform beperkt zich tot het bieden van een online communicatiedienst tussen vakmensen en klanten.",
    en: "To the maximum extent permitted by law, the platform is not liable for loss of profits, business opportunities, data loss, business interruption, or indirect, incidental or consequential damages. Its role is limited to providing an online communication service between professionals and clients.",
  },
  "terms.s14.title": { ar: "١٤. القانون الواجب التطبيق", nl: "14. Toepasselijk recht", en: "14. Governing law" },
  "terms.s14.body": {
    ar: "تخضع هذه الشروط لقوانين مملكة هولندا وتفسر وفقًا لها. وتختص المحاكم الهولندية بالنظر في أي نزاع ينشأ بشأن هذه الشروط، ما لم ينص القانون الإلزامي على خلاف ذلك.",
    nl: "Op deze voorwaarden is het recht van het Koninkrijk der Nederlanden van toepassing. Geschillen worden voorgelegd aan de Nederlandse rechter, tenzij dwingend recht anders bepaalt.",
    en: "These terms are governed by and construed in accordance with the laws of the Kingdom of the Netherlands. Disputes are subject to the Dutch courts unless mandatory law provides otherwise.",
  },
  "terms.s15.title": { ar: "١٥. تعديل الشروط", nl: "15. Wijziging van de voorwaarden", en: "15. Changes to the terms" },
  "terms.s15.body": {
    ar: "يجوز للمنصة تعديل شروط الاستخدام في أي وقت، وتصبح النسخة المعدلة نافذة من تاريخ نشرها على المنصة.",
    nl: "Het platform kan de gebruiksvoorwaarden op elk moment wijzigen. De gewijzigde versie is van kracht vanaf de datum van publicatie op het platform.",
    en: "The platform may amend the terms of use at any time. The amended version takes effect from the date it is published on the platform.",
  },

  // cookie policy
  "cookies.title": { ar: "سياسة ملفات تعريف الارتباط", nl: "Cookiebeleid", en: "Cookie Policy" },
  "cookies.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "cookies.intro": {
    ar: "تستخدم منصة وصلة ملفات تعريف الارتباط (Cookies) لتحسين تجربتك وفهم كيفية استخدام المنصة. توضح هذه السياسة أنواع الملفات التي نستخدمها وأغراضها وكيف يمكنك التحكم بها.",
    nl: "Wasla gebruikt cookies om je ervaring te verbeteren en te begrijpen hoe het platform wordt gebruikt. Dit beleid legt uit welke cookies wij gebruiken, waarvoor en hoe je ze kunt beheren.",
    en: "Wasla uses cookies to improve your experience and understand how the platform is used. This policy explains what cookies we use, why, and how you can manage them.",
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
    ar: "إذا كان لديك أي سؤال حول سياسة ملفات الارتباط، يمكنك التواصل معنا على: privacy@wasla.nl",
    nl: "Als je vragen hebt over dit cookiebeleid, kun je contact opnemen via: privacy@wasla.nl",
    en: "If you have any questions about this cookie policy, you can contact us at: privacy@wasla.nl",
  },

  // cookie consent banner
  "consent.title": {
    ar: "نحن نستخدم ملفات تعريف الارتباط",
    nl: "Wij gebruiken cookies",
    en: "We use cookies",
  },
  "consent.desc": {
    ar: "نستخدم ملفات ضرورية لتشغيل المنصة، وملفات اختيارية للتحليل والتسويق. يمكنك اختيار ما توافق عليه.",
    nl: "Wij gebruiken noodzakelijke cookies om het platform te laten werken, en optionele cookies voor analyse en marketing. Jij kiest waarmee je akkoord gaat.",
    en: "We use necessary cookies to run the platform, and optional cookies for analytics and marketing. You choose what you accept.",
  },
  "consent.acceptAll": { ar: "قبول الكل", nl: "Alles accepteren", en: "Accept all" },
  "consent.rejectAll": { ar: "رفض الاختياري", nl: "Optionele weigeren", en: "Reject optional" },
  "consent.customize": { ar: "تخصيص", nl: "Aanpassen", en: "Customize" },
  "consent.save": { ar: "حفظ التفضيلات", nl: "Voorkeuren opslaan", en: "Save preferences" },
  "consent.manage": { ar: "إدارة ملفات تعريف الارتباط", nl: "Cookievoorkeuren", en: "Cookie preferences" },
  "consent.prefsTitle": { ar: "تفضيلات ملفات تعريف الارتباط", nl: "Cookievoorkeuren", en: "Cookie preferences" },
  "consent.prefsDesc": {
    ar: "اختر فئات ملفات تعريف الارتباط التي توافق على استخدامها. يمكنك تغيير اختيارك في أي وقت.",
    nl: "Kies welke categorieën cookies je toestaat. Je kunt dit altijd wijzigen.",
    en: "Choose which cookie categories you allow. You can change this at any time.",
  },
  "consent.necessary": { ar: "ضرورية", nl: "Noodzakelijk", en: "Necessary" },
  "consent.necessary.desc": {
    ar: "لازمة لتسجيل الدخول والأمان وحفظ اللغة. لا يمكن تعطيلها.",
    nl: "Nodig voor inloggen, beveiliging en taalvoorkeur. Kan niet worden uitgeschakeld.",
    en: "Required for sign-in, security and language preference. Cannot be disabled.",
  },
  "consent.analytics": { ar: "التحليلات", nl: "Analyse", en: "Analytics" },
  "consent.analytics.desc": {
    ar: "تساعدنا على فهم كيفية استخدام المنصة لتحسينها.",
    nl: "Helpen ons te begrijpen hoe het platform wordt gebruikt.",
    en: "Help us understand how the platform is used so we can improve it.",
  },
  "consent.marketing": { ar: "التسويق", nl: "Marketing", en: "Marketing" },
  "consent.marketing.desc": {
    ar: "تُستخدم لعرض محتوى وإعلانات أكثر ملاءمة لك.",
    nl: "Worden gebruikt voor relevantere content en advertenties.",
    en: "Used to show you more relevant content and ads.",
  },
  "consent.savedAt": { ar: "تم تسجيل موافقتك بتاريخ", nl: "Toestemming geregistreerd op", en: "Consent recorded on" },
  "consent.saved": { ar: "تم حفظ تفضيلاتك", nl: "Voorkeuren opgeslagen", en: "Preferences saved" },

  // footer
  "footer.cookies": { ar: "سياسة ملفات تعريف الارتباط", nl: "Cookiebeleid", en: "Cookie Policy" },

  // about
  "about.title": { ar: "من نحن", nl: "Over ons", en: "About us" },
  "about.updated": { ar: "آخر تحديث: أغسطس 2026", nl: "Laatst bijgewerkt: augustus 2026", en: "Last updated: August 2026" },
  "about.intro": {
    ar: "وصلة هي منصة رقمية مبتكرة تهدف إلى تمكين الجالية العربية في هولندا من الوصول إلى الخدمات والمعلومات والفرص بسهولة وأمان. جاءت فكرة المنصة انطلاقًا من فهمٍ حقيقي للتحديات التي يواجهها القادمون الجدد والمقيمون، مثل حاجز اللغة، وصعوبة الوصول إلى مزودي الخدمات الموثوقين، وتعقيد الإجراءات اليومية. توفر المنصة بيئة رقمية تجمع بين المستخدمين ومقدمي الخدمات في مكان واحد، من خلال حلول تقنية حديثة تضمن سهولة الاستخدام، وسرعة الوصول إلى الخدمة المناسبة، وتعزز الثقة والشفافية بين جميع الأطراف. نسعى إلى أن تكون المنصة أكثر من مجرد سوق للخدمات، بل منظومة رقمية متكاملة تدعم الاندماج، وتساعد أفراد الجالية على بناء حياة مستقرة، وتفتح المجال أمام أصحاب المهن والخبرات لتوسيع أعمالهم والوصول إلى عملاء جدد.",
    nl: "Wasla is een innovatief digitaal platform dat de Arabische gemeenschap in Nederland wil empoweren om eenvoudig en veilig toegang te krijgen tot diensten, informatie en kansen. Het idee voor het platform ontstond uit een diep begrip van de uitdagingen waarmee nieuwkomers en bewoners worden geconfronteerd, zoals de taalbarrière, de moeilijkheid om betrouwbare dienstverleners te vinden en de complexiteit van dagelijkse procedures. Het platform biedt een digitale omgeving die gebruikers en dienstverleners op één plek samenbrengt, met moderne technologische oplossingen die gebruiksgemak garanderen, snelle toegang tot de juiste dienst mogelijk maken en vertrouwen en transparantie tussen alle partijen bevorderen. We streven ernaar dat het platform meer is dan alleen een dienstenmarkt: een complete digitale ecosystem die integratie ondersteunt, leden van de gemeenschap helpt een stabiel leven op te bouwen en professionals en experts de ruimte biedt om hun bedrijf uit te breiden en nieuwe klanten te bereiken.",
    en: "Wasla is an innovative digital platform that empowers the Arab community in the Netherlands to access services, information and opportunities easily and securely. The idea for the platform came from a real understanding of the challenges faced by newcomers and residents, such as the language barrier, difficulty reaching trusted service providers, and the complexity of daily procedures. The platform provides a digital environment that brings users and service providers together in one place, through modern technical solutions that ensure ease of use, fast access to the right service, and greater trust and transparency among all parties. We strive for the platform to be more than a services marketplace — a complete digital ecosystem that supports integration, helps community members build a stable life, and opens opportunities for professionals and experts to expand their business and reach new clients.",
  },
  "about.mission.title": { ar: "رسالتنا", nl: "Onze missie", en: "Our mission" },
  "about.mission.body": {
    ar: "تمكين أفراد الجالية العربية في هولندا من الاندماج والنجاح، عبر توفير منصة رقمية موثوقة تسهل الوصول إلى الخدمات، والمعلومات، والفرص، بلغة مفهومة وتجربة استخدام بسيطة، بما يختصر الوقت والجهد ويعزز جودة الحياة.",
    nl: "Het empoweren van leden van de Arabische gemeenschap in Nederland om te integreren en te slagen, door een betrouwbaar digitaal platform te bieden dat toegang tot diensten, informatie en kansen vergemakkelijkt, in een begrijpelijke taal en met een eenvoudige gebruikerservaring, zodat tijd en moeite worden bespaard en de kwaliteit van leven wordt verbeterd.",
    en: "Empowering members of the Arab community in the Netherlands to integrate and succeed, by providing a reliable digital platform that makes services, information and opportunities accessible in an understandable language and with a simple user experience, saving time and effort and improving quality of life.",
  },
  "about.vision.title": { ar: "رؤيتنا", nl: "Onze visie", en: "Our vision" },
  "about.vision.body": {
    ar: "أن نصبح المنصة الرقمية الأولى والأكثر ثقة للجاليات العربية في هولندا، ثم التوسع تدريجيًا إلى دول شمال أوروبا، لنكون المرجع الرئيسي للخدمات والمعلومات والفرص، والمساهم في بناء مجتمع أكثر ترابطًا واستقلالية واندماجًا.",
    nl: "De eerste en meest vertrouwde digitale platform worden voor Arabische gemeenschappen in Nederland, en daarna geleidelijk uitbreiden naar landen in Noord-Europa, zodat we het belangrijkste referentiepunt worden voor diensten, informatie en kansen, en bijdragen aan een meer verbonden, onafhankelijk en geïntegreerd gemeenschap.",
    en: "To become the first and most trusted digital platform for Arab communities in the Netherlands, then gradually expand to Northern European countries, becoming the main reference for services, information and opportunities, and contributing to a more connected, independent and integrated community.",
  },
  "about.objectives.title": { ar: "أهداف المنصة", nl: "Platformdoelstellingen", en: "Platform objectives" },
  "about.objectives.body": {
    ar: "تسهيل وصول الجالية العربية إلى الخدمات المحلية من خلال منصة رقمية سهلة الاستخدام. كسر حاجز اللغة عبر تقديم المعلومات والخدمات باللغة العربية مع مراعاة الأنظمة والقوانين الهولندية. إنشاء شبكة موثوقة من مزودي الخدمات المعتمدين وأصحاب الخبرات في مختلف المجالات. دعم أصحاب المهن والحرف والمستقلين في الوصول إلى عملاء جدد وتنمية أعمالهم. توفير الوقت والجهد من خلال تنظيم عملية نشر الطلبات واستقبال العروض ومقارنتها. تعزيز الشفافية والثقة عبر نظام تقييمات ومراجعات واضح يضمن حقوق جميع الأطراف. المساهمة في الاندماج الاقتصادي والاجتماعي للجالية العربية من خلال توفير خدمات وفرص تساعد على الاستقرار والاعتماد على الذات.",
    nl: "De toegang van de Arabische gemeenschap tot lokale diensten vergemakkelijken via een gebruiksvriendelijk digitaal platform. De taalbarrière doorbreken door informatie en diensten in het Arabisch aan te bieden, met inachtneming van de Nederlandse regels en wetten. Een betrouwbaar netwerk opbouwen van gecertificeerde dienstverleners en experts in verschillende vakgebieden. Professionals, vakmensen en freelancers ondersteunen bij het bereiken van nieuwe klanten en het laten groeien van hun bedrijf. Tijd en moeite besparen door het plaatsen van aanvragen, het ontvangen van offertes en het vergelijken ervan te organiseren. Transparantie en vertrouwen bevorderen door een duidelijk beoordelings- en reviewsysteem dat de rechten van alle partijen waarborgt. Bijdragen aan de economische en sociale integratie van de Arabische gemeenschap door diensten en kansen te bieden die helpen bij stabiliteit en zelfredzaamheid.",
    en: "Facilitate the Arab community's access to local services through an easy-to-use digital platform. Break the language barrier by providing information and services in Arabic while respecting Dutch regulations and laws. Build a trusted network of certified service providers and experts in various fields. Support professionals, tradespeople and freelancers in reaching new clients and growing their business. Save time and effort by organizing the process of posting requests, receiving offers and comparing them. Promote transparency and trust through a clear rating and review system that protects the rights of all parties. Contribute to the economic and social integration of the Arab community by providing services and opportunities that help with stability and self-reliance.",
  },
  "about.strategy.title": { ar: "استراتيجيتنا", nl: "Onze strategie", en: "Our strategy" },
  "about.strategy.body": {
    ar: "تعتمد المنصة على استراتيجية نمو تدريجية ترتكز على أربع ركائز رئيسية: أولًا: التركيز على احتياجات المستخدم ووضعها في صميم عملية التطوير، من خلال تصميم واجهات بسيطة وسهلة الاستخدام، وتقديم خدمات تحل المشكلات اليومية بطريقة عملية وسريعة. ثانيًا: بناء الثقة من خلال إنشاء بيئة آمنة وشفافة، بالتحقق من مزودي الخدمات، واعتماد نظام تقييمات ومراجعات موثوق، وتوفير سياسات واضحة تحفظ حقوق جميع الأطراف. ثالثًا: توظيف التكنولوجيا بأحدث تقنيات الويب والذكاء الاصطناعي لتحسين تجربة المستخدم، وتسهيل البحث عن الخدمات، وتقديم اقتراحات ذكية، وأتمتة العمليات بما يرفع من كفاءة المنصة. رابعًا: التوسع المرحلي بالبدء بالخدمات الأكثر احتياجًا داخل المجتمع العربي في هولندا، مثل الخدمات المنزلية، والاستشارات، والخدمات الإدارية، ثم التوسع تدريجيًا لتشمل مجالات جديدة، مع إمكانية إضافة لغات أخرى وتوسيع نطاق العمل إلى أسواق أوروبية جديدة.",
    nl: "Het platform volgt een strategie van geleidelijke groei gebaseerd op vier pijlers. Ten eerste: focussen op gebruikersbehoeften door deze centraal te stellen in de ontwikkeling, met eenvoudige en gebruiksvriendelijke interfaces en diensten die dagelijkse problemen praktisch en snel oplossen. Ten tweede: vertrouwen opbouwen door een veilige en transparante omgeving te creëren, dienstverleners te verifiëren, een betrouwbaar beoordelings- en reviewsysteem te hanteren en duidelijke beleidsregels te bieden die de rechten van alle partijen beschermen. Ten derde: technologie inzetten met de nieuwste webtechnologieën en kunstmatige intelligentie om de gebruikerservaring te verbeteren, het vinden van diensten te vereenvoudigen, slimme suggesties te geven en processen te automatiseren voor een efficiënter platform. Ten vierde: gefaseerd uitbreiden, beginnend met de meest noodzakelijke diensten binnen de Arabische gemeenschap in Nederland, zoals huishoudelijke diensten, consultancies en administratieve diensten, en daarna geleidelijk nieuwe domeinen te omvatten, met mogelijkheden voor extra talen en uitbreiding naar nieuwe Europese markten.",
    en: "The platform follows a strategy of gradual growth based on four pillars. First: focus on user needs by placing them at the heart of development, with simple and user-friendly interfaces and services that solve everyday problems in a practical and fast way. Second: build trust by creating a secure and transparent environment, verifying service providers, adopting a reliable rating and review system, and providing clear policies that protect the rights of all parties. Third: employ technology using the latest web technologies and artificial intelligence to improve the user experience, make it easier to find services, offer smart suggestions, and automate processes for a more efficient platform. Fourth: expand in stages, starting with the most needed services within the Arab community in the Netherlands, such as household services, consultancy and administrative services, then gradually include new areas, with the possibility of adding more languages and expanding into new European markets.",
  },
  "about.values.title": { ar: "القيم التي نؤمن بها", nl: "Onze waarden", en: "Our values" },
  "about.values.body": {
    ar: "الثقة: بناء علاقات قائمة على المصداقية والشفافية. الاحترام: احترام التنوع الثقافي والخصوصية وحقوق جميع المستخدمين. الابتكار: تطوير حلول رقمية تواكب احتياجات المجتمع. الجودة: تقديم خدمات موثوقة بمعايير عالية. المجتمع: دعم التعاون وتمكين أفراد الجالية من النمو والنجاح معًا.",
    nl: "Vertrouwen: relaties opbouwen op basis van authenticiteit en transparantie. Respect: respect voor culturele diversiteit, privacy en de rechten van alle gebruikers. Innovatie: digitale oplossingen ontwikkelen die aansluiten bij de behoeften van de gemeenschap. Kwaliteit: betrouwbare diensten leveren volgens hoge normen. Gemeenschap: samenwerking ondersteunen en leden van de gemeenschap empoweren om samen te groeien en te slagen.",
    en: "Trust: building relationships based on authenticity and transparency. Respect: respecting cultural diversity, privacy and the rights of all users. Innovation: developing digital solutions that meet the needs of the community. Quality: delivering reliable services to high standards. Community: supporting cooperation and empowering community members to grow and succeed together.",
  },

  // service search
  "search.title": {
    ar: "ما الخدمة التي تحتاجها؟",
    nl: "Welke dienst heb je nodig?",
    en: "What service do you need?",
  },
  "search.subtitle": {
    ar: "ابحث عن الخدمة أو المهنة التي تحتاجها وسنساعدك في العثور على مقدم الخدمة المناسب.",
    nl: "Zoek de dienst of het vak dat je nodig hebt en wij helpen je de juiste professional te vinden.",
    en: "Search for the service or trade you need and we'll help you find the right professional.",
  },
  "search.placeholder": {
    ar: "مثلاً: كهربائي، سباك، محاسب، مترجم...",
    nl: "Bijv.: elektricien, loodgieter, boekhouder, vertaler...",
    en: "e.g. electrician, plumber, accountant, translator...",
  },
  "search.button": { ar: "ابحث", nl: "Zoeken", en: "Search" },
  "search.suggestions": { ar: "اقتراحات", nl: "Suggesties", en: "Suggestions" },
  "search.browseAll": { ar: "تصفح كل الخدمات", nl: "Alle diensten bekijken", en: "Browse all services" },
  "search.categories": { ar: "التصنيفات الرئيسية", nl: "Hoofdcategorieën", en: "Main categories" },
  "search.results": { ar: "نتائج البحث", nl: "Zoekresultaten", en: "Search results" },
  "search.resultsCount": { ar: "مقدم خدمة", nl: "professionals", en: "professionals" },
  "search.filters": { ar: "تصفية النتائج", nl: "Resultaten filteren", en: "Filter results" },
  "search.filtersApply": { ar: "عرض النتائج", nl: "Resultaten tonen", en: "Show results" },
  "search.filtersReset": { ar: "إعادة الضبط", nl: "Herstellen", en: "Reset" },
  "search.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "search.allCities": { ar: "كل المدن", nl: "Alle steden", en: "All cities" },
  "search.service": { ar: "نوع الخدمة", nl: "Type dienst", en: "Service type" },
  "search.allServices": { ar: "كل الخدمات", nl: "Alle diensten", en: "All services" },
  "search.rating": { ar: "التقييم", nl: "Beoordeling", en: "Rating" },
  "search.anyRating": { ar: "أي تقييم", nl: "Elke beoordeling", en: "Any rating" },
  "search.ratingPlus": { ar: "فأعلى", nl: "en hoger", en: "and up" },
  "search.noRating": { ar: "لا توجد تقييمات بعد", nl: "Nog geen beoordelingen", en: "No reviews yet" },
  "search.reviews": { ar: "تقييم", nl: "beoordelingen", en: "reviews" },
  "search.viewProfile": { ar: "عرض الملف", nl: "Profiel bekijken", en: "View profile" },
  "search.requestBid": { ar: "طلب عرض", nl: "Offerte aanvragen", en: "Request a quote" },
  "search.empty.title": {
    ar: "لم نجد مقدم خدمة مطابقًا لبحثك",
    nl: "We hebben geen passende professional gevonden",
    en: "We couldn't find a matching professional",
  },
  "search.empty.desc": {
    ar: "جرّب كلمة أخرى أو وسّع نطاق البحث.",
    nl: "Probeer een ander woord of verbreed je zoekopdracht.",
    en: "Try another word or widen your search.",
  },
  "search.empty.cta": { ar: "طلب خدمة مخصصة", nl: "Aangepaste aanvraag plaatsen", en: "Post a custom request" },
  "search.signInTitle": {
    ar: "سجّل الدخول لعرض مقدمي الخدمات",
    nl: "Log in om professionals te bekijken",
    en: "Sign in to view professionals",
  },
  "search.signInDesc": {
    ar: "نحمي خصوصية مقدمي الخدمات، لذلك تظهر ملفاتهم للمستخدمين المسجّلين فقط. التسجيل مجاني ويستغرق دقيقة.",
    nl: "We beschermen de privacy van professionals, daarom zijn profielen alleen zichtbaar voor ingelogde gebruikers. Registreren is gratis.",
    en: "We protect professionals' privacy, so profiles are visible to signed-in users only. Signing up is free and takes a minute.",
  },
  "search.about": { ar: "نبذة", nl: "Over", en: "About" },
  "search.noBio": { ar: "لم يضف مقدم الخدمة نبذة بعد.", nl: "Deze professional heeft nog geen omschrijving.", en: "This professional hasn't added a bio yet." },
  "search.languages": { ar: "اللغات", nl: "Talen", en: "Languages" },
  "search.languagesValue": { ar: "العربية · الهولندية · الإنجليزية (حسب مقدم الخدمة)", nl: "Arabisch · Nederlands · Engels (afhankelijk van de professional)", en: "Arabic · Dutch · English (varies per professional)" },

  "results.heading": { ar: "الخدمات المتاحة", nl: "Beschikbare diensten", en: "Available services" },
  "results.sub": {
    ar: "وجدنا لك مقدمي خدمة مناسبين لطلبك",
    nl: "We hebben passende professionals voor je gevonden",
    en: "We found professionals that match your request",
  },
  "results.inNL": { ar: "في هولندا", nl: "in Nederland", en: "in the Netherlands" },
  "results.forQuery": { ar: "نتائج البحث عن", nl: "Resultaten voor", en: "Results for" },
  "results.clearFilters": { ar: "مسح الفلاتر", nl: "Filters wissen", en: "Clear filters" },
  "results.showAll": { ar: "عرض جميع الخدمات", nl: "Alle diensten tonen", en: "Show all services" },
  "results.loadMore": { ar: "عرض المزيد", nl: "Meer tonen", en: "Show more" },
  "results.showingOf": { ar: "من", nl: "van", en: "of" },
  "results.suggestions": { ar: "جرّب هذه الخدمات", nl: "Probeer deze diensten", en: "Try these services" },
  "results.empty.desc": {
    ar: "جرّب تعديل البحث أو اختيار تصنيف مختلف.",
    nl: "Pas je zoekopdracht aan of kies een andere categorie.",
    en: "Try adjusting your search or choosing a different category.",
  },
  "results.avatarAlt": { ar: "صورة مقدم الخدمة", nl: "Foto van de professional", en: "Professional's photo" },
  "results.reviewsOne": { ar: "تقييم", nl: "beoordeling", en: "review" },

  "profile.back": { ar: "العودة إلى الخدمات", nl: "Terug naar diensten", en: "Back to services" },
  "profile.about": { ar: "نبذة عن مقدم الخدمة", nl: "Over de professional", en: "About the professional" },
  "profile.noBio": { ar: "لم تتم إضافة نبذة بعد.", nl: "Nog geen omschrijving toegevoegd.", en: "No bio added yet." },
  "profile.info": { ar: "معلومات الخدمة", nl: "Diensteninformatie", en: "Service information" },
  "profile.serviceType": { ar: "نوع الخدمة", nl: "Type dienst", en: "Service type" },
  "profile.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "profile.memberSince": { ar: "عضو منذ", nl: "Lid sinds", en: "Member since" },
  "profile.reviewsTitle": { ar: "التقييمات", nl: "Beoordelingen", en: "Reviews" },
  "profile.noReviews": { ar: "لا توجد تقييمات بعد", nl: "Nog geen beoordelingen", en: "No reviews yet" },
  "profile.notFound": {
    ar: "لم يتم العثور على مقدم الخدمة",
    nl: "Professional niet gevonden",
    en: "Professional not found",
  },
  "profile.notFoundDesc": {
    ar: "قد يكون الملف غير متاح أو تم حذفه.",
    nl: "Dit profiel bestaat mogelijk niet meer.",
    en: "This profile may no longer be available.",
  },
  "profile.summary": { ar: "معلومات مختصرة", nl: "Samenvatting", en: "At a glance" },
  "profile.reviewer": { ar: "زبون", nl: "Klant", en: "Client" },

  // new request flow
  "nr.title": { ar: "اطلب خدمتك", nl: "Vraag je dienst aan", en: "Request your service" },
  "nr.subtitle": {
    ar: "أخبرنا بما تحتاج وساعدنا في الوصول إلى مقدم الخدمة المناسب.",
    nl: "Vertel ons wat je nodig hebt, zodat we de juiste professional vinden.",
    en: "Tell us what you need and we'll help you reach the right professional.",
  },
  "nr.step1": { ar: "الخدمة", nl: "Dienst", en: "Service" },
  "nr.step2": { ar: "التفاصيل", nl: "Details", en: "Details" },
  "nr.step3": { ar: "الموقع", nl: "Locatie", en: "Location" },
  "nr.step4": { ar: "المراجعة", nl: "Controle", en: "Review" },
  "nr.stepOf": { ar: "الخطوة", nl: "Stap", en: "Step" },
  "nr.of": { ar: "من", nl: "van", en: "of" },
  "nr.next": { ar: "متابعة", nl: "Volgende", en: "Continue" },
  "nr.back": { ar: "رجوع", nl: "Terug", en: "Back" },
  "nr.edit": { ar: "تعديل", nl: "Wijzigen", en: "Edit" },
  "nr.serviceQ": { ar: "ما نوع الخدمة التي تحتاجها؟", nl: "Welke dienst heb je nodig?", en: "What kind of service do you need?" },
  "nr.searchService": { ar: "ابحث عن خدمة (مثال: مترجم، كهربائي)", nl: "Zoek een dienst (bijv. tolk, elektricien)", en: "Search a service (e.g. translator, electrician)" },
  "nr.category": { ar: "التصنيف", nl: "Categorie", en: "Category" },
  "nr.pickCategory": { ar: "اختر التصنيف", nl: "Kies een categorie", en: "Choose a category" },
  "nr.noMatch": { ar: "لا توجد نتيجة مطابقة، اختر من التصنيفات أدناه.", nl: "Geen resultaat, kies hieronder een categorie.", en: "No match, pick a category below." },
  "nr.fromProvider": {
    ar: "بدأت الطلب من ملف مقدم خدمة، لذلك تم اختيار التصنيف مسبقًا.",
    nl: "Je begon vanaf een profiel, daarom is de categorie al gekozen.",
    en: "You started from a professional's profile, so the category is preselected.",
  },
  "nr.titleQ": { ar: "ما الذي تحتاجه؟", nl: "Wat heb je nodig?", en: "What do you need?" },
  "nr.titlePh": { ar: "اكتب باختصار ما الذي تحتاج إلى إنجازه...", nl: "Beschrijf kort wat er moet gebeuren...", en: "Briefly describe what needs to be done..." },
  "nr.descQ": { ar: "تفاصيل الطلب", nl: "Details van de aanvraag", en: "Request details" },
  "nr.descPh": { ar: "صف المهمة، الموعد المفضل، وأي تفاصيل مهمة...", nl: "Beschrijf de klus, gewenste datum en belangrijke details...", en: "Describe the task, preferred timing and any important details..." },
  "nr.descHint": {
    ar: "كلما كانت التفاصيل أوضح، حصلت على عروض أكثر دقة.",
    nl: "Hoe duidelijker de details, hoe nauwkeuriger de offertes.",
    en: "The clearer the details, the more accurate the quotes.",
  },
  "nr.budget": { ar: "الميزانية التقريبية (اختياري)", nl: "Indicatief budget (optioneel)", en: "Approximate budget (optional)" },
  "nr.budgetHint": { ar: "اتركها فارغة إذا لم تكن متأكدًا.", nl: "Laat leeg als je het niet zeker weet.", en: "Leave empty if you're not sure." },
  "nr.from": { ar: "من", nl: "Van", en: "From" },
  "nr.to": { ar: "إلى", nl: "Tot", en: "To" },
  "nr.locationQ": { ar: "أين تحتاج الخدمة؟", nl: "Waar heb je de dienst nodig?", en: "Where do you need the service?" },
  "nr.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "nr.pickCity": { ar: "اختر المدينة", nl: "Kies een stad", en: "Choose a city" },
  "nr.searchCity": { ar: "ابحث عن مدينة", nl: "Zoek een stad", en: "Search a city" },
  "nr.photos": { ar: "الصور (اختياري)", nl: "Foto's (optioneel)", en: "Photos (optional)" },
  "nr.photosHint": {
    ar: "أضف صورة إن كانت ستساعد مقدم الخدمة على فهم المشكلة.",
    nl: "Voeg een foto toe als dat de professional helpt.",
    en: "Add a photo if it helps the professional understand the job.",
  },
  "nr.reviewTitle": { ar: "راجع طلبك قبل الإرسال", nl: "Controleer je aanvraag", en: "Review your request" },
  "nr.noBudget": { ar: "غير محددة", nl: "Niet opgegeven", en: "Not specified" },
  "nr.photosCount": { ar: "صورة مرفقة", nl: "foto('s) toegevoegd", en: "photo(s) attached" },
  "nr.submit": { ar: "إرسال الطلب", nl: "Aanvraag versturen", en: "Send request" },
  "nr.submitting": { ar: "جارٍ إرسال الطلب...", nl: "Aanvraag wordt verstuurd...", en: "Sending request..." },
  "nr.errTitle": { ar: "يرجى كتابة عنوان قصير للطلب.", nl: "Geef je aanvraag een korte titel.", en: "Please add a short title." },
  "nr.errCategory": { ar: "يرجى اختيار نوع الخدمة.", nl: "Kies een dienst.", en: "Please choose a service." },
  "nr.errDesc": { ar: "يرجى كتابة وصف للطلب (10 أحرف على الأقل).", nl: "Beschrijf je aanvraag (minimaal 10 tekens).", en: "Please describe your request (at least 10 characters)." },
  "nr.errCity": { ar: "يرجى اختيار المدينة.", nl: "Kies een stad.", en: "Please choose a city." },
  "nr.errBudget": { ar: "الحد الأعلى يجب أن يكون أكبر من الحد الأدنى.", nl: "Het maximum moet hoger zijn dan het minimum.", en: "The maximum must be higher than the minimum." },
  "nr.successTitle": { ar: "تم إرسال طلبك بنجاح", nl: "Je aanvraag is verstuurd", en: "Your request was sent" },
  "nr.successDesc": {
    ar: "سنساعدك في الوصول إلى مقدمي الخدمات المناسبين.",
    nl: "We helpen je de juiste professionals te bereiken.",
    en: "We'll help you reach the right professionals.",
  },
  "nr.viewRequest": { ar: "متابعة الطلب", nl: "Aanvraag bekijken", en: "Track request" },
  "nr.goHome": { ar: "العودة للرئيسية", nl: "Terug naar home", en: "Back to home" },

  // request detail (/requests/$id)
  "rd.back": { ar: "طلباتي", nl: "Mijn aanvragen", en: "My requests" },
  "rd.notFound": { ar: "لم نتمكن من العثور على هذا الطلب", nl: "We konden deze aanvraag niet vinden", en: "We couldn't find this request" },
  "rd.notFoundDesc": {
    ar: "قد يكون الطلب محذوفًا أو غير متاح لك.",
    nl: "De aanvraag is mogelijk verwijderd of niet voor jou beschikbaar.",
    en: "The request may have been removed or is not available to you.",
  },
  "rd.backToMyRequests": { ar: "العودة إلى طلباتي", nl: "Terug naar mijn aanvragen", en: "Back to my requests" },
  "rd.progress": { ar: "مسار الطلب", nl: "Voortgang", en: "Request progress" },
  "rd.tl.created": { ar: "تم إنشاء الطلب", nl: "Aanvraag aangemaakt", en: "Request created" },
  "rd.tl.published": { ar: "تم نشر الطلب", nl: "Aanvraag gepubliceerd", en: "Request published" },
  "rd.tl.receiving": { ar: "استقبال العروض", nl: "Offertes ontvangen", en: "Receiving offers" },
  "rd.tl.selected": { ar: "اختيار مقدم الخدمة", nl: "Professional gekozen", en: "Professional selected" },
  "rd.tl.execution": { ar: "تنفيذ الخدمة", nl: "Uitvoering", en: "Service in progress" },
  "rd.tl.completed": { ar: "إكمال الطلب", nl: "Afgerond", en: "Completed" },
  "rd.tl.closed": { ar: "تم إغلاق الطلب", nl: "Aanvraag gesloten", en: "Request closed" },
  "rd.details": { ar: "تفاصيل الطلب", nl: "Details van de aanvraag", en: "Request details" },
  "rd.serviceType": { ar: "نوع الخدمة", nl: "Soort dienst", en: "Service type" },
  "rd.description": { ar: "الوصف", nl: "Omschrijving", en: "Description" },
  "rd.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "rd.budget": { ar: "الميزانية", nl: "Budget", en: "Budget" },
  "rd.createdAt": { ar: "تاريخ الإنشاء", nl: "Aangemaakt op", en: "Created on" },
  "rd.photos": { ar: "الصور المرفقة", nl: "Toegevoegde foto's", en: "Attached photos" },
  "rd.openPhoto": { ar: "فتح الصورة", nl: "Foto openen", en: "Open photo" },
  "rd.prevPhoto": { ar: "الصورة السابقة", nl: "Vorige foto", en: "Previous photo" },
  "rd.nextPhoto": { ar: "الصورة التالية", nl: "Volgende foto", en: "Next photo" },
  "rd.closePhoto": { ar: "إغلاق", nl: "Sluiten", en: "Close" },
  "rd.bids": { ar: "العروض المقدمة", nl: "Ontvangen offertes", en: "Offers received" },
  "rd.bidsCount": { ar: "عرض مقدم", nl: "offerte(s)", en: "offer(s)" },
  "rd.sortedByPrice": { ar: "مرتبة حسب السعر", nl: "Gesorteerd op prijs", en: "Sorted by price" },
  "rd.noBidsTitle": { ar: "لم تصل عروض بعد", nl: "Nog geen offertes", en: "No offers yet" },
  "rd.noBidsDesc": {
    ar: "سيظهر هنا مقدمو الخدمات الذين أرسلوا عروضهم.",
    nl: "Hier verschijnen de professionals die een offerte sturen.",
    en: "Professionals who send an offer will appear here.",
  },
  "rd.viewProfile": { ar: "عرض الملف", nl: "Profiel bekijken", en: "View profile" },
  "rd.reviewBid": { ar: "مراجعة العرض", nl: "Offerte bekijken", en: "Review offer" },
  "rd.selectBid": { ar: "اختر هذا العرض", nl: "Kies deze offerte", en: "Choose this offer" },
  "bc.title": { ar: "مقارنة العروض", nl: "Offertes vergelijken", en: "Compare offers" },
  "bc.subtitle": {
    ar: "المعلومات معروضة كما قدّمها مقدمو الخدمات، بدون ترتيب تلقائي.",
    nl: "Gegevens zoals opgegeven door de professionals, zonder automatische rangschikking.",
    en: "Data as submitted by the professionals, with no automatic ranking.",
  },
  "bc.provider": { ar: "مقدم الخدمة", nl: "Professional", en: "Professional" },
  "bc.price": { ar: "السعر", nl: "Prijs", en: "Price" },
  "bc.duration": { ar: "مدة التنفيذ", nl: "Doorlooptijd", en: "Duration" },
  "bc.rating": { ar: "التقييم", nl: "Beoordeling", en: "Rating" },
  "bc.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "bc.noRating": { ar: "لا توجد تقييمات", nl: "Geen beoordelingen", en: "No reviews" },
  "bc.reviewsCount": { ar: "تقييم", nl: "beoordelingen", en: "reviews" },
  "bc.confirmTitle": {
    ar: "هل أنت متأكد من اختيار هذا العرض؟",
    nl: "Weet je zeker dat je deze offerte kiest?",
    en: "Are you sure you want to choose this offer?",
  },
  "bc.confirmDesc": {
    ar: "سيصبح هذا مقدم الخدمة المختار لطلبك، وستُغلق بقية العروض.",
    nl: "Deze professional wordt gekozen voor je aanvraag en de andere offertes worden afgesloten.",
    en: "This professional becomes the chosen one for your request, and the other offers are closed.",
  },
  "bc.confirmAction": { ar: "تأكيد الاختيار", nl: "Keuze bevestigen", en: "Confirm choice" },
  "bc.cancel": { ar: "إلغاء", nl: "Annuleren", en: "Cancel" },
  "bc.accepting": { ar: "جارٍ اختيار العرض...", nl: "Offerte kiezen...", en: "Choosing offer..." },
  "bc.successTitle": {
    ar: "تم اختيار مقدم الخدمة بنجاح",
    nl: "Professional succesvol gekozen",
    en: "Professional successfully chosen",
  },
  "bc.successNote": {
    ar: "طلبك الآن قيد الترتيب مع مقدم الخدمة.",
    nl: "Je aanvraag wordt nu met de professional afgestemd.",
    en: "Your request is now being arranged with the professional.",
  },
  "bc.chosenHeading": {
    ar: "تم اختيار مقدم الخدمة",
    nl: "Professional gekozen",
    en: "Professional chosen",
  },
  "bc.chooseHeading": { ar: "اختر مقدم الخدمة", nl: "Kies een professional", en: "Choose a professional" },
  "bc.statusAccepted": { ar: "تم الاختيار", nl: "Gekozen", en: "Chosen" },
  "bc.statusRejected": {
    ar: "لم يتم اختيار العرض",
    nl: "Niet gekozen",
    en: "Not chosen",
  },
  "bc.otherBids": { ar: "العروض الأخرى", nl: "Overige offertes", en: "Other offers" },

  "rd.summary": { ar: "ملخص سريع", nl: "Snel overzicht", en: "Quick summary" },
  "rd.statusTitle": { ar: "حالة الطلب", nl: "Status van de aanvraag", en: "Request status" },
  "rd.client": { ar: "صاحب الطلب", nl: "Aanvrager", en: "Client" },
  "rd.days": { ar: "يوم", nl: "dagen", en: "days" },
  "rd.cta.waiting": { ar: "بانتظار العروض", nl: "Wachten op offertes", en: "Waiting for offers" },
  "rd.cta.review": { ar: "مراجعة العروض", nl: "Offertes bekijken", en: "Review offers" },
  "rd.cta.progress": { ar: "متابعة التنفيذ", nl: "Uitvoering volgen", en: "Track progress" },
  "rd.cta.rate": { ar: "تقييم الخدمة", nl: "Dienst beoordelen", en: "Rate the service" },
  "rd.cta.closed": { ar: "الطلب مغلق", nl: "Aanvraag gesloten", en: "Request closed" },
  "rd.myBid": { ar: "عرضك", nl: "Jouw offerte", en: "Your offer" },
  "rd.delete": { ar: "حذف", nl: "Verwijderen", en: "Delete" },
  "rd.deleteTitle": { ar: "حذف الطلب؟", nl: "Aanvraag verwijderen?", en: "Delete request?" },
  "rd.deleteDesc": {
    ar: "سيتم حذف الطلب وكل العروض المرتبطة به. لا يمكن التراجع عن هذا الإجراء.",
    nl: "De aanvraag en alle bijbehorende offertes worden verwijderd. Dit kan niet ongedaan worden gemaakt.",
    en: "The request and all related offers will be deleted. This cannot be undone.",
  },
  "rd.deleteConfirm": { ar: "حذف", nl: "Verwijderen", en: "Delete" },
  "rd.deleted": { ar: "تم حذف الطلب", nl: "Aanvraag verwijderd", en: "Request deleted" },
  "rd.cancel": { ar: "إلغاء", nl: "Annuleren", en: "Cancel" },
  "rd.ownerClientOnly": {
    ar: "هذا الإجراء متاح لصاحب الطلب في وضع «طالب خدمة» فقط",
    nl: "Deze actie is alleen beschikbaar voor de aanvrager in de modus 'klant'",
    en: "This action is only available to the request owner in client mode",
  },
  // ── Request lifecycle actions ──
  "rd.startWork": { ar: "بدء العمل", nl: "Werk starten", en: "Start work" },
  "rd.startConfirmTitle": {
    ar: "هل تريد بدء تنفيذ هذا الطلب؟",
    nl: "Wil je met deze klus beginnen?",
    en: "Do you want to start this job?",
  },
  "rd.startConfirmDesc": {
    ar: "سيتم تحديث حالة الطلب إلى «قيد التنفيذ» ويظهر ذلك لصاحب الطلب.",
    nl: "De status wordt bijgewerkt naar 'In uitvoering' en is zichtbaar voor de klant.",
    en: "The status becomes “In progress” and the client will see it.",
  },
  "rd.startConfirmAction": { ar: "نعم، ابدأ العمل", nl: "Ja, starten", en: "Yes, start" },
  "rd.startLoading": { ar: "جارٍ البدء...", nl: "Bezig met starten...", en: "Starting..." },
  "rd.startSuccess": { ar: "تم بدء تنفيذ الطلب", nl: "Uitvoering gestart", en: "Work started" },
  "rd.completeWork": { ar: "تم إنجاز العمل", nl: "Werk afgerond", en: "Mark as completed" },
  "rd.completeConfirmTitle": {
    ar: "هل تم إنجاز الخدمة؟",
    nl: "Is de dienst afgerond?",
    en: "Has the service been completed?",
  },
  "rd.completeConfirmDesc": {
    ar: "سيتم تحديث حالة الطلب إلى «مكتمل» ويمكن لصاحب الطلب تقييم الخدمة بعدها.",
    nl: "De status wordt 'Afgerond' en de klant kan daarna een beoordeling achterlaten.",
    en: "The status becomes “Completed” and the client can then leave a review.",
  },
  "rd.completeConfirmAction": { ar: "نعم، تم الإنجاز", nl: "Ja, afgerond", en: "Yes, completed" },
  "rd.completeLoading": { ar: "جارٍ التحديث...", nl: "Bezig met bijwerken...", en: "Updating..." },
  "rd.completeSuccess": { ar: "تم إنجاز العمل", nl: "Werk afgerond", en: "Work completed" },
  "rd.stateAwardedClient": {
    ar: "تم اختيار مقدم الخدمة",
    nl: "Professional gekozen",
    en: "Professional selected",
  },
  "rd.stateInProgressClient": {
    ar: "العمل قيد التنفيذ",
    nl: "Werk in uitvoering",
    en: "Work in progress",
  },
  "rd.stateCompleted": { ar: "اكتمل العمل", nl: "Werk afgerond", en: "Work completed" },
  "rd.rateService": { ar: "قيّم الخدمة", nl: "Beoordeel de dienst", en: "Rate the service" },
  "rd.reviewAfterCompleteHint": {
    ar: "يمكن تقييم الخدمة بعد إنجاز العمل.",
    nl: "Beoordelen kan nadat het werk is afgerond.",
    en: "You can leave a review once the work is completed.",
  },
  // ── My requests (/my-requests) ──
  "mr.title": { ar: "طلباتي", nl: "Mijn aanvragen", en: "My requests" },
  "mr.new": { ar: "طلب جديد", nl: "Nieuwe aanvraag", en: "New request" },
  "mr.emptyTitle": { ar: "لا توجد طلبات بعد", nl: "Nog geen aanvragen", en: "No requests yet" },
  "mr.emptyDesc": {
    ar: "ابدأ بنشر أول طلب لك",
    nl: "Plaats je eerste aanvraag",
    en: "Post your first request",
  },
  "mr.create": { ar: "إنشاء طلب", nl: "Aanvraag maken", en: "Create request" },
  "mr.bidsCount": { ar: "عرض", nl: "offerte(s)", en: "offer(s)" },


  // ── Bid form (/requests/$id) ──
  "bf.title": { ar: "قدّم عرضك", nl: "Doe je aanbod", en: "Make your offer" },
  "bf.subtitle": {
    ar: "أخبر العميل بسعرك ولماذا أنت مناسب لتنفيذ هذه الخدمة.",
    nl: "Vertel de klant je prijs en waarom jij de juiste bent voor deze klus.",
    en: "Tell the client your price and why you are the right fit for this job.",
  },
  "bf.price": { ar: "قيمة العرض", nl: "Bedrag van je offerte", en: "Offer amount" },
  "bf.pricePlaceholder": { ar: "مثال: 250", nl: "Bijv. 250", en: "e.g. 250" },
  "bf.clientBudget": { ar: "ميزانية العميل", nl: "Budget van de klant", en: "Client budget" },
  "bf.duration": { ar: "مدة التنفيذ (أيام)", nl: "Uitvoeringstijd (dagen)", en: "Delivery time (days)" },
  "bf.durationPlaceholder": { ar: "مثال: 3", nl: "Bijv. 3", en: "e.g. 3" },
  "bf.message": { ar: "رسالة للعميل", nl: "Bericht aan de klant", en: "Message to the client" },
  "bf.messagePlaceholder": {
    ar: "اشرح باختصار كيف ستنفذ الخدمة ولماذا أنت مناسب لها...",
    nl: "Leg kort uit hoe je de klus uitvoert en waarom jij geschikt bent...",
    en: "Briefly explain how you will do the job and why you are a good fit...",
  },
  "bf.messageHint": {
    ar: "اجعل رسالتك واضحة ومباشرة.",
    nl: "Houd je bericht duidelijk en direct.",
    en: "Keep your message clear and direct.",
  },
  "bf.preview": { ar: "راجع عرضك قبل الإرسال", nl: "Controleer je offerte voor verzending", en: "Review your offer before sending" },
  "bf.submit": { ar: "إرسال العرض", nl: "Offerte versturen", en: "Send offer" },
  "bf.submitting": { ar: "جارٍ إرسال العرض...", nl: "Offerte wordt verstuurd...", en: "Sending offer..." },
  "bf.errPrice": { ar: "يرجى إدخال قيمة العرض.", nl: "Vul het bedrag van je offerte in.", en: "Please enter your offer amount." },
  "bf.errDuration": { ar: "يرجى إدخال مدة التنفيذ.", nl: "Vul de uitvoeringstijd in.", en: "Please enter the delivery time." },
  "bf.errMessage": { ar: "يرجى كتابة رسالة للعميل.", nl: "Schrijf een bericht aan de klant.", en: "Please write a message to the client." },
  "bf.successTitle": { ar: "تم إرسال عرضك بنجاح", nl: "Je offerte is verstuurd", en: "Your offer has been sent" },
  "bf.successDesc": {
    ar: "سيظهر عرضك للعميل ضمن العروض المقدمة.",
    nl: "Je offerte verschijnt bij de ontvangen offertes van de klant.",
    en: "Your offer will appear among the offers the client received.",
  },
  "bf.followRequest": { ar: "متابعة الطلب", nl: "Aanvraag volgen", en: "Track this request" },
  "bf.backToRequests": { ar: "العودة إلى الطلبات", nl: "Terug naar aanvragen", en: "Back to requests" },
  "bf.alreadyTitle": { ar: "لقد قدمت عرضاً على هذا الطلب", nl: "Je hebt al een offerte gestuurd", en: "You already sent an offer" },
  "bf.myOffer": { ar: "عرضك الحالي", nl: "Jouw huidige offerte", en: "Your current offer" },
  "bf.gateTitle": { ar: "تحتاج اشتراك مقدم الخدمة", nl: "Je hebt een abonnement nodig", en: "You need a provider subscription" },
  "bf.gateDesc": {
    ar: "لإرسال عروضك على طلبات العملاء، تحتاج إلى تفعيل اشتراك مقدم الخدمة.",
    nl: "Om offertes op klantaanvragen te sturen, heb je een actief abonnement nodig.",
    en: "To send offers on client requests, you need an active provider subscription.",
  },
  "bf.gateUsed": { ar: "عروضك هذا الشهر", nl: "Offertes deze maand", en: "Offers this month" },
  "bf.gateCta": { ar: "عرض خطط الاشتراك", nl: "Abonnementen bekijken", en: "View subscription plans" },
  "bf.trial": { ar: "تجربة مجانية", nl: "Gratis proefperiode", en: "Free trial" },
  "bf.subscribed": { ar: "مشترك", nl: "Geabonneerd", en: "Subscribed" },
  "bf.freeLeft": { ar: "عرض مجاني متبقٍ", nl: "gratis offerte over", en: "free offer left" },
  "bf.limitError": {
    ar: "لقد استنفدت العرض المجاني لهذا الشهر. اشترك للاستمرار في تقديم العروض.",
    nl: "Je gratis offerte van deze maand is op. Neem een abonnement om door te gaan.",
    en: "You have used your free offer this month. Subscribe to keep sending offers.",
  },

  // ── Professional: available requests (/requests) ──
  "pro.title": { ar: "طلبات مناسبة لك", nl: "Aanvragen die bij je passen", en: "Requests that match you" },
  "pro.subtitle": {
    ar: "استعرض طلبات العملاء واختر الخدمات التي تناسب خبرتك.",
    nl: "Bekijk aanvragen van klanten en kies wat bij jouw expertise past.",
    en: "Browse client requests and pick the ones that fit your expertise.",
  },
  "pro.countLabel": { ar: "طلب متاح", nl: "beschikbare aanvragen", en: "available requests" },
  "pro.searchPlaceholder": { ar: "ابحث عن خدمة أو طلب...", nl: "Zoek een dienst of aanvraag...", en: "Search a service or request..." },
  "pro.filters": { ar: "تصفية الطلبات", nl: "Aanvragen filteren", en: "Filter requests" },
  "pro.clearFilters": { ar: "مسح الفلاتر", nl: "Filters wissen", en: "Clear filters" },
  "pro.allCities": { ar: "كل المدن", nl: "Alle steden", en: "All cities" },
  "pro.allCategories": { ar: "كل الخدمات", nl: "Alle diensten", en: "All services" },
  "pro.allStatuses": { ar: "كل الحالات", nl: "Alle statussen", en: "All statuses" },
  "pro.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "pro.category": { ar: "نوع الخدمة", nl: "Soort dienst", en: "Service type" },
  "pro.status": { ar: "حالة الطلب", nl: "Status", en: "Status" },
  "pro.budget": { ar: "الميزانية", nl: "Budget", en: "Budget" },
  "pro.anyBudget": { ar: "أي ميزانية", nl: "Elk budget", en: "Any budget" },
  "pro.withBudget": { ar: "طلبات بميزانية محددة", nl: "Met opgegeven budget", en: "With a stated budget" },
  "pro.sort": { ar: "الترتيب", nl: "Sorteren", en: "Sort" },
  "pro.sortNewest": { ar: "الأحدث", nl: "Nieuwste", en: "Newest" },
  "pro.sortBudget": { ar: "الأعلى ميزانية", nl: "Hoogste budget", en: "Highest budget" },
  "pro.sortFewestBids": { ar: "الأقل عروضاً", nl: "Minste offertes", en: "Fewest offers" },
  "pro.myCity": { ar: "في مدينتي", nl: "In mijn stad", en: "In my city" },
  "pro.myProfession": { ar: "ضمن مهنتي", nl: "Binnen mijn vak", en: "In my profession" },
  "pro.bidsCount": { ar: "عرض", nl: "offertes", en: "offers" },
  "pro.noBidsYet": { ar: "لا عروض بعد", nl: "Nog geen offertes", en: "No offers yet" },
  "pro.view": { ar: "عرض الطلب", nl: "Aanvraag bekijken", en: "View request" },
  "pro.bid": { ar: "تقديم عرض", nl: "Offerte indienen", en: "Submit offer" },
  "pro.alreadyBid": { ar: "قدّمت عرضاً", nl: "Offerte ingediend", en: "Offer submitted" },
  "pro.emptyTitle": { ar: "لا توجد طلبات مناسبة حاليًا", nl: "Nu geen passende aanvragen", en: "No matching requests right now" },
  "pro.emptyDesc": {
    ar: "تحقق مرة أخرى لاحقًا، ستظهر هنا الطلبات المتاحة لخدماتك.",
    nl: "Kom later terug; beschikbare aanvragen voor jouw diensten verschijnen hier.",
    en: "Check back later — requests available for your services will show up here.",
  },
  "pro.opportunity": { ar: "فرص عمل جديدة", nl: "Nieuwe kansen", en: "New opportunities" },



  // notifications
  "notif.title": { ar: "الإشعارات", nl: "Meldingen", en: "Notifications" },
  "notif.empty": {
    ar: "لا توجد إشعارات حتى الآن",
    nl: "Nog geen meldingen",
    en: "No notifications yet",
  },
  "notif.emptyUnread": {
    ar: "لا توجد إشعارات غير مقروءة",
    nl: "Geen ongelezen meldingen",
    en: "No unread notifications",
  },
  "notif.all": { ar: "الكل", nl: "Alles", en: "All" },
  "notif.unread": { ar: "غير المقروءة", nl: "Ongelezen", en: "Unread" },
  "notif.markAll": { ar: "تحديد الكل كمقروء", nl: "Alles als gelezen markeren", en: "Mark all as read" },
  "notif.viewAll": { ar: "عرض كل الإشعارات", nl: "Alle meldingen bekijken", en: "View all notifications" },
  "notif.open": { ar: "فتح الإشعارات", nl: "Meldingen openen", en: "Open notifications" },
  "notif.pageSubtitle": {
    ar: "كل ما يخص طلباتك وعروضك في مكان واحد",
    nl: "Alles over je aanvragen en offertes op één plek",
    en: "Everything about your requests and bids in one place",
  },
  "notif.type.bid_received": {
    ar: "وصل عرض جديد على طلبك",
    nl: "Je hebt een nieuwe offerte ontvangen",
    en: "You received a new bid on your request",
  },
  "notif.type.bid_accepted": {
    ar: "تم اختيار عرضك",
    nl: "Je offerte is gekozen",
    en: "Your bid was selected",
  },
  "notif.type.bid_rejected": {
    ar: "لم يتم اختيار عرضك لهذا الطلب",
    nl: "Je offerte is deze keer niet gekozen",
    en: "Your bid wasn't selected this time",
  },
  "notif.type.request_started": {
    ar: "بدأ مقدم الخدمة تنفيذ طلبك",
    nl: "De professional is met je aanvraag gestart",
    en: "The professional started working on your request",
  },
  "notif.type.request_completed": {
    ar: "تم إنجاز طلبك",
    nl: "Je aanvraag is afgerond",
    en: "Your request has been completed",
  },
  "notif.type.review_reminder": {
    ar: "شاركنا تقييمك للخدمة",
    nl: "Deel je beoordeling van de service",
    en: "Share your review of the service",
  },
  "notif.time.now": { ar: "الآن", nl: "Nu", en: "Now" },
  "notif.time.minutes": { ar: "منذ {n} دقيقة", nl: "{n} min geleden", en: "{n} min ago" },
  "notif.time.hours": { ar: "منذ {n} ساعة", nl: "{n} uur geleden", en: "{n} h ago" },
  "notif.time.days": { ar: "منذ {n} يوم", nl: "{n} d geleden", en: "{n} d ago" },
  "notif.time.yesterday": { ar: "أمس", nl: "Gisteren", en: "Yesterday" },
  "notif.emptyHint": {
    ar: "ستظهر هنا التحديثات المتعلقة بطلباتك وعروضك.",
    nl: "Hier verschijnen updates over je aanvragen en offertes.",
    en: "Updates about your requests and bids will appear here.",
  },
  "notif.error": {
    ar: "تعذر تحميل الإشعارات",
    nl: "Meldingen konden niet worden geladen",
    en: "Couldn't load notifications",
  },
  "notif.retry": { ar: "إعادة المحاولة", nl: "Opnieuw proberen", en: "Try again" },
  "notif.unreadCount": {
    ar: "{n} إشعار غير مقروء",
    nl: "{n} ongelezen meldingen",
    en: "{n} unread notifications",
  },
  // dashboard v2
  "db.hello": { ar: "مرحبًا", nl: "Hallo", en: "Hello" },
  "db.subClient": {
    ar: "تابع طلباتك وخدماتك من مكان واحد.",
    nl: "Volg je aanvragen en diensten op één plek.",
    en: "Track your requests and services in one place.",
  },
  "db.subPro": {
    ar: "تابع فرص العمل والعروض والخدمات التي تقدمها.",
    nl: "Volg werkkansen, offertes en jouw diensten.",
    en: "Track opportunities, bids and the services you offer.",
  },
  "db.quickActions": { ar: "إجراءات سريعة", nl: "Snelle acties", en: "Quick actions" },
  "db.browseServices": { ar: "تصفح الخدمات", nl: "Diensten bekijken", en: "Browse services" },
  "db.browseOpportunities": { ar: "تصفح فرص العمل", nl: "Werkkansen bekijken", en: "Browse opportunities" },
  "db.notifications": { ar: "الإشعارات", nl: "Meldingen", en: "Notifications" },
  "db.stats": { ar: "نظرة عامة", nl: "Overzicht", en: "Overview" },
  "db.statOpen": { ar: "طلبات مفتوحة", nl: "Open aanvragen", en: "Open requests" },
  "db.statWithBids": { ar: "طلبات لديها عروض", nl: "Aanvragen met offertes", en: "Requests with bids" },
  "db.statAwarded": { ar: "تم اختيار مقدم خدمة", nl: "Professional gekozen", en: "Professional chosen" },
  "db.statInProgress": { ar: "قيد التنفيذ", nl: "In uitvoering", en: "In progress" },
  "db.statCompleted": { ar: "مكتملة", nl: "Afgerond", en: "Completed" },
  "db.statOpportunities": { ar: "فرص عمل متاحة", nl: "Beschikbare kansen", en: "Available opportunities" },
  "db.statBids": { ar: "عروض قدمتها", nl: "Verstuurde offertes", en: "Bids sent" },
  "db.statAccepted": { ar: "عروض مقبولة", nl: "Geaccepteerde offertes", en: "Accepted bids" },
  "db.statJobsInProgress": { ar: "أعمال قيد التنفيذ", nl: "Werk in uitvoering", en: "Jobs in progress" },
  "db.statJobsDone": { ar: "أعمال مكتملة", nl: "Afgerond werk", en: "Completed jobs" },
  "db.actionRequired": { ar: "يحتاج إلى إجراء منك", nl: "Vraagt om jouw actie", en: "Needs your action" },
  "db.arNewBids": { ar: "عروض جديدة بانتظار المراجعة", nl: "Nieuwe offertes wachten op review", en: "New bids awaiting review" },
  "db.arReview": { ar: "طلب مكتمل بانتظار تقييمك", nl: "Afgeronde aanvraag wacht op je beoordeling", en: "Completed request awaiting your review" },
  "db.arUnread": { ar: "إشعارات غير مقروءة", nl: "Ongelezen meldingen", en: "Unread notifications" },
  "db.arStart": { ar: "عرض مقبول — ابدأ العمل", nl: "Offerte geaccepteerd — start het werk", en: "Bid accepted — start the work" },
  "db.arComplete": { ar: "عمل قيد التنفيذ — أكمل التنفيذ", nl: "Werk in uitvoering — rond het af", en: "Job in progress — complete it" },
  "db.myRequests": { ar: "طلباتي", nl: "Mijn aanvragen", en: "My requests" },
  "db.opportunities": { ar: "فرص العمل", nl: "Werkkansen", en: "Opportunities" },
  "db.myBids": { ar: "عروضي", nl: "Mijn offertes", en: "My bids" },
  "db.viewAll": { ar: "عرض الكل", nl: "Alles bekijken", en: "View all" },
  "db.ctaReviewBids": { ar: "مراجعة العروض", nl: "Offertes bekijken", en: "Review bids" },
  "db.ctaFollow": { ar: "متابعة الطلب", nl: "Aanvraag volgen", en: "Follow request" },
  "db.ctaFollowWork": { ar: "متابعة التنفيذ", nl: "Uitvoering volgen", en: "Follow progress" },
  "db.ctaRate": { ar: "قيّم الخدمة", nl: "Beoordeel de dienst", en: "Rate the service" },
  "db.ctaViewRequest": { ar: "عرض الطلب", nl: "Aanvraag bekijken", en: "View request" },
  "db.ctaPlaceBid": { ar: "تقديم عرض", nl: "Offerte plaatsen", en: "Place a bid" },
  "db.emptyClient": { ar: "ابدأ بطلب خدمتك الأولى", nl: "Begin met je eerste aanvraag", en: "Start with your first request" },
  "db.emptyPro": { ar: "ابدأ باكتشاف فرص العمل", nl: "Ontdek je eerste werkkansen", en: "Start discovering opportunities" },
  "db.emptyOpportunities": { ar: "لا توجد فرص متاحة حاليًا", nl: "Geen kansen beschikbaar", en: "No opportunities available" },
  "db.bidsCount": { ar: "عروض", nl: "offertes", en: "bids" },
  "db.days": { ar: "يوم", nl: "dagen", en: "days" },

  // ---- Account / profile page ----
  "acct.title": { ar: "ملفي الشخصي", nl: "Mijn profiel", en: "My profile" },
  "acct.email": { ar: "البريد الإلكتروني", nl: "E-mailadres", en: "Email" },
  "acct.fullName": { ar: "الاسم الكامل", nl: "Volledige naam", en: "Full name" },
  "acct.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "acct.pickCity": { ar: "اختر مدينتك", nl: "Kies je stad", en: "Choose your city" },
  "acct.phone": { ar: "رقم الجوال", nl: "Telefoonnummer", en: "Phone number" },
  "acct.profession": { ar: "المهنة", nl: "Beroep", en: "Profession" },
  "acct.pickProfession": { ar: "اختر مهنتك", nl: "Kies je beroep", en: "Choose your profession" },
  "acct.bio": { ar: "نبذة عنك", nl: "Over jou", en: "About you" },
  "acct.save": { ar: "حفظ التغييرات", nl: "Wijzigingen opslaan", en: "Save changes" },
  "acct.saved": { ar: "تم حفظ التغييرات", nl: "Wijzigingen opgeslagen", en: "Changes saved" },
  "acct.reviewsReceived": { ar: "التقييمات المستلمة", nl: "Ontvangen beoordelingen", en: "Reviews received" },
  "acct.noReviews": { ar: "لا توجد تقييمات بعد", nl: "Nog geen beoordelingen", en: "No reviews yet" },
  "acct.client": { ar: "زبون", nl: "Klant", en: "Client" },

  // ---- Subscription ----
  "sub.loading": { ar: "جاري التحميل...", nl: "Laden...", en: "Loading..." },
  "sub.clientFreeTitle": { ar: "حساب الزبائن مجاني دائماً", nl: "Een klantaccount is altijd gratis", en: "Client accounts are always free" },
  "sub.clientFreeBody": {
    ar: "الاشتراك مطلوب فقط لأصحاب المهن. أكمل ملفك كصاحب مهنة للاستفادة من التجربة المجانية.",
    nl: "Een abonnement is alleen nodig voor professionals. Vul je profiel als professional in om de gratis proefperiode te gebruiken.",
    en: "A subscription is only required for professionals. Complete your professional profile to start the free trial.",
  },
  "sub.toProfile": { ar: "إلى الملف الشخصي", nl: "Naar mijn profiel", en: "Go to profile" },
  "sub.title": { ar: "اشتراكك", nl: "Jouw abonnement", en: "Your subscription" },
  "sub.subtitle": {
    ar: "شهران مجانيان لكل صاحب مهنة جديد، ثم اشتراك شهري لتقديم عروض غير محدودة.",
    nl: "Twee gratis maanden voor elke nieuwe professional, daarna een maandabonnement voor onbeperkt offertes uitbrengen.",
    en: "Two free months for every new professional, then a monthly subscription for unlimited bids.",
  },
  "sub.history": { ar: "سجل الاشتراك", nl: "Abonnementsgeschiedenis", en: "Subscription history" },
  "sub.currentStatus": { ar: "الحالة الحالية", nl: "Huidige status", en: "Current status" },
  "sub.trialActive": { ar: "فترة تجربة مجانية", nl: "Gratis proefperiode", en: "Free trial" },
  "sub.paidActive": { ar: "اشتراك نشط", nl: "Actief abonnement", en: "Active subscription" },
  "sub.trialEnded": { ar: "انتهت التجربة", nl: "Proefperiode beëindigd", en: "Trial ended" },
  "sub.daysLeft": { ar: "يوم متبقٍ من تجربتك المجانية", nl: "dagen over van je gratis proefperiode", en: "days left in your free trial" },
  "sub.endsIn": { ar: "تنتهي", nl: "Eindigt", en: "Ends" },
  "sub.limitNotice": {
    ar: "انتهت فترتك التجريبية. يمكنك تقديم عرض واحد فقط شهرياً حتى تشترك.",
    nl: "Je proefperiode is voorbij. Je kunt één offerte per maand uitbrengen tot je een abonnement neemt.",
    en: "Your trial has ended. You can place one bid per month until you subscribe.",
  },
  "sub.bidsThisMonth": { ar: "العروض هذا الشهر", nl: "Offertes deze maand", en: "Bids this month" },
  "sub.unlimited": { ar: "غير محدود", nl: "Onbeperkt", en: "Unlimited" },
  "sub.remainingFree": { ar: "المتبقي مجاناً", nl: "Gratis resterend", en: "Free remaining" },
  "sub.plan": { ar: "خطة العضوية", nl: "Lidmaatschapsplan", en: "Membership plan" },
  "sub.feat1": { ar: "عروض غير محدودة على كل الطلبات", nl: "Onbeperkt offertes op alle aanvragen", en: "Unlimited bids on all requests" },
  "sub.feat2": { ar: "ظهور فوري في نتائج المدينة والتخصص", nl: "Direct zichtbaar in stad- en vakresultaten", en: "Instant visibility in city and category results" },
  "sub.feat3": { ar: "تنبيهات عند نشر طلبات جديدة", nl: "Meldingen bij nieuwe aanvragen", en: "Alerts for new requests" },
  "sub.feat4": { ar: "إلغاء في أي وقت", nl: "Altijd opzegbaar", en: "Cancel anytime" },
  "sub.soon": { ar: "قريباً", nl: "Binnenkort", en: "Coming soon" },
  "sub.soonHint": { ar: "سيتم تفعيل الدفع قريباً", nl: "Betalingen worden binnenkort geactiveerd", en: "Payments will be enabled soon" },
  "sub.subscribed": { ar: "أنت مشترك", nl: "Je bent geabonneerd", en: "You are subscribed" },
  "sub.subscribe": { ar: "اشترك", nl: "Abonneren", en: "Subscribe" },
  "sub.cancelTitle": { ar: "إلغاء الاشتراك", nl: "Abonnement opzeggen", en: "Cancel subscription" },
  "sub.cancelBody": {
    ar: "عند الإلغاء، يبقى اشتراكك نشطاً حتى نهاية الفترة الحالية، ثم يتوقف التجديد التلقائي ويعود حسابك إلى الحد المجاني (عرض واحد شهرياً).",
    nl: "Na opzegging blijft je abonnement actief tot het einde van de huidige periode; daarna stopt de automatische verlenging en geldt de gratis limiet (één offerte per maand).",
    en: "After cancelling, your subscription stays active until the end of the current period; then auto-renewal stops and the free limit applies (one bid per month).",
  },
  "sub.trialEndDate": { ar: "تاريخ انتهاء التجربة", nl: "Einddatum proefperiode", en: "Trial end date" },
  "sub.periodEndDate": { ar: "تاريخ انتهاء الفترة الحالية", nl: "Einddatum huidige periode", en: "Current period end date" },
  "sub.effectiveAfter": { ar: "يسري الإلغاء بعد هذا التاريخ.", nl: "De opzegging gaat na deze datum in.", en: "Cancellation takes effect after this date." },
  "sub.canceledOn": { ar: "تم طلب الإلغاء في", nl: "Opzegging aangevraagd op", en: "Cancellation requested on" },
  "sub.noRenew": { ar: "لن يتم تجديد الاشتراك تلقائياً.", nl: "Het abonnement wordt niet automatisch verlengd.", en: "The subscription will not renew automatically." },
  "sub.resume": { ar: "استئناف الاشتراك", nl: "Abonnement hervatten", en: "Resume subscription" },
  "sub.confirmCancel": { ar: "تأكيد إلغاء الاشتراك", nl: "Opzegging bevestigen", en: "Confirm cancellation" },
  "sub.activeUntil": { ar: "سيبقى اشتراكك نشطاً حتى", nl: "Je abonnement blijft actief tot", en: "Your subscription stays active until" },
  "sub.periodEndFallback": { ar: "نهاية الفترة الحالية", nl: "het einde van de huidige periode", en: "the end of the current period" },
  "sub.cancelExplain": {
    ar: "بعد هذا التاريخ يتوقف التجديد التلقائي، ولن تُخصم أي مبالغ جديدة، ويعود حسابك إلى الحد المجاني (عرض واحد شهرياً).",
    nl: "Na deze datum stopt de automatische verlenging, worden er geen bedragen meer afgeschreven en geldt de gratis limiet (één offerte per maand).",
    en: "After this date auto-renewal stops, no further charges are made, and the free limit applies (one bid per month).",
  },
  "sub.resumeAnytime": { ar: "يمكنك استئناف الاشتراك في أي وقت قبل تاريخ الانتهاء.", nl: "Je kunt het abonnement altijd hervatten vóór de einddatum.", en: "You can resume anytime before the end date." },
  "sub.back": { ar: "تراجع", nl: "Terug", en: "Back" },
  "sub.confirm": { ar: "تأكيد الإلغاء", nl: "Opzegging bevestigen", en: "Confirm cancellation" },
  "sub.updateError": { ar: "تعذر تحديث الاشتراك", nl: "Abonnement bijwerken mislukt", en: "Could not update the subscription" },
  "sub.cancelScheduled": { ar: "تم جدولة إلغاء الاشتراك", nl: "Opzegging ingepland", en: "Cancellation scheduled" },
  "sub.resumed": { ar: "تم استئناف الاشتراك", nl: "Abonnement hervat", en: "Subscription resumed" },

  // ── My bids (/my-bids) ──
  "mb.title": { ar: "عروضي", nl: "Mijn offertes", en: "My bids" },
  "mb.emptyTitle": { ar: "لم تقدّم أي عروض بعد", nl: "Nog geen offertes verstuurd", en: "No bids submitted yet" },
  "mb.emptyDesc": {
    ar: "تصفح الطلبات المتاحة وقدّم عرضك الأول",
    nl: "Bekijk de open aanvragen en stuur je eerste offerte",
    en: "Browse the open requests and send your first bid",
  },
  "mb.browse": { ar: "تصفح الطلبات", nl: "Aanvragen bekijken", en: "Browse requests" },

  // ── Reviews ──
  "rv.title": { ar: "التقييمات", nl: "Beoordelingen", en: "Reviews" },
  "rv.empty": { ar: "لا يوجد تقييم بعد", nl: "Nog geen beoordelingen", en: "No reviews yet" },
  "rv.formTitle": { ar: "قيّم صاحب المهنة", nl: "Beoordeel de professional", en: "Rate the professional" },
  "rv.rating": { ar: "التقييم", nl: "Beoordeling", en: "Rating" },
  "rv.comment": { ar: "تعليقك", nl: "Jouw reactie", en: "Your comment" },
  "rv.commentPlaceholder": { ar: "كيف كانت تجربتك؟", nl: "Hoe was je ervaring?", en: "How was your experience?" },
  "rv.images": { ar: "صور النتيجة (اختياري)", nl: "Foto's van het resultaat (optioneel)", en: "Result photos (optional)" },
  "rv.submit": { ar: "إرسال التقييم", nl: "Beoordeling versturen", en: "Submit review" },
  "rv.pickStars": { ar: "اختر تقييماً بالنجوم", nl: "Kies een sterbeoordeling", en: "Pick a star rating" },
  "rv.sent": { ar: "تم إرسال التقييم", nl: "Beoordeling verstuurd", en: "Review submitted" },
  "rv.anonClient": { ar: "زبون", nl: "Klant", en: "Client" },

  // ── Onboarding ──
  "onb.title": { ar: "أكمل ملفك الشخصي", nl: "Maak je profiel compleet", en: "Complete your profile" },
  "onb.subtitle": {
    ar: "اختر نوع حسابك لبدء استخدام المنصة",
    nl: "Kies je accounttype om te beginnen",
    en: "Choose your account type to get started",
  },
  "onb.clientTitle": { ar: "أنا زبون", nl: "Ik ben klant", en: "I'm a client" },
  "onb.clientDesc": {
    ar: "أريد نشر طلبات خدمة واستقبال العروض",
    nl: "Ik wil aanvragen plaatsen en offertes ontvangen",
    en: "I want to post requests and receive bids",
  },
  "onb.proTitle": { ar: "أنا صاحب مهنة", nl: "Ik ben professional", en: "I'm a professional" },
  "onb.proDesc": {
    ar: "أقدم خدمات وأريد تقديم عروض على الطلبات",
    nl: "Ik lever diensten en wil offertes uitbrengen",
    en: "I offer services and want to bid on requests",
  },
  "onb.fullName": { ar: "الاسم الكامل", nl: "Volledige naam", en: "Full name" },
  "onb.city": { ar: "المدينة", nl: "Stad", en: "City" },
  "onb.cityPlaceholder": { ar: "اختر مدينتك", nl: "Kies je stad", en: "Select your city" },
  "onb.phone": { ar: "رقم الجوال", nl: "Telefoonnummer", en: "Phone number" },
  "onb.profession": { ar: "المهنة الرئيسية", nl: "Hoofdvak", en: "Main profession" },
  "onb.professionPlaceholder": { ar: "اختر مهنتك", nl: "Kies je vak", en: "Select your profession" },
  "onb.bio": { ar: "نبذة عنك (اختياري)", nl: "Over jou (optioneel)", en: "About you (optional)" },
  "onb.bioPlaceholder": {
    ar: "سنوات الخبرة، نطاق العمل...",
    nl: "Jaren ervaring, werkgebied...",
    en: "Years of experience, service area...",
  },
  "onb.back": { ar: "رجوع", nl: "Terug", en: "Back" },
  "onb.finish": { ar: "إكمال التسجيل", nl: "Registratie afronden", en: "Finish sign-up" },
  "onb.done": { ar: "تم إكمال ملفك الشخصي", nl: "Je profiel is compleet", en: "Your profile is complete" },

  "nav.subscription": { ar: "الاشتراك", nl: "Abonnement", en: "Subscription" },
  "common.error": { ar: "حدث خطأ", nl: "Er is iets misgegaan", en: "Something went wrong" },
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
