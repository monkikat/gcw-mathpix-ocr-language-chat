import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const { action, language, userTranslation, originalPhrase } = data;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action is required" }),
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
    });

    if (action === "generate") {
      // Validate language and generate flashcard
      if (!language || !language.trim()) {
        return new Response(
          JSON.stringify({ error: "Language is required" }),
          { status: 400 }
        );
      }

      // Add randomization to ensure variety
      const topics = [
        "introducing yourself",
        "ordering food at a restaurant",
        "asking for directions",
        "talking about the weather",
        "discussing hobbies like sports, music, or reading",
        "making weekend plans with friends",
        "shopping for clothes or groceries",
        "talking about family members",
        "expressing feelings or emotions",
        "discussing work or school",
        "talking about traveling or vacation",
        "commenting on daily routines",
        "asking about preferences",
        "talking about time or schedules",
        "expressing opinions about movies or books"
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const randomSeed = Math.random().toString(36).substring(7);

      const prompt = `You are a language learning assistant. The user wants to practice translating phrases from ${language} to English.

Request ID: ${randomSeed}
Topic focus: ${randomTopic}

First, determine if you can support this language. If you cannot support it (e.g., it's not a real language, or you don't have knowledge of it), respond with:
NOT_SUPPORTED: [brief explanation]

If you CAN support this language, generate ONE unique conversational phrase in ${language} suitable for a beginner learner about the topic "${randomTopic}". The phrase should be:
- Common and useful in everyday conversation
- Not too complex (beginner to intermediate level)
- Between 3-10 words
- Directly related to "${randomTopic}"
- Creative and varied (avoid clichés like "How are you?")

Respond in this exact format:
PHRASE: [the phrase in ${language}]

Example for Spanish about hobbies:
PHRASE: Me encanta jugar al fútbol`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Check if language is not supported
      if (responseText.startsWith("NOT_SUPPORTED:")) {
        const message = responseText.replace("NOT_SUPPORTED:", "").trim();
        return new Response(
          JSON.stringify({
            supported: false,
            message: message || "This language is not supported",
          }),
          { status: 200 }
        );
      }

      // Extract the phrase
      const phraseMatch = responseText.match(/PHRASE:\s*(.+)/);
      if (!phraseMatch) {
        return new Response(
          JSON.stringify({
            error: "Failed to generate phrase. Please try again.",
          }),
          { status: 500 }
        );
      }

      const phrase = phraseMatch[1].trim();

      return new Response(
        JSON.stringify({
          supported: true,
          phrase,
          language,
        }),
        { status: 200 }
      );
    }

    if (action === "validate") {
      // Validate user's translation
      if (!userTranslation || !originalPhrase || !language) {
        return new Response(
          JSON.stringify({ error: "Missing required fields for validation" }),
          { status: 400 }
        );
      }

      const prompt = `You are a language learning assistant. A user is practicing translating from ${language} to English.

Original phrase in ${language}: "${originalPhrase}"
User's translation attempt: "${userTranslation}"

Evaluate if the user's translation is correct or acceptable. Consider:
- Exact translations are correct
- Reasonable interpretations are acceptable
- Minor grammatical variations are acceptable
- Completely wrong meanings are incorrect

Respond in this exact format:
CORRECT: yes/no
FEEDBACK: [Brief feedback in 1-2 sentences. If correct, encourage them. If incorrect, provide the correct translation and a gentle explanation.]

Example:
CORRECT: yes
FEEDBACK: Great job! That's a perfect translation.

Or:
CORRECT: no
FEEDBACK: Not quite. The correct translation is "How are you today?" The word "hoy" means "today."`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Parse the response
      const correctMatch = responseText.match(/CORRECT:\s*(yes|no)/i);
      const feedbackMatch = responseText.match(/FEEDBACK:\s*([\s\S]+)/);

      if (!correctMatch || !feedbackMatch) {
        return new Response(
          JSON.stringify({
            error: "Failed to validate translation. Please try again.",
          }),
          { status: 500 }
        );
      }

      const isCorrect = correctMatch[1].toLowerCase() === "yes";
      const feedback = feedbackMatch[1].trim();

      return new Response(
        JSON.stringify({
          correct: isCorrect,
          feedback,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in flashcard API:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      { status: 500 }
    );
  }
}
