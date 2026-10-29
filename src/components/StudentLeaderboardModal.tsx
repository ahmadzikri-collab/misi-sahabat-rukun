import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Sparkles, X, Medal, Crown, Flame, Award, Volume2 } from 'lucide-react';
import { gameDb } from '../services/db';
import { soundManager } from '../utils/audio';
import { StudentProfile, StudentLeaderboardEntry } from '../types/game';
import { UCIEL_AVATAR } from '../data/characters';

interface StudentLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
}

export const StudentLeaderboardModal: React.FC<StudentLeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
}) => {
  const [filterClass, setFilterClass] = useState<'all' | 'myClass'>('all');
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      soundManager.playCelebration();
      const myClassCode = filterClass === 'myClass' && currentStudent ? currentStudent.classCode : undefined;
      const data = gameDb.getLeaderboard(myClassCode);
      setLeaderboard(data);
    }
  }, [isOpen, filterClass, currentStudent]);

  if (!isOpen) return null;

  const currentStudentEntry = currentStudent
    ? leaderboard.find((s) => s.studentId === currentStudent.id)
    : null;

  const handleSpeakLeaderboard = () => {
    const text = currentStudentEntry
      ? `Halo ${currentStudent?.nickname}! Di Papan Juara Sahabat Rukun, kamu berada di peringkat ke-${currentStudentEntry.rank} dengan nilai ${currentStudentEntry.totalScore} poin dan ${currentStudentEntry.totalStars} bintang. Terus bersemangat ya!`
      : 'Halo sahabat juara! Ini adalah papan peringkat siswa SD Indonesia Emas. Kumpulkan bintang dan nilai setinggi-tingginya!';
    soundManager.speak(text, 'leaderboard-speech');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/40 shadow-inner">
              <Trophy className="w-6 h-6 text-yellow-200 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
                <span>PAPAN JUARA SAHABAT RUKUN</span>
              </h2>
              <span className="text-xs font-bold text-amber-100 block">
                Peringkat & Prestasi Siswa SD INDONESIA EMAS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSpeakLeaderboard}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Dengarkan Uciel"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & My Rank Banner */}
        <div className="p-3 sm:p-4 bg-amber-50/70 border-b border-amber-200 space-y-2.5">
          {/* Class Filter Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shadow-xs">
              <button
                type="button"
                onClick={() => setFilterClass('all')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  filterClass === 'all'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua Kelas
              </button>
              {currentStudent && (
                <button
                  type="button"
                  onClick={() => setFilterClass('myClass')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    filterClass === 'myClass'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Kelas Saya ({currentStudent.classCode})
                </button>
              )}
            </div>

            <span className="text-[11px] font-bold text-gray-500">
              Total {leaderboard.length} Sahabat
            </span>
          </div>

          {/* Current Student Position Banner */}
          {currentStudentEntry && (
            <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-500 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                  #{currentStudentEntry.rank}
                </div>
                <div>
                  <div className="text-[10px] font-black text-amber-950 uppercase tracking-wider">
                    Posisi Kamu Saat Ini:
                  </div>
                  <div className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    {currentStudentEntry.displayName}{' '}
                    <span className="text-[10px] text-amber-900 font-bold">
                      ({currentStudentEntry.badgeTitle})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs font-black text-red-700">
                    {currentStudentEntry.totalScore} Poin
                  </div>
                  <div className="text-[11px] font-extrabold text-amber-900 flex items-center gap-0.5 justify-end">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                    <span>{currentStudentEntry.totalStars}/15</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold text-sm">
              Belum ada data siswa untuk peringkat ini.
            </div>
          ) : (
            leaderboard.map((entry) => {
              const isCurrent = currentStudent?.id === entry.studentId;
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              let rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-gray-700 font-black text-xs flex items-center justify-center">
                  #{entry.rank}
                </span>
              );

              if (isTop1) {
                rankBadge = (
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-sm flex items-center justify-center shadow-md border border-amber-500 ring-2 ring-amber-300">
                    🥇
                  </span>
                );
              } else if (isTop2) {
                rankBadge = (
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-300 to-gray-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-md border border-slate-400">
                    🥈
                  </span>
                );
              } else if (isTop3) {
                rankBadge = (
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-400 text-white font-black text-sm flex items-center justify-center shadow-md border border-amber-800">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={entry.studentId}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isCurrent
                      ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300 shadow-md'
                      : isTop1
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50/80 border-amber-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-gray-200 shadow-xs'
                  }`}
                >
                  {/* Left: Rank & Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex-shrink-0">{rankBadge}</div>

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 p-0.5 flex-shrink-0 shadow-xs">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-red-600 text-[11px]">
                        {entry.nickname.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-gray-900 truncate">
                          {entry.displayName}
                        </span>
                        {entry.isOnline && (
                          <span
                            className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 flex-shrink-0 animate-pulse"
                            title="Sedang Online"
                          />
                        )}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {entry.classCode}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                        <span>{entry.badgeTitle}</span>
                        <span>•</span>
                        <span className="text-gray-500">{entry.completedMissions} Misi Selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Stars */}
                  <div className="text-right flex-shrink-0 pl-1">
                    <div className="text-xs sm:text-sm font-black text-rose-600">
                      {entry.totalScore} Poin
                    </div>
                    <div className="text-[11px] font-extrabold text-amber-600 flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{entry.totalStars} / 15</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Uciel's Encouragement */}
        <div className="bg-amber-50 border-t border-amber-200 p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
              <img src={UCIEL_AVATAR} alt="Uciel" className="w-full h-full object-cover" />
            </div>
            <p className="text-[11px] font-bold text-amber-900 leading-tight">
              &quot;Hebat sekali semua sahabat! Terus hidup rukun dan kumpulkan bintang kebaikan!&quot;
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
