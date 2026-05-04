import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '' });

export async function analyzeLink(link: string, serviceName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Analyze this link: ${link} for the service: ${serviceName}. Is it a valid link for this service? Provide a brief confirmation or warning.`,
      config: {
        systemInstruction: "You are an SMM panel assistant. Help users verify if their links are correct for the services they are ordering.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Could not analyze link at this time.";
  }
}

export async function getChatResponse(message: string, _history: { role: string, parts: { text: string }[] }[]) {
  try {
    const chat = ai.chats.create({
      model: "gemini-1.5-flash",
      config: {
        systemInstruction: "You are Growplex SMM Panel support AI. Help users with placing orders, understanding services, checking order status, and adding wallet funds. All prices are in INR. Be helpful and concise.",
      }
    });
    
    // Note: In a real app, we'd pass history to the chat object.
    // For simplicity in this demo, we'll just send the message.
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
