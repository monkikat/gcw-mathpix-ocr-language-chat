"use client"

import { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { TranscribedText } from '@/types';
import { processOCR } from "../utils/ocrProcessor";


const UploadComponent = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); 
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
    
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    try {
      // Check if file should be processed with OCR
      const shouldProcessOCR = uploadedFile.type.startsWith('image/') || uploadedFile.type === 'application/pdf';

      if (shouldProcessOCR) {
        // Process OCR for images and PDFs
        const messages: TranscribedText[] = [{
          type: 'file',
          content: '',
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
        }];
        
        const updatedMessages = await processOCR(uploadedFile, messages);
        
        // Get the OCR result (last message in the array)
        const ocrResult = updatedMessages[updatedMessages.length - 1];
        
        // Store in localStorage and navigate with simple key (persists on refresh)
        const storageKey = `ocr_result_${Date.now()}`;
        localStorage.setItem(storageKey, JSON.stringify(ocrResult));
        router.push(`/script_mode?key=${storageKey}`);
      } else {
        // For non-OCR files, read as text
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const textResult: TranscribedText = {
            type: 'file',
            content: result,
            fileName: uploadedFile.name,
            fileType: uploadedFile.type,
          };
          
          // Use Base64 encoding for consistency
          const encodedResult = Buffer.from(JSON.stringify(textResult)).toString('base64');
          router.push(`/script_mode?data=${encodedResult}`);
        };
        reader.readAsText(uploadedFile);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process file. Please try again.');
      setIsProcessing(false);
    }
  };
    
    
  return (
    <div className="h-fit w-fit">
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
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload file or image"
          disabled={isProcessing}
        >
          {isProcessing ? '⏳' : 'Upload Image / PDF to Get Started'}
        </button>
        {uploadedFile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {uploadedFile.name}
            </span>
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadComponent
