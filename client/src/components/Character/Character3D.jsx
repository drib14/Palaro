import React from 'react';
import * as THREE from 'three';

export const getSkinToneHex = (tone) => {
  if (!tone) return '#E0A96D';
  if (tone.startsWith('#')) return tone;
  switch (tone.toLowerCase()) {
    case 'light': return '#FFD1A9';
    case 'medium': return '#E0A96D';
    case 'tan': return '#C68642';
    case 'brown': return '#8D5524';
    case 'dark': return '#5C3818';
    default: return '#E0A96D';
  }
};

const Character3D = ({ config, showShadow = true }) => {
  if (!config) return null;

  const {
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
    hat = 'none',
  } = config;

  const resolvedSkinTone = getSkinToneHex(skinTone);

  return (
    <group>
      {/* 1. Neck and Body (Torso / Shirt) */}
      <mesh castShadow={showShadow} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.8, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.4} />
      </mesh>

      {/* 2. Pants / Shorts */}
      <mesh castShadow={showShadow} position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.6} />
      </mesh>

      {/* 3. Shoes (Feet) */}
      <group position={[0, 0, 0]}>
        {/* Left Foot */}
        <mesh castShadow={showShadow} position={[-0.1, -0.52, 0.05]}>
          <boxGeometry args={[0.11, 0.08, 0.22]} />
          <meshStandardMaterial color={shoesColor} roughness={0.8} />
        </mesh>
        {/* Right Foot */}
        <mesh castShadow={showShadow} position={[0.1, -0.52, 0.05]}>
          <boxGeometry args={[0.11, 0.08, 0.22]} />
          <meshStandardMaterial color={shoesColor} roughness={0.8} />
        </mesh>
      </group>

      {/* 4. Head */}
      <mesh castShadow={showShadow} position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={resolvedSkinTone} roughness={0.8} />
      </mesh>

      {/* 5. Face Details (Eyes) */}
      <group position={[0, 0.58, 0]}>
        {/* Left Eye */}
        <mesh position={[-0.08, 0.04, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Right Eye */}
        <mesh position={[0.08, 0.04, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Blush cheeks */}
        <mesh position={[-0.11, -0.02, 0.19]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#F44336" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0.11, -0.02, 0.19]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#F44336" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 6. Hair Layer */}
      {hairstyle !== 'none' && (
        <group>
          {/* Main Hair Cap */}
          <mesh castShadow={showShadow} position={[0, 0.64, -0.02]}>
            <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
            <meshStandardMaterial color={hairColor} roughness={0.8} />
          </mesh>

          {/* Hairstyle Specifics */}
          {hairstyle === 'hair-long' && (
            // Ponytail extension behind
            <mesh castShadow={showShadow} position={[0, 0.46, -0.23]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.02, 0.35, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.8} />
            </mesh>
          )}

          {hairstyle === 'hair-curly' && (
            // Curly bumps
            <group>
              <mesh position={[-0.09, 0.72, 0.08]} castShadow={showShadow}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
              <mesh position={[0.09, 0.72, 0.08]} castShadow={showShadow}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
              <mesh position={[0, 0.74, -0.06]} castShadow={showShadow}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* 7. Accessories / Hats */}
      {accessories === 'accessory-salakot' || hat === 'salakot' ? (
        // Traditional wooden cone hat
        <mesh castShadow={showShadow} position={[0, 0.73, 0]}>
          <coneGeometry args={[0.48, 0.25, 16]} />
          <meshStandardMaterial color="#D7CCC8" roughness={0.9} />
        </mesh>
      ) : accessories === 'accessory-bandana' || hat === 'bandana' ? (
        // Red Katipunan bandana wrap
        <group>
          <mesh position={[0, 0.62, 0]} rotation={[0.05, 0, 0]}>
            <torusGeometry args={[0.25, 0.02, 8, 32]} />
            <meshBasicMaterial color="#E53935" />
          </mesh>
          {/* Knot */}
          <mesh position={[0.22, 0.62, -0.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#D32F2F" />
          </mesh>
        </group>
      ) : hat === 'cap' || accessories === 'cap' ? (
        // Visor baseball cap
        <group position={[0, 0.7, 0.03]}>
          <mesh castShadow={showShadow}>
            <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#E53935" />
          </mesh>
          {/* Visor brim */}
          <mesh position={[0, -0.05, 0.2]} rotation={[0.1, 0, 0]} castShadow={showShadow}>
            <boxGeometry args={[0.3, 0.02, 0.2]} />
            <meshStandardMaterial color="#E53935" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

export default Character3D;
