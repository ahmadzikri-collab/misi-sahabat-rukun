import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Shield, Compass, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { StudentProfile } from '../types/game';

interface NavbarProps {
  currentStudent: StudentProfile;
  currentView: 'map' | 'level' | 'teacher';
  onNavigateMap: () => void;
  onNavigateTeacher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  currentView,
  onNavigateMap,
  onNavigateTeacher,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 px-3 sm:px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateMap}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-red-600 text-base sm:text-lg">
              🇮🇩
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-none group-hover:text-red-600 transition-colors">
              MISI SAHABAT RUKUN
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 block mt-0.5">
              SD Kelas 2 • Hidup Rukun di Sekolah
            </span>
          </div>
        </div>

        {/* Audio and Navigation controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* TTS voice narration toggle */}
          <button
            type="button"
            onClick={handleToggleTts}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isTtsActive
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-gray-100 text-gray-400'
            }`}
            title="Dukungan Suara Baca Narasi Siswa"
          >
            <span className="text-xs font-black">🗣️ {isTtsActive ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          {/* Sound FX toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              !isMuted
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-gray-100 text-gray-400'
            }`}
            title={isMuted ? 'Suara Dibisukan' : 'Efek Suara Aktif'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Background Music toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isMusicActive
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'bg-gray-100 text-gray-400'
            }`}
            title={isMusicActive ? 'Musik Kotak Musik Aktif (Klik untuk Mematikan)' : 'Putar Musik Kotak Musik Ceria & Lembut'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Switch to Map if currently in level */}
          {currentView === 'level' && (
            <button
              type="button"
              onClick={onNavigateMap}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Peta</span>
            </button>
          )}

          {/* Teacher Portal button */}
          <button
            type="button"
            onClick={onNavigateTeacher}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs ${
              currentView === 'teacher'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Dashboard Guru</span>
            <span className="sm:hidden">Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
