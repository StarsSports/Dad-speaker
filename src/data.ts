import { 
  Droplet, 
  Pill, 
  Utensils, 
  Moon, 
  Bed, 
  Activity, 
  Sparkles, 
  Heart, 
  Smile, 
  VolumeX, 
  PhoneCall, 
  User, 
  AlertCircle,
  Thermometer,
  Sparkle
} from "lucide-react";

export type LanguageCode = "en" | "ar" | "fr";

export interface Phrase {
  id: string;
  category: "needs" | "comfort" | "urgent" | "warmth";
  iconName: string;
  translations: {
    en: string;
    ar: string;
    fr: string;
  };
}

export const CATEGORIES = {
  needs: {
    id: "needs",
    icon: Droplet,
    colors: "bg-[#F4F6F0] text-[#5A5A40] border-[#D6D6C2] hover:bg-[#EBEBE0]",
    badgeColor: "bg-[#EBEBE0] text-[#5A5A40]",
    en: "Daily Needs",
    ar: "الاحتياجات اليومية",
    fr: "Besoins Quotidiens"
  },
  comfort: {
    id: "comfort",
    icon: Bed,
    colors: "bg-[#FAF8F5] text-[#8C7A5C] border-[#EBE3D5] hover:bg-[#F2ECE1]",
    badgeColor: "bg-[#F2ECE1] text-[#8C7A5C]",
    en: "Comfort & Rest",
    ar: "الراحة والنوم",
    fr: "Confort et Repos"
  },
  urgent: {
    id: "urgent",
    icon: AlertCircle,
    colors: "bg-[#FAF2F2] text-[#A85C5C] border-[#EBD5D5] hover:bg-[#F2E1E1] animate-pulse",
    badgeColor: "bg-[#F2E1E1] text-[#A85C5C]",
    en: "Urgent Care",
    ar: "عاجل ومساعدة",
    fr: "Aide Urgente"
  },
  warmth: {
    id: "warmth",
    icon: Heart,
    colors: "bg-[#F2F6FA] text-[#5C7FA8] border-[#D5E1EB] hover:bg-[#E1EBF2]",
    badgeColor: "bg-[#E1EBF2] text-[#5C7FA8]",
    en: "Warm Words",
    ar: "عبارات لطيفة",
    fr: "Mots Doux"
  }
};

