import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Shield,
  Heart,
  Users,
  Compass,
  Shuffle,
  Info,
  ShieldCheck,
} from 'lucide-react';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
import { GuideCharacter } from '../character/GuideCharacter';
import { VoiceReadButton } from '../audio/VoiceReadButton';
import { QuestionVoiceBanner } from '../audio/QuestionVoiceBanner';
import { PancasilaEmblem } from '../pancasila/PancasilaEmblem';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { AntiCheatWatermark } from '../anticheat/AntiCheatWatermark';
import { AntiCheatModal } from '../anticheat/AntiCheatModal';
import { AntiCheatBanner } from '../anticheat/AntiCheatBanner';
import { getUcielForLocation, TAMAN_BG } from '../../data/characters';
import { EmotionState, StudentProfile } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { gameDb } from '../../services/db';
import { createSafeImageErrorHandler } from '../../utils/assets';
import { StudentReflectionModal } from '../StudentReflectionModal';

interface TamanPancasilaLevelProps {
  student?: StudentProfile | null;
  studentName?: string;
  onCompleteLevel: (result: { stars: number; score: number; xp: number }) => void;
  onBackToMap: () => void;
}

// Data Simbol & Sila Pancasila Sesuai Lambang Asli Perisai Garuda Pancasila
const PANCASILA_SYMBOLS = [
  {
    silaNumber: 1,
    symbolName: 'Bintang Emas (Perisai Hitam)',
    silaTitle: 'Sila ke-1',
    silaText: 'Ketuhanan Yang Maha Esa',
    shieldDesc: 'Bintang emas bersudut 5 di atas latar perisai hitam legam di tengah perisai Garuda',
    meaning: 'Percaya kepada Tuhan YME dan saling menghormati perbedaan agama teman.',
    color: 'from-amber-400 to-yellow-500',
    borderColor: 'border-yellow-400',
  },
  {
    silaNumber: 2,
    symbolName: 'Rantai Emas (Perisai Merah)',
    silaTitle: 'Sila ke-2',
    silaText: 'Kemanusiaan yang Adil dan Beradab',
    shieldDesc: 'Gelang rantai persegi dan lingkaran emas bersambung rapat di atas latar merah',
    meaning: 'Saling menyayangi, bersikap adil, dan suka menolong sesama teman.',
    color: 'from-rose-400 to-red-500',
    borderColor: 'border-red-400',
  },
  {
    silaNumber: 3,
    symbolName: 'Pohon Beringin (Perisai Putih)',
    silaTitle: 'Sila ke-3',
    silaText: 'Persatuan Indonesia',
    shieldDesc: 'Pohon beringin rindang hijau berakar gantung di atas latar perisai putih',
    meaning: 'Menjaga persatuan, cinta tanah air, dan kompak bekerja sama di sekolah.',
    color: 'from-emerald-500 to-green-600',
    borderColor: 'border-green-400',
  },
  {
    silaNumber: 4,
    symbolName: 'Kepala Banteng (Perisai Merah)',
    silaTitle: 'Sila ke-4',
    silaText: 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan...',
    shieldDesc: 'Kepala banteng hitam bertanduk kokoh di atas latar perisai merah kebangsaan',
    meaning: 'Bermusyawarah saat memilih ketua kelas dan menghargai pendapat teman.',
    color: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400',
  },
  {
    silaNumber: 5,
    symbolName: 'Padi dan Kapas (Perisai Putih)',
    silaTitle: 'Sila ke-5',
    silaText: 'Keadilan Sosial bagi Seluruh Rakyat Indonesia',
    shieldDesc: 'Setangkai padi emas di kanan & kapas putih hijau di kiri di atas latar putih',
    meaning: 'Bersikap adil, tidak pilih kasih, dan suka bergotong royong.',
    color: 'from-amber-300 to-emerald-400',
    borderColor: 'border-amber-400',
  },
];

