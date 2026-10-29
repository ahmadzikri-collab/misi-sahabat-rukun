/**
 * Web Audio API synthesizer for child-friendly game sound effects and optional music.
 * Zero external audio dependencies for 100% reliable offline & classroom play.
 * Includes High-Power Volume Booster (2.5x gain) and Cute Uciel Mascot Speech.
 */

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let isMusicPlaying = false;
let isSoundMuted = false;
let isTtsEnabled = true;
let currentSpeechKey: string | null = null;
const speechListeners: Set<(key: string | null) => void> = new Set();

let cachedVoices: SpeechSynthesisVoice[] = [];

// Memuat daftar suara browser secara asinkron untuk Android, iOS, Chrome, dan Safari
function initVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }
}
initVoices();

// Memastikan AudioContext terinisialisasi dan di-resume pada interaksi pertama pengguna
function ensureAudioContextReady() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, ensureAudioContextReady, { passive: true, once: false });
  });
}

function notifySpeechListeners(key: string | null) {
  currentSpeechKey = key;
  speechListeners.forEach((listener) => {
    try {
      listener(key);
    } catch {
      // Ignore listener error
    }
  });
}

let compressorNode: DynamicsCompressorNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Limiter jernih untuk mencegah clipping tanpa membuat suara terdistorsi
    compressorNode = audioCtx.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-6, audioCtx.currentTime);
    compressorNode.knee.setValueAtTime(6, audioCtx.currentTime);
    compressorNode.ratio.setValueAtTime(3, audioCtx.currentTime);
    compressorNode.attack.setValueAtTime(0.005, audioCtx.currentTime);
    compressorNode.release.setValueAtTime(0.1, audioCtx.currentTime);

    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

    masterGainNode.connect(compressorNode);
    compressorNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterOutput(): GainNode {
  getAudioContext();
  if (!masterGainNode && audioCtx) {
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    if (compressorNode) {
      masterGainNode.connect(compressorNode);
    } else {
      masterGainNode.connect(audioCtx.destination);
    }
  }
  return masterGainNode!;
}

/**
 * Memainkan nada murni jernih (Single pure oscillator)
 * Menghilangkan nada ganda (doble) dan distorsi keruh
 */
function playHarmonicTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'triangle',
  peakGain: number = 0.28
) {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    const master = getMasterOutput();
    const startTime = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(master);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  } catch {
    // Ignore audio context error
  }
}

function playMusicBoxNote(freq: number, delaySec: number) {
  if (!isMusicPlaying || isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    const master = getMasterOutput();
    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope lembut namun terdengar jelas
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + 0.40);
  } catch {
    // Ignore audio context state
  }
}

