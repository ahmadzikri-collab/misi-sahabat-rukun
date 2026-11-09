import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, VolumeX, Mic, Settings } from 'lucide-react';
import { soundManager, VoicePersona } from '../../utils/audio';
import { UCIEL_AVATAR } from '../../data/characters';
import { createSafeImageErrorHandler } from '../../utils/assets';
import { VoicePersonaModal } from './VoicePersonaModal';

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
  const [persona, setPersona] = useState<VoicePersona>(soundManager.voicePersona);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    const unsubSpeech = soundManager.addSpeechListener((activeKey) => {
      setIsSpeaking(activeKey === speechKey);
    });
    const unsubPersona = soundManager.addPersonaListener((p) => {
      setPersona(p);
    });
    return () => {
      unsubSpeech();
      unsubPersona();
    };
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

  const personaLabel =
    persona === 'keren'
      ? '🦅 Suara Keren Uciel'
      : persona === 'ceria'
      ? '🐥 Suara Ceria Uciel'
      : '🎙️ Suara Studio';

  return (
    <>
      <div className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all ${
        isSpeaking
          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
          : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300/90 text-amber-950'
      } ${className}`}>
        <button
          type="button"
          onClick={handleToggleFullSpeech}
          className="flex-1 flex items-center gap-2.5 text-left focus:outline-none cursor-pointer min-w-0"
          title={isSpeaking ? 'Ketuk untuk menghentikan suara' : 'Dengarkan suara pemandu Uciel membacakan soal'}
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

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 leading-tight truncate">
              <span>{isSpeaking ? 'Uciel Membacakan Panduan Soal...' : `${personaLabel}: Bacakan Soal & Pilihan`}</span>
              {isSpeaking && (
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping flex-shrink-0" />
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-amber-900/80 font-semibold leading-tight mt-0.5 truncate">
              {isSpeaking
                ? 'Ketuk untuk menghentikan pembacaan suara'
                : 'Ketuk di sini agar Uciel membacakan soal dengan suara keren'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setShowVoiceModal(true);
            }}
            className="px-2 py-1 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-[10px] sm:text-[11px] font-black border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Ubah Karakter Suara Pemandu"
          >
            <Mic className="w-3 h-3 text-amber-800" />
            <span className="hidden xs:inline">Ubah Suara</span>
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.stopSpeaking();
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Diam</span>
            </button>
          )}
        </div>
      </div>

      <VoicePersonaModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </>
  );
};
