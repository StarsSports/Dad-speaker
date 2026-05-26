import React, { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, RefreshCw, Volume2, Sparkles, HelpCircle, CornerDownLeft, AlertTriangle } from "lucide-react";
import { LOCALIZATION, LanguageCode } from "../data";

interface MicAssistProps {
  lang: LanguageCode;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  fontSizeClass: string;
}

export default function MicAssist({ lang, onSpeak, isSpeaking, fontSizeClass }: MicAssistProps) {
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
            const response = await fetch("/api/transcribe", {
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

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || "Failed to parse whispers.");
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
            if (apiErr.message?.includes("GEMINI_API_KEY")) {
              setErrorMessage("AI key not configured on our server yet. Please head to Settings > Secrets or check with your developer.");
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

      {/* Errors displays */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-[#FAF2F2] border-2 border-[#EBD5D5] rounded-2xl text-[#A85C5C] text-sm max-w-lg mx-auto font-sans shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#A85C5C] mt-0.5" />
          <div>
            <span className="font-bold">Notice:</span> {errorMessage}
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
