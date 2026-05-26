import React, { useState, useEffect } from "react";
import { 
  Languages, 
  HelpCircle, 
  Sparkles, 
  Settings, 
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Keyboard,
  Mic,
  Smile,
  Type,
  Globe
} from "lucide-react";
import { speakText, stopSpeaking } from "./speechEngine";
import { LOCALIZATION, LanguageCode } from "./data";
import PresetActions from "./components/PresetActions";
import TypeSpeak from "./components/TypeSpeak";
import MicAssist from "./components/MicAssist";
import InfoGuide from "./components/InfoGuide";
import { RefreshCw } from "lucide-react";

const permissionModalStrings = {
  en: {
    title: "🎤 Real Device Microphone Required",
    desc: "To record your voice and transcribe whispers intelligently, this app requires real device microphone access.",
    btn: "Activate Mic Access Now",
    skip: "Continue manually",
    success: "Permission granted! Enjoy the app.",
    status: "Prompting device microphone popup..."
  },
  ar: {
    title: "🎤 مطلوب إذن الميكروفون الحقيقي للجهاز",
    desc: "لتسجيل صوتك وتفسير الهمسات بدقة عالية، يحتاج هذا التطبيق إلى صلاحية الوصول الحقيقية لميكروفون جهازك.",
    btn: "تفعيل الميكروفون الحقيقي الآن",
    skip: "المتابعة والإنهاء يدويًا",
    success: "تم السماح بالإذن بنجاح! استمتع بالتطبيق.",
    status: "يتم الآن عرض نافذة الهاتف الحقيقية..."
  },
  fr: {
    title: "🎤 Microphone réel de l'appareil requis",
    desc: "Pour enregistrer votre voix et transcrire les chuchotements intelligemment, cette application nécessite l'accès réel au microphone.",
    btn: "Activer le micro de l'appareil",
    skip: "Continuer manuellement",
    success: "Autorisation accordée ! Profitez de l'application.",
    status: "Affichage de l'autorisation système..."
  }
};

