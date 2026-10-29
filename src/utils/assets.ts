/**
 * Asset resolution helper for GitHub Pages and production hosting.
 * Handles subpaths (e.g., https://username.github.io/repository-name/)
 * and provides instant SVG fallbacks so broken image icons never appear.
 */

// Resolves relative asset paths using Vite's BASE_URL
export function resolveAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Remove leading slash to make it relative to base
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  
  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}

/**
 * High-fidelity vector SVG fallback for Uciel (Burung Garuda Cilik).
 * Encoded as a lightweight, guaranteed-to-render data URI.
 */
export const UCIEL_SVG_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23FEF3C7"/>
      <stop offset="100%" stop-color="%23FDE68A"/>
    </radialGradient>
    <linearGradient id="goldFeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23FBBF24"/>
      <stop offset="50%" stop-color="%23F59E0B"/>
      <stop offset="100%" stop-color="%23D97706"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23EF4444"/>
      <stop offset="100%" stop-color="%23B91C1C"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="100" cy="100" r="94" fill="url(%23skyGrad)" stroke="%23F59E0B" stroke-width="6"/>
  <!-- Feather crest on head -->
  <path d="M100 25 Q108 8 116 26 Q122 12 128 32 Q100 35 100 25 Z" fill="%23D97706"/>
  <path d="M100 25 Q92 8 84 26 Q78 12 72 32 Q100 35 100 25 Z" fill="%23D97706"/>
  <!-- Wings -->
  <path d="M42 105 Q15 90 25 140 Q60 145 65 115 Z" fill="url(%23goldFeather)" stroke="%23B45309" stroke-width="2"/>
  <path d="M158 105 Q185 90 175 140 Q140 145 135 115 Z" fill="url(%23goldFeather)" stroke="%23B45309" stroke-width="2"/>
  <!-- Body -->
  <ellipse cx="100" cy="120" rx="46" ry="52" fill="url(%23goldFeather)" stroke="%23B45309" stroke-width="3"/>
  <!-- Head -->
  <circle cx="100" cy="74" r="42" fill="url(%23goldFeather)" stroke="%23B45309" stroke-width="3"/>
  <!-- Garuda Crest / Headband Merah Putih -->
  <rect x="62" y="46" width="76" height="10" rx="5" fill="%23DC2626"/>
  <rect x="62" y="52" width="76" height="5" rx="2" fill="%23FFFFFF"/>
  <!-- Eyes -->
  <ellipse cx="84" cy="72" rx="9" ry="12" fill="%23FFFFFF" stroke="%231F2937" stroke-width="2"/>
  <circle cx="86" cy="73" r="5" fill="%231F2937"/>
  <circle cx="88" cy="70" r="2" fill="%23FFFFFF"/>
  <ellipse cx="116" cy="72" rx="9" ry="12" fill="%23FFFFFF" stroke="%231F2937" stroke-width="2"/>
  <circle cx="114" cy="73" r="5" fill="%231F2937"/>
  <circle cx="116" cy="70" r="2" fill="%23FFFFFF"/>
  <!-- Rosy cheeks -->
  <ellipse cx="72" cy="84" rx="6" ry="4" fill="%23F87171" opacity="0.6"/>
  <ellipse cx="128" cy="84" rx="6" ry="4" fill="%23F87171" opacity="0.6"/>
  <!-- Cute Beak -->
  <path d="M92 78 Q100 70 108 78 Q100 96 92 78 Z" fill="%23EA580C" stroke="%23C2410C" stroke-width="2"/>
  <!-- Garuda Chest Shield -->
  <path d="M85 115 L115 115 L110 142 L100 150 L90 142 Z" fill="url(%23shieldGrad)" stroke="%23FBBF24" stroke-width="2.5"/>
  <!-- Gold Star inside shield -->
  <polygon points="100,123 102.5,129 109,129.5 104,133.5 106,140 100,136 94,140 96,133.5 91,129.5 97.5,129" fill="%23FDE047"/>
  <!-- Feet -->
  <ellipse cx="86" cy="172" rx="8" ry="4" fill="%23EA580C"/>
  <ellipse cx="114" cy="172" rx="8" ry="4" fill="%23EA580C"/>
  <!-- Text Label -->
  <rect x="55" y="166" width="90" height="22" rx="11" fill="%23D97706" stroke="%23FFFFFF" stroke-width="2"/>
  <text x="100" y="181" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="%23FFFFFF" text-anchor="middle">UCIEL GARUDA</text>
