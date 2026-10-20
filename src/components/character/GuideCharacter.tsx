import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, HelpCircle, ChevronRight, MessageCircle } from 'lucide-react';
import { CharacterGuide, EmotionState, GuideDialogue } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { createSafeImageErrorHandler } from '../../utils/assets';

interface GuideCharacterProps {
  guide: CharacterGuide;
  activeEmotion?: EmotionState;
  customDialogue?: string | null;
  onDialogueComplete?: () => void;
  showHintButton?: boolean;
  onRequestHint?: () => void;
  compactOnMobile?: boolean;
}

export const GuideCharacter: React.FC<GuideCharacterProps> = ({
  guide,
  activeEmotion = 'idle',
  customDialogue = null,
  onDialogueComplete,
  showHintButton = true,
  onRequestHint,
  compactOnMobile = false,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(activeEmotion);
  const [tapReactionText, setTapReactionText] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);

  // Sync external emotion updates
  useEffect(() => {
    if (activeEmotion) {
      setCurrentEmotion(activeEmotion);
    }
  }, [activeEmotion]);

  // Current dialogue displayed: either custom text (from game event) or welcome dialogues
  const currentDialogueItem: GuideDialogue = guide.welcomeDialogue[dialogueIndex] || guide.welcomeDialogue[0];
  const displayedText = tapReactionText || customDialogue || currentDialogueItem?.text || 'Semangat belajar ya sahabat!';

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      soundManager.stopSpeaking();
    };
  }, []);

  const handleNextDialogue = () => {
    soundManager.playDialoguePop();
    setTapReactionText(null);
    if (dialogueIndex < guide.welcomeDialogue.length - 1) {
      const nextIdx = dialogueIndex + 1;
      setDialogueIndex(nextIdx);
      setCurrentEmotion(guide.welcomeDialogue[nextIdx].emotion || 'talking');
    } else {
      if (onDialogueComplete) {
        onDialogueComplete();
      }
    }
  };

  const handleReadAloud = () => {
    if (isSpeakingTts) {
      soundManager.stopSpeaking();
      setIsSpeakingTts(false);
      setCurrentEmotion('idle');
    } else {
      setIsSpeakingTts(true);
      setCurrentEmotion('talking');
      soundManager.speak(displayedText, () => {
        setIsSpeakingTts(false);
        setCurrentEmotion('idle');
      });
    }
  };

  const handleCharacterTap = () => {
    soundManager.playClick();
    soundManager.playDialoguePop();
    
    // Cycle through random tap greetings
    const nextTapIndex = tapCount % guide.tapGreetings.length;
    const greeting = guide.tapGreetings[nextTapIndex];
    setTapReactionText(greeting);
    setTapCount((prev) => prev + 1);
    setCurrentEmotion('happy');

    // Auto read aloud if TTS is on
    if (soundManager.isTtsActive) {
      setIsSpeakingTts(true);
      soundManager.speak(greeting, () => {
        setIsSpeakingTts(false);
        setCurrentEmotion('idle');
      });
    }

    setTimeout(() => {
      if (!isSpeakingTts) {
        setCurrentEmotion('idle');
      }
    }, 2800);
  };

  const handleHintClick = () => {
    soundManager.playEncourage();
    setCurrentEmotion('thinking');
    const randomHint = guide.hintPhrases[Math.floor(Math.random() * guide.hintPhrases.length)];
    setTapReactionText(`💡 Petunjuk Uciel: ${randomHint}`);

    if (onRequestHint) {
      onRequestHint();
    }

    if (soundManager.isTtsActive) {
      setIsSpeakingTts(true);
      soundManager.speak(`Petunjuk dari ${guide.nickname}: ${randomHint}`, () => {
        setIsSpeakingTts(false);
        setCurrentEmotion('idle');
      });
    }
  };

  // Animation variants for responsive character emotions
  const avatarVariants = {
    idle: {
      y: [0, -6, 0],
      rotate: [0, 1, -1, 0],
      transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' as const },
    },
    talking: {
      scale: [1, 1.04, 1, 1.03, 1],
      y: [0, -8, 0],
      transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' as const },
    },
    happy: {
      y: [0, -18, 0, -12, 0],
      rotate: [-4, 4, -3, 3, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.9, ease: 'easeOut' as const },
    },
    encouraging: {
      rotate: [0, -8, 8, -6, 6, 0],
      y: [0, -6, 0],
      transition: { duration: 1.1, ease: 'easeInOut' as const },
    },
    thinking: {
      rotate: [0, 4, 4, 0],
      scale: [1, 0.98, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <div
      className={`relative w-full rounded-3xl p-3 sm:p-5 shadow-xl border-4 transition-all duration-300 ${
        compactOnMobile ? 'bg-white/95 backdrop-blur-md' : 'bg-gradient-to-br from-white via-amber-50/50 to-orange-50/80'
      }`}
      style={{
        borderColor: guide.themeColor.border,
      }}
    >
      {/* Decorative top ribbon badge */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {guide.role}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
          style={{ backgroundColor: guide.themeColor.primary }}
        >
          {guide.locationName}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Interactive Character Avatar Container */}
        <div className="relative group cursor-pointer flex-shrink-0" onClick={handleCharacterTap}>
          <motion.div
            variants={avatarVariants}
            animate={currentEmotion}
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden p-1 shadow-md bg-gradient-to-tr from-amber-200 via-rose-100 to-sky-200 border-2 border-white"
          >
            <img
              src={guide.avatarUrl}
              alt={guide.name}
              referrerPolicy="no-referrer"
              onError={createSafeImageErrorHandler('uciel')}
              className="w-full h-full object-cover rounded-xl select-none pointer-events-none group-hover:scale-105 transition-transform duration-300"
            />

            {/* Glowing animated halo when speaking */}
            {isSpeakingTts && (
              <div className="absolute inset-0 rounded-xl ring-4 ring-amber-400 ring-offset-2 animate-pulse pointer-events-none" />
            )}

            {/* Emotion sticker overlay */}
            <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold shadow text-gray-800 flex items-center gap-1">
              {currentEmotion === 'happy' && '🌟 Senang!'}
              {currentEmotion === 'talking' && '💬 Bicara'}
              {currentEmotion === 'thinking' && '🤔 Berpikir'}
              {currentEmotion === 'encouraging' && '💪 Semangat!'}
              {currentEmotion === 'idle' && '👋 Halo!'}
            </div>
          </motion.div>

          {/* Tap-me interactive pill for kids */}
          <div className="text-center mt-1">
            <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs group-hover:bg-amber-200 transition-colors">
              👆 Ketuk {guide.nickname}!
            </span>
          </div>
        </div>

        {/* Speech Bubble Container */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-100 min-h-[96px] sm:min-h-[110px] flex flex-col justify-center">
            {/* Triangular speech bubble arrow pointing to avatar */}
            <div className="hidden sm:block absolute -left-3 top-7 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-white border-b-8 border-b-transparent drop-shadow-[-2px_0_1px_rgba(0,0,0,0.04)]" />

            {/* Speaker name */}
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm sm:text-base font-black flex items-center gap-1.5"
                style={{ color: guide.themeColor.primary }}
              >
                <MessageCircle className="w-4 h-4" />
                {guide.nickname}:
              </span>

              {/* TTS Audio Speak Button */}
              <button
                type="button"
                onClick={handleReadAloud}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSpeakingTts
                    ? 'bg-amber-500 text-white animate-bounce shadow-md'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
                title="Dengarkan suara karakter dibaca nyaring"
              >
                {isSpeakingTts ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Dengar Suara
                  </>
                )}
              </button>
            </div>

            {/* Dialogue Text with Animation */}
            <AnimatePresence mode="wait">
              <motion.p
                key={displayedText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-base sm:text-lg font-bold text-gray-800 leading-snug sm:leading-relaxed selection:bg-amber-200"
              >
                {displayedText}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-1">
            {/* Petunjuk / Hint Button */}
            {showHintButton && (
              <button
                type="button"
                onClick={handleHintClick}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 active:scale-95 transition-all shadow-xs border border-amber-300"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Petunjuk Uciel</span>
              </button>
            )}

            {/* Dialogue stepper if browsing welcome dialogue */}
            {!customDialogue && !tapReactionText && guide.welcomeDialogue.length > 1 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold text-gray-400">
                  {dialogueIndex + 1}/{guide.welcomeDialogue.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextDialogue}
                  className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
                >
                  <span>{dialogueIndex < guide.welcomeDialogue.length - 1 ? 'Lanjut' : 'Siap Mulai!'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reset custom response button if tapped */}
            {(tapReactionText || customDialogue) && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setTapReactionText(null);
                  setCurrentEmotion('idle');
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 ml-auto px-2 py-1 underline"
              >
                Kembali ke Misi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
