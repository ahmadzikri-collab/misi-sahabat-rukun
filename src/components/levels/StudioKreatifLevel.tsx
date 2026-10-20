import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2, XCircle, Award, ArrowRight, Palette, Compass } from 'lucide-react';
import { GuideCharacter } from '../character/GuideCharacter';
import { getUcielForLocation } from '../../data/characters';
import { EmotionState, StudentProfile } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { gameDb } from '../../services/db';

interface StudioKreatifLevelProps {
  student?: StudentProfile | null;
  studentName?: string;
  onCompleteLevel: (result: { stars: number; score: number; xp: number }) => void;
  onBackToMap: () => void;
}

const ART_CHALLENGES = [
  {
    id: 'studio-1',
    description: 'Lukisan pemandangan taman sekolah yang digambar di atas selembar kertas buku gambar.',
    question: 'Karya seni di atas termasuk jenis karya seni apa?',
    options: [
      { id: 'opt-1', text: 'Karya Dua Dimensi (2D) — hanya memiliki panjang dan lebar', isCorrect: true, feedback: 'Tepat sekali! Gambar di atas kertas adalah karya 2 dimensi karena hanya bisa dilihat dari satu arah depan.' },
      { id: 'opt-2', text: 'Karya Tiga Dimensi (3D)', isCorrect: false, feedback: 'Kurang tepat. Gambar di kertas tidak memiliki ruang/volume tebal.' },
      { id: 'opt-3', text: 'Benda Elektronik', isCorrect: false, feedback: 'Kertas gambar bukan barang elektronik.' },
    ],
    hint: 'Karya 2D hanya memiliki panjang dan lebar di permukaan datar.',
  },
  {
    id: 'studio-2',
    description: 'Vas bunga dan patung burung garuda yang dibentuk dari tanah liat atau plastisin lilin mainan.',
    question: 'Benda seni tersebut termasuk contoh karya apa?',
    options: [
      { id: 'opt-1', text: 'Karya Tiga Dimensi (3D) — memiliki panjang, lebar, dan volume tebal', isCorrect: true, feedback: 'Benar sekali! Patung dan vas memiliki ruang dan dapat dilihat dari segala sisi (depan, samping, belakang)!' },
      { id: 'opt-2', text: 'Karya Satu Dimensi', isCorrect: false, feedback: 'Patung memiliki ketebalan dan volume, jadi karya 3 dimensi.' },
      { id: 'opt-3', text: 'Gambar lukisan datar', isCorrect: false, feedback: 'Patung tanah liat adalah benda nyata, bukan lukisan datar.' },
    ],
    hint: 'Karya 3 dimensi memiliki ruang atau volume dan bisa dipegang dari segala arah.',
  },
  {
    id: 'studio-3',
    description: 'Saat membuat karya hiasan kolase bersama kelompok, Dayu dan teman-teman mengumpulkan biji jagung, biji kacang hijau, dan daun kering.',
    question: 'Biji-bijian dan daun kering tersebut termasuk jenis bahan apa?',
    options: [
      { id: 'opt-1', text: 'Bahan Alami (berasal langsung dari alam tumbuhan)', isCorrect: true, feedback: 'Hebat! Biji dan daun kering adalah bahan alami yang indah untuk kolase kerukunan!' },
      { id: 'opt-2', text: 'Bahan Plastik buatan pabrik', isCorrect: false, feedback: 'Biji dan daun berasal dari alam, bukan pabrik plastik.' },
      { id: 'opt-3', text: 'Kaca berbahaya', isCorrect: false, feedback: 'Bahan kolase anak SD menggunakan bahan alami yang aman.' },
    ],
    hint: 'Bahan yang berasal langsung dari tumbuhan atau alam disebut bahan alami.',
  },
];

