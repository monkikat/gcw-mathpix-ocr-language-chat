import { NextRequest, NextResponse } from 'next/server';

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

    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app_id': appId,
        'app_key': appKey,
      },
      body: JSON.stringify({
        src: `data:${file.type};base64,${base64}`,
        formats: ['text', 'html'],
        ocr: ['math', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mathpix API error:', errorText);
      return NextResponse.json(
        { error: 'OCR processing failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      text: data.text || '',
      html: data.html || '',
      confidence: data.confidence || 0,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
