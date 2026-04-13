
import { GoogleGenAI, Type } from "@google/genai";
import { YouTubeContent } from "../types";

const CATEGORY_MAP: Record<string, string> = {
  'Seni dan Hiburan': '3',
  'Musik': '35'
};

export const generateYouTubeContent = async (topic: string, countryCode: string, category: string, isFuturePrediction: boolean = false): Promise<YouTubeContent> => {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const catId = CATEGORY_MAP[category] || '3';
  
  const prompt = `
    TASK: ${isFuturePrediction ? 'FUTURE TREND PREDICTION (Next 7-30 Days)' : 'REAL-TIME YOUTUBE TREND ANALYSIS (Last 24 Hours)'}.
    Location: "${countryCode}"
    Category: "${category}" (Google Trends Category ID: ${catId})
    User Topic: "${topic}"
    
    DATA INSTRUCTIONS:
    1. Use Google Search to analyze real-time data from YouTube and Google Trends.
    2. Identify "Rising Queries" and "Breakout Topics" related to "${topic}".
    3. Cross-reference with TikTok and other viral platforms.
    
    CONTENT REQUIREMENTS:
    - 3 Viral Titles (90-100 chars).
    - Interest scores (0-100) for: youtube, deepseek, google, duckduckgo, tiktok, snackvideo.
    - Trending potential (0-100) for each title.
    - SEO Description (2500-3000 chars).
    - Platform Tags (Hashtags).
    - Metadata Tags (Comma separated).

    Tone: Professional, Viral, Aesthetic.
    Language: Indonesian (Bahasa Indonesia).
  `;

  const generateContent = async (useGrounding: boolean) => {
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: useGrounding ? [{ googleSearch: {} }] : [],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            titlePercentages: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            youtubeTrendingScores: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            description: { type: Type.STRING },
            platformTags: { type: Type.STRING },
            metadataTags: { type: Type.STRING },
            platformScores: {
              type: Type.OBJECT,
              properties: {
                youtube: { type: Type.NUMBER },
                deepseek: { type: Type.NUMBER },
                google: { type: Type.NUMBER },
                duckduckgo: { type: Type.NUMBER },
                tiktok: { type: Type.NUMBER },
                snackvideo: { type :Type.NUMBER }
              },
              required: ["youtube", "deepseek", "google", "duckduckgo", "tiktok", "snackvideo"]
            }
          },
          required: ["titles", "titlePercentages", "youtubeTrendingScores", "description", "platformTags", "metadataTags", "platformScores"]
        }
      }
    });
  };

  let response;
  try {
    // First attempt with grounding
    response = await generateContent(true);
  } catch (apiError: any) {
    console.error("Gemini API Error (Attempt 1 - Grounding):", apiError);
    
    // If quota error, retry WITHOUT grounding as a fallback
    if (apiError.message?.includes("429") || apiError.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Quota exceeded for Grounding. Retrying without Google Search...");
      try {
        response = await generateContent(false);
      } catch (fallbackError: any) {
        console.error("Gemini API Error (Attempt 2 - Fallback):", fallbackError);
        throw new Error("QUOTA_EXCEEDED: Kuota API Gemini Anda telah habis (termasuk batas harian gratis). Silakan periksa paket penagihan Anda.");
      }
    } else {
      throw new Error("Gagal menghubungi AI. Silakan coba lagi nanti.");
    }
  }

  try {
    const content = JSON.parse(response.text || '{}') as YouTubeContent;
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      content.groundingSources = groundingChunks
        .filter(chunk => chunk.web?.title && chunk.web?.uri)
        .map(chunk => ({
          title: chunk.web!.title!,
          url: chunk.web!.uri!
        }));
    }

    return content;
  } catch (parseError) {
    console.error("Error parsing Gemini response:", parseError);
    throw new Error("Gagal mengolah data dari AI. Silakan coba lagi.");
  }
};
