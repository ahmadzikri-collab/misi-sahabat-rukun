/**
 * Web Audio API synthesizer for child-friendly game sound effects and optional music.
 * Zero external audio dependencies for 100% reliable offline & classroom play.
 */

let audioCtx: AudioContext | null = null;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let isMusicPlaying = false;
let isSoundMuted = false;
let isTtsEnabled = true;

function playMusicBoxNote(freq: number, delaySec: number) {
  if (!isMusicPlaying || isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Nada lonceng / kotak musik lembut (sine wave dengan peluruhan cepat, TANPA dengungan konstan)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope lembut: muncul cepat lalu meluruh habis keheningan dalam 0.35s
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.045, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.38);
  } catch {
    // Ignore audio context state
  }
}

function playMusicBoxMelody() {
  if (!isMusicPlaying || isSoundMuted) return;
  // Pola melodi ceria santai (C-E-G-A-G-E-D-C) dengan jeda hening antar nada, bukan nada berdengung
  const phrase = [
    { freq: 523.25, time: 0.0 },   // C5
    { freq: 659.25, time: 0.4 },   // E5
    { freq: 783.99, time: 0.8 },   // G5
    { freq: 880.00, time: 1.2 },   // A5
    { freq: 783.99, time: 1.6 },   // G5
    { freq: 659.25, time: 2.1 },   // E5
    { freq: 587.33, time: 2.5 },   // D5
    { freq: 523.25, time: 3.0 },   // C5
  ];

  phrase.forEach((n) => {
    playMusicBoxNote(n.freq, n.time);
  });
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  get isMuted() {
    return isSoundMuted;
  },
  get isTtsActive() {
    return isTtsEnabled;
  },
  get isMusicActive() {
    return isMusicPlaying;
  },

  toggleMute(): boolean {
    isSoundMuted = !isSoundMuted;
    if (isSoundMuted && isMusicPlaying) {
      this.stopMusic();
    }
    return isSoundMuted;
  },

  toggleTts(): boolean {
    isTtsEnabled = !isTtsEnabled;
    if (!isTtsEnabled) {
      this.stopSpeaking();
    }
    return isTtsEnabled;
  },

  playClick() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before interaction
    }
  },

  playDialoguePop() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  },

  playSuccess() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {
      // Ignore
    }
  },

  playCelebration() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const fanfare = [
        { f: 523.25, t: 0.0 },
        { f: 659.25, t: 0.12 },
        { f: 783.99, t: 0.24 },
        { f: 1046.5, t: 0.36 },
        { f: 880.0, t: 0.48 },
        { f: 1046.5, t: 0.60 },
      ];
      fanfare.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.t);
        osc.stop(ctx.currentTime + note.t + 0.35);
      });
    } catch {
      // Ignore
    }
  },

  playEncourage() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const notes = [440, 493.88, 523.25]; // A4, B4, C5 (friendly uplifting)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
      });
    } catch {
      // Ignore
    }
  },

  toggleMusic(): boolean {
    if (isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return isMusicPlaying;
  },

  startMusic() {
    if (isSoundMuted || isMusicPlaying) return;
    try {
      getAudioContext();
      isMusicPlaying = true;
      // Mainkan frasa melodi lonceng kotak musik pertama
      playMusicBoxMelody();
      // Ulangi setiap 4.5 detik dengan interval teratur dan jeda alami
      if (bgMusicInterval) clearInterval(bgMusicInterval);
      bgMusicInterval = setInterval(() => {
        if (!isMusicPlaying || isSoundMuted) {
          this.stopMusic();
          return;
        }
        playMusicBoxMelody();
      }, 4500);
    } catch {
      // Ignore
    }
  },

  stopMusic() {
    if (bgMusicInterval) {
      clearInterval(bgMusicInterval);
      bgMusicInterval = null;
    }
    isMusicPlaying = false;
  },

  /**
   * Reads Indonesian text aloud for 2nd grade elementary schoolers using Web Speech API
   */
  speak(text: string, onEnd?: () => void) {
    if (!isTtsEnabled || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      // Suara anak kecil yang imut & ceria:
      // Pitch dinaikkan ke 1.45 - 1.5 (rentang frekuensi khas vokal anak-anak/karakter kartun lucu)
      // Rate disesuaikan ke 1.05 agar intonasi lincah, ekspresif, dan tidak kaku
      utterance.pitch = 1.45;
      utterance.rate = 1.05;

      // Pilih suara terbaik yang tersedia di browser (mendahulukan natural/female/id jika ada)
      const voices = window.speechSynthesis.getVoices();
      const idVoices = voices.filter((v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.lang.toLowerCase().includes('indonesia'));
      
      if (idVoices.length > 0) {
        // Prioritaskan suara yang bukan suara berat jika ada pilihan
        const childLikeVoice = idVoices.find((v) => 
          v.name.toLowerCase().includes('gadis') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('siti')
        ) || idVoices[0];
        utterance.voice = childLikeVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  },
};
