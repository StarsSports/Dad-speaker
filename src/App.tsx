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
  Type
} from "lucide-react";
import { speakText, stopSpeaking } from "./speechEngine";
import { LOCALIZATION, LanguageCode } from "./data";
import PresetActions from "./components/PresetActions";
import TypeSpeak from "./components/TypeSpeak";
import MicAssist from "./components/MicAssist";
import InfoGuide from "./components/InfoGuide";

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
            />
          )}

          {activeTab === "mic" && (
            <MicAssist
              lang={lang}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              fontSizeClass={getFontSizeClass()}
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
    </div>
  );
}