export const INSTANT_PHRASES: Phrase[] = [
  // Daily Needs
  {
    id: "need_water",
    category: "needs",
    iconName: "Droplet",
    translations: {
      en: "I need some water, please",
      ar: "أريد بعض الماء من فضلك",
      fr: "J'ai besoin de l'eau s'il vous plaît"
    }
  },
  {
    id: "need_medicine",
    category: "needs",
    iconName: "Pill",
    translations: {
      en: "I need my medicine now",
      ar: "أحتاج إلى دوائي الآن",
      fr: "J'ai besoin de mes médicaments maintenant"
    }
  },
  {
    id: "need_food",
    category: "needs",
    iconName: "Utensils",
    translations: {
      en: "I am feeling hungry",
      ar: "أنا أشعر بالجوع",
      fr: "J'ai faim"
    }
  },
  {
    id: "restroom",
    category: "needs",
    iconName: "Restroom",
    translations: {
      en: "I need to use the restroom",
      ar: "أريد الذهاب إلى الحمام",
      fr: "J'ai besoin d'aller aux toilettes"
    }
  },
  // Comfort and Rest
  {
    id: "sit_up",
    category: "comfort",
    iconName: "Bed",
    translations: {
      en: "Could you help me sit up?",
      ar: "هل يمكنك مساعدتي في الجلوس؟",
      fr: "Pouvez-vous m'aider à m'asseoir ?"
    }
  },
  {
    id: "rest",
    category: "comfort",
    iconName: "Moon",
    translations: {
      en: "I want to close my eyes and sleep",
      ar: "أريد إغلاق عيني والنوم",
      fr: "Je veux fermer mes yeux et dormir"
    }
  },
  {
    id: "cold",
    category: "comfort",
    iconName: "Cold",
    translations: {
      en: "I am feeling very cold",
      ar: "أشعر ببرد شديد",
      fr: "J'ai très froid"
    }
  },
  {
    id: "hot",
    category: "comfort",
    iconName: "Hot",
    translations: {
      en: "I am feeling very warm",
      ar: "أشعر بحر شديد",
      fr: "J'ai très chaud"
    }
  },
  // Urgent
  {
    id: "call_someone",
    category: "urgent",
    iconName: "User",
    translations: {
      en: "Please stay with me, do not leave",
      ar: "من فضلك ابقَ معي، لا تتركني",
      fr: "S'il vous plaît restez avec moi, ne partez pas"
    }
  },
  {
    id: "pain",
    category: "urgent",
    iconName: "Activity",
    translations: {
      en: "I am in a lot of pain",
      ar: "أنا أتألم كثيراً",
      fr: "J'ai très mal"
    }
  },
  {
    id: "doctor",
    category: "urgent",
    iconName: "PhoneCall",
    translations: {
      en: "Please call the doctor or nurse",
      ar: "أرجوك اتصل بالطبيب أو الممرض",
      fr: "S'il vous plaît, appelez le médecin ou l'infirmière"
    }
  },
  {
    id: "quiet",
    category: "urgent",
    iconName: "VolumeX",
    translations: {
      en: "Please, I need complete silence",
      ar: "أرجوك، أحتاج إلى هدوء تام",
      fr: "S'il vous plaît, j'ai besoin de calme absolu"
    }
  },
  // Warmth
  {
    id: "thank_you",
    category: "warmth",
    iconName: "Heart",
    translations: {
      en: "Thank you for taking care of me",
      ar: "شكراً لك على اهتمامك بي ورعايتي",
      fr: "Merci de prendre soin de moi"
    }
  },
  {
    id: "love_you",
    category: "warmth",
    iconName: "Love",
    translations: {
      en: "I love you so much",
      ar: "أنا أحبك كثيراً",
      fr: "Je t'aime tellement"
    }
  },
  {
    id: "blessing",
    category: "warmth",
    iconName: "Sparkles",
    translations: {
      en: "May God bless you and protect you",
      ar: "بارك الله فيك وحماك ورعاك",
      fr: "Que Dieu te bénisse et te protège"
    }
  },
  {
    id: "doing_ok",
    category: "warmth",
    iconName: "Smile",
    translations: {
      en: "I am doing okay, do not worry",
      ar: "أنا بخير، لا تقلق علي",
      fr: "Ça va, ne t'inquiète pas pour moi"
    }
  }
];

// Helper to provide nice icons for rendering based on phrase ID or custom selection
export function getPhraseIcon(category: string, id: string) {
  if (id.includes("water") || id.includes("droplet")) return Droplet;
  if (id.includes("medicine") || id.includes("pill")) return Pill;
  if (id.includes("food") || id.includes("eat") || id.includes("hungry")) return Utensils;
  if (id.includes("rest") || id.includes("sleep") || id.includes("moon")) return Moon;
  if (id.includes("sit") || id.includes("bed")) return Bed;
  if (id.includes("pain") || id.includes("activity")) return Activity;
  if (id.includes("thank") || id.includes("love") || id.includes("heart")) return Heart;
  if (id.includes("ok") || id.includes("smile")) return Smile;
  if (id.includes("quiet") || id.includes("volumex")) return VolumeX;
  if (id.includes("doctor") || id.includes("doctor_call")) return PhoneCall;
  if (id.includes("call") || id.includes("user")) return User;
  
  // Backups
  if (category === "needs") return Droplet;
  if (category === "comfort") return Bed;
  if (category === "urgent") return AlertCircle;
  return Heart;
}

