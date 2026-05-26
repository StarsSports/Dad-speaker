import React from "react";
import { BookOpen, HelpCircle } from "lucide-react";
import { LOCALIZATION, LanguageCode } from "../data";

interface InfoGuideProps {
  lang: LanguageCode;
}

export default function InfoGuide({ lang }: InfoGuideProps) {
  const dictionary = LOCALIZATION[lang];

  return (
    <div className="bg-[#EBEBE0]/30 border border-[#D6D6C2] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4 text-[#5A5A40]">
        <HelpCircle className="w-6 h-6 shrink-0" />
        <h3 className="text-lg font-bold font-display">{dictionary.howItWorks}</h3>
      </div>
      
      <div className="space-y-3 text-sm text-[#4A4A35]/90 leading-relaxed font-sans">
        <p className="flex items-start gap-2">
          <span className="bg-[#5A5A40] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
          <span>{dictionary.introStep1}</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="bg-[#5A5A40] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
          <span>{dictionary.introStep2}</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="bg-[#5A5A40] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
          <span>{dictionary.introStep3}</span>
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-[#D6D6C2]/60 flex items-center justify-between text-xs text-[#8C8C70]">
        <span>{dictionary.disclaimer}</span>
        <span className="font-mono bg-[#EBEBE0] px-2 py-0.5 rounded">v1.2 Realtime</span>
      </div>
    </div>
  );
}
