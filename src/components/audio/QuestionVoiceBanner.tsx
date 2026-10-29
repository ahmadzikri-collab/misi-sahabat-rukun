import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, VolumeX } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { UCIEL_AVATAR } from '../../data/characters';
import { createSafeImageErrorHandler } from '../../utils/assets';

interface QuestionVoiceBannerProps {
  situationOrContext?: string;
  question: string;
  options: { id?: string; text: string }[];
  questionId: string;
  className?: string;
}

export const QuestionVoiceBanner: React.FC<QuestionVoiceBannerProps> = ({
  situationOrContext,
  question,
  options,
  questionId,
  className = '',
}) => {
  const speechKey = `full-q-${questionId}`;
  const [isSpeaking, setIsSpeaking] = useState(soundManager.isSpeakingKey(speechKey));

  useEffect(() => {
    const unsub = soundManager.addSpeechListener((activeKey) => {
      setIsSpeaking(activeKey === speechKey);
    });
    return () => unsub();
  }, [speechKey]);

  const handleToggleFullSpeech = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
    } else {
      soundManager.speakQuestionAndOptions(
        speechKey,
        situationOrContext || '',
        question,
        options
      );
    }
  };

  return (
    <div className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all ${
      isSpeaking
        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
        : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300/90 text-amber-950'
    } ${className}`}>
      <button
        type="button"
        onClick={handleToggleFullSpeech}
        className="flex-1 flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
        title={isSpeaking ? 'Ketuk untuk menghentikan suara' : 'Dengarkan suara ramah Uciel membacakan soal'}
      >
        {/* Uciel mascot circle avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-amber-500 bg-amber-200 shadow-xs">
            <img
              src={UCIEL_AVATAR}
              alt="Uciel"
              referrerPolicy="no-referrer"
              onError={createSafeImageErrorHandler('uciel')}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-black ${
              isSpeaking ? 'bg-red-600 text-white animate-bounce' : 'bg-amber-500 text-slate-950'
            }`}
          >
            <Volume2 className="w-2.5 h-2.5" />
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 leading-tight">
            <span>{isSpeaking ? 'Uciel Membacakan Panduan Soal...' : 'Suara Ramah Uciel: Bacakan Soal & Pilihan'}</span>
            {isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-amber-900/80 font-semibold leading-tight mt-0.5">
            {isSpeaking
              ? 'Ketuk tombol ini untuk menghentikan pembacaan suara'
              : 'Ketuk di sini agar Uciel membacakan soal dengan suara imut'}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isSpeaking ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.stopSpeaking();
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center gap-1"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            <span>Diam</span>
          </button>
        ) : (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950">
            Bahasa Indonesia
          </span>
        )}
      </div>
    </div>
  );
};
