# 🌟 Misi Sahabat Rukun - Game Edukasi Kelas 2 SD

Game petualangan edukatif interaktif bertema **Hidup Rukun di Sekolah** untuk siswa Kelas 2 SD (Tematik Terpadu Tema 1), dilengkapi dengan karakter pemandu **Uciel si Burung Garuda Cilik**, 5 zona petualangan interaktif, audio dubbing/sound effects ceria, dan dashboard guru dengan sinkronisasi Cloud Firestore.

---

## 🚀 Panduan Publish ke GitHub & GitHub Pages

Aplikasi ini telah dikonfigurasi dengan **GitHub Actions** otomatis, sistem resolusi aset relatif, dan file `.nojekyll` agar dapat berjalan mulus di GitHub Pages tanpa masalah gambar hilang.

### Langkah 1: Push Kode ke Repositori GitHub Anda

Buka terminal di komputer Anda pada folder proyek ini, lalu jalankan perintah berikut:

```bash
# 1. Pastikan semua file masuk ke staging
git add .

# 2. Buat commit awal
git commit -m "feat: Siap publish ke GitHub Pages"

# 3. Ubah nama branch utama menjadi main
git branch -M main

# 4. Hubungkan dengan repositori GitHub Anda (ganti URL di bawah dengan URL repo Anda)
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# 5. Push kode ke GitHub
git push -u origin main
```

---

### Langkah 2: Mengaktifkan GitHub Pages (1 Kali Pengaturan)

1. Buka repositori Anda di situs **GitHub.com**.
2. Klik tab **Settings** (Pengaturan) di bagian atas repositori.
3. Di menu sebelah kiri, klik menu **Pages**.
4. Di bagian **Build and deployment**:
   - Pada pilihan dropdown **Source**, pilih **GitHub Actions** *(disarankan)*.
5. Selesai! GitHub Actions akan secara otomatis menjalankan file workflow `.github/workflows/deploy.yml`, membangun aplikasi dengan Vite, dan mempublikasikannya.
6. Dalam 1-2 menit, link game Anda yang dapat diakses publik akan muncul di halaman tersebut, contohnya:  
   👉 `https://USERNAME_ANDA.github.io/NAMA_REPO_ANDA/`

---

## 🛠️ Solusi Terhadap Masalah "Gambar Hilang Saat Di-Publish"

Jika sebelumnya gambar hilang saat di-publish, berikut penyebab dan solusi yang telah diperbaiki secara tuntas di dalam proyek ini:

1. **Sub-path Hosting di GitHub Pages (`base: './'`)**
   - **Penyebab**: GitHub Pages menampung aplikasi di sub-path (contoh: `github.io/misi-sahabat-rukun/`). Jika kode memanggil `/images/uciel.jpg`, browser akan mencari di `github.io/images/uciel.jpg` (tanpa nama repo), sehingga menghasilkan error **404 Not Found**.
   - **Solusi**: File `vite.config.ts` telah diatur menggunakan `base: './'`, dan seluruh aset diatur dengan helper `resolveAssetUrl()`.
2. **File `.nojekyll`**
   - **Penyebab**: Secara default, server GitHub Pages menggunakan generator Jekyll yang sering mengabaikan folder statis atau aset Vite.
   - **Solusi**: File `public/.nojekyll` telah ditambahkan sehingga GitHub Pages menyajikan seluruh file bundler secara langsung.
3. **Multi-layer Fallback & Vector Illustration (Anti Gambar Rusak)**
   - Jika terjadi kendala jaringan saat memuat gambar JPG, aplikasi dilengkapi sistem cadangan bertingkat hingga **SVG Data URI vektor** untuk karakter Uciel dan Peta Sekolah. Tampilan tidak akan pernah menampilkan ikon gambar silang/rusak.
4. **SPA 404 Routing (`public/404.html`)**
   - Mencegah halaman blank atau error 404 ketika pengguna me-refresh halaman di GitHub Pages.

---

## 💻 Menjalankan di Komputer Lokal (Localhost)

```bash
# Install seluruh dependency
npm install

# Jalankan server pengembangan lokal
npm run dev

# Bangun versi produksi lokal
npm run build

# Uji coba pratinjau hasil build
npm run preview
```

---

## ☁️ Catatan Sinkronisasi Firebase Firestore & Guru

- Mode petualangan siswa dan penyimpanan bintang/skor dapat berjalan **100% offline & lokal** tanpa koneksi internet (menggunakan penyimpanan peramban).
- Jika Guru ingin menggunakan fitur **Login Akun Guru (Google Sign-In)** di domain GitHub Pages, cukup tambahkan domain `USERNAME_ANDA.github.io` ke daftar:  
  **Firebase Console -> Authentication -> Settings -> Authorized Domains**.
