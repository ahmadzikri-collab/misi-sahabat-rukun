import React from 'react';

interface PancasilaEmblemProps {
  silaNumber: number; // 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShieldFrame?: boolean;
  className?: string;
}

export const PancasilaEmblem: React.FC<PancasilaEmblemProps> = ({
  silaNumber,
  size = 'md',
  showShieldFrame = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  // Path perisai resmi lambang Garuda Pancasila
  // Sudut atas melengkung anggun, sisi samping kokoh, dan meruncing elegan di bagian bawah
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${selectedSize} ${className}`}
      title={`Lambang Asli Sila ke-${silaNumber}`}
    >
      <svg
        viewBox="0 0 100 115"
        className="w-full h-full filter drop-shadow-md select-none overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradien Emas untuk Bintang dan Rantai */}
          <linearGradient id={`goldGrad-${silaNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3A8" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="85%" stopColor="#D49A00" />
            <stop offset="100%" stopColor="#9E6E00" />
          </linearGradient>

          {/* Gradien Emas Kilau Terang */}
          <linearGradient id={`goldShine-${silaNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#CC8800" />
          </linearGradient>

          {/* Gradien Merah Kebangsaan */}
          <radialGradient id={`redShield-${silaNumber}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#E52D27" />
            <stop offset="85%" stopColor="#B31217" />
            <stop offset="100%" stopColor="#8A080C" />
          </radialGradient>

          {/* Gradien Hitam Perisai Tengah */}
          <radialGradient id={`blackShield-${silaNumber}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#282828" />
            <stop offset="85%" stopColor="#121212" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          {/* Gradien Putih Perisai */}
          <linearGradient id={`whiteShield-${silaNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="90%" stopColor="#F0F4F8" />
            <stop offset="100%" stopColor="#D9E2EC" />
          </linearGradient>

          {/* Filter Efek 3D Lembut */}
          <filter id={`softGlow-${silaNumber}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. KONTUR BENTUK PERISAI ASLI GARUDA PANCASILA */}
        {showShieldFrame && (
          <g>
            {/* Outline Emas Perisai Luar */}
            <path
              d="M 12 12 Q 50 16 88 12 Q 90 60 50 106 Q 10 60 12 12 Z"
              fill={`url(#${
                silaNumber === 1
                  ? `blackShield-${silaNumber}`
                  : silaNumber === 2 || silaNumber === 4
                  ? `redShield-${silaNumber}`
                  : `whiteShield-${silaNumber}`
              })`}
              stroke={`url(#goldGrad-${silaNumber})`}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Garis batas dalam perisai */}
            <path
              d="M 16 16 Q 50 20 84 16 Q 86 58 50 101 Q 14 58 16 16 Z"
              fill="none"
              stroke={
                silaNumber === 1
                  ? '#D4AF37'
                  : silaNumber === 2 || silaNumber === 4
                  ? '#FFA07A'
                  : '#CBD5E1'
              }
              strokeWidth="1.2"
              opacity="0.6"
            />
          </g>
        )}

        {/* 2. KONTEN DETAIL LAMBANG MASING-MASING SILA */}

        {/* SILA 1: BINTANG EMAS BERSUDUT LIMA (LATAR HITAM) */}
        {silaNumber === 1 && (
          <g transform="translate(50, 52) scale(0.95)" filter={`url(#softGlow-${silaNumber})`}>
            {/* Kilau aura emas di belakang bintang */}
            <circle cx="0" cy="0" r="30" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.3" />
            <circle cx="0" cy="0" r="24" fill="#FFD700" opacity="0.12" />

            {/* Bintang Emas 5 Sudut Simetris */}
            <path
              d="M 0,-34
                 L 8.5,-11
                 L 33,-10.5
                 L 13.5,4
                 L 20.5,27.5
                 L 0,13.5
                 L -20.5,27.5
                 L -13.5,4
                 L -33,-10.5
                 L -8.5,-11 Z"
              fill={`url(#goldGrad-${silaNumber})`}
              stroke="#8A5A00"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Faset dan prisma cahaya 3D pada setiap sudut bintang emas */}
            <path d="M 0,-34 L 0,0 L 8.5,-11 Z" fill="#FFF9C4" opacity="0.8" />
            <path d="M 33,-10.5 L 0,0 L 13.5,4 Z" fill="#FFE082" opacity="0.75" />
            <path d="M 20.5,27.5 L 0,0 L 0,13.5 Z" fill="#FFCA28" opacity="0.8" />
            <path d="M -20.5,27.5 L 0,0 L -13.5,4 Z" fill="#D49A00" opacity="0.7" />
            <path d="M -33,-10.5 L 0,0 L -8.5,-11 Z" fill="#E6A100" opacity="0.7" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}

        {/* SILA 2: RANTAI EMAS (LATAR MERAH - GELANG BULAT & PERSEGI) */}
        {silaNumber === 2 && (
          <g transform="translate(50, 53) scale(0.9)" filter={`url(#softGlow-${silaNumber})`}>
            {/* Cincin Rantai Emas Melingkar Tanpa Putus (17 Gelang Bulat & Persegi) */}
            {/* Jalur rantai oval */}
            <ellipse cx="0" cy="0" rx="30" ry="26" fill="none" stroke="#7A0000" strokeWidth="1" opacity="0.3" />

            {/* Mata rantai berselang-seling: Lingkaran (wanita) & Persegi (pria) */}
            {[
              { angle: 0, isRect: true },
              { angle: 40, isRect: false },
              { angle: 80, isRect: true },
              { angle: 120, isRect: false },
              { angle: 160, isRect: true },
              { angle: 200, isRect: false },
              { angle: 240, isRect: true },
              { angle: 280, isRect: false },
              { angle: 320, isRect: true },
            ].map((link, idx) => {
              const rad = (link.angle * Math.PI) / 180;
              const x = Math.cos(rad) * 28;
              const y = Math.sin(rad) * 24;

              return (
                <g key={idx} transform={`translate(${x}, ${y}) rotate(${link.angle})`}>
                  {link.isRect ? (
                    // Gelang Persegi Emas
                    <rect
                      x="-7"
                      y="-7"
                      width="14"
                      height="14"
                      rx="2"
                      fill={`url(#goldGrad-${silaNumber})`}
                      stroke="#855A00"
                      strokeWidth="1.8"
                    />
                  ) : (
                    // Gelang Bulat Emas
                    <circle
                      cx="0"
                      cy="0"
                      r="7.5"
                      fill={`url(#goldGrad-${silaNumber})`}
                      stroke="#855A00"
                      strokeWidth="1.8"
                    />
                  )}
                  {/* Lubang dalam rantai */}
                  {link.isRect ? (
                    <rect x="-3" y="-3" width="6" height="6" rx="1" fill="#B31217" />
                  ) : (
                    <circle cx="0" cy="0" r="3.2" fill="#B31217" />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* SILA 3: POHON BERINGIN (LATAR PUTIH - DAUN RINDANG & AKAR GANTUNG) */}
        {silaNumber === 3 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            {/* Batang Pohon Cokelat Kokoh */}
            <path
              d="M -12 28 C -8 10 -6 0 -4 -8 C -4 -12 -6 -16 -12 -20 C -2 -14 0 -8 0 -4 C 0 -8 2 -14 12 -20 C 6 -16 4 -12 4 -8 C 6 0 8 10 12 28 C 6 25 0 26 -12 28 Z"
              fill="#5D4037"
              stroke="#3E2723"
              strokeWidth="1.2"
            />
            {/* Tekstur alur kayu batang */}
            <path d="M -3 6 L -3 24 M 0 -2 L 0 25 M 3 6 L 3 24" stroke="#3E2723" strokeWidth="1" opacity="0.6" />

            {/* Akar Gantung Menjuntai (Ciri Khas Beringin) */}
            <path
              d="M -22 -4 L -22 18 M -16 0 L -16 22 M -10 -8 L -10 20
                 M 10 -8 L 10 20 M 16 0 L 16 22 M 22 -4 L 22 18"
              stroke="#6D4C41"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Daun Kanopi Beringin Rindang (Tingkat Atas & Samping Hijau Lebat) */}
            {/* Lapisan Daun Belakang Gelap */}
            <ellipse cx="-20" cy="-14" rx="15" ry="12" fill="#1B5E20" />
            <ellipse cx="20" cy="-14" rx="15" ry="12" fill="#1B5E20" />
            <ellipse cx="0" cy="-26" rx="18" ry="14" fill="#1B5E20" />

            {/* Lapisan Daun Tengah Hijau Subur */}
            <ellipse cx="-16" cy="-10" rx="14" ry="11" fill="#2E7D32" />
            <ellipse cx="16" cy="-10" rx="14" ry="11" fill="#2E7D32" />
            <ellipse cx="-26" cy="-2" rx="11" ry="9" fill="#2E7D32" />
            <ellipse cx="26" cy="-2" rx="11" ry="9" fill="#2E7D32" />
            <ellipse cx="0" cy="-22" rx="16" ry="12" fill="#2E7D32" />
            <ellipse cx="0" cy="-10" rx="18" ry="13" fill="#388E3C" />

            {/* Lapisan Aksen Daun Terang (Pucuk Daun Bertingkat) */}
            <ellipse cx="-12" cy="-12" rx="9" ry="7" fill="#4CAF50" opacity="0.8" />
            <ellipse cx="12" cy="-12" rx="9" ry="7" fill="#4CAF50" opacity="0.8" />
            <ellipse cx="0" cy="-24" rx="10" ry="7" fill="#66BB6A" opacity="0.85" />
            <ellipse cx="-18" cy="-2" rx="7" ry="5" fill="#4CAF50" opacity="0.75" />
            <ellipse cx="18" cy="-2" rx="7" ry="5" fill="#4CAF50" opacity="0.75" />

            {/* Garis tanah dasar */}
            <path d="M -28 28 Q 0 25 28 28" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* SILA 4: KEPALA BANTENG (LATAR MERAH - TANDUK KOKOH & GAGAH) */}
        {silaNumber === 4 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            {/* Tanduk Banteng Kokoh Melengkung ke Depan Atas */}
            {/* Tanduk Kiri */}
            <path
              d="M -8 -8 C -14 -16 -24 -24 -36 -20 C -34 -14 -24 -8 -12 -2 Z"
              fill="#ECEFF1"
              stroke="#212121"
              strokeWidth="1.5"
            />
            {/* Ujung lancip hitam tanduk kiri */}
            <path d="M -36 -20 C -33 -17 -28 -14 -24 -12 L -28 -18 Z" fill="#212121" />

            {/* Tanduk Kanan */}
            <path
              d="M 8 -8 C 14 -16 24 -24 36 -20 C 34 -14 24 -8 12 -2 Z"
              fill="#ECEFF1"
              stroke="#212121"
              strokeWidth="1.5"
            />
            {/* Ujung lancip hitam tanduk kanan */}
            <path d="M 36 -20 C 33 -17 28 -14 24 -12 L 28 -18 Z" fill="#212121" />

            {/* Telinga Banteng Kokoh */}
            <path d="M -16 4 C -28 6 -30 12 -24 16 C -18 16 -14 10 -12 6 Z" fill="#1C1C1C" stroke="#000" strokeWidth="1" />
            <path d="M 16 4 C 28 6 30 12 24 16 C 18 16 14 10 12 6 Z" fill="#1C1C1C" stroke="#000" strokeWidth="1" />

            {/* Kepala & Wajah Banteng Hitam Tegas */}
            <path
              d="M -16 -6 C -10 -10 10 -10 16 -6 C 20 4 18 16 14 24 C 8 28 -8 28 -14 24 C -18 16 -20 4 -16 -6 Z"
              fill="#1C1C1C"
              stroke="#0A0A0A"
              strokeWidth="1.5"
            />

            {/* Sorot Mata Tegas */}
            <ellipse cx="-9" cy="4" rx="3.5" ry="2.2" fill="#FFFFFF" />
            <circle cx="-9" cy="4" r="1.6" fill="#000000" />
            <ellipse cx="9" cy="4" rx="3.5" ry="2.2" fill="#FFFFFF" />
            <circle cx="9" cy="4" r="1.6" fill="#000000" />

            {/* Alis Tegas Banteng */}
            <path d="M -14 0 L -6 2 M 14 0 L 6 2" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" />

            {/* Moncong Khas Banteng Abu-abu Gelap */}
            <path
              d="M -10 16 Q 0 14 10 16 Q 12 25 0 25 Q -12 25 -10 16 Z"
              fill="#37474F"
              stroke="#212121"
              strokeWidth="1.2"
            />
            {/* Lubang Hidung */}
            <ellipse cx="-4" cy="20" rx="2" ry="1.4" fill="#111111" />
            <ellipse cx="4" cy="20" rx="2" ry="1.4" fill="#111111" />
          </g>
        )}

        {/* SILA 5: PADI DAN KAPAS (LATAR PUTIH - TANGKAI EMAS DAN KAPAS PUTIH HIJAU) */}
        {silaNumber === 5 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            {/* SISI KANAN: SETANGKAI PADI EMAS (PANGAN) */}
            <g>
              {/* Tangkai Padi Lengkung Halus */}
              <path d="M 4 28 C 8 16 16 4 14 -22" fill="none" stroke="#F57F17" strokeWidth="2.2" strokeLinecap="round" />

              {/* Butir-butir Bulir Padi Kuning Keemasan */}
              {[
                { x: 12, y: -20, r: -20 },
                { x: 16, y: -14, r: -15 },
                { x: 18, y: -8, r: -10 },
                { x: 19, y: -2, r: -5 },
                { x: 18, y: 4, r: 0 },
                { x: 16, y: 10, r: 10 },
                { x: 12, y: 16, r: 15 },
                { x: 8, y: 22, r: 25 },
              ].map((grain, idx) => (
                <g key={`grain-${idx}`} transform={`translate(${grain.x}, ${grain.y}) rotate(${grain.r})`}>
                  {/* Bulir Padi Luar */}
                  <ellipse cx="4" cy="0" rx="5.5" ry="3.2" fill="#FFD54F" stroke="#F57F17" strokeWidth="1" />
                  {/* Garis tengah bulir */}
                  <line x1="1" y1="0" x2="8" y2="0" stroke="#FF8F00" strokeWidth="0.8" />
                </g>
              ))}
            </g>

            {/* SISI KIRI: SETANGKAI KAPAS PUTIH & DAUN HIJAU (SANDANG) */}
            <g>
              {/* Tangkai Kapas Lengkung */}
              <path d="M -4 28 C -8 16 -16 4 -14 -22" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round" />

              {/* Kuntum-kuntum Kapas Putih Bersih dengan Kelopak Hijau */}
              {[
                { x: -14, y: -18 },
                { x: -18, y: -9 },
                { x: -19, y: 2 },
                { x: -17, y: 13 },
                { x: -11, y: 22 },
              ].map((cotton, idx) => (
                <g key={`cotton-${idx}`} transform={`translate(${cotton.x}, ${cotton.y})`}>
                  {/* Kelopak Hijau Bawah */}
                  <path d="M -6 4 Q 0 8 6 4 Q 0 -1 -6 4 Z" fill="#43A047" stroke="#1B5E20" strokeWidth="0.8" />
                  {/* Gumpalan Kapas Putih Empuk */}
                  <circle cx="-3" cy="-1" r="3.8" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
                  <circle cx="3" cy="-1" r="3.8" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
                  <circle cx="0" cy="-4" r="4.2" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="3.5" fill="#FAFAFA" />
                </g>
              ))}
            </g>

            {/* Ikatan Pita Pita Bawah Penyatuan Tangkai */}
            <path
              d="M -7 28 Q 0 25 7 28 Q 0 31 -7 28 Z"
              fill="#D32F2F"
              stroke="#B71C1C"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
