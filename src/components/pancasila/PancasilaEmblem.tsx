import React, { useState } from 'react';
import sila1Img from '../../assets/pancasila/sila1_bintang.png';
import sila2Img from '../../assets/pancasila/sila2_rantai.png';
import sila3Img from '../../assets/pancasila/sila3_beringin.png';
import sila4Img from '../../assets/pancasila/sila4_banteng.png';
import sila5Img from '../../assets/pancasila/sila5_padi_kapas.png';
import {
  PANCASILA_B64_1,
  PANCASILA_B64_2,
  PANCASILA_B64_3,
  PANCASILA_B64_4,
  PANCASILA_B64_5,
} from '../../assets/pancasilaBase64';

export interface PancasilaCardAsset {
  src: string;
  fallbackB64: string;
  alt: string;
  name: string;
  bgColor: string;
  borderColor: string;
}

export const PANCASILA_CARDS_MAP: Record<number, PancasilaCardAsset> = {
  1: {
    src: sila1Img || PANCASILA_B64_1,
    fallbackB64: PANCASILA_B64_1,
    alt: 'Bintang Emas (Sila ke-1)',
    name: 'Bintang Emas',
    bgColor: 'bg-neutral-900',
    borderColor: 'border-neutral-800',
  },
  2: {
    src: sila2Img || PANCASILA_B64_2,
    fallbackB64: PANCASILA_B64_2,
    alt: 'Rantai Emas (Sila ke-2)',
    name: 'Rantai Emas',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-700',
  },
  3: {
    src: sila3Img || PANCASILA_B64_3,
    fallbackB64: PANCASILA_B64_3,
    alt: 'Pohon Beringin (Sila ke-3)',
    name: 'Pohon Beringin',
    bgColor: 'bg-white',
    borderColor: 'border-slate-400',
  },
  4: {
    src: sila4Img || PANCASILA_B64_4,
    fallbackB64: PANCASILA_B64_4,
    alt: 'Kepala Banteng (Sila ke-4)',
    name: 'Kepala Banteng',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-700',
  },
  5: {
    src: sila5Img || PANCASILA_B64_5,
    fallbackB64: PANCASILA_B64_5,
    alt: 'Padi dan Kapas (Sila ke-5)',
    name: 'Padi dan Kapas',
    bgColor: 'bg-white',
    borderColor: 'border-slate-400',
  },
};

interface PancasilaEmblemProps {
  silaNumber: number; // 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShieldFrame?: boolean;
  variant?: 'card' | 'shield';
  className?: string;
}

