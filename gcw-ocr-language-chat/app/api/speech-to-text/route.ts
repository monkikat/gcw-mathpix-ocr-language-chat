import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('Speech-to-text API called');
  
  try {
    const formData = await req.formData();
    console.log('FormData received');
    
    const audioFile = formData.get('audio') as Blob;
    console.log('Audio file:', audioFile ? `${audioFile.size} bytes, type: ${audioFile.type}` : 'null');

    if (!audioFile) {
      console.error('No audio file in request');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }
    console.log('API key found:', apiKey.substring(0, 10) + '...');

    // Convert audio blob to buffer for server-side FormData
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Audio converted to buffer:', buffer.length, 'bytes');

    // Prepare FormData for ElevenLabs API
    const elevenLabsFormData = new FormData();
    const blob = new Blob([buffer], { type: 'audio/webm' });
    elevenLabsFormData.append('file', blob, 'audio.webm');
    elevenLabsFormData.append('model_id', 'scribe_v1');
    
    console.log('Sending request to ElevenLabs...');
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elevenLabsFormData,
    });

    console.log('ElevenLabs response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('ElevenLabs response data:', data);
    return NextResponse.json({ text: data.text || data.transcript || '' });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 }
    );
  }
}