// Soal Cerita Hidup Rukun di Sekolah
const SCENARIOS = [
  {
    id: 'sc-1',
    title: 'Pensil Patah Saat Menggambar',
    context: 'Saat jam istirahat atau pelajaran seni, pensil Siti patah dan Siti tidak membawa rautan pensil.',
    question: 'Bagaimana tindakan anak yang rukun dan baik hati?',
    options: [
      {
        id: 'opt-a',
        text: 'Meminjamkan pensil cadangan atau meminjamkan rautan dengan senyum',
        isCorrect: true,
        feedback: 'Tepat sekali! Meminjamkan alat tulis mencerminkan sikap tolong-menolong (Sila ke-2)!',
      },
      {
        id: 'opt-b',
        text: 'Menertawakan Siti karena pensilnya patah',
        isCorrect: false,
        feedback: 'Menertawakan teman membuat teman sedih dan merusak kerukunan.',
      },
      {
        id: 'opt-c',
        text: 'Menyembunyikan pensil sendiri agar tidak dipinjam',
        isCorrect: false,
        feedback: 'Pelit dan menyembunyikan barang tidak mencerminkan sikap sahabat rukun.',
      },
    ],
    hint: 'Sahabat yang rukun suka berbagi dan menolong teman yang kesusahan.',
  },
  {
    id: 'sc-2',
    title: 'Bermain Bersama di Halaman Sekolah',
    context: 'Edo dan Udin sama-sama ingin bermain ayunan di taman sekolah.',
    question: 'Sikap hidup rukun apa yang sebaiknya dilakukan mereka berdua?',
    options: [
      {
        id: 'opt-a',
        text: 'Berebut ayunan sampai salah satu menangis',
        isCorrect: false,
        feedback: 'Berebut bisa mencelakai teman dan menimbulkan pertengkaran.',
      },
      {
        id: 'opt-b',
        text: 'Bergantian menggunakan ayunan secara tertib dan saling menjaga',
        isCorrect: true,
        feedback: 'Hebat! Bermain secara bergantian menunjukkan sikap adil dan rukun!',
      },
      {
        id: 'opt-c',
        text: 'Tidak mau bermain dan saling mengejek',
        isCorrect: false,
        feedback: 'Saling mengejek bukanlah perbuatan terpuji siswa kelas 2 SD.',
      },
    ],
    hint: 'Bermain bergantian membuat semua anak merasa senang dan aman.',
  },
  {
    id: 'sc-3',
    title: 'Gotong Royong Merapikan Taman',
    context: 'Bapak guru mengajak seluruh siswa kelas 2 membersihkan daun kering di Taman Pancasila.',
    question: 'Tindakan yang menunjukkan persatuan dan gotong royong adalah:',
    options: [
      {
        id: 'opt-a',
        text: 'Bersama-sama mengumpulkan daun dan saling membantu membersihkan taman',
        isCorrect: true,
        feedback: 'Benar sekali! Gotong royong mencerminkan pengamalan Sila ke-3 (Persatuan Indonesia)!',
      },
      {
        id: 'opt-b',
        text: 'Duduk bersembunyi di balik pohon dan menunggu teman selesai',
        isCorrect: false,
        feedback: 'Bermalas-malasan saat teman bekerja bersama tidak adil bagi teman sekelas.',
      },
      {
        id: 'opt-c',
        text: 'Membuang sampah daun sembarangan ke lapangan',
        isCorrect: false,
        feedback: 'Membuang sampah sembarangan merusak keasrian lingkungan sekolah.',
      },
    ],
    hint: 'Kerja sama membuat pekerjaan berat menjadi terasa ringan dan cepat selesai.',
  },
  {
    id: 'sc-4',
    title: 'Musyawarah Memilih Ketua Kelas',
    context: 'Ibu guru meminta seluruh siswa kelas 2 memilih ketua kelas dengan cara bermusyawarah dan pemungutan suara.',
    question: 'Sikap yang mencerminkan pengamalan Sila ke-4 Pancasila adalah:',
    options: [
      {
        id: 'opt-a',
        text: 'Menghargai pendapat teman dan menerima hasil keputusan musyawarah dengan lapang dada',
        isCorrect: true,
        feedback: 'Luar biasa! Musyawarah mufakat dan menghargai keputusan bersama adalah inti Sila ke-4!',
      },
      {
        id: 'opt-b',
        text: 'Memaksakan kehendak sendiri agar terpilih menjadi ketua kelas',
        isCorrect: false,
        feedback: 'Memaksakan kehendak bertentangan dengan semangat musyawarah.',
      },
      {
        id: 'opt-c',
        text: 'Marah dan mengabaikan teman yang berbeda pilihan',
        isCorrect: false,
        feedback: 'Perbedaan pilihan adalah hal wajar, persahabatan tetap nomor satu.',
      },
    ],
    hint: 'Sila ke-4 dilambangkan kepala banteng yang mengajarkan musyawarah.',
  },
  {
    id: 'sc-5',
    title: 'Berdoa Bersama Sebelum Belajar',
    context: 'Sebelum memulai pelajaran di kelas, setiap siswa berdoa menurut agama dan keyakinan masing-masing.',
    question: 'Sikap toleransi dan kerukunan yang sesuai dengan Sila ke-1 adalah:',
    options: [
      {
        id: 'opt-a',
        text: 'Berdoa dengan khusyuk dan saling menghormati teman yang berbeda cara beribadah',
        isCorrect: true,
        feedback: 'Hebat! Saling menghormati perbedaan agama adalah wujud nyata Sila ke-1 (Ketuhanan Yang Maha Esa)!',
      },
      {
        id: 'opt-b',
        text: 'Mengganggu atau menertawakan teman yang sedang berdoa',
        isCorrect: false,
        feedback: 'Mengganggu teman yang berdoa melanggar kerukunan beragama.',
      },
      {
        id: 'opt-c',
        text: 'Berbicara keras-keras saat waktu doa berlangsung',
        isCorrect: false,
        feedback: 'Kita harus bersikap tenang dan menghormati waktu berdoa bersama.',
      },
    ],
    hint: 'Sila ke-1 dilambangkan bintang emas yang mengajarkan toleransi beragama.',
  },
];

