export function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const voices = synth.getVoices();
  const italianVoice = voices.find((v) => v.lang.startsWith('it'));
  if (italianVoice) {
    utterance.voice = italianVoice;
  }

  synth.speak(utterance);
}

export function playWinSound(enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.4);

      oscillator.start(audioCtx.currentTime + i * 0.15);
      oscillator.stop(audioCtx.currentTime + i * 0.15 + 0.4);
    });
  } catch {
  }
}

export function playHandSound(enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = 440;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch {
  }
}
