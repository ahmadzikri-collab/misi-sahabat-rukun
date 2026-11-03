import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Compass,
  RotateCcw,
  Shuffle,
  Sparkles,
  Palette,
  Layers,
} from 'lucide-react';
import { GuideCharacter } from '../character/GuideCharacter';
import { VoiceReadButton } from '../audio/VoiceReadButton';
import { QuestionVoiceBanner } from '../audio/QuestionVoiceBanner';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { AntiCheatWatermark } from '../anticheat/AntiCheatWatermark';
import { AntiCheatBanner } from '../anticheat/AntiCheatBanner';
import { getUcielForLocation, STUDIO_BG } from '../../data/characters';
import { createSafeImageErrorHandler } from '../../utils/assets';
import { EmotionState, StudentProfile } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { gameDb } from '../../services/db';
import { StudentReflectionModal } from '../StudentReflectionModal';
import { getVariedOptions, shuffleArray } from '../../utils/quiz';

interface StudioKreatifLevelProps {
  student?: StudentProfile | null;
  studentName?: string;
  onCompleteLevel: (result: { stars: number; score: number; xp: number }) => void;
  onBackToMap: () => void;
}

// Data Menjodohkan SBdP Kelas 2 SD (Karya Seni 2D/3D & Bahan Kolase)
export interface ArtMatchingPair {
  id: number;
  term: string;
  category: string;
  icon: string;
  shortDesc: string;
  matchTarget: string;
  exampleItems: string;
  color: string;
}

const ART_MATCHING_PAIRS: ArtMatchingPair[] = [
  {
    id: 1,
    term: 'Karya Seni 2 Dimensi (2D)',
    category: 'Seni Rupa Datar',
    icon: '🖼️',
    shortDesc: 'Hanya memiliki panjang & lebar di bidang datar',
    matchTarget: 'Gambar di Buku Gambar & Lukisan Kertas',
    exampleItems: 'Hanya dapat dinikmati dari satu arah depan',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 2,
    term: 'Karya Seni 3 Dimensi (3D)',
    category: 'Seni Rupa Bervolume',
    icon: '🏺',
    shortDesc: 'Memiliki panjang, lebar, dan volume/ruang tebal',
    matchTarget: 'Patung Tanah Liat, Vas Bunga, & Plastisin',
    exampleItems: 'Dapat dilihat dan disentuh dari berbagai arah',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 3,
    term: 'Bahan Alami Kolase',
    category: 'Dari Alam Sekitar',
    icon: '🍂',
    shortDesc: 'Bahan yang diperoleh langsung dari tumbuhan & alam',
    matchTarget: 'Biji Jagung, Kacang Hijau, & Daun Kering',
    exampleItems: 'Aman, ramah lingkungan, dan mudah didapat',
    color: 'from-emerald-500 to-green-600',
  },
  {
    id: 4,
    term: 'Bahan Buatan Kerajinan',
    category: 'Buatan Manusia',
    icon: '✂️',
    shortDesc: 'Bahan olahan manusia dengan warna-warni menarik',
    matchTarget: 'Kertas Lipat Origami, Plastisin Lilin, & Sedotan',
    exampleItems: 'Mudah dipotong, dilipat, dan dibentuk bersama teman',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 5,
    term: 'Karya Seni Kolase',
    category: 'Teknik Menempel',
    icon: '🎨',
    shortDesc: 'Seni rupa dengan menempel bahan pada pola gambar',
    matchTarget: 'Menempelkan Biji-bijian & Kertas pada Gambar Burung Garuda',
    exampleItems: 'Melatih kerapian, kesabaran, dan kerja sama rukun',
    color: 'from-rose-500 to-pink-600',
  },
];

