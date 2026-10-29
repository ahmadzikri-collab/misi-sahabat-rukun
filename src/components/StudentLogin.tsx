import React, { useState, useEffect } from 'react';
import { Play, Shield, Sparkles, BookOpen, Heart, Users, Star, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { gameDb } from '../services/db';
import { cloudDb } from '../services/firebase';
import { StudentProfile } from '../types/game';
import { soundManager } from '../utils/audio';
import { createSafeImageErrorHandler } from '../utils/assets';
import { UCIEL_AVATAR, TAMAN_BG } from '../data/characters';

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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-400 via-amber-100 to-emerald-200 flex flex-col justify-between p-4 sm:p-6">
      {/* Decorative Floating Sun and Clouds */}
      <div className="absolute top-4 right-8 text-5xl animate-bounce duration-1000 select-none pointer-events-none">
        ☀️
      </div>
      <div className="absolute top-12 left-10 text-4xl select-none pointer-events-none opacity-80">
        ☁️
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto space-y-6 pt-4 pb-8 z-10">
        {/* Main Hero Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-300 text-center space-y-6">
          {/* Badge & Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs sm:text-sm font-black shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tema 1: Hidup Rukun di SD Indonesia Emas • Kelas 2</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2 flex-wrap">
              <span>🇮🇩 MISI SAHABAT RUKUN</span>
            </h1>

            <p className="text-sm sm:text-base font-semibold text-gray-600 max-w-xl mx-auto">
              Petualangan seru membangun kerukunan di SD Indonesia Emas, mengenal simbol Pancasila, dan bekerja sama bersama teman-teman!
            </p>
          </div>

          {/* Interactive Character Highlight Box: Uciel si Garuda Cilik */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 flex flex-col sm:flex-row items-center gap-4 text-left max-w-2xl mx-auto shadow-sm">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-amber-100">
              <img
                src={UCIEL_AVATAR}
                alt="Uciel si Garuda Cilik"
                referrerPolicy="no-referrer"
                onError={createSafeImageErrorHandler('uciel')}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                  Pemandu 5 Zona
                </span>
                <span className="text-xs font-bold text-amber-800">Sahabat Rukun</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                Uciel si Garuda Cilik menyambutmu! 🐣
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 mt-0.5 font-medium leading-relaxed">
                "Kweeek! Halo sahabat! Mari berpetualang di 5 tempat seru sekolah kita bersama Uciel. Kita belajar hidup rukun dan kumpulkan bintang!"
              </p>
            </div>
          </div>

          {/* Student Selection / Entry form */}
          <div className="max-w-md mx-auto space-y-4 pt-2">
            {students.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-3">
                <p className="text-xs sm:text-sm font-bold text-amber-900">
                  Semua data siswa telah dihapus oleh Guru.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreSampleStudents}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Pulihkan Siswa Contoh Kelas 2</span>
                  </button>
                  <button
                    type="button"
                    onClick={onTeacherLogin}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
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

                <div className="text-left space-y-1">
                  <label className="block text-xs font-extrabold text-gray-700">
                    Pilih Nama Siswa (Dibuat oleh Guru):
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-amber-200 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm font-black text-gray-800 shadow-xs focus:outline-none"
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

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>Mulai Petualangan!</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Teacher and Documentation Access */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={onTeacherLogin}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Masuk Dashboard Guru</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuideModal}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center gap-1.5 transition-colors border border-amber-300"
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Panduan Karakter & Modul Koding</span>
            </button>
          </div>
        </div>

        {/* 3 Keunggulan Game */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white">
            <span className="text-xl">🌟</span>
            <div className="text-xs font-black text-gray-800 mt-1">Interaktif & Bersuara</div>
            <div className="text-[11px] text-gray-600">Dukungan audio narasi untuk kelas 2 SD</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white">
            <span className="text-xl">🐣</span>
            <div className="text-xs font-black text-gray-800 mt-1">Pemandu Garuda Cilik</div>
            <div className="text-[11px] text-gray-600">Uciel memandu di 5 zona petualangan sekolah</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white">
            <span className="text-xl">📊</span>
            <div className="text-xs font-black text-gray-800 mt-1">Dashboard Terintegrasi</div>
            <div className="text-[11px] text-gray-600">Pantau ketuntasan siswa & ekspor CSV</div>
          </div>
        </div>
      </div>
    </div>
  );
};
