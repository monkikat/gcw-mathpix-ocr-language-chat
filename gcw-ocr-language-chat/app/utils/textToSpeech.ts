/**
 * Text-to-Speech utility using ElevenLabs API
 * Provides modular functions for converting text to speech
 */

export interface TTSOptions {
  text: string;
  voiceId?: string;
  apiKey?: string;
  modelId?: string;
  languageCode?: string;
  onEnd?: () => void;
}

export class TextToSpeechPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  /**
   * Converts text to speech and plays it using ElevenLabs API
   * Uses multilingual model for better pronunciation across languages
   */
  async playText({ 
    text, 
    voiceId = 'pNInz6obpgDQGcFmaJgB', 
    apiKey, 
    modelId = 'eleven_multilingual_v2',
    languageCode,
    onEnd 
  }: TTSOptions): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      const apiKeyToUse = apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKeyToUse) {
        throw new Error('ElevenLabs API key is required');
      }

      // Create audio element early to maintain user gesture chain
      // This is crucial to avoid NotAllowedError in browsers
      this.audio = new Audio();
      this.isPlaying = true;
      
      // Build request body with optional language code
      const requestBody: {
        text: string;
        model_id: string;
        voice_settings: {
          stability: number;
          similarity_boost: number;
          style: number;
          use_speaker_boost: boolean;
        };
        language_code?: string;
      } = {
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75, // Higher for better accuracy
          style: 0.0, // Optional: adjust for more natural speech
          use_speaker_boost: true, // Enhance voice clarity
        },
      };

      // Add language code if specified (helps with pronunciation)
      if (languageCode) {
        requestBody.language_code = languageCode;
      }

      // Call ElevenLabs TTS API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKeyToUse,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.statusText} - ${errorText}`);
      }

      // Convert response to blob and create audio URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Set audio source and play
      this.audio.src = audioUrl;

      // Set up event listeners
      this.audio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      this.audio.onerror = (e) => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', e);
        if (onEnd) onEnd();
      };

      // Play audio - this should work since audio element was created in the same call stack
      await this.audio.play();
    } catch (error) {
      this.isPlaying = false;
      console.error('Error playing text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Stops the currently playing audio
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Returns whether audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
