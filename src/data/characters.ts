/**
 * Character Registry for MISI SAHABAT RUKUN
 * Karakter Pemandu Tunggal: UCIEL - Burung Garuda Lucu Cilik
 * Menemani siswa kelas 2 SD di seluruh 5 lokasi petualangan sekolah.
 */

import { CharacterGuide } from '../types/game';

import { resolveAssetUrl, UCIEL_SVG_DATA_URL, TAMAN_PANCASILA_SVG_DATA_URL, SCHOOL_MAP_SVG_DATA_URL } from '../utils/assets';

// Image assets imported so Vite bundles them correctly in both dev and production
import ucielImg from '../assets/images/garuda_uciel_1791815443617.jpg';
import tamanBgImg from '../assets/images/taman_pancasila_bg_1791811412574.jpg';
import mapBgImg from '../assets/images/school_adventure_map_1791811444961.jpg';

export const UCIEL_AVATAR = ucielImg || resolveAssetUrl('images/garuda_uciel_1791815443617.jpg') || UCIEL_SVG_DATA_URL;
export const TAMAN_BG = tamanBgImg || resolveAssetUrl('images/taman_pancasila_bg_1791811412574.jpg') || TAMAN_PANCASILA_SVG_DATA_URL;
export const SCHOOL_MAP_BG = mapBgImg || resolveAssetUrl('images/school_adventure_map_1791811444961.jpg') || SCHOOL_MAP_SVG_DATA_URL;

export const UCIEL_AVATAR_FALLBACK = UCIEL_SVG_DATA_URL;
export const TAMAN_BG_FALLBACK = TAMAN_PANCASILA_SVG_DATA_URL;
export const SCHOOL_MAP_BG_FALLBACK = SCHOOL_MAP_SVG_DATA_URL;

/**
 * Karakter Tunggal: Uciel si Burung Garuda Cilik
 */
export const UCIEL_GARUDA: CharacterGuide = {
  id: 'uciel-garuda',
  name: 'Uciel si Garuda Cilik',
  nickname: 'Uciel',
  role: 'Pemandu Kerukunan Garuda',
  locationId: 'taman-pancasila',
  locationName: 'Sekolah Sahabat Rukun',
  subject: 'Tematik Terpadu Kelas 2 SD (Tema 1: Hidup Rukun)',
  themeColor: {
    primary: '#D97706', // Amber gold
    secondary: '#FEF3C7',
    accent: '#DC2626',
    light: '#FFFBEB',
    border: '#FBBF24',
  },
  avatarUrl: UCIEL_AVATAR,
  welcomeDialogue: [
    {
      id: 'uciel-w1',
      speaker: 'Uciel',
      emotion: 'happy',
      soundCue: 'pop',
      text: 'Kweeek! Halo Sahabat Rukun! Aku Uciel, burung garuda cilik yang ceria dan suka berteman!',
    },
    {
      id: 'uciel-w2',
      speaker: 'Uciel',
      emotion: 'talking',
      soundCue: 'pop',
      text: 'Uciel akan menemani kamu berpetualang di 5 tempat seru: Taman Pancasila, Perpustakaan, Kantin, Studio Kreatif, dan Lapangan!',
    },
    {
      id: 'uciel-w3',
      speaker: 'Uciel',
      emotion: 'encouraging',
      soundCue: 'pop',
      text: 'Ayo kepakkan sayap semangatmu, kumpulkan 3 Bintang di setiap misi, dan jadilah Sahabat Rukun sejati!',
    },
  ],
  tapGreetings: [
    'Kweeek! Senang sekali bisa terbang dan bermain bersamamu!',
    'Garuda Pancasila adalah lambang negara kita. Ayo jaga kerukunan di sekolah!',
    'Kalau kamu butuh bantuan, ketuk tombol lampu petunjuk ya, Uciel siap membantumu!',
    'Bhinneka Tunggal Ika! Berbeda-beda tetapi kita tetap rukun bersahabat!',
  ],
  hintPhrases: [
    'Ingat ya, Sila ke-1 simbolnya Bintang, Sila ke-2 Rantai, Sila ke-3 Pohon Beringin, Sila ke-4 Banteng, dan Sila ke-5 Padi Kapas!',
    'Gunakan kata santun: Tolong, Maaf, dan Terima Kasih saat berbicara.',
    'Kalau dibagi ke teman berarti dikurangi, kalau dikumpulkan bersama berarti dijumlahkan!',
    'Gerak lokomotor adalah gerak berpindah tempat seperti berjalan dan berlari.',
  ],
  celebrationPhrases: [
    'Kweeek! Horeee! Jawabanmu hebat sekali! Bintang kerukunan bersinar untukmu!',
    'Luar biasa! Kamu memang Sahabat Rukun kebanggaan Uciel!',
    'Wah jempol dua untukmu! Misi berhasil diselesaikan dengan cemerlang!',
  ],
  encouragingPhrases: [
    'Kweeek! Jangan sedih sahabat, Uciel selalu menyemangatimu. Ayo kita coba lagi!',
    'Tarik napas dan baca pelan-pelan ya. Uciel yakin kamu pasti bisa!',
    'Belajar bersama itu seru! Ayo kepakkan sayapmu dan coba sekali lagi!',
  ],
};

