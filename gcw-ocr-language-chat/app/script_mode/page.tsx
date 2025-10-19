'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { TranscribedText } from '@/types';
import { TextToSpeechPlayer } from '../utils/textToSpeech';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';
import NavBar from '../components/navigation/NavBar';

function ScriptModeContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TranscribedText | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ttsPlayerRef = useRef<TextToSpeechPlayer | null>(null);
  const router = useRouter();

  // Initialize TTS player
  useEffect(() => {
    ttsPlayerRef.current = new TextToSpeechPlayer();
    return () => {
      // Cleanup on unmount
      if (ttsPlayerRef.current) {
        ttsPlayerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const key = searchParams.get('key');
    const data = searchParams.get('data');
    
    if (key) {
      // Get from localStorage using key (for OCR results - persists on refresh)
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setResult(parsed);
          // Optionally clean up after retrieving (comment out to keep data permanently)
          // localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Error parsing data from localStorage:', error);
      }
    } else if (data) {
      // Fallback to URL parameter (Base64) for text files
      try {
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        setResult(parsed);
      } catch (error) {
        console.error('Error parsing data from URL:', error);
      }
    }
  }, [searchParams]);

  const handleReadAloud = async () => {
    if (!result?.content) {
      setError('No content to read');
      return;
    }

    const player = ttsPlayerRef.current;
    if (!player) {
      setError('Text-to-speech player not initialized');
      return;
    }

    try {
      setError(null);
      
      if (isPlaying) {
        // Stop playback
        player.stop();
        setIsPlaying(false);
      } else {
        // Start playback
        setIsPlaying(true);
        await player.playText({ 
          text: result.content,
          onEnd: () => setIsPlaying(false)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {result ? (
          <>
            <div className="w-full max-w-4xl h-fit max-h-[70vh] bg-paleSage rounded-4xl p-6 flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl animate-fadeIn">
              <h2 className="text-2xl font-bold text-deepbROWN mb-4 text-center">Processed Result</h2>
              
              <div className="flex-1 overflow-y-auto p-4 bg-creme rounded-3xl mb-4 transition-all duration-300 ease-in-out">
                <p className="text-deepbROWN whitespace-pre-wrap">{result.content}</p>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={handleReadAloud}
                  disabled={!result?.content}
                  className={`p-3 rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-darkSage hover:bg-darkSage/90 text-creme disabled:bg-lightSage/50 disabled:cursor-not-allowed'
                  }`}
                  title={isPlaying ? 'Stop reading' : 'Read aloud'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM6 6a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 016 6zM14 6a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0114 6zM2 9a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 012 9zM18 9a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0118 9z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {error && (
                <p className="text-red-600 text-sm mt-2 text-center bg-red-100 px-4 py-2 rounded-4xl border-2 border-red-300">{error}</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-deepbROWN">
            <p>No data to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

const Page = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <ScriptModeContent />
    </Suspense>
  );
};

export default Page;

/**
 * 
 <div className='flex justify-between items-center'>
              <h2 className="text-2xl font-bold text-gray-800">Processed Result</h2>
              <div className='flex gap-2'>
                <button 
                  onClick={handleReadAloud}
                  disabled={!result?.content}
                  className={`px-4 py-2 rounded transition-colors ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
                  }`}
                >
                  {isPlaying ? 'Stop Reading' : 'Read Aloud'}
                </button>
                <button 
                  onClick={() => router.push('/chat_mode')}
                  className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded'
                >
                  Chat Mode
                </button>
                <button 
                  className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded'
                >
                  Translate Mode
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{result.content}</p>
            </div>
 */
