import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Lock, Play, Sparkles, BookOpen, Utensils, Palette, Trophy, Award, Info } from 'lucide-react';
import { SCHOOL_MAP_BG, UCIEL_AVATAR } from '../data/characters';
import { createSafeImageErrorHandler } from '../utils/assets';
import { LevelProgress, StudentProfile } from '../types/game';
import { soundManager } from '../utils/audio';
import { gameDb } from '../services/db';

interface SchoolMapProps {
  currentStudent: StudentProfile;
  levelProgress: Record<string, LevelProgress>;
  levelUnlocks?: Record<string, boolean>;
  onSelectLevel: (levelId: string) => void;
  onOpenGuideModal: () => void;
}

interface MapLocationDef {
  id: string;
  name: string;
  subject: string;
  guideNickname: string;
  guideRole: string;
  avatarUrl: string;
  badgeEmoji: string;
  themeColor: string;
  description: string;
  posDesktop: { top: string; left: string };
  posMobile: { top: string; left: string };
}

const MAP_LOCATIONS: MapLocationDef[] = [
  {
    id: 'taman-pancasila',
    name: 'Taman Pancasila',
    subject: 'PPKn',
    guideNickname: 'Uciel',
    guideRole: 'Garuda Cilik Pancasila',
    avatarUrl: UCIEL_AVATAR,
    badgeEmoji: '⭐',
    themeColor: 'from-red-500 to-rose-600',
    description: 'Mengenal simbol sila Pancasila dan mempraktikkan hidup rukun di sekolah.',
    posDesktop: { top: '68%', left: '16%' },
    posMobile: { top: '65%', left: '20%' },
  },
  {
    id: 'perpustakaan-ceria',
    name: 'Perpustakaan Ceria',
    subject: 'B. Indonesia',
    guideNickname: 'Uciel',
    guideRole: 'Garuda Kalimat Santun',
    avatarUrl: UCIEL_AVATAR,
    badgeEmoji: '📖',
    themeColor: 'from-blue-500 to-indigo-600',
    description: 'Ungkapan ramah, kalimat ajakan, perintah sopan, dan cara menolak santun.',
    posDesktop: { top: '32%', left: '24%' },
    posMobile: { top: '28%', left: '30%' },
  },
  {
    id: 'kantin-pintar',
    name: 'Kantin Pintar',
    subject: 'Matematika',
    guideNickname: 'Uciel',
    guideRole: 'Garuda Jago Berhitung',
    avatarUrl: UCIEL_AVATAR,
    badgeEmoji: '🍎',
    themeColor: 'from-emerald-500 to-teal-600',
    description: 'Penjumlahan dan pengurangan jajanan sehat serta tertib antre bersama teman.',
    posDesktop: { top: '44%', left: '46%' },
    posMobile: { top: '45%', left: '50%' },
  },
  {
    id: 'studio-kreatif',
    name: 'Studio Kreatif',
    subject: 'SBdP',
    guideNickname: 'Uciel',
    guideRole: 'Garuda Seniman Cilik',
    avatarUrl: UCIEL_AVATAR,
    badgeEmoji: '🎨',
    themeColor: 'from-purple-500 to-pink-600',
    description: 'Mengenal karya imajinatif 2D dan 3D tentang indahnya kebersamaan sekolah.',
    posDesktop: { top: '48%', left: '68%' },
    posMobile: { top: '55%', left: '72%' },
  },
  {
    id: 'lapangan-persahabatan',
    name: 'Lapangan Persahabatan',
    subject: 'PJOK',
    guideNickname: 'Uciel',
    guideRole: 'Garuda Sportif & Lincah',
    avatarUrl: UCIEL_AVATAR,
    badgeEmoji: '⚽',
    themeColor: 'from-orange-500 to-amber-600',
    description: 'Variasi gerak lokomotor (berlari, melompat) dan sportivitas saat bermain.',
    posDesktop: { top: '74%', left: '80%' },
    posMobile: { top: '78%', left: '75%' },
  },
];

