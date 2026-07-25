import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'electronics', nameAr: 'إلكترونيات', nameEn: 'Electronics' },
  { slug: 'home', nameAr: 'المنزل والديكور', nameEn: 'Home & Living' },
  { slug: 'fashion', nameAr: 'الأزياء والإكسسوارات', nameEn: 'Fashion & Accessories' },
  { slug: 'wellness', nameAr: 'العناية والصحة', nameEn: 'Wellness & Cosmetics' }
];

const SEED_PRODUCTS = [
  {
    id: 'prod-1',
    categorySlug: 'electronics',
    price: 189.0,
    originalPrice: 220.0,
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    stock: 12,
    nameAr: 'سماعات رأس لاسلكية عازلة للضوضاء عالي الدقة',
    descAr: 'استمتع بنقاء صوت استثنائي مع تقنية إلغاء الضوضاء النشطة المتقدمة وعمر بطارية يصل إلى 40 ساعة متواصلة.',
    featuresAr: JSON.stringify([
      'إلغاء الضوضاء النشط الهجين (ANC)',
      'مشغلات ديناميكية مخصصة بحجم 40 مم لصوت عميق',
      'عمر بطارية يصل إلى 40 ساعة مع شحن سريع',
      'وسادات أذن مريحة مصنوعة من الجلد الفاخر الذاكر لشكل الأذن'
    ]),
    specsAr: JSON.stringify({
      'الاتصال': 'بلوتوث 5.2 و سلكي 3.5 مم',
      'البطارية': '40 ساعة (إيقاف ANC) / 30 ساعة (تشغيل ANC)',
      'وقت الشحن': '1.5 ساعة (10 دقائق شحن تعطي 4 ساعات تشغيل)',
      'مدخل الشحن': 'USB-C'
    }),
    nameEn: 'Studio Wireless ANC Headphones Pro',
    descEn: 'Experience exceptional sound clarity with advanced hybrid active noise cancellation and up to 40 hours of playtime.',
    featuresEn: JSON.stringify([
      'Hybrid Active Noise Cancellation (ANC)',
      '40mm custom dynamic drivers for deep immersive sound',
      'Up to 40 hours battery life with fast charge support',
      'Memory foam earcups wrapped in premium protein leather'
    ]),
    specsEn: JSON.stringify({
      'Connectivity': 'Bluetooth 5.2 & 3.5mm Aux',
      'Battery Life': '40 hrs (ANC Off) / 30 hrs (ANC On)',
      'Charging Time': '1.5 hours (10 min charge = 4 hours playback)',
      'Charging Port': 'USB-C'
    })
  },
  {
    id: 'prod-2',
    categorySlug: 'electronics',
    price: 149.0,
    originalPrice: null,
    rating: 4.6,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
    stock: 8,
    nameAr: 'ساعة ذكية رياضية بشاشة AMOLED وحساس نبضات متطور',
    descAr: 'ساعة ذكية ذات تصميم راقي وبسيط تتبع صحتك، رياضتك، ونومك بدقة تامة وبطارية تدوم لـ 10 أيام.',
    featuresAr: JSON.stringify([
      'شاشة AMOLED فائقة الوضوح بحجم 1.43 بوصة تعمل دائماً',
      'مستشعر دقيق لمراقبة نبضات القلب ونسبة الأكسجين بالدم (SpO2)',
      'مقاومة للماء حتى عمق 50 متر (5ATM)',
      'أكثر من 100 وضع رياضي مخصص مع نظام تتبع GPS مستقل'
    ]),
    specsAr: JSON.stringify({
      'الشاشة': 'AMOLED 1.43 بوصة، دقة 466 × 466',
      'مقاومة الماء': '5ATM (حتى 50 متر)',
      'عمر البطارية': 'تصل إلى 10 أيام من الاستخدام العادي',
      'التوافق': 'iOS و Android'
    }),
    nameEn: 'Minimalist Fitness Smart Watch S2',
    descEn: 'A beautifully designed elegant smartwatch tracking your health, activity, and sleep with precision and a 10-day battery life.',
    featuresEn: JSON.stringify([
      '1.43" Always-On Crystal Clear AMOLED Display',
      'Advanced continuous heart rate & SpO2 blood oxygen tracking',
      'Water resistance up to 50 meters (5ATM)',
      '100+ professional fitness modes with independent multi-system GPS'
    ]),
    specsEn: JSON.stringify({
      'Display': '1.43" AMOLED, 466 x 466 resolution',
      'Waterproof Class': '5ATM (up to 50 meters)',
      'Battery Life': 'Up to 10 days typical usage',
      'Compatibility': 'iOS & Android'
    })
  },
  {
    id: 'prod-3',
    categorySlug: 'electronics',
    price: 39.0,
    originalPrice: 49.0,
    rating: 4.5,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
    stock: 25,
    nameAr: 'قاعدة شحن لاسلكي سريع ثلاثي مدمج 15 واط',
    descAr: 'اشحن هاتفك الذكي، ساعتك وسماعاتك اللاسلكية في نفس الوقت بقوة شحن قصوى وآمنة.',
    featuresAr: JSON.stringify([
      'تصميم مدمج وموفر للمساحة من الألومنيوم وجلد السويد',
      'شحن سريع متوافق مع تقنيات MagSafe وقدرة حتى 15 واط',
      'حماية متعددة ضد الارتفاع المفاجئ في الحرارة والتيار الكهربائي',
      'زاوية مريحة لإجراء مكالمات الفيديو أثناء الشحن'
    ]),
    specsAr: JSON.stringify({
      'القدرة المخرجة': '15 واط للهاتف / 5 واط للسماعات / 3 واط للساعة',
      'المدخل الكهربائي': '9V/3A أو 12V/2A',
      'الحماية': 'الكشف عن الأجسام الغريبة، تيار زائد، حرارة زائدة',
      'الملحقات': 'كابل USB-C بطول 1.2 متر وشاحن جداري 18 واط'
    }),
    nameEn: '3-in-1 Fast Wireless Charging Stand 15W',
    descEn: 'Charge your smartphone, smartwatch, and wireless earbuds concurrently with intelligent and safe power delivery.',
    featuresEn: JSON.stringify([
      'Premium space-saving design made of aluminum and faux suede',
      'Fast charging compatible with MagSafe up to 15W',
      'Built-in protection against overheating and short-circuiting',
      'Comfortable viewing angle optimal for video calls while charging'
    ]),
    specsEn: JSON.stringify({
      'Output Power': '15W (Phone) / 5W (Earbuds) / 3W (Watch)',
      'Input Power': '9V/3A or 12V/2A',
      'Safety': 'FOD detection, over-current, over-temperature',
      'Box Contents': '1.2m USB-C Cable + 18W Wall Charger'
    })
  },
  {
    id: 'prod-4',
    categorySlug: 'home',
    price: 75.0,
    originalPrice: null,
    rating: 4.9,
    reviewsCount: 57,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    stock: 5,
    nameAr: 'مصباح طاولة زجاجي كهرماني دافئ بتوهج محيطي',
    descAr: 'أضف لمسة دفء وراحة لغرفة المعيشة أو النوم مع هذا المصباح الزجاجي الكهرماني المنفوخ يدوياً بتصميم اسكندنافي.',
    featuresAr: JSON.stringify([
      'زجاج بلوري كهرماني منفوخ يدوياً بتشطيب رائع',
      'قاعدة خشبية صلبة مستدامة باللون الطبيعي البني الداكن',
      'مفتاح لمس دوار لضبط شدة الإضاءة بسلاسة',
      'مرفق بمصباح LED دافئ موفر للطاقة يبعث الراحة'
    ]),
    specsAr: JSON.stringify({
      'أبعاد المصباح': 'ارتفاع 26 سم × قطر 18 سم',
      'نوع الإضاءة': 'LED بقوة 6 واط (مكافئ لـ 60 واط)',
      'درجة اللون': '2200K (أصفر دافئ جداً)',
      'طول الكابل': '1.8 متر مغلف بالقماش الفاخر'
    }),
    nameEn: 'Scandinavian Amber Glass Table Lamp',
    descEn: 'Bring warm, cozy ambient light to your living space or bedroom with this hand-blown retro amber glass design.',
    featuresEn: JSON.stringify([
      'Exquisite hand-blown amber frosted glass cover',
      'Sustainable solid wood base with dark natural grain finish',
      'Smooth rotating dimmer knob for step-free brightness adjustments',
      'Includes an eco-friendly warm LED bulb that feels soothing'
    ]),
    specsEn: JSON.stringify({
      'Dimensions': 'Height 26 cm x Diameter 18 cm',
      'Light Source': '6W LED (60W equivalent)',
      'Color Temp': '2200K (Warm Cozy Amber)',
      'Cable Length': '1.8m braided textile cable'
    })
  },
  {
    id: 'prod-5',
    categorySlug: 'home',
    price: 48.0,
    originalPrice: null,
    rating: 4.7,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    stock: 14,
    nameAr: 'مجموعة تقطير القهوة السيراميك الفاخرة مع إبريق',
    descAr: 'طريقة مثالية لتحضير قهوتك المقطرة اليومية يدوياً بنكهة غنية، مصنوعة من السيراميك عالي الكثافة لحفظ الحرارة.',
    featuresAr: JSON.stringify([
      'قمع سيراميك حلزوني الحواف لاستخلاص مثالي متوازن للقهوة',
      'إبريق زجاجي مقاوم للحرارة بسعة 600 مل بمقبض خشبي معزول',
      'هيكل سيراميك مزدوج متين يحفظ حرارة التحضير بامتياز',
      'يتضمن طقم فلاتر ورقية يابانية فاخرة (40 قطعة)'
    ]),
    specsAr: JSON.stringify({
      'السعة': '600 مل (تكفي لـ 1-4 أكواب)',
      'المادة': 'سيراميك ياباني ناصع وزجاج بوروسيليكات قوي',
      'آمن لغسالة الأطباق': 'نعم (للسيراميك والزجاج)',
      'مقاومة الحرارة': 'تصل إلى 150 درجة مئوية'
    }),
    nameEn: 'Ceramic Pour-Over Coffee Carafe Set',
    descEn: 'The ultimate hand-crafted set for your daily drip coffee ritual, made of high-density heat-retentive Japanese ceramic.',
    featuresEn: JSON.stringify([
      'Spiral grooved interior ceramic dripper for optimal extraction',
      '600ml heat-resistant borosilicate glass carafe with insulated wooden handle',
      'Robust double-baked ceramic material maintaining brewing temperature',
      'Includes 40-pack of premium Japanese bleached paper filters'
    ]),
    specsEn: JSON.stringify({
      'Capacity': '600 ml (Serves 1-4 cups)',
      'Material': 'High-fire ceramic, borosilicate glass, walnut wood',
      'Dishwasher Safe': 'Yes (Ceramic and glass components only)',
      'Thermal Shock Limit': 'Up to 150°C'
    })
  },
  {
    id: 'prod-6',
    categorySlug: 'home',
    price: 34.0,
    originalPrice: null,
    rating: 4.4,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1594224026859-9f79ca020a40?auto=format&fit=crop&w=600&q=80',
    stock: 30,
    nameAr: 'منظم مكتب ألومنيوم مبسط مع شاحن مخفي',
    descAr: 'رتب مكتبك بأناقة مع هذا المنظم المعدني المصقول الذي يجمع بين تخزين الأقلام والأوراق ومنصة شحن للهاتف.',
    featuresAr: JSON.stringify([
      'هيكل متين مصنوع من قطعة واحدة من ألومنيوم الطائرات المصقول',
      'ملمس ناعم غير لامع مضاد لبصمات الأصابع والخدوش',
      'قاعدة مغناطيسية لتثبيت مشابك الأوراق والدبابيس بسهولة',
      'قاعدة سفلية مضادة للانزلاق من مطاط السيليكون الناعم'
    ]),
    specsAr: JSON.stringify({
      'المادة': 'ألومنيوم 6061 مطلي بأكسيد الألمنيوم',
      'الأبعاد': '22 سم طول × 9 سم عرض × 8.5 سم ارتفاع',
      'الوزن': '340 جرام',
      'اللون': 'رمادي فلكي معدني'
    }),
    nameEn: 'Aluminum Minimalist Desk Organizer',
    descEn: 'Declutter your workspace beautifully with this elegant anodized aluminum organizer containing storage docks and phone stand.',
    featuresEn: JSON.stringify([
      'Sleek unibody construction carved from premium grade aircraft aluminum',
      'Premium sandblasted matte finish resisting fingerprints and wear',
      'Integrated magnetic zone designed to hold paperclips and staples',
      'Anti-scratch micro-suction silicone base pads keeping it secure'
    ]),
    specsEn: JSON.stringify({
      'Material': 'Anodized 6061 Space-grade Aluminum',
      'Dimensions': '22cm x 9cm x 8.5cm',
      'Weight': '340g',
      'Color': 'Metallic Space Gray'
    })
  },
  {
    id: 'prod-7',
    categorySlug: 'fashion',
    price: 59.0,
    originalPrice: null,
    rating: 4.8,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    stock: 18,
    nameAr: 'محفظة بطاقات جلدية ذكية واقية من RFID',
    descAr: 'محفظة جيب أمامية بتصميم نحيف للغاية وآلية دفع بطاقات سريعة وحماية كاملة ضد الاختراق اللاسلكي للبطاقات.',
    featuresAr: JSON.stringify([
      'آلية منبثقة مبتكرة ترفع البطاقات بتمريرة واحدة سريعة',
      'جلد بقري طبيعي مدبوغ نباتياً بنسيج غني ملمس رائع',
      'حماية RFID/NFC مدمجة تمنع سرقة بيانات البطاقات تماماً',
      'جيب إضافي للنقود الورقية وحمل ما يصل إلى 8 بطاقات'
    ]),
    specsAr: JSON.stringify({
      'السعة': '5-8 بطاقات بنكية ونقود ورقية',
      'الحماية': 'RFID / NFC Block المعتمد',
      'الأبعاد': '10 سم × 6.5 سم × 1.2 سم',
      'الوزن': '65 جرام'
    }),
    nameEn: 'Smart RFID-Blocking Slim Leather Wallet',
    descEn: 'An ultra-slim front pocket minimalist wallet featuring a fast card extraction mechanism and total anti-theft radio shield.',
    featuresEn: JSON.stringify([
      'Innovative card pop-up slider ejects cards smoothly with one click',
      'Handmade vegetable-tanned full-grain leather that ages beautifully',
      'Dual layer aluminum case offering certified RFID/NFC signal block',
      'Compact bills chamber holding cash and up to 8 cards securely'
    ]),
    specsEn: JSON.stringify({
      'Capacity': '5-8 credit cards plus multiple flat bank bills',
      'Blocking Standard': 'RFID blocking 13.56 MHz frequency',
      'Dimensions': '10cm x 6.5cm x 1.2cm',
      'Weight': '65g'
    })
  },
  {
    id: 'prod-8',
    categorySlug: 'fashion',
    price: 89.0,
    originalPrice: 110.0,
    rating: 4.7,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    stock: 9,
    nameAr: 'حقيبة ظهر عصرية مقاومة للماء للأجهزة المحمولة',
    descAr: 'حقيبة ظهر يومية أنيقة مزودة بجيوب مبطنة لحماية لابتوب حتى 16 بوصة، ومقاومة للأمطار والغبار.',
    featuresAr: JSON.stringify([
      'نسيج خارجي مقاوم للماء والتمزق مع سحابات محكمة الإغلاق',
      'جيب مخصص مبطن بالكامل للكمبيوتر المحمول حتى مقاس 16 بوصة',
      'منفذ شحن USB خارجي ذكي متصل بجيب داخلي لبطارية الشحن',
      'ظهر مبطن بفتحات تهوية وأحزمة مريحة لامتصاص الوزن الزائد'
    ]),
    specsAr: JSON.stringify({
      'السعة': '22 لتر',
      'المادة': 'بوليستر 900D مشمع كاره للماء',
      'أقصى حجم لابتوب': '16 بوصة (38 × 26 سم)',
      'الأبعاد': '45 سم ارتفاع × 30 سم عرض × 15 سم عمق'
    }),
    nameEn: 'Waterproof Commuter Laptop Backpack 22L',
    descEn: 'An elegant waterproof daily backpack with high-density padded compartments for a laptop up to 16 inches.',
    featuresEn: JSON.stringify([
      'Tear-resistant water-repellent shell with taped secure zippers',
      'Fully dedicated shockproof sleeve for laptops up to 16 inches',
      'Integrated external USB smart charge pass-through port',
      'Ergonomic multi-panel breathable back design relieving spine strain'
    ]),
    specsAr: JSON.stringify({
      'Volume Capacity': '22 Liters',
      'Material': '900D Waxed Hydrophobic Polyester',
      'Laptop Pocket Size': 'Up to 16" (Fits MacBook Pro 16)',
      'Dimensions': '45cm x 30cm x 15cm'
    })
  },
  {
    id: 'prod-9',
    categorySlug: 'wellness',
    price: 95.0,
    originalPrice: 125.0,
    rating: 4.9,
    reviewsCount: 68,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    stock: 6,
    nameAr: 'مجموعة طقوس العناية بالبشرة العضوية الشاملة',
    descAr: 'مجموعة فاخرة تحتوي على غسول، تونر، وسيروم نقي مستخلص من مواد طبيعية 100% لإعادة توهج ونضارة البشرة.',
    featuresAr: JSON.stringify([
      'غسول لطيف للوجه بالبابونج والشوفان لتنظيف عميق بدون جفاف',
      'تونر ماء الورد العضوي وشاي النعناع لشد وتلطيف المسام',
      'سيروم حمض الهيالورونيك والورد البري لترطيب وإخفاء التجاعيد',
      'خالٍ تماماً من الكبريتات، السيليكون، البارابين، والعطور الاصطناعية'
    ]),
    specsAr: JSON.stringify({
      'المكونات': 'عضوية معتمدة 100%، نباتية بالكامل',
      'محتوى العبوة': 'غسول 150 مل + تونر 100 مل + سيروم 30 مل',
      'نوع البشرة المناسب': 'جميع أنواع البشرة (بما فيها الحساسة)',
      'بلد الصنع': 'فرنسا (مستخلصات نباتية من جبال الألب)'
    }),
    nameEn: 'Organic Botanical Skincare Ritual Set',
    descEn: 'A luxurious wellness kit containing organic cleanser, rose mist toner, and vitamin C glow serum to restore natural skin radiance.',
    featuresEn: JSON.stringify([
      'Gentle face cleanser with chamomile and organic oats extract',
      'Damask rose water mist toner to balance and calm pores',
      'High-absorption hyaluronic acid + rosehip youth glow serum',
      '100% free of sulfates, silicones, synthetic colors, and parabens'
    ]),
    specsAr: JSON.stringify({
      'Ingredients': '100% USDA Certified Organic, Vegan & Cruelty-free',
      'Box Contains': 'Cleanser 150ml, Toner 100ml, Serum 30ml',
      'Skin Compatibility': 'Suitable for all skin types, including sensitive',
      'Origin': 'Made in France with wild Alps botanical extracts'
    })
  },
  {
    id: 'prod-10',
    categorySlug: 'wellness',
    price: 42.0,
    originalPrice: null,
    rating: 4.6,
    reviewsCount: 51,
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    stock: 16,
    nameAr: 'موزع عطور بالموجات فوق الصوتية هادئ مع إضاءة دافئة',
    descAr: 'أنشئ واحة من الهدوء والاسترخاء في بيتك مع موزع الزيوت العطرية الصامت المصنوع من السيراميك الأبيض الراقي.',
    featuresAr: JSON.stringify([
      'تقنية رذاذ بارد هادئة للغاية لا تؤثر على النوم أو العمل',
      'هيكل خارجي رائع مصنوع يدوياً من السيراميك الخشن الأنيق',
      'إضاءة LED محيطية بلون شمعي دافئ قابلة للتحكم والتعتيم',
      'إيقاف تشغيل تلقائي آمن فور نفاد المياه لمنع الاحتراق'
    ]),
    specsAr: JSON.stringify({
      'سعة الخزان': '120 مل',
      'مدة التشغيل': '3 ساعات (مستمر) / 6 ساعات (متقطع)',
      'مساحة التغطية': 'تصل إلى 30 متر مربع',
      'مستوى الضجيج': 'أقل من 20 ديسيبل (صامت تماماً)'
    }),
    nameEn: 'Silent Ceramic Ultrasonic Essential Oil Diffuser',
    descEn: 'Create a sanctuary of peace in your home with this ultrasonic ceramic mist diffuser featuring cozy dimmable ambient light.',
    featuresEn: JSON.stringify([
      'Whisper-quiet cold mist technology preserving essential oil benefits',
      'Hand-finished textured white stoneware ceramic shell',
      'Soothing candlelight LED glow with breathing and static modes',
      'Auto shut-off mechanism when reservoir is dry for peace of mind'
    ]),
    specsAr: JSON.stringify({
      'Water Tank Capacity': '120 ml',
      'Running Modes': '3 hours (continuous) / 6 hours (intermittent)',
      'Coverage Area': 'Up to 30 sq meters (approx. 320 sq ft)',
      'Noise Level': 'Under 20dB (practically inaudible)'
    })
  }
];

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameAr: cat.nameAr, nameEn: cat.nameEn },
      create: { slug: cat.slug, nameAr: cat.nameAr, nameEn: cat.nameEn }
    });
    categoryMap.set(cat.slug, createdCategory.id);
  }

  const adminHashedPassword1 = await bcrypt.hash('Admin@123456', 10);

  // تحديث بند الـ upsert للأدمن بحيث لا يتم إعادة كتابة كلمة المرور إذا كان المستخدم موجوداً
  await prisma.user.upsert({
    where: { email: 'admin@salla-store.sa' },
    update: { role: 'admin', name: 'المدير العام (Admin)', emailVerified: true },
    create: {
      email: 'admin@salla-store.sa',
      name: 'المدير العام (Admin)',
      password: adminHashedPassword1,
      role: 'admin',
      emailVerified: true,
      phone: '+966500000000',
      address: 'Headquarters Building',
      city: 'Riyadh',
      zipCode: '10000'
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@salla.store' },
    update: { role: 'admin', name: 'المدير العام (Admin)', emailVerified: true },
    create: {
      email: 'admin@salla.store',
      name: 'المدير العام (Admin)',
      password: adminHashedPassword1,
      role: 'admin',
      emailVerified: true,
      phone: '+966500000000',
      address: 'Headquarters Building',
      city: 'Riyadh',
      zipCode: '10000'
    }
  });

  const userHashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@salla.store' },
    update: { name: 'أحمد محمد', role: 'user', emailVerified: true },
    create: {
      email: 'demo@salla.store',
      name: 'أحمد محمد',
      password: userHashedPassword,
      role: 'user',
      emailVerified: true,
      phone: '+966501234567',
      address: 'شارع الملك فهد، مبنى 12',
      city: 'Riyadh',
      zipCode: '11564'
    }
  });

  for (const p of SEED_PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        categoryId,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        image: p.image,
        stock: p.stock,
        nameAr: p.nameAr,
        descAr: p.descAr,
        featuresAr: p.featuresAr,
        specsAr: p.specsAr,
        nameEn: p.nameEn,
        descEn: p.descEn,
        featuresEn: p.featuresEn,
        specsEn: p.specsEn
      },
      create: {
        id: p.id,
        categoryId,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        image: p.image,
        stock: p.stock,
        nameAr: p.nameAr,
        descAr: p.descAr,
        featuresAr: p.featuresAr,
        specsAr: p.specsAr,
        nameEn: p.nameEn,
        descEn: p.descEn,
        featuresEn: p.featuresEn,
        specsEn: p.specsEn
      }
    });
  }

  const DEFAULT_COUPONS = [
    { code: 'SALLA10', discountPercent: 10, maxDiscount: 50 },
    { code: 'WELCOME20', discountPercent: 20, maxDiscount: 100 },
    { code: 'RAMADAN15', discountPercent: 15, maxDiscount: 75 }
  ];

  for (const coupon of DEFAULT_COUPONS) {
    const existingCoupon = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    if (!existingCoupon) {
      await prisma.coupon.create({ data: { ...coupon, isActive: true } });
    }
  }

  console.log('✅ Database seeded successfully!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error('Seed error:', e);
      prisma.$disconnect();
      process.exit(1);
    });
}