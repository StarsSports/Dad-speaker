import React, { useState, useEffect } from "react";
import { Plus, Trash2, Volume2, Sparkles, Heart } from "lucide-react";
import { INSTANT_PHRASES, CATEGORIES, getPhraseIcon, LOCALIZATION, LanguageCode, Phrase } from "../data";

interface PresetActionsProps {
  lang: LanguageCode;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export default function PresetActions({ lang, onSpeak, isSpeaking }: PresetActionsProps) {
  const dictionary = LOCALIZATION[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customPhrases, setCustomPhrases] = useState<Phrase[]>([]);
  const [newPhraseText, setNewPhraseText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load custom phrases from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vocalassist_custom_phrases");
    if (saved) {
      try {
        setCustomPhrases(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom phrases", e);
      }
    }
  }, []);

  // Save custom phrases
  const saveCustomPhrases = (updated: Phrase[]) => {
    setCustomPhrases(updated);
    localStorage.setItem("vocalassist_custom_phrases", JSON.stringify(updated));
  };

  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    // Create a new phrase that has the text for all languages as a fallback,
    // or specifically matching the current language.
    const newPhrase: Phrase = {
      id: "custom_" + Date.now(),
      category: "needs", // put custom ones in basic needs
      iconName: "Heart",
      translations: {
        en: lang === "en" ? newPhraseText.trim() : newPhraseText.trim(),
        ar: lang === "ar" ? newPhraseText.trim() : newPhraseText.trim(),
        fr: lang === "fr" ? newPhraseText.trim() : newPhraseText.trim(),
      }
    };

    // If typing in one language, propagate to others as same text just as copy
    if (lang === "ar") {
      newPhrase.translations.en = `[In Arabic] ${newPhraseText.trim()}`;
      newPhrase.translations.fr = `[En Arabe] ${newPhraseText.trim()}`;
    } else if (lang === "fr") {
      newPhrase.translations.en = `[In French] ${newPhraseText.trim()}`;
      newPhrase.translations.ar = `[بالفرنسية] ${newPhraseText.trim()}`;
    } else {
      newPhrase.translations.ar = `[In English] ${newPhraseText.trim()}`;
      newPhrase.translations.fr = `[En Anglais] ${newPhraseText.trim()}`;
    }

    const updated = [...customPhrases, newPhrase];
    saveCustomPhrases(updated);
    setNewPhraseText("");
    setSuccessMessage(dictionary.saveSuccess);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteCustomPhrase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent speaking upon delete click
    const updated = customPhrases.filter(p => p.id !== id);
    saveCustomPhrases(updated);
  };

  // Combine prebuilt phrases with custom phrases
  const allPhrases = [...INSTANT_PHRASES, ...customPhrases];

  // Filter phrases based on category selection
  const filteredPhrases = selectedCategory === "all" 
    ? allPhrases 
    : allPhrases.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all border ${
            selectedCategory === "all"
              ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-md transform -translate-y-0.5"
              : "bg-white text-[#4A4A35] border-[#D6D6C2] hover:bg-[#F2F2EB]"
          }`}
        >
          {lang === "ar" ? "الكل" : lang === "fr" ? "Tout" : "All"}
        </button>

        {Object.entries(CATEGORIES).map(([catKey, cat]) => {
          const catName = lang === "ar" ? cat.ar : lang === "fr" ? cat.fr : cat.en;
          const CatIcon = cat.icon;
          const isSelected = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all border ${
                isSelected
                  ? `${cat.badgeColor} border-[#5A5A40] shadow-sm transform -translate-y-0.5 font-bold`
                  : "bg-white text-[#4A4A35] border-[#D6D6C2] hover:bg-[#F2F2EB]"
              }`}
            >
              <CatIcon className="w-4 h-4 shrink-0" />
              <span>{catName}</span>
            </button>
          );
        })}
      </div>

      {/* Grid instruction */}
      <p className="text-sm text-[#8C8C70] font-sans">
        {dictionary.speakOutputLabel}
      </p>

      {/* Main Grid of Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredPhrases.map((phrase) => {
          const phraseText = phrase.translations[lang] || phrase.translations["en"];
          const config = CATEGORIES[phrase.category];
          const IconComponent = getPhraseIcon(phrase.category, phrase.id);
          const isCustom = phrase.id.startsWith("custom_");

          return (
            <button
              key={phrase.id}
              onClick={() => onSpeak(phraseText)}
              className={`flex items-center justify-between p-5 rounded-2xl border text-left cursor-pointer transition-all shadow-sm group active:scale-95 duration-150 ${
                config.colors
              } ${lang === "ar" ? "text-right flex-row-reverse" : "text-left flex-row"}`}
              style={{ minHeight: "85px" }}
            >
              <div className={`flex items-center gap-4 ${lang === "ar" ? "flex-row-reverse text-right" : "flex-row"}`}>
                <div className="p-3 bg-white/70 rounded-xl shadow-xs shrink-0 text-current">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-base sm:text-lg font-bold font-display leading-snug break-words max-w-[180px] sm:max-w-[280px]">
                  {phraseText}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomPhrase(phrase.id, e)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="p-2 bg-white/80 rounded-full group-hover:bg-white group-hover:scale-110 transition-all text-current shadow-xs">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Custom Phrase Subsection */}
      <div className="border-t border-[#F0F0E6] pt-6 mt-8">
        <h4 className="text-sm font-semibold text-[#5A5A40] mb-3 flex items-center gap-2 font-display">
          <Heart className="w-4 h-4 text-[#5A5A40]" />
          <span>{dictionary.customPhrases}</span>
        </h4>

        <form onSubmit={handleAddCustomPhrase} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={newPhraseText}
            onChange={(e) => setNewPhraseText(e.target.value)}
            placeholder={dictionary.addPhrasePlaceholder}
            className="flex-1 px-4 py-3 bg-white border border-[#D6D6C2] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-[#4A4A35] shadow-xs"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#5A5A40] text-white rounded-xl hover:bg-[#3F3F2C] transition-colors font-semibold text-sm shadow-xs shrink-0 cursor-pointer hover:shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {successMessage && (
          <p className="text-[#5A5A40] text-xs mt-2 font-medium animate-fade-in">
            ✓ {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}
