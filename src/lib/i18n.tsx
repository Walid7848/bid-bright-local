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
    ar: "مرحبًا بكم في منصة مِهنتي. تحترم المنصة خصوصية جميع مستخدميها وتلتزم بحماية البيانات الشخصية وفقًا للائحة العامة لحماية البيانات (GDPR) والقوانين الهولندية المعمول بها. باستخدام المنصة أو إنشاء حساب، فإنك توافق على معالجة بياناتك الشخصية وفقًا لهذه السياسة.",
    nl: "Welkom bij Mihnati. Het platform respecteert de privacy van alle gebruikers en beschermt persoonsgegevens conform de AVG (GDPR) en de toepasselijke Nederlandse wetgeving. Door het platform te gebruiken of een account aan te maken, ga je akkoord met de verwerking van je persoonsgegevens volgens dit beleid.",
    en: "Welcome to Mihnati. The platform respects the privacy of all users and protects personal data in accordance with the GDPR and applicable Dutch law. By using the platform or creating an account, you consent to the processing of your personal data under this policy.",
  },
  "privacy.s1.title": { ar: "١. المسؤول عن معالجة البيانات", nl: "1. Verwerkingsverantwoordelijke", en: "1. Data controller" },
  "privacy.s1.body": {
    ar: "تعد منصة مِهنتي هي المسؤول عن معالجة البيانات الشخصية للمستخدمين. للاستفسارات المتعلقة بالخصوصية أو ممارسة حقوقك، يمكنك التواصل عبر البريد الإلكتروني: privacy@mihnati.nl",
    nl: "Mihnati is verwerkingsverantwoordelijke voor de persoonsgegevens van gebruikers. Voor privacyvragen of het uitoefenen van je rechten kun je contact opnemen via: privacy@mihnati.nl",
    en: "Mihnati is the controller of users' personal data. For privacy questions or to exercise your rights, contact: privacy@mihnati.nl",
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
    ar: "لأي استفسار متعلق بالخصوصية أو لممارسة حقوقك، يرجى التواصل عبر البريد الإلكتروني: privacy@mihnati.nl",
    nl: "Voor privacyvragen of het uitoefenen van je rechten kun je contact opnemen via: privacy@mihnati.nl",
    en: "For any privacy question or to exercise your rights, contact: privacy@mihnati.nl",
  },

  // terms
  "terms.title": { ar: "شروط الاستخدام", nl: "Gebruiksvoorwaarden", en: "Terms of Use" },
  "terms.updated": { ar: "آخر تحديث: يوليو 2026", nl: "Laatst bijgewerkt: juli 2026", en: "Last updated: July 2026" },
  "terms.intro": {
    ar: "توضح هذه الشروط قواعد استخدام منصة مِهنتي. باستخدامك المنصة فإنك توافق على الالتزام بها. يرجى قراءتها بعناية.",
    nl: "Deze voorwaarden bepalen de regels voor het gebruik van Mihnati. Door het platform te gebruiken ga je akkoord met deze voorwaarden. Lees ze zorgvuldig.",
    en: "These terms set out the rules for using Mihnati. By using the platform you agree to them. Please read them carefully.",
  },
  "terms.s1.title": { ar: "١. التعريفات", nl: "1. Definities", en: "1. Definitions" },
  "terms.s1.body": {
    ar: "المنصة: منصة مِهنتي. الحرفي: الشخص أو المؤسسة التي تعرض خدماتها عبر المنصة. الزبون: الشخص الذي يستخدم المنصة للبحث عن الحرفيين والتواصل معهم.",
    nl: "Platform: Mihnati. Vakman/professional: de persoon of organisatie die diensten aanbiedt via het platform. Klant: de persoon die het platform gebruikt om vakmensen te zoeken en te contacteren.",
    en: "Platform: Mihnati. Professional: the person or organisation offering services via the platform. Client: the person using the platform to find and contact professionals.",
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
