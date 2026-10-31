import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Lock, Play, Sparkles, BookOpen, Utensils, Palette, Trophy, Award, Info, LogOut } from 'lucide-react';
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
  onExitGame?: () => void;
  onOpenLeaderboard?: () => void;
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
    posDesktop: { top: '34%', left: '16%' },
    posMobile: { top: '34%', left: '18%' },
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
    posDesktop: { top: '34%', left: '86%' },
    posMobile: { top: '34%', left: '84%' },
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
    posDesktop: { top: '64%', left: '20%' },
    posMobile: { top: '64%', left: '22%' },
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
    posDesktop: { top: '78%', left: '11%' },
    posMobile: { top: '78%', left: '13%' },
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
    posDesktop: { top: '76%', left: '79%' },
    posMobile: { top: '76%', left: '78%' },
  },
];

export const SchoolMap: React.FC<SchoolMapProps> = ({
  currentStudent,
  levelProgress,
  levelUnlocks,
  onSelectLevel,
  onOpenGuideModal,
  onExitGame,
  onOpenLeaderboard,
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

  // Check screen width for mobile pin positioning
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-900 flex flex-col pb-8">
      {/* Top Floating Player Status Card */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 px-3 sm:px-6 py-2.5 sm:py-3 z-10 sticky top-[57px]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-amber-300 text-xs sm:text-sm">
                {currentStudent.nickname.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold leading-tight">Halo Sahabat Rukun,</div>
              <div className="text-xs sm:text-base font-black text-white flex items-center gap-1.5 leading-tight mt-0.5">
                <span className="truncate max-w-[140px] sm:max-w-none">{currentStudent.displayName}</span>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-600/80 text-white">
                  {currentStudent.classCode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{totalStars} / 15</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalXP} XP</span>
            </div>

            {/* Tombol Papan Peringkat Siswa */}
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs sm:text-sm border border-amber-500 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Buka Papan Peringkat Siswa"
              >
                <Trophy className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                <span>Peringkat</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGuideModal}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1 transition-colors border border-slate-600 cursor-pointer"
              title="Panduan Bermain Game"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Panduan Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-3 sm:border-4 border-amber-400/60 bg-slate-800">
          {/* Map Illustrated Canvas */}
          <img
            src={SCHOOL_MAP_BG}
            alt="Peta Petualangan SD Indonesia Emas"
            referrerPolicy="no-referrer"
            onError={createSafeImageErrorHandler('map')}
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />

          {/* Location Interactive Pins on Map */}
          {MAP_LOCATIONS.map((loc, idx) => {
            const prog = levelProgress[loc.id];
            const isUnlocked = Boolean(currentUnlocks[loc.id]);
            const starsEarned = prog?.starsEarned || 0;
            const isCurrentSelected = selectedLocation?.id === loc.id;
            const pos = isMobileScreen ? loc.posMobile : loc.posDesktop;

            return (
              <div
                key={loc.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  top: pos.top,
                  left: pos.left,
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
                    <span className="absolute -inset-1.5 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                  )}

                  {/* Character Avatar Pin Bubble */}
                  <div
                    className={`relative w-10 h-10 sm:w-16 sm:h-16 rounded-2xl p-0.5 sm:p-1 shadow-2xl transition-all border-2 sm:border-3 ${
                      isCurrentSelected
                        ? 'ring-3 sm:ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-900 scale-110 border-white'
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
                        <Lock className="w-4 h-4 text-amber-300" />
                      </div>
                    ) : (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                        {idx + 1}
                      </div>
                    )}

                    {/* Stars achieved pill */}
                    {isUnlocked && starsEarned > 0 && (
                      <div className="absolute -bottom-1.5 sm:-bottom-2 inset-x-0 mx-auto w-max px-1 sm:px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] flex items-center gap-0.5 shadow">
                        <Star className="w-2.5 h-2.5 fill-amber-950" />
                        <span>{starsEarned}</span>
                      </div>
                    )}
                  </div>

                  {/* Location label (compact on mobile) */}
                  <div className="mt-1 px-1.5 sm:px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-white text-[10px] sm:text-xs font-black shadow-lg backdrop-blur-sm border border-slate-700 whitespace-nowrap hidden sm:block">
                    {loc.name}
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Location Details / Action Card */}
      {selectedLocation && (
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 mb-6 z-20">
          <div className="bg-slate-800/95 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-lg bg-slate-900">
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
                    <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 uppercase">
                      {selectedLocation.subject}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-300">
                      Pemandu: {selectedLocation.guideNickname}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-white mt-0.5">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-lg mt-0.5">
                    {selectedLocation.description}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-end gap-3 flex-shrink-0">
                {Boolean(currentUnlocks[selectedLocation.id]) ? (
                  <button
                    type="button"
                    onClick={() => handleStartMission(selectedLocation.id)}
                    className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span>Mulai Misi Bersama {selectedLocation.guideNickname}!</span>
                  </button>
                ) : (
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-700/80 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-amber-500/30 shadow-inner"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Petualangan Terkunci</span>
                    </button>
                    <span className="text-[10px] sm:text-[11px] text-amber-300/90 font-bold mt-1 text-center sm:text-right">
                      Dapat dibuka sewaktu-waktu oleh Guru di Dashboard.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Mission Cards List: Sangat nyaman untuk layar HP & Tablet */}
      <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <span>🚀 Daftar Misi Petualangan Siswa</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              5 Misi
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Ketuk misi untuk langsung bermain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MAP_LOCATIONS.map((loc, idx) => {
            const prog = levelProgress[loc.id];
            const isUnlocked = Boolean(currentUnlocks[loc.id]);
            const starsEarned = prog?.starsEarned || 0;
            const isSelected = selectedLocation?.id === loc.id;

            return (
              <div
                key={`list-${loc.id}`}
                onClick={() => {
                  setSelectedLocation(loc);
                  if (isUnlocked) {
                    handleStartMission(loc.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                } ${!isUnlocked && 'opacity-70'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/70 flex-shrink-0 bg-slate-900">
                    <img
                      src={loc.avatarUrl}
                      alt={loc.guideNickname}
                      referrerPolicy="no-referrer"
                      onError={createSafeImageErrorHandler('uciel')}
                      className={`w-full h-full object-cover ${!isUnlocked && 'grayscale'}`}
                    />
                    {!isUnlocked ? (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                    ) : (
                      <div className="absolute top-0 right-0 px-1 rounded-bl-md bg-red-600 text-white font-black text-[9px]">
                        #{idx + 1}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 uppercase">
                        {loc.subject}
                      </span>
                      {starsEarned > 0 && (
                        <span className="flex items-center text-[10px] font-black text-amber-300">
                          ⭐ {starsEarned}/3
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-white mt-0.5 leading-tight">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold line-clamp-1 mt-0.5">
                      {loc.description}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartMission(loc.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-transform active:scale-90 flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span className="hidden sm:inline">Mulai</span>
                    </button>
                  ) : (
                    <span className="p-1.5 rounded-xl bg-slate-700 text-slate-400 text-xs block">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
