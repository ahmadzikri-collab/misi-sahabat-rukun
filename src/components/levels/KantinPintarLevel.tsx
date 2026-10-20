import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2, XCircle, Award, ArrowRight, Utensils, Compass, Calculator } from 'lucide-react';
import { GuideCharacter } from '../character/GuideCharacter';
import { getUcielForLocation } from '../../data/characters';
import { EmotionState, StudentProfile } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { gameDb } from '../../services/db';

interface KantinPintarLevelProps {
  student?: StudentProfile | null;
  studentName?: string;
  onCompleteLevel: (result: { stars: number; score: number; xp: number }) => void;
  onBackToMap: () => void;
}

const MATH_CHALLENGES = [
  {
    id: 'kantin-1',
    situation: 'Edo membawa 15 butir bakso sehat untuk dibagikan saat istirahat. Teman-teman mengambil 7 butir.',
    question: 'Berapakah sisa bakso sehat milik Edo sekarang?',
    calculationNote: '15 - 7 = ...',
    options: [
      { id: 'opt-1', text: '8 butir bakso', isCorrect: true, feedback: 'Tepat sekali! 15 dikurangi 7 adalah 8 butir bakso.' },
      { id: 'opt-2', text: '9 butir bakso', isCorrect: false, feedback: 'Hitunganmu sedikit kelebihan. 15 - 7 = 8.' },
      { id: 'opt-3', text: '6 butir bakso', isCorrect: false, feedback: 'Kurang tepat. Coba hitung mundur dari 15 sebanyak 7 langkah.' },
    ],
    hint: 'Gunakan operasi pengurangan: 15 - 7.',
  },
  {
    id: 'kantin-2',
    situation: 'Siti membeli 12 kotak susu kedelai dan Beni membeli 18 kotak susu untuk minum bersama sekelas.',
    question: 'Berapakah jumlah seluruh kotak susu kedelai yang dibeli mereka berdua?',
    calculationNote: '12 + 18 = ...',
    options: [
      { id: 'opt-1', text: '30 kotak susu', isCorrect: true, feedback: 'Hebat! 12 + 18 = 30 kotak susu untuk teman-teman sekelas!' },
      { id: 'opt-2', text: '28 kotak susu', isCorrect: false, feedback: 'Hitung kembali bagian satuannya: 2 + 8 = 10, simpan 1 puluhannya.' },
      { id: 'opt-3', text: '32 kotak susu', isCorrect: false, feedback: 'Sedikit kelebihan, hasilnya tepat 30.' },
    ],
    hint: 'Gunakan penjumlahan: 12 + 18 = (10 + 10) + (2 + 8).',
  },
  {
    id: 'kantin-3',
    situation: 'Di kantin kejujuran, Budi membayar roti seharga Rp200 dengan uang Rp500. Ibu kantin mengembalikan uang lebih Rp100.',
    question: 'Sebagai anak yang jujur dan rukun, apa yang sebaiknya dilakukan Budi?',
    calculationNote: 'Sikap Kejujuran di Kantin',
    options: [
      { id: 'opt-1', text: 'Mengembalikan kelebihan uang kepada ibu kantin dengan sopan', isCorrect: true, feedback: 'Luar biasa! Kejujuran adalah pilar utama hidup rukun dan dipercaya teman.' },
      { id: 'opt-2', text: 'Menyimpan uang lebih itu ke dalam saku diam-diam', isCorrect: false, feedback: 'Menyimpan uang yang bukan hak kita adalah perbuatan tidak jujur.' },
      { id: 'opt-3', text: 'Membagikan uang itu untuk jajan teman lain', isCorrect: false, feedback: 'Meskipun berniat berbagi, uang itu milik penjual kantin dan harus dikembalikan.' },
    ],
    hint: 'Kembalikan barang atau uang yang bukan milik kita dengan jujur.',
  },
];

