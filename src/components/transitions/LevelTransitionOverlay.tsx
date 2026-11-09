import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Star } from 'lucide-react';
import { UCIEL_AVATAR } from '../../data/characters';
import { soundManager } from '../../utils/audio';

export interface LevelTransitionOverlayProps {
  isVisible: boolean;
  destinationTitle: string;
  destinationSubtitle?: string;
  destinationIcon?: string;
  themeColor?: string;
  onAnimationComplete?: () => void;
}

export const LevelTransitionOverlay: React.FC<LevelTransitionOverlayProps> = ({
  isVisible,
  destinationTitle,
  destinationSubtitle = 'Petualangan Hidup Rukun di Sekolah',
  destinationIcon = '🚀',
  themeColor = 'from-amber-400 via-rose-500 to-red-500',
  onAnimationComplete,
}) => {
  useEffect(() => {
    if (isVisible) {
      soundManager.playTransitionChime();
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="level-transition-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md select-none pointer-events-auto"
        >
          {/* Floating animated sparkles & light burst */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0.3, 0.7, 0.4] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-400/20 via-rose-500/25 to-yellow-300/20 blur-3xl"
            />
          </div>

          {/* Central Portal Card */}
          <motion.div
            initial={{ scale: 0.85, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: -20, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-sm sm:max-w-md w-11/12 mx-auto bg-gradient-to-b from-white to-amber-50/90 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center"
          >
            {/* Animated Mascot Uciel Garuda */}
            <div className="relative mb-3">
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-300 via-rose-400 to-amber-200 p-1 shadow-xl relative"
              >
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={UCIEL_AVATAR}
                    alt="Maskot Uciel Garuda"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Sparkling star badges */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, 45, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md font-black text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
              </motion.div>
            </div>

            {/* Destination Icon & Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black mb-2 shadow-xs">
              <span className="text-sm">{destinationIcon}</span>
              <span>Membuka Gerbang Petualangan</span>
            </div>

            {/* Destination Title */}
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight mb-1">
              {destinationTitle}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-gray-600 font-bold mb-4">
              {destinationSubtitle}
            </p>

            {/* Cheerful Animated Loading Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [0.75, 1.3, 0.75],
                    backgroundColor: ['#f59e0b', '#ef4444', '#f59e0b'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.65,
                    delay: i * 0.16,
                  }}
                  className="w-2.5 h-2.5 rounded-full"
                />
              ))}
            </div>

            <span className="text-[11px] font-extrabold text-amber-700 mt-2">
              Ayo melangkah bersama Uciel! ✨
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
