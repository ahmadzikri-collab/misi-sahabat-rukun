import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface VoiceReadButtonProps {
  text: string;
  speechKey: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'icon' | 'banner';
  className?: string;
  title?: string;
}

export const VoiceReadButton: React.FC<VoiceReadButtonProps> = ({
  text,
  speechKey,
  label,
  size = 'sm',
  variant = 'pill',
  className = '',
  title = 'Dengarkan suara panduan',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(soundManager.isSpeakingKey(speechKey));

  useEffect(() => {
    const unsub = soundManager.addSpeechListener((activeKey) => {
      setIsSpeaking(activeKey === speechKey);
    });
    return () => unsub();
  }, [speechKey]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.speak(text, speechKey);
  };

  // Icon only
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={isSpeaking ? 'Hentikan suara' : title}
        className={`relative inline-flex items-center justify-center rounded-xl transition-all active:scale-90 ${
          isSpeaking
            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md scale-105'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 shadow-2xs'
        } ${
          size === 'xs'
            ? 'w-7 h-7 p-1 text-[11px]'
            : size === 'sm'
            ? 'w-8 h-8 p-1.5'
            : 'w-10 h-10 p-2'
        } ${className}`}
      >
        {isSpeaking ? (
          <>
            <span className="absolute -inset-1 rounded-xl bg-amber-400/40 animate-ping pointer-events-none" />
            <Volume2 className="w-4 h-4 animate-bounce text-slate-950" />
          </>
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Full Banner (ideal above question context)
  if (variant === 'banner') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={isSpeaking ? 'Ketuk untuk menghentikan suara' : title}
        className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between gap-2 transition-all active:scale-98 font-bold text-xs sm:text-sm border shadow-xs ${
          isSpeaking
            ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-500 ring-2 ring-amber-300'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-amber-300'
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${
              isSpeaking ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
          </div>
          <span className="text-left leading-tight">
            {isSpeaking
              ? '🔊 Sedang membacakan... (Ketuk untuk berhenti)'
              : label || '🔊 Dengarkan Suara Panduan & Soal'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isSpeaking ? (
            <span className="flex gap-0.5 items-end h-4">
              <span className="w-1 h-2 bg-slate-900 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-slate-900 rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-slate-900 rounded-full animate-pulse" />
            </span>
          ) : (
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
              Suara Anak
            </span>
          )}
        </div>
      </button>
    );
  }

  // Standard Pill button
  return (
    <button
      type="button"
      onClick={handleClick}
      title={isSpeaking ? 'Hentikan suara' : title}
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 shadow-xs border ${
        isSpeaking
          ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300 scale-102 font-black'
          : 'bg-amber-100/90 hover:bg-amber-200 text-amber-950 border-amber-300'
      } ${
        size === 'xs'
          ? 'px-2 py-1 text-[11px]'
          : size === 'sm'
          ? 'px-2.5 py-1.5 text-xs'
          : 'px-3.5 py-2 text-sm'
      } ${className}`}
    >
      <Volume2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSpeaking ? 'animate-bounce text-slate-950' : 'text-amber-800'}`} />
      <span>{isSpeaking ? 'Berhenti' : label || 'Dengarkan'}</span>
      {isSpeaking && (
        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping ml-0.5" />
      )}
    </button>
  );
};
