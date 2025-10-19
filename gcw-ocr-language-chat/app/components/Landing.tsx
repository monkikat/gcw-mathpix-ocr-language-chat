'use client';

import { useState, useRef } from 'react';

type Message = {
  type: 'text' | 'file' | 'system';
  content: string;
  fileName?: string;
  fileType?: string;
};

const Landing = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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
        try {
          const formData = new FormData();
          formData.append('file', file);

          const endpoint = file.type === 'application/pdf' 
            ? '/api/ocr/pdf' 
            : '/api/ocr/image';

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (data.success && data.text) {
            // Add system message with OCR result
            setMessages([
              ...newMessages,
              {
                type: 'system',
                content: data.text,
                fileName: `OCR Result (${Math.round(data.confidence * 100)}% confidence)`,
              },
            ]);
          } else {
            setMessages([
              ...newMessages,
              {
                type: 'system',
                content: `Error: ${data.error || 'OCR processing failed'}`,
              },
            ]);
          }
        } catch (error) {
          console.error('OCR error:', error);
          setMessages([
            ...newMessages,
            {
              type: 'system',
              content: `Error: Failed to process file with OCR`,
            },
          ]);
        }
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    if (message.type === 'system') {
      return (
        <div
          key={index}
          className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-md"
        >
          {message.fileName && (
            <p className="text-xs font-semibold mb-2 text-gray-600">
              {message.fileName}
            </p>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      );
    }

    if (message.type === 'text') {
      return (
        <div
          key={index}
          className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto"
        >
          {message.content}
        </div>
      );
    }

    if (message.fileType?.startsWith('image/')) {
      return (
        <div
          key={index}
          className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto"
        >
          <p className="text-sm mb-2">{message.fileName}</p>
          <img
            src={message.content}
            alt={message.fileName}
            className="max-w-full rounded"
          />
        </div>
      );
    }

    return (
      <div
        key={index}
        className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto"
      >
        <p className="text-sm mb-1">📎 {message.fileName}</p>
        <p className="text-xs opacity-75">File uploaded</p>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col p-8">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Start a conversation...
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      {/* Input Field at Bottom */}
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
