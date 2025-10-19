import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompt that strictly defines the AI's role
const SYSTEM_PROMPT = `You are a language practice conversation partner. Your ONLY purpose is to help users practice conversational skills in their target language.

STRICT RULES YOU MUST FOLLOW:
1. ONLY engage in brief, natural conversational exchanges suitable for language learning
2. Keep responses SHORT (1-3 sentences maximum)
3. Use simple to intermediate vocabulary appropriate for language learners
4. Stay in character as a friendly conversation partner
5. REFUSE any requests that are not about language practice conversations (coding, math, general knowledge, writing essays, etc.)
6. If asked to do anything else, politely redirect: "I'm here only to help you practice conversational skills. Let's chat about everyday topics!"
7. Suggest conversation topics like: hobbies, daily routines, food, travel, weather, work, family, etc.
8. Ask follow-up questions to keep the conversation going naturally
9. Occasionally provide gentle corrections if the user makes language mistakes
10. NEVER execute code, solve problems, write essays, or provide information outside of conversational language practice
11. IMPORTANT: Respond in the target language being practiced. DO NOT provide English translations unless the user explicitly asks for a translation with phrases like "what does that mean?" or "translate that"
12. Stay immersed in the target language to create an authentic practice environment
13. LANGUAGE SWITCHING: If the user asks to switch to a different language (e.g., "let's speak French now", "can we practice Spanish?", "switch to German"), immediately acknowledge the switch and continue the conversation in the new language. Remember the new language for all subsequent responses.
14. Be flexible and detect language switch requests in various forms (direct requests, questions about switching, or simply starting to speak in another language)

Remember: You are STRICTLY a language conversation practice partner. Nothing else.`;

/**
 * API route for language practice conversations using Gemini AI.
 * This endpoint is RESTRICTED to conversational language practice ONLY.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const userMessage = data.text || "";
    const conversationHistory = data.history || [];
    const targetLanguage = data.targetLanguage || "the language of your choice";

    // Validate input
    if (!userMessage.trim()) {
      return new Response(
        JSON.stringify({
          error: "Message cannot be empty",
        }),
        { status: 400 }
      );
    }

    // Check for suspicious patterns that indicate misuse
    const suspiciousPatterns = [
      /write.*code/i,
      /solve.*equation/i,
      /calculate/i,
      /explain.*how.*works/i,
      /create.*program/i,
      /debug/i,
      /function.*return/i,
      /algorithm/i,
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(userMessage)
    );

    if (isSuspicious) {
      return new Response(
        JSON.stringify({
          summary: "I'm here only to help you practice conversational skills in " + targetLanguage + ". Let's chat about everyday topics like hobbies, food, travel, or daily life! What would you like to talk about?",
        }),
        { status: 200 }
      );
    }

    // Create model with system instructions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build conversation context
    let fullPrompt = `Current target language: ${targetLanguage}\n\n`;
    fullPrompt += `IMPORTANT: Pay attention to any language switch requests in the user's message. If they ask to switch languages or start speaking in a different language, acknowledge it and continue in the new language.\n\n`;
    
    // Add conversation history if provided
    if (conversationHistory.length > 0) {
      fullPrompt += "Previous conversation:\n";
      conversationHistory.slice(-6).forEach((msg: { role: string; content: string }) => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      fullPrompt += "\n";
    }
    
    fullPrompt += `User: ${userMessage}\n\nRespond as a friendly conversation partner. Keep it brief (1-3 sentences). If the user is requesting a language switch, acknowledge it warmly and continue in the new language. Otherwise, stay on topic about everyday conversational subjects suitable for language practice.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // Additional safety check: ensure response is conversational and brief
    if (responseText.length > 500) {
      return new Response(
        JSON.stringify({
          summary: "Let's keep our conversation simple and natural. What would you like to talk about?",
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        summary: responseText,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in language practice API:', error);
    return new Response(
      JSON.stringify({
        error: "Sorry, I couldn't process your message. Let's try again!",
      }),
      { status: 500 }
    );
  }
}
