"use client"

import { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { TranscribedText } from '@/types';
import { processOCR } from "../utils/ocrProcessor";
import Image from 'next/image';
import uploadIcon from '../src/uploadIcon.svg';


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
    <div className="h-full w-full flex flex-col items-center justify-center space-y-12">
        <div className="flex flex-col items-center space-y-8">
          <p className="text-6xl text-deepbROWN">hello</p>
          <p className="text-deepbROWN">Whenever you're ready, upload your file and begin your learning!</p>
        </div>

        <div className="border-dashed border-4 border-paleSage rounded-4xl p-8 hover:bg-paleSage hover:border-darkSage transition-all duration-300 ease-in-out hover:shadow-lg">
          <div className="flex flex-col items-center gap-2 px-8">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.txt,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-lg hover:scale-110 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload file or image"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="text-2xl">⏳</span>
              ) : (
                <Image 
                  src={uploadIcon} 
                  alt="Upload" 
                  width={80} 
                  height={80}
                  className="transition-transform duration-300 ease-in-out"
                />
              )}
            </button>
            <p className="text-deepbROWN">Upload an image/pdf</p>
            {uploadedFile && (
              <div className="flex flex-col items-center gap-8 animate-fadeIn">
                <span className="text-xs text-deepbROWN italic">
                  {uploadedFile.name}
                </span>
                <button
                  onClick={handleSend}
                  className="px-4 py-1 bg-darkSage text-creme hover:bg-darkSage/90 hover:scale-105 rounded-4xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Upload'}
                </button>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default UploadComponent
