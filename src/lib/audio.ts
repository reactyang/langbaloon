// Audio Manager - Sound effects for the game

class SoundManager {
  private celebrationBuffer: AudioBuffer | null = null;
  private wrongBuffer: AudioBuffer | null = null;
  private popBuffer: AudioBuffer | null = null;
  private audioContext: AudioContext | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create sounds programmatically
      this.celebrationBuffer = this.createCelebrationSound();
      this.wrongBuffer = this.createWrongSound();
      this.popBuffer = this.createPopSound();
      
      this.initialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private createCelebrationSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Happy ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor(t / (duration / notes.length));
      const noteT = t - (noteIndex * duration / notes.length);
      const freq = notes[Math.min(noteIndex, notes.length - 1)];
      
      // Envelope
      let envelope = 1;
      if (noteT < 0.05) envelope = noteT / 0.05;
      else if (noteT > 0.1) envelope = 1 - (noteT - 0.1) / (0.4);
      
      data[i] = Math.sin(2 * Math.PI * freq * noteT) * envelope * 0.3;
      data[i] += Math.sin(2 * Math.PI * freq * 2 * noteT) * envelope * 0.1;
    }

    return buffer;
  }

  private createWrongSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Descending low buzzer
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 200 - (t / duration) * 100;
      
      // Quick decay
      const envelope = Math.max(0, 1 - t / duration);
      
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      data[i] += Math.sin(2 * Math.PI * freq * 2 * t) * envelope * 0.1;
    }

    return buffer;
  }

  private createPopSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Quick pop with noise
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      
      // Sharp attack, quick decay
      const envelope = Math.exp(-t * 30);
      
      // Mix of frequencies for "pop" sound
      data[i] = (Math.sin(2 * Math.PI * 400 * t) * 0.5 + 
                 Math.sin(2 * Math.PI * 800 * t) * 0.3 +
                 (Math.random() * 2 - 1) * 0.2) * envelope * 0.4;
    }

    return buffer;
  }

  playCelebration(): void {
    if (!this.audioContext || !this.celebrationBuffer) return;
    this.playBuffer(this.celebrationBuffer);
  }

  playWrong(): void {
    if (!this.audioContext || !this.wrongBuffer) return;
    this.playBuffer(this.wrongBuffer);
  }

  playPop(): void {
    if (!this.audioContext || !this.popBuffer) return;
    this.playBuffer(this.popBuffer);
  }

  private playBuffer(buffer: AudioBuffer): void {
    if (!this.audioContext) return;
    
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();