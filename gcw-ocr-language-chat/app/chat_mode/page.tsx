'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types';
import { TextToSpeechPlayer } from '@/app/utils/textToSpeech';
import { SpeechToTextRecorder } from '@/app/utils/speechToText';
import NavBar from '../components/navigation/NavBar';

const ChatMode = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! What language are we practicing today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const ttsPlayerRef = useRef<TextToSpeechPlayer>(new TextToSpeechPlayer());
  const sttRecorderRef = useRef<SpeechToTextRecorder>(new SpeechToTextRecorder());
  const lastMessageIndexRef = useRef<number>(0);

  // Stop audio when component unmounts (navigation away)
  useEffect(() => {
    return () => {
      if (ttsPlayerRef.current) {
        ttsPlayerRef.current.stop();
      }
    };
  }, []);

  const handlePlayAudio = async (text: string, index: number) => {
    try {
      setPlayingIndex(index);
      await ttsPlayerRef.current.playText({
        text,
        onEnd: () => setPlayingIndex(null),
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingIndex(null);
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputValue,
      };

      setMessages([...messages, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/gemini-ai-model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: inputValue,
            history: messages
          }),
        });

        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.summary,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording, transcribe, and send
      try {
        const transcription = await sttRecorderRef.current.stopRecording();
        setIsRecording(false);
        setInputValue(transcription);
        
        // Automatically send the message
        if (transcription.trim()) {
          const userMessage: ChatMessage = {
            role: 'user',
            content: transcription,
          };

          setMessages([...messages, userMessage]);
          setInputValue('');
          setIsLoading(true);

          try {
            const response = await fetch('/api/gemini-ai-model', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                text: transcription,
                history: messages
              }),
            });

            const data = await response.json();
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: data.summary,
            };

            setMessages((prev) => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Error calling Gemini API:', error);
            const errorMessage: ChatMessage = {
              role: 'assistant',
              content: 'Sorry, there was an error processing your request.',
            };
            setMessages((prev) => [...prev, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        await sttRecorderRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  // Auto-play new AI messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isNewMessage = messages.length > lastMessageIndexRef.current;
    
    if (isNewMessage && lastMessage?.role === 'assistant' && !isLoading) {
      lastMessageIndexRef.current = messages.length;
      handlePlayAudio(lastMessage.content, messages.length - 1);
    }
  }, [messages, isLoading]);

  return (
    <div className="h-screen w-full flex flex-col pt-18">
      <NavBar />
      <div className="flex-1 flex flex-col p-8">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-paleSage rounded-4xl p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-deepbROWN">
              Start chatting with Gemini AI...
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-3xl ${
                    message.role === 'user'
                      ? 'bg-darkSage text-creme'
                      : 'bg-lightSage text-deepbROWN'
                  } relative transition-all duration-300 ease-in-out hover:shadow-md`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handlePlayAudio(message.content, index)}
                      disabled={playingIndex === index}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full hover:bg-darkSage/20 transition-all duration-300 ease-in-out disabled:opacity-50 hover:scale-110"
                      title="Replay audio"
                      aria-label="Replay audio"
                    >
                      {playingIndex === index ? (
                        <svg className="w-4 h-4 text-deepbROWN" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-deepbROWN" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-3xl bg-lightSage text-deepbROWN">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to practice conversation..."
            disabled={isLoading || isRecording}
            className="flex-1 px-4 py-3 border-2 border-lightSage rounded-4xl focus:outline-none focus:border-darkSage disabled:opacity-50 text-deepbROWN bg-white"
          />
          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`px-4 py-3 rounded-4xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-lightSage hover:bg-darkSage text-deepbROWN hover:text-creme'
            }`}
            title={isRecording ? 'Stop recording and send' : 'Start voice recording'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim() || isRecording}
            className="px-6 py-3 bg-darkSage text-creme rounded-4xl hover:bg-darkSage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMode;