export const PancasilaEmblem: React.FC<PancasilaEmblemProps> = ({
  silaNumber,
  size = 'md',
  showShieldFrame = true,
  variant = 'card',
  className = '',
}) => {
  const cardData = PANCASILA_CARDS_MAP[silaNumber];
  const [imgSrc, setImgSrc] = useState<string>(cardData?.src || cardData?.fallbackB64 || '');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  const sizeMap = {
    sm: 'w-11 h-11',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  const handleImageError = () => {
    if (cardData && imgSrc !== cardData.fallbackB64) {
      setImgSrc(cardData.fallbackB64);
    } else {
      setImgLoadFailed(true);
    }
  };

  // RENDER CARD IMAGE (Sesuai gambar kartu lambang Pancasila yang dikirim pengguna)
  if (variant === 'card' && cardData && !imgLoadFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center flex-shrink-0 ${selectedSize} ${className}`}
        title={`Lambang Sila ke-${silaNumber}: ${cardData.name}`}
      >
        <img
          src={imgSrc}
          alt={cardData.alt}
          onError={handleImageError}
          className="w-full h-full object-contain filter drop-shadow-sm select-none rounded-2xl transition-transform"
          loading="eager"
          draggable={false}
        />
      </div>
    );
  }

  // FALLBACK: VECTOR PERISAI SVG RESMI GARUDA PANCASILA
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
          <linearGradient id={`goldGrad-${silaNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3A8" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="85%" stopColor="#D49A00" />
            <stop offset="100%" stopColor="#9E6E00" />
          </linearGradient>

          <radialGradient id={`redShield-${silaNumber}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#E52D27" />
            <stop offset="85%" stopColor="#B31217" />
            <stop offset="100%" stopColor="#8A080C" />
          </radialGradient>

          <radialGradient id={`blackShield-${silaNumber}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#282828" />
            <stop offset="85%" stopColor="#121212" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          <linearGradient id={`whiteShield-${silaNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="90%" stopColor="#F0F4F8" />
            <stop offset="100%" stopColor="#D9E2EC" />
          </linearGradient>

          <filter id={`softGlow-${silaNumber}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {showShieldFrame && (
          <g>
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
          </g>
        )}

        {silaNumber === 1 && (
          <g transform="translate(50, 52) scale(0.95)" filter={`url(#softGlow-${silaNumber})`}>
            <circle cx="0" cy="0" r="30" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.3" />
            <path
              d="M 0,-34 L 8.5,-11 L 33,-10.5 L 13.5,4 L 20.5,27.5 L 0,13.5 L -20.5,27.5 L -13.5,4 L -33,-10.5 L -8.5,-11 Z"
              fill={`url(#goldGrad-${silaNumber})`}
              stroke="#8A5A00"
              strokeWidth="1.5"
            />
          </g>
        )}

        {silaNumber === 2 && (
          <g transform="translate(50, 53) scale(0.9)" filter={`url(#softGlow-${silaNumber})`}>
            <ellipse cx="0" cy="0" rx="30" ry="26" fill="none" stroke="#7A0000" strokeWidth="1" opacity="0.3" />
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
                    <rect x="-7" y="-7" width="14" height="14" rx="2" fill={`url(#goldGrad-${silaNumber})`} stroke="#855A00" strokeWidth="1.8" />
                  ) : (
                    <circle cx="0" cy="0" r="7.5" fill={`url(#goldGrad-${silaNumber})`} stroke="#855A00" strokeWidth="1.8" />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {silaNumber === 3 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            <path
              d="M -12 28 C -8 10 -6 0 -4 -8 C -4 -12 -6 -16 -12 -20 C -2 -14 0 -8 0 -4 C 0 -8 2 -14 12 -20 C 6 -16 4 -12 4 -8 C 6 0 8 10 12 28 C 6 25 0 26 -12 28 Z"
              fill="#5D4037"
              stroke="#3E2723"
              strokeWidth="1.2"
            />
            <path
              d="M -22 -4 L -22 18 M -16 0 L -16 22 M -10 -8 L -10 20 M 10 -8 L 10 20 M 16 0 L 16 22 M 22 -4 L 22 18"
              stroke="#6D4C41"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <ellipse cx="-20" cy="-14" rx="15" ry="12" fill="#1B5E20" />
            <ellipse cx="20" cy="-14" rx="15" ry="12" fill="#1B5E20" />
            <ellipse cx="0" cy="-26" rx="18" ry="14" fill="#1B5E20" />
            <ellipse cx="-16" cy="-10" rx="14" ry="11" fill="#2E7D32" />
            <ellipse cx="16" cy="-10" rx="14" ry="11" fill="#2E7D32" />
            <ellipse cx="0" cy="-10" rx="18" ry="13" fill="#388E3C" />
          </g>
        )}

        {silaNumber === 4 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            <path d="M -8 -8 C -14 -16 -24 -24 -36 -20 C -34 -14 -24 -8 -12 -2 Z" fill="#ECEFF1" stroke="#212121" strokeWidth="1.5" />
            <path d="M 8 -8 C 14 -16 24 -24 36 -20 C 34 -14 24 -8 12 -2 Z" fill="#ECEFF1" stroke="#212121" strokeWidth="1.5" />
            <path d="M -16 4 C -28 6 -30 12 -24 16 C -18 16 -14 10 -12 6 Z" fill="#1C1C1C" stroke="#000" strokeWidth="1" />
            <path d="M 16 4 C 28 6 30 12 24 16 C 18 16 14 10 12 6 Z" fill="#1C1C1C" stroke="#000" strokeWidth="1" />
            <path d="M -16 -6 C -10 -10 10 -10 16 -6 C 20 4 18 16 14 24 C 8 28 -8 28 -14 24 C -18 16 -20 4 -16 -6 Z" fill="#1C1C1C" stroke="#0A0A0A" strokeWidth="1.5" />
            <ellipse cx="-9" cy="4" rx="3.5" ry="2.2" fill="#FFFFFF" />
            <circle cx="-9" cy="4" r="1.6" fill="#000000" />
            <ellipse cx="9" cy="4" rx="3.5" ry="2.2" fill="#FFFFFF" />
            <circle cx="9" cy="4" r="1.6" fill="#000000" />
            <path d="M -10 16 Q 0 14 10 16 Q 12 25 0 25 Q -12 25 -10 16 Z" fill="#37474F" stroke="#212121" strokeWidth="1.2" />
          </g>
        )}

        {silaNumber === 5 && (
          <g transform="translate(50, 52) scale(0.92)" filter={`url(#softGlow-${silaNumber})`}>
            <path d="M 4 28 C 8 16 16 4 14 -22" fill="none" stroke="#F57F17" strokeWidth="2.2" strokeLinecap="round" />
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
                <ellipse cx="4" cy="0" rx="5.5" ry="3.2" fill="#FFD54F" stroke="#F57F17" strokeWidth="1" />
              </g>
            ))}
            <path d="M -4 28 C -8 16 -16 4 -14 -22" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round" />
            {[
              { x: -14, y: -18 },
              { x: -18, y: -9 },
              { x: -19, y: 2 },
              { x: -17, y: 13 },
              { x: -11, y: 22 },
            ].map((cotton, idx) => (
              <g key={`cotton-${idx}`} transform={`translate(${cotton.x}, ${cotton.y})`}>
                <path d="M -6 4 Q 0 8 6 4 Q 0 -1 -6 4 Z" fill="#43A047" stroke="#1B5E20" strokeWidth="0.8" />
                <circle cx="-3" cy="-1" r="3.8" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
                <circle cx="3" cy="-1" r="3.8" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
                <circle cx="0" cy="-4" r="4.2" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="0.8" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

