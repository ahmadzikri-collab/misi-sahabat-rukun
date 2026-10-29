import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Shield, Compass, Sparkles, LogOut } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { antiCheatService } from '../services/antiCheat';
import { StudentProfile } from '../types/game';

interface NavbarProps {
  currentStudent: StudentProfile;
  currentView: 'map' | 'level' | 'teacher';
  onNavigateMap: () => void;
  onNavigateTeacher: () => void;
  onExitGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  currentView,
  onNavigateMap,
  onNavigateTeacher,
  onExitGame,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isMusicActive, setIsMusicActive] = useState(soundManager.isMusicActive);
  const [isTtsActive, setIsTtsActive] = useState(soundManager.isTtsActive);
  const [isBoosted, setIsBoosted] = useState(soundManager.isBoosted);

  const handleToggleSound = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
  };

  const handleToggleBoost = () => {
    const newState = soundManager.toggleAudioBoost();
    setIsBoosted(newState);
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 px-2.5 sm:px-6 py-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateMap}
          className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-red-600 text-sm sm:text-lg">
                🇮🇩
              </div>
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-black text-gray-900 tracking-tight leading-none group-hover:text-red-600 transition-colors">
                MISI SAHABAT RUKUN
              </h1>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 block mt-0.5">
                SD INDONESIA EMAS • Hidup Rukun di Sekolah
              </span>
            </div>
          </div>

          {/* Mobile Guru Quick Access */}
          <div className="sm:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTeacher();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-black shadow-xs"
            >
              <Shield className="w-3 h-3 text-amber-300" />
              <span>Guru</span>
            </button>
          </div>
        </div>

        {/* Audio and Navigation controls row */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1 sm:gap-2 overflow-x-auto py-0.5 no-scrollbar">
          {/* Audio Booster button (Mode Suara Kuat Super Nyaring) */}
          <button
            type="button"
            onClick={handleToggleBoost}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 shadow-xs border ${
              isBoosted
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 border-amber-500 shadow-amber-200/80 ring-2 ring-amber-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300'
            }`}
            title={isBoosted ? 'Mode Audio Kuat Aktif (2.8x Nyaring & Jernih)' : 'Klik untuk Aktifkan Mode Audio Kuat'}
          >
            <span className="text-xs">🔊</span>
            <span className="text-[11px]">
              {isBoosted ? 'Audio Kuat (ON)' : 'Audio Normal'}
            </span>
          </button>

          {/* TTS voice narration toggle */}
          <button
            type="button"
            onClick={handleToggleTts}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex-shrink-0 border ${
              isTtsActive
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
            title="Dukungan Suara Baca Narasi Siswa"
          >
            <span>🗣️ {isTtsActive ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          {/* Sound FX toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
              !isMuted
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
            title={isMuted ? 'Suara Efek Dibisukan' : 'Efek Suara Aktif'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Background Music toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
              isMusicActive
                ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
            title={isMusicActive ? 'Musik Aktif' : 'Musik Mati'}
          >
            <Music className="w-4 h-4 text-purple-700" />
          </button>

          {/* Switch to Map if currently in level */}
          {currentView === 'level' && (
            <button
              type="button"
              onClick={onNavigateMap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs flex-shrink-0 border border-slate-300"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peta</span>
            </button>
          )}

          {/* Teacher Portal button (Desktop) */}
          <button
            type="button"
            onClick={onNavigateTeacher}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs flex-shrink-0 cursor-pointer ${
              currentView === 'teacher'
                ? 'bg-red-600 text-white ring-2 ring-red-400'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard Guru</span>
          </button>

          {/* Satu Tombol Keluar Game Tunggal yang Bersih & Responsif */}
          {onExitGame && (
            <button
              type="button"
              onClick={onExitGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              title="Keluar dari Game (Tandai Siswa Offline)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Game</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
