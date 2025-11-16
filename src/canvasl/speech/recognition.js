/**
 * Web Speech API - Speech Recognition
 *
 * Voice input with keyword detection and command parsing
 */

export class SpeechRecognitionHandler {
  constructor(config, onKeywordDetected, onTranscript) {
    this.keywords = new Set(config.keywords || []);
    this.onKeywordDetected = onKeywordDetected || (() => {});
    this.onTranscript = onTranscript || (() => {});
    this.recognition = null;
    this.isListening = false;

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      return;
    }

    // Initialize recognition
    this.recognition = new SpeechRecognition();
    this.recognition.lang = config.lang || 'en-US';
    this.recognition.continuous = config.continuous !== false;
    this.recognition.interimResults = config.interimResults !== false;
    this.recognition.maxAlternatives = 1;

    this.setupHandlers();
  }

  setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('[Speech] Recognition started');
    };

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      console.log(`[Speech] Transcript: "${transcript}" (${Math.round(confidence * 100)}% confident)`);

      // Emit transcript
      this.onTranscript(transcript, confidence, result.isFinal);

      // Check for keywords (case-insensitive)
      if (result.isFinal) {
        const transcriptLower = transcript.toLowerCase();

        for (const keyword of this.keywords) {
          if (transcriptLower.includes(keyword.toLowerCase())) {
            console.log(`[Speech] Keyword detected: "${keyword}"`);
            this.onKeywordDetected(keyword, transcript, confidence);
          }
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[Speech] Recognition error:', event.error);

      if (event.error === 'no-speech') {
        console.log('[Speech] No speech detected, continuing...');
      } else if (event.error === 'audio-capture') {
        console.error('[Speech] No microphone access');
        this.isListening = false;
      } else if (event.error === 'not-allowed') {
        console.error('[Speech] Microphone permission denied');
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      console.log('[Speech] Recognition ended');

      // Restart if continuous mode
      if (this.isListening && this.recognition.continuous) {
        console.log('[Speech] Restarting recognition...');
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 100);
      } else {
        this.isListening = false;
      }
    };
  }

  start() {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.isListening) {
      console.warn('[Speech] Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('[Speech] Failed to start:', error);
      throw error;
    }
  }

  stop() {
    if (!this.recognition) return;

    this.isListening = false;
    this.recognition.stop();
  }

  isSupported() {
    return !!this.recognition;
  }

  addKeyword(keyword) {
    this.keywords.add(keyword);
  }

  removeKeyword(keyword) {
    this.keywords.delete(keyword);
  }
}