export const LOCALIZATION = {
  en: {
    title: "VocalAssist",
    subtitle: "Empowering your dad's voice with visual size and clear voice scaling.",
    tagline: "Speak in a gentle whisper—we will make it loud, clear, and readable.",
    micInstruction: "Tap the Mic below, whisper clearly, and tap again to translate and speak.",
    liveMic: "Realtime Mic",
    aiMic: "Enhanced AI Mic",
    language: "Language",
    languageSelectorLabel: "Choose Language",
    speakBtn: "Speak Loudly",
    stopBtn: "Stop",
    clearBtn: "Clear",
    placeholderType: "Type something here for your dad, or help him write...",
    emptyTranscription: "Transcribed words will appear here in big, clear lettering...",
    historyTitle: "Recent Phrases",
    textSpeed: "Voice Speed",
    textVolume: "Voice Volume",
    customPhrases: "My Custon Actions",
    addPhrasePlaceholder: "Insert custom immediate phrase here...",
    addPhraseBtn: "+ Add Quick Phrase",
    saveSuccess: "Custom phrase added successfully!",
    settingsTitle: "Sound & Accessibility",
    settingsDesc: "Fine-tune speaking levels, custom vocal speeds, and screen text zoom.",
    fontSizeLabel: "Reading Text Size",
    small: "Normal",
    medium: "Large",
    large: "Extra Large",
    huge: "Huge (Extra Assist)",
    noSpeechApiSupport: "Your browser doesn't fully support live speech. Try Enhanced AI mode!",
    listeningStatus: "Actively Listening... Speak softly",
    processingStatus: "AI Listening closely... translating whisper",
    speakOutputLabel: "Tap any phrase below to instantly speak it out loud:",
    aiCorrectEnabled: "Gemini AI Whisper Enhancement Enabled",
    aiCorrectDesc: "Analyzes very soft speech and corrects static into perfect full sentences.",
    copiedText: "Copied text to read!",
    savedDraft: "Draft preserved.",
    arabicLang: "Arabic (العربية)",
    frenchLang: "French (Français)",
    englishLang: "English",
    howItWorks: "How to Help Dad",
    introStep1: "1. Select Dad's current language (English, Arabic, or French).",
    introStep2: "2. Dad can tap any Preset Button to instantly say critical needs out loud.",
    introStep3: "3. Or click the microphone, let him speak softly close to the screen, and see it rendered in HUGE text before playing.",
    disclaimer: "Fully customized for families. No external account or logins required.",
    recordFailed: "Mic error, please check frame permission and try again.",
    browserSpeechRecognition: "Standard Voice Assistant",
    tabPhrases: "⚡ Preset Actions",
    tabCustom: "⌨️ Custom Type & Speak",
    tabMicrophone: "🎙️ Microphone Assist (Very Quiet Voice)"
  },
  ar: {
    title: "مساعد الصوت الذكي",
    subtitle: "تمكين صوت الوالد وتكبير الحروف لجعلها واضحة ومقروءة للجميع.",
    tagline: "تحدث بهمس هادئ — وسنجعله مسموعاً، واضحاً، ومكتوباً بخط كبير.",
    micInstruction: "اضغط على الميكروفون، اطلب منه الهمس بهدوء، ثم توقف لقراءة وتكبير النص.",
    liveMic: "ميكروفون مباشر",
    aiMic: "ميكروفون الذكاء الاصطناعي",
    language: "اللغة",
    languageSelectorLabel: "اختر لغة المحادثة",
    speakBtn: "تحدث بصوت عالٍ",
    stopBtn: "إيقاف",
    clearBtn: "مسح",
    placeholderType: "اكتب هنا شيئاً لوالدك أو دعه يكتب لمساعدته...",
    emptyTranscription: "الكلمات المنطوقة ستظهر هنا بحروف واضحة وكبيرة جداً...",
    historyTitle: "العبارات الأخيرة",
    textSpeed: "سرعة الصوت المتحدث",
    textVolume: "مستوى الصوت",
    customPhrases: "عباراتي السريعة المخصصة",
    addPhrasePlaceholder: "أضف عبارة فورية خاصة هنا...",
    addPhraseBtn: "+ إضافة عبارة سريعة",
    saveSuccess: "تم إضافة العبارة المخصصة بنجاح!",
    settingsTitle: "إعدادات الصوت والخط",
    settingsDesc: "تعديل سرعة المتحدث، مستوى الصوت، وحجم الخط للقراءة المريحة.",
    fontSizeLabel: "حجم خط القراءة",
    small: "عادي",
    medium: "كبير",
    large: "كبير جداً",
    huge: "ضخم للغاية (أقصى وضوح)",
    noSpeechApiSupport: "متصفحك لا يدعم التعرف الصوتي المباشر. يرجى استخدام وضع ذكاء Gemini!",
    listeningStatus: "جارٍ الاستماع الآن... يرجى الهمس بالقرب من الهاتف",
    processingStatus: "الذكاء الاصطناعي يستمع للهمس بدقة ويكتب العبارة المكتملة",
    speakOutputLabel: "اضغط على أي عبارة بالأسفل لنطقها بصوت مسموع على الفور:",
    aiCorrectEnabled: "تفعيل معزز الهمس بذكاء Gemini",
    aiCorrectDesc: "يحلل الأصوات الضعيفة جداً والهمسات ويصحح الضوضاء إلى جمل واضحة ومكتملة بالكامل.",
    copiedText: "تم نسخ النص للقراءة!",
    savedDraft: "تم حفظ المسودة.",
    arabicLang: "العربية",
    frenchLang: "الفرنسية (Français)",
    englishLang: "الإنجليزية (English)",
    howItWorks: "كيف تساعد والدك",
    introStep1: "١. اختر لغة والدك المفضلة حالياً (العربية، الإنجليزية، أو الفرنسية).",
    introStep2: "٢. يمكن للوالد الضغط على أي زر احتياجات فورية لنطقها بصوت مرتفع وواضح في الحال.",
    introStep3: "٣. أو انقر على زر الميكروفون ليتحدث بهمس، وسترى الكلمات مكتوبة بخط ضخم قبل نطقها.",
    disclaimer: "مخصص بالكامل ومصمم للعائلات. لا يحتاج أي تسجيل أو حسابات معقدة.",
    recordFailed: "عذراً، فشل الميكروفون. يرجى التأكد من السماح بصلاحية الميكروفون.",
    browserSpeechRecognition: "مساعد التعرف الصوتي المعتاد",
    tabPhrases: "⚡ إجراءات سريعة",
    tabCustom: "⌨️ اكتب وتحدث",
    tabMicrophone: "🎙️ مساعد الميكروفون (للأصوات الخافتة)"
  },
  fr: {
    title: "VocalAssist",
    subtitle: "Donnez de la voix à votre papa. Texte géant et amplification vocale claire.",
    tagline: "Un simple murmure suffit—nous le rendons fort, clair et parfaitement lisible.",
    micInstruction: "Appuyez sur le micro, chuchotez doucement, et laissez l'IA transcrire et parler.",
    liveMic: "Micro en Temps Réel",
    aiMic: "Micro IA Amélioré",
    language: "Langue",
    languageSelectorLabel: "Choisir la Langue",
    speakBtn: "Parler Fort",
    stopBtn: "Arrêter",
    clearBtn: "Effacer",
    placeholderType: "Saisissez un texte personnalisé pour votre papa, ou aidez-le...",
    emptyTranscription: "Les mots transcrits apparaîtront ici en très gros caractères...",
    historyTitle: "Phrases Récentes",
    textSpeed: "Vitesse de voix",
    textVolume: "Volume sonore",
    customPhrases: "Mes actions personnalisées",
    addPhrasePlaceholder: "Saisir une commande instantanée...",
    addPhraseBtn: "+ Ajouter une phrase rapide",
    saveSuccess: "Phrase personnalisée ajoutée !",
    settingsTitle: "Son & Accessibilité",
    settingsDesc: "Ajustez le volume, la vitesse de diction, et la taille d'affichage.",
    fontSizeLabel: "Taille de police globale",
    small: "Normale",
    medium: "Grande",
    large: "Très grande",
    huge: "Géante (Aide maximale)",
    noSpeechApiSupport: "Votre navigateur ne supporte pas la dictée vocale locale. Essayez le Micro IA !",
    listeningStatus: "Écoute active en cours... Chuchotez doucement",
    processingStatus: "Analyse du murmure par l'IA en cours pour recréer la phrase complète",
    speakOutputLabel: "Appuyez sur n'importe quel besoin pour l'énoncer instantanément :",
    aiCorrectEnabled: "Amélioration des murmures par Gemini activée",
    aiCorrectDesc: "Analyse les voix très faibles et corrige les bruits pour obtenir des phrases parfaites.",
    copiedText: "Texte copié pour lecture !",
    savedDraft: "Brouillon sauvegardé.",
    arabicLang: "Arabe (العربية)",
    frenchLang: "Français",
    englishLang: "Anglais (English)",
    howItWorks: "Comment aider votre Papa",
    introStep1: "1. Sélectionnez la langue parlée (Anglais, Arabe ou Français).",
    introStep2: "2. Votre papa peut toucher n'importe quel bouton pour énoncer à voix haute un besoin crucial.",
    introStep3: "3. Ou lancez le micro, laissez-le chuchoter à haute voix, et lisez d'abord le texte GÉANT puis écoutez l'audio.",
    disclaimer: "Conçu spécialement pour la simplicité familiale. Aucun compte cloud requis.",
    recordFailed: "Erreur micro. Veuillez autoriser l'accès au microphone dans la fenêtre.",
    browserSpeechRecognition: "Reconnaissance vocale standard",
    tabPhrases: "⚡ Actions Immédiates",
    tabCustom: "⌨️ Écrire et Parler",
    tabMicrophone: "🎙️ Assistant Micro (Chuchotements très faibles)"
  }
};
