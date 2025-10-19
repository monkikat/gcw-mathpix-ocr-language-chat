import { MessageType } from '@/types';

export async function processOCR(
  file: File,
  newMessages: MessageType[]
): Promise<MessageType[]> {
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
      return [
        ...newMessages,
        {
          type: 'system',
          content: data.text,
          fileName: `OCR Result (${Math.round(data.confidence * 100)}% confidence)`,
        },
      ];
    } else {
      return [
        ...newMessages,
        {
          type: 'system',
          content: `Error: ${data.error || 'OCR processing failed'}`,
        },
      ];
    }
  } catch (error) {
    console.error('OCR error:', error);
    return [
      ...newMessages,
      {
        type: 'system',
        content: `Error: Failed to process file with OCR`,
      },
    ];
  }
}
