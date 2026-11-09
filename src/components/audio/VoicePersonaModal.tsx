import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, X, Check, Play, Mic, Star } from 'lucide-react';
import { soundManager, VoicePersona } from '../../utils/audio';
import { UCIEL_AVATAR } from '../../data/characters';
import { createSafeImageErrorHandler } from '../../utils/assets';

interface VoicePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonaOption {
  id: VoicePersona;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  badge?: string;
  themeColor: string;
  borderColor: string;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'keren',
    title: 'Garuda Keren & Energik',
    tagline: 'Gagah, mantap, dan bersemangat!',
    description: 'Suara petualang berkarakter percaya diri dan asik, memikat perhatian anak agar antusias belajar.',
    icon: '🦅',
    badge: '🌟 Rekomendasi Paling Keren',
    themeColor: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400',
  },
  {
    id: 'ceria',
    title: 'Uciel Ceria & Ramah',
    tagline: 'Manis, hangat, dan riang gembira!',
    description: 'Suara ramah khas sahabat cilik kelas 2 SD, penuh kehangatan dan kebaikan hati.',
    icon: '🐥',
    themeColor: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-400',
  },
  {
    id: 'studio',
    title: 'Penyiar Studio Jernih',
    tagline: 'Santun, jelas, dan berartikulasi rapi!',
    description: 'Suara narator profesional dengan intonasi tenang dan artikulasi kata yang sangat jelas.',
    icon: '🎙️',
    themeColor: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400',
  },
];

export const VoicePersonaModal: React.FC<VoicePersonaModalProps> = ({ isOpen, onClose }) => {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(soundManager.voicePersona);
  const [isSpeaking, setIsSpeaking] = useState(soundManager.isSpeakingKey('voice-test-sample'));
  const [isTtsActive, setIsTtsActive] = useState(soundManager.isTtsActive);

  useEffect(() => {
    const unsubPersona = soundManager.addPersonaListener((p) => {
      setSelectedPersona(p);
    });
    const unsubSpeech = soundManager.addSpeechListener((key) => {
      setIsSpeaking(key === 'voice-test-sample');
    });
    return () => {
      unsubPersona();
      unsubSpeech();
    };
  }, []);

  if (!isOpen) return null;

  const handleSelect = (persona: VoicePersona) => {
    soundManager.playClick();
    setSelectedPersona(persona);
    soundManager.setVoicePersona(persona);
    soundManager.testVoice(persona);
  };

  const handleTestVoice = () => {
    soundManager.playClick();
    soundManager.testVoice(selectedPersona);
  };

  const handleToggleTts = () => {
    const newState = soundManager.toggleTts();
    setIsTtsActive(newState);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Modal */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                <img
                  src={UCIEL_AVATAR}
                  alt="Uciel"
                  referrerPolicy="no-referrer"
                  onError={createSafeImageErrorHandler('uciel')}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  Karakter Suara Maskot Uciel
                </span>
                <h3 className="text-lg sm:text-xl font-black">
                  Pilih Suara Pemandu Keren
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-bold text-amber-950">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-700" />
                <span>Status Suara Narasi:</span>
              </div>
              <button
                type="button"
                onClick={handleToggleTts}
                className={`px-3 py-1 rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isTtsActive
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 hover:bg-slate-300 text-gray-700'
                }`}
              >
                {isTtsActive ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Aktif (ON)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Mute (OFF)</span>
                  </>
                )}
              </button>
            </div>

            {/* Persona Options Grid */}
            <div className="space-y-3">
              {PERSONA_OPTIONS.map((opt) => {
                const isSelected = selectedPersona === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-md ring-3 ring-amber-300/80 scale-[1.01]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-xs ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {opt.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-gray-900">
                              {opt.title}
                            </h4>
                            {opt.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wide shadow-2xs">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-amber-800 mt-0.5">
                            {opt.tagline}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Voice Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestVoice}
                className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                }`}
              >
                <Play className={`w-4 h-4 fill-current ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>
                  {isSpeaking ? 'Sedang Memutar Contoh Suara...' : '▶️ Tes Suara Pemandu Pilihan Ini'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <span className="text-[11px] text-gray-500 font-semibold hidden sm:inline">
              ✨ Pilihan suara tersimpan otomatis di perangkat Anda
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-transform active:scale-95 cursor-pointer ml-auto"
            >
              Simpan & Selesai
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
