'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { TranscribedText } from '@/types';
import { ChatMessage } from '../components/ChatMessage';
import { TextToSpeechPlayer } from '../utils/textToSpeech';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';

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
    <div className="h-screen w-full flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-4xl w-full h-full max-h-[calc(100vh-4rem)] bg-white rounded-lg shadow-lg p-8 flex flex-col">
        {result ? (
          <div className='flex justify-between flex-1 min-h-0 gap-4'>
            <div className='flex flex-col flex-1 min-h-0'>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Processed Result</h2>
              <div className="flex-1 overflow-y-auto pr-2">
                <ChatMessage message={result} />
              </div>
            </div>
            <div className='flex flex-col items-end justify-end gap-2'>
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
              {error && (
                <p className="text-red-500 text-sm max-w-xs text-right">{error}</p>
              )}
              <button onClick={() => router.push('/chat_mode')}
              className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded'>
                Chat Mode
              </button>
              <button className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded'>
                Translate Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
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
