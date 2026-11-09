import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { AntiCheatAlertEvent } from '../../services/antiCheat';

interface AntiCheatModalProps {
  alert: AntiCheatAlertEvent | null;
  onDismiss: () => void;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({ alert, onDismiss }) => {
  if (!alert) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 text-center space-y-4 relative overflow-hidden"
        >
          {/* Top Decorative Alert Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 animate-pulse" />

          {/* Animated Caution Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-inner">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider mb-2">
              Pengawas Ujian SD INDONESIA EMAS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {alert.title}
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                {alert.message}
              </p>
            </div>
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-extrabold text-amber-800">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Catatan Pengawas:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black">
                Pelanggaran ke-{alert.count}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Ayo buktikan bahwa kamu adalah anak yang jujur, mandiri, dan berakhlak mulia sesuai nilai luhur Pancasila! ✨
          </p>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Saya Mengerti & Lanjut Ujian Jujur</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
