import React, { useState } from 'react';
import { Shield, X, AlertCircle, Globe, Copy, Check, LogIn } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { gameDb } from '../services/db';
import { signInTeacherWithGoogle } from '../services/firebase';

interface TeacherGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [domainHelp, setDomainHelp] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    setDomainHelp(null);

    try {
      const res = await signInTeacherWithGoogle();
      if (res.user) {
        // Validasi apakah email Google terdaftar di whitelist Guru
        const isAuthorized = gameDb.isAuthorizedTeacherEmail(res.user.email);
        if (isAuthorized) {
          soundManager.playSuccess();
          onSuccess();
        } else {
          soundManager.playEncourage();
          setErrorMsg(
            `Akses Ditolak: Akun Google (${res.user.email || 'tanpa email'}) bukan akun Guru terdaftar. Siswa tidak diizinkan masuk ke Dashboard Guru.`
          );
        }
      } else if (res.error) {
        if (res.error.code === 'auth/unauthorized-domain') {
          const dom = res.error.domain || window.location.hostname;
          setDomainHelp(dom);
          setErrorMsg(
            `Domain "${dom}" belum diizinkan di Firebase Authentication.`
          );
        } else if (res.error.code === 'auth/popup-blocked') {
          setErrorMsg('Jendela pop-up login Google diblokir oleh peramban. Silakan izinkan pop-up di browser Anda.');
        } else if (res.error.code === 'auth/popup-closed-by-user') {
          setErrorMsg('Proses login Google dibatalkan sebelum selesai.');
        } else {
          setErrorMsg(`Gagal masuk dengan Google (${res.error.message || res.error.code}).`);
        }
      }
    } catch (e: any) {
      setErrorMsg('Terjadi kesalahan saat menghubungkan ke akun Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCopyDomain = () => {
    if (domainHelp) {
      navigator.clipboard.writeText(domainHelp);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 border-2 border-red-500/50 shadow-2xl space-y-5 text-white my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
              <Shield className="w-7 h-7" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white">
            Login Dashboard Guru
          </h3>
          <p className="text-xs text-slate-300">
            Masuk dengan <strong>Akun Google Guru</strong> (Firebase Authentication) untuk mengakses data ketuntasan kelas dan kontrol petualangan.
          </p>
        </div>

        {/* Google Sign-in button */}
        <div className="space-y-4 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 disabled:opacity-60 cursor-pointer border border-slate-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}</span>
          </button>

          {/* Email Whitelist Info */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-[11px] text-slate-300">
            <span className="text-slate-400">Akun terdaftar bawaan: </span>
            <code className="text-amber-300 font-mono font-bold">ahmadzikri1420@gmail.com</code>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Authorized Domain Helper if domain is not registered in Firebase */}
          {domainHelp && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2 text-left">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Domain GitHub Pages Belum Diizinkan:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Agar login Google aktif di domain Anda, tambahkan domain ini ke Firebase Console:
              </p>
              <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl font-mono text-emerald-300 text-[11px] border border-slate-700">
                <span className="truncate">{domainHelp}</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Tersalin!' : 'Salin Domain'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Buka: <strong>Firebase Console $\rightarrow$ Authentication $\rightarrow$ Settings $\rightarrow$ Authorized domains $\rightarrow$ Add domain</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors text-center"
          >
            Kembali ke Permainan
          </button>
        </div>
      </div>
    </div>
  );
};
