let audioContext: AudioContext | null = null;

export const unlockNotificationAudio = (): void => {
  if (typeof window === 'undefined') return;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
};

export const playNotificationSound = (): void => {
  try {
    unlockNotificationAudio();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    const playTone = (frequency: number, start: number, duration: number, volume: number) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      oscillator.connect(gain);
      gain.connect(audioContext!.destination);

      oscillator.start(start);
      oscillator.stop(start + duration);
    };

    playTone(880, now, 0.18, 0.22);
    playTone(660, now + 0.2, 0.18, 0.18);
    playTone(880, now + 0.4, 0.25, 0.22);
  } catch {
    // Браузер может заблокировать автовоспроизведение до первого клика
  }
};
