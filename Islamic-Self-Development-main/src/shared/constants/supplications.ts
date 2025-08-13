import { ZikrSeries, ZikrCategory } from '../types/supplications';

export const ZIKR_CATEGORIES: ZikrCategory[] = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'daily', name: 'Daily Supplications', icon: 'star' },
  { id: 'mosque', name: 'Mosque Invocations', icon: 'star' },
];

export const ZIKR_SERIES: ZikrSeries[] = [
  {
    id: '1',
    title: 'Daily Supplications',
    description: 'A collection of daily prayers for various occasions',
    categories: ['daily'],
    icon: 'star',
    subcategories: [
      {
        id: '1-wakeup',
        name: 'Wake up',
        description: 'Supplications for waking up',
        icon: 'sunny-outline',
        category: 'waking',
        duas: [
          {
            id: '1-1-1',
            title: 'Upon Waking Up',
            arabic: 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            transliteration: "Alhamdu lillaahil-lathee 'ahyaanaa ba'da maa 'amaatanaa wa'ilayhin-nushoor",
            translation: 'Praise is to Allah Who gives us life after He has caused us to die and to Him is the return.',
            category: 'all',
            occasion: 'Wake up',
            reference: 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 11/113; Muslim 4/2083',
            repetitions: 1
          },
          {
            id: '1-1-2',
            title: 'Forgiveness and Strength upon Waking',
            arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدَ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، ولَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ العَلِيِّ الْعَظيِمِ، ربِّ اغْفِرلِي',
            transliteration: "Laa 'illaha 'illallahu wahdahu la shareeka lahu, lahul-mulku wa lahul-hamdu, wa Huwa 'alaa kulli shay'in Qadeer Subhaanallahi, walhamdu lillaahi, wa laa 'ilaha 'illallahu, wallaahu 'akbar, wa laa hawla wa laa Quwwata 'illaa billaahil-'Aliyyil-'Adheem, Rabbighfir lee",
            translation: 'There is none worth of worship but Allah alone, Who has no partner, His is the dominion and to Him belongs all praise, and He is able to do all things. Glory is to Allah. Praise is to Allah. There is none worth of worship but Allah. Allah is the Most Great. There is no might and no power except by Allah\'s leave, the Exalted, the Mighty. My Lord, forgive me.',
            category: 'all',
            occasion: 'Wake up',
            reference: 'Al-Bukhari, cf. Al-Asqalani, Fathul-Bari 3/39, among others. The wording here is from Ibn Majah 2/335',
            repetitions: 1
          },
          {
            id: '1-1-3',
            title: 'Gratitude for Well-Being',
            arabic: 'الْحَمْدُ للهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ',
            transliteration: "Alhamdu lillaahil-lathee 'aafaanee fee jasadee, wa radda 'alayya roohee, wa 'athina lee bithikrihi",
            translation: 'Praise is to Allah Who gave strength to my body and returned my soul to me and permitted me to remember Him.',
            category: 'all',
            occasion: 'Wake up',
            reference: "At-Tirmithi 5/473. See Al-Albani's Sahih Tirmiihi 3/144",
            repetitions: 1
          }
        ]
      },
      {
        id: '1-morning',
        name: 'Morning',
        description: 'Supplications for the morning',
        icon: 'sunny',
        category: 'morning',
        duas: [
          {
            id: '1-2-1',
            title: 'Ayat Al-Kursi (Morning)',
            arabic: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ "اللهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ".',
            transliteration: "A 'oothu billaahi minash-Shaytaanir-rajeem. Allaahu laa 'ilaaha 'illaa Huwal-Hayyul-Qayyoom, laa ta'khuthuhu sinatun wa laa nawm, lahu maa fis-samaawaati wa maa fil-'ardh, man thai-lathee yashfa'u 'indahu 'illaa bi'ithnih, ya'lamu maa bayna 'aydeehim wa maa khalfahum, wa laa yuheetoona bishay'im-min 'ilmihi 'illaa bimaa shaa'a, wasi'a kursiyyuhus samaawaati wal'ardh, wa laa ya'ooduhu hifdhuhumaa, wa Huwal- 'Aliyyul- 'Adheem.",
            translation: 'I seek refuge in Allah from Satan the outcast. - Allah! There is none worthy of worship but He, the Ever Living, the One Who sustains and protects all that exists. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never encompass anything of His Knowledge except that which He wills. His Throne extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Most Great.',
            category: 'all',
            occasion: 'Morning',
            reference: 'Al-Hakim 1/562, Sahihut-Targhib wat-Tarhib 1/273',
            repetitions: 1
          },
          {
            id: '1-2-2',
            title: 'Surah Al-Ikhlas (Morning)',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ هُوَ اللهُ أَحَدٌ ۞ اللهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One. The Self-Sufficient Master, Whom all creatures need, He begets not nor was He begotten, and there is none equal to Him.',
            category: 'all',
            occasion: 'Morning',
            reference: 'General Reference',
            repetitions: 3
          },
          {
            id: '1-2-3',
            title: 'Surah Al-Falaq (Morning)',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفّٰثَٰتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ".',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul 'a'oothu birabbil-falaq. Min sharri ma khalaq. Wa min sharri ghaasiqin 'ithaa waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin 'ithaa hasad.",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: I seek refuge with (Allah) the Lord of the daybreak, from the evil of what He has created, and from the evil of the darkening (night) as it comes with its darkness, and from the evil of those who practice witchcraft when they blow in the knots, and from the evil of the envier when he envies.',
            category: 'all',
            occasion: 'Morning',
            reference: 'General Reference',
            repetitions: 3
          },
          {
            id: '1-2-4',
            title: 'Surah An-Nas (Morning)',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ".',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul 'a'oothu birabbin-naas. Malikin-naas. 'Ilaahin-naas. Min sharril-waswaasil-khannaas. Allathee yuwaswisu fee sudoorin-naas. Minal-jinnati wannaas.",
            translation: 'With the Name of Allah , the Most Gracious , the Most Merciful. Say: I seek refuge with (Allah) the Lord of mankind, the King of mankind , the God of mankind , from the evil of the whisperer who withdraws, who whispers in the breasts of mankind, of jinns and men.',
            category: 'all',
            occasion: 'Morning',
            reference: 'General Reference',
            repetitions: 3
          }
        ]
      },
      {
        id: '1-evening',
        name: 'Evening',
        description: 'Supplications for the evening',
        icon: 'moon',
        category: 'evening',
        duas: [
          {
            id: '1-3-1',
            title: 'Ayat Al-Kursi (Evening)',
            arabic: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ "اللهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ".',
            transliteration: "A 'oothu billaahi minash-Shaytaanir-rajeem. Allaahu laa 'ilaaha 'illaa Huwal-Hayyul-Qayyoom, laa ta'khuthuhu sinatun wa laa nawm, lahu maa fis-samaawaati wa maa fil-'ardh, man thai-lathee yashfa'u 'indahu 'illaa bi'ithnih, ya'lamu maa bayna 'aydeehim wa maa khalfahum, wa laa yuheetoona bishay'im-min 'ilmihi 'illaa bimaa shaa'a, wasi'a kursiyyuhus samaawaati wal'ardh, wa laa ya'ooduhu hifdhuhumaa, wa Huwal- 'Aliyyul- 'Adheem.",
            translation: 'I seek refuge in Allah from Satan the outcast. - Allah! There is none worthy of worship but He, the Ever Living, the One Who sustains and protects all that exists. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never encompass anything of His Knowledge except that which He wills. His Throne extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Most Great.',
            category: 'all',
            occasion: 'Evening',
            reference: 'Al-Hakim 1/562, Sahihut-Targhib wat-Tarhib 1/273',
            repetitions: 1
          },
          {
                    id: '1-3-2',
            title: 'Surah Al-Ikhlas (Evening)',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ هُوَ اللهُ أَحَدٌ ۞ اللهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One. The Self-Sufficient Master, Whom all creatures need, He begets not nor was He begotten, and there is none equal to Him.',
            category: 'all',
            occasion: 'Evening',
            reference: 'General Reference',
            repetitions: 3
          }
        ]
      },
      {
        id: '1-bedtime',
        name: 'Bed Time',
        description: 'Supplications for before sleep',
        icon: 'bed',
        category: 'sleep',
        duas: [
          {
            id: '1-4-1',
            title: 'Three Surahs Before Sleep',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ هُوَ اللهُ أَحَدٌ..."',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad...",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One...',
            category: 'all',
            occasion: 'Bed Time',
            reference: 'Al-Bukhari, Fathul-Bari 9/62, Muslim 4/1723',
            repetitions: 3
          },
          {
            id: '1-4-2',
            title: 'Ayat Al-Kursi Before Sleep',
            arabic: 'اللهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
            transliteration: "Allaahu laa 'ilaaha 'illaa Huwal-Hayyul-Qayyoom...",
            translation: 'Allah! There is no God but He, the Ever Living, the One Who sustains and protects all that exists...',
            category: 'all',
            occasion: 'Bed Time',
            reference: 'Al-Baqarah 2:255, Al-Bukhari, Fathul-Bari 4/487',
            repetitions: 1
          }
        ]
      }
    ]
  },
  
  {
    id: '2',
    title: 'Mosque Invocations',
    description: 'A collection of invocations for the mosque',
    categories: ['mosque'],
    icon: 'star',
    subcategories: [
      {
        id: '2-1',
        name: 'When going to the mosque',
        description: 'A collection of invocations for the mosque',
        icon: 'star',
        category: 'mosque',
        duas: [
          {
            id: '2-1-1',
            title: 'Invocation',
            arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُوراً، وَفِي لِسَانِي نُوراً، وَفِي سَمْعِي نُوراً، وَفِي بَصَرِي نُوراً، وَمِنْ فَوقِي نُوراً، وَمِنْ تَحْتِِي نُوراً، وَعَنْ يَمِينِي نُوراً، وَعَنْ شِمَالِي نُوراً، وَمِن أَمَامِي نُوراً، وَمِنْ خَلْفِِي نُوراً، وَاجْعَلْ فِي نَفْسِي نُوراً، وَأَعْظِمْ لِي نُوراً، وَعَظِّمْ لِي نُوراً، وِاجْعَلْ لِي نُوراً، وَاجْعَلْنِي نُوراً، اللَّهُمَّ أَعْطِنِي نُوراً، وَاجْعَلْ فِي عَصَبِي نُوراً، وَفِي لَحْمِي نُوراً، وَفِي دَمِي نُوراً، وَفِي شَعْرِي نُوراً، وَفِي بَشَرِي نُوراً،" ["اللَّهُمَّ اجْعَلْ لِي نُوراً فِي قَبْرِي.. وَنُوراً فِي عِظَامِي"] ["وَزِدْنِي نُوراً، وَزِدْنِي نُوراً، وَزِدْنِي نُوراً"] ["وَهَبْ لِي نُوراً عَلَى نُورٍ"].',
            transliteration: "Allaahummaj'al fee qalbee nooran, wa fee lisaaanee nooran, wa fee sam'ee nooran, wa fee basaree nooran, wa min fawqee nooran, wa min tahtee nooran, wa 'an yameenee nooran, wa 'an shimaalee nooran, wa min 'amaamee nooran, wa min khalfee nooran, waj'al fee nafsee nooran, wa 'a'dhim lee nooran, wa 'adhdhim lee nooran, waj'al lee nooran, waj'alnee nooran, Allaahumma 'a'tinee nooran, waj'al fee 'asabee nooran, wa fee lahmee nooran, wa fee damee nooran, wa fee sha'ree nooran, wa fee basharee nooran. [Allaahummaj'al lee nooran fee qabree wa nooran fee 'idhaamee.] [Wa zidnee nooran, wa zidnee nooran, wa zidnee nooran.] [Wa hab lee nooran 'alaa noor.]",
            translation: 'O Allah, place light in my heart, and on my tongue light, and in my ears light and in my sight light, and above me light, and below me light, and to my right light, and to my left light, and before me light and behind me light. Place in my soul light. Magnify for me light, and amplify for me light. Make for me light and make me a light. O Allah, grant me light, and place light in my nerves, and in my body light and in my blood light and in my hair light and in my skin light. [O Allah, make for me a light in my grave... and a light in my bones.] [Increase me in light, increase me in light, increase me in light.] [Grant me light upon light.]',
            category: 'all',
            occasion: 'Going to the mosque',
            reference: 'Al-Bukhari 11/116, Muslim 1/526, 529-530',
            fullReference: 'This supplication is reported in Al-Bukhari 11/116 (Hadith no. 6316) and Muslim 1/526, 529-530 (Hadith no. 763) on the authority of Ibn Abbas (may Allah be pleased with him). The Prophet (peace be upon him) would recite this dua when going to the mosque, asking Allah for light in every aspect of his being and surroundings. Additional narrations are found in At-Tirmithi 5/483 (Hadith no. 3419), Al-Bukhari in Al-Adab Al-Mufrad (Hadith no. 695), and authenticated by Al-Albani in Sahih Al-Adab Al-Mufrad (no. 536). This invocation emphasizes seeking Allah’s guidance, protection, and spiritual illumination in all matters.',
            repetitions: 1
          }
        ]
      },
      {
        id: '2-2',
        name: 'When entering the mosque',
        description: 'A collection of invocations for the mosque',
        icon: 'star',
        category: 'mosque',
        duas: [
          {
            id: '2-2-1',
            title: 'Prayer',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ هُوَ اللهُ أَحَدٌ..."',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad...",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One...',
            category: 'all',
            occasion: 'Prayer',
            reference: 'Al-Bukhari, Fathul-Bari 9/62, Muslim 4/1723',
            repetitions: 3
          }
        ]
      },
      {
        id: '2-3',
        name: 'When leaving the mosque',
        description: 'A collection of invocations for the mosque',
        icon: 'star',
        category: 'mosque',
        duas: [
          {
            id: '2-3-1',
            title: 'Prayer',
            arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ "قُلْ هُوَ اللهُ أَحَدٌ..."',
            transliteration: "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad...",
            translation: 'With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One...',
            category: 'all',
            occasion: 'Prayer',
            reference: 'Al-Bukhari, Fathul-Bari 9/62, Muslim 4/1723',
            repetitions: 3
          }
        ]
      }
    ]
  }
];

// Helper function to get all duas from a series (handles both structures)
export function getAllDuasFromSeries(series: ZikrSeries) {
  if (series.subcategories && series.subcategories.length > 0) {
    // Complex series with subcategories
    return series.subcategories.flatMap(subcategory => subcategory.duas);
  } else if (series.duas && series.duas.length > 0) {
    // Simple series with direct duas
    return series.duas;
  }
  return [];
}

// Helper function to check if a series has subcategories
export function hasSubcategories(series: ZikrSeries) {
  return !!(series.subcategories && series.subcategories.length > 0);
}