import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Volume2, X, MessageSquareHeart } from 'lucide-react';
import { TeacherEncouragement, StudentProfile } from '../types/game';
import { gameDb } from '../services/db';
import { soundManager } from '../utils/audio';
import { UCIEL_AVATAR } from '../data/characters';
import { createSafeImageErrorHandler } from '../utils/assets';

interface TeacherEncouragementToastProps {
  currentStudent: StudentProfile | null;
}

export const TeacherEncouragementToast: React.FC<TeacherEncouragementToastProps> = ({
  currentStudent,
}) => {
  const [activeMessage, setActiveMessage] = useState<TeacherEncouragement | null>(null);
  const [recentMessages, setRecentMessages] = useState<TeacherEncouragement[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastSeenId, setLastSeenId] = useState<string>('');

  useEffect(() => {
    if (!currentStudent) return;

    const unsub = gameDb.subscribeToEncouragements((messages) => {
      // Filter for this student or 'all'
      const relevant = messages.filter(
        (m) => m.targetStudentId === 'all' || m.targetStudentId === currentStudent.id
      );
      setRecentMessages(relevant);

      if (relevant.length > 0) {
        const latest = relevant[0];
        // Check if message is new (created within the last 3 minutes and not seen yet in this session)
        const messageAgeMs = Date.now() - new Date(latest.createdAt).getTime();
        if (latest.id !== lastSeenId && messageAgeMs < 180000) {
          setLastSeenId(latest.id);
          setActiveMessage(latest);

          // Audio chime & Uciel cute voice reading
          try {
            soundManager.playCelebration();
            setTimeout(() => {
              soundManager.speak(
                `Ada pesan penyemangat dari Guru untukmu! ${latest.text}`,
                'teacher-encouragement'
              );
            }, 500);
          } catch {
            // ignore
          }
        }
      }
    });

    return () => {
      unsub();
    };
  }, [currentStudent, lastSeenId]);

  // Auto-dismiss popup after 10 seconds
  useEffect(() => {
    if (!activeMessage) return;
    const timer = setTimeout(() => {
      setActiveMessage(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeMessage]);

  const handleDismiss = () => {
    soundManager.playClick();
    setActiveMessage(null);
  };

  const handleReplayVoice = (text: string) => {
    soundManager.playClick();
    soundManager.speak(`Pesan dari Guru: ${text}`, 'replay-msg');
  };

  if (!currentStudent) return null;

  return (
    <>
      {/* Pop-up Live Encouragement Banner */}
      <AnimatePresence>
        {activeMessage && (
          <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="pointer-events-auto max-w-lg w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 p-1 rounded-3xl shadow-2xl border-2 border-white/60 animate-gradient-x"
            >
              <div className="bg-slate-900/95 backdrop-blur-md rounded-[22px] p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={UCIEL_AVATAR}
                        alt="Uciel Ceria"
                        className="w-12 h-12 rounded-2xl border-2 border-amber-400 bg-amber-100 object-cover shadow-md"
                        onError={createSafeImageErrorHandler('uciel')}
                      />
                      <span className="absolute -bottom-1 -right-1 text-base">
                        {activeMessage.icon || '⭐'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                          Pesan Penyemangat Guru
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {activeMessage.targetStudentId === 'all'
                            ? 'Untuk Semua Siswa'
                            : `Untukmu, ${currentStudent.nickname}!`}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-amber-300 mt-0.5">
                        Dari: {activeMessage.senderName}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Tutup pesan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-amber-950/60 to-rose-950/40 border border-amber-500/30 text-slate-100 text-sm sm:text-base font-bold leading-relaxed shadow-inner flex items-center justify-between gap-2">
                  <p className="flex-1">"{activeMessage.text}"</p>
                  <button
                    type="button"
                    onClick={() => handleReplayVoice(activeMessage.text)}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1 shrink-0 transition-transform active:scale-90 shadow-md"
                    title="Dengarkan Uciel membaca pesan ini"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[11px] hidden sm:inline">Dengarkan</span>
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Sparkles className="w-3 h-3" />
                    Ayo terus semangat belajar dan hidup rukun!
                  </span>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-amber-400 hover:underline font-black text-xs"
                  >
                    Siap, Terima Kasih! ✨
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Button to re-open recent teacher messages */}
      {recentMessages.length > 0 && !activeMessage && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setIsHistoryOpen(true);
            }}
            className="group px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-amber-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-white/40"
            title="Lihat pesan penyemangat dari Guru"
          >
            <span className="text-base group-hover:animate-bounce">💌</span>
            <span>Pesan Guru</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-600 text-[10px] font-black">
              {recentMessages.length}
            </span>
          </button>
        </div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Kotak Pesan Guru</h3>
                    <p className="text-xs text-slate-400">Pesan penyemangat belajar untuk {currentStudent.nickname}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/40 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <span>{msg.icon || '⭐'}</span>
                        <span>{msg.senderName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{msg.text}</p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleReplayVoice(msg.text)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Dengarkan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
