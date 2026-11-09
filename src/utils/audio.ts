/**
 * Web Audio API synthesizer for child-friendly game sound effects and optional music.
 * Zero external audio dependencies for 100% reliable offline & classroom play.
 * Includes High-Power Volume Booster (2.5x gain) and Cute Uciel Mascot Speech.
 */

export type VoicePersona = 'keren' | 'ceria' | 'studio';

let currentVoicePersona: VoicePersona = 'keren';

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('misi_voice_persona') as VoicePersona;
    if (saved === 'keren' || saved === 'ceria' || saved === 'studio') {
      currentVoicePersona = saved;
    }
  } catch {
    // Ignore
  }
}

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let isMusicPlaying = false;
let isSoundMuted = false;
let isTtsEnabled = true;
let currentSpeechKey: string | null = null;
const speechListeners: Set<(key: string | null) => void> = new Set();
const personaListeners: Set<(p: VoicePersona) => void> = new Set();

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

  get voicePersona(): VoicePersona {
    return currentVoicePersona;
  },

  setVoicePersona(persona: VoicePersona) {
    currentVoicePersona = persona;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('misi_voice_persona', persona);
      } catch {
        // ignore
      }
    }
    personaListeners.forEach((fn) => {
      try {
        fn(persona);
      } catch {
        // ignore
      }
    });
  },

  addPersonaListener(fn: (p: VoicePersona) => void): () => void {
    personaListeners.add(fn);
    return () => {
      personaListeners.delete(fn);
    };
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
   * Melodi Lonceng Karakter Uciel
   * - 'keren'  : Fanfare arpeggio petualang modern & mantap (C5 -> E5 -> G5 -> C6)
   * - 'ceria'  : Lonceng manis & imut ramah anak (E5 -> A5 -> D6)
   * - 'studio' : Nada santun & jernih (G5 -> C6)
   */
  playGuideAttentionChime() {
    if (isSoundMuted) return;
    try {
      if (currentVoicePersona === 'keren') {
        const notes = [
          { f: 523.25, d: 0.10, t: 0.00 }, // C5
          { f: 659.25, d: 0.10, t: 0.06 }, // E5
          { f: 783.99, d: 0.12, t: 0.12 }, // G5
          { f: 1046.5, d: 0.24, t: 0.18 }, // C6 heroic ring!
        ];
        notes.forEach((n) => {
          setTimeout(() => {
            playHarmonicTone(n.f, n.d, 'triangle', 0.28);
          }, n.t * 1000);
        });
      } else if (currentVoicePersona === 'studio') {
        const notes = [
          { f: 783.99, d: 0.14, t: 0.00 }, // G5
          { f: 1046.5, d: 0.22, t: 0.08 }, // C6
        ];
        notes.forEach((n) => {
          setTimeout(() => {
            playHarmonicTone(n.f, n.d, 'sine', 0.20);
          }, n.t * 1000);
        });
      } else {
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
      }
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
   * Sound effect: Suara 'pop' kenyal, lucu & memuaskan saat siswa mengetuk pilihan jawaban
   * Menggunakan modulasi frekuensi Web Audio API (swept pitch 320Hz -> 840Hz)
   */
  playAnswerPop() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const master = getMasterOutput();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Frekuensi meluncur cepat ke atas lalu melandai sesaat menghasilkan bunyi pop balon empuk
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.085);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  },

  /**
   * Sound effect: Suara koin emas 'ting!' cerah & gemerlap saat mendapatkan poin atau mencocokkan kartu
   * Harmoni ganda nada tinggi (B5 987Hz disusul B6 1975Hz + overtone gemerlap)
   */
  playCoinTing() {
    if (isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      const master = getMasterOutput();
      const now = ctx.currentTime;

      // Nada 1: Ketukan logam koin pembuka (B5 987Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.45, now + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc1.connect(gain1);
      gain1.connect(master);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Nada 2: Lonceng koin 'TING!' gemerlap (B6 1975Hz)
      const t2 = now + 0.038;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1975.53, t2);
      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.65, t2 + 0.004);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.36);
      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(t2);
      osc2.stop(t2 + 0.38);

      // Nada 3: Resonansi kilau emas nada tinggi (F#7 2960Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(2959.96, t2);
      gain3.gain.setValueAtTime(0.001, t2);
      gain3.gain.linearRampToValueAtTime(0.25, t2 + 0.004);
      gain3.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.28);
      osc3.connect(gain3);
      gain3.connect(master);
      osc3.start(t2);
      osc3.stop(t2 + 0.3);
    } catch {
      // Ignore
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

      // Suara disesuaikan berdasarkan karakter persona suara yang dipilih
      let pitch = 1.04;
      let rate = 1.03;

      if (currentVoicePersona === 'keren') {
        pitch = 1.04; // Nada mantap, berwibawa, percaya diri, tanpa distorsi/cempreng
        rate = 1.04;  // Tempo energik & bersemangat seperti karakter kartun petualang
      } else if (currentVoicePersona === 'ceria') {
        pitch = 1.15; // Ramah, ceria, imut alami
        rate = 1.0;
      } else if (currentVoicePersona === 'studio') {
        pitch = 1.0;  // Artikulasi formal jernih
        rate = 0.98;
      }

      utterance.volume = 1.0;
      utterance.pitch = pitch;
      utterance.rate = rate;

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

      if (idVoices.length > 0) {
        let preferredVoice: SpeechSynthesisVoice | undefined;

        if (currentVoicePersona === 'keren') {
          // Karakter Keren & Mantap: Cari Microsoft Ardi (Natural), Google Bahasa Indonesia, atau model suara modern berwibawa
          preferredVoice =
            idVoices.find((v) => v.name.toLowerCase().includes('ardi')) ||
            idVoices.find((v) => {
              const n = v.name.toLowerCase();
              return (
                (n.includes('natural') || n.includes('neural') || n.includes('online')) &&
                (n.includes('male') || n.includes('ardi') || !n.includes('female'))
              );
            }) ||
            idVoices.find((v) => v.name.toLowerCase().includes('google bahasa indonesia')) ||
            idVoices.find((v) => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) ||
            idVoices[0];
        } else if (currentVoicePersona === 'ceria') {
          // Karakter Ceria & Ramah: Cari Microsoft Gadis (Natural), Damayanti, atau suara bersahabat
          preferredVoice =
            idVoices.find((v) => v.name.toLowerCase().includes('gadis')) ||
            idVoices.find((v) => v.name.toLowerCase().includes('damayanti')) ||
            idVoices.find((v) => v.name.toLowerCase().includes('google bahasa indonesia')) ||
            idVoices.find((v) => {
              const n = v.name.toLowerCase();
              return n.includes('female') || n.includes('perempuan') || n.includes('wanita') || n.includes('santi');
            }) ||
            idVoices[0];
        } else {
          // Karakter Penyiar Studio
          preferredVoice =
            idVoices.find((v) => v.name.toLowerCase().includes('gadis')) ||
            idVoices.find((v) => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) ||
            idVoices.find((v) => v.name.toLowerCase().includes('google bahasa indonesia')) ||
            idVoices[0];
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      } else {
        // Fallback jika bahasa Indonesia belum terunduh
        const gentleVoice = voices.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('natural') ||
            n.includes('neural') ||
            n.includes('child') ||
            n.includes('kid') ||
            n.includes('female')
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
   * Menguji sampel suara berdasarkan persona yang dipilih
   */
  testVoice(persona?: VoicePersona) {
    if (persona) {
      this.setVoicePersona(persona);
    }
    const sample =
      currentVoicePersona === 'keren'
        ? 'Halo Sahabat Juara! Aku Uciel si Garuda gagah. Suaraku kini makin keren, mantap, dan siap memandumu berpetualang meraih tiga bintang emas!'
        : currentVoicePersona === 'ceria'
        ? 'Halo teman-teman! Aku Uciel yang ceria dan ramah. Ayo kita belajar hidup rukun dan bermain bersama di sekolah!'
        : 'Halo Sahabat Sekolah. Saya Uciel, pemandu belajar tematik hidup rukun kelas dua Sekolah Dasar.';
    this.speak(sample, 'voice-test-sample');
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

    let greeting = 'Halo Sahabat Juara! Aku Uciel, pemandu petualanganmu!';
    let closing = 'Manakah pilihan terbaikmu? Ayo buktikan kehebatanmu dan pilih sekarang!';

    if (currentVoicePersona === 'ceria') {
      greeting = 'Hai teman-teman pintar! Uciel bantu bacakan soal ini ya!';
      closing = 'Yuk pilih jawaban yang benar dengan riang gembira!';
    } else if (currentVoicePersona === 'studio') {
      greeting = 'Halo Sahabat Sekolah. Mari simak soal pembelajaran berikut dengan saksama.';
      closing = 'Silakan tentukan pilihan jawaban yang paling tepat.';
    }

    const fullText = `${greeting} ${formattedIntro} Pertanyaannya: ${cleanQuestion}. ${formattedOptions}. ${closing}`;
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
