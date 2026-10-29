import React, { useState, useEffect } from 'react';
import { ShieldAlert, EyeOff, Sparkles } from 'lucide-react';
import { antiCheatService } from '../../services/antiCheat';
import { UCIEL_AVATAR } from '../../data/characters';
import { createSafeImageErrorHandler } from '../../utils/assets';

export const ScreenPrivacyShield: React.FC = () => {
  const [isObscured, setIsObscured] = useState<boolean>(false);

  useEffect(() => {
    const unsub = antiCheatService.subscribeObscure((obscured) => {
      setIsObscured(obscured);
    });
    return () => unsub();
  }, []);

  if (!isObscured) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={() => antiCheatService.dismissObscure()}
      className="fixed inset-0 z-[999999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-75 cursor-pointer"
    >
      <div className="max-w-md w-full bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-4 relative overflow-hidden">
        {/* Glow beam */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />

        {/* Mascot + Alert Badge */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-3 border-amber-400 bg-slate-800 shadow-xl p-1">
            <img
              src={UCIEL_AVATAR}
              alt="Uciel Sang Pengawas"
              referrerPolicy="no-referrer"
              onError={createSafeImageErrorHandler('uciel')}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-red-600 text-white shadow-lg border-2 border-slate-950">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
          </div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider mb-2">
            🛡️ Pengawas Kejujuran SD INDONESIA EMAS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Layar Ujian Dilindungi!
          </h2>
          <p className="text-xs sm:text-sm font-bold text-amber-300 mt-1">
            Tangkapan Layar (Screenshot) & Berpindah Tab Dicegah
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-2 text-xs text-slate-300 leading-relaxed w-full">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold">
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <span>Soal Disamarkan Otomatis</span>
          </div>
          <p>
            Konten misi terlindungi demi menjaga kejujuran dan sportivitas bersama teman.
            Kembalilah ke halaman kuis untuk melanjutkan pengerjaan secara mandiri!
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sentuh layar ini untuk kembali ke ujian</span>
        </div>
      </div>
    </div>
  );
};
