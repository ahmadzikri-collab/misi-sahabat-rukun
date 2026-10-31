import React from 'react';
import { X, Gamepad2, Compass, Volume2, HelpCircle, Trophy, ShieldCheck, Sparkles, Music, Star, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GuideDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideDocModal: React.FC<GuideDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-amber-300">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              🎮
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                Panduan Bermain Game Petualangan
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-semibold">
                Misi Sahabat Rukun • SD Indonesia Emas Kelas 2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white cursor-pointer active:scale-95"
            title="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-gray-700 text-sm leading-relaxed">
          {/* Card 1: Memulai Game */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-amber-950 text-base flex items-center gap-2">
                <span>Pilih Nama Siswa & Mulai Bermain</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                Di halaman depan, pilih nama dan kelasmu yang telah didaftarkan oleh Bapak/Ibu Guru, lalu klik tombol <strong>"Mulai Petualangan!"</strong> untuk membuka peta sekolah.
              </p>
            </div>
          </div>

          {/* Card 2: 5 Zona Petualangan di Peta */}
          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              2
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-black text-blue-950 text-base flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Jelajahi 5 Zona Misi di Peta Sekolah</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-900 font-medium">
                Klik ikon lokasi yang terbuka di peta untuk menyelesaikan tantangan kerukunan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="p-2 rounded-xl bg-white/90 border border-blue-200 text-blue-900 flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <span><strong>Taman Pancasila</strong> (PPKn — Simbol & Sila)</span>
                </div>
                <div className="p-2 rounded-xl bg-white/90 border border-blue-200 text-blue-900 flex items-center gap-2">
                  <span className="text-base">📖</span>
                  <span><strong>Perpustakaan Ceria</strong> (B. Indonesia — Kalimat Santun)</span>
                </div>
                <div className="p-2 rounded-xl bg-white/90 border border-blue-200 text-blue-900 flex items-center gap-2">
                  <span className="text-base">🍎</span>
                  <span><strong>Kantin Pintar</strong> (Matematika — Berhitung & Antre)</span>
                </div>
                <div className="p-2 rounded-xl bg-white/90 border border-blue-200 text-blue-900 flex items-center gap-2">
                  <span className="text-base">🎨</span>
                  <span><strong>Studio Kreatif</strong> (SBdP — Seni 2D/3D & Menghargai)</span>
                </div>
                <div className="p-2 rounded-xl bg-white/90 border border-blue-200 text-blue-900 flex items-center gap-2 sm:col-span-2">
                  <span className="text-base">⚽</span>
                  <span><strong>Lapangan Persahabatan</strong> (PJOK — Gerak Lokomotor & Sportivitas)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Bantuan Audio Suara & Petunjuk Uciel */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-emerald-950 text-base flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Dukungan Suara Baca Narasi & Bantuan Uciel</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium">
                Kamu bisa menekan tombol <strong>🗣️ Dengarkan Suara</strong> untuk mendengar soal dibacakan dengan suara ramah anak. Jika bingung menjawab, klik karakter <strong>Uciel si Garuda Cilik</strong> untuk meminta petunjuk (*Hint*)!
              </p>
            </div>
          </div>

          {/* Card 4: Kumpulkan 3 Bintang & Papan Peringkat */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-yellow-300 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-amber-950 text-base flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Kumpulkan 3 Bintang Emas & Peringkat Juara</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                Tiap misi memiliki 5 tantangan soal. Jawab dengan benar untuk meraih skor 100 dan 3 Bintang Emas. Kamu bisa melihat skormu dan nama teman-temanmu di tombol <strong>🏆 Peringkat</strong> pada navbar!
              </p>
            </div>
          </div>

          {/* Card 5: Aturan Bermain Jujur (Anti-Curang) */}
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              5
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-rose-950 text-base flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Bermain Jujur & Tertib (Sistem Pengawas Digital)</span>
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 font-medium">
                Saat mengerjakan misi kuis, tetaplah di dalam layar game. Jangan membuka tab lain atau mengambil tangkapan layar (*screenshot*) agar skor kejujuranmu tetap terjaga secara otomatis.
              </p>
            </div>
          </div>

          {/* Card 6: Background Music (BGM) */}
          <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
              6
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-purple-950 text-base flex items-center gap-1.5">
                <Music className="w-4 h-4 text-purple-600" />
                <span>Musik Latar Petualangan Ceria</span>
              </h3>
              <p className="text-xs sm:text-sm text-purple-900 font-medium">
                Permainan ini dilengkapi alunan musik petualangan ceria. Kamu bisa menyalakan atau mematikan musik kapan saja lewat tombol <strong>🎵 BGM ON / OFF</strong> di kanan atas navbar.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
            <span>💡</span>
            <span>Selamat belajar dan bermain dengan rukun bersama Uciel!</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playSuccess();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mengerti, Ayo Main!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
