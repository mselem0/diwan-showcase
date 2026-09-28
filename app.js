/**
 * روائع الديوان | Diwan Showcase Web App Engine
 * High-performance, zero-dependency SPA with offline fallbacks,
 * Diwan API integration, rich Arabic typography, and canvas image export.
 */

// ==========================================
// 1. Rich Mock Data & Fallback Knowledge Base
// ==========================================
const MOCK_DATA = {
  eras: [
    { id: 'all', name: 'كافة العصور', slug: 'all', count: 24 },
    { id: 'jahili', name: 'العصر الجاهلي', slug: 'jahili', count: 5, desc: 'عصر الفصاحة وأصحاب المعلقات الخالدة' },
    { id: 'umayyad', name: 'العصر الإسلامي والأموي', slug: 'umayyad', count: 4, desc: 'بزوغ رسالة الإسلام وأراجيز الفتوحات والغزل العذري' },
    { id: 'abbasi', name: 'العصر العباسي', slug: 'abbasi', count: 7, desc: 'العصر الذهبي للأدب والحكمة والفلسفة الشعرية' },
    { id: 'andalusi', name: 'العصر الأندلسي', slug: 'andalusi', count: 4, desc: 'فردوس الموشحات ورقة الوصف وشوق الاغتراب' },
    { id: 'modern', name: 'العصر الحديث والمعاصر', slug: 'modern', count: 4, desc: 'حركة الإحياء والنهضة والشعر الحر' }
  ],
  poets: [
    {
      id: 'al-mutanabbi',
      name: 'أبو الطيب المتنبي',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'شاعر العرب ومالك ناصية البيان',
      bio: 'أحمد بن الحسين الجعفي الكندي، ملأ الدنيا وشغل الناس، حكيم الشعراء وأشعر أهل البادية والحاضرة.',
      avatar: '📜',
      poemsCount: 3
    },
    {
      id: 'antara',
      name: 'عنترة بن شداد',
      eraId: 'jahili',
      eraName: 'العصر الجاهلي',
      title: 'فارس بني عبس وصاحب المعلقة',
      bio: 'عنترة بن شداد العبسي، جمع بين شجاعة الميدان ورقة الغزل العفيف بعبلة.',
      avatar: '⚔️',
      poemsCount: 2
    },
    {
      id: 'imru-al-qais',
      name: 'امرؤ القيس',
      eraId: 'jahili',
      eraName: 'العصر الجاهلي',
      title: 'الملك الضليل وأمير شعراء الجاهلية',
      bio: 'حندج بن حجر الكندي، رائد الوقوف على الأطلال وبكاء الديار وأول من قيد الأوابد.',
      avatar: '👑',
      poemsCount: 1
    },
    {
      id: 'ibn-zaydun',
      name: 'ابن زيدون',
      eraId: 'andalusi',
      eraName: 'العصر الأندلسي',
      title: 'شاعر قرطبة وعاشق ولادة',
      bio: 'أحمد بن عبد الله بن زيدون المخزومي، وزير وشاعر الأندلس الأكبر وصاحب النونية الشهيرة.',
      avatar: '🌸',
      poemsCount: 1
    },
    {
      id: 'ahmed-shawqi',
      name: 'أحمد شوقي',
      eraId: 'modern',
      eraName: 'العصر الحديث والمعاصر',
      title: 'أمير الشعراء',
      bio: 'أحمد شوقي علي أحمد الهيال، زعيم النهضة الشعرية العربية ومجدد المسرح الشعري.',
      avatar: '✒️',
      poemsCount: 2
    },
    {
      id: 'abu-firas',
      name: 'أبو فراس الحمداني',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'أمير السيف والروميات',
      bio: 'الحارث بن سعيد الحمداني، أمير وشاعر حمداني اشتهر بقصائده أثناء أسره في بلاد الروم.',
      avatar: '🛡️',
      poemsCount: 1
    },
    {
      id: 'al-buhturi',
      name: 'البحتري',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'صاحب سلاسل الذهب والسينية',
      bio: 'أبو عبادة الوليد بن عبيد الطائي، أحد أعمدة الشعر العباسي المشهور بدقة الوصف وموسيقى الألفاظ.',
      avatar: '🏛️',
      poemsCount: 1
    },
    {
      id: 'mahmoud-darwish',
      name: 'محمود درويش',
      eraId: 'modern',
      eraName: 'العصر الحديث والمعاصر',
      title: 'شاعر الأرض والمنفى',
      bio: 'أحد أبرز شعراء المقاومة والوجدان الإنساني في الأدب العربي المعاصر.',
      avatar: '🕊️',
      poemsCount: 1
    }
  ],
  poems: [
    {
      id: 'mutanabbi-sayf-al-dawla',
      poetId: 'al-mutanabbi',
      poetName: 'أبو الطيب المتنبي',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'عَلى قَدرِ أَهلِ العَزمِ تَأتي العَزائِمُ',
      meter: 'بحر الطويل',
      rhyme: 'الميم',
      verses: [
        {
          num: 1,
          sadr: 'عَلى قَدرِ أَهلِ العَزمِ تَأتي العَزائِمُ',
          ajuz: 'وَتَأتي عَلى قَدرِ الكِرامِ المَكارِمُ'
        },
        {
          num: 2,
          sadr: 'وَتَعظُمُ في عَينِ الصَغيرِ صِغارُها',
          ajuz: 'وَتَصغُرُ في عَينِ العَظيمِ العَظائِمُ'
        },
        {
          num: 3,
          sadr: 'يُكَلِّفُ سَيفُ الدَولَةِ الجَيشَ هَمَّهُ',
          ajuz: 'وَقَد عَجَزَت عَنهُ الجُيوشُ الخَضارِمُ'
        },
        {
          num: 4,
          sadr: 'وَهَل رَدَّ عَنهُ البَحرَ خَوضُ رِجالِهِ',
          ajuz: 'وَلَكِنَّ ما لا يُستَطاعُ مَلاحِمُ'
        },
        {
          num: 5,
          sadr: 'وَقَفتَ وَما في المَوتِ شَكٌّ لِواقِفٍ',
          ajuz: 'كَأَنَّكَ في جَفنِ الرَدى وَهُوَ نائِمُ'
        },
        {
          num: 6,
          sadr: 'تَمُرُّ بِكَ الأَبطالُ كَلمى هَزيمَةً',
          ajuz: 'وَوَجهُكَ وَضّاحٌ وَثَغرُكَ باسِمُ'
        },
        {
          num: 7,
          sadr: 'تَجاوَزتَ مِقدارَ الشَجاعَةِ وَالنُهى',
          ajuz: 'إِلى قَولِ قَومٍ أَنتَ بِالغَيبِ عالِمُ'
        }
      ]
    },
    {
      id: 'mutanabbi-saylu-al-firas',
      poetId: 'al-mutanabbi',
      poetName: 'أبو الطيب المتنبي',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'الخَيلُ وَاللَيلُ وَالبَيداءُ تَعرِفُني',
      meter: 'بحر البسيط',
      rhyme: 'الباء',
      verses: [
        {
          num: 1,
          sadr: 'الخَيلُ وَاللَيلُ وَالبَيداءُ تَعرِفُني',
          ajuz: 'وَالسَيفُ وَالرُمحُ وَالقِرطاسُ وَالقَلَمُ'
        },
        {
          num: 2,
          sadr: 'صَحِبتُ في الفَلَواتِ الوَحشَ مُنفَرِداً',
          ajuz: 'حَتّى تَعَجَّبَ مِنّي القُورُ وَالأَكَمُ'
        },
        {
          num: 3,
          sadr: 'أَنا الَّذي نَظَرَ الأَعمى إِلى أَدَبي',
          ajuz: 'وَأَسمَعَت كَلِماتي مَن بِهِ صَمَمُ'
        },
        {
          num: 4,
          sadr: 'أَنامُ مِلءَ جُفوني عَن شَوارِدِها',
          ajuz: 'وَيَسهَرُ الخَلقُ جَرّاها وَيَختَصِمُ'
        },
        {
          num: 5,
          sadr: 'وَما اِنتِفاعُ أَخي الدُنيا بِناظِرِهِ',
          ajuz: 'إِذا اِستَوَت عِندَهُ الأَنوارُ وَالظُلَمُ'
        }
      ]
    },
    {
      id: 'mutanabbi-idh-ra-ayta',
      poetId: 'al-mutanabbi',
      poetName: 'أبو الطيب المتنبي',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'إِذا رَأَيتَ نُيوبَ اللَيثِ بارِزَةً',
      meter: 'بحر البسيط',
      rhyme: 'الميم',
      verses: [
        {
          num: 1,
          sadr: 'إِذا رَأَيتَ نُيوبَ اللَيثِ بارِزَةً',
          ajuz: 'فَلا تَظُنَّنَّ أَنَّ اللَيثَ يَبتَسِمُ'
        },
        {
          num: 2,
          sadr: 'وَمُهجَةٍ سُقتُها في كَفِّ صاحِبِها',
          ajuz: 'عِزّاً وَلَم يَرَها إِخوانُهُ غَنَمُ'
        }
      ]
    },
    {
      id: 'antara-muallaqa',
      poetId: 'antara',
      poetName: 'عنترة بن شداد',
      eraId: 'jahili',
      eraName: 'العصر الجاهلي',
      title: 'مُعَلَّقَةُ عَنْتَرَةَ: هَل غادَرَ الشُعَراءُ مِن مُتَرَدَّمِ',
      meter: 'بحر الكامل',
      rhyme: 'الميم',
      verses: [
        {
          num: 1,
          sadr: 'هَل غادَرَ الشُعَراءُ مِن مُتَرَدَّمِ',
          ajuz: 'أَم هَل عَرَفتَ الدارَ بَعدَ تَوَهُّمِ'
        },
        {
          num: 2,
          sadr: 'يا دارَ عَبلَةَ بِالجِواءِ تَكَلَّمي',
          ajuz: 'وَعِمي صَباحاً دارَ عَبلَةَ وَاِسلَمي'
        },
        {
          num: 3,
          sadr: 'وَلَقَد شَفَى نَفْسِي وَأَبْرَأَ سُقْمَهَا',
          ajuz: 'قِيلُ الفَوَارِسِ وَيْكَ عَنْتَرَ أَقْدِمِ'
        },
        {
          num: 4,
          sadr: 'يَدعُونَ عَنْتَرَ وَالرِّمَاحُ كَأَنَّهَا',
          ajuz: 'أَشْطَانُ بِئْرٍ فِي لَبَانِ الأَدْهَمِ'
        },
        {
          num: 5,
          sadr: 'وَلَقَدْ ذَكَرْتُكِ وَالرِّمَاحُ نَوَاهِلٌ',
          ajuz: 'مِنِّي وَبِيضُ الهِنْدِ تَقْطُرُ مِنْ دَمِي'
        },
        {
          num: 6,
          sadr: 'فَوَدِدْتُ تَقْبِيلَ السُّيُوفِ لِأَنَّهَا',
          ajuz: 'لَمَعَتْ كَبَارِقِ ثَغْرِكِ المُتَبَسِّمِ'
        }
      ]
    },
    {
      id: 'antara-hukm',
      poetId: 'antara',
      poetName: 'عنترة بن شداد',
      eraId: 'jahili',
      eraName: 'العصر الجاهلي',
      title: 'حَكِّم سُيوفَكَ في رِقابِ العُذَّلِ',
      meter: 'بحر الكامل',
      rhyme: 'اللام',
      verses: [
        {
          num: 1,
          sadr: 'حَكِّم سُيوفَكَ في رِقابِ العُذَّلِ',
          ajuz: 'وَإِذا نَزَلتَ بِدارِ عِزٍّ فَاِرحَلِ'
        },
        {
          num: 2,
          sadr: 'لا تَسقِني ماءَ الحَياةِ بِذِلَّةٍ',
          ajuz: 'بَل فَاِسقِني بِالعِزِّ كَأسَ الحَنظَلِ'
        },
        {
          num: 3,
          sadr: 'ماءُ الحَياةِ بِذِلَّةٍ كَجَهَنَّمٍ',
          ajuz: 'وَجَهَنَّمٌ بِالعِزِّ أَطيَبُ مَنزِلِ'
        }
      ]
    },
    {
      id: 'imru-qifa-nabki',
      poetId: 'imru-al-qais',
      poetName: 'امرؤ القيس',
      eraId: 'jahili',
      eraName: 'العصر الجاهلي',
      title: 'قِفا نَبكِ مِن ذِكرى حَبيبٍ وَمَنزِلِ',
      meter: 'بحر الطويل',
      rhyme: 'اللام',
      verses: [
        {
          num: 1,
          sadr: 'قِفا نَبكِ مِن ذِكرى حَبيبٍ وَمَنزِلِ',
          ajuz: 'بِسِقطِ اللِوى بَينَ الدَخولِ فَحَومَلِ'
        },
        {
          num: 2,
          sadr: 'فَتوضِحَ فَالمِقراةِ لَم يَعفُ رَسمُها',
          ajuz: 'لِما نَسَجَتها مِن جَنوبٍ وَشَمأَلِ'
        },
        {
          num: 3,
          sadr: 'وَلَيلٍ كَمَوجِ البَحرِ أَرخى سُدولَهُ',
          ajuz: 'عَلَيَّ بِأَنواعِ الهُمومِ لِيَبتَلي'
        },
        {
          num: 4,
          sadr: 'فَقُلتُ لَهُ لَمّا تَمَطّى بِصُلبِهِ',
          ajuz: 'وَأَردَفَ أَعجازاً وَناءَ بِكَلْكَلِ'
        },
        {
          num: 5,
          sadr: 'أَلا أَيُّها اللَيلُ الطَويلُ أَلا اِنجَلي',
          ajuz: 'بِصُبحٍ وَما الإِصباحُ مِنكَ بِأَمثَلِ'
        }
      ]
    },
    {
      id: 'ibn-zaydun-nuniyya',
      poetId: 'ibn-zaydun',
      poetName: 'ابن زيدون',
      eraId: 'andalusi',
      eraName: 'العصر الأندلسي',
      title: 'أَضحى التَنائي بَديلاً مِن تَدانينا',
      meter: 'بحر البسيط',
      rhyme: 'النون',
      verses: [
        {
          num: 1,
          sadr: 'أَضحى التَنائي بَديلاً مِن تَدانينا',
          ajuz: 'وَنابَ عَن طيبِ لُقيانا تَجافينا'
        },
        {
          num: 2,
          sadr: 'أَلّا وَقَد حانَ صُبحُ البَينِ صَبَّحَنا',
          ajuz: 'حَينٌ فَقامَ بِنا رَيبُ الرَدى فينا'
        },
        {
          num: 3,
          sadr: 'بِنْتُم وَبِنّا فَما اِبتَلَّت جَوانِحُنا',
          ajuz: 'شَوقاً إِلَيكُم وَلا جَفَّت مَآقِينا'
        },
        {
          num: 4,
          sadr: 'نَكادُ حينَ تُناجيكُم ضَمائِرُنا',
          ajuz: 'يَقضي عَلَينا الأَسى لَولا تَأَسّينا'
        },
        {
          num: 5,
          sadr: 'إِنَّ الزَمانَ الَّذي ما زالَ يُضحِكُنا',
          ajuz: 'أُنساً بِقُربِكُمُ قَد عادَ يُبكينا'
        }
      ]
    },
    {
      id: 'shawqi-nahj-al-burda',
      poetId: 'ahmed-shawqi',
      poetName: 'أحمد شوقي',
      eraId: 'modern',
      eraName: 'العصر الحديث والمعاصر',
      title: 'نَهْجُ البُرْدَةِ: رِيمٌ عَلى القاعِ',
      meter: 'بحر البسيط',
      rhyme: 'الميم',
      verses: [
        {
          num: 1,
          sadr: 'ريمٌ عَلى القاعِ بَينَ البانِ وَالعَلَمِ',
          ajuz: 'أَحَلَّ سَفكَ دَمي في الأَشهُرِ الحُرُمِ'
        },
        {
          num: 2,
          sadr: 'لَمّا رَنا حَدَّثَتني النَفسُ قائِلَةً',
          ajuz: 'يا وَيحَ جَنبِكَ بِالسَهمِ المُصيبِ رُرمي'
        },
        {
          num: 3,
          sadr: 'يا لائِمي في هَواهُ وَالهَوى قَدَرٌ',
          ajuz: 'لَو شَفَّكَ الوَجدُ لَم تَعذِل وَلَم تَلُمِ'
        },
        {
          num: 4,
          sadr: 'مُحَمَّدٌ صَفوَةُ الباري وَرَحمَتُهُ',
          ajuz: 'وَبُغيَةُ اللَهِ مِن خَلقٍ وَمِن نَسَمِ'
        },
        {
          num: 5,
          sadr: 'وَجاءَ بِالحَقِّ لا كِذبٌ يُمازِجُهُ',
          ajuz: 'وَلا شَكوكٌ تُعَفّي نورَ مُبتَسَمِ'
        }
      ]
    },
    {
      id: 'shawqi-al-muallim',
      poetId: 'ahmed-shawqi',
      poetName: 'أحمد شوقي',
      eraId: 'modern',
      eraName: 'العصر الحديث والمعاصر',
      title: 'قُم لِلمُعَلِّمِ وَفِّهِ التَبجيلا',
      meter: 'بحر الكامل',
      rhyme: 'اللام',
      verses: [
        {
          num: 1,
          sadr: 'قُم لِلمُعَلِّمِ وَفِّهِ التَبجيلا',
          ajuz: 'كادَ المُعَلِّمُ أَن يَكونَ رَسولا'
        },
        {
          num: 2,
          sadr: 'أَعَلِمتَ أَشرَفَ أَو أَجَلَّ مِنَ الَّذي',
          ajuz: 'يَبني وَيُنشِئُ أَنفُساً وَعُقولا'
        },
        {
          num: 3,
          sadr: 'سُبحانَكَ اللَهُمَّ خَيرَ مُعَلِّمٍ',
          ajuz: 'عَلَّمتَ بِالقَلَمِ القُرونَ الأولى'
        }
      ]
    },
    {
      id: 'abu-firas-araka',
      poetId: 'abu-firas',
      poetName: 'أبو فراس الحمداني',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'أَراكَ عَصِيَّ الدَمعِ شيمَتُكَ الصَبرُ',
      meter: 'بحر الطويل',
      rhyme: 'الراء',
      verses: [
        {
          num: 1,
          sadr: 'أَراكَ عَصِيَّ الدَمعِ شيمَتُكَ الصَبرُ',
          ajuz: 'أَما لِلهَوى نَهيٌ عَلَيكَ وَلا أَمرُ'
        },
        {
          num: 2,
          sadr: 'بَلى أَنا مُشتاقٌ وَعِندِيَ لَوعَةٌ',
          ajuz: 'وَلَكِنَّ مِثلي لا يُذاعُ لَهُ سِرُّ'
        },
        {
          num: 3,
          sadr: 'إِذا اللَيلُ أَضواني بَسَطتُ يَدَ الهَوى',
          ajuz: 'وَأَذلَلتُ دَمعاً مِن خَلائِقِهِ الكِبرُ'
        },
        {
          num: 4,
          sadr: 'سَيَذكُرُني قَومي إِذا جَدَّ جِدُّهُم',
          ajuz: 'وَفي اللَيلَةِ الظَلماءِ يُفتَقَدُ البَدرُ'
        }
      ]
    },
    {
      id: 'buhturi-sinia',
      poetId: 'al-buhturi',
      poetName: 'البحتري',
      eraId: 'abbasi',
      eraName: 'العصر العباسي',
      title: 'صُنتُ نَفسي عَمّا يُدَنِّسُ نَفسي (السِّينِيَّة)',
      meter: 'بحر الخفيف',
      rhyme: 'السين',
      verses: [
        {
          num: 1,
          sadr: 'صُنتُ نَفسي عَمّا يُدَنِّسُ نَفسي',
          ajuz: 'وَتَرَفَّعتُ عَن جَدا كُلِّ جِبسِ'
        },
        {
          num: 2,
          sadr: 'وَتَماسَكتُ حينَ زَعزَعَني الدَهـ',
          ajuz: 'ـرُ اِلتِماساً مِنهُ لِتَعسي وَنُكْسي'
        },
        {
          num: 3,
          sadr: 'حَضَرَت رَحبَةُ الإِيوانِ وَالعِزُّ باذِخٌ',
          ajuz: 'كَأَنَّ الجُموعَ الغُلبَ في يَومِ عُرسِ'
        }
      ]
    },
    {
      id: 'darwish-ala-hazihi-al-ard',
      poetId: 'mahmoud-darwish',
      poetName: 'محمود درويش',
      eraId: 'modern',
      eraName: 'العصر الحديث والمعاصر',
      title: 'عَلى هَذِهِ الأَرْضِ مَا يَسْتَحِقُّ الحَيَاةْ',
      meter: 'تفعيلة (المتقارب)',
      rhyme: 'متنوع',
      verses: [
        {
          num: 1,
          sadr: 'عَلى هَذِهِ الأَرْضِ مَا يَسْتَحِقُّ الحَيَاةْ',
          ajuz: 'تَرَدُّدُ إِبْرِيلَ، رَائِحَةُ الخُبْزِ فِي الفَجْرِ'
        },
        {
          num: 2,
          sadr: 'آرَاءُ امْرَأَةٍ فِي الرِّجَالِ، كِتَابَاتُ إِسْخِيلُوسَ',
          ajuz: 'أَوَّلُ الحُبِّ، عُشْبٌ عَلَى حَجَرٍ، أُمَّهَاتٌ تَقِفْنَ عَلَى خَيْطِ نَايٍ'
        },
        {
          num: 3,
          sadr: 'وَخَوْفُ الغُزَاةِ مِنَ الذِّكْرَيَاتْ',
          ajuz: 'عَلَى هَذِهِ الأَرْضِ سَيِّدَةُ الأَرْضِ.. كَانَتْ تُسَمَّى فِلَسْطِين.. صَارَتْ تُسَمَّى فِلَسْطِين'
        }
      ]
    }
  ]
};

