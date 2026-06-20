import React from 'react';
import { Box } from '@chakra-ui/react';

const CharacterRenderer = ({ config, size = '150px' }) => {
  if (!config) return null;

  const {
    gender = 'male',
    skinTone = '#E0A96D',
    hairstyle = 'hair-default',
    hairColor = '#000000',
    shirt = 'shirt-default',
    shirtColor = '#1A73E8',
    pants = 'pants-default',
    pantsColor = '#161B22',
    shoes = 'shoes-default',
    shoesColor = '#E74C3C',
    accessories = 'none',
  } = config;

  return (
    <Box w={size} h={size} overflow="hidden" position="relative" mx="auto">
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Background Aura */}
        <circle cx="50" cy="50" r="46" fill="rgba(247, 183, 49, 0.1)" stroke="rgba(247, 183, 49, 0.2)" strokeWidth="1.5" />

        {/* 1. Body Base (Neck & Shoulders) */}
        <path d="M42 68 L42 78 L58 78 L58 68 Z" fill={skinTone} />
        
        {/* Torso outline base */}
        <path d="M30 78 C30 75, 70 75, 70 78 L72 95 L28 95 Z" fill="#E6EDF3" opacity="0.1" />

        {/* 2. Head Shape */}
        <circle cx="50" cy="48" r="18" fill={skinTone} />
        {/* Ears */}
        <circle cx="31" cy="48" r="4.5" fill={skinTone} />
        <circle cx="69" cy="48" r="4.5" fill={skinTone} />

        {/* 3. Face Details */}
        {/* Eyes */}
        <circle cx="43" cy="46" r="1.8" fill="#1A1D20" />
        <circle cx="57" cy="46" r="1.8" fill="#1A1D20" />
        {/* Blushing cheek pads */}
        <circle cx="40" cy="50" r="2.5" fill="rgba(231, 76, 60, 0.3)" />
        <circle cx="60" cy="50" r="2.5" fill="rgba(231, 76, 60, 0.3)" />
        {/* Smile */}
        <path d="M46 54 Q50 58 54 54" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Nose */}
        <path d="M49.5 48 L50.5 48 L50 51 Z" fill="rgba(0,0,0,0.15)" />

        {/* 4. Hairstyle Layer */}
        {hairstyle === 'hair-default' && (
          // Classic Short Crop
          <path d="M31 43 C31 25, 69 25, 69 43 C63 36, 37 36, 31 43 Z" fill={hairColor} />
        )}
        {hairstyle === 'hair-long' && (
          // Ponytail / Long Hair outline
          <g>
            <path d="M31 43 C31 22, 69 22, 69 43 C64 36, 36 36, 31 43 Z" fill={hairColor} />
            <path d="M66 40 C69 45, 69 58, 65 64 C62 67, 58 64, 60 55 Z" fill={hairColor} /> {/* Tail */}
          </g>
        )}
        {hairstyle === 'hair-curly' && (
          // Pinoy Wavy/Curly
          <g fill={hairColor}>
            <circle cx="35" cy="35" r="7" />
            <circle cx="45" cy="30" r="8" />
            <circle cx="55" cy="30" r="8" />
            <circle cx="65" cy="35" r="7" />
            <path d="M31 43 C31 28, 69 28, 69 43 Z" />
          </g>
        )}

        {/* 5. Shirts Layer */}
        {shirt === 'shirt-default' && (
          // Barong Tagalog (Traditional Cream-white color with embroidery styling)
          <g>
            <path d="M32 78 L68 78 L70 98 L30 98 Z" fill="#FBFBF7" stroke="#DCDCC6" strokeWidth="1" />
            {/* V-neck collar */}
            <path d="M42 78 L50 86 L58 78" fill="none" stroke="#DCDCC6" strokeWidth="1.5" />
            {/* Traditional front lace/embroidery design */}
            <line x1="50" y1="86" x2="50" y2="98" stroke="#DCDCC6" strokeWidth="2" strokeDasharray="1,1" />
            <line x1="46" y1="84" x2="46" y2="98" stroke="#E5E5CA" strokeWidth="1" />
            <line x1="54" y1="84" x2="54" y2="98" stroke="#E5E5CA" strokeWidth="1" />
          </g>
        )}
        {shirt === 'shirt-jersey' && (
          // Sports Jersey with custom color
          <g>
            <path d="M32 78 L68 78 L68 98 L32 98 Z" fill={shirtColor} />
            {/* Jersey shoulder strips (white contrast) */}
            <path d="M32 78 L38 78 L38 98 L32 98 Z" fill="#FFFFFF" opacity="0.3" />
            <path d="M68 78 L62 78 L62 98 L68 98 Z" fill="#FFFFFF" opacity="0.3" />
            {/* Jersey Number */}
            <text x="50" y="93" fill="#FFFFFF" fontSize="11" fontFamily="heading" fontWeight="bold" textAnchor="middle">
              08
            </text>
          </g>
        )}
        {shirt === 'shirt-tshirt' && (
          // Classic Palaro logo T-shirt
          <g>
            <path d="M32 78 L68 78 L70 98 L30 98 Z" fill={shirtColor} />
            {/* Sleeve cuts */}
            <path d="M30 78 L34 78 L32 88 Z" fill="rgba(0,0,0,0.15)" />
            <path d="M70 78 L66 78 L68 88 Z" fill="rgba(0,0,0,0.15)" />
            {/* Golden circle print on chest */}
            <circle cx="50" cy="88" r="4.5" fill="brand.gold" />
            <polygon points="50,85 52,89 48,89" fill="#0D1117" />
          </g>
        )}

        {/* 6. Pants Layer (Since we render waist-up, we show collar and waistline) */}
        {/* We can draw belt and pants overlap at the very bottom */}
        <rect x="30" y="96" width="40" height="4" fill={pantsColor} />

        {/* 7. Accessories Layer */}
        {accessories === 'accessory-salakot' && (
          // Traditional Salakot Hat
          <g>
            <path d="M22 36 L78 36 L50 20 Z" fill="#C5A059" stroke="#967232" strokeWidth="1" />
            <path d="M22 36 Q50 39 78 36" fill="none" stroke="#967232" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="50" y2="38" stroke="#967232" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        )}
        {accessories === 'accessory-bandana' && (
          // Red Katipunan Bandana tied on forehead
          <g>
            <path d="M31 39 H69 V43 H31 Z" fill="#E74C3C" />
            {/* Knot on the side */}
            <circle cx="68" cy="41" r="3.5" fill="#C0392B" />
            <path d="M68 41 L76 39 M68 41 L74 45" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </Box>
  );
};

export default CharacterRenderer;
