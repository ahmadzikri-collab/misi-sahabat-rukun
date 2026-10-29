import React, { useState, useEffect } from 'react';
import { ShieldCheck, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { antiCheatService } from '../../services/antiCheat';

interface AntiCheatBannerProps {
  violationCount: number;
}

export const AntiCheatBanner: React.FC<AntiCheatBannerProps> = ({ violationCount }) => {
  const [isFullscreen, setIsFullscreen] = useState(antiCheatService.isFullscreen());

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(antiCheatService.isFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    const fs = await antiCheatService.toggleFullscreen();
    setIsFullscreen(fs);
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 text-white text-xs border border-slate-700 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pengawas Kejujuran Aktif</span>
        </div>
        <span className="text-[11px] text-slate-300 hidden sm:inline">
          Anti Pindah Tab & Tangkap Layar
        </span>
      </div>

      <div className="flex items-center gap-2">
        {violationCount > 0 ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>{violationCount} Peringatan</span>
          </span>
        ) : (
          <span className="text-[11px] text-emerald-400 font-extrabold">
            ⭐ Status Bersih
          </span>
        )}


        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-bold transition-all active:scale-95"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Aktifkan Layar Penuh Ujian'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Keluar Penuh</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 text-emerald-400" />
              <span>Layar Penuh Ujian</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
