import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Shield, Sparkles, BookOpen, Star, RefreshCw, Trophy, Volume2, Heart, Award } from 'lucide-react';
import { gameDb } from '../services/db';
import { cloudDb } from '../services/firebase';
import { StudentProfile } from '../types/game';
import { soundManager } from '../utils/audio';
import { createSafeImageErrorHandler } from '../utils/assets';
import { UCIEL_AVATAR } from '../data/characters';

interface StudentLoginProps {
  onStudentLogin: (student: StudentProfile) => void;
  onTeacherLogin: () => void;
  onOpenGuideModal: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onStudentLogin,
  onTeacherLogin,
  onOpenGuideModal,
}) => {
  const [students, setStudents] = useState<StudentProfile[]>(gameDb.getAllStudents());
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [filterClassCode, setFilterClassCode] = useState<string>('ALL');

  // Real-time listener for Student Roster from Firebase Cloud
  useEffect(() => {
    const unsub = cloudDb.subscribeToStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });
    return () => unsub();
  }, []);

  // Keep selected ID valid if list changes
  useEffect(() => {
    if (students.length > 0 && !students.some((s) => s.id === selectedStudentId)) {
      if (selectedStudentId !== students[0].id) {
        setSelectedStudentId(students[0].id);
      }
    }
  }, [students, selectedStudentId]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find((s) => s.id === id);
    if (student) {
      soundManager.playClick();
      gameDb.setCurrentStudent(student);
    }
  };

  const handleStartGame = () => {
    soundManager.playSuccess();
    const student = students.find((s) => s.id === selectedStudentId) || students[0];
    if (student) {
      gameDb.setCurrentStudent(student);
      gameDb.updateStudentPresence(student.id, true, '🗺️ Di Peta Sekolah SD INDONESIA EMAS');
      onStudentLogin(student);
    }
  };

  const handleRestoreSampleStudents = () => {
    soundManager.playSuccess();
    const list = gameDb.resetDefaultStudents();
    setStudents(list);
    setSelectedStudentId(list[0].id);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* Dekorasi Awan Kartun & Sinar Matahari */}
      <div className="absolute top-2 right-6 sm:right-16 text-6xl sm:text-7xl animate-pulse duration-1000 select-none pointer-events-none drop-shadow-lg">
        ☀️
      </div>
      <div className="absolute top-8 left-6 text-4xl sm:text-5xl select-none pointer-events-none opacity-85 animate-bounce duration-1000">
        ☁️
      </div>
      <div className="absolute top-24 right-1/4 text-3xl sm:text-4xl select-none pointer-events-none opacity-70">
        ☁️
      </div>
      <div className="absolute top-1/2 -left-4 text-4xl select-none pointer-events-none opacity-50">
        🎈
      </div>
      <div className="absolute top-2/3 -right-3 text-4xl select-none pointer-events-none opacity-50">
        🌈
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-auto space-y-5 pt-3 pb-6 relative z-10">
        {/* Main Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-9 shadow-2xl border-4 border-amber-300 text-center space-y-6 relative overflow-hidden"
        >
          {/* Aksen Hiasan Atas */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

          {/* Badge & Title */}
          <div className="space-y-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs sm:text-sm font-black shadow-md">
              <span>🇮🇩</span>
              <span>SD INDONESIA EMAS • TEMATIK TERPADU KELAS 2</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2.5 flex-wrap drop-shadow-xs">
              <span className="bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                MISI SAHABAT RUKUN
              </span>
            </h1>

            <p className="text-xs sm:text-base font-bold text-gray-600 max-w-xl mx-auto leading-relaxed">
              Petualangan seru belajar hidup rukun di sekolah, mengenal simbol Garuda Pancasila, dan bermain jujur bersama teman!
            </p>
          </div>

          {/* Kartu Sambutan Maskot Uciel Interaktif */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 flex flex-col sm:flex-row items-center gap-4 text-left max-w-2xl mx-auto shadow-sm">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-amber-100 group">
              <img
                src={UCIEL_AVATAR}
                alt="Uciel si Garuda Cilik"
                referrerPolicy="no-referrer"
                onError={createSafeImageErrorHandler('uciel')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                ✓
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                    Pemandu 5 Zona
                  </span>
                  <span className="text-xs font-extrabold text-amber-800">Uciel si Garuda Cilik 🐣</span>
                </div>
                <button
                  type="button"
                  onClick={() => soundManager.playCuteUcielChirp()}
                  className="px-2 py-0.5 rounded-lg bg-white/80 hover:bg-white text-[11px] font-black text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  title="Dengarkan Suara Cuitan Uciel"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sapa Uciel</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 mt-1 font-semibold leading-relaxed">
                "Kweeek! Halo sahabat! Terbanglah bersamaku melintasi 5 misi seru. Jawab pertanyaan, kumpulkan 3 bintang emas, dan raih peringkat juara!"
              </p>
            </div>
          </div>

          {/* Form Pemilihan Nama Siswa */}
          <div className="max-w-md mx-auto space-y-4 pt-1">
            {students.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-3">
                <p className="text-xs sm:text-sm font-bold text-amber-900">
                  Data siswa belum tersedia atau telah direset oleh Guru.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreSampleStudents}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Pulihkan Siswa Contoh Kelas 2</span>
                  </button>
                  <button
                    type="button"
                    onClick={onTeacherLogin}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    Buka Dashboard Guru (Tambah Siswa Baru)
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filter Kelas jika ada lebih dari 1 kelas */}
                {Array.from(new Set(students.map((s) => s?.classCode).filter(Boolean))).length > 1 && (
                  <div className="text-left space-y-1">
                    <label className="block text-xs font-bold text-gray-700">Pilih Kelas:</label>
                    <select
                      value={filterClassCode}
                      onChange={(e) => setFilterClassCode(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-amber-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 shadow-xs focus:outline-none mb-2"
                    >
                      <option value="ALL">Semua Kelas</option>
                      {Array.from(new Set(students.map((s) => s?.classCode).filter(Boolean))).map((cls, idx) => (
                        <option key={`class-opt-${cls}-${idx}`} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <span>👤</span>
                      <span>Pilih Nama Siswa:</span>
                    </label>
                    {selectedStudent && (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Siap Bertualang
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-black text-gray-900 shadow-xs focus:outline-none cursor-pointer"
                  >
                    {(filterClassCode === 'ALL'
                      ? students
                      : students.filter((s) => s && s.classCode === filterClassCode)
                    ).map((std, idx) => (
                      <option key={`std-opt-${std.id || idx}-${idx}`} value={std.id || `std-${idx}`}>
                        {std.studentCode || `K2-${String(idx + 1).padStart(2, '0')}`} — {std.displayName || 'Siswa'} ({std.classCode || '2A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-amber-300/60"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>Mulai Petualangan Sekolah!</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tombol Panduan Game & Dashboard Guru */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenGuideModal();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black flex items-center gap-1.5 transition-all border-2 border-amber-400 shadow-xs cursor-pointer active:scale-95"
              title="Buka Petunjuk & Panduan Bermain Game"
            >
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>📖 Panduan Bermain Game</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onTeacherLogin();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Masuk ke Dashboard Guru untuk pantau nilai dan kelola siswa"
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Masuk Portal Guru</span>
            </button>
          </div>
        </motion.div>

        {/* 3 Keunggulan Game Tematik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl shadow-sm border border-white flex flex-col items-center">
            <span className="text-2xl">🌟</span>
            <div className="text-xs font-black text-gray-900 mt-1">5 Misi Tematik Terpadu</div>
            <div className="text-[11px] text-gray-600 font-medium">PPKn, B. Indonesia, Matematika, SBdP, & PJOK</div>
          </div>
          <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl shadow-sm border border-white flex flex-col items-center">
            <span className="text-2xl">🗣️</span>
            <div className="text-xs font-black text-gray-900 mt-1">Interaktif & Suara Narasi</div>
            <div className="text-[11px] text-gray-600 font-medium">Didukung audio ramah anak & musik petualangan BGM</div>
          </div>
          <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl shadow-sm border border-white flex flex-col items-center">
            <span className="text-2xl">🛡️</span>
            <div className="text-xs font-black text-gray-900 mt-1">Pengawas Digital & Peringkat</div>
            <div className="text-[11px] text-gray-600 font-medium">Melatih kejujuran, sportivitas, dan raih bintang emas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