/**
 * Helper untuk mendapatkan dialog Uciel khusus lokasi tertentu
 */
export function getUcielForLocation(locationId: string): CharacterGuide {
  switch (locationId) {
    case 'perpustakaan-ceria':
      return {
        ...UCIEL_GARUDA,
        locationId: 'perpustakaan-ceria',
        locationName: 'Perpustakaan Ceria',
        subject: 'Bahasa Indonesia (Kalimat Santun)',
        welcomeDialogue: [
          {
            id: 'uciel-p1',
            speaker: 'Uciel',
            emotion: 'happy',
            soundCue: 'pop',
            text: 'Ssst... Selamat datang di Perpustakaan Ceria! Uciel suka sekali membaca buku dongeng di sini.',
          },
          {
            id: 'uciel-p2',
            speaker: 'Uciel',
            emotion: 'talking',
            soundCue: 'pop',
            text: 'Di sini kita akan belajar cara mengajak teman membaca, meminta bantuan dengan sopan, dan menolak secara santun!',
          },
        ],
      };
    case 'kantin-pintar':
      return {
        ...UCIEL_GARUDA,
        locationId: 'kantin-pintar',
        locationName: 'Kantin Pintar',
        subject: 'Matematika (Penjumlahan & Pengurangan)',
        welcomeDialogue: [
          {
            id: 'uciel-k1',
            speaker: 'Uciel',
            emotion: 'happy',
            soundCue: 'pop',
            text: 'Nyam! Selamat datang di Kantin Pintar! Banyak makanan sehat dan buah-buahan segar di sini!',
          },
          {
            id: 'uciel-k2',
            speaker: 'Uciel',
            emotion: 'talking',
            soundCue: 'pop',
            text: 'Ayo antre dengan tertib dan bantu Uciel berhitung penjumlahan dan pengurangan ya!',
          },
        ],
      };
    case 'studio-kreatif':
      return {
        ...UCIEL_GARUDA,
        locationId: 'studio-kreatif',
        locationName: 'Studio Kreatif',
        subject: 'SBdP (Seni Rupa 2D & 3D)',
        welcomeDialogue: [
          {
            id: 'uciel-s1',
            speaker: 'Uciel',
            emotion: 'happy',
            soundCue: 'pop',
            text: 'Kweeek! Selamat datang para seniman cilik di Studio Kreatif!',
          },
          {
            id: 'uciel-s2',
            speaker: 'Uciel',
            emotion: 'talking',
            soundCue: 'pop',
            text: 'Kita akan mengenal gambar 2 dimensi di atas kertas dan benda 3 dimensi yang memiliki bentuk bervolume!',
          },
        ],
      };
    case 'lapangan-persahabatan':
      return {
        ...UCIEL_GARUDA,
        locationId: 'lapangan-persahabatan',
        locationName: 'Lapangan Persahabatan',
        subject: 'PJOK (Gerak Lokomotor & Sportivitas)',
        welcomeDialogue: [
          {
            id: 'uciel-l1',
            speaker: 'Uciel',
            emotion: 'happy',
            soundCue: 'pop',
            text: 'Semangat pagi sahabat juara! Ayo kepakkan sayapmu di Lapangan Persahabatan!',
          },
          {
            id: 'uciel-l2',
            speaker: 'Uciel',
            emotion: 'talking',
            soundCue: 'pop',
            text: 'Kita akan mempraktikkan gerak lokomotor seperti berjalan, berlari, dan melompat dengan sportif!',
          },
        ],
      };
    case 'taman-pancasila':
    default:
      return UCIEL_GARUDA;
  }
}
