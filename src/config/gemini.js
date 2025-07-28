import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// ✅ Load all API keys
const API_KEYS = Array.from({ length: 160 }, (_, i) =>
  import.meta.env[`VITE_GEMINI_API_KEY_${i + 1}`]
).filter(Boolean); // filters out undefined keys

const generationConfig = {
  temperature: 0.75,
  topP: 0.85,
  topK: 60,
  maxOutputTokens: 5000,
  responseMimeType: "text/plain",
};

async function run(prompt) {
  const totalKeys = API_KEYS.length;
  const startIndex = Math.floor(Math.random() * totalKeys); // 🔀 Random starting point

  for (let offset = 0; offset < totalKeys; offset++) {
    const currentIndex = (startIndex + offset) % totalKeys;
    const apiKey = API_KEYS[currentIndex];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);
      const response = result.response.text();

      if (response) return response; // ✅ Success

    } catch (error) {
      console.warn(`API Key ${currentIndex + 1} failed: ${error.message}`);
      // try next key
    }
  }

  // ❌ All keys failed
  throw new Error("All API keys exhausted or failed.");
}

export default run;