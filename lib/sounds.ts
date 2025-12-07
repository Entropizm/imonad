// iOS 4 Sound Effects using Web Audio API

class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Play lock sound (short beep)
  playLock() {
    this.playTone(800, 0.1, 0.3);
  }

  // Play unlock sound (ascending beep)
  playUnlock() {
    this.playTone(600, 0.05, 0.2);
    setTimeout(() => this.playTone(900, 0.05, 0.2), 50);
  }

  // Play tap sound (click)
  playTap() {
    this.playTone(1000, 0.02, 0.1);
  }

  // Play keyboard click
  playKeyboard() {
    this.playTone(1200, 0.01, 0.08);
  }

  // Play success sound
  playSuccess() {
    this.playTone(800, 0.05, 0.2);
    setTimeout(() => this.playTone(1000, 0.05, 0.2), 60);
    setTimeout(() => this.playTone(1200, 0.1, 0.3), 120);
  }

  // Play error sound
  playError() {
    this.playTone(400, 0.1, 0.3);
    setTimeout(() => this.playTone(350, 0.15, 0.4), 100);
  }

  // Play boot sound
  playBoot() {
    this.playTone(600, 0.1, 0.2);
    setTimeout(() => this.playTone(800, 0.1, 0.2), 100);
    setTimeout(() => this.playTone(1000, 0.2, 0.3), 200);
  }

  // Generate tone using Web Audio API
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

// Singleton instance
let soundManager: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManager && typeof window !== 'undefined') {
    soundManager = new SoundManager();
  }
  return soundManager!;
}

// Convenience functions
export const playLockSound = () => getSoundManager()?.playLock();
export const playUnlockSound = () => getSoundManager()?.playUnlock();
export const playTapSound = () => getSoundManager()?.playTap();
export const playKeyboardSound = () => getSoundManager()?.playKeyboard();
export const playSuccessSound = () => getSoundManager()?.playSuccess();
export const playErrorSound = () => getSoundManager()?.playError();
export const playBootSound = () => getSoundManager()?.playBoot();

