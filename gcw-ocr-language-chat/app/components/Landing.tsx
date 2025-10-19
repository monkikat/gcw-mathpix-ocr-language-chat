'use client';

import { useState, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { processOCR } from '../utils/ocrProcessor';
import 'katex/dist/katex.min.css';
import { TranscribedText } from '@/types';

const Landing = () => {
  const [messages, setMessages] = useState<TranscribedText[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { type: 'text', content: inputValue }]);
      setInputValue('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Check if file should be processed with OCR
    const shouldProcessOCR = file.type.startsWith('image/') || file.type === 'application/pdf';

    // Display user's uploaded file
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const newMessages = [
        ...messages,
        {
          type: 'file' as const,
          content: result,
          fileName: file.name,
          fileType: file.type,
        },
      ];
      setMessages(newMessages);

      // Process OCR for images and PDFs
      if (shouldProcessOCR) {
        const updatedMessages = await processOCR(file, newMessages);
        setMessages(updatedMessages);
      }

      setIsProcessing(false);
    };

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
      setIsProcessing(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // if enter clicked, send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };


  return (
    <div className="h-full w-full flex flex-col p-8">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Start a conversation...
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,application/pdf,.txt,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload file or image"
          disabled={isProcessing}
        >
          {isProcessing ? '⏳' : '📎'}
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Landing;
