import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Lazy-initialization utility for Gemini API client to prevent crash on startup if API key is missing
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure your API key in the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Large limit for body parser to allow base64 strings of recorded audio
  app.use(express.json({ limit: "20mb" }));

  // API route for speech-to-text powered by Gemini AI
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio, mimeType, language } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Missing audio data." });
      }

      const client = getGeminiClient();

      // Formulate a helpful description prompt to optimize whisper transcription
      const systemPrompt = `You are an expert, highly empathetic assistive listener for a beloved family member (a father who is currently very sick and speaks in a very quiet, faint, or whispered voice). 
Your task is to transcribe exactly what he is trying to say from this voice recording.
The user states the intended language is ${language || "English"}.
Please listen with extreme care:
- Capture the primary spoken message even if there is heavy static, high system gain, or breathing noises.
- If he speaks softly, correct minor pronunciation glitches that happen because he is weak, but do not change the core meaning of his words.
- Provide ONLY the text of the transcription. Do not include any filler text, preambles like "Here is the transcription", explanations, or conversational remarks.
- If it's completely silent or incomprehensible static, return precisely '[Unclear whisper]'.`;

      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audio, // Base64 string from client
        },
      };

      const result = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          audioPart,
          { text: systemPrompt },
        ],
      });

      const transcription = result.text || "";
      res.json({ text: transcription.trim() });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred during transcription",
        isConfigError: error.message?.includes("GEMINI_API_KEY")
      });
    }
  });

  // API route for real-time translation powered by Gemini AI
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Missing text to translate." });
      }

      const client = getGeminiClient();

      let langName = "English";
      if (targetLanguage === "ar") langName = "Arabic";
      if (targetLanguage === "fr") langName = "French";

      const systemPrompt = `You are a helpful and supportive medical/family communication assistant.
Translate the following text into ${langName}.
Provide ONLY the translated text. Do not include any wrappers, notes, conversational text, or explanations.
Make the translation natural, comfortable, and warm, suitable for an elder sick father communicating. If it is in Arabic, use simple, easily-read wording.`;

      const result = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: systemPrompt },
          { text: text }
        ],
      });

      const translation = result.text || "";
      res.json({ text: translation.trim() });
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred during translation",
        isConfigError: error.message?.includes("GEMINI_API_KEY")
      });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