export const TamanPancasilaLevel: React.FC<TamanPancasilaLevelProps> = ({
  student = null,
  studentName = 'Sahabat Juara',
  onCompleteLevel,
  onBackToMap,
}) => {
  // Game Steps: 'intro' -> 'match_symbols' -> 'scenarios' -> 'result'
  const [currentStep, setCurrentStep] = useState<'intro' | 'match_symbols' | 'scenarios' | 'result'>('intro');
  const [showEmblemGuide, setShowEmblemGuide] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [hasFilledReflection, setHasFilledReflection] = useState(false);

  // Anti-Cheat System Hook (deteksi pindah tab, printscreen, copy teks)
  const { violationCount, activeAlert, dismissAlert } = useAntiCheat({
    studentId: student?.id,
    studentName: student?.displayName || studentName,
    classCode: student?.classCode || '2A',
    levelId: 'taman-pancasila',
    enabled: currentStep !== 'intro' && currentStep !== 'result',
  });

  // Match Symbols state with randomization (acak)
  const [shuffledSymbols, setShuffledSymbols] = useState<typeof PANCASILA_SYMBOLS>(() =>
    shuffleArray(PANCASILA_SYMBOLS)
  );
  const [shuffledSilas, setShuffledSilas] = useState<typeof PANCASILA_SYMBOLS>(() =>
    shuffleArray(PANCASILA_SYMBOLS)
  );
  const [selectedSymbol, setSelectedSymbol] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [symbolAttempts, setSymbolAttempts] = useState(0);

  const handleReshuffleCards = () => {
    soundManager.playDialoguePop();
    setSelectedSymbol(null);
    setShuffledSymbols(shuffleArray(PANCASILA_SYMBOLS));
    setShuffledSilas(shuffleArray(PANCASILA_SYMBOLS));
    setCustomGuideText('🔀 Kartu berhasil diacak ulang! Ayo pasangkan simbol dan silanya!');
  };

  // Scenario state
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedScenarioOpt, setSelectedScenarioOpt] = useState<string | null>(null);
  const [scenarioFeedback, setScenarioFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [scenarioCorrectCount, setScenarioCorrectCount] = useState(0);

  // Character emotional dialogue control
  const [guideEmotion, setGuideEmotion] = useState<EmotionState>('idle');
  const [customGuideText, setCustomGuideText] = useState<string | null>(null);

  // Celebration state
  const [stars, setStars] = useState(3);
  const [totalScore, setTotalScore] = useState(100);
  const [earnedXP, setEarnedXP] = useState(150);

  // Handle symbol card selection
  const handleSelectSymbol = (silaNum: number) => {
    soundManager.playClick();
    if (matchedPairs.includes(silaNum)) return;
    setSelectedSymbol(silaNum);
    setGuideEmotion('thinking');
    const symbolInfo = PANCASILA_SYMBOLS.find((s) => s.silaNumber === silaNum);
    setCustomGuideText(`Kamu memilih simbol ${symbolInfo?.symbolName}. Sekarang, ketuk Sila Pancasila yang cocok ya!`);
  };

  // Handle sila card selection for matching
  const handleSelectSila = (silaNum: number) => {
    soundManager.playClick();
    if (selectedSymbol === null || matchedPairs.includes(silaNum)) return;

    setSymbolAttempts((prev) => prev + 1);

    if (selectedSymbol === silaNum) {
      // MATCH SUCCESS!
      soundManager.playSuccess();
      const newMatches = [...matchedPairs, silaNum];
      setMatchedPairs(newMatches);
      setSelectedSymbol(null);
      setGuideEmotion('happy');

      const matchedItem = PANCASILA_SYMBOLS.find((s) => s.silaNumber === silaNum);
      setCustomGuideText(
        `⭐ Hebat! Simbol ${matchedItem?.symbolName} cocok sekali dengan ${matchedItem?.silaTitle}: "${matchedItem?.silaText}".`
      );

      // Check if all 5 are matched
      if (newMatches.length === 5) {
        soundManager.playCelebration();
        setTimeout(() => {
          setGuideEmotion('happy');
          setCustomGuideText('🌟 Luar biasa! Seluruh simbol sila Pancasila berhasil dicocokkan! Sekarang mari selesaikan misi cerita!');
        }, 1200);
      }
    } else {
      // MISMATCH
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      setCustomGuideText('Belum tepat sahabat. Jangan menyerah, yuk perhatikan lambang dan silanya lagi!');
      setSelectedSymbol(null);
    }
  };

  // Handle scenario answer selection
  const handleSelectScenarioOption = (opt: { id: string; text: string; isCorrect: boolean; feedback: string }) => {
    if (selectedScenarioOpt) return; // prevent multi-click
    setSelectedScenarioOpt(opt.id);

    // Simpan ke log aktivitas guru
    if (student) {
      gameDb.logAttempt({
        studentId: student.id,
        studentName: student.displayName,
        classCode: student.classCode,
        levelId: 'taman-pancasila',
        questionId: SCENARIOS[scenarioIndex].id,
        questionText: SCENARIOS[scenarioIndex].question,
        selectedAnswer: opt.text,
        isCorrect: opt.isCorrect,
        scoreAwarded: opt.isCorrect ? 33 : 0,
        attemptNumber: 1,
      });
    }

    if (opt.isCorrect) {
      soundManager.playSuccess();
      setGuideEmotion('happy');
      setScenarioCorrectCount((prev) => prev + 1);
      setScenarioFeedback({ isCorrect: true, text: opt.feedback });
      setCustomGuideText(`🌟 Hore! ${opt.feedback}`);
    } else {
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      setScenarioFeedback({ isCorrect: false, text: opt.feedback });
      setCustomGuideText(`💡 Belum tepat. ${opt.feedback} Ayo pelajari dan ingat untuk berikutnya!`);
    }
  };

  // Next scenario or finish
  const handleNextScenario = () => {
    soundManager.playDialoguePop();
    setSelectedScenarioOpt(null);
    setScenarioFeedback(null);

    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex((prev) => prev + 1);
      setGuideEmotion('idle');
      setCustomGuideText(null);
    } else {
      // Final calculation (5 Simbol + 5 Soal Cerita)
      const perfectSymbolBonus = symbolAttempts <= 6 ? 1 : 0;
      const calculatedStars = Math.max(1, Math.min(3, 1 + (scenarioCorrectCount >= 3 ? 1 : 0) + (scenarioCorrectCount === 5 ? 1 : perfectSymbolBonus)));
      const calculatedScore = Math.min(100, Math.round((matchedPairs.length * 10 + scenarioCorrectCount * 10)));
      const calculatedXP = 100 + calculatedStars * 30;

      setStars(calculatedStars);
      setTotalScore(calculatedScore);
      setEarnedXP(calculatedXP);
      setCurrentStep('result');
      soundManager.playCelebration();
      setGuideEmotion('happy');
      setCustomGuideText(`🎉 Selamat ${studentName}! Kamu berhasil menuntaskan misi di Taman Pancasila dengan ${calculatedStars} Bintang Kerukunan!`);

      onCompleteLevel({
        stars: calculatedStars,
        score: calculatedScore,
        xp: calculatedXP,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col">
      {/* Scenic Top Background Banner */}
      <div className="relative h-44 sm:h-64 w-full overflow-hidden shadow-md">
        <img
          src={TAMAN_BG}
          alt="Taman Pancasila"
          referrerPolicy="no-referrer"
          onError={createSafeImageErrorHandler('taman')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

        {/* Top Header Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onBackToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 text-xs sm:text-sm font-black shadow-md backdrop-blur-sm transition-transform active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Peta Sekolah</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md">
              <Star className="w-4 h-4 fill-amber-950" />
              <span>Misi 1: PPKn</span>
            </div>
          </div>
        </div>

        {/* Title over banner */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-red-600 font-bold text-[11px] uppercase tracking-wider text-white">
              Tema 1: Hidup Rukun di Sekolah
            </span>
            <span className="text-xs text-amber-300 font-bold">Kelas 2 SD</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black drop-shadow-md flex items-center gap-2">
            🌳 Taman Pancasila
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-1">
            Mengenal simbol sila-sila Pancasila dan mempraktikkan kerukunan bersama Uciel
          </p>
        </div>
      </div>

      {/* Watermark Pencegah Foto Layar Diam-diam */}
      {(currentStep === 'match_symbols' || currentStep === 'scenarios') && (
        <AntiCheatWatermark
          studentName={student?.displayName || studentName}
          studentCode={student?.studentCode}
          classCode={student?.classCode || '2A'}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4 relative z-10">
        {/* Anti-Cheat Supervision Banner during active quiz missions */}
        {(currentStep === 'match_symbols' || currentStep === 'scenarios') && (
          <AntiCheatBanner violationCount={violationCount} />
        )}

        {/* Interactive Guide Character Component */}
        <GuideCharacter
          guide={getUcielForLocation('taman-pancasila')}
          activeEmotion={guideEmotion}
          customDialogue={customGuideText}
          onRequestHint={() => {
            if (currentStep === 'match_symbols') {
              setCustomGuideText('💡 Petunjuk Uciel: Bintang adalah Sila ke-1, Rantai Sila ke-2, Pohon Sila ke-3, Banteng Sila ke-4, dan Padi Kapas Sila ke-5!');
            } else if (currentStep === 'scenarios') {
              setCustomGuideText(`💡 Petunjuk Uciel: ${SCENARIOS[scenarioIndex].hint}`);
            }
          }}
        />

        {/* STAGE 1: INTRO MISSION OVERVIEW */}
        {currentStep === 'intro' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-red-200 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 font-black text-xl">
                🛡️
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-800">
                  Tujuan Petualangan di Taman Pancasila
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Selesaikan 2 Misi untuk meraih 3 Bintang Kerukunan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                    Misi 1: Pasangkan 5 Simbol Sila
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                    Cocokkan Bintang, Rantai, Pohon Beringin, Kepala Banteng, dan Padi Kapas dengan sila yang tepat.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                    Misi 2: Kisah Sahabat Rukun
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                    Pilih sikap terpuji dalam cerita sehari-hari anak kelas 2 di sekolah.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShuffledSymbols(shuffleArray(PANCASILA_SYMBOLS));
                  setShuffledSilas(shuffleArray(PANCASILA_SYMBOLS));
                  setCurrentStep('match_symbols');
                  setGuideEmotion('talking');
                  setCustomGuideText('Ayo pasangkan simbol dan Sila Pancasila! Urutan kartu telah diacak agar semakin seru!');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base sm:text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mx-auto"
              >
                <span>Mulai Misi 1: Mencocokkan Simbol (Acak)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: MATCH SYMBOLS INTERACTIVE GAME */}
        {currentStep === 'match_symbols' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-amber-200 space-y-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
                  Misi 1 dari 2
                </span>
                <h2 className="text-base sm:text-xl font-black text-gray-800">
                  Mencocokkan Simbol & Sila Pancasila
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowEmblemGuide(true)}
                  title="Lihat detail lambang asli Garuda Pancasila"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 font-black text-xs transition-colors shadow-xs active:scale-95"
                >
                  <Info className="w-3.5 h-3.5 text-red-700" />
                  <span>Lambang Asli</span>
                </button>
                <button
                  type="button"
                  onClick={handleReshuffleCards}
                  title="Acak ulang posisi kartu simbol dan sila"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs transition-colors shadow-xs active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Acak Kartu</span>
                </button>
                <span className="text-xs font-bold text-gray-500">Tercocokkan:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm">
                  {matchedPairs.length} / 5
                </span>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs sm:text-sm text-amber-900 font-bold">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>(1) Ketuk Kartu Simbol Asli ➡️ (2) Ketuk Sila Pancasila yang cocok. Urutan kartu diacak!</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black flex items-center gap-1">
                <Shuffle className="w-3 h-3" /> Mode Acak
              </span>
            </div>

            {/* Matching Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Shuffled Symbol Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-wide">
                    Kartu Simbol Garuda Asli (Diacak):
                  </h3>
                  <span className="text-[10px] text-gray-400 font-semibold">Pilih satu lambang</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {shuffledSymbols.map((sym) => {
                    const isMatched = matchedPairs.includes(sym.silaNumber);
                    const isSelected = selectedSymbol === sym.silaNumber;

                    return (
                      <button
                        key={`sym-${sym.silaNumber}`}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleSelectSymbol(sym.silaNumber)}
                        className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 opacity-60 cursor-default'
                            : isSelected
                            ? 'bg-amber-100 border-amber-500 scale-[1.02] shadow-md ring-2 ring-amber-400'
                            : 'bg-white hover:bg-slate-50 border-gray-200 active:scale-[0.99] shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PancasilaEmblem silaNumber={sym.silaNumber} size="md" />
                          <div>
                            <div className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                              {sym.symbolName}
                              {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div className="text-[11px] text-gray-500 font-semibold line-clamp-1">
                              {sym.shieldDesc}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <VoiceReadButton
                            text={`Simbol ${sym.symbolName}. ${sym.shieldDesc}. Makna: ${sym.meaning}`}
                            speechKey={`sym-audio-${sym.silaNumber}`}
                            variant="icon"
                            size="xs"
                            title={`Dengarkan penjelasan simbol ${sym.symbolName}`}
                          />
                          {isSelected && !isMatched && (
                            <span className="px-2 py-0.5 text-[11px] font-black rounded-md bg-amber-500 text-white animate-pulse">
                              Dipilih
                            </span>
                          )}
                          {isMatched && (
                            <span className="text-xs font-black text-emerald-600">✓ Selesai</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Shuffled Sila Text Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-wide">
                    Sila Pancasila (Diacak):
                  </h3>
                  <span className="text-[10px] text-gray-400 font-semibold">Cocokkan bunyi sila</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {shuffledSilas.map((sila) => {
                    const isMatched = matchedPairs.includes(sila.silaNumber);

                    return (
                      <button
                        key={`sila-${sila.silaNumber}`}
                        type="button"
                        disabled={isMatched || selectedSymbol === null}
                        onClick={() => handleSelectSila(sila.silaNumber)}
                        className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 opacity-60 cursor-default'
                            : selectedSymbol !== null
                            ? 'bg-white hover:bg-amber-50 border-amber-300 active:scale-[0.99] shadow-sm cursor-pointer'
                            : 'bg-gray-50 border-gray-200 opacity-80 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-extrabold text-[11px]">
                              {sila.silaTitle}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
                            "{sila.silaText}"
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <VoiceReadButton
                            text={`${sila.silaTitle}: ${sila.silaText}`}
                            speechKey={`sila-audio-${sila.silaNumber}`}
                            variant="icon"
                            size="xs"
                            title={`Dengarkan bunyi ${sila.silaTitle}`}
                          />
                          {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Button to proceed once 5 pairs matched */}
            {matchedPairs.length === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-3 text-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setCurrentStep('scenarios');
                    setGuideEmotion('talking');
                    setCustomGuideText('Hebat! Sekarang bantulah Uciel dan teman-teman menyelesaikan cerita hidup rukun di sekolah.');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Lanjut ke Misi 2: Kisah Sahabat Rukun</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STAGE 3: SCENARIOS (KASUS HIDUP RUKUN) */}
        {currentStep === 'scenarios' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-emerald-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  Misi 2: Kisah Rukun {scenarioIndex + 1} dari {SCENARIOS.length}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-500">
                Skor Benar: {scenarioCorrectCount}
              </span>
            </div>

            {/* Voice Guidance Banner */}
            <QuestionVoiceBanner
              situationOrContext={SCENARIOS[scenarioIndex].context}
              question={SCENARIOS[scenarioIndex].question}
              options={SCENARIOS[scenarioIndex].options}
              questionId={`taman-${SCENARIOS[scenarioIndex].id}`}
            />

            {/* Scenario Prompt */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {SCENARIOS[scenarioIndex].title}
                </span>
                <VoiceReadButton
                  text={`${SCENARIOS[scenarioIndex].context}. Pertanyaan: ${SCENARIOS[scenarioIndex].question}`}
                  speechKey={`sc-q-${SCENARIOS[scenarioIndex].id}`}
                  size="xs"
                  label="Dengarkan Cerita"
                />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-700">
                "{SCENARIOS[scenarioIndex].context}"
              </p>
              <h3 className="text-base sm:text-lg font-black text-gray-900 pt-1">
                ❓ {SCENARIOS[scenarioIndex].question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {SCENARIOS[scenarioIndex].options.map((opt, optIdx) => {
                const isSelected = selectedScenarioOpt === opt.id;
                let optStyles = 'bg-white hover:bg-slate-50 border-gray-200 text-gray-800';

                if (selectedScenarioOpt) {
                  if (opt.isCorrect) {
                    optStyles = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-300';
                  } else if (isSelected) {
                    optStyles = 'bg-rose-50 border-rose-300 text-rose-900 opacity-90';
                  } else {
                    optStyles = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={selectedScenarioOpt !== null}
                    onClick={() => handleSelectScenarioOption(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${optStyles} active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-3 flex-1 pr-2">
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-gray-600 flex-shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm sm:text-base font-bold">{opt.text}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <VoiceReadButton
                        text={`Pilihan ${String.fromCharCode(65 + optIdx)}: ${opt.text}`}
                        speechKey={`sc-opt-${SCENARIOS[scenarioIndex].id}-${opt.id}`}
                        variant="icon"
                        size="xs"
                        title="Dengarkan pilihan ini"
                      />
                      {selectedScenarioOpt && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                      {selectedScenarioOpt && isSelected && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {scenarioFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3"
              >
                <div
                  className={`text-xs sm:text-sm font-extrabold px-3 py-2 rounded-xl flex items-center gap-2 ${
                    scenarioFeedback.isCorrect
                      ? 'text-emerald-900 bg-emerald-100'
                      : 'text-amber-900 bg-amber-100'
                  }`}
                >
                  <span>{scenarioFeedback.isCorrect ? '✅' : '💡'}</span>
                  <span>{scenarioFeedback.text}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextScenario}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <span>{scenarioIndex < SCENARIOS.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Petualangan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STAGE 4: RESULT CELEBRATION */}
        {currentStep === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-300 text-center space-y-6"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center">
                  <Award className="w-12 h-12 text-amber-500" />
                  <span className="text-[11px] font-black uppercase text-amber-700 mt-1">Lencana Selesai</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                ✨
              </motion.div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Selamat, {studentName}! 🎉
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">
                Kamu telah menyelesaikan petualangan di Taman Pancasila dengan sangat baik!
              </p>
            </div>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3].map((starNum) => (
                <motion.div
                  key={starNum}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: starNum * 0.2 }}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md ${
                    starNum <= stars
                      ? 'bg-amber-400 text-amber-950 ring-4 ring-yellow-200'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Star className={`w-8 h-8 sm:w-10 sm:h-10 ${starNum <= stars ? 'fill-amber-950' : 'fill-gray-300'}`} />
                </motion.div>
              ))}
            </div>

            {/* Score and XP Stats */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-700">Nilai Misi</div>
                <div className="text-xl sm:text-2xl font-black text-amber-900">{totalScore}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700">XP Diperoleh</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-900">+{earnedXP}</div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-xs font-bold text-blue-700">Kerukunan</div>
                <div className="text-xl sm:text-2xl font-black text-blue-900">100%</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  // Reset state to replay
                  setCurrentStep('match_symbols');
                  setShuffledSymbols(shuffleArray(PANCASILA_SYMBOLS));
                  setShuffledSilas(shuffleArray(PANCASILA_SYMBOLS));
                  setMatchedPairs([]);
                  setSelectedSymbol(null);
                  setScenarioIndex(0);
                  setSelectedScenarioOpt(null);
                  setScenarioFeedback(null);
                  setScenarioCorrectCount(0);
                  setGuideEmotion('idle');
                  setCustomGuideText('Kartu berhasil diacak ulang! Ayo pasangkan simbol dan silanya!');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi untuk Berlatih</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowReflectionModal(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <span>📝 Isi Refleksi Belajar untuk Guru ✨</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!hasFilledReflection) {
                    setShowReflectionModal(true);
                  } else {
                    onBackToMap();
                  }
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                <span>Kembali ke Peta Sekolah</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL REFLEKSI PEMBELAJARAN UNTUK DASHBOARD GURU */}
      <StudentReflectionModal
        isOpen={showReflectionModal}
        student={student}
        studentName={student?.nickname || studentName}
        levelId="taman-pancasila"
        levelName="Misi 1: Taman Pancasila (PPKn)"
        onClose={() => {
          setShowReflectionModal(false);
          setHasFilledReflection(true);
        }}
        onSubmitted={() => {
          setHasFilledReflection(true);
        }}
      />

      {/* MODAL PANDUAN LAMBANG ASLI PERISAI GARUDA PANCASILA */}
      {showEmblemGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border-4 border-amber-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-lg">
                  🇮🇩
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-gray-900">
                    5 Lambang Asli Perisai Garuda Pancasila
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    Pedoman Resmi Lambang Negara Kesatuan Republik Indonesia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmblemGuide(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {PANCASILA_SYMBOLS.map((sym) => (
                <div
                  key={`guide-sym-${sym.silaNumber}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 flex items-start gap-3.5"
                >
                  <PancasilaEmblem silaNumber={sym.silaNumber} size="lg" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-black text-xs">
                        {sym.silaTitle}
                      </span>
                      <VoiceReadButton
                        text={`${sym.silaTitle}: ${sym.silaText}. Lambangnya adalah ${sym.symbolName}. ${sym.shieldDesc}. Makna: ${sym.meaning}`}
                        speechKey={`guide-audio-${sym.silaNumber}`}
                        variant="icon"
                        size="xs"
                        title={`Dengarkan penjelasan ${sym.silaTitle}`}
                      />
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-gray-900">
                      "{sym.silaText}"
                    </h4>
                    <p className="text-xs font-bold text-amber-900">
                      🎨 Bentuk Lambang: {sym.shieldDesc}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold">
                      💡 Pengamalan: {sym.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowEmblemGuide(false)}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-transform active:scale-95"
              >
                Tutup Panduan Lambang
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
