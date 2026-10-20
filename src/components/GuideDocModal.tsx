import React, { useState } from 'react';
import { X, BookOpen, Code2, Sparkles, CheckCircle2, Copy, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { resolveAssetUrl } from '../utils/assets';

interface GuideDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideDocModal: React.FC<GuideDocModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const exampleSnippet = `import { CharacterGuide } from '../types/game';

// Contoh: Menambahkan Karakter 'Siti' untuk Lokasi Perpustakaan Ceria
export const SITI_PERPUSTAKAAN: CharacterGuide = {
  id: 'siti-perpustakaan',
  name: 'Siti Rahmawati',
  nickname: 'Siti',
  role: 'Pemandu Kalimat Santun & Literasi',
  locationId: 'perpustakaan-ceria',
  locationName: 'Perpustakaan Ceria',
  subject: 'Bahasa Indonesia (Kalimat Santun & Ajakan)',
  themeColor: {
    primary: '#2563EB',    // Warna utama (Biru)
    secondary: '#EFF6FF',
    accent: '#38BDF8',
    light: '#F0F9FF',
    border: '#93C5FD',
  },
  avatarUrl: resolveAssetUrl('images/guide_siti_perpustakaan_1791811429261.jpg'),
  welcomeDialogue: [
    {
      id: 'siti-1',
      speaker: 'Siti',
      emotion: 'happy',
      soundCue: 'pop',
      text: 'Halo teman-teman! Selamat datang di Perpustakaan Ceria!',
    },
    {
      id: 'siti-2',
      speaker: 'Siti',
      emotion: 'talking',
      soundCue: 'pop',
      text: 'Di sini kita akan belajar cara mengajak dan meminjam buku dengan santun!',
    },
  ],
  tapGreetings: [
    'Membaca buku bersama teman itu sangat menyenangkan!',
    'Biasakan ucapkan Tolong dan Terima Kasih ya!',
  ],
  hintPhrases: [
    'Kalimat ajakan yang ramah biasanya diawali kata "Ayo" atau "Mari".',
    'Jika ingin menolak, sampaikan dengan santun: "Maaf, aku sedang membaca."',
  ],
  celebrationPhrases: [
    'Hebat sekali! Kamu menggunakan tutur kata yang sangat santun!',
  ],
  encouragingPhrases: [
    'Ayo coba baca kembali percakapannya, Siti yakin kamu pasti bisa!',
  ],
};`;

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(exampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-amber-300">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                Panduan Menambahkan Karakter Pemandu
              </h2>
              <p className="text-xs text-amber-200">
                Langkah mudah bagi Guru dan Pengembang Game Kelas 2 SD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-gray-700 text-sm leading-relaxed">
          {/* Section 1: Konsep Karakter Kelas 2 SD */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <h3 className="font-black text-amber-950 text-base flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              1. Prinsip Desain Karakter untuk Siswa Kelas 2 SD (7–8 Tahun)
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-amber-900 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Bahasa Ramah & Singkat:</strong> Gunakan kalimat sederhana 1–2 baris per balon dialog agar mudah dibaca oleh siswa yang masih tahap membaca lancar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Dukungan Suara Alami (TTS):</strong> Komponen <code>GuideCharacter</code> otomatis mendukung fitur pembacaan suara bahasa Indonesia melalui Web Speech API.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Umpan Balik Positif (Anti-Shaming):</strong> Saat jawaban belum tepat, karakter selalu memberikan dorongan hangat seperti <em>"Ayo coba lagi bersama Uciel!"</em> bukan kata-kata menyalahkan.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: 3 Langkah Praktis */}
          <div>
            <h3 className="font-black text-gray-900 text-base mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-red-600" />
              2. Tiga Langkah Menambahkan Karakter Baru
            </h3>
            <ol className="space-y-3 list-decimal list-inside text-xs sm:text-sm">
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Langkah A: Siapkan Gambar Aset Karakter</strong>
                <p className="text-gray-600 mt-1">
                  Simpan gambar kartun siswa SD rasio 1:1 di <code>/src/assets/images/</code> atau sediakan URL gambar transparan yang ceria.
                </p>
              </li>
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Langkah B: Buka File <code>src/data/characters.ts</code></strong>
                <p className="text-gray-600 mt-1">
                  Definisikan objek baru bertipe <code>CharacterGuide</code> dengan mengisi dialog sambutan, kalimat petunjuk, dan perayaan nilai.
                </p>
              </li>
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Langkah C: Pasang Komponen <code>&lt;GuideCharacter /&gt;</code> di Layar Misi</strong>
                <p className="text-gray-600 mt-1">
                  Cukup panggil <code>&lt;GuideCharacter guide=&#123;KARAKTER_BARU&#125; /&gt;</code> di dalam komponen level yang diinginkan.
                </p>
              </li>
            </ol>
          </div>

          {/* Section 3: Template Kode Contoh */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Contoh Struktur Kode (TypeScript):
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-amber-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-700">
              <code>{exampleSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition-transform active:scale-95"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