export const StudioKreatifLevel: React.FC<StudioKreatifLevelProps> = ({
  student = null,
  studentName = 'Sahabat Juara',
  onCompleteLevel,
  onBackToMap,
}) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const [guideEmotion, setGuideEmotion] = useState<EmotionState>('idle');
  const [customText, setCustomText] = useState<string | null>(null);

  const [stars, setStars] = useState(3);
  const [totalScore, setTotalScore] = useState(100);
  const [earnedXP, setEarnedXP] = useState(150);

  const uciel = getUcielForLocation('studio-kreatif');
  const currentChallenge = ART_CHALLENGES[challengeIdx];

  const handleSelectOption = (opt: { id: string; text: string; isCorrect: boolean; feedback: string }) => {
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
        scoreAwarded: opt.isCorrect ? 33 : 0,
        attemptNumber: 1,
      });
    }

    if (opt.isCorrect) {
      soundManager.playSuccess();
      setGuideEmotion('happy');
      setCorrectCount((prev) => prev + 1);
      setFeedback({ isCorrect: true, text: opt.feedback });
      setCustomText(`🎨 Kweeek! Warna-warni indah! ${opt.feedback}`);
    } else {
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      setFeedback({ isCorrect: false, text: opt.feedback });
      setCustomText(`💡 Belum tepat sahabat. ${opt.feedback} Ayo perhatikan dimensi bentuknya!`);
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
      const calculatedStars = correctCount >= 2 ? 3 : 2;
      const calculatedScore = Math.round((correctCount / ART_CHALLENGES.length) * 100);
      const calculatedXP = 120 + calculatedStars * 30;

      setStars(calculatedStars);
      setTotalScore(calculatedScore);
      setEarnedXP(calculatedXP);
      setCurrentStep('result');
      soundManager.playCelebration();
      setGuideEmotion('happy');
      setCustomText(`🎉 Selamat ${studentName}! Kamu lulus misi seni 2D & 3D di Studio Kreatif bersama Uciel!`);

      onCompleteLevel({
        stars: calculatedStars,
        score: calculatedScore,
        xp: calculatedXP,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col">
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 shadow-md">
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onBackToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 text-xs sm:text-sm font-black shadow-md backdrop-blur-sm"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Peta Sekolah</span>
          </button>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>Misi 4: SBdP</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <span className="px-2 py-0.5 rounded-md bg-purple-500 font-bold text-[11px] uppercase tracking-wider text-white">
            Tema 1: Hidup Rukun • Karya Imajinatif
          </span>
          <h1 className="text-xl sm:text-3xl font-black drop-shadow-md flex items-center gap-2 mt-1">
            🎨 Studio Kreatif
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 line-clamp-1">
            Mengenal karya seni 2 dimensi, 3 dimensi, dan bahan alami karya bersama Uciel
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4">
        <GuideCharacter
          guide={uciel}
          activeEmotion={guideEmotion}
          customDialogue={customText}
          onRequestHint={() => {
            if (currentChallenge) {
              setCustomText(`💡 Petunjuk Uciel: ${currentChallenge.hint}`);
            }
          }}
        />

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
                  Tujuan Misi di Studio Kreatif
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Membedakan karya seni rupa 2 dimensi dan 3 dimensi serta bahan-bahannya
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-purple-900 leading-relaxed font-semibold">
              Seni adalah ungkapan perasaan yang indah. Kita belajar bahwa gambar di kertas itu 2 dimensi, sedangkan patung tanah liat itu 3 dimensi karena memiliki ruang nyata!
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep('quiz');
                  setGuideEmotion('talking');
                  setCustomText('Kweeek! Mari berkreasi dan menjawab tantangan seni bersama Uciel!');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mx-auto"
              >
                <span>Mulai Misi Studio Kreatif</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-purple-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                Tantangan {challengeIdx + 1} dari {ART_CHALLENGES.length}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Benar: {correctCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-black uppercase text-purple-600 block">Karya Seni:</span>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                "{currentChallenge.description}"
              </p>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-700 pt-1">
                ❓ {currentChallenge.question}
              </h3>
            </div>

            <div className="space-y-3">
              {currentChallenge.options.map((opt) => {
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
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-gray-600">
                        {opt.id.slice(-1).toUpperCase()}
                      </span>
                      <span className="text-sm sm:text-base font-bold">{opt.text}</span>
                    </div>

                    {selectedOptionId && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                    {selectedOptionId && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
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
                Kamu menguasai karya seni 2D dan 3D di Studio Kreatif!
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

            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToMap}
                className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg"
              >
                Kembali ke Peta Sekolah
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