// Soal Cerita SBdP & Kerukunan (Pilihan Ganda dengan Variasi Jawaban Benar)
const ART_CHALLENGES = [
  {
    id: 'studio-1',
    description: 'Lukisan pemandangan taman sekolah yang digambar di atas selembar kertas buku gambar.',
    question: 'Karya seni di atas termasuk jenis karya seni apa?',
    options: [
      { id: 'opt-2', text: 'Karya Tiga Dimensi (3D)', isCorrect: false, feedback: 'Kurang tepat. Gambar di kertas tidak memiliki ketebalan ruang nyata.' },
      { id: 'opt-3', text: 'Benda Elektronik', isCorrect: false, feedback: 'Kertas gambar bukan barang elektronik.' },
      { id: 'opt-1', text: 'Karya Dua Dimensi (2D) — hanya memiliki panjang dan lebar', isCorrect: true, feedback: 'Tepat sekali! Gambar di atas kertas adalah karya 2 dimensi karena hanya bisa dilihat dari arah depan.' },
    ],
    hint: 'Karya 2D hanya memiliki panjang dan lebar di permukaan datar.',
  },
  {
    id: 'studio-2',
    description: 'Vas bunga dan patung burung garuda yang dibentuk dari tanah liat atau plastisin lilin mainan.',
    question: 'Benda seni tersebut termasuk contoh karya apa?',
    options: [
      { id: 'opt-3', text: 'Gambar lukisan datar di buku', isCorrect: false, feedback: 'Patung tanah liat adalah benda nyata bervolume, bukan lukisan datar.' },
      { id: 'opt-1', text: 'Karya Tiga Dimensi (3D) — memiliki panjang, lebar, dan volume tebal', isCorrect: true, feedback: 'Benar sekali! Patung dan vas memiliki ruang dan dapat dilihat dari segala sisi!' },
      { id: 'opt-2', text: 'Karya Satu Dimensi', isCorrect: false, feedback: 'Patung memiliki ruang dan ketebalan, jadi karya 3 dimensi.' },
    ],
    hint: 'Karya 3 dimensi memiliki ruang atau volume dan bisa dipegang dari segala arah.',
  },
  {
    id: 'studio-3',
    description: 'Saat membuat karya hiasan kolase bersama kelompok, Dayu dan teman-teman mengumpulkan biji jagung, biji kacang hijau, dan daun kering.',
    question: 'Biji-bijian dan daun kering tersebut termasuk jenis bahan apa?',
    options: [
      { id: 'opt-1', text: 'Bahan Alami (berasal langsung dari alam tumbuhan)', isCorrect: true, feedback: 'Hebat! Biji dan daun kering adalah bahan alami yang indah untuk kolase kerukunan!' },
      { id: 'opt-2', text: 'Bahan Plastik buatan pabrik', isCorrect: false, feedback: 'Biji dan daun berasal dari alam tumbuhan, bukan pabrik plastik.' },
      { id: 'opt-3', text: 'Kaca berbahaya', isCorrect: false, feedback: 'Bahan kolase anak SD menggunakan bahan alami yang aman.' },
    ],
    hint: 'Bahan yang berasal langsung dari tumbuhan atau alam disebut bahan alami.',
  },
  {
    id: 'studio-4',
    description: 'Siti dan Dayu menempelkan berbagai biji-bijian dan potongan kertas warna-warni pada gambar pola burung garuda hingga tertutup rapi.',
    question: 'Karya seni rupa dua dimensi yang dibuat dengan teknik menempel bahan pada pola gambar disebut:',
    options: [
      { id: 'opt-3', text: 'Origami lipat tanpa lem', isCorrect: false, feedback: 'Origami adalah seni melipat kertas, bukan menempel bahan pada pola gambar.' },
      { id: 'opt-2', text: 'Pahatan Batu Keras', isCorrect: false, feedback: 'Memahat batu adalah seni patung 3D, bukan seni tempel kolase.' },
      { id: 'opt-1', text: 'Karya Seni Kolase (seni tempel bahan pada pola)', isCorrect: true, feedback: 'Tepat sekali! Kolase dibuat dengan menempelkan bahan alami atau buatan pada pola gambar.' },
    ],
    hint: 'Seni menempel berbagai bahan pada permukaan gambar disebut kolase.',
  },
  {
    id: 'studio-5',
    description: 'Lani dan Edo selesai mewarnai gambar imajinatif tentang kerja sama di kelas. Gambar Lani rapi dan gambar Edo berwarna cerah.',
    question: 'Bagaimana sikap hidup rukun yang baik terhadap hasil karya seni teman sebangku?',
    options: [
      { id: 'opt-2', text: 'Mencoret dan merusak gambar teman karena iri', isCorrect: false, feedback: 'Merusak karya teman perbuatan buruk dan merusak kerukunan.' },
      { id: 'opt-1', text: 'Saling memuji, menghargai keindahan karya, dan tetap rukun', isCorrect: true, feedback: 'Luar biasa! Menghargai dan memberi apresiasi pada karya teman adalah wujud nyata persahabatan rukun!' },
      { id: 'opt-3', text: 'Mengejek dan membandingkan secara sombong', isCorrect: false, feedback: 'Sombong dan mengejek bertentangan dengan sikap sahabat rukun.' },
    ],
    hint: 'Sahabat yang baik saling memberi pujian dan menghargai karya satu sama lain.',
  },
];