</svg>`;

/**
 * Scenic Taman Pancasila vector SVG fallback
 */
export const TAMAN_PANCASILA_SVG_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%2338BDF8"/>
      <stop offset="70%" stop-color="%23BAE6FD"/>
      <stop offset="100%" stop-color="%23FEF08A"/>
    </linearGradient>
    <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%234ADE80"/>
      <stop offset="100%" stop-color="%2315803D"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(%23sky)"/>
  <!-- Clouds -->
  <ellipse cx="150" cy="80" rx="60" ry="25" fill="%23FFFFFF" opacity="0.8"/>
  <ellipse cx="190" cy="70" rx="45" ry="25" fill="%23FFFFFF" opacity="0.8"/>
  <ellipse cx="620" cy="100" rx="70" ry="30" fill="%23FFFFFF" opacity="0.7"/>
  <!-- Hills -->
  <path d="M0 260 Q200 180 400 240 Q600 290 800 220 L800 400 L0 400 Z" fill="%2386EFAC" opacity="0.6"/>
  <path d="M0 290 Q250 240 500 280 Q680 300 800 270 L800 400 L0 400 Z" fill="url(%23grass)"/>
  <!-- School Building in background -->
  <rect x="520" y="160" width="180" height="90" fill="%23F87171" stroke="%23DC2626" stroke-width="2"/>
  <polygon points="510,160 610,105 710,160" fill="%23B91C1C"/>
  <rect x="590" y="200" width="35" height="50" fill="%23FDE68A"/>
  <!-- Pancasila Monument in garden -->
  <rect x="230" y="250" width="140" height="30" rx="4" fill="%23E2E8F0" stroke="%2394A3B8" stroke-width="2"/>
  <rect x="250" y="210" width="100" height="40" fill="%23F1F5F9" stroke="%2394A3B8" stroke-width="2"/>
  <circle cx="300" cy="180" r="30" fill="%23FBBF24" stroke="%23D97706" stroke-width="3"/>
  <polygon points="300,162 305,174 318,175 308,183 312,196 300,188 288,196 292,183 282,175 295,174" fill="%23FEF08A"/>
  <text x="300" y="240" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%231E293B" text-anchor="middle">TAMAN PANCASILA</text>
  <!-- Flowers and Trees -->
  <circle cx="80" cy="270" r="40" fill="%2322C55E"/>
  <circle cx="120" cy="285" r="30" fill="%2316A34A"/>
  <rect x="95" y="300" width="12" height="45" fill="%2378350F"/>
</svg>`;

/**
 * School Map vector SVG fallback
 */
