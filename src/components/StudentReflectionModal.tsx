import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, CheckCircle2, Heart, MessageSquare, Volume2, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { gameDb } from '../services/db';
import { StudentProfile, StudentReflection, ReflectionAnswer } from '../types/game';
import { UCIEL_AVATAR } from '../data/characters';
import { createSafeImageErrorHandler } from '../utils/assets';

interface StudentReflectionModalProps {
  isOpen: boolean;
  student: StudentProfile | null;
  studentName?: string;
  levelId: string;
  levelName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface QuestionDef {
  id: string;
  question: string;
  icon: string;
  options: string[];
}

export const StudentReflectionModal: React.FC<StudentReflectionModalProps> = ({
  isOpen,
  student,
  studentName = 'Sahabat Juara',
  levelId,
  levelName,
  onClose,
  onSubmitted,
}) => {
  // 4 Pertanyaan Refleksi Tematik Ramah Siswa Kelas 2 SD
  const questions: QuestionDef[] = [
    {
      id: 'q1',
      question: 'Apa yang kamu pelajari hari ini?',
      icon: '💡',
      options: [
        'Belajar simbol Garuda Pancasila dan saling menyayangi sesama teman.',
        'Belajar menggunakan kalimat santun (Tolong, Maaf, dan Terima Kasih).',
        'Belajar berhitung jajanan sehat dan tertib antre dengan sabar.',
        'Belajar karya seni imajinatif dan saling memuji karya teman sekelas.',
        'Belajar gerak lokomotor dan menjunjung tinggi sportivitas di lapangan.',
      ],
    },
    {
      id: 'q2',
      question: 'Bagaimana cara kamu membantu teman di sekolah?',
      icon: '🤝',
      options: [
        'Berbagi dan meminjamkan alat tulis saat teman membutuhkan.',
        'Menolong dan menghibur teman yang sedang sedih atau terjatuh.',
        'Mengajak teman yang sedang sendirian untuk bermain bersama.',
        'Membantu merapikan buku dan meja kelas bersama-sama.',
      ],
    },
    {
      id: 'q3',
      question: 'Apa yang harus dilakukan ketika berbeda pendapat dengan teman?',
      icon: '👂',
      options: [
        'Bermusyawarah dan saling mendengarkan dengan sabar serta tenang.',
        'Menghargai pendapat teman dan tidak memaksakan keinginan sendiri.',
        'Tetap rukun, tersenyum, dan mencari kesepakatan terbaik bersama.',
      ],
    },
    {
      id: 'q4',
      question: 'Materi apa yang paling sulit atau menantang menurutmu?',
      icon: '🎯',
      options: [
        'Semua materi sudah aku pahami dengan baik dan sangat menyenangkan!',
        'Mengingat urutan sila Pancasila dan artinya.',
        'Membedakan jenis kalimat ajakan dan kalimat perintah sopan.',
        'Menghitung pembagian dan pengurangan uang jajanan di kantin.',
      ],
    },
  ];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    q1: questions[0].options[0],
    q2: questions[1].options[0],
    q3: questions[2].options[0],
    q4: questions[3].options[0],
  });

  const [customTexts, setCustomTexts] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  const [useCustomInput, setUseCustomInput] = useState<Record<string, boolean>>({
    q1: false,
    q2: false,
    q3: false,
    q4: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (qId: string, text: string) => {
    soundManager.playClick();
    setSelectedOptions((prev) => ({ ...prev, [qId]: text }));
    setUseCustomInput((prev) => ({ ...prev, [qId]: false }));
  };

  const handleToggleCustom = (qId: string) => {
    soundManager.playClick();
    setUseCustomInput((prev) => ({ ...prev, [qId]: true }));
  };

  const handleReadQuestion = (qText: string, qId: string) => {
    soundManager.speak(qText, `reflection-q-${qId}`);
  };

  const handleSubmit = () => {
    soundManager.playSuccess();
    setIsSubmitting(true);

    const answers: ReflectionAnswer[] = questions.map((q) => {
      const isCustom = useCustomInput[q.id];
      const customVal = customTexts[q.id]?.trim();
      const finalAnswer = isCustom && customVal ? customVal : selectedOptions[q.id] || q.options[0];

      return {
        questionId: q.id,
        questionText: q.question,
        answerText: finalAnswer,
      };
    });

    const activeStudentId = student?.id || 'std-1';
    const activeStudentName = student?.displayName || studentName;
    const activeClassCode = student?.classCode || '2A';

    const reflectionDoc: StudentReflection = {
      id: `refl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId: activeStudentId,
      studentName: activeStudentName,
      classCode: activeClassCode,
      levelId,
      levelName,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // Simpan ke local db & sinkronkan otomatis ke Cloud Firestore (Dashboard Guru)
    gameDb.saveStudentReflection(reflectionDoc);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      soundManager.playCelebration();
      onSubmitted?.();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              📝
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] uppercase">
                  Refleksi Pembelajaran
                </span>
                <span className="text-xs font-bold text-amber-200">{levelName}</span>
              </div>
              <h3 className="text-base sm:text-xl font-black tracking-tight mt-0.5">
                Bagikan Refleksimu ke Bapak/Ibu Guru
              </h3>
            </div>
          </div>
        </div>

        {/* Isi Form Refleksi */}
        {!isSuccess ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-gray-800 flex-1">
            {/* Kartu Sapaan Uciel */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-xs flex-shrink-0 bg-amber-100">
                <img
                  src={UCIEL_AVATAR}
                  alt="Uciel Garuda"
                  onError={createSafeImageErrorHandler('uciel')}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-black text-amber-800 uppercase block">Pesan Sahabat Uciel:</span>
                <p className="text-xs sm:text-sm font-bold text-amber-950">
                  "Kweeek! Hebat sekali, {studentName}! Jawaban refleksimu akan langsung terkirim ke <strong>Dashboard Guru</strong> agar Bapak/Ibu Guru bangga padamu!"
                </p>
              </div>
            </div>

            {/* Daftar 4 Pertanyaan Refleksi */}
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCustom = useCustomInput[q.id];
                const activeSelected = selectedOptions[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5 transition-all focus-within:border-amber-400"
                  >
                    {/* Header Pertanyaan */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                          <span>{q.icon}</span>
                          <span>{q.question}</span>
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReadQuestion(q.question, q.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
                        title="Dengarkan pertanyaan"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Dengarkan</span>
                      </button>
                    </div>

                    {/* Pilihan Cepat Ramah Anak (Klik 1 Kali) */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = !isCustom && activeSelected === opt;

                        return (
                          <button
                            key={`opt-${q.id}-${optIdx}`}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isChosen
                                ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300/60'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-gray-700'
                            }`}
                          >
                            <span className="flex-1">{opt}</span>
                            {isChosen && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {/* Tombol Tulis Jawaban Sendiri */}
                      <button
                        type="button"
                        onClick={() => handleToggleCustom(q.id)}
                        className={`w-full text-left p-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isCustom
                            ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300/60'
                            : 'bg-white hover:bg-slate-100 border-dashed border-slate-300 text-gray-500'
                        }`}
                      >
                        <span>✏️ Tulis jawaban sendiri dengan bahasaku...</span>
                        {isCustom && <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                      </button>

                      {/* Input Kustom jika siswa ingin menulis sendiri */}
                      {isCustom && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-1.5"
                        >
                          <textarea
                            rows={2}
                            value={customTexts[q.id]}
                            onChange={(e) => setCustomTexts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Ketik jawaban refleksimu di sini..."
                            className="w-full p-3 rounded-xl bg-white border-2 border-purple-300 focus:border-purple-500 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none shadow-inner"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Layar Berhasil Terkirim */
          <div className="p-6 sm:p-10 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 text-emerald-600 flex items-center justify-center text-4xl shadow-xl"
            >
              🎉
            </motion.div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Refleksi Berhasil Terkirim ke Guru!
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
                Terima kasih, <strong>{studentName}</strong>! Jawabanmu telah masuk ke Dashboard Guru secara langsung (*real-time*). Sikap jujur dan reflektifmu sangat membanggakan!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 max-w-sm w-full text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Bapak/Ibu Guru dapat membaca refleksimu sekarang!</span>
            </div>
          </div>
        )}

        {/* Footer Tombol Aksi */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          {!isSuccess ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-300 transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Refleksi...' : 'Kirim Refleksi ke Guru ✨'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Kembali ke Peta Petualangan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