export const StudioKreatifLevel: React.FC<StudioKreatifLevelProps> = ({
  student = null,
  studentName = 'Sahabat Juara',
  onCompleteLevel,
  onBackToMap,
}) => {
  // Game Steps: 'intro' -> 'match_pairs' -> 'quiz' -> 'result'
  const [currentStep, setCurrentStep] = useState<'intro' | 'match_pairs' | 'quiz' | 'result'>('intro');
  const [quizSeed, setQuizSeed] = useState(0);

  // Anti-Cheat System Hook (deteksi pindah tab, printscreen, copy teks)
  const { violationCount } = useAntiCheat({
    studentId: student?.id,
    studentName: student?.displayName || studentName,
    classCode: student?.classCode || '2A',
    levelId: 'studio-kreatif',
    enabled: currentStep === 'match_pairs' || currentStep === 'quiz',
  });

  // State Misi 1: Menjodohkan Karya Seni & Bahan
  const [shuffledTerms, setShuffledTerms] = useState<ArtMatchingPair[]>(() =>
    shuffleArray(ART_MATCHING_PAIRS)
  );
  const [shuffledTargets, setShuffledTargets] = useState<ArtMatchingPair[]>(() =>
    shuffleArray(ART_MATCHING_PAIRS)
  );
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [mismatchTargetId, setMismatchTargetId] = useState<number | null>(null);

  // State Misi 2: Kuis Pilihan Ganda
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Character emotional dialogue control
  const [guideEmotion, setGuideEmotion] = useState<EmotionState>('idle');
  const [customText, setCustomText] = useState<string | null>(null);

  // Celebration state
  const [stars, setStars] = useState(3);
  const [totalScore, setTotalScore] = useState(100);
  const [earnedXP, setEarnedXP] = useState(150);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [, setHasFilledReflection] = useState(false);

  const uciel = getUcielForLocation('studio-kreatif');
  const currentChallenge = ART_CHALLENGES[challengeIdx];

  // Pilihan Ganda dengan Posisi Jawaban Benar Bervariasi (tidak selalu A atau B)
  const currentVariedOptions = React.useMemo(() => {
    return getVariedOptions(currentChallenge.options, challengeIdx, quizSeed);
  }, [challengeIdx, currentChallenge.id, quizSeed]);

  // Reshuffle untuk Misi Menjodohkan
  const handleReshufflePairs = () => {
    soundManager.playDialoguePop();
    setSelectedTermId(null);
    setMismatchTargetId(null);
    setShuffledTerms(shuffleArray(ART_MATCHING_PAIRS));
    setShuffledTargets(shuffleArray(ART_MATCHING_PAIRS));
    setCustomText('🔀 Kartu seni berhasil diacak ulang! Ayo pasangkan istilah dan contohnya!');
  };

  // Pilih kartu istilah di kolom kiri
  const handleSelectTerm = (id: number) => {
    soundManager.playClick();
    if (matchedPairs.includes(id)) return;

    if (selectedTermId === id) {
      setSelectedTermId(null);
      setGuideEmotion('idle');
      setCustomText('Pilih salah satu kartu istilah karya seni di sebelah kiri ya!');
      return;
    }

    setSelectedTermId(id);
    setGuideEmotion('thinking');
    const item = ART_MATCHING_PAIRS.find((p) => p.id === id);
    setCustomText(`✨ Kamu memilih "${item?.term}". Sekarang ketuk contoh atau penjelasan yang cocok di kolom kanan!`);
  };

  // Pilih kartu contoh di kolom kanan untuk mencocokkan
  const handleSelectTarget = (id: number) => {
    soundManager.playClick();
    if (selectedTermId === null || matchedPairs.includes(id)) return;

    if (selectedTermId === id) {
      // COCOK!
      soundManager.playSuccess();
      const newMatches = [...matchedPairs, id];
      setMatchedPairs(newMatches);
      setSelectedTermId(null);
      setMismatchTargetId(null);
      setGuideEmotion('happy');

      const matchedItem = ART_MATCHING_PAIRS.find((p) => p.id === id);
      setCustomText(`⭐ Hebat! "${matchedItem?.term}" cocok sekali dengan "${matchedItem?.matchTarget}".`);

      if (newMatches.length === ART_MATCHING_PAIRS.length) {
        soundManager.playCelebration();
        setTimeout(() => {
          setGuideEmotion('happy');
          setCustomText('🌟 Luar biasa! Seluruh 5 pasang konsep karya seni berhasil dicocokkan! Sekarang ayo lanjutkan ke kuis kreatif!');
        }, 800);
      }
    } else {
      // MISMATCH
      setMismatchTargetId(id);
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      const selectedItem = ART_MATCHING_PAIRS.find((p) => p.id === selectedTermId);
      const clickedTarget = ART_MATCHING_PAIRS.find((p) => p.id === id);
      setCustomText(`💡 Belum tepat sahabat. "${selectedItem?.term}" belum cocok dengan "${clickedTarget?.matchTarget}". Ayo perhatikan dimensinya!`);

      setTimeout(() => {
        setMismatchTargetId(null);
        setSelectedTermId(null);
      }, 1000);
    }
  };

  // Menjawab soal kuis pilihan ganda
  const handleSelectOption = (opt: { id: string; text: string; isCorrect: boolean; feedback?: string }) => {
    if (selectedOptionId) return;
    setSelectedOptionId(opt.id);

    if (student) {
      gameDb.logAttempt({
        studentId: student.id,
        studentName: student.displayName,
        classCode: student.classCode,
        levelId: 'studio-kreatif',
        questionId: currentChallenge.id,
        questionText: currentChallenge.question,
        selectedAnswer: opt.text,
        isCorrect: opt.isCorrect,
        scoreAwarded: opt.isCorrect ? 20 : 0,
        attemptNumber: 1,
      });
    }

    if (opt.isCorrect) {
      soundManager.playSuccess();
      setGuideEmotion('happy');
      setCorrectCount((prev) => prev + 1);
      setFeedback({ isCorrect: true, text: opt.feedback || 'Jawaban tepat!' });
      setCustomText(`🎨 Warna-warni indah! ${opt.feedback}`);
    } else {
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      setFeedback({ isCorrect: false, text: opt.feedback || 'Kurang tepat.' });
      setCustomText(`💡 Belum tepat sahabat. ${opt.feedback} Ayo pelajari untuk berikutnya!`);
    }
  };

  const handleNextChallenge = () => {
    soundManager.playDialoguePop();
    setSelectedOptionId(null);
    setFeedback(null);

    if (challengeIdx < ART_CHALLENGES.length - 1) {
      setChallengeIdx((prev) => prev + 1);
      setGuideEmotion('idle');
      setCustomText(null);
    } else {
      // Perhitungan skor gabungan (5 Menjodohkan + 5 Kuis)
      const calculatedStars = Math.max(1, Math.min(3, 1 + (correctCount >= 3 ? 1 : 0) + (correctCount === 5 ? 1 : 0)));
      const calculatedScore = Math.min(100, Math.round(matchedPairs.length * 10 + correctCount * 10));
      const calculatedXP = 120 + calculatedStars * 30;

      setStars(calculatedStars);
      setTotalScore(calculatedScore);
      setEarnedXP(calculatedXP);
      setCurrentStep('result');
      soundManager.playCelebration();
      setGuideEmotion('happy');
      setCustomText(`🎉 Selamat ${studentName}! Kamu menuntaskan misi menjodohkan dan kuis seni di Studio Kreatif dengan ${calculatedStars} Bintang!`);

      onCompleteLevel({
        stars: calculatedStars,
        score: calculatedScore,
        xp: calculatedXP,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col">
      {/* Header Banner with High Quality Visual Illustration */}
      <div className="relative h-44 sm:h-64 w-full overflow-hidden shadow-md">
        <img
          src={STUDIO_BG}
          alt="Studio Kreatif"
          referrerPolicy="no-referrer"
          onError={createSafeImageErrorHandler('taman')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onBackToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 text-xs sm:text-sm font-black shadow-md backdrop-blur-sm transition-transform active:scale-95"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Peta Sekolah</span>
          </button>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>Misi 4: SBdP</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 text-white z-10">
          <span className="px-2 py-0.5 rounded-md bg-purple-500 font-bold text-[11px] uppercase tracking-wider text-white">
            Tema 1: Hidup Rukun • Seni Budaya & Prakarya
          </span>
          <h1 className="text-xl sm:text-3xl font-black drop-shadow-md flex items-center gap-2 mt-1">
            🎨 Studio Kreatif
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 line-clamp-1">
            Menjodohkan karya seni 2D/3D & bahan kolase serta kuis tantangan bersama Uciel
          </p>
        </div>
      </div>

      {/* Watermark Anti-Foto Layar */}
      {(currentStep === 'match_pairs' || currentStep === 'quiz') && (
        <AntiCheatWatermark
          studentName={student?.displayName || studentName}
          studentCode={student?.studentCode}
          classCode={student?.classCode || '2A'}
        />
      )}

      <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4 relative z-10">
        {/* Anti-Cheat Supervision Banner */}
        {(currentStep === 'match_pairs' || currentStep === 'quiz') && (
          <AntiCheatBanner violationCount={violationCount} />
        )}

        <GuideCharacter
          guide={uciel}
          activeEmotion={guideEmotion}
          customDialogue={customText}
          onRequestHint={() => {
            if (currentStep === 'match_pairs') {
              setCustomText('💡 Petunjuk Uciel: Ingat, karya 2D itu di kertas datar, karya 3D itu seperti patung bervolume, dan biji jagung adalah bahan alami!');
            } else if (currentChallenge) {
              setCustomText(`💡 Petunjuk Uciel: ${currentChallenge.hint}`);
            }
          }}
        />

        {/* STEP 1: INTRO MISSION OVERVIEW */}
        {currentStep === 'intro' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-purple-200 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl">
                🎭
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-800">
                  Tujuan Petualangan di Studio Kreatif
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Selesaikan 2 Misi untuk meraih 3 Bintang Seni Kerukunan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex gap-3">
                <span className="text-2xl">🧩</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-purple-950">
                    Misi 1: Menjodohkan Karya Seni & Bahan
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-800 mt-0.5">
                    Cocokkan istilah karya 2D/3D, bahan alami, bahan buatan, dan teknik kolase dengan tepat.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                    Misi 2: Kuis Tantangan Kreatif
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                    Pilih jawaban yang benar dari cerita karya seni dan sikap rukun menghargai karya teman.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShuffledTerms(shuffleArray(ART_MATCHING_PAIRS));
                  setShuffledTargets(shuffleArray(ART_MATCHING_PAIRS));
                  setCurrentStep('match_pairs');
                  setGuideEmotion('talking');
                  setCustomText('Mari kita mulai Misi 1! Pasangkan kartu istilah karya seni di sebelah kiri dengan contoh yang cocok di sebelah kanan!');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mx-auto"
              >
                <span>Mulai Misi 1: Menjodohkan Karya Seni</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: MENJODOHKAN KARYA SENI & BAHAN (MATCHING PAIRS) */}
        {currentStep === 'match_pairs' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-purple-200 space-y-5"
          >
            {/* Header & Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-black text-xs uppercase tracking-wider">
                  Misi 1 dari 2
                </span>
                <h2 className="text-base sm:text-xl font-black text-gray-800">
                  Menjodohkan Konsep & Karya Seni
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleReshufflePairs}
                  title="Acak ulang posisi kartu istilah dan contoh"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-black text-xs transition-colors shadow-xs active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5 text-purple-700" />
                  <span>Acak Posisi</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm">
                  <span>Tercocokkan:</span>
                  <span className="text-emerald-700">{matchedPairs.length} / 5</span>
                </div>
              </div>
            </div>

            {/* Token Progress Tracker */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-gray-600 uppercase tracking-wide">
                  Progres 5 Pasangan Seni:
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {matchedPairs.length === 5 ? '🎉 Semua Selesai!' : `${5 - matchedPairs.length} Pasangan tersisa`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {ART_MATCHING_PAIRS.map((pair) => {
                  const isDone = matchedPairs.includes(pair.id);
                  return (
                    <div
                      key={`token-${pair.id}`}
                      className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs font-black'
                          : 'bg-white border-slate-200 text-gray-400 font-bold'
                      }`}
                    >
                      <div className="text-xs sm:text-sm flex items-center gap-1">
                        {isDone ? <span>✓</span> : <span>○</span>}
                        <span>Pasang {pair.id}</span>
                      </div>
                      <span className="text-[10px] hidden sm:block truncate max-w-full opacity-90">
                        {pair.icon} {pair.term}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold transition-colors ${
                selectedTermId === null
                  ? 'bg-purple-50 border-purple-300 text-purple-950'
                  : 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedTermId === null ? '👈' : '👉'}</span>
                <div>
                  {selectedTermId === null ? (
                    <span>
                      <strong className="text-purple-900">Langkah 1:</strong> Ketuk salah satu{' '}
                      <strong>Kartu Istilah Seni</strong> di kolom kiri untuk memilih.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-blue-900">Langkah 2:</strong> Kamu memilih{' '}
                      <span className="underline font-black">
                        {ART_MATCHING_PAIRS.find((p) => p.id === selectedTermId)?.term}
                      </span>
                      . Sekarang ketuk <strong>Contoh / Penjelasan</strong> yang cocok di kolom kanan!
                    </span>
                  )}
                </div>
              </div>
              {selectedTermId !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedTermId(null)}
                  className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 text-[11px] font-black border border-blue-200 flex-shrink-0"
                >
                  Batal Pilih
                </button>
              )}
            </div>

            {/* 2 Interactive Columns: Symmetrical & Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Kolom Kiri: Istilah / Konsep Seni */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <h3 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wide">
                      Istilah / Konsep Seni (Diacak)
                    </h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold">5 Istilah</span>
                </div>

                <div className="space-y-3">
                  {shuffledTerms.map((item) => {
                    const isMatched = matchedPairs.includes(item.id);
                    const isSelected = selectedTermId === item.id;

                    return (
                      <button
                        key={`term-${item.id}`}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleSelectTerm(item.id)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border-2 flex items-center justify-between gap-2.5 min-h-[74px] sm:min-h-[78px] transition-all ${
                          isMatched
                            ? 'bg-emerald-50/90 border-emerald-300 shadow-none cursor-default opacity-90'
                            : isSelected
                            ? 'bg-purple-50 border-purple-500 scale-[1.01] shadow-md ring-3 ring-purple-300/80'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-400 active:scale-[0.99] shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                            {item.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5 leading-tight">
                              <span>{item.term}</span>
                              {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                              {item.shortDesc}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                  ✓ Cocok
                                </span>
                              ) : isSelected ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-[10px] animate-pulse">
                                  ✨ Terpilih - Ketuk Opsi Kanan
                                </span>
                              ) : (
                                <span className="text-[10px] text-purple-700 font-bold">
                                  Ketuk untuk memilih
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <VoiceReadButton
                            text={`${item.term}. ${item.shortDesc}`}
                            speechKey={`art-term-${item.id}`}
                            variant="icon"
                            size="xs"
                            title={`Dengarkan penjelasan ${item.term}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kolom Kanan: Benda & Contoh Nyata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wide">
                      Contoh Nyata / Penjelasan (Diacak)
                    </h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold">5 Contoh</span>
                </div>

                <div className="space-y-3">
                  {shuffledTargets.map((target) => {
                    const isMatched = matchedPairs.includes(target.id);
                    const isMismatch = mismatchTargetId === target.id;

                    return (
                      <button
                        key={`target-${target.id}`}
                        type="button"
                        disabled={isMatched || selectedTermId === null}
                        onClick={() => handleSelectTarget(target.id)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border-2 flex items-center justify-between gap-2.5 min-h-[74px] sm:min-h-[78px] transition-all ${
                          isMatched
                            ? 'bg-emerald-50/90 border-emerald-300 shadow-none cursor-default opacity-90'
                            : isMismatch
                            ? 'bg-rose-50 border-rose-400 ring-4 ring-rose-200 animate-bounce'
                            : selectedTermId !== null
                            ? 'bg-white hover:bg-purple-50/70 border-purple-300 hover:border-purple-500 active:scale-[0.99] shadow-sm cursor-pointer ring-1 ring-purple-200'
                            : 'bg-slate-50 border-slate-200 opacity-75 cursor-not-allowed'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-[11px]">
                              {target.category}
                            </span>
                            {isMatched && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Cocok!</span>
                              </span>
                            )}
                            {isMismatch && (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                                Belum Tepat!
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm font-black text-gray-900 leading-snug line-clamp-2">
                            "{target.matchTarget}"
                          </div>

                          {selectedTermId !== null && !isMatched && (
                            <div className="mt-1 text-[10px] font-bold text-purple-700 flex items-center gap-1">
                              <span>👆 Ketuk untuk pasangkan</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isMatched && (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-sm">
                              {target.icon}
                            </div>
                          )}
                          <VoiceReadButton
                            text={`${target.category}: ${target.matchTarget}`}
                            speechKey={`art-target-${target.id}`}
                            variant="icon"
                            size="xs"
                            title={`Dengarkan contoh ini`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selebrasi Misi 1 Selesai */}
            {matchedPairs.length === ART_MATCHING_PAIRS.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4 p-5 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl text-center space-y-3"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-2xl">
                  🎨
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black">
                    Luar Biasa! Semua Konsep Seni Berhasil Dipasangkan!
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-100 font-semibold max-w-lg mx-auto mt-1">
                    Kamu telah mengenali karya 2D, 3D, bahan alami, bahan buatan, dan teknik kolase dengan tepat. Ayo lanjut ke kuis tantangan kreatif!
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setCurrentStep('quiz');
                      setGuideEmotion('talking');
                      setCustomText('Hebat! Sekarang jawablah soal cerita tentang karya seni dan kerukunan bersama teman.');
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-purple-900 font-black text-sm sm:text-base shadow-lg hover:bg-purple-50 active:scale-95 transition-transform flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Lanjut ke Misi 2: Kuis Tantangan Seni</span>
                    <ArrowRight className="w-5 h-5 text-purple-700" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 3: KUIS PILIHAN GANDA (DENGAN VARIASI JAWABAN BENAR) */}
        {currentStep === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-purple-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                Misi 2: Kuis Seni {challengeIdx + 1} dari {ART_CHALLENGES.length}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Skor Benar: {correctCount}
              </span>
            </div>

            {/* Voice Guidance Banner */}
            <QuestionVoiceBanner
              situationOrContext={`Karya Seni: ${currentChallenge.description}`}
              question={currentChallenge.question}
              options={currentVariedOptions}
              questionId={`studio-${currentChallenge.id}-${quizSeed}`}
            />

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-600 block">Karya Seni:</span>
                <VoiceReadButton
                  text={`${currentChallenge.description}. Pertanyaan: ${currentChallenge.question}`}
                  speechKey={`studio-q-${currentChallenge.id}-${quizSeed}`}
                  size="xs"
                  label="Dengarkan Soal Seni"
                />
              </div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                "{currentChallenge.description}"
              </p>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-700 pt-1">
                ❓ {currentChallenge.question}
              </h3>
            </div>

            {/* Options with Varied A, B, C positions */}
            <div className="space-y-3">
              {currentVariedOptions.map((opt, optIdx) => {
                const isSelected = selectedOptionId === opt.id;
                let optStyles = 'bg-white hover:bg-slate-50 border-gray-200 text-gray-800';

                if (selectedOptionId) {
                  if (opt.isCorrect) {
                    optStyles = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black ring-2 ring-emerald-300';
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
                    disabled={selectedOptionId !== null}
                    onClick={() => handleSelectOption(opt)}
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
                        speechKey={`studio-opt-${currentChallenge.id}-${opt.id}-${quizSeed}`}
                        variant="icon"
                        size="xs"
                        title="Dengarkan pilihan ini"
                      />
                      {selectedOptionId && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                      {selectedOptionId && isSelected && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3"
              >
                <div
                  className={`text-xs sm:text-sm font-extrabold px-3 py-2 rounded-xl flex items-center gap-2 ${
                    feedback.isCorrect ? 'text-emerald-900 bg-emerald-100' : 'text-amber-900 bg-amber-100'
                  }`}
                >
                  <span>{feedback.isCorrect ? '✅' : '💡'}</span>
                  <span>{feedback.text}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextChallenge}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <span>{challengeIdx < ART_CHALLENGES.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: HASIL (RESULT) */}
        {currentStep === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-purple-300 text-center space-y-6"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-purple-500 p-1 shadow-xl flex items-center justify-center text-white">
              <Award className="w-16 h-16" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Luar Biasa Seniman Cilik, {studentName}! 🎨
              </h2>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                Kamu telah menuntaskan misi menjodohkan dan kuis seni 2D/3D di Studio Kreatif!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    s <= stars ? 'bg-amber-400 text-amber-950' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Star className={`w-8 h-8 ${s <= stars ? 'fill-amber-950' : 'fill-gray-300'}`} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-xs font-bold text-purple-700">Skor</div>
                <div className="text-2xl font-black text-purple-900">{totalScore}</div>
              </div>
              <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200">
                <div className="text-xs font-bold text-pink-700">XP</div>
                <div className="text-2xl font-black text-pink-900">+{earnedXP}</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Tombol Refleksi: Terbuka jika 5 misi selesai */}
              {student && gameDb.hasCompletedAllMissions(student.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setShowReflectionModal(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer ring-2 ring-purple-300 animate-pulse"
                >
                  <span>📝 Isi Refleksi Belajar untuk Guru (5 Misi Tuntas) ✨</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5">
                  <span>🔒</span>
                  <span>Refleksi Guru terbuka setelah 5 misi tuntas ({student ? gameDb.getCompletedMissionsCount(student.id) : 1}/5)</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep('match_pairs');
                  setMatchedPairs([]);
                  setSelectedTermId(null);
                  setShuffledTerms(shuffleArray(ART_MATCHING_PAIRS));
                  setShuffledTargets(shuffleArray(ART_MATCHING_PAIRS));
                  setChallengeIdx(0);
                  setQuizSeed((prev) => prev + 1);
                  setSelectedOptionId(null);
                  setFeedback(null);
                  setCorrectCount(0);
                  setGuideEmotion('idle');
                  setCustomText('Ayo kita berkreasi lagi! Soal dan pasangan seni sudah diacak ulang!');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi untuk Berlatih</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onBackToMap();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
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
        levelId="studio-kreatif"
        levelName="Misi 4: Studio Kreatif (SBdP)"
        onClose={() => {
          setShowReflectionModal(false);
          setHasFilledReflection(true);
        }}
        onSubmitted={() => {
          setHasFilledReflection(true);
        }}
      />
    </div>
  );
};
