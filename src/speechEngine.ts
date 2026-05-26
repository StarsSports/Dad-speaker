import { LanguageCode } from "./data";

export function getSystemVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Speaks the provided text using the browser's speechSynthesis API with customized language, rate, and volume.
 */
export function speakText(
  text: string, 
  lang: LanguageCode, 
  rate: number, 
  volume: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onError) onError("Speech synthesis is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language code
  if (lang === "ar") {
    utterance.lang = "ar-EG"; // default Arabic
  } else if (lang === "fr") {
    utterance.lang = "fr-FR"; // default French
  } else {
    utterance.lang = "en-US"; // default English
  }

  // Find a voice that matches the target language exactly
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(voice => {
    const voiceLang = voice.lang.toLowerCase();
    if (lang === "ar") return voiceLang.startsWith("ar");
    if (lang === "fr") return voiceLang.startsWith("fr");
    return voiceLang.startsWith("en");
  });

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Configure speed and volume
  utterance.rate = rate;
  utterance.volume = volume;

  // Event binders
  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    console.error("Speech error", e);
    if (onEnd) onEnd();
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any currently playing voice
 */
export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