export const SchoolMap: React.FC<SchoolMapProps> = ({
  currentStudent,
  levelProgress,
  levelUnlocks,
  onSelectLevel,
  onOpenGuideModal,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocationDef | null>(MAP_LOCATIONS[0]);

  // Reactive unlock mapping
  const currentUnlocks = levelUnlocks || gameDb.getLevelUnlockSettings();

  // Calculate total stars
  const totalStars = Object.values(levelProgress).reduce((acc, curr) => acc + (curr.starsEarned || 0), 0);
  const totalXP = Object.values(levelProgress).reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);

  const handleLocationClick = (loc: MapLocationDef) => {
    soundManager.playClick();
    setSelectedLocation(loc);
  };

  const handleStartMission = (locId: string) => {
    soundManager.playSuccess();
    onSelectLevel(locId);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-900 flex flex-col">
      {/* Top Floating Player Status Card */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 px-4 py-3 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-amber-300 text-sm">
                {currentStudent.nickname.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold">Halo Sahabat Rukun,</div>
              <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{currentStudent.displayName}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600/80 text-white">
                  {currentStudent.classCode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{totalStars} / 15 Bintang</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{totalXP} XP</span>
            </div>

            <button
              type="button"
              onClick={onOpenGuideModal}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1 transition-colors border border-slate-600"
              title="Panduan Guru & Pengembang: Cara Menambahkan Karakter Serupa"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Panduan Karakter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/60 bg-slate-800">
          {/* Map Illustrated Canvas */}
          <img
            src={SCHOOL_MAP_BG}
            alt="Peta Petualangan SD Harapan Bangsa"
            referrerPolicy="no-referrer"
            onError={createSafeImageErrorHandler('map')}
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />

          {/* Location Interactive Pins on Map */}
          {MAP_LOCATIONS.map((loc, idx) => {
            const prog = levelProgress[loc.id];
            // Kunci level diatur oleh guru di Dashboard Guru (reaktif dari Cloud/Local)
            const isUnlocked = Boolean(currentUnlocks[loc.id]);
            const starsEarned = prog?.starsEarned || 0;
            const isCurrentSelected = selectedLocation?.id === loc.id;

            return (
              <div
                key={loc.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  top: loc.posDesktop.top,
                  left: loc.posDesktop.left,
                }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLocationClick(loc)}
                  className={`group relative flex flex-col items-center focus:outline-none`}
                >
                  {/* Glowing pulse if unlocked */}
                  {isUnlocked && (
                    <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                  )}

                  {/* Character Avatar Pin Bubble */}
                  <div
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl p-1 shadow-2xl transition-all border-3 ${
                      isCurrentSelected
                        ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-900 scale-110 border-white'
                        : 'border-white/80'
                    } ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-300 to-rose-400'
                        : 'bg-slate-700 opacity-80 border-slate-500'
                    }`}
                  >
                    <img
                      src={loc.avatarUrl}
                      alt={loc.guideNickname}
                      referrerPolicy="no-referrer"
                      onError={createSafeImageErrorHandler('uciel')}
                      className={`w-full h-full object-cover rounded-xl ${!isUnlocked && 'grayscale'}`}
                    />

                    {/* Lock badge if locked */}
                    {!isUnlocked ? (
                      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-300" />
                      </div>
                    ) : (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                        {idx + 1}
                      </div>
                    )}

                    {/* Stars achieved pill */}
                    {isUnlocked && starsEarned > 0 && (
                      <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center gap-0.5 shadow">
                        <Star className="w-2.5 h-2.5 fill-amber-950" />
                        <span>{starsEarned}</span>
                      </div>
                    )}
                  </div>

                  {/* Location label */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-white text-[11px] sm:text-xs font-black shadow-lg backdrop-blur-sm border border-slate-700 whitespace-nowrap">
                    {loc.name}
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Location Bottom Drawer / Card */}
      {selectedLocation && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 sm:p-5 z-20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-lg">
                <img
                  src={selectedLocation.avatarUrl}
                  alt={selectedLocation.guideNickname}
                  referrerPolicy="no-referrer"
                  onError={createSafeImageErrorHandler('uciel')}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 uppercase">
                    {selectedLocation.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Pemandu: {selectedLocation.guideNickname}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-lg">
                  {selectedLocation.description}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-3">
              {Boolean(currentUnlocks[selectedLocation.id]) ? (
                <button
                  type="button"
                  onClick={() => handleStartMission(selectedLocation.id)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Mainkan Misi Bersama {selectedLocation.guideNickname}!</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-700/80 text-amber-300 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-amber-500/30 shadow-inner"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Petualangan Terkunci</span>
                  </button>
                  <span className="text-[11px] text-amber-300/90 font-bold mt-1 text-center sm:text-right">
                    Terkunci oleh Guru. Anda dapat membuka kuncinya kapan saja melalui menu di Dashboard Guru!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
