import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Shield, Compass, LogOut, Trophy } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { StudentProfile } from '../types/game';

interface NavbarProps {
  currentStudent: StudentProfile;
  currentView: 'map' | 'level' | 'teacher';
  onNavigateMap: () => void;
  onNavigateTeacher: () => void;
  onExitGame?: () => void;
  onOpenLeaderboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  currentView,
  onNavigateMap,
  onNavigateTeacher,
  onExitGame,
  onOpenLeaderboard,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isMusicActive, setIsMusicActive] = useState(soundManager.isMusicActive);
  const [isTtsActive, setIsTtsActive] = useState(soundManager.isTtsActive);

  const handleToggleSound = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
  };

  const handleToggleMusic = () => {
    const newState = soundManager.toggleMusic();
    setIsMusicActive(newState);
  };

  const handleToggleTts = () => {
    const newState = soundManager.toggleTts();
    setIsTtsActive(newState);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 px-3 sm:px-6 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateMap}
          className="flex items-center gap-2 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-red-600 text-sm">
              🇮🇩
            </div>
          </div>
          <div className="hidden xs:block sm:block">
            <h1 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight leading-none group-hover:text-red-600 transition-colors">
              MISI SAHABAT RUKUN
            </h1>
            <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
              SD INDONESIA EMAS
            </span>
          </div>
        </div>

        {/* Action Controls - Ringkas, Rapih & Tidak Penuh */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {/* Tombol Peringkat */}
          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs shadow-xs border border-amber-500 hover:brightness-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
              title="Papan Peringkat Siswa"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-950" />
              <span className="hidden sm:inline">Peringkat</span>
            </button>
          )}

          {/* Cluster Pengaturan Suara (Kompak & Minimalis) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {/* Suara Baca (TTS) */}
            <button
              type="button"
              onClick={handleToggleTts}
              className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                isTtsActive
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isTtsActive ? 'Suara Narasi ON (Klik untuk Matikan)' : 'Suara Narasi OFF (Klik untuk Nyalakan)'}
            >
              <span>🗣️</span>
              <span className="hidden md:inline">{isTtsActive ? 'Suara' : 'Mute'}</span>
            </button>

            {/* Background Music (BGM) */}
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                isMusicActive
                  ? 'bg-purple-100 text-purple-900 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isMusicActive ? 'Musik BGM ON (Klik untuk Matikan)' : 'Musik BGM OFF (Klik untuk Nyalakan)'}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicActive ? 'text-purple-700 animate-pulse' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{isMusicActive ? 'BGM' : 'BGM Off'}</span>
            </button>

            {/* Sound FX Toggle (Ikon tunggal) */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isMuted
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-gray-400 hover:bg-gray-200'
              }`}
              title={isMuted ? 'Efek Suara Dibisukan' : 'Efek Suara Aktif'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Tombol Peta (Saat di dalam Level) */}
          {currentView === 'level' && (
            <button
              type="button"
              onClick={onNavigateMap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs flex-shrink-0 border border-slate-300 cursor-pointer"
              title="Kembali ke Peta Sekolah"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peta</span>
            </button>
          )}

          {/* Tombol Portal Guru - Ringkas & Sederhana */}
          <button
            type="button"
            onClick={onNavigateTeacher}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs flex-shrink-0 cursor-pointer ${
              currentView === 'teacher'
                ? 'bg-red-600 text-white ring-2 ring-red-400'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title="Dashboard Guru"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Guru</span>
          </button>

          {/* Tombol Keluar Game - Ringkas & Bersih */}
          {onExitGame && (
            <button
              type="button"
              onClick={onExitGame}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              title="Keluar dari Game"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