export const KantinPintarLevel: React.FC<KantinPintarLevelProps> = ({
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

  const uciel = getUcielForLocation('kantin-pintar');
  const currentChallenge = MATH_CHALLENGES[challengeIdx];

  const handleSelectOption = (opt: { id: string; text: string; isCorrect: boolean; feedback: string }) => {
    if (selectedOptionId) return;
    setSelectedOptionId(opt.id);

    if (student) {
      gameDb.logAttempt({
        studentId: student.id,
        studentName: student.displayName,
        classCode: student.classCode,
        levelId: 'kantin-pintar',
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
      setCustomText(`🍎 Kweeek! Hebat sekali! ${opt.feedback}`);
    } else {
      soundManager.playEncourage();
      setGuideEmotion('encouraging');
      setFeedback({ isCorrect: false, text: opt.feedback });
      setCustomText(`💡 Belum tepat sahabat. ${opt.feedback} Ayo coba berhitung bersama Uciel!`);
    }
  };

  const handleNextChallenge = () => {
    soundManager.playDialoguePop();
    setSelectedOptionId(null);
    setFeedback(null);

    if (challengeIdx < MATH_CHALLENGES.length - 1) {
      setChallengeIdx((prev) => prev + 1);
      setGuideEmotion('idle');
      setCustomText(null);
    } else {
      const calculatedStars = correctCount >= 2 ? 3 : 2;
      const calculatedScore = Math.round((correctCount / MATH_CHALLENGES.length) * 100);
      const calculatedXP = 120 + calculatedStars * 30;

      setStars(calculatedStars);
      setTotalScore(calculatedScore);
      setEarnedXP(calculatedXP);
      setCurrentStep('result');
      soundManager.playCelebration();
      setGuideEmotion('happy');
      setCustomText(`🎉 Selamat ${studentName}! Kamu juara berhitung jujur di Kantin Pintar bersama Uciel!`);

      onCompleteLevel({
        stars: calculatedStars,
        score: calculatedScore,
        xp: calculatedXP,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col">
      {/* Header Banner */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 shadow-md">
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onBackToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 text-xs sm:text-sm font-black shadow-md backdrop-blur-sm"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Peta Sekolah</span>
          </button>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>Misi 3: Matematika</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 font-bold text-[11px] uppercase tracking-wider text-white">
            Tema 1: Hidup Rukun • Berhitung & Kejujuran
          </span>
          <h1 className="text-xl sm:text-3xl font-black drop-shadow-md flex items-center gap-2 mt-1">
            🍎 Kantin Pintar
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 line-clamp-1">
            Menghitung makanan sehat, berbagi bersama teman, dan tertib antre bersama Uciel
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
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-emerald-200 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xl">
                🔢
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-800">
                  Tujuan Misi di Kantin Pintar
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Menyelesaikan soal cerita penjumlahan & pengurangan serta melatih sikap jujur
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed font-semibold">
              Kantin sekolah adalah tempat kita menikmati bekal bersama. Ayo kita hitung jumlah makanan sehat yang dibagikan ke teman dan belajar antre secara tertib!
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep('quiz');
                  setGuideEmotion('talking');
                  setCustomText('Kweeek! Mari kita hitung bersama Uciel!');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mx-auto"
              >
                <span>Mulai Misi Berhitung Ceria</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-emerald-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Tantangan {challengeIdx + 1} dari {MATH_CHALLENGES.length}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Benar: {correctCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-black uppercase text-emerald-600 block">Cerita Kantin:</span>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                "{currentChallenge.situation}"
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
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <span>{challengeIdx < MATH_CHALLENGES.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}</span>
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
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-300 text-center space-y-6"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-emerald-500 p-1 shadow-xl flex items-center justify-center text-white">
              <Award className="w-16 h-16" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Hebat, {studentName}! 🎉
              </h2>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                Kamu berhasil menyelesaikan tantangan berhitung di Kantin Pintar!
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
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700">Skor</div>
                <div className="text-2xl font-black text-emerald-900">{totalScore}</div>
              </div>
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="text-xs font-bold text-teal-700">XP</div>
                <div className="text-2xl font-black text-teal-900">+{earnedXP}</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToMap}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg"
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
