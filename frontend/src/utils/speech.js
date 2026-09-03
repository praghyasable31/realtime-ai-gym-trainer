/**
 * Voice Coach Utility using HTML5 Web Speech API
 * Includes intelligent debouncing and priority queuing so cues don't stutter.
 */

class VoiceCoach {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.enabled = true;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.debounceMs = 2800; // Do not repeat identical cue within 2.8 seconds
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val && this.synth) {
      this.synth.cancel();
    }
  }

  speak(text, priority = false) {
    if (!this.enabled || !this.synth || !text) return;

    const now = Date.now();
    if (!priority && text === this.lastSpokenText && now - this.lastSpokenTime < this.debounceMs) {
      return;
    }

    // Cancel any long-winded ongoing sentence if priority
    if (priority) {
      this.synth.cancel();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Slightly athletic upbeat pace
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      this.lastSpokenText = text;
      this.lastSpokenTime = now;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceCoach = new VoiceCoach();
