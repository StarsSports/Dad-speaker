import React, { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, RefreshCw, Volume2, Sparkles, HelpCircle, CornerDownLeft, AlertTriangle } from "lucide-react";
import { LOCALIZATION, LanguageCode } from "../data";

interface MicAssistProps {
  lang: LanguageCode;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  fontSizeClass: string;
  backendUrl?: string;
}

export default function MicAssist({ lang, onSpeak, isSpeaking, fontSizeClass, backendUrl }: MicAssistProps) {
  const dictionary = LOCALIZATION[lang];
  const [useAiMode, setUseAiMode] = useState<boolean>(true); // Default to Gemini AI Whisperer (highly accurate for very soft speech)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const durationTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const standardRecognizerRef = useRef<any>(null);

  // Clean timers on exit
  useEffect(() => {
    return () => {
      stopDurationTimer();
      if (standardRecognizerRef.current) {
        try {
          standardRecognizerRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startDurationTimer = () => {
    setRecordingDuration(0);
    durationTimerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 1. Core Logic: STANDARD BROWSER SPEECH RECOGNITION (Fallback mode)
  const handleStandardSpeechStart = () => {
    setErrorMessage("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage(dictionary.noSpeechApiSupport);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Map lang property appropriately
      if (lang === "ar") recognition.lang = "ar-EG";
      else if (lang === "fr") recognition.lang = "fr-FR";
      else recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        startDurationTimer();
        setTranscribedText("");
      };

      recognition.onresult = (event: any) => {
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          } else {
            finalResult += event.results[i][0].transcript;
          }
        }
        if (finalResult) {
          setTranscribedText(finalResult);
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Standard speech recognition error:", e);
        if (e.error === "not-allowed") {
          setErrorMessage(dictionary.recordFailed);
        } else {
          setErrorMessage(`Recognition issue: ${e.error || e.message || "Unknown error"}`);
        }
        setIsRecording(false);
        stopDurationTimer();
      };

      recognition.onend = () => {
        setIsRecording(false);
        stopDurationTimer();
      };

      standardRecognizerRef.current = recognition;
      recognition.start();

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Fail starting standard mic.");
    }
  };

  const handleStandardSpeechStop = () => {
    if (standardRecognizerRef.current) {
      try {
        standardRecognizerRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    stopDurationTimer();
  };


  // 2. Core Logic: GEMINI ENHANCED AI WHISPER CAPTURE (Uses MediaRecorder & Server API)
  const handleAiWhisperStart = async () => {
    setErrorMessage("");
    setTranscribedText("");
    audioChunksRef.current = [];

    try {
      // Prompt user to grant permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Dynamically select best supported format for browser stability
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        options = { mimeType: "audio/wav" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        stopDurationTimer();

        // Join chunks
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || "audio/webm" 
        });

        // Convert audio blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64String = (reader.result as string).split(",")[1];
            
            // Post payload to backend transcription API
            const apiEndpoint = backendUrl 
              ? `${backendUrl.replace(/\/$/, "")}/api/transcribe` 
              : "/api/transcribe";

            const response = await fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                audio: base64String,
                mimeType: audioBlob.type,
                language: lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "English"
              })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
              throw new Error("STATIC_HOST_ERROR: Static page returned. Netlify / Vercel single-page-apps do not run the Node.js backend. Scroll down to Settings and press the 'Auto-Link AI Cloud' button to automatically link with your project's hosted Gemini server!");
            }

            if (!response.ok) {
              let errText = "Failed to parse whispers.";
              try {
                const errData = await response.json();
                errText = errData.error || errText;
              } catch (e) {
                const rawText = await response.text();
                if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
                  throw new Error("STATIC_HOST_ERROR: Static page returned. Netlify / Vercel single-page-apps do not run the Node.js backend. Scroll down to Settings and press the 'Auto-Link' button to connect!");
                }
              }
              throw new Error(errText);
            }

            const data = await response.json();
            if (data.text) {
              // Set the giant visual rendering
              setTranscribedText(data.text);
              // Auto-speak out loud so the family can instantly hear it!
              if (data.text !== "[Unclear whisper]" && data.text.length > 0) {
                onSpeak(data.text);
              }
            } else {
              setTranscribedText("[Unclear whisper]");
            }
          } catch (apiErr: any) {
            console.error("Transcribe API error:", apiErr);
            const msg = apiErr.message || "";
            if (msg.includes("GEMINI_API_KEY")) {
              setErrorMessage("AI key not configured on our server yet. Please head to Settings > Secrets or check with your developer.");
            } else if (msg.includes("Unexpected token") || msg.includes("is not valid JSON") || msg.includes("STATIC_HOST_ERROR") || msg.includes("DOCTYPE")) {
              setErrorMessage(
                lang === "ar"
                  ? "تنبيه استضافة مستقلة (مثل Netlify): تم إرجاع صفحة HTML بدلاً من ملف البرمجة. يرجى التمرير لأسفل لـ 'الإعدادات' والضغط على 'ربط تلقائي فوري' ليتمكن هذا الرابط من معالجة صوتك بذكاء."
                  : lang === "fr"
                  ? "Erreur d'hébergement Netlify : Page HTML renvoyée. Faites défiler vers le bas pour cliquer sur 'Connexion Auto' dans les paramètres pour rediriger vers votre serveur."
                  : "Independent hosting detected (Netlify). Please scroll down to Settings and tap 'Auto-Connect' or 'Auto-Link AI Cloud' to securely delegate whisper voices to your project's server."
              );
            } else {
              setErrorMessage(apiErr.message || "An error occurred while cleaning your voice trace.");
            }
          } finally {
            setIsProcessing(false);
          }
        };

        // Shut down streaming channels gracefully
        stream.getTracks().forEach(track => track.stop());
      };

      // Start actual listening loop
      mediaRecorder.start();
      setIsRecording(true);
      startDurationTimer();

    } catch (err: any) {
      console.error("Microphone capture issue:", err);
      setErrorMessage(dictionary.recordFailed);
      setIsRecording(false);
      stopDurationTimer();
    }
  };

  const handleAiWhisperStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Main Action Toggles
  const handleMicrophoneToggle = () => {
    if (isRecording) {
      if (useAiMode) handleAiWhisperStop();
      else handleStandardSpeechStop();
    } else {
      if (useAiMode) handleAiWhisperStart();
      else handleStandardSpeechStart();
    }
  };

  const handleSpeakTranscribedText = () => {
    if (transcribedText) {
      onSpeak(transcribedText);
    }
  };

  const isRtl = lang === "ar";

  return (
    <div className="space-y-6">
      {/* Recording Mode Indicator */}
      <div className="flex bg-[#EBEBE0] p-1.5 rounded-2xl border border-[#D6D6C2] w-full max-w-sm mx-auto">
        <button
          onClick={() => {
            if (isRecording) return;
            setUseAiMode(true);
            setErrorMessage("");
          }}
          disabled={isRecording}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none cursor-pointer ${
            useAiMode 
              ? "bg-white text-[#5A5A40] shadow-md font-bold" 
              : "text-[#8C8C70] hover:bg-[#F2F2EB]"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{dictionary.aiMic}</span>
        </button>

        <button
          onClick={() => {
            if (isRecording) return;
            setUseAiMode(false);
            setErrorMessage("");
          }}
          disabled={isRecording}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none cursor-pointer ${
            !useAiMode 
              ? "bg-white text-[#5A5A40] shadow-md font-bold" 
              : "text-[#8C8C70] hover:bg-[#F2F2EB]"
          }`}
        >
          <Mic className="w-4 h-4 shrink-0" />
          <span>{dictionary.browserSpeechRecognition}</span>
        </button>
      </div>

      {/* Mode explanations */}
      <div className="text-center font-sans max-w-md mx-auto">
        {useAiMode ? (
          <p className="text-xs text-[#5A5A40] bg-[#EBEBE0]/40 border border-[#D6D6C2] p-2.5 rounded-xl">
            ✨ <strong>{dictionary.aiCorrectEnabled}:</strong> {dictionary.aiCorrectDesc}
          </p>
        ) : (
          <p className="text-xs text-[#8C8C70]">
            🎙️ Runs locally in standard voice mode without server processing. Useful for clear speech tones.
          </p>
        )}
      </div>

      {/* Giant Microphone button */}
      <div className="flex flex-col items-center justify-center py-6">
        <button
          onClick={handleMicrophoneToggle}
          disabled={isProcessing}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl hover:shadow-2xl relative cursor-pointer outline-none active:scale-95 disabled:opacity-50 ${
            isRecording 
              ? "bg-[#A85C5C] hover:bg-[#8C4F4F] pulsing-record border-4 border-[#EBD5D5]"
              : "bg-[#5A5A40] hover:bg-[#3F3F2C]"
          }`}
        >
          {isRecording ? (
            <StopCircle className="w-14 h-14" />
          ) : (
            <Mic className="w-14 h-14" />
          )}
          
          {/* Duration counter */}
          {isRecording && (
            <span className="absolute bottom-4 text-xs font-mono font-bold tracking-widest text-red-50 animate-pulse">
              {formatDuration(recordingDuration)}
            </span>
          )}
        </button>

        <p className="text-xs font-semibold text-[#8C8C70] font-display mt-4 min-h-[16px]">
          {isRecording 
            ? dictionary.listeningStatus 
            : isProcessing 
              ? dictionary.processingStatus 
              : dictionary.micInstruction}
        </p>
      </div>

      {/* Loading states */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-4 text-[#5A5A40]">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-semibold font-display">{dictionary.processingStatus}...</span>
        </div>
      )}

      {/* Errors displays with Guided Accessibility Troubleshooter */}
      {errorMessage && (
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="flex items-start gap-3 p-4 bg-[#FAF2F2] border-2 border-[#EBD5D5] rounded-2xl text-[#A85C5C] text-sm font-sans shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#A85C5C] mt-0.5" />
            <div>
              <span className="font-bold">Notice:</span> {errorMessage}
            </div>
          </div>

          {/* Localized Empathetic Step-By-Step Advisor */}
          <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl p-5 text-sm space-y-3 shadow-xs text-left" dir={isRtl ? "rtl" : "ltr"}>
            <h5 className="font-bold font-display text-[#8C7A5C] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#8C7A5C]" />
              {lang === "ar" ? "كيفية حل مشكلة الميكروفون وسماح الإذن:" : lang === "fr" ? "Comment activer l'accès au microphone :" : "How to enable/fix Microphone Access:"}
            </h5>
            
            <ul className="space-y-2.5 text-xs text-[#8C7A5C]/90 list-disc list-inside leading-relaxed pl-1">
              <li>
                <strong>{lang === "ar" ? "تنشيط فوري:" : lang === "fr" ? "Refresh instantané :" : "Instant fix:"} </strong>
                {lang === "ar" ? "اضغط على زر إعادة التحميل أدناه، وعند ظهور النافذة المنبثقة اضغط على 'سماح'." : lang === "fr" ? "Appuyez sur 'Recharger la page' ci-dessous et cliquez sur 'Autoriser'." : "Tap 'Reload Page' below and make sure to select 'Allow/Smahh' on the prompt."}
              </li>

              {isRtl ? (
                <>
                  <li>
                    <strong>هواتف آيفون (iPhone):</strong> اذهب إلى تطبيق <span className="font-bold">الإعدادات</span> {">"} <span className="font-bold">Safari</span> {">"} وانزل لـ <span className="font-bold">الميكروفون</span> {">"} واختر <span className="font-bold opacity-90">'سماح'</span>.
                  </li>
                  <li>
                    <strong>هواتف أندرويد (Android):</strong> من متصفح Chrome، اضغط على النقاط الثلاث {">"} <span className="font-bold">الإعدادات</span> {">"} <span className="font-bold">إعدادات المواقع</span> {">"} <span className="font-bold">الميكروفون</span> وقم بتفعيله.
                  </li>
                  <li>
                    <strong>استخدام تطبيق خارجي (فيسبوك/إنستغرام):</strong> إذا فتحت الرابط من داخل إنستغرام أو فيسبوك، اضغط على قائمة الثلاث نقاط أعلى الزاوية واشترط <span className="font-bold">'الفتح في متصفح خارجي' (Safari أو Chrome)</span> ليعمل الميكرفون معك بشكل سليم.
                  </li>
                </>
              ) : lang === "fr" ? (
                <>
                  <li>
                    <strong>Sur iPhone / PWA :</strong> Allez dans les <span className="font-bold">Réglages</span> {">"} <span className="font-bold">Safari</span> {">"} défilez vers le bas jusqu'à <span className="font-bold">Microphone</span>, puis sélectionnez <span className="font-bold">'Autoriser'</span>.
                  </li>
                  <li>
                    <strong>Sur Android :</strong> Dans Chrome, appuyez sur les 3 points {">"} <span className="font-bold">Paramètres</span> {">"} <span className="font-bold">Paramètres des sites</span> {">"} <span className="font-bold">Microphone</span>, puis activez l'autorisation pour ce site.
                  </li>
                  <li>
                    <strong>Navigateur In-App (Facebook/Instagram) :</strong> Chuchoter est bloqué par les navigateurs internes. Cliquez sur les options de partage et choisissez <span className="font-bold">'Ouvrir dans Safari/Chrome'</span>.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Apple iPhone/iPad:</strong> Open your iOS <span className="font-bold">Settings app</span> {">"} go to <span className="font-bold">Safari</span> {">"} scroll down to <span className="font-bold">Microphone</span> and set it to <span className="font-bold">'Allow'</span> or <span className="font-bold">'Ask'</span>.
                  </li>
                  <li>
                    <strong>Android Mobile:</strong> On your Chrome browser, click the 3 dots in the corner {">"} <span className="font-bold">Settings</span> {">"} <span className="font-bold">Site settings</span> {">"} <span className="font-bold">Microphone</span> and toggle to grant permission.
                  </li>
                  <li>
                    <strong>In-App Browsers:</strong> If you opened this inside Instagram, Messenger, or Facebook context, click the menu button in the corner and choose <span className="font-bold">'Open in Safari/Chrome'</span> to enable system microphone access.
                  </li>
                </>
              )}
            </ul>

            <div className="pt-2 border-t border-[#EBE3D5]/60 flex justify-end">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-[#8C7A5C] text-white hover:bg-[#73644A] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "🔄 إعادة تحميل وتجربة الإذن" : lang === "fr" ? "🔄 Recharger la page" : "🔄 Reload Page & Retry"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Output Display Area */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div 
          className={`w-full min-h-[160px] p-6 bg-white/75 backdrop-blur-md rounded-3xl border border-[#E6E6DA] shadow-sm flex flex-col justify-between ${
            isRtl ? "text-right font-arabic" : "text-left font-sans"
          }`}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Output text */}
          <div className="flex-1">
            <h5 className="text-xs font-bold text-[#8C8C70] mb-2 font-display uppercase tracking-wider">
              {lang === "ar" ? "الكلام المكتوب والمقروء" : lang === "fr" ? "Texte Transcrit" : "Transcribed Text"}
            </h5>
            
            <p className={`font-bold transition-all leading-normal ${fontSizeClass} ${
              transcribedText ? "text-[#4A4A35]" : "text-[#D6D6C2] italic"
            }`}>
              {transcribedText || dictionary.emptyTranscription}
            </p>
          </div>

          {/* Speak / Copy panel */}
          {transcribedText && (
            <div className={`flex gap-3 mt-6 pt-4 border-t border-[#F0F0E6] ${isRtl ? "flex-row" : "flex-row"}`}>
              <button
                onClick={handleSpeakTranscribedText}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] hover:bg-[#3F3F2C] text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer text-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>{lang === "ar" ? "نطق بصوت مرتفع" : lang === "fr" ? "Énoncer à voix haute" : "Speak Aloud"}</span>
              </button>

              <button
                onClick={() => {
                  setTranscribedText("");
                  setErrorMessage("");
                }}
                className="px-4 py-3 bg-[#F5F5F0] hover:bg-[#EBEBE0] text-[#4A4A35] border border-[#D6D6C2] font-semibold rounded-xl transition-colors cursor-pointer text-sm"
              >
                {dictionary.clearBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
