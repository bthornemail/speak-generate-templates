/**
 * Web Speech API - Speech Synthesis
 *
 * Voice output with configurable voice, rate, and pitch
 */

export class SpeechSynthesisHandler {
  constructor(config) {
    this.config = {
      voice: config.voice || null,
      rate: config.rate || 1.0,
      pitch: config.pitch || 1.0,
      volume: config.volume || 1.0,
      lang: config.lang || 'en-US'
    };

    this.voices = [];
    this.selectedVoice = null;

    // Load voices
    this.loadVoices();

    // Voices might load asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    this.voices = speechSynthesis.getVoices();

    if (this.voices.length > 0) {
      // Try to find requested voice
      if (this.config.voice) {
        this.selectedVoice = this.voices.find(v =>
          v.name.includes(this.config.voice) || v.lang === this.config.lang
        );
      }

      // Fallback to first matching language
      if (!this.selectedVoice) {
        this.selectedVoice = this.voices.find(v => v.lang.startsWith(this.config.lang.split('-')[0]));
      }

      // Ultimate fallback
      if (!this.selectedVoice && this.voices.length > 0) {
        this.selectedVoice = this.voices[0];
      }

      console.log(`[Speech] Loaded ${this.voices.length} voices, selected: ${this.selectedVoice?.name || 'default'}`);
    }
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure utterance
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;
      utterance.lang = this.config.lang;

      // Event handlers
      utterance.onend = () => {
        console.log(`[Speech] Finished: "${text}"`);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[Speech] Synthesis error:', event.error);
        reject(new Error(event.error));
      };

      utterance.onstart = () => {
        console.log(`[Speech] Speaking: "${text}"`);
      };

      // Speak
      speechSynthesis.speak(utterance);
    });
  }

  cancel() {
    speechSynthesis.cancel();
  }

  pause() {
    speechSynthesis.pause();
  }

  resume() {
    speechSynthesis.resume();
  }

  isSpeaking() {
    return speechSynthesis.speaking;
  }

  getVoices() {
    return this.voices;
  }

  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
      return true;
    }
    return false;
  }

  setRate(rate) {
    this.config.rate = Math.max(0.1, Math.min(10, rate));
  }

  setPitch(pitch) {
    this.config.pitch = Math.max(0, Math.min(2, pitch));
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }
}
