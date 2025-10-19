/**
 * Text-to-Speech utility using ElevenLabs API
 * Provides modular functions for converting text to speech
 */

export interface TTSOptions {
  text: string;
  voiceId?: string;
  apiKey?: string;
  onEnd?: () => void;
}

export class TextToSpeechPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  /**
   * Converts text to speech and plays it using ElevenLabs API
   */
  async playText({ text, voiceId = 'pNInz6obpgDQGcFmaJgB', apiKey, onEnd }: TTSOptions): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      const apiKeyToUse = apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKeyToUse) {
        throw new Error('ElevenLabs API key is required');
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
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      // Convert response to blob and create audio URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      this.audio = new Audio(audioUrl);
      this.isPlaying = true;

      // Set up event listeners
      this.audio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      this.audio.onerror = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      this.audio.play();
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