export default function App() {
  // Load initial settings from localStorage if exist to persist preferences
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("vocalassist_lang") as LanguageCode) || "en";
  });
  
  const [fontSize, setFontSize] = useState<string>(() => {
    return localStorage.getItem("vocalassist_font_size") || "large";
  });
  
  const [textSpeed, setTextSpeed] = useState<number>(() => {
    const s = localStorage.getItem("vocalassist_text_speed");
    return s ? parseFloat(s) : 1.0;
  });

  const [textVolume, setTextVolume] = useState<number>(() => {
    const v = localStorage.getItem("vocalassist_text_volume");
    return v ? parseFloat(v) : 1.0;
  });

  const [activeTab, setActiveTab] = useState<"phrases" | "custom" | "mic">("phrases");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const [backendUrl, setBackendUrl] = useState<string>(() => {
    const saved = localStorage.getItem("vocalassist_backend_url");
    if (saved !== null) {
      return saved;
    }
    // Auto-detect Netlify / Vercel / external hosting & set to active Cloud Run server URL
    const hostname = window.location.hostname;
    const isCloudRun = hostname.includes("-429842933088.europe-west2.run.app");
    if (!isCloudRun) {
      return "https://ais-pre-rgz2jlhoc37bn4dhktpwbc-429842933088.europe-west2.run.app";
    }
    return "";
  });

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [isRequestingSysPrompt, setIsRequestingSysPrompt] = useState(false);

  // Request actual device microphone on startup
  useEffect(() => {
    setShowPermissionModal(true);
    triggerDeviceMicPrompt(true); // Silent run attempt automatically on start
  }, []);

  const triggerDeviceMicPrompt = async (silentMode: boolean = false) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (!silentMode) {
        alert("This browser or device does not support real microphone access. Please use modern Chrome, Safari, or Edge.");
      }
      return;
    }

    try {
      setIsRequestingSysPrompt(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // If we got here, permission was granted successfully!
      setPermissionStatus("granted");
      setShowPermissionModal(false);
      // Release stream resource immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.warn("Real mic prompt failed:", err);
      setPermissionStatus("denied");
      if (!silentMode) {
        setShowPermissionModal(true);
      }
    } finally {
      setIsRequestingSysPrompt(false);
    }
  };

  // Sync preferences to localStorage
  useEffect(() => {
    localStorage.setItem("vocalassist_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("vocalassist_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("vocalassist_text_speed", textSpeed.toString());
  }, [textSpeed]);

  useEffect(() => {
    localStorage.setItem("vocalassist_text_volume", textVolume.toString());
  }, [textVolume]);

  useEffect(() => {
    localStorage.setItem("vocalassist_backend_url", backendUrl);
  }, [backendUrl]);

  const dictionary = LOCALIZATION[lang];

  // Map font-classes
  const getFontSizeClass = () => {
    if (fontSize === "small") return "text-xl sm:text-2xl";
    if (fontSize === "medium") return "text-2xl sm:text-3xl";
    if (fontSize === "large") return "text-4xl sm:text-5xl";
    return "text-5xl sm:text-6xl tracking-tight"; // HUUUGE
  };

  const speak = (text: string) => {
    setIsSpeaking(true);
    speakText(
      text,
      lang,
      textSpeed,
      textVolume,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const isRtl = lang === "ar";

  return (
    <div 
      className={`min-h-screen pb-16 pt-6 px-4 bg-[#F5F5F0] text-[#4A4A35] ${
        isRtl ? "font-arabic" : "font-sans"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Netlify/Local Proxy Detect Helper */}
        {(!backendUrl && (window.location.hostname.includes("netlify.app") || window.location.hostname.includes("github.io") || window.location.hostname.includes("localhost"))) && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in/40 font-sans" dir={isRtl ? "rtl" : "ltr"}>
            <div className="space-y-1 text-left">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{lang === "ar" ? "تم الكشف عن استضافة مستقلة (مثل Netlify)" : lang === "fr" ? "Hébergement Netlify détecté" : "Independent Hosting Detected"}</span>
              </p>
              <p className="text-amber-800 text-xs">
                {lang === "ar" 
                  ? "تحتاج ميزة ميكروفون الذكاء الاصطناعي (Gemini) والترجمة لخادم متصل فعال لترجمة الكلام بذكاء. اضغط على الزر لربطه فوراً بخادم المشروع السحابي." 
                  : lang === "fr" 
                  ? "L'IA nécessite un serveur actif. Cliquez sur le bouton pour l'associer au serveur de votre projet." 
                  : "AI features require an active Node.js server. Click to auto-connect to this project's Cloud Run backend server."}
              </p>
            </div>
            <button
              onClick={() => {
                setBackendUrl("https://ais-pre-rgz2jlhoc37bn4dhktpwbc-429842933088.europe-west2.run.app");
              }}
              className="px-4 py-2 bg-[#8C7A5C] hover:bg-[#73644A] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              ⚡ {lang === "ar" ? "ربط تلقائي فوري" : lang === "fr" ? "Lier le Backend IA" : "Auto-Link AI Cloud"}
            </button>
          </div>
        )}
        
        {/* TOP LEVEL HEADER PLATFORM */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E6DA] shadow-xs">
          <div className={`space-y-1.5 ${isRtl ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-12 h-12 rounded-full bg-[#5A5A40] flex items-center justify-center text-white shadow-xs shrink-0 pulsing-record">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#5A5A40]">
                  {dictionary.title}
                </h1>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#8C8C70]">
              {dictionary.tagline}
            </p>
          </div>

          {/* Quick Language Switcher */}
          <nav className={`flex items-center gap-1.5 bg-[#EBEBE0] p-1.5 rounded-2xl border border-[#D6D6C2] self-start md:self-auto ${
            isRtl ? "flex-row-reverse" : "flex-row"
          }`}>
            <button
               onClick={() => setLang("en")}
               className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                 lang === "en" 
                   ? "bg-white text-[#5A5A40] shadow-sm font-bold"
                   : "text-[#8C8C70] hover:bg-[#F2F2EB]"
               }`}
            >
              English
            </button>
            <button
               onClick={() => setLang("ar")}
               className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer font-arabic ${
                 lang === "ar"
                   ? "bg-white text-[#5A5A40] shadow-sm font-bold"
                   : "text-[#8C8C70] hover:bg-[#F2F2EB]"
               }`}
               style={{ minWidth: "75px" }}
            >
              العربية
            </button>
            <button
               onClick={() => setLang("fr")}
               className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                 lang === "fr" 
                   ? "bg-white text-[#5A5A40] shadow-sm font-bold"
                   : "text-[#8C8C70] hover:bg-[#F2F2EB]"
               }`}
            >
              Français
            </button>
          </nav>
        </header>

        {/* CONTROLLER SECTION / MODE NAVIGATION */}
        <div className="w-full bg-white rounded-3xl p-3 border border-[#E6E6DA] shadow-xs">
          <nav className={`flex flex-col sm:flex-row gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <button
              onClick={() => setActiveTab("phrases")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-bold font-display text-base transition-all cursor-pointer ${
                activeTab === "phrases" 
                  ? "bg-[#EBEBE0] text-[#5A5A40] border-2 border-[#D6D6C2] shadow-xs font-semibold animate-fade-in/10" 
                  : "text-[#8C8C70] hover:bg-[#F2F2EB] hover:text-[#5A5A40] border-2 border-transparent"
              }`}
            >
              <Smile className="w-5 h-5 shrink-0" />
              <span>{dictionary.tabPhrases}</span>
            </button>

            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-bold font-display text-base transition-all cursor-pointer ${
                activeTab === "custom" 
                  ? "bg-[#EBEBE0] text-[#5A5A40] border-2 border-[#D6D6C2] shadow-xs font-semibold animate-fade-in/10" 
                  : "text-[#8C8C70] hover:bg-[#F2F2EB] hover:text-[#5A5A40] border-2 border-transparent"
              }`}
            >
              <Keyboard className="w-5 h-5 shrink-0" />
              <span>{dictionary.tabCustom}</span>
            </button>

            <button
              onClick={() => setActiveTab("mic")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-bold font-display text-base transition-all cursor-pointer ${
                activeTab === "mic" 
                  ? "bg-[#EBEBE0] text-[#5A5A40] border-2 border-[#D6D6C2] shadow-xs font-semibold animate-fade-in/10" 
                  : "text-[#8C8C70] hover:bg-[#F2F2EB] hover:text-[#5A5A40] border-2 border-transparent"
              }`}
            >
              <Mic className="w-5 h-5 shrink-0 block" />
              <span>{dictionary.tabMicrophone}</span>
            </button>
          </nav>
        </div>

        {/* MAIN GAMEPLAY CONTENT CONTAINER */}
        <main className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] border border-[#E6E6DA] shadow-sm min-h-[420px]">
          {activeTab === "phrases" && (
            <PresetActions 
              lang={lang} 
              onSpeak={speak} 
              isSpeaking={isSpeaking} 
            />
          )}

          {activeTab === "custom" && (
            <TypeSpeak
              lang={lang}
              onSpeak={speak}
              onStop={handleStopSpeaking}
              isSpeaking={isSpeaking}
              textSpeed={textSpeed}
              setTextSpeed={setTextSpeed}
              textVolume={textVolume}
              setTextVolume={setTextVolume}
              fontSizeClass={getFontSizeClass()}
              backendUrl={backendUrl}
            />
          )}

          {activeTab === "mic" && (
            <MicAssist
              lang={lang}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              fontSizeClass={getFontSizeClass()}
              backendUrl={backendUrl}
            />
          )}
        </main>

        {/* SOUND TUNER & ACCESSIBILITY FOOTER TAB */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E6DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F0E6] pb-4">
            <div className={`space-y-0.5 ${isRtl ? "text-right" : "text-left"}`}>
              <h3 className="text-base font-bold font-display text-[#5A5A40] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#5A5A40]" />
                <span>{dictionary.settingsTitle}</span>
              </h3>
              <p className="text-xs text-[#8C8C70]">{dictionary.settingsDesc}</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-[#F5F5F0] hover:bg-[#EBEBE0] text-[#5A5A40] rounded-xl transition-colors cursor-pointer border border-[#E6E6DA]"
            >
              {showSettings ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {showSettings && (
            <div className="space-y-6 animate-fade-in/40">
              {/* Universal Font Size Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#4A4A35] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#5A5A40]" />
                  <span>{dictionary.fontSizeLabel} ({dictionary.huge})</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["small", "medium", "large", "huge"] as const).map((size) => {
                    const label = dictionary[size as keyof typeof dictionary] || size;
                    const isSelected = fontSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`py-3 px-4 font-bold rounded-xl border text-sm transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-[#EBEBE0] text-[#5A5A40] border-[#5A5A40] shadow-xs"
                            : "bg-white text-[#8C8C70] border-[#D6D6C2] hover:bg-[#F2F2EB]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Backend API Server Configuration for Netlify/External Hosting */}
              <div id="vocalassist_settings" className="space-y-3 pt-5 border-t border-[#F0F0E6] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="text-xs sm:text-sm font-bold text-[#4A4A35] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#5A5A40]" />
                    <span>{lang === "ar" ? "رابط خادم الذكاء الاصطناعي (مستخدمي Netlify):" : lang === "fr" ? "Serveur API IA (Hébergement externe) :" : "AI Backend Server URL (for Netlify/External) :"}</span>
                  </label>
                  {backendUrl !== "https://ais-pre-rgz2jlhoc37bn4dhktpwbc-429842933088.europe-west2.run.app" && (
                    <button
                      onClick={() => setBackendUrl("https://ais-pre-rgz2jlhoc37bn4dhktpwbc-429842933088.europe-west2.run.app")}
                      className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                    >
                      ✨ {lang === "ar" ? "ربط تلقائي بالخادم" : lang === "fr" ? "Connexion Auto" : "Auto-Connect to Cloud"}
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="E.g., https://vocal-assist-api.run.app (Optional - Defaults to hosting provider api)"
                    className="w-full px-4 py-3 bg-white border border-[#D6D6C2] rounded-xl text-xs sm:text-sm text-[#4A4A35] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    dir="ltr"
                  />
                  {backendUrl && (
                    <button
                      onClick={() => setBackendUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === "ar" ? "إلغاء الربط" : lang === "fr" ? "Réinitialiser" : "Reset"}
                    </button>
                  )}
                </div>
                
                <p className="text-[11px] text-[#8C8C70] leading-relaxed" dir={isRtl ? "rtl" : "ltr"}>
                  {lang === "ar" 
                    ? "إذا رفعت موقعك على Netlify بشكل مستقل، اترك الرابط فارغاً للاستخدام المحلي أو انقر فوق 'ربط تلقائي فوري' ليرتبط موقعك Netlify بخادم السحابي المعين للمشروع ليتولّى معالجة الصوت بذكاء وبثقة." 
                    : lang === "fr" 
                    ? "Si vous hébergez de manière autonome sur Netlify, laissez vide pour l'API locale ou cliquez au-dessus sur 'Connexion Auto'." 
                    : "If deploying securely on Netlify, leave empty for local routes or click 'Auto-Connect' to delegate audio processes directly to this app's secure Cloud Run instance."}
                </p>
              </div>

              {/* Instant Status Speaks Interrupter Overlay */}
              {isSpeaking && (
                <div className={`flex items-center justify-between bg-[#EBEBE0]/50 border border-[#D6D6C2] p-4 rounded-xl ${
                  isRtl ? "flex-row-reverse" : "flex-row"
                }`}>
                  <span className="text-xs font-semibold text-[#5A5A40] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40] animate-ping"></span>
                    <span>{lang === "ar" ? "جارٍ التحدث بالصوت الآن..." : lang === "fr" ? "Diction audio en cours..." : "Speaking audio output out loud..."}</span>
                  </span>
                  <button
                    onClick={handleStopSpeaking}
                    className="px-4 py-1.5 bg-[#A8A88F] hover:bg-[#96967D] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                  >
                    {dictionary.stopBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* DETAILED EMPATHIC CARE GUIDE */}
        <InfoGuide lang={lang} />

      </div>

      {/* SYSTEM DEVICE MICROPHONE DELEGATOR PROMPT MODAL */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#D6D6C2] shadow-2xl space-y-6 text-center animate-scale-up"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-[#EBEBE0] flex items-center justify-center text-[#5A5A40]">
              <Mic className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#5A5A40]">
                {permissionModalStrings[lang].title}
              </h3>
              <p className="text-sm text-[#8C8C70] leading-relaxed font-sans">
                {permissionModalStrings[lang].desc}
              </p>
            </div>

            {permissionStatus === "denied" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1 text-left" dir={isRtl ? "rtl" : "ltr"}>
                <p className="font-bold">
                  {lang === "ar" ? "⚠️ لم نتمكن من تفعيل الميكروفون تلقائياً" : lang === "fr" ? "⚠️ Accès microphone automatique bloqué" : "⚠️ Auto device request did not activate"}
                </p>
                <p>
                  {lang === "ar" 
                    ? "يرجى النقر فوق زر التفعيل الملون بالأسفل لفتح نافذة الهاتف الأصلية يدوياً، أو تأكد من إعدادات المتصفح لجهازك الحقيقي." 
                    : lang === "fr" 
                    ? "Veuillez cliquer sur le bouton ci-dessous pour forcer l'autorisation de votre navigateur ou de votre application." 
                    : "Please tap the main button below to force trigger your device device authorized prompt."}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => triggerDeviceMicPrompt(false)}
                disabled={isRequestingSysPrompt}
                className="w-full py-4 bg-[#5A5A40] hover:bg-[#3F3F2C] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRequestingSysPrompt ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{isRequestingSysPrompt ? permissionModalStrings[lang].status : permissionModalStrings[lang].btn}</span>
              </button>
              
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-2.5 bg-transparent hover:bg-[#F5F5F0] text-[#8C8C70] hover:text-[#5A5A40] font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                {permissionModalStrings[lang].skip}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
