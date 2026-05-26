import React, { useState } from "react";
import { Volume2, VolumeX, Trash2, Languages, RefreshCw, Type } from "lucide-react";
import { LOCALIZATION, LanguageCode } from "../data";

interface TypeSpeakProps {
  lang: LanguageCode;
  onSpeak: (text: string) => void;
  onStop: () => void;
  isSpeaking: boolean;
  textSpeed: number;
  setTextSpeed: (speed: number) => void;
  textVolume: number;
  setTextVolume: (vol: number) => void;
  fontSizeClass: string;
}

export default function TypeSpeak({
  lang,
  onSpeak,
  onStop,
  isSpeaking,
  textSpeed,
  setTextSpeed,
  textVolume,
  setTextVolume,
  fontSizeClass
}: TypeSpeakProps) {
  const dictionary = LOCALIZATION[lang];
  const [typedText, setTypedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");

  const handleSpeak = () => {
    if (!typedText.trim()) return;
    onSpeak(typedText);
  };

  const handleClear = () => {
    setTypedText("");
    setTranslationError("");
  };

  // Safe client-side translation using our backend API
  const handleTranslateTo = async (targetLang: LanguageCode) => {
    if (!typedText.trim()) return;
    setIsTranslating(true);
    setTranslationError("");

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: typedText,
          targetLanguage: targetLang
        })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to translate");
      }

      const result = await resp.json();
      if (result.text) {
        setTypedText(result.text);
      }
    } catch (err: any) {
      console.error(err);
      setTranslationError(err.message || "Could not contact translation server.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Helpful short tap-inserts (helps him speak without typing full sentences)
  const shortcuts = lang === "ar" 
    ? ["نعم", "لا", "ربما", "انتظر", "تعال هنا", "أريدك", "شكراً لك", "الماء"]
    : lang === "fr"
      ? ["Oui", "Non", "Peut-être", "Attends", "Viens ici", "S'il te plaît", "Merci", "De l'eau"]
      : ["Yes", "No", "Maybe", "Wait", "Come here", "Please", "Thank you", "Water"];

  const handleShortcutClick = (word: string) => {
    setTypedText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return word;
      // Add sensible punctuation spacing
      if (lang === "ar") {
        return trimmed + " و " + word;
      }
      return trimmed + " " + word;
    });
  };

  const isRtl = lang === "ar";

  return (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
        <label className="text-sm font-semibold text-[#4A4A35] font-display flex items-center gap-2">
          <Type className="w-4 h-4 text-[#5A5A40]" />
          <span>{dictionary.placeholderType}</span>
        </label>

        {/* Big Accessible Text Box */}
        <textarea
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder={dictionary.placeholderType}
          dir={isRtl ? "rtl" : "ltr"}
          className={`w-full min-h-[160px] p-5 bg-white border border-[#D6D6C2] rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-[#EBEBE0]/50 focus:border-[#5A5A40] font-medium ${fontSizeClass} ${
            isRtl ? "text-right font-arabic" : "text-left font-sans"
          }`}
        />

        {/* Translation failure warnings */}
        {translationError && (
          <p className="text-rose-600 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100">
            ⚠ {translationError}
          </p>
        )}

        {/* Quick-insert Single Taps */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[#8C8C70] font-sans mr-2">
            {lang === "ar" ? "إضافات سريعة:" : lang === "fr" ? "Insérer rapidement :" : "Quick Taps:"}
          </span>
          {shortcuts.map((word) => (
            <button
               key={word}
               type="button"
               onClick={() => handleShortcutClick(word)}
               className="px-3 py-1.5 bg-[#F5F5F0] hover:bg-[#EBEBE0] hover:text-[#5A5A40] text-[#4A4A35] text-xs sm:text-sm font-semibold rounded-lg border border-[#D6D6C2] transition-colors cursor-pointer active:scale-95"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Controls Board */}
        <div className={`flex flex-wrap items-center gap-3 mt-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          {/* Speak Button */}
          <button
            onClick={handleSpeak}
            disabled={!typedText.trim()}
            className={`flex items-center gap-2 px-8 py-4 bg-[#5A5A40] hover:bg-[#3F3F2C] text-white font-bold text-lg rounded-2xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Volume2 className="w-5 h-5 shrink-0" />
            <span>{dictionary.speakBtn}</span>
          </button>

          {/* Stop Diction */}
          <button
            onClick={onStop}
            disabled={!isSpeaking}
            className="flex items-center gap-2 px-5 py-4 bg-[#A8A88F] hover:bg-[#96967D] text-white font-bold text-lg rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
          >
            <VolumeX className="w-5 h-5 shrink-0" />
            <span>{dictionary.stopBtn}</span>
          </button>

          {/* Clear Arena */}
          <button
            onClick={handleClear}
            disabled={!typedText.trim()}
            className="flex items-center gap-2 px-4 py-4 bg-[#F5F5F0] hover:bg-[#EBEBE0] text-[#4A4A35] border border-[#D6D6C2] font-bold text-lg rounded-2xl transition-all active:scale-95 cursor-pointer disabled:opacity-30"
          >
            <Trash2 className="w-5 h-5 shrink-0" />
          </button>

          {/* AI Translator Bridge */}
          <div className={`flex items-center gap-1 bg-[#EBEBE0]/50 p-1.5 rounded-xl border border-[#D6D6C2] ml-auto ${isRtl ? "mr-auto ml-0" : ""}`}>
            <span className="text-xs text-[#5A5A40] font-medium px-2 flex items-center gap-1 font-display">
              {isTranslating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              <span>{lang === "ar" ? "ترجم لـ:" : lang === "fr" ? "Traduire en :" : "Translate to:"}</span>
            </span>

            {/* Language translations buttons */}
            {lang !== "en" && (
              <button
                type="button"
                onClick={() => handleTranslateTo("en")}
                disabled={isTranslating}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-[#D6D6C2] hover:bg-[#F2F2EB] text-[#5A5A40] transition-colors"
              >
                EN
              </button>
            )}
            {lang !== "ar" && (
              <button
                type="button"
                onClick={() => handleTranslateTo("ar")}
                disabled={isTranslating}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-[#D6D6C2] hover:bg-[#F2F2EB] text-[#5A5A40] font-arabic transition-colors"
              >
                عربي
              </button>
            )}
            {lang !== "fr" && (
              <button
                type="button"
                onClick={() => handleTranslateTo("fr")}
                disabled={isTranslating}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-[#D6D6C2] hover:bg-[#F2F2EB] text-[#5A5A40] transition-colors"
              >
                FR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice Tuning Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#E6E6DA] shadow-xs">
        {/* Speed Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#8C8C70] font-display">
            <span>{dictionary.textSpeed}</span>
            <span className="font-mono text-[#5A5A40]">{textSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.7"
            step="0.1"
            value={textSpeed}
            onChange={(e) => setTextSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#EBEBE0] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
          />
        </div>

        {/* Volume Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#8C8C70] font-display">
            <span>{dictionary.textVolume}</span>
            <span className="font-mono text-[#5A5A40]">{Math.round(textVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={textVolume}
            onChange={(e) => setTextVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#EBEBE0] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
          />
        </div>
      </div>
    </div>
  );
}
