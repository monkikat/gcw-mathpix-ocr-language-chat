"use client";

import { useState, useRef } from "react";
import { SpeechToTextRecorder } from "@/app/utils/speechToText";
import NavBar from "../components/navigation/NavBar";

interface Flashcard {
  phrase: string;
  language: string;
}

export default function TranslateModePage() {
  const [language, setLanguage] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userTranslation, setUserTranslation] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const sttRecorderRef = useRef<SpeechToTextRecorder>(new SpeechToTextRecorder());

  const handleStartPractice = async () => {
    if (!language.trim()) {
      setError("Please enter a language");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          language: language.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to start practice");
        setIsLoading(false);
        return;
      }

      if (!data.supported) {
        setError(data.message || "This language is not supported");
        setIsLoading(false);
        return;
      }

      setCurrentCard({ phrase: data.phrase, language: data.language });
      setIsStarted(true);
      setFeedback(null);
      setUserTranslation("");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error starting practice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTranslation = async () => {
    if (!userTranslation.trim() || !currentCard) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          language: currentCard.language,
          originalPhrase: currentCard.phrase,
          userTranslation: userTranslation.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to validate translation");
        setIsLoading(false);
        return;
      }

      setFeedback({
        correct: data.correct,
        message: data.feedback,
      });
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error validating translation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCard = async () => {
    setIsLoading(true);
    setError("");
    setFeedback(null);
    setUserTranslation("");

    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          language: language.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.supported) {
        setError("Failed to generate next card");
        setIsLoading(false);
        return;
      }

      setCurrentCard({ phrase: data.phrase, language: data.language });
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error generating next card:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      try {
        const transcription = await sttRecorderRef.current.stopRecording();
        setIsRecording(false);
        setUserTranslation(transcription);
      } catch (error) {
        console.error("Error stopping recording:", error);
        setError("Failed to transcribe audio. Please try again.");
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        await sttRecorderRef.current.startRecording();
        setIsRecording(true);
        setError("");
      } catch (error: any) {
        console.error("Error starting recording:", error);
        setError(error.message || "Failed to start recording. Please check microphone permissions.");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback) {
      handleSubmitTranslation();
    }
  };

  if (!isStarted) {
    return (
      <div className="h-screen w-full flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-paleSage rounded-4xl shadow-xl p-8 max-w-md w-full transition-all duration-300 ease-in-out hover:shadow-2xl animate-fadeIn">
            <h1 className="text-3xl font-bold text-deepbROWN mb-6 text-center">
              Translation Practice
            </h1>
            <p className="text-deepbROWN mb-6 text-center">
              Enter a language to start practicing translations
            </p>

            <input
              type="text"
              placeholder="e.g., Spanish, French, Japanese"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStartPractice()}
              className="w-full px-4 py-3 border-2 border-lightSage rounded-4xl focus:outline-none focus:border-darkSage mb-4 text-deepbROWN bg-white transition-all duration-300 ease-in-out focus:shadow-md"
              disabled={isLoading}
            />

            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-4xl mb-4 animate-fadeIn">
                {error}
              </div>
            )}

            <button
              onClick={handleStartPractice}
              disabled={isLoading || !language.trim()}
              className="w-full bg-darkSage hover:bg-darkSage/90 disabled:bg-lightSage/50 text-creme font-semibold py-3 rounded-4xl transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
            >
              {isLoading ? "Starting..." : "Start Practice"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-paleSage rounded-4xl shadow-xl p-8 max-w-2xl w-full transition-all duration-300 ease-in-out hover:shadow-2xl animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-deepbROWN">
              {currentCard?.language} Practice
            </h2>
            <button
              onClick={() => {
                setIsStarted(false);
                setCurrentCard(null);
                setFeedback(null);
                setUserTranslation("");
                setLanguage("");
              }}
              className="text-darkSage hover:text-darkSage/80 font-medium transition-all duration-300 ease-in-out hover:scale-105"
            >
              Change Language
            </button>
          </div>

          {/* Flashcard */}
          <div className="bg-darkSage rounded-4xl p-8 mb-6 text-center min-h-[200px] flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
            <p className="text-4xl font-bold text-creme">
              {currentCard?.phrase}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-4xl mb-4 animate-fadeIn">
              {error}
            </div>
          )}

          {!feedback ? (
            <>
              <p className="text-deepbROWN mb-3 font-medium">Your translation:</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Type your translation in English..."
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 border-2 border-lightSage rounded-4xl focus:outline-none focus:border-darkSage text-deepbROWN bg-white transition-all duration-300 ease-in-out focus:shadow-md"
                  disabled={isLoading}
                />
                <button
                  onClick={handleMicClick}
                  disabled={isLoading}
                  className={`p-3 rounded-4xl transition-all duration-300 ease-in-out hover:scale-110 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-lightSage hover:bg-darkSage text-deepbROWN hover:text-creme hover:shadow-lg"
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice recording"}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleSubmitTranslation}
                disabled={isLoading || !userTranslation.trim()}
                className="w-full bg-darkSage hover:bg-darkSage/90 disabled:bg-lightSage/50 text-creme font-semibold py-3 rounded-4xl transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
              >
                {isLoading ? "Checking..." : "Submit Translation"}
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div
                className={`px-4 py-3 rounded-4xl transition-all duration-300 ease-in-out ${
                  feedback.correct
                    ? "bg-green-100 border-2 border-green-300"
                    : "bg-yellow-100 border-2 border-yellow-300"
                }`}
              >
                <p
                  className={`font-semibold mb-2 ${
                    feedback.correct ? "text-green-800" : "text-yellow-800"
                  }`}
                >
                  {feedback.correct ? "✓ Correct!" : "Not quite right"}
                </p>
                <p className={feedback.correct ? "text-green-700" : "text-yellow-700"}>
                  {feedback.message}
                </p>
              </div>

              <button
                onClick={handleNextCard}
                disabled={isLoading}
                className="w-full bg-darkSage hover:bg-darkSage/90 disabled:bg-lightSage/50 text-creme font-semibold py-3 rounded-4xl transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
              >
                {isLoading ? "Loading..." : "Next Card"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
