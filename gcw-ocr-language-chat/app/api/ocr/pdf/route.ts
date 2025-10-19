import { NextRequest, NextResponse } from 'next/server';

async function pollPdfResult(pdfId: string, appId: string, appKey: string, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

    const response = await fetch(`https://api.mathpix.com/v3/pdf/${pdfId}`, {
      method: 'GET',
      headers: {
        'app_id': appId,
        'app_key': appKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polling failed (attempt ${attempt + 1}/${maxAttempts}):`, errorText);
      throw new Error(`Polling failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts} - Status: ${data.status}, Full response:`, JSON.stringify(data, null, 2));

    // Check various possible status fields and values
    const status = data.status || data.pdf_status || data.conversion_status;
    
    if (!status) {
      console.error('No status field found in response:', data);
      throw new Error('No status field in API response');
    }

    // Handle completed status (case-insensitive)
    if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'success') {
      console.log('PDF processing completed successfully');
      return data;
    } 
    
    // Handle error status
    if (status.toLowerCase() === 'error' || status.toLowerCase() === 'failed') {
      const errorMsg = data.error || data.error_info || data.message || 'Unknown error';
      console.error('PDF processing failed:', errorMsg);
      throw new Error(`PDF processing failed: ${errorMsg}`);
    }
    
    // Continue polling if status is 'processing', 'pending', or other non-terminal state
    console.log(`Status '${status}' indicates processing still in progress, continuing to poll...`);
  }

  throw new Error(`PDF processing timeout after ${maxAttempts} attempts`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const appId = process.env.APP_ID;
    const appKey = process.env.APP_KEY;

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: 'Mathpix credentials not configured' },
        { status: 500 }
      );
    }

    // Submit PDF for processing using form data with file
    const pdfFormData = new FormData();
    pdfFormData.append('file', new Blob([buffer], { type: 'application/pdf' }), 'document.pdf');
    pdfFormData.append('options_json', JSON.stringify({
      math_inline_delimiters: ['$', '$'],
      math_display_delimiters: ['$$', '$$'],
      rm_spaces: true,
    }));

    const submitResponse = await fetch('https://api.mathpix.com/v3/pdf', {
      method: 'POST',
      headers: {
        'app_id': appId,
        'app_key': appKey,
      },
      body: pdfFormData,
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('Mathpix PDF submission error:', errorText);
      return NextResponse.json(
        { error: 'PDF submission failed', details: errorText },
        { status: submitResponse.status }
      );
    }

    const submitData = await submitResponse.json();
    console.log('PDF submission response:', JSON.stringify(submitData, null, 2));
    
    const pdfId = submitData.pdf_id || submitData.id;

    if (!pdfId) {
      return NextResponse.json(
        { 
          error: 'No PDF ID returned',
          response: submitData 
        },
        { status: 500 }
      );
    }

    // Poll for results
    const result = await pollPdfResult(pdfId, appId, appKey);
    console.log('PDF polling result:', JSON.stringify(result, null, 2));

    // After completion, fetch the actual content
    // Mathpix provides content in various formats: .mmd (markdown), .tex, .html, etc.
    console.log(`Fetching content for PDF ID: ${pdfId}`);
    
    const contentResponse = await fetch(`https://api.mathpix.com/v3/pdf/${pdfId}.mmd`, {
      method: 'GET',
      headers: {
        'app_id': appId,
        'app_key': appKey,
      },
    });

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error('Failed to fetch PDF content:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch PDF content', details: errorText },
        { status: contentResponse.status }
      );
    }

    const extractedText = await contentResponse.text();
    console.log('Extracted text length:', extractedText.length);
    console.log('First 500 chars:', extractedText.substring(0, 500));
    
    return NextResponse.json({
      success: true,
      text: extractedText,
      confidence: 0.95, // Mathpix doesn't provide confidence for PDFs
      pdfId: pdfId,
      numPages: result.num_pages || 0,
      fullResult: result, // Include for debugging
    });
  } catch (error) {
    console.error('PDF OCR error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