export const SCHOOL_MAP_SVG_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
  <defs>
    <linearGradient id="mapGrass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%2386EFAC"/>
      <stop offset="100%" stop-color="%2322C55E"/>
    </linearGradient>
    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%23FDE68A"/>
      <stop offset="100%" stop-color="%23FCD34D"/>
    </linearGradient>
  </defs>
  <!-- Background Grass Field -->
  <rect width="1000" height="625" fill="url(%23mapGrass)"/>
  <!-- Cobblestone / Dirt Paths connecting zones -->
  <path d="M120 480 Q250 420 380 320 T650 250 T880 300" stroke="url(%23pathGrad)" stroke-width="48" fill="none" stroke-linecap="round"/>
  <path d="M380 320 Q480 460 700 500" stroke="url(%23pathGrad)" stroke-width="42" fill="none" stroke-linecap="round"/>
  <path d="M380 320 Q320 180 500 120" stroke="url(%23pathGrad)" stroke-width="36" fill="none" stroke-linecap="round"/>
  <!-- Zone 1: Taman Pancasila (Center Left) -->
  <rect x="60" y="380" width="200" height="150" rx="20" fill="%23FEF3C7" stroke="%23F59E0B" stroke-width="4"/>
  <circle cx="160" cy="440" r="32" fill="%23FDE047" stroke="%23D97706" stroke-width="3"/>
  <text x="160" y="448" font-size="28" text-anchor="middle">⭐</text>
  <text x="160" y="500" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%2392400E" text-anchor="middle">Taman Pancasila</text>
  <!-- Zone 2: Perpustakaan Ceria (Top Center) -->
  <rect x="400" y="50" width="200" height="130" rx="20" fill="%23E0E7FF" stroke="%236366F1" stroke-width="4"/>
  <rect x="460" y="80" width="80" height="50" rx="8" fill="%234F46E5"/>
  <text x="500" y="112" font-size="26" text-anchor="middle">📖</text>
  <text x="500" y="155" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%233730A3" text-anchor="middle">Perpustakaan Ceria</text>
  <!-- Zone 3: Kantin Pintar (Center Right) -->
  <rect x="760" y="220" width="190" height="140" rx="20" fill="%23DCFCE7" stroke="%2316A34A" stroke-width="4"/>
  <circle cx="855" cy="275" r="30" fill="%2322C55E"/>
  <text x="855" y="285" font-size="26" text-anchor="middle">🍎</text>
  <text x="855" y="335" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23166534" text-anchor="middle">Kantin Pintar</text>
  <!-- Zone 4: Studio Kreatif (Bottom Center) -->
  <rect x="420" y="440" width="200" height="140" rx="20" fill="%23FCE7F3" stroke="%23EC4899" stroke-width="4"/>
  <circle cx="520" cy="495" r="30" fill="%23F43F5E"/>
  <text x="520" y="505" font-size="26" text-anchor="middle">🎨</text>
  <text x="520" y="555" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%239D174D" text-anchor="middle">Studio Kreatif</text>
  <!-- Zone 5: Lapangan Persahabatan (Bottom Right) -->
  <rect x="720" y="430" width="210" height="150" rx="20" fill="%23CFFAFE" stroke="%2306B6D4" stroke-width="4"/>
  <circle cx="825" cy="485" r="32" fill="%230284C7"/>
  <text x="825" y="495" font-size="26" text-anchor="middle">⚽</text>
  <text x="825" y="550" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%230E7490" text-anchor="middle">Lapangan Olahraga</text>
  <!-- Map Title Banner -->
  <rect x="300" y="10" width="400" height="34" rx="17" fill="%231E293B" opacity="0.9"/>
  <text x="500" y="32" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">PETA PETUALANGAN SD INDONESIA EMAS</text>
</svg>`;

/**
 * Universal error handler for images that steps through alternative paths
 * and gracefully falls back to vector SVG data URIs.
 */
export function createSafeImageErrorHandler(
  fallbackType: 'uciel' | 'taman' | 'map',
  customFallbackUrl?: string
) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const step = parseInt(target.dataset.errStep || '0', 10);

    const fallbacks = {
      uciel: [
        resolveAssetUrl('images/garuda_uciel_1791815443617.jpg'),
        resolveAssetUrl('assets/garuda_uciel_1791815443617.jpg'),
        UCIEL_SVG_DATA_URL,
      ],
      taman: [
        resolveAssetUrl('images/taman_pancasila_bg_1791811412574.jpg'),
        resolveAssetUrl('assets/taman_pancasila_bg_1791811412574.jpg'),
        TAMAN_PANCASILA_SVG_DATA_URL,
      ],
      map: [
        resolveAssetUrl('images/school_adventure_map_1791811444961.jpg'),
        resolveAssetUrl('assets/school_adventure_map_1791811444961.jpg'),
        SCHOOL_MAP_SVG_DATA_URL,
      ],
    };

    const chain = fallbacks[fallbackType];
    if (customFallbackUrl && !chain.includes(customFallbackUrl)) {
      chain.unshift(customFallbackUrl);
    }

    if (step < chain.length) {
      target.dataset.errStep = String(step + 1);
      target.src = chain[step];
    } else {
      // Final absolute guarantee: SVG data URI
      target.src =
        fallbackType === 'uciel'
          ? UCIEL_SVG_DATA_URL
          : fallbackType === 'taman'
          ? TAMAN_PANCASILA_SVG_DATA_URL
          : SCHOOL_MAP_SVG_DATA_URL;
    }
  };
}
