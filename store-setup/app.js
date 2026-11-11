(function () {
  // ---------- storage / i18n ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const readJSON = (k, fallback) => { try { return JSON.parse(store.get(k)) || fallback; } catch (e) { return fallback; } };

  let lang = store.get('stores.lang') === 'ar' ? 'ar' : 'en';
  let answers = readJSON('stores.answers', {});
  let done = new Set(readJSON('stores.done', []));
  let typingFor = null;

  const L = (o) => (o && (o[lang] || o.en)) || '';

  const STR = {
    en: {
      title: 'Store Accounts', sub: 'Google Play & App Store setup', reset: 'Start over',
      resetConfirm: 'Clear your answers and ticked steps?',
      assistant: 'Setup assistant', online: 'Online', change: 'Change',
      hello: "Hi! I'll help you open your Google Play and Apple developer accounts. Answer a few quick questions and I'll build your checklist.",
      allDone: "That's everything. Your plan is ready on the side. Tick each step as you finish it and I'll remember where you are on this browser.",
      allDoneHint: 'All set. Tap “Change” under any answer to redo it.',
      prep: 'Before you start', google: 'Google Play Console', apple: 'Apple Developer Program',
      tips: 'Heads up for a ride & delivery app',
      draft: 'Draft: answer the questions to tailor it', tailored: 'Tailored to your answers',
      wait: 'Typical wait', once: 'one-time', yearly: 'per year', acct: 'Account type',
      company: 'Company', personal: 'Personal', progress: 'Progress', steps: 'steps',
      footnote: 'Last reviewed November 2026. Store rules and fees change often, so confirm on the official pages before you pay:',
    },
    ar: {
      title: 'حسابات المتاجر', sub: 'إعداد Google Play و App Store', reset: 'ابدأ من جديد',
      resetConfirm: 'هل تريد مسح إجاباتك والخطوات المنجزة؟',
      assistant: 'مساعد الإعداد', online: 'متصل', change: 'تغيير',
      hello: 'أهلاً! سأساعدك في فتح حسابَي المطوّر على Google Play و Apple. أجب عن بضعة أسئلة سريعة وسأجهّز لك قائمة الخطوات.',
      allDone: 'هذا كل شيء. خطتك جاهزة بجانبك. علّم كل خطوة عند إنهائها وسأتذكر أين وصلت على هذا المتصفح.',
      allDoneHint: 'تم. اضغط «تغيير» تحت أي إجابة لتعديلها.',
      prep: 'قبل أن تبدأ', google: 'Google Play Console', apple: 'Apple Developer Program',
      tips: 'تنبيهات لتطبيق رحلات وتوصيل',
      draft: 'مسودة: أجب عن الأسئلة لتخصيصها', tailored: 'مخصّصة حسب إجاباتك',
      wait: 'مدة الانتظار المعتادة', once: 'مرة واحدة', yearly: 'سنوياً', acct: 'نوع الحساب',
      company: 'شركة', personal: 'شخصي', progress: 'التقدم', steps: 'خطوات',
      footnote: 'آخر مراجعة: نوفمبر 2026. قواعد المتاجر ورسومها تتغير كثيراً، فتأكد من الصفحات الرسمية قبل الدفع:',
    },
  };
  const t = (k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;

  const LINKS = {
    playSignup: 'https://play.google.com/console/signup',
    playHelp: 'https://support.google.com/googleplay/android-developer',
    androidVerify: 'https://developer.android.com/developer-verification',
    appleEnroll: 'https://developer.apple.com/programs/enroll/',
    appleApp: 'https://developer.apple.com/support/app-account/',
    duns: 'https://developer.apple.com/enroll/duns-lookup/',
    asc: 'https://appstoreconnect.apple.com',
  };

  // ---------- conversation ----------
  // Each question: `when` decides if it's asked, each option has a label (l) and a reply (r).
  const Q = [
    {
      id: 'owner',
      q: { en: 'Who will publish the apps: a registered company, or you personally?', ar: 'من سينشر التطبيقات: شركة مسجّلة أم أنت بصفتك الشخصية؟' },
      opts: [
        { v: 'company', l: { en: 'A registered company', ar: 'شركة مسجّلة' },
          r: { en: "Good choice for a ride and delivery app. Both stores will show your company as the developer, and Apple asks apps that handle payments or sensitive data (wallets, top-ups, live location) to be published by the business itself. You'll need a D-U-N-S number, which is my next question.",
               ar: 'اختيار ممتاز لتطبيق رحلات وتوصيل. سيظهر اسم شركتك كمطوّر في المتجرين، و Apple تطلب أن تُنشر التطبيقات التي تتعامل مع المدفوعات أو البيانات الحساسة (المحافظ، الشحن، الموقع المباشر) باسم الشركة نفسها. ستحتاج رقم D-U-N-S، وهذا سؤالي التالي.' } },
        { v: 'personal', l: { en: 'Me, personally', ar: 'أنا شخصياً' },
          r: { en: 'OK, this is the fastest way to start. Your legal name will show as the seller. Two catches: Google makes new personal accounts run a closed test (12 testers for 14 days) before going public, and Apple may push back on a wallet and payments app from an individual. You can move the apps to a company account later.',
               ar: 'تمام، هذه أسرع طريقة للبدء. سيظهر اسمك القانوني كناشر. لكن انتبه لأمرين: Google تُلزم الحسابات الشخصية الجديدة باختبار مغلق (12 مختبِراً لمدة 14 يوماً) قبل النشر للعامة، و Apple قد تعترض على تطبيق محافظ ومدفوعات من حساب فردي. يمكنك نقل التطبيقات إلى حساب شركة لاحقاً.' } },
        { v: 'unsure', l: { en: 'Not sure yet', ar: 'لست متأكداً بعد' },
          r: { en: "I recommend a company account, because your app has wallets, top-ups and live location. If the company isn't registered yet you can start personal and move the apps later, but registering first saves you doing it twice. I'll plan for a company; you can change that any time.",
               ar: 'أنصحك بحساب شركة، لأن تطبيقك فيه محافظ وشحن رصيد وموقع مباشر. إن لم تكن الشركة مسجّلة بعد يمكنك البدء بحساب شخصي ونقل التطبيقات لاحقاً، لكن تسجيل الشركة أولاً يوفّر عليك تكرار العمل. سأبني الخطة على أساس شركة، ويمكنك تغيير ذلك في أي وقت.' } },
      ],
    },
    {
      id: 'duns', when: (a) => a.owner !== 'personal',
      q: { en: 'Does the company already have a D-U-N-S number?', ar: 'هل لدى الشركة رقم D-U-N-S بالفعل؟' },
      opts: [
        { v: 'yes', l: { en: 'Yes', ar: 'نعم' },
          r: { en: 'Great, that skips the slowest step. Make sure the name and address on it match your registration documents exactly.',
               ar: 'ممتاز، هذا يختصر أبطأ خطوة. تأكد أن الاسم والعنوان فيه يطابقان وثائق التسجيل تماماً.' } },
        { v: 'no', l: { en: 'No', ar: 'لا' },
          r: { en: "Request one for free through Apple's D-U-N-S lookup page. It usually takes up to 5 business days, sometimes longer. Start this today: everything else on the company path waits for it.",
               ar: 'اطلبه مجاناً من صفحة البحث عن D-U-N-S لدى Apple. يستغرق عادةً حتى 5 أيام عمل وأحياناً أكثر. ابدأ به اليوم، فكل خطوات حساب الشركة تنتظره.' } },
        { v: 'unknown', l: { en: "What's that?", ar: 'ما هذا؟' },
          r: { en: "It's a free 9-digit company ID from Dun & Bradstreet. Both stores use it to confirm your company is real. Search Apple's lookup page first, because many companies already have one without knowing.",
               ar: 'هو رقم تعريفي مجاني من 9 خانات تصدره Dun & Bradstreet، ويستخدمه المتجران للتأكد من أن شركتك حقيقية. ابحث عنه أولاً في صفحة Apple، فكثير من الشركات لديها رقم دون أن تعلم.' } },
      ],
    },
    {
      id: 'web', when: (a) => a.owner !== 'personal',
      q: { en: 'Do you have a website on your own domain, and an email on that domain (like name@yourcompany.com)?', ar: 'هل لديك موقع على نطاقك الخاص، وبريد إلكتروني على نفس النطاق (مثل name@yourcompany.com)؟' },
      opts: [
        { v: 'both', l: { en: 'Both', ar: 'الاثنان' },
          r: { en: 'Perfect. Use that work email for the Apple account.', ar: 'ممتاز. استخدم بريد العمل هذا لحساب Apple.' } },
        { v: 'site', l: { en: 'Website only', ar: 'الموقع فقط' },
          r: { en: "Create an email on that domain before you start. Apple wants your work email to match your company's domain.",
               ar: 'أنشئ بريداً على نفس النطاق قبل البدء، فـApple تريد أن يطابق بريد العمل نطاق شركتك.' } },
        { v: 'neither', l: { en: 'Neither', ar: 'لا هذا ولا ذاك' },
          r: { en: "You'll need both. Apple doesn't accept social media pages or empty “coming soon” domains. A simple one-page site with your company name, contact details and privacy policy is enough, and both stores need that privacy policy link anyway.",
               ar: 'ستحتاج الاثنين. Apple لا تقبل صفحات التواصل الاجتماعي أو النطاقات الفارغة. موقع بسيط من صفحة واحدة فيه اسم الشركة وبيانات التواصل وسياسة الخصوصية يكفي، والمتجران يحتاجان رابط سياسة الخصوصية على أي حال.' } },
      ],
    },
    {
      id: 'android',
      q: { en: 'Do you have a real Android phone you can use during setup?', ar: 'هل لديك هاتف Android حقيقي تستخدمه أثناء التسجيل؟' },
      opts: [
        { v: 'yes', l: { en: 'Yes', ar: 'نعم' },
          r: { en: 'Good. Google will ask you to sign in to the Play Console app on it to confirm you have a real device.',
               ar: 'جيد. ستطلب منك Google تسجيل الدخول إلى تطبيق Play Console عليه لتأكيد أن لديك جهازاً حقيقياً.' } },
        { v: 'no', l: { en: 'No', ar: 'لا' },
          r: { en: "Borrow one for setup. Google asks you to confirm a real device through the Play Console app, and you'll want one to test the driver app anyway.",
               ar: 'استعر هاتفاً للتسجيل. Google تطلب تأكيد جهاز حقيقي عبر تطبيق Play Console، وستحتاجه لتجربة تطبيق السائق على أي حال.' } },
      ],
    },
    {
      id: 'testers', when: (a) => a.owner === 'personal',
      q: { en: 'Can you get at least 12 people with Android phones to test the app for 14 days in a row?', ar: 'هل تستطيع جمع 12 شخصاً على الأقل لديهم هواتف Android لتجربة التطبيق 14 يوماً متواصلة؟' },
      opts: [
        { v: 'yes', l: { en: 'Yes', ar: 'نعم' },
          r: { en: 'Good. Invite a few extra: if someone leaves the test early you may drop below 12.',
               ar: 'جيد. ادعُ عدداً إضافياً، فإن انسحب أحدهم مبكراً قد ينخفض العدد عن 12.' } },
        { v: 'notYet', l: { en: 'Not yet', ar: 'ليس بعد' },
          r: { en: "Start collecting them now: friends, family, your first drivers. Without this, a new personal account can't publish to the public. A company account doesn't have this rule.",
               ar: 'ابدأ بجمعهم الآن: الأصدقاء، العائلة، أول السائقين لديك. بدون ذلك لا يستطيع الحساب الشخصي الجديد النشر للعامة. حساب الشركة لا يخضع لهذا الشرط.' } },
      ],
    },
    {
      id: 'mac',
      q: { en: 'Do you have a Mac?', ar: 'هل لديك جهاز Mac؟' },
      opts: [
        { v: 'yes', l: { en: 'Yes', ar: 'نعم' },
          r: { en: "That's what you need to build and upload the iPhone app with Xcode.", ar: 'هذا ما تحتاجه لبناء تطبيق iPhone ورفعه عبر Xcode.' } },
        { v: 'no', l: { en: 'No', ar: 'لا' },
          r: { en: "You don't need one to open the account. To upload the iPhone app you'll need a Mac with Xcode, or a cloud build service (like Expo EAS or Codemagic) if your app's framework supports it.",
               ar: 'لا تحتاجه لفتح الحساب. لرفع تطبيق iPhone ستحتاج جهاز Mac عليه Xcode، أو خدمة بناء سحابية (مثل Expo EAS أو Codemagic) إن كانت تقنية تطبيقك تدعمها.' } },
      ],
    },
    {
      id: 'pay',
      q: { en: 'Will users pay inside the app (cards or wallet top-ups)?', ar: 'هل سيدفع المستخدمون داخل التطبيق (بطاقات أو شحن المحفظة)؟' },
      opts: [
        { v: 'yes', l: { en: 'Yes', ar: 'نعم' },
          r: { en: "Rides and deliveries are real-world services, so you can use your own payment gateway. You don't need Apple's or Google's in-app purchase for them, only for digital extras like a paid subscription.",
               ar: 'الرحلات والتوصيل خدمات في العالم الحقيقي، لذلك يمكنك استخدام بوابة الدفع الخاصة بك. لا تحتاج للشراء داخل التطبيق من Apple أو Google لها، فقط للإضافات الرقمية مثل اشتراك مدفوع.' } },
        { v: 'cash', l: { en: 'Cash only', ar: 'نقداً فقط' },
          r: { en: "Simpler. You'll still need a privacy policy and in-app account deletion.", ar: 'أبسط. ستحتاج مع ذلك سياسة خصوصية وخيار حذف الحساب من داخل التطبيق.' } },
      ],
    },
  ];

  // ---------- plan ----------
  // s: section; when(c): include for this context; d: detail text (object or function of context).
  const PLAN = [
    // Before you start
    { id: 'p-name-co', s: 'prep', when: (c) => c.company,
      t: { en: 'Pick the publisher name', ar: 'اختر اسم الناشر' },
      d: { en: "Your company's exact legal name, as on the commercial registration. Users see it as the developer.", ar: 'الاسم القانوني للشركة كما هو في السجل التجاري تماماً. هذا ما يراه المستخدمون كاسم المطوّر.' } },
    { id: 'p-name-pe', s: 'prep', when: (c) => !c.company,
      t: { en: 'Use your legal name everywhere', ar: 'استخدم اسمك القانوني في كل مكان' },
      d: { en: 'Exactly as on your ID. Nicknames delay approval.', ar: 'كما هو في هويتك تماماً. الأسماء المستعارة تؤخر الموافقة.' } },
    { id: 'p-id', s: 'prep', when: (c) => !c.company,
      t: { en: 'Have your government ID ready', ar: 'جهّز هويتك الرسمية' },
      d: { en: 'Passport or national ID with the same name you enter. Both stores may ask for it.', ar: 'جواز السفر أو الهوية الوطنية بنفس الاسم الذي ستُدخله. قد يطلبها المتجران.' } },
    { id: 'p-duns', s: 'prep', when: (c) => c.company && c.a.duns !== 'yes',
      t: { en: 'Get a D-U-N-S number (free)', ar: 'احصل على رقم D-U-N-S (مجاناً)' },
      d: { en: "Search first, request it if you don't have one. Usually up to 5 business days. Google and Apple both ask for it.", ar: 'ابحث عنه أولاً، واطلبه إن لم يكن لديك. يستغرق عادةً حتى 5 أيام عمل. Google و Apple كلاهما يطلبانه.' },
      link: LINKS.duns },
    { id: 'p-duns-ok', s: 'prep', when: (c) => c.company && c.a.duns === 'yes',
      t: { en: 'Check your D-U-N-S details', ar: 'راجع بيانات D-U-N-S' },
      d: { en: 'Name and address must match your registration documents exactly.', ar: 'يجب أن يطابق الاسم والعنوان وثائق التسجيل تماماً.' },
      link: LINKS.duns },
    { id: 'p-web', s: 'prep', when: (c) => c.company,
      t: { en: 'Website and email on your company domain', ar: 'موقع وبريد على نطاق شركتك' },
      d: { en: 'Apple rejects social media pages and parked domains. A one-page site with your name, contact details and privacy policy is enough.', ar: 'Apple ترفض صفحات التواصل الاجتماعي والنطاقات الفارغة. موقع من صفحة واحدة فيه اسم الشركة وبيانات التواصل وسياسة الخصوصية يكفي.' } },
    { id: 'p-docs', s: 'prep', when: (c) => c.company,
      t: { en: 'Company documents ready', ar: 'جهّز وثائق الشركة' },
      d: { en: 'Commercial registration (or equivalent) as a clear scan or PDF. Google asks for an official document to verify the organization.', ar: 'السجل التجاري (أو ما يعادله) كملف PDF أو صورة واضحة. Google تطلب وثيقة رسمية للتحقق من الشركة.' } },
    { id: 'p-auth', s: 'prep', when: (c) => c.company,
      t: { en: 'Make sure you can sign for the company', ar: 'تأكد أنك مخوّل بالتوقيع عن الشركة' },
      d: { en: 'Apple only accepts the owner, an executive, or someone given legal authority. They may call to confirm.', ar: 'Apple تقبل المالك أو أحد المدراء التنفيذيين أو شخصاً مُنح صلاحية قانونية فقط، وقد تتصل للتأكيد.' } },
    { id: 'p-card', s: 'prep',
      t: { en: 'A card that works for international online payments', ar: 'بطاقة تعمل للدفع الدولي عبر الإنترنت' },
      d: { en: 'Google charges $25 once, Apple $99 every year. Some prepaid or local-only cards get declined.', ar: 'Google تأخذ 25$ مرة واحدة، و Apple تأخذ 99$ كل سنة. بعض البطاقات المسبقة الدفع أو المحلية فقط تُرفض.' } },
    { id: 'p-contact', s: 'prep',
      t: { en: 'A contact email and phone number', ar: 'بريد إلكتروني ورقم هاتف للتواصل' },
      d: { en: 'Google shows the contact email publicly on your app page. Use one you actually check.', ar: 'Google تعرض بريد التواصل للعامة في صفحة تطبيقك. استخدم بريداً تتابعه فعلاً.' } },
    { id: 'p-address', s: 'prep',
      t: { en: 'A real street address', ar: 'عنوان فعلي' },
      d: { en: "Apple doesn't accept P.O. boxes.", ar: 'Apple لا تقبل صناديق البريد (P.O. Box).' } },
    { id: 'p-privacy', s: 'prep',
      t: { en: 'A privacy policy page', ar: 'صفحة سياسة الخصوصية' },
      d: { en: 'Both stores require a public link. It must say what you collect; for you that includes location, phone numbers and payment data.', ar: 'المتجران يطلبان رابطاً عاماً لها. يجب أن توضّح ما تجمعه من بيانات، وفي حالتك يشمل ذلك الموقع وأرقام الهواتف وبيانات الدفع.' } },

    // Google Play
    { id: 'g-signup', s: 'google', link: LINKS.playSignup,
      t: { en: 'Sign up for Play Console', ar: 'سجّل في Play Console' },
      d: (c) => c.company
        ? { en: 'Use a Google account made for the business (not your personal Gmail) and choose the organization account type.', ar: 'استخدم حساب Google خاصاً بالشركة (وليس Gmail الشخصي) واختر نوع الحساب: مؤسسة.' }
        : { en: 'Choose the personal account type. Use a Google account you will keep for years, because the apps live inside it.', ar: 'اختر نوع الحساب: شخصي. استخدم حساب Google ستحتفظ به لسنوات، فالتطبيقات ستكون بداخله.' } },
    { id: 'g-fee', s: 'google',
      t: { en: 'Pay the $25 registration fee', ar: 'ادفع رسوم التسجيل 25$' },
      d: { en: 'Paid once, no yearly renewal.', ar: 'تُدفع مرة واحدة فقط بدون تجديد سنوي.' } },
    { id: 'g-profile', s: 'google',
      t: { en: 'Fill in your developer profile', ar: 'املأ ملف المطوّر' },
      d: (c) => c.company
        ? { en: 'Developer name, contact email and phone, D-U-N-S number and website.', ar: 'اسم المطوّر، بريد وهاتف التواصل، رقم D-U-N-S، والموقع الإلكتروني.' }
        : { en: 'Developer name (shown on Google Play), contact email and phone.', ar: 'اسم المطوّر (يظهر في Google Play)، بريد وهاتف التواصل.' } },
    { id: 'g-identity', s: 'google',
      t: { en: 'Verify your identity', ar: 'وثّق هويتك' },
      d: (c) => c.company
        ? { en: 'Upload the company document and the ID of the person setting up the account. Verify the website if asked.', ar: 'ارفع وثيقة الشركة وهوية الشخص الذي ينشئ الحساب، ووثّق الموقع إن طُلب منك.' }
        : { en: 'Upload your ID. The name must match your profile exactly.', ar: 'ارفع هويتك. يجب أن يطابق الاسم ملفك تماماً.' } },
    { id: 'g-device', s: 'google',
      t: { en: 'Verify your email, phone and Android device', ar: 'وثّق بريدك وهاتفك وجهاز Android' },
      d: (c) => c.a.android === 'no'
        ? { en: "Install the Play Console app on a real Android phone and sign in. You said you don't have one, so borrow one for this step.", ar: 'ثبّت تطبيق Play Console على هاتف Android حقيقي وسجّل الدخول. قلت إنه ليس لديك هاتف، فاستعر واحداً لهذه الخطوة.' }
        : { en: 'Install the Play Console app on a real Android phone and sign in to confirm the device.', ar: 'ثبّت تطبيق Play Console على هاتف Android حقيقي وسجّل الدخول لتأكيد الجهاز.' } },
    { id: 'g-wait', s: 'google', link: LINKS.androidVerify,
      t: { en: 'Wait for approval', ar: 'انتظر الموافقة' },
      d: { en: "Usually a few days; Google emails you if anything is missing. Being verified here also covers Google's new Android developer verification.", ar: 'عادةً بضعة أيام، وستراسلك Google إن كان هناك نقص. التوثيق هنا يغطّي أيضاً نظام Google الجديد للتحقق من مطوّري Android.' } },
    { id: 'g-apps', s: 'google',
      t: { en: 'Create your apps', ar: 'أنشئ تطبيقاتك' },
      d: { en: 'The customer app and the driver app are separate listings on the same account, with no extra fee.', ar: 'تطبيق العميل وتطبيق السائق قائمتان منفصلتان في نفس الحساب، بدون رسوم إضافية.' } },
    { id: 'g-content', s: 'google',
      t: { en: 'Complete the App content forms', ar: 'أكمل نماذج محتوى التطبيق' },
      d: { en: 'Privacy policy, Data safety, content rating, target audience, ads, and an account deletion link. The driver app also needs the background location declaration.', ar: 'سياسة الخصوصية، أمان البيانات، تصنيف المحتوى، الجمهور المستهدف، الإعلانات، ورابط حذف الحساب. تطبيق السائق يحتاج أيضاً إقرار استخدام الموقع في الخلفية.' } },
    { id: 'g-test-pe', s: 'google', when: (c) => !c.company,
      t: { en: 'Closed test: 12+ testers for 14 days', ar: 'اختبار مغلق: 12 مختبِراً على الأقل لمدة 14 يوماً' },
      d: (c) => c.a.testers === 'notYet'
        ? { en: 'Required for new personal accounts before you can go public. You said you need more testers, so start collecting them now.', ar: 'مطلوب للحسابات الشخصية الجديدة قبل النشر للعامة. قلت إنك تحتاج مختبِرين، فابدأ بجمعهم الآن.' }
        : { en: 'Required for new personal accounts before you can go public. Invite a few extra in case someone drops out.', ar: 'مطلوب للحسابات الشخصية الجديدة قبل النشر للعامة. ادعُ عدداً إضافياً تحسّباً لانسحاب أحدهم.' } },
    { id: 'g-test-co', s: 'google', when: (c) => c.company,
      t: { en: 'Test with internal testing first', ar: 'اختبر أولاً عبر الاختبار الداخلي' },
      d: { en: 'Not required for organization accounts, but it catches problems before the reviewers do.', ar: 'ليس إلزامياً لحسابات الشركات، لكنه يكشف المشاكل قبل المراجِعين.' } },
    { id: 'g-publish', s: 'google',
      t: (c) => c.company
        ? { en: 'Send your release to production', ar: 'أرسل الإصدار للنشر' }
        : { en: 'Apply for production access, then publish', ar: 'اطلب صلاحية النشر للعامة ثم انشر' },
      d: (c) => c.company
        ? { en: 'Reviews for new accounts can take several days.', ar: 'مراجعة الحسابات الجديدة قد تستغرق عدة أيام.' }
        : { en: "Answer Google's questions about your test, then send the release for review.", ar: 'أجب عن أسئلة Google حول الاختبار، ثم أرسل الإصدار للمراجعة.' } },

    // Apple
    { id: 'a-account', s: 'apple',
      t: { en: 'Prepare your Apple Account', ar: 'جهّز حساب Apple' },
      d: (c) => c.company
        ? { en: 'Use your work email on the company domain and your legal name, and turn on two-factor authentication.', ar: 'استخدم بريد العمل على نطاق الشركة واسمك القانوني، وفعّل المصادقة الثنائية.' }
        : { en: 'Use your legal first and last name and turn on two-factor authentication.', ar: 'استخدم اسمك الأول والأخير القانونيين، وفعّل المصادقة الثنائية.' } },
    { id: 'a-enroll', s: 'apple',
      t: { en: 'Start enrollment', ar: 'ابدأ التسجيل' },
      link: LINKS.appleEnroll,
      d: (c) => c.company
        ? { en: 'On the website or in the Apple Developer app. Choose Organization and enter the D-U-N-S number and legal entity name. Trade names and branches are not accepted.', ar: 'من الموقع أو تطبيق Apple Developer. اختر Organization وأدخل رقم D-U-N-S والاسم القانوني للشركة. الأسماء التجارية والفروع غير مقبولة.' }
        : { en: 'Easiest in the Apple Developer app on an iPhone or iPad, where you may be asked to verify with your ID. Choose Individual.', ar: 'الأسهل عبر تطبيق Apple Developer على iPhone أو iPad، وقد يُطلب منك التحقق بهويتك. اختر Individual.' } },
    { id: 'a-verify', s: 'apple', when: (c) => c.company,
      t: { en: 'Apple verifies your company', ar: 'Apple تتحقق من شركتك' },
      d: { en: 'They check your D-U-N-S details and may call to confirm your authority. This can take from a few days to a couple of weeks, so answer unknown numbers in that period.', ar: 'تراجع بيانات D-U-N-S وقد تتصل بك للتأكد من صلاحيتك. قد يستغرق ذلك من أيام إلى أسبوعين، فردّ على المكالمات غير المعروفة في تلك الفترة.' } },
    { id: 'a-fee', s: 'apple',
      t: { en: 'Pay $99 for the year', ar: 'ادفع 99$ للسنة' },
      d: { en: 'You pay once Apple has checked your details. It renews every year; if it lapses, your apps are removed from the App Store.', ar: 'تدفع بعد أن تراجع Apple بياناتك. يتجدد سنوياً، وإن انتهى الاشتراك تُزال تطبيقاتك من App Store.' } },
    { id: 'a-asc', s: 'apple', link: LINKS.asc,
      t: { en: 'Accept the agreements in App Store Connect', ar: 'وافق على الاتفاقيات في App Store Connect' },
      d: { en: 'Fill in tax and banking only if you will sell digital items through Apple. Ride and delivery payments go through your own gateway.', ar: 'املأ بيانات الضرائب والبنك فقط إن كنت ستبيع منتجات رقمية عبر Apple. مدفوعات الرحلات والتوصيل تمر عبر بوابة الدفع الخاصة بك.' } },
    { id: 'a-records', s: 'apple',
      t: { en: 'Create the app records', ar: 'أنشئ سجلات التطبيقات' },
      d: { en: 'One for the customer app and one for the driver app. Fill in App Privacy, screenshots, a support link and the privacy policy.', ar: 'سجل لتطبيق العميل وآخر لتطبيق السائق. املأ خصوصية التطبيق، لقطات الشاشة، رابط الدعم، وسياسة الخصوصية.' } },
    { id: 'a-build', s: 'apple',
      t: { en: 'Upload a build and test it on TestFlight', ar: 'ارفع نسخة واختبرها عبر TestFlight' },
      d: (c) => c.a.mac === 'no'
        ? { en: "You don't have a Mac: use a cloud build service (like Expo EAS or Codemagic) if your framework supports it, or borrow a Mac with Xcode.", ar: 'ليس لديك Mac: استخدم خدمة بناء سحابية (مثل Expo EAS أو Codemagic) إن كانت تقنية تطبيقك تدعمها، أو استعر جهاز Mac عليه Xcode.' }
        : { en: 'Archive and upload from Xcode on your Mac, then invite testers in TestFlight.', ar: 'ابنِ التطبيق وارفعه من Xcode على جهاز Mac، ثم ادعُ المختبِرين عبر TestFlight.' } },
    { id: 'a-submit', s: 'apple',
      t: { en: 'Submit for review with demo accounts', ar: 'أرسل للمراجعة مع حسابات تجريبية' },
      d: { en: "Give the reviewer a working customer login and driver login, plus a note on how to test a ride. Apple rejects apps it can't test.", ar: 'أعطِ المراجِع حساب عميل وحساب سائق يعملان، مع شرح لكيفية تجربة رحلة. Apple ترفض التطبيقات التي لا تستطيع تجربتها.' } },

    // Heads up (not ticked)
    { id: 't-delete', s: 'tips', icon: 'user-x',
      t: { en: 'In-app account deletion', ar: 'حذف الحساب من داخل التطبيق' },
      d: { en: 'Both stores require it when users can sign up. Google also wants a web link for it.', ar: 'المتجران يشترطانه إن كان المستخدم يستطيع إنشاء حساب. Google تطلب أيضاً رابط ويب لذلك.' } },
    { id: 't-location', s: 'tips', icon: 'map-pin',
      t: { en: 'Background location (driver app)', ar: 'الموقع في الخلفية (تطبيق السائق)' },
      d: { en: 'Google asks for a declaration and a short video showing why you need it. On iOS, write a clear reason in the permission prompt.', ar: 'Google تطلب إقراراً وفيديو قصيراً يوضح سبب الحاجة له. وفي iOS اكتب سبباً واضحاً في رسالة طلب الإذن.' } },
    { id: 't-pay', s: 'tips', icon: 'credit-card', when: (c) => c.a.pay !== 'cash',
      t: { en: 'Payments', ar: 'المدفوعات' },
      d: { en: "Rides and deliveries are real-world services, so your own gateway is allowed. You don't need Apple's or Google's in-app purchase for them.", ar: 'الرحلات والتوصيل خدمات في العالم الحقيقي، لذلك يُسمح ببوابة الدفع الخاصة بك ولا تحتاج للشراء داخل التطبيق من Apple أو Google لها.' } },
    { id: 't-wallet', s: 'tips', icon: 'building-2', when: (c) => !c.company,
      t: { en: 'Wallets from a personal account', ar: 'المحافظ من حساب شخصي' },
      d: { en: 'Apple expects apps that handle money or sensitive data to come from the business itself. Plan to move to a company account before launch.', ar: 'Apple تتوقع أن تأتي التطبيقات التي تتعامل مع المال أو البيانات الحساسة من الشركة نفسها. خطّط للانتقال إلى حساب شركة قبل الإطلاق.' } },
    { id: 't-eu', s: 'tips', icon: 'globe',
      t: { en: 'Publishing in the EU', ar: 'النشر في الاتحاد الأوروبي' },
      d: { en: 'Both stores ask you to declare whether you are a “trader”. If you are, your address and contact details are shown there.', ar: 'المتجران يطلبان التصريح إن كنت «تاجراً». إن كنت كذلك تُعرض بياناتك وعنوانك هناك.' } },
  ];

  const SECTIONS = [
    { key: 'prep', icon: 'clipboard-list', color: '#F59E0B' },
    { key: 'google', icon: 'play', color: '#10B981',
      wait: (c) => c.company ? { en: 'A few days', ar: 'بضعة أيام' } : { en: 'A few days + 14-day test', ar: 'بضعة أيام + اختبار 14 يوماً' } },
    { key: 'apple', icon: 'apple', color: '#567DF4',
      wait: (c) => c.company ? { en: 'D-U-N-S up to ~1 week, then days to 2 weeks', ar: 'D-U-N-S حتى أسبوع تقريباً، ثم أيام إلى أسبوعين' } : { en: 'Often 1 to 2 days', ar: 'غالباً يوم أو يومان' } },
    { key: 'tips', icon: 'triangle-alert', color: '#EF4444' },
  ];

  // ---------- helpers ----------
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name, cls = 'w-4 h-4') => `<i data-lucide="${name}" class="${cls}"></i>`;
  const val = (x, c) => L(typeof x === 'function' ? x(c) : x);
  const ctx = () => ({ company: answers.owner !== 'personal', a: answers });
  const flow = () => Q.filter((q) => !q.when || q.when(answers));
  const finished = () => flow().every((q) => q.opts.some((o) => o.v === answers[q.id]));
  const items = (s, c) => PLAN.filter((i) => i.s === s && (!i.when || i.when(c)));
  const checkable = (c) => PLAN.filter((i) => i.s !== 'tips' && (!i.when || i.when(c)));
  const hostPath = (u) => u.replace(/^https:\/\//, '').replace(/\/$/, '');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function save() {
    store.set('stores.answers', JSON.stringify(answers));
    store.set('stores.done', JSON.stringify([...done]));
  }

  // ---------- chat ----------
  const bot = (html) => `<div class="flex gap-2 items-end">
      <div class="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">${icon('bot', 'w-3.5 h-3.5')}</div>
      <div class="max-w-[85%] bg-gray-100 dark:bg-ink-soft rounded-2xl rounded-es-sm px-3 py-2 text-[12.5px] leading-relaxed">${html}</div>
    </div>`;
  const me = (text, qid) => `<div class="flex flex-col items-end gap-0.5">
      <div class="max-w-[85%] bg-brand text-white rounded-2xl rounded-ee-sm px-3 py-2 text-[12.5px]">${esc(text)}</div>
      <button data-edit="${qid}" class="text-[10px] text-gray-400 hover:text-brand px-1">${esc(t('change'))}</button>
    </div>`;
  const typing = () => bot(`<span class="inline-flex gap-1 py-1" aria-label="…">
      <span class="dot w-1.5 h-1.5 rounded-full bg-gray-400"></span><span class="dot w-1.5 h-1.5 rounded-full bg-gray-400"></span><span class="dot w-1.5 h-1.5 rounded-full bg-gray-400"></span></span>`);

  function renderChat() {
    const out = [bot(esc(t('hello')))];
    let pending = null, waiting = false;
    for (const q of flow()) {
      out.push(bot(esc(L(q.q))));
      const opt = q.opts.find((o) => o.v === answers[q.id]);
      if (!opt) { pending = q; break; }
      out.push(me(L(opt.l), q.id));
      if (typingFor === q.id) { out.push(typing()); waiting = true; break; }
      out.push(bot(esc(L(opt.r))));
    }
    if (!pending && !waiting) out.push(bot(esc(t('allDone'))));

    const chat = $('#chat');
    chat.innerHTML = out.join('');
    chat.scrollTop = chat.scrollHeight;

    $('#chips').innerHTML = waiting ? ''
      : pending ? pending.opts.map((o) => `<button class="chip" data-q="${pending.id}" data-v="${o.v}">${esc(L(o.l))}</button>`).join('')
      : `<span class="text-[11px] text-gray-400 flex items-center gap-1.5">${icon('circle-check', 'w-3.5 h-3.5 text-emerald-500')}${esc(t('allDoneHint'))}</span>`;
  }

  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    answers[b.dataset.q] = b.dataset.v;
    save();
    typingFor = reduceMotion ? null : b.dataset.q;
    renderAll();
    if (typingFor) setTimeout(() => { typingFor = null; renderChat(); lucide.createIcons(); }, 700);
  });

  $('#chat').addEventListener('click', (e) => {
    const b = e.target.closest('[data-edit]');
    if (!b) return;
    // Forget this answer and every answer after it, then ask again from there.
    const idx = Q.findIndex((q) => q.id === b.dataset.edit);
    Q.slice(idx).forEach((q) => { delete answers[q.id]; });
    typingFor = null;
    save(); renderAll();
  });

  // ---------- plan ----------
  function renderKpis() {
    const c = ctx();
    const all = checkable(c);
    const n = all.filter((i) => done.has(i.id)).length;
    const pct = all.length ? Math.round((n / all.length) * 100) : 0;
    const tiles = [
      { icon: 'play', color: '#10B981', value: '$25', label: `Google Play · ${t('once')}` },
      { icon: 'apple', color: '#567DF4', value: '$99', label: `App Store · ${t('yearly')}` },
      { icon: c.company ? 'building-2' : 'user', color: '#8B5CF6', value: t(c.company ? 'company' : 'personal'), label: t('acct') },
      { icon: 'circle-check', color: '#F59E0B', value: `${n}/${all.length}`, label: `${t('progress')} · ${pct}%`, pct },
    ];
    $('#kpis').innerHTML = tiles.map((k) => `<div class="card p-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style="background:${k.color}1a;color:${k.color}">${icon(k.icon)}</div>
        <div class="text-[17px] font-bold">${esc(k.value)}</div>
        <div class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">${esc(k.label)}</div>
        ${k.pct !== undefined ? `<div class="h-1 mt-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden"><div class="h-full rounded-full transition-all" style="width:${k.pct}%;background:${k.color}"></div></div>` : ''}
      </div>`).join('');
  }

  function stepRow(i, n, c) {
    const checked = done.has(i.id);
    return `<label class="flex items-start gap-3 py-2.5 cursor-pointer">
        <input type="checkbox" data-id="${i.id}" ${checked ? 'checked' : ''} class="mt-1 w-4 h-4 flex-shrink-0 accent-brand cursor-pointer" />
        <div class="flex-1 min-w-0">
          <div class="text-[12.5px] font-semibold ${checked ? 'line-through text-gray-400' : ''}"><span class="text-gray-400 font-normal me-1">${n}.</span>${esc(val(i.t, c))}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">${esc(val(i.d, c))}</div>
          ${i.link ? `<a href="${i.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-1 text-[11px] text-brand hover:underline" dir="ltr">${esc(hostPath(i.link))}${icon('external-link', 'w-3 h-3')}</a>` : ''}
        </div>
      </label>`;
  }

  function stepsCard(sec, list, c) {
    const n = list.filter((i) => done.has(i.id)).length;
    const pct = list.length ? Math.round((n / list.length) * 100) : 0;
    return `<div class="card p-4">
        <div class="flex items-center gap-2.5 mb-1">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${sec.color}1a;color:${sec.color}">${icon(sec.icon)}</div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[13px] font-semibold truncate">${esc(t(sec.key))}</h3>
            ${sec.wait ? `<div class="text-[10px] text-gray-400 flex items-center gap-1">${icon('clock', 'w-3 h-3')}${esc(t('wait'))}: ${esc(val(sec.wait, c))}</div>` : ''}
          </div>
          <span class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${n}/${list.length}</span>
        </div>
        <div class="h-1 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden mb-1">
          <div class="h-full rounded-full transition-all" style="width:${pct}%;background:${sec.color}"></div>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-white/[0.05]">${list.map((i, k) => stepRow(i, k + 1, c)).join('')}</div>
      </div>`;
  }

  function tipsCard(sec, list, c) {
    return `<div class="card p-4">
        <h3 class="card-title mb-3 flex items-center gap-1.5" style="color:${sec.color}">${icon(sec.icon, 'w-3.5 h-3.5')}${esc(t(sec.key))}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${list.map((i) => `<div class="bg-gray-50/80 dark:bg-white/[0.03] rounded-lg p-3 flex gap-2.5">
              <div class="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">${icon(i.icon, 'w-3.5 h-3.5')}</div>
              <div class="min-w-0">
                <div class="text-[12px] font-semibold">${esc(val(i.t, c))}</div>
                <div class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">${esc(val(i.d, c))}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderPlan() {
    const c = ctx();
    const [prep, google, apple, tips] = SECTIONS;
    const status = finished()
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">${icon('sparkles', 'w-3 h-3')}${esc(t('tailored'))}</span>`
      : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">${icon('pencil', 'w-3 h-3')}${esc(t('draft'))}</span>`;
    $('#plan').innerHTML = `<div class="flex justify-end">${status}</div>
      ${stepsCard(prep, items('prep', c), c)}
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
        ${stepsCard(google, items('google', c), c)}
        ${stepsCard(apple, items('apple', c), c)}
      </div>
      ${tipsCard(tips, items('tips', c), c)}`;
  }

  $('#plan').addEventListener('change', (e) => {
    const id = e.target.dataset && e.target.dataset.id;
    if (!id) return;
    e.target.checked ? done.add(id) : done.delete(id);
    save(); renderPlan(); renderKpis(); lucide.createIcons();
    const again = document.querySelector(`[data-id="${id}"]`);
    if (again) again.focus();
  });

  // ---------- chrome ----------
  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.title = t('title');
    $('#langLabel').textContent = lang === 'ar' ? 'AR' : 'EN';
    const refs = [['Google Play Console Help', LINKS.playHelp], ['Apple Developer Program', LINKS.appleEnroll], ['Apple Developer app', LINKS.appleApp]];
    $('#footnote').innerHTML = `${esc(t('footnote'))} ` + refs.map(([label, href]) =>
      `<a class="text-brand hover:underline" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`).join(' · ');
  }

  function renderAll() {
    applyStatic(); renderChat(); renderKpis(); renderPlan();
    lucide.createIcons();
  }

  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.classList.toggle('dark');
    store.set('stores.theme', dark ? 'dark' : 'light');
  };
  $('#langBtn').onclick = () => {
    lang = lang === 'en' ? 'ar' : 'en';
    store.set('stores.lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    renderAll();
  };
  $('#resetBtn').onclick = () => {
    if (!confirm(t('resetConfirm'))) return;
    answers = {}; done = new Set(); typingFor = null;
    store.del('stores.answers'); store.del('stores.done');
    renderAll();
  };

  renderAll();
})();