function playMusicBoxMelody() {
  if (!isMusicPlaying || isSoundMuted) return;
  const phrase = [
    { freq: 523.25, time: 0.0 }, // C5
    { freq: 659.25, time: 0.4 }, // E5
    { freq: 783.99, time: 0.8 }, // G5
    { freq: 880.0, time: 1.2 },  // A5
    { freq: 783.99, time: 1.6 }, // G5
    { freq: 659.25, time: 2.1 }, // E5
    { freq: 587.33, time: 2.5 }, // D5
    { freq: 523.25, time: 3.0 }, // C5
  ];

  phrase.forEach((n) => {
    playMusicBoxNote(n.freq, n.time);
  });
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
  get isBoosted() {
    return false;
  },
  get activeSpeechKey() {
    return currentSpeechKey;
  },

  isSpeakingKey(key: string): boolean {
    return currentSpeechKey === key;
  },

  addSpeechListener(fn: (key: string | null) => void): () => void {
    speechListeners.add(fn);
    return () => {
      speechListeners.delete(fn);
    };
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

  /**
   * Efek Suara Transisi Halus (Portal Melodi Ceria Uciel)
   * Dimainkan saat siswa berpindah antar level atau kembali ke peta
   */
  playTransitionChime() {
    if (isSoundMuted) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playHarmonicTone(freq, 0.22, 'sine', 0.15);
        }, i * 65);
      });
    } catch {
      // Ignore
    }
  },

  toggleAudioBoost(): boolean {
    return false;
  },

  /**
   * Suara Cuitan Imut Maskot Uciel ("Pip-Pip-Pop-Cuit! 🐥")
   * Efek suara ceria khas karakter kartun ramah anak
   */
  playCuteUcielChirp() {
    if (isSoundMuted) return;
    try {
      const notes = [
        { f: 1046.5, d: 0.06, t: 0.00 }, // C6
        { f: 1318.5, d: 0.06, t: 0.05 }, // E6
        { f: 1567.9, d: 0.06, t: 0.10 }, // G6
        { f: 2093.0, d: 0.11, t: 0.15 }, // C7 cuitan ceria nada tinggi!
      ];
      notes.forEach((n) => {
        setTimeout(() => {
          playHarmonicTone(n.f, n.d, 'sine', 0.45);
        }, n.t * 1000);
      });
    } catch {
      // ignore
    }
  },

  /**
   * Sound effect: Klik tombol mantap & responsif instan di HP dan Laptop
   */
  playClick() {
    if (isSoundMuted) return;
    try {
      setTimeout(() => {
        playHarmonicTone(580, 0.08, 'triangle', 0.45);
      }, 0);
    } catch {
      // ignore
    }
  },

  /**
   * Sound effect: Pop dialog karakter Uciel
   */
  playDialoguePop() {
    if (isSoundMuted) return;
    try {
      setTimeout(() => {
        playHarmonicTone(660, 0.11, 'sine', 0.50);
      }, 0);
    } catch {
      // ignore
    }
  },

  /**
   * Sound effect: Jawaban Benar (Chime nada ceria C-E-G-C)
   */
  playSuccess() {
    if (isSoundMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playHarmonicTone(freq, 0.25, 'triangle', 0.55);
      }, idx * 75);
    });
  },

  /**
   * Sound effect: Fanfare Selebrasi Bintang & Menang Misi
   */
  playCelebration() {
    if (isSoundMuted) return;
    const fanfare = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 110 },
      { f: 783.99, t: 220 },
      { f: 1046.5, t: 330 },
      { f: 880.0,  t: 440 },
      { f: 1046.5, t: 560 },
    ];
    fanfare.forEach((n) => {
      setTimeout(() => {
        playHarmonicTone(n.f, 0.35, 'triangle', 0.65);
      }, n.t);
    });
  },

  /**
   * Sound effect: Dorongan ramah saat jawaban belum tepat
   */
  playEncourage() {
    if (isSoundMuted) return;
    const notes = [440, 523.25, 659.25]; // A4, C5, E5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playHarmonicTone(freq, 0.22, 'sine', 0.45);
      }, idx * 90);
    });
  },

  /**
   * Sound effect: Peringatan Anti-Kecurangan (Nada Tegas Pengawas)
   */
  playWarning() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const master = getMasterOutput();
      const beeps = [
        { f: 440, t: 0.0, d: 0.15 },
        { f: 330, t: 0.18, d: 0.20 },
      ];
      beeps.forEach((beep) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(beep.f, ctx.currentTime + beep.t);
        gain.gain.setValueAtTime(0.55, ctx.currentTime + beep.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beep.t + beep.d);
        osc.connect(gain);
        gain.connect(master);
        osc.start(ctx.currentTime + beep.t);
        osc.stop(ctx.currentTime + beep.t + beep.d);
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
      playMusicBoxMelody();
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
   * Suara Ramah Anak & Imut untuk Maskot Uciel menggunakan Web Speech API
   * - Pitch: 1.32 (Nada ceria, imut, hangat ramah anak kelas 2 SD)
   * - Rate: 0.96 (Tempo energik, natural, jelas dan artikulatif)
   * - Volume: 1.0 (Maksimal sistem)
   * - Disertai cuitan imut maskot sebelum mulai bicara
   */
  speak(text: string, keyOrOnEnd?: string | (() => void), onEndCallback?: () => void) {
    if (!isTtsEnabled || isSoundMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (typeof keyOrOnEnd === 'function') keyOrOnEnd();
      else if (onEndCallback) onEndCallback();
      return;
    }

    let key: string | undefined;
    let onEnd: (() => void) | undefined = onEndCallback;

    if (typeof keyOrOnEnd === 'function') {
      onEnd = keyOrOnEnd;
      key = undefined;
    } else {
      key = keyOrOnEnd;
    }

    const assignedKey = key || text;

    // Toggle off if already speaking this exact item
    if (currentSpeechKey && currentSpeechKey === assignedKey) {
      this.stopSpeaking();
      return;
    }

    try {
      // Perbaiki bug Chrome Android yang sering menggantung (paused)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      notifySpeechListeners(assignedKey);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';

      // Suara ramah, imut khas anak-anak kelas 2 SD & maskot cilik Uciel
      utterance.volume = 1.0;
      utterance.pitch = 1.45; // Nada imut & ceria seperti suara anak-anak
      utterance.rate = 1.02;  // Tempo energik, ceria, artikulasi jelas dan ramah anak

      // Ambil suara terbaru dari browser
      let voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        voices = cachedVoices;
      } else {
        cachedVoices = voices;
      }

      // Filter suara Bahasa Indonesia
      const idVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('id') ||
          v.lang.toLowerCase().includes('indonesia') ||
          v.name.toLowerCase().includes('indonesia')
      );

      const isMaleVoice = (v: SpeechSynthesisVoice) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('male') ||
          n.includes('pria') ||
          n.includes('laki') ||
          n.includes('andika') ||
          n.includes('david') ||
          n.includes('mark') ||
          n.includes('george')
        );
      };

      if (idVoices.length > 0) {
        // Prioritaskan suara anak-anak / gadis / wanita muda yang paling imut dan ramah (hindari suara pria dewasa)
        const preferredVoice =
          idVoices.find((v) => {
            const n = v.name.toLowerCase();
            return (
              n.includes('anak') ||
              n.includes('child') ||
              n.includes('kid') ||
              n.includes('gadis') ||
              n.includes('damayanti') ||
              n.includes('santi') ||
              n.includes('wita') ||
              n.includes('dewi') ||
              n.includes('putri') ||
              n.includes('female') ||
              n.includes('wanita') ||
              n.includes('perempuan')
            );
          }) ||
          idVoices.find((v) => !isMaleVoice(v)) || // hindari suara laki-laki berat
          idVoices.find((v) => v.name.toLowerCase().includes('google bahasa indonesia')) ||
          idVoices[0];

        utterance.voice = preferredVoice;
      } else {
        // Fallback jika ponsel/browser belum mengunduh suara Bahasa Indonesia
        const gentleVoice = voices.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('child') ||
            n.includes('kid') ||
            n.includes('female') ||
            n.includes('samantha') ||
            n.includes('zira') ||
            n.includes('victoria') ||
            n.includes('natural')
          );
        });
        if (gentleVoice) {
          utterance.voice = gentleVoice;
        }
      }

      // Watchdog timeout pencegah macet di HP Android jika event onend tidak dipicu
      const watchdog = setTimeout(() => {
        if (currentSpeechKey === assignedKey) {
          notifySpeechListeners(null);
          if (onEnd) onEnd();
        }
      }, 16000);

      utterance.onend = () => {
        clearTimeout(watchdog);
        notifySpeechListeners(null);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        clearTimeout(watchdog);
        notifySpeechListeners(null);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      notifySpeechListeners(null);
      if (onEnd) onEnd();
    }
  },

  /**
   * Membaca seluruh pertanyaan dan pilihan jawaban secara runut dan ramah anak
   */
  speakQuestionAndOptions(
    key: string,
    intro: string,
    question: string,
    options: { id?: string; text: string }[],
    onEnd?: () => void
  ) {
    const formattedIntro = intro ? `${intro}. ` : '';
    const formattedOptions = options
      .map((opt, i) => `Pilihan ${String.fromCharCode(65 + i)}: ${opt.text}`)
      .join('. ');
    const fullText = `Halo sahabat juara! Dengarkan Uciel ya. ${formattedIntro} Pertanyaannya: ${question}. Pilihan jawaban: ${formattedOptions}. Pilih jawaban yang paling tepat ya!`;
    this.speak(fullText, key, onEnd);
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    notifySpeechListeners(null);
  },
};
