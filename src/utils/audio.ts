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

function playMusicBoxNote(freq: number, delaySec: number, duration = 0.55, gainLevel = 0.045, type: OscillatorType = 'triangle') {
  if (!isMusicPlaying || isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    const master = getMasterOutput();
    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm, smooth bell-like envelope with gentle release
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  } catch {
    // Ignore audio context state
  }
}

/**
 * Petualangan Sahabat Rukun BGM
 * Nada lembut, ceria, hangat, dan ramah anak kelas 2 SD (C Major / G Major Pentatonic)
 * Menggunakan akord harmonis dan melodi mengalir yang berulang mulus tanpa hentakan
 */
function playMusicBoxMelody(sectionIndex = 0) {
  if (!isMusicPlaying || isSoundMuted) return;

  // Harmonious chord pads (Root chords: C -> Am -> F -> G)
  const chordSequences = [
    // Phrase 1: C - G - Am - F progression (Joyful Exploration)
    [
      // Bar 1 (C Major)
      { freq: 261.63, time: 0.0, dur: 1.8, gain: 0.025, type: 'sine' as const }, // Bass C4
      { freq: 523.25, time: 0.0, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // Melody C5
      { freq: 659.25, time: 0.35, dur: 0.5, gain: 0.04, type: 'triangle' as const }, // E5
      { freq: 783.99, time: 0.7, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // G5
      { freq: 1046.5, time: 1.05, dur: 0.6, gain: 0.035, type: 'sine' as const },    // C6
      { freq: 783.99, time: 1.45, dur: 0.45, gain: 0.035, type: 'triangle' as const }, // G5

      // Bar 2 (G Major)
      { freq: 196.00, time: 2.0, dur: 1.8, gain: 0.025, type: 'sine' as const }, // Bass G3
      { freq: 587.33, time: 2.0, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // D5
      { freq: 783.99, time: 2.35, dur: 0.5, gain: 0.04, type: 'triangle' as const }, // G5
      { freq: 880.00, time: 2.7, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // A5
      { freq: 987.77, time: 3.05, dur: 0.6, gain: 0.035, type: 'sine' as const },    // B5
      { freq: 783.99, time: 3.45, dur: 0.45, gain: 0.035, type: 'triangle' as const }, // G5

      // Bar 3 (A Minor)
      { freq: 220.00, time: 4.0, dur: 1.8, gain: 0.025, type: 'sine' as const }, // Bass A3
      { freq: 659.25, time: 4.0, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // E5
      { freq: 783.99, time: 4.35, dur: 0.5, gain: 0.04, type: 'triangle' as const }, // G5
      { freq: 880.00, time: 4.7, dur: 0.6, gain: 0.04, type: 'triangle' as const },  // A5
      { freq: 1046.5, time: 5.1, dur: 0.6, gain: 0.035, type: 'sine' as const },     // C6
      { freq: 880.00, time: 5.5, dur: 0.45, gain: 0.035, type: 'triangle' as const }, // A5

      // Bar 4 (F Major to G turn)
      { freq: 174.61, time: 6.0, dur: 1.6, gain: 0.025, type: 'sine' as const }, // Bass F3
      { freq: 698.46, time: 6.0, dur: 0.45, gain: 0.04, type: 'triangle' as const }, // F5
      { freq: 659.25, time: 6.4, dur: 0.45, gain: 0.04, type: 'triangle' as const }, // E5
      { freq: 587.33, time: 6.8, dur: 0.5, gain: 0.04, type: 'triangle' as const },  // D5
      { freq: 523.25, time: 7.2, dur: 0.65, gain: 0.04, type: 'sine' as const },     // C5
    ],
    // Phrase 2: Gentle Harmony Response
    [
      // Bar 1 (C Major Variation)
      { freq: 261.63, time: 0.0, dur: 1.8, gain: 0.025, type: 'sine' as const },
      { freq: 1046.5, time: 0.0, dur: 0.5, gain: 0.035, type: 'sine' as const },
      { freq: 880.00, time: 0.35, dur: 0.45, gain: 0.035, type: 'triangle' as const },
      { freq: 783.99, time: 0.7, dur: 0.5, gain: 0.04, type: 'triangle' as const },
      { freq: 659.25, time: 1.1, dur: 0.6, gain: 0.04, type: 'triangle' as const },

      // Bar 2 (F Major)
      { freq: 174.61, time: 2.0, dur: 1.8, gain: 0.025, type: 'sine' as const },
      { freq: 698.46, time: 2.0, dur: 0.5, gain: 0.04, type: 'triangle' as const },
      { freq: 783.99, time: 2.35, dur: 0.45, gain: 0.04, type: 'triangle' as const },
      { freq: 880.00, time: 2.7, dur: 0.6, gain: 0.04, type: 'triangle' as const },
      { freq: 1046.5, time: 3.1, dur: 0.65, gain: 0.035, type: 'sine' as const },

      // Bar 3 (G Major)
      { freq: 196.00, time: 4.0, dur: 1.8, gain: 0.025, type: 'sine' as const },
      { freq: 987.77, time: 4.0, dur: 0.5, gain: 0.035, type: 'sine' as const },
      { freq: 880.00, time: 4.4, dur: 0.45, gain: 0.04, type: 'triangle' as const },
      { freq: 783.99, time: 4.8, dur: 0.5, gain: 0.04, type: 'triangle' as const },
      { freq: 587.33, time: 5.2, dur: 0.6, gain: 0.04, type: 'triangle' as const },

      // Bar 4 (C Rest & Resolve)
      { freq: 261.63, time: 6.0, dur: 1.8, gain: 0.025, type: 'sine' as const },
      { freq: 523.25, time: 6.0, dur: 0.5, gain: 0.04, type: 'triangle' as const },
      { freq: 659.25, time: 6.45, dur: 0.5, gain: 0.04, type: 'triangle' as const },
      { freq: 783.99, time: 6.9, dur: 0.8, gain: 0.04, type: 'sine' as const },
    ]
  ];

  const currentPhrase = chordSequences[sectionIndex % chordSequences.length];
  currentPhrase.forEach((n) => {
    playMusicBoxNote(n.freq, n.time, n.dur, n.gain, n.type);
  });
}

/**
 * Membersihkan teks dari emoji, tanda baca berlebih, dan menormalisasi singkatan
 * agar suara pemandu Uciel terdengar jernih, fasih, dan natural tanpa distorsi robotik
 */
function cleanTextForIndonesianSpeech(raw: string): string {
  if (!raw) return '';
  let s = raw;

  // 1. Bersihkan emoji & ikon karakter grafis yang merusak suara pembacaan TTS
  s = s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, ' ');
  s = s.replace(/[💡❓✨🎉⭐🏆🥇🥈🥉🌱❤️🛡️📚🍎🎨⚽👍🏻👏🏻😊😃🙋‍♂️🙋‍♀️⚪]/g, ' ');

  // 2. Normalisasi singkatan pelajaran & istilah sekolah agar dibaca fasih dan ramah anak
  s = s.replace(/\bPPKn\b/gi, 'P P K N');
  s = s.replace(/\bPJOK\b/gi, 'P J O K');
  s = s.replace(/\bSBdP\b/gi, 'S B D P');
  s = s.replace(/\bSD\b/gi, 'S D');
  s = s.replace(/\bYME\b/gi, 'Yang Maha Esa');
  s = s.replace(/\bUKS\b/gi, 'U K S');
  s = s.replace(/\bNo\.\s*(\d+)/gi, 'Nomor $1');
  s = s.replace(/\bRp\s*(\d+)/gi, '$1 rupiah');
  s = s.replace(/(\d+)\s*:\s*(\d+)/g, '$1 dibagi $2');
  s = s.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 ditambah $2');
  s = s.replace(/(\d+)\s*-\s*(\d+)/g, '$1 dikurang $2');
  s = s.replace(/(\d+)\s*x\s*(\d+)/gi, '$1 dikali $2');
  s = s.replace(/2D\b/gi, 'dua dimensi');
  s = s.replace(/3D\b/gi, 'tiga dimensi');
  s = s.replace(/\bSila ke-(\d+)/gi, 'Sila ke $1');

  // 3. Bersihkan tanda kutip dan tanda kurung agar intonasi mengalir natural
  s = s.replace(/["'“”«»()]/g, ' ');
  s = s.replace(/[—–]/g, ', ');
  s = s.replace(/\.{2,}/g, '. ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
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
   * Melodi Lonceng Ceria Maskot Uciel ("Ting-Ting-Ting! ✨")
   * Nada lonceng jernih, manis, dan asik untuk memikat perhatian anak sebelum Uciel bersuara
   */
  playGuideAttentionChime() {
    if (isSoundMuted) return;
    try {
      const notes = [
        { f: 659.25, d: 0.12, t: 0.00 }, // E5
        { f: 880.00, d: 0.12, t: 0.07 }, // A5
        { f: 1174.66, d: 0.18, t: 0.14 }, // D6
      ];
      notes.forEach((n) => {
        setTimeout(() => {
          playHarmonicTone(n.f, n.d, 'sine', 0.22);
        }, n.t * 1000);
      });
    } catch {
      // ignore
    }
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
      let phraseStep = 0;
      playMusicBoxMelody(phraseStep);
      if (bgMusicInterval) clearInterval(bgMusicInterval);
      bgMusicInterval = setInterval(() => {
        if (!isMusicPlaying || isSoundMuted) {
          this.stopMusic();
          return;
        }
        phraseStep += 1;
        playMusicBoxMelody(phraseStep);
      }, 8000);
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
   * Suara Ramah Anak, Jernih, Ceria & Asik untuk Maskot Uciel menggunakan Web Speech API
   * - Pitch: 1.15 (Hangat, ceria, imut alami tanpa distorsi robotik/pecah)
   * - Rate: 1.0 (Tempo energik, artikulasi jernih dan mudah dipahami siswa kelas 2 SD)
   * - Volume: 1.0 (Maksimal jernih)
   * - Melodi lonceng ceria sebelum Uciel bersuara untuk memikat perhatian anak
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
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      notifySpeechListeners(assignedKey);

      // Bersihkan teks agar bebas dari karakter canggung/emoji
      const cleanText = cleanTextForIndonesianSpeech(text);
      if (!cleanText) {
        notifySpeechListeners(null);
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';

      // Suara jernih, ceria, natural, dan asik khas anak-anak kelas 2 SD
      utterance.volume = 1.0;
      utterance.pitch = 1.15; // Nada ceria, bersahabat, bebas dari distorsi robotik
      utterance.rate = 1.0;   // Tempo pas, artikulasi jelas dan sangat ramah anak

      // Ambil daftar suara dari browser
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
        // Prioritaskan suara perempuan / muda berkualitas tinggi (Google Natural / Gadis / Damayanti)
        const preferredVoice =
          idVoices.find((v) => {
            const n = v.name.toLowerCase();
            return n.includes('natural') || n.includes('neural') || n.includes('online');
          }) ||
          idVoices.find((v) => v.name.toLowerCase().includes('google bahasa indonesia')) ||
          idVoices.find((v) => {
            const n = v.name.toLowerCase();
            return (
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
          idVoices.find((v) => !isMaleVoice(v)) ||
          idVoices[0];

        utterance.voice = preferredVoice;
      } else {
        // Fallback lembut jika browser belum mengunduh model Bahasa Indonesia
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

      const watchdog = setTimeout(() => {
        if (currentSpeechKey === assignedKey) {
          notifySpeechListeners(null);
          if (onEnd) onEnd();
        }
      }, 18000);

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
   * Membaca seluruh pertanyaan dan pilihan jawaban secara runut, asik, dan menarik perhatian anak
   */
  speakQuestionAndOptions(
    key: string,
    intro: string,
    question: string,
    options: { id?: string; text: string }[],
    onEnd?: () => void
  ) {
    this.playGuideAttentionChime();
    const cleanIntro = cleanTextForIndonesianSpeech(intro);
    const cleanQuestion = cleanTextForIndonesianSpeech(question);
    const formattedIntro = cleanIntro ? `${cleanIntro}. ` : '';
    const formattedOptions = options
      .map((opt, i) => `Pilihan ${String.fromCharCode(65 + i)}: ${cleanTextForIndonesianSpeech(opt.text)}`)
      .join('. ');
    const fullText = `Hai sahabat juara! Dengarkan Uciel ya! ${formattedIntro} Pertanyaannya: ${cleanQuestion}. ${formattedOptions}. Mana pilihanmu? Yuk jawab sekarang!`;
    this.speak(fullText, key, onEnd);
  },

  /**
   * Suara Pemandu Maskot Uciel: Membaca teks narasi dengan lonceng perhatian ceria
   */
  speakGuide(text: string, onEnd?: () => void) {
    this.playGuideAttentionChime();
    const cleaned = cleanTextForIndonesianSpeech(text);
    this.speak(cleaned, onEnd);
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