// ==========================================
// 2. ApiClient with LocalStorage & Fallback
// ==========================================
class ApiClient {
  constructor() {
    this.storageKey = 'diwan_api_config';
    this.config = this.loadConfig();
    this.isOnlineApi = false;
  }

  loadConfig() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored API config', e);
      }
    }
    return {
      baseUrl: 'https://api.aldiwan.net/v1',
      token: ''
    };
  }

  saveConfig(baseUrl, token) {
    this.config = {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      token: token ? token.trim() : ''
    };
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
  }

  resetConfig() {
    localStorage.removeItem(this.storageKey);
    this.config = {
      baseUrl: 'https://api.aldiwan.net/v1',
      token: ''
    };
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    return headers;
  }

  async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(`${this.config.baseUrl}/ping`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isOnlineApi = true;
        return { success: true, message: 'الاتصال بالخادم ناجح (200 OK)' };
      }
      return { success: false, message: `استجاب الخادم برمز: ${res.status}` };
    } catch (err) {
      this.isOnlineApi = false;
      return { 
        success: false, 
        message: 'تعذر الاتصال المباشر بالخادم (قد يكون CORS أو غير متوفر حالياً)؛ سيعمل التطبيق تلقائياً بالبيانات المحلية عالية الجودة.' 
      };
    }
  }

  async getEras() {
    if (this.isOnlineApi) {
      try {
        const res = await fetch(`${this.config.baseUrl}/eras`, { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return data;
        }
      } catch (e) {
        console.warn('API error fetching eras, falling back to mock data', e);
      }
    }
    return MOCK_DATA.eras;
  }

  async getPoets(eraId = 'all') {
    if (this.isOnlineApi) {
      try {
        const url = eraId && eraId !== 'all' 
          ? `${this.config.baseUrl}/poets?era=${encodeURIComponent(eraId)}` 
          : `${this.config.baseUrl}/poets`;
        const res = await fetch(url, { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return data;
        }
      } catch (e) {
        console.warn('API error fetching poets, falling back to mock data', e);
      }
    }

    if (!eraId || eraId === 'all') {
      return MOCK_DATA.poets;
    }
    return MOCK_DATA.poets.filter(p => p.eraId === eraId);
  }

  async getPoetPoems(poetId) {
    if (this.isOnlineApi) {
      try {
        const res = await fetch(`${this.config.baseUrl}/poets/${poetId}/poems`, { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return data;
        }
      } catch (e) {
        console.warn('API error fetching poet poems, falling back', e);
      }
    }
    return MOCK_DATA.poems.filter(p => p.poetId === poetId);
  }

  async getPoem(poemId) {
    if (this.isOnlineApi) {
      try {
        const res = await fetch(`${this.config.baseUrl}/poems/${poemId}`, { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) return data;
        }
      } catch (e) {
        console.warn('API error fetching poem, falling back', e);
      }
    }
    return MOCK_DATA.poems.find(p => p.id === poemId);
  }

  search(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const cleanQ = removeDiacritics(q);

    const results = [];

    // Search poets
    MOCK_DATA.poets.forEach(poet => {
      const cleanName = removeDiacritics(poet.name.toLowerCase());
      if (cleanName.includes(cleanQ) || poet.title.toLowerCase().includes(cleanQ)) {
        results.push({
          type: 'poet',
          title: poet.name,
          subtitle: `${poet.title} • ${poet.eraName}`,
          data: poet
        });
      }
    });

    // Search poems & verses
    MOCK_DATA.poems.forEach(poem => {
      const cleanPoemTitle = removeDiacritics(poem.title.toLowerCase());
      if (cleanPoemTitle.includes(cleanQ)) {
        results.push({
          type: 'poem',
          title: poem.title,
          subtitle: `${poem.poetName} • ${poem.meter}`,
          data: poem
        });
        return;
      }

      // Check inside verses
      for (const verse of poem.verses) {
        const cleanSadr = removeDiacritics(verse.sadr.toLowerCase());
        const cleanAjuz = removeDiacritics(verse.ajuz.toLowerCase());
        if (cleanSadr.includes(cleanQ) || cleanAjuz.includes(cleanQ)) {
          results.push({
            type: 'verse',
            title: `${verse.sadr} ... ${verse.ajuz}`,
            subtitle: `من قصيدة: «${poem.title}» - ${poem.poetName}`,
            data: poem,
            matchedVerse: verse
          });
          break; // Avoid flooding with multiple verses from same poem
        }
      }
    });

    return results.slice(0, 8);
  }
}

// ==========================================
// 3. Helper Functions (Diacritics, Toast, Canvas)
// ==========================================

/**
 * Removes Arabic diacritics (Harakat, Tanween, Shadda, Sukun)
 * Regex range: \u064B - \u0652 + \u0670 (dagger alif) + \u0656-\u065F
 */
function removeDiacritics(text) {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' 
    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800' 
    : type === 'error'
    ? 'bg-rose-950/90 text-rose-200 border-rose-800'
    : 'bg-[#18202c]/95 text-slate-200 border-[#2a374a]';

  toast.className = `px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl flex items-center gap-2.5 backdrop-blur-md transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto ${bgClass}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 4. Main Application Controller
// ==========================================
class DiwanApp {
  constructor() {
    this.api = new ApiClient();
    this.currentEraId = 'all';
    this.currentPoet = null;
    this.currentPoem = null;
    this.showDiacritics = true;
    this.fontSizeScale = 1.0;
    this.currentSelectedVerse = null;

    this.initElements();
    this.initEventListeners();
    this.startApp();
  }

  initElements() {
    // Views
    this.catalogView = document.getElementById('catalogView');
    this.poemReaderView = document.getElementById('poemReaderView');
    this.heroSection = document.getElementById('heroSection');

    // Breadcrumbs
    this.crumbHome = document.getElementById('crumbHome');
    this.crumbEra = document.getElementById('crumbEra');
    this.crumbPoet = document.getElementById('crumbPoet');
    this.crumbPoetSep = document.getElementById('crumbPoetSep');
    this.crumbPoem = document.getElementById('crumbPoem');
    this.crumbPoemSep = document.getElementById('crumbPoemSep');

    // Catalog elements
    this.erasTabsContainer = document.getElementById('erasTabsContainer');
    this.poetsGrid = document.getElementById('poetsGrid');
    this.poetsSectionTitle = document.getElementById('poetsSectionTitle');
    this.poetsCountLabel = document.getElementById('poetsCountLabel');
    this.poetPoemsSection = document.getElementById('poetPoemsSection');
    this.poetPoemsGrid = document.getElementById('poetPoemsGrid');
    this.selectedPoetNameTitle = document.getElementById('selectedPoetNameTitle');
    this.selectedPoetBio = document.getElementById('selectedPoetBio');
    this.closePoetPoemsBtn = document.getElementById('closePoetPoemsBtn');

    // Poem reader elements
    this.poemEraBadge = document.getElementById('poemEraBadge');
    this.poemMeterBadge = document.getElementById('poemMeterBadge');
    this.poemVersesCountBadge = document.getElementById('poemVersesCountBadge');
    this.poemTitle = document.getElementById('poemTitle');
    this.poemPoetName = document.getElementById('poemPoetName');
    this.versesListContainer = document.getElementById('versesListContainer');
    this.backToCatalogBtn = document.getElementById('backToCatalogBtn');
    this.copyFullPoemBtn = document.getElementById('copyFullPoemBtn');
    this.toggleDiacriticsBtn = document.getElementById('toggleDiacriticsBtn');
    this.diacriticsStatusLabel = document.getElementById('diacriticsStatusLabel');
    this.increaseFontBtn = document.getElementById('increaseFontBtn');
    this.decreaseFontBtn = document.getElementById('decreaseFontBtn');
    this.fontSizeDisplay = document.getElementById('fontSizeDisplay');

    // Search elements
    this.globalSearchInput = document.getElementById('globalSearchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.searchDropdown = document.getElementById('searchDropdown');
    this.searchResultsList = document.getElementById('searchResultsList');

    // Modals
    this.quoteModal = document.getElementById('quoteModal');
    this.closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');
    this.quoteCardSadr = document.getElementById('quoteCardSadr');
    this.quoteCardAjuz = document.getElementById('quoteCardAjuz');
    this.quoteCardPoet = document.getElementById('quoteCardPoet');
    this.copyQuoteTextBtn = document.getElementById('copyQuoteTextBtn');
    this.downloadQuoteImgBtn = document.getElementById('downloadQuoteImgBtn');
    this.quoteCanvas = document.getElementById('quoteCanvas');

    this.settingsModal = document.getElementById('settingsModal');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    this.apiBaseUrlInput = document.getElementById('apiBaseUrlInput');
    this.apiTokenInput = document.getElementById('apiTokenInput');
    this.saveApiSettingsBtn = document.getElementById('saveApiSettingsBtn');
    this.resetApiSettingsBtn = document.getElementById('resetApiSettingsBtn');
    this.testApiPingBtn = document.getElementById('testApiPingBtn');
    this.pingStatusBox = document.getElementById('pingStatusBox');

    // Badges & brand
    this.apiStatusBadge = document.getElementById('apiStatusBadge');
    this.apiStatusDot = document.getElementById('apiStatusDot');
    this.apiStatusText = document.getElementById('apiStatusText');
    this.brandLogoBtn = document.getElementById('brandLogoBtn');
  }

  initEventListeners() {
    // Navigation & logo
    this.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetToHome();
    });
    this.crumbHome.addEventListener('click', () => this.resetToHome());
    this.crumbEra.addEventListener('click', () => {
      this.switchView('catalog');
      this.poetPoemsSection.classList.add('hidden');
      this.updateBreadcrumbs();
    });
    this.crumbPoet.addEventListener('click', () => {
      if (this.currentPoet) {
        this.switchView('catalog');
        this.loadPoetPoems(this.currentPoet);
      }
    });

    this.backToCatalogBtn.addEventListener('click', () => {
      this.switchView('catalog');
    });

    this.closePoetPoemsBtn.addEventListener('click', () => {
      this.poetPoemsSection.classList.add('hidden');
      this.currentPoet = null;
      this.updateBreadcrumbs();
    });

    // Reader controls
    this.increaseFontBtn.addEventListener('click', () => {
      if (this.fontSizeScale < 1.6) {
        this.fontSizeScale += 0.1;
        this.applyFontSize();
      }
    });
    this.decreaseFontBtn.addEventListener('click', () => {
      if (this.fontSizeScale > 0.8) {
        this.fontSizeScale -= 0.1;
        this.applyFontSize();
      }
    });

    this.toggleDiacriticsBtn.addEventListener('click', () => {
      this.showDiacritics = !this.showDiacritics;
      this.diacriticsStatusLabel.textContent = this.showDiacritics ? 'التشكيل: مفعل' : 'التشكيل: معطل';
      this.renderVerses();
      showToast(this.showDiacritics ? 'تم تفعيل التشكيل' : 'تم إلغاء التشكيل لسهولة القراءة', 'info');
    });

    this.copyFullPoemBtn.addEventListener('click', () => {
      if (!this.currentPoem) return;
      let text = `«${this.currentPoem.title}»\nالشاعر: ${this.currentPoem.poetName}\n${this.currentPoem.meter}\n\n`;
      this.currentPoem.verses.forEach(v => {
        const sadr = this.showDiacritics ? v.sadr : removeDiacritics(v.sadr);
        const ajuz = this.showDiacritics ? v.ajuz : removeDiacritics(v.ajuz);
        text += `${sadr} ... ${ajuz}\n`;
      });
      text += `\n— نُسخ عبر تطبيق روائع الديوان`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ كامل القصيدة إلى الحافظة!', 'success');
      });
    });

    // Search events
    this.globalSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.trim()) {
        this.clearSearchBtn.classList.remove('hidden');
        this.performLiveSearch(val);
      } else {
        this.clearSearchBtn.classList.add('hidden');
        this.searchDropdown.classList.add('hidden');
      }
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.globalSearchInput.value = '';
      this.clearSearchBtn.classList.add('hidden');
      this.searchDropdown.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!this.globalSearchInput.contains(e.target) && !this.searchDropdown.contains(e.target)) {
        this.searchDropdown.classList.add('hidden');
      }
    });

    // Settings modal events
    this.apiStatusBadge.addEventListener('click', () => this.openSettings());
    this.openSettingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsModalBtn.addEventListener('click', () => this.closeSettings());
    this.saveApiSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.resetApiSettingsBtn.addEventListener('click', () => this.resetSettings());
    this.testApiPingBtn.addEventListener('click', () => this.testConnection());

    // Quote modal events
    this.closeQuoteModalBtn.addEventListener('click', () => this.quoteModal.classList.add('hidden'));
    this.copyQuoteTextBtn.addEventListener('click', () => this.copySelectedQuoteText());
    this.downloadQuoteImgBtn.addEventListener('click', () => this.exportQuoteImage());
  }

  async startApp() {
    this.renderErasTabs();
    await this.loadPoets();
    this.checkApiStatusQuietly();
    if (window.lucide) lucide.createIcons();
  }

  resetToHome() {
    this.currentEraId = 'all';
    this.currentPoet = null;
    this.currentPoem = null;
    this.heroSection.classList.remove('hidden');
    this.poetPoemsSection.classList.add('hidden');
    this.switchView('catalog');
    this.renderErasTabs();
    this.loadPoets();
    this.updateBreadcrumbs();
  }

  switchView(viewName) {
    if (viewName === 'catalog') {
      this.catalogView.classList.remove('hidden');
      this.poemReaderView.classList.add('hidden');
      this.heroSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'reader') {
      this.catalogView.classList.add('hidden');
      this.poemReaderView.classList.remove('hidden');
      this.heroSection.classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateBreadcrumbs() {
    if (this.currentEraId && this.currentEraId !== 'all') {
      const eraObj = MOCK_DATA.eras.find(e => e.id === this.currentEraId);
      this.crumbEra.textContent = eraObj ? eraObj.name : 'العصور الأدبية';
    } else {
      this.crumbEra.textContent = 'كافة العصور';
    }

    if (this.currentPoet) {
      this.crumbPoetSep.classList.remove('hidden');
      this.crumbPoet.classList.remove('hidden');
      this.crumbPoet.textContent = this.currentPoet.name;
    } else {
      this.crumbPoetSep.classList.add('hidden');
      this.crumbPoet.classList.add('hidden');
    }

    if (this.currentPoem) {
      this.crumbPoemSep.classList.remove('hidden');
      this.crumbPoem.classList.remove('hidden');
      this.crumbPoem.textContent = this.currentPoem.title;
    } else {
      this.crumbPoemSep.classList.add('hidden');
      this.crumbPoem.classList.add('hidden');
    }
  }

  renderErasTabs() {
    this.erasTabsContainer.innerHTML = '';
    MOCK_DATA.eras.forEach(era => {
      const isSelected = era.id === this.currentEraId;
      const btn = document.createElement('button');
      btn.className = `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
        isSelected
          ? 'bg-[#c5a059] text-slate-950 border-[#c5a059] shadow-lg shadow-[#c5a059]/20 font-bold'
          : 'bg-[#18202c] text-slate-300 border-[#2a374a] hover:border-[#c5a059]/50 hover:text-white'
      }`;
      btn.innerHTML = `
        <span>${era.name}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-[#121924] text-slate-400'}">${era.count}</span>
      `;

      btn.addEventListener('click', () => {
        this.currentEraId = era.id;
        this.renderErasTabs();
        this.loadPoets();
        this.poetPoemsSection.classList.add('hidden');
        this.updateBreadcrumbs();
      });

      this.erasTabsContainer.appendChild(btn);
    });
  }

  async loadPoets() {
    this.poetsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <div class="inline-block animate-spin w-6 h-6 border-2 border-[#c5a059] border-t-transparent rounded-full mb-2"></div>
        <p class="text-xs">جاري تحميل الشعراء...</p>
      </div>
    `;

    const poets = await this.api.getPoets(this.currentEraId);
    this.poetsCountLabel.textContent = `${poets.length} من الشعراء`;
    
    const eraObj = MOCK_DATA.eras.find(e => e.id === this.currentEraId);
    this.poetsSectionTitle.textContent = eraObj ? `شعراء ${eraObj.name}` : 'الشعراء';

    this.poetsGrid.innerHTML = '';

    if (poets.length === 0) {
      this.poetsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 border border-dashed border-[#2a374a] rounded-2xl">
          <p>لا يوجد شعراء مدرجين في هذا التصنيف حالياً.</p>
        </div>
      `;
      return;
    }

    poets.forEach(poet => {
      const card = document.createElement('div');
      card.className = 'group p-5 rounded-2xl bg-[#18202c]/80 border border-[#2a374a] hover:border-[#c5a059]/60 hover:bg-[#1f2a3a] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1';
      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl bg-[#121924] border border-[#2a374a] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-[#c5a059]/40 transition-all">
              ${poet.avatar || '📜'}
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-[#c5a059]/15 text-[#dfc185] border border-[#c5a059]/25 font-medium">
              ${poet.eraName}
            </span>
          </div>
          <h4 class="text-base font-bold font-kufi text-white group-hover:text-[#dfc185] transition-colors mb-1">
            ${poet.name}
          </h4>
          <p class="text-xs text-[#c5a059] font-medium mb-2">${poet.title}</p>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">${poet.bio}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#2a374a]/60 flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-1">
            <i data-lucide="book" class="w-3.5 h-3.5 text-[#c5a059]"></i>
            ${poet.poemsCount || 1} قصائد
          </span>
          <span class="text-[#dfc185] flex items-center gap-1 font-semibold group-hover:translate-x-[-4px] transition-transform">
            تصفح القصائد <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.loadPoetPoems(poet);
      });

      this.poetsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  async loadPoetPoems(poet) {
    this.currentPoet = poet;
    this.selectedPoetNameTitle.textContent = `قصائد ${poet.name}`;
    this.selectedPoetBio.textContent = poet.bio;
    this.poetPoemsSection.classList.remove('hidden');
    this.updateBreadcrumbs();

    this.poetPoemsGrid.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-400">
        <div class="inline-block animate-spin w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full mb-1"></div>
        <p class="text-xs">جاري تحميل القصائد...</p>
      </div>
    `;

    const poems = await this.api.getPoetPoems(poet.id);
    this.poetPoemsGrid.innerHTML = '';

    if (!poems || poems.length === 0) {
      this.poetPoemsGrid.innerHTML = `
        <div class="col-span-full py-8 text-center text-slate-400 text-xs">
          لم يتم العثور على قصائد مسجلة لهذا الشاعر حالياً.
        </div>
      `;
      return;
    }

    poems.forEach(poem => {
      const firstVerse = poem.verses && poem.verses[0] 
        ? `${poem.verses[0].sadr} ... ${poem.verses[0].ajuz}` 
        : '';

      const card = document.createElement('div');
      card.className = 'group p-5 rounded-xl bg-[#18202c] border border-[#2a374a] hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between hover:bg-[#1f2a3a]';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              ${poem.meter}
            </span>
            <span class="text-xs text-slate-400">
              ${poem.verses.length} أبيات
            </span>
          </div>
          <h4 class="text-base font-bold font-kufi text-white group-hover:text-[#dfc185] transition-colors mb-2">
            ${poem.title}
          </h4>
          <p class="text-xs text-slate-400 font-amiri leading-relaxed line-clamp-2 italic">
            «${firstVerse}»
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#2a374a]/60 flex items-center justify-between text-xs font-semibold text-[#c5a059]">
          <span>فتح قارئ القصيدة</span>
          <i data-lucide="arrow-left" class="w-4 h-4 group-hover:translate-x-[-4px] transition-transform"></i>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openPoemReader(poem);
      });

      this.poetPoemsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

    // Scroll gently to poems section
    this.poetPoemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async openPoemReader(poem) {
    this.currentPoem = poem;
    this.currentPoet = {
      id: poem.poetId,
      name: poem.poetName,
      eraName: poem.eraName
    };

    this.poemTitle.textContent = poem.title;
    this.poemPoetName.textContent = poem.poetName;
    this.poemEraBadge.textContent = poem.eraName || 'أدب عربي';
    this.poemMeterBadge.textContent = poem.meter || 'شعر عربي';
    this.poemVersesCountBadge.textContent = `${poem.verses.length} بيتاً`;

    this.renderVerses();
    this.switchView('reader');
    this.updateBreadcrumbs();
  }

  applyFontSize() {
    const percentage = Math.round(this.fontSizeScale * 100);
    this.fontSizeDisplay.textContent = `${percentage}%`;

    const verseTexts = document.querySelectorAll('.verse-text-container');
    verseTexts.forEach(el => {
      el.style.fontSize = `${1.35 * this.fontSizeScale}rem`;
    });
  }

  renderVerses() {
    if (!this.currentPoem) return;
    this.versesListContainer.innerHTML = '';

    this.currentPoem.verses.forEach(v => {
      const sadrText = this.showDiacritics ? v.sadr : removeDiacritics(v.sadr);
      const ajuzText = this.showDiacritics ? v.ajuz : removeDiacritics(v.ajuz);

      const row = document.createElement('div');
      row.className = 'verse-row';

      row.innerHTML = `
        <div class="verse-num" title="بيت رقم ${v.num}">${v.num}</div>
        <div class="verse-text-container" style="font-size: ${1.35 * this.fontSizeScale}rem">
          <div class="verse-sadr">${sadrText}</div>
          <div class="verse-separator">✦</div>
          <div class="verse-ajuz">${ajuzText}</div>
        </div>
        <div class="verse-actions">
          <button class="p-2 rounded-lg bg-[#121924] border border-[#2a374a] text-slate-300 hover:text-[#dfc185] hover:border-[#c5a059] transition-all quote-btn" title="تصدير كبطاقة اقتباس">
            <i data-lucide="quote" class="w-4 h-4"></i>
          </button>
          <button class="p-2 rounded-lg bg-[#121924] border border-[#2a374a] text-slate-300 hover:text-white hover:border-slate-500 transition-all copy-verse-btn" title="نسخ هذا البيت">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        </div>
      `;

      // Copy verse
      const copyBtn = row.querySelector('.copy-verse-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = `${sadrText} ... ${ajuzText}\n— ${this.currentPoem.poetName}`;
        navigator.clipboard.writeText(text).then(() => {
          showToast('تم نسخ البيت إلى الحافظة', 'success');
        });
      });

      // Quote verse
      const quoteBtn = row.querySelector('.quote-btn');
      quoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openQuoteModal(v, sadrText, ajuzText);
      });

      this.versesListContainer.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
  }

  openQuoteModal(verse, sadr, ajuz) {
    this.currentSelectedVerse = {
      verse,
      sadr,
      ajuz,
      poetName: this.currentPoem.poetName,
      poemTitle: this.currentPoem.title
    };

    this.quoteCardSadr.textContent = sadr;
    this.quoteCardAjuz.textContent = ajuz;
    this.quoteCardPoet.textContent = `الشاعر: ${this.currentPoem.poetName} (من ${this.currentPoem.title})`;

    this.quoteModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  copySelectedQuoteText() {
    if (!this.currentSelectedVerse) return;
    const { sadr, ajuz, poetName, poemTitle } = this.currentSelectedVerse;
    const text = `«${sadr}\n${ajuz}»\n— ${poetName} (${poemTitle})\nعبر تطبيق روائع الديوان`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('تم نسخ نص الاقتباس بنجاح!', 'success');
    });
  }

  exportQuoteImage() {
    if (!this.currentSelectedVerse) return;
    const { sadr, ajuz, poetName, poemTitle } = this.currentSelectedVerse;

    const canvas = this.quoteCanvas;
    const ctx = canvas.getContext('2d');

    // High resolution canvas for sharp retina download
    const width = 1200;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.5);
    grad.addColorStop(0, '#1c2635');
    grad.addColorStop(1, '#0b0f16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#c5a059';
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner dashed border
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(50, 50, width - 100, height - 100);
    ctx.setLineDash([]); // Reset dash

    // Header ornament / title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dfc185';
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillText('✦  رَوَائِعُ الشِّعْرِ العَرَبِيّ  ✦', width / 2, 120);

    // Sadr
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Amiri, serif';
    ctx.fillText(sadr, width / 2, 280);

    // Star separator
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 36px serif';
    ctx.fillText('✦   ✦   ✦', width / 2, 370);

    // Ajuz
    ctx.fillStyle = '#f3e5ab';
    ctx.font = 'bold 44px Amiri, serif';
    ctx.fillText(ajuz, width / 2, 460);

    // Divider line
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 570);
    ctx.lineTo(width - 150, 570);
    ctx.stroke();

    // Footer - Poet & Branding
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'right';
    ctx.fillText(`الشاعر: ${poetName}`, width - 150, 630);

    ctx.font = '20px Cairo, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`من قصيدة: «${poemTitle}»`, width - 150, 665);

    ctx.textAlign = 'left';
    ctx.font = 'bold 26px "Reem Kufi", sans-serif';
    ctx.fillStyle = '#c5a059';
    ctx.fillText('مِنَصَّةُ الدِّيوَان', 150, 635);

    ctx.font = '18px Cairo, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('aldiwan.net', 150, 665);

    // Trigger download
    try {
      const link = document.createElement('a');
      link.download = `diwan-quote-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('تم تصدير وحفظ بطاقة الاقتباس كصورة بنجاح!', 'success');
    } catch (e) {
      console.error(e);
      showToast('تعذر تصدير الصورة على هذا المتصفح', 'error');
    }
  }

  // Live search logic
  performLiveSearch(query) {
    const results = this.api.search(query);
    this.searchResultsList.innerHTML = '';

    if (results.length === 0) {
      this.searchResultsList.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-400">
          لم يتم العثور على نتائج مطابقة لـ «${query}»
        </div>
      `;
      this.searchDropdown.classList.remove('hidden');
      return;
    }

    results.forEach(res => {
      const item = document.createElement('div');
      item.className = 'p-3 hover:bg-[#1f2a3a] cursor-pointer flex items-center justify-between gap-3 text-right transition-colors';
      
      let badgeLabel = 'قصيدة';
      let icon = 'book-open';
      if (res.type === 'poet') {
        badgeLabel = 'شاعر';
        icon = 'user';
      } else if (res.type === 'verse') {
        badgeLabel = 'بيت شعري';
        icon = 'feather';
      }

      item.innerHTML = `
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-[#121924] border border-[#2a374a] flex items-center justify-center text-[#c5a059] flex-shrink-0">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
          </div>
          <div class="truncate">
            <p class="text-xs font-bold text-white truncate">${res.title}</p>
            <p class="text-[11px] text-slate-400 truncate">${res.subtitle}</p>
          </div>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded bg-[#121924] text-[#dfc185] border border-[#2a374a] whitespace-nowrap">
          ${badgeLabel}
        </span>
      `;

      item.addEventListener('click', () => {
        this.searchDropdown.classList.add('hidden');
        this.globalSearchInput.value = '';
        this.clearSearchBtn.classList.add('hidden');

        if (res.type === 'poet') {
          this.switchView('catalog');
          this.loadPoetPoems(res.data);
        } else if (res.type === 'poem' || res.type === 'verse') {
          this.openPoemReader(res.data);
        }
      });

      this.searchResultsList.appendChild(item);
    });

    if (window.lucide) lucide.createIcons();
    this.searchDropdown.classList.remove('hidden');
  }

  // API Settings Handlers
  openSettings() {
    this.apiBaseUrlInput.value = this.api.config.baseUrl;
    this.apiTokenInput.value = this.api.config.token || '';
    this.pingStatusBox.classList.add('hidden');
    this.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.settingsModal.classList.add('hidden');
  }

  saveSettings() {
    const url = this.apiBaseUrlInput.value.trim();
    const token = this.apiTokenInput.value.trim();

    if (!url) {
      showToast('يرجى إدخال رابط API صالح', 'error');
      return;
    }

    this.api.saveConfig(url, token);
    this.closeSettings();
    showToast('تم حفظ إعدادات الـ API بنجاح في المتصفح', 'success');
    this.checkApiStatusQuietly();
  }

  resetSettings() {
    this.api.resetConfig();
    this.apiBaseUrlInput.value = this.api.config.baseUrl;
    this.apiTokenInput.value = '';
    showToast('تمت استعادة الإعدادات الافتراضية', 'info');
    this.checkApiStatusQuietly();
  }

  async testConnection() {
    this.testApiPingBtn.disabled = true;
    this.testApiPingBtn.innerHTML = `
      <div class="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
      جاري الفحص...
    `;

    const res = await this.api.ping();
    this.testApiPingBtn.disabled = false;
    this.testApiPingBtn.innerHTML = `
      <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
      فحص الاتصال (Ping)
    `;

    this.pingStatusBox.classList.remove('hidden');
    if (res.success) {
      this.pingStatusBox.className = 'p-3 rounded-xl text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800';
      this.pingStatusBox.textContent = `✓ ${res.message}`;
      this.updateApiStatusIndicator('online');
    } else {
      this.pingStatusBox.className = 'p-3 rounded-xl text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800';
      this.pingStatusBox.textContent = `ℹ ${res.message}`;
      this.updateApiStatusIndicator('demo');
    }

    if (window.lucide) lucide.createIcons();
  }

  async checkApiStatusQuietly() {
    const res = await this.api.ping();
    if (res.success) {
      this.updateApiStatusIndicator('online');
    } else {
      this.updateApiStatusIndicator('demo');
    }
  }

  updateApiStatusIndicator(status) {
    if (status === 'online') {
      this.apiStatusBadge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/40 transition-colors';
      this.apiStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
      this.apiStatusText.textContent = 'API متصل';
    } else {
      this.apiStatusBadge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold bg-amber-950/40 text-amber-400 border-amber-800/50 hover:bg-amber-900/40 transition-colors';
      this.apiStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
      this.apiStatusText.textContent = 'البيانات المدمجة (Demo)';
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.diwanApp = new DiwanApp();
});
