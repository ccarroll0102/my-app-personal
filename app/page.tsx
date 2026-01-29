"use client";

import Link from "next/link";

// Pre-generated star positions to avoid Math.random() during render
const STAR_POSITIONS = [
  { left: 4, top: 8, delay: 0 }, { left: 12, top: 22, delay: 1 }, { left: 78, top: 6, delay: 2 },
  { left: 24, top: 14, delay: 0 }, { left: 56, top: 28, delay: 1 }, { left: 88, top: 12, delay: 2 },
  { left: 36, top: 4, delay: 0 }, { left: 68, top: 18, delay: 1 }, { left: 92, top: 24, delay: 2 },
  { left: 8, top: 26, delay: 0 }, { left: 44, top: 10, delay: 1 }, { left: 72, top: 20, delay: 2 },
  { left: 16, top: 16, delay: 0 }, { left: 52, top: 2, delay: 1 }, { left: 84, top: 8, delay: 2 },
  { left: 28, top: 24, delay: 0 }, { left: 64, top: 14, delay: 1 }, { left: 96, top: 18, delay: 2 },
  { left: 2, top: 12, delay: 0 }, { left: 40, top: 6, delay: 1 }, { left: 76, top: 26, delay: 2 },
  { left: 20, top: 20, delay: 0 }, { left: 48, top: 22, delay: 1 }, { left: 80, top: 4, delay: 2 },
  { left: 32, top: 8, delay: 0 }, { left: 60, top: 16, delay: 1 }, { left: 90, top: 28, delay: 2 },
  { left: 6, top: 18, delay: 0 }, { left: 38, top: 28, delay: 1 }, { left: 70, top: 10, delay: 2 },
  { left: 14, top: 4, delay: 0 }, { left: 54, top: 24, delay: 1 }, { left: 86, top: 16, delay: 2 },
  { left: 26, top: 12, delay: 0 }, { left: 62, top: 8, delay: 1 }, { left: 94, top: 22, delay: 2 },
  { left: 10, top: 28, delay: 0 }, { left: 46, top: 18, delay: 1 }, { left: 82, top: 2, delay: 2 },
  { left: 34, top: 20, delay: 0 },
];

// Pre-generated particle positions
const PARTICLE_POSITIONS = [
  { left: 10, top: 35, delay: 0, duration: 3 }, { left: 16, top: 40, delay: 0.3, duration: 4 },
  { left: 22, top: 45, delay: 0.6, duration: 5 }, { left: 28, top: 50, delay: 0.9, duration: 3 },
  { left: 34, top: 35, delay: 1.2, duration: 4 }, { left: 40, top: 40, delay: 1.5, duration: 5 },
  { left: 46, top: 45, delay: 1.8, duration: 3 }, { left: 52, top: 50, delay: 2.1, duration: 4 },
  { left: 58, top: 35, delay: 2.4, duration: 5 }, { left: 64, top: 40, delay: 2.7, duration: 3 },
  { left: 70, top: 45, delay: 3.0, duration: 4 }, { left: 76, top: 50, delay: 3.3, duration: 5 },
  { left: 82, top: 35, delay: 3.6, duration: 3 }, { left: 88, top: 40, delay: 3.9, duration: 4 },
  { left: 94, top: 45, delay: 4.2, duration: 5 },
];

const PARTICLE_COLORS = ['#FF69B4', '#00FFFF', '#FFFF00', '#FF6B6B', '#9400D3'];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Pixelated Mystical Sky Background */}
      <div className="absolute inset-0">
        {/* Sky gradient made of pixel blocks */}
        <div className="absolute inset-0 flex flex-col">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                backgroundColor: `hsl(${260 - i * 3}, ${70 + i}%, ${15 + i * 2}%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Pixel Stars */}
      <div className="absolute inset-0">
        {STAR_POSITIONS.map((star, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          >
            {/* 4-point pixel star */}
            <svg width="12" height="12" viewBox="0 0 6 6" style={{ imageRendering: 'pixelated' }}>
              <rect x="2" y="0" width="2" height="2" fill="#FFFFFF"/>
              <rect x="0" y="2" width="2" height="2" fill="#FFFFFF"/>
              <rect x="2" y="2" width="2" height="2" fill="#FFFFAA"/>
              <rect x="4" y="2" width="2" height="2" fill="#FFFFFF"/>
              <rect x="2" y="4" width="2" height="2" fill="#FFFFFF"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Pixel Moon */}
      <div className="absolute top-8 right-16">
        <svg width="64" height="64" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
          <rect x="4" y="0" width="8" height="2" fill="#FFFFD0"/>
          <rect x="2" y="2" width="2" height="2" fill="#FFFFD0"/>
          <rect x="4" y="2" width="8" height="2" fill="#FFFFAA"/>
          <rect x="12" y="2" width="2" height="2" fill="#FFFFD0"/>
          <rect x="0" y="4" width="2" height="8" fill="#FFFFD0"/>
          <rect x="2" y="4" width="12" height="8" fill="#FFFFAA"/>
          <rect x="14" y="4" width="2" height="8" fill="#FFFFD0"/>
          <rect x="4" y="4" width="2" height="2" fill="#FFFF88"/>
          <rect x="8" y="6" width="2" height="2" fill="#FFFF88"/>
          <rect x="2" y="12" width="2" height="2" fill="#FFFFD0"/>
          <rect x="4" y="12" width="8" height="2" fill="#FFFFAA"/>
          <rect x="12" y="12" width="2" height="2" fill="#FFFFD0"/>
          <rect x="4" y="14" width="8" height="2" fill="#FFFFD0"/>
        </svg>
      </div>

      {/* Pixel Rainbow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2">
        <svg width="480" height="200" viewBox="0 0 60 25" style={{ imageRendering: 'pixelated' }}>
          {/* Red band */}
          <rect x="4" y="16" width="4" height="4" fill="#FF0000"/>
          <rect x="8" y="12" width="4" height="4" fill="#FF0000"/>
          <rect x="12" y="8" width="4" height="4" fill="#FF0000"/>
          <rect x="16" y="4" width="4" height="4" fill="#FF0000"/>
          <rect x="20" y="2" width="4" height="4" fill="#FF0000"/>
          <rect x="24" y="0" width="4" height="4" fill="#FF0000"/>
          <rect x="28" y="0" width="4" height="4" fill="#FF0000"/>
          <rect x="32" y="0" width="4" height="4" fill="#FF0000"/>
          <rect x="36" y="2" width="4" height="4" fill="#FF0000"/>
          <rect x="40" y="4" width="4" height="4" fill="#FF0000"/>
          <rect x="44" y="8" width="4" height="4" fill="#FF0000"/>
          <rect x="48" y="12" width="4" height="4" fill="#FF0000"/>
          <rect x="52" y="16" width="4" height="4" fill="#FF0000"/>

          {/* Orange band */}
          <rect x="8" y="16" width="4" height="4" fill="#FF7F00"/>
          <rect x="12" y="12" width="4" height="4" fill="#FF7F00"/>
          <rect x="16" y="8" width="4" height="4" fill="#FF7F00"/>
          <rect x="20" y="6" width="4" height="4" fill="#FF7F00"/>
          <rect x="24" y="4" width="4" height="4" fill="#FF7F00"/>
          <rect x="28" y="4" width="4" height="4" fill="#FF7F00"/>
          <rect x="32" y="4" width="4" height="4" fill="#FF7F00"/>
          <rect x="36" y="6" width="4" height="4" fill="#FF7F00"/>
          <rect x="40" y="8" width="4" height="4" fill="#FF7F00"/>
          <rect x="44" y="12" width="4" height="4" fill="#FF7F00"/>
          <rect x="48" y="16" width="4" height="4" fill="#FF7F00"/>

          {/* Yellow band */}
          <rect x="12" y="16" width="4" height="4" fill="#FFFF00"/>
          <rect x="16" y="12" width="4" height="4" fill="#FFFF00"/>
          <rect x="20" y="10" width="4" height="4" fill="#FFFF00"/>
          <rect x="24" y="8" width="4" height="4" fill="#FFFF00"/>
          <rect x="28" y="8" width="4" height="4" fill="#FFFF00"/>
          <rect x="32" y="8" width="4" height="4" fill="#FFFF00"/>
          <rect x="36" y="10" width="4" height="4" fill="#FFFF00"/>
          <rect x="40" y="12" width="4" height="4" fill="#FFFF00"/>
          <rect x="44" y="16" width="4" height="4" fill="#FFFF00"/>

          {/* Green band */}
          <rect x="16" y="16" width="4" height="4" fill="#00FF00"/>
          <rect x="20" y="14" width="4" height="4" fill="#00FF00"/>
          <rect x="24" y="12" width="4" height="4" fill="#00FF00"/>
          <rect x="28" y="12" width="4" height="4" fill="#00FF00"/>
          <rect x="32" y="12" width="4" height="4" fill="#00FF00"/>
          <rect x="36" y="14" width="4" height="4" fill="#00FF00"/>
          <rect x="40" y="16" width="4" height="4" fill="#00FF00"/>

          {/* Blue band */}
          <rect x="20" y="18" width="4" height="4" fill="#0000FF"/>
          <rect x="24" y="16" width="4" height="4" fill="#0000FF"/>
          <rect x="28" y="16" width="4" height="4" fill="#0000FF"/>
          <rect x="32" y="16" width="4" height="4" fill="#0000FF"/>
          <rect x="36" y="18" width="4" height="4" fill="#0000FF"/>

          {/* Indigo band */}
          <rect x="24" y="20" width="4" height="4" fill="#4B0082"/>
          <rect x="28" y="20" width="4" height="4" fill="#4B0082"/>
          <rect x="32" y="20" width="4" height="4" fill="#4B0082"/>

          {/* Violet band */}
          <rect x="26" y="22" width="4" height="3" fill="#9400D3"/>
          <rect x="30" y="22" width="4" height="3" fill="#9400D3"/>
        </svg>
      </div>

      {/* Pixel Clouds */}
      <div className="absolute top-24 left-16">
        <svg width="96" height="48" viewBox="0 0 24 12" style={{ imageRendering: 'pixelated' }}>
          <rect x="4" y="4" width="4" height="4" fill="#E8E8FF"/>
          <rect x="8" y="2" width="4" height="4" fill="#FFFFFF"/>
          <rect x="12" y="0" width="4" height="4" fill="#FFFFFF"/>
          <rect x="16" y="2" width="4" height="4" fill="#E8E8FF"/>
          <rect x="0" y="6" width="4" height="4" fill="#E8E8FF"/>
          <rect x="4" y="6" width="16" height="4" fill="#FFFFFF"/>
          <rect x="20" y="6" width="4" height="4" fill="#E8E8FF"/>
          <rect x="2" y="8" width="20" height="4" fill="#FFFFFF"/>
        </svg>
      </div>
      <div className="absolute top-32 right-48 animate-float" style={{ animationDelay: '1s' }}>
        <svg width="80" height="40" viewBox="0 0 20 10" style={{ imageRendering: 'pixelated' }}>
          <rect x="2" y="2" width="4" height="4" fill="#FFFFFF"/>
          <rect x="6" y="0" width="4" height="4" fill="#FFFFFF"/>
          <rect x="10" y="2" width="4" height="4" fill="#E8E8FF"/>
          <rect x="0" y="4" width="4" height="4" fill="#E8E8FF"/>
          <rect x="4" y="4" width="12" height="4" fill="#FFFFFF"/>
          <rect x="16" y="4" width="4" height="4" fill="#E8E8FF"/>
        </svg>
      </div>

      {/* Pixel Mountains - Far */}
      <div className="absolute bottom-32 left-0 right-0">
        <svg width="100%" height="160" viewBox="0 0 160 40" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
          {/* Mountain 1 */}
          <rect x="0" y="36" width="160" height="4" fill="#2D1B4E"/>
          <rect x="4" y="32" width="24" height="4" fill="#2D1B4E"/>
          <rect x="8" y="28" width="16" height="4" fill="#2D1B4E"/>
          <rect x="12" y="24" width="8" height="4" fill="#2D1B4E"/>
          <rect x="14" y="20" width="4" height="4" fill="#3D2B5E"/>
          {/* Mountain 2 */}
          <rect x="30" y="32" width="32" height="4" fill="#2D1B4E"/>
          <rect x="34" y="28" width="24" height="4" fill="#2D1B4E"/>
          <rect x="38" y="24" width="16" height="4" fill="#2D1B4E"/>
          <rect x="42" y="20" width="8" height="4" fill="#2D1B4E"/>
          <rect x="44" y="16" width="4" height="4" fill="#3D2B5E"/>
          <rect x="46" y="12" width="2" height="4" fill="#3D2B5E"/>
          {/* Mountain 3 */}
          <rect x="70" y="32" width="28" height="4" fill="#2D1B4E"/>
          <rect x="74" y="28" width="20" height="4" fill="#2D1B4E"/>
          <rect x="78" y="24" width="12" height="4" fill="#2D1B4E"/>
          <rect x="82" y="20" width="4" height="4" fill="#3D2B5E"/>
          {/* Mountain 4 */}
          <rect x="100" y="32" width="36" height="4" fill="#2D1B4E"/>
          <rect x="104" y="28" width="28" height="4" fill="#2D1B4E"/>
          <rect x="108" y="24" width="20" height="4" fill="#2D1B4E"/>
          <rect x="112" y="20" width="12" height="4" fill="#2D1B4E"/>
          <rect x="116" y="16" width="4" height="4" fill="#3D2B5E"/>
          {/* Mountain 5 */}
          <rect x="140" y="32" width="20" height="4" fill="#2D1B4E"/>
          <rect x="144" y="28" width="12" height="4" fill="#2D1B4E"/>
          <rect x="148" y="24" width="4" height="4" fill="#3D2B5E"/>
        </svg>
      </div>

      {/* Pixel Mountains - Near */}
      <div className="absolute bottom-20 left-0 right-0">
        <svg width="100%" height="120" viewBox="0 0 160 30" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
          <rect x="0" y="26" width="160" height="4" fill="#1A0F2E"/>
          <rect x="0" y="22" width="20" height="4" fill="#1A0F2E"/>
          <rect x="4" y="18" width="12" height="4" fill="#1A0F2E"/>
          <rect x="6" y="14" width="8" height="4" fill="#1A0F2E"/>
          <rect x="8" y="10" width="4" height="4" fill="#1A0F2E"/>

          <rect x="24" y="22" width="28" height="4" fill="#1A0F2E"/>
          <rect x="28" y="18" width="20" height="4" fill="#1A0F2E"/>
          <rect x="32" y="14" width="12" height="4" fill="#1A0F2E"/>
          <rect x="36" y="10" width="4" height="4" fill="#1A0F2E"/>

          <rect x="56" y="22" width="24" height="4" fill="#1A0F2E"/>
          <rect x="60" y="18" width="16" height="4" fill="#1A0F2E"/>
          <rect x="64" y="14" width="8" height="4" fill="#1A0F2E"/>
          <rect x="66" y="10" width="4" height="4" fill="#1A0F2E"/>
          <rect x="68" y="6" width="2" height="4" fill="#1A0F2E"/>

          <rect x="84" y="22" width="32" height="4" fill="#1A0F2E"/>
          <rect x="88" y="18" width="24" height="4" fill="#1A0F2E"/>
          <rect x="92" y="14" width="16" height="4" fill="#1A0F2E"/>
          <rect x="96" y="10" width="8" height="4" fill="#1A0F2E"/>
          <rect x="98" y="6" width="4" height="4" fill="#1A0F2E"/>

          <rect x="120" y="22" width="40" height="4" fill="#1A0F2E"/>
          <rect x="124" y="18" width="32" height="4" fill="#1A0F2E"/>
          <rect x="128" y="14" width="24" height="4" fill="#1A0F2E"/>
          <rect x="136" y="10" width="8" height="4" fill="#1A0F2E"/>
          <rect x="138" y="6" width="4" height="4" fill="#1A0F2E"/>
        </svg>
      </div>

      {/* Pixel Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        <svg width="100%" height="100%" viewBox="0 0 160 24" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
          {/* Main ground */}
          <rect x="0" y="8" width="160" height="16" fill="#1B5E20"/>
          <rect x="0" y="16" width="160" height="8" fill="#145214"/>

          {/* Grass tufts on top */}
          {[...Array(40)].map((_, i) => (
            <g key={i}>
              <rect x={i * 4} y="6" width="2" height="2" fill="#4CAF50"/>
              <rect x={i * 4} y="4" width="2" height="2" fill="#66BB6A"/>
              {i % 3 === 0 && <rect x={i * 4} y="2" width="2" height="2" fill="#81C784"/>}
            </g>
          ))}

          {/* Ground texture */}
          <rect x="8" y="12" width="2" height="2" fill="#145214"/>
          <rect x="24" y="14" width="2" height="2" fill="#145214"/>
          <rect x="48" y="12" width="2" height="2" fill="#145214"/>
          <rect x="72" y="16" width="2" height="2" fill="#0D3D0D"/>
          <rect x="96" y="12" width="2" height="2" fill="#145214"/>
          <rect x="120" y="14" width="2" height="2" fill="#145214"/>
          <rect x="144" y="12" width="2" height="2" fill="#145214"/>
        </svg>
      </div>

      {/* Pixel Flowers */}
      <div className="absolute bottom-20 left-24">
        <svg width="16" height="24" viewBox="0 0 4 6" style={{ imageRendering: 'pixelated' }}>
          <rect x="1" y="3" width="2" height="3" fill="#2E7D32"/>
          <rect x="0" y="0" width="2" height="2" fill="#FF69B4"/>
          <rect x="2" y="0" width="2" height="2" fill="#FF69B4"/>
          <rect x="1" y="1" width="2" height="2" fill="#FFD700"/>
        </svg>
      </div>
      <div className="absolute bottom-20 right-36">
        <svg width="16" height="24" viewBox="0 0 4 6" style={{ imageRendering: 'pixelated' }}>
          <rect x="1" y="3" width="2" height="3" fill="#2E7D32"/>
          <rect x="0" y="0" width="2" height="2" fill="#00BFFF"/>
          <rect x="2" y="0" width="2" height="2" fill="#00BFFF"/>
          <rect x="1" y="1" width="2" height="2" fill="#FFFF00"/>
        </svg>
      </div>

      {/* Pixel Crystal */}
      <div className="absolute bottom-28 left-16 animate-float" style={{ animationDelay: '0.5s' }}>
        <svg width="32" height="48" viewBox="0 0 8 12" style={{ imageRendering: 'pixelated' }}>
          <rect x="3" y="0" width="2" height="2" fill="#00FFFF"/>
          <rect x="2" y="2" width="4" height="2" fill="#00CED1"/>
          <rect x="1" y="4" width="6" height="2" fill="#00BFFF"/>
          <rect x="0" y="6" width="8" height="2" fill="#1E90FF"/>
          <rect x="1" y="8" width="6" height="2" fill="#4169E1"/>
          <rect x="2" y="10" width="4" height="2" fill="#0000CD"/>
        </svg>
      </div>
      <div className="absolute bottom-36 right-24 animate-float" style={{ animationDelay: '1.5s' }}>
        <svg width="24" height="40" viewBox="0 0 6 10" style={{ imageRendering: 'pixelated' }}>
          <rect x="2" y="0" width="2" height="2" fill="#FF69B4"/>
          <rect x="1" y="2" width="4" height="2" fill="#FF1493"/>
          <rect x="0" y="4" width="6" height="2" fill="#DB7093"/>
          <rect x="1" y="6" width="4" height="2" fill="#C71585"/>
          <rect x="2" y="8" width="2" height="2" fill="#8B008B"/>
        </svg>
      </div>

      {/* Sparkly Pixel Unicorn - N64 Style */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-float">
        {/* Pixel Sparkles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${-60 + (i % 5) * 80}px`,
              top: `${-30 + Math.floor(i / 5) * 160}px`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 4 4" style={{ imageRendering: 'pixelated' }}>
              <rect x="1" y="0" width="2" height="1" fill={['#FFFFFF', '#FFFF00', '#FF69B4', '#00FFFF', '#FFD700'][i % 5]}/>
              <rect x="0" y="1" width="1" height="2" fill={['#FFFFFF', '#FFFF00', '#FF69B4', '#00FFFF', '#FFD700'][i % 5]}/>
              <rect x="3" y="1" width="1" height="2" fill={['#FFFFFF', '#FFFF00', '#FF69B4', '#00FFFF', '#FFD700'][i % 5]}/>
              <rect x="1" y="3" width="2" height="1" fill={['#FFFFFF', '#FFFF00', '#FF69B4', '#00FFFF', '#FFD700'][i % 5]}/>
            </svg>
          </div>
        ))}

        {/* Clean N64-Style Pixel Unicorn with Wizard Rider */}
        <svg width="320" height="320" viewBox="0 -24 56 72" style={{ imageRendering: 'pixelated' }} className="drop-shadow-[0_0_25px_rgba(255,182,255,0.8)]">

          {/* ===== MAGICAL STAFF (held high) ===== */}
          {/* Staff pole */}
          <rect x="8" y="-20" width="2" height="32" fill="#8B4513"/>
          <rect x="7" y="-20" width="1" height="32" fill="#A0522D"/>

          {/* Staff orb - glowing */}
          <rect x="5" y="-24" width="8" height="2" fill="#00FFFF"/>
          <rect x="4" y="-22" width="10" height="2" fill="#00FFFF"/>
          <rect x="4" y="-20" width="10" height="2" fill="#00CED1"/>
          <rect x="5" y="-18" width="8" height="2" fill="#00FFFF"/>
          {/* Orb highlight */}
          <rect x="6" y="-23" width="2" height="2" fill="#FFFFFF"/>

          {/* Magic sparkles from staff */}
          <rect x="2" y="-26" width="2" height="2" fill="#FFD700"/>
          <rect x="14" y="-24" width="2" height="2" fill="#FF69B4"/>
          <rect x="0" y="-20" width="2" height="2" fill="#00FFFF"/>
          <rect x="16" y="-18" width="2" height="2" fill="#FFFF00"/>

          {/* ===== WIZARD RIDER ===== */}
          {/* Wizard hat */}
          <rect x="16" y="-4" width="8" height="2" fill="#4a00b4"/>
          <rect x="18" y="-8" width="4" height="4" fill="#4a00b4"/>
          <rect x="19" y="-10" width="2" height="2" fill="#4a00b4"/>
          {/* Hat star */}
          <rect x="19" y="-7" width="2" height="2" fill="#FFD700"/>
          {/* Hat brim */}
          <rect x="14" y="-2" width="12" height="2" fill="#3a0094"/>

          {/* Wizard head */}
          <rect x="16" y="0" width="8" height="6" fill="#FFE4C4"/>
          {/* Eyes */}
          <rect x="17" y="2" width="2" height="2" fill="#000000"/>
          <rect x="21" y="2" width="2" height="2" fill="#000000"/>

          {/* Wizard beard */}
          <rect x="17" y="6" width="6" height="2" fill="#C0C0C0"/>
          <rect x="18" y="8" width="4" height="2" fill="#C0C0C0"/>
          <rect x="19" y="10" width="2" height="2" fill="#C0C0C0"/>

          {/* Wizard robe body (sitting) */}
          <rect x="14" y="8" width="12" height="4" fill="#4a00b4"/>
          <rect x="12" y="12" width="16" height="4" fill="#4a00b4"/>
          <rect x="10" y="16" width="20" height="6" fill="#4a00b4"/>

          {/* Robe shading */}
          <rect x="10" y="16" width="2" height="6" fill="#3a0094"/>

          {/* Wizard arm holding staff */}
          <rect x="10" y="8" width="4" height="2" fill="#FFE4C4"/>
          <rect x="8" y="6" width="4" height="4" fill="#FFE4C4"/>

          {/* Wizard legs (dangling) */}
          <rect x="14" y="22" width="4" height="4" fill="#3a0094"/>
          <rect x="22" y="22" width="4" height="4" fill="#3a0094"/>
          {/* Boots */}
          <rect x="13" y="26" width="6" height="2" fill="#333333"/>
          <rect x="21" y="26" width="6" height="2" fill="#333333"/>

          {/* ===== UNICORN HORN ===== */}
          <rect x="42" y="0" width="2" height="2" fill="#FFFACD"/>
          <rect x="41" y="2" width="2" height="2" fill="#FFD700"/>
          <rect x="40" y="4" width="2" height="2" fill="#FFD700"/>
          <rect x="39" y="6" width="2" height="2" fill="#FFA500"/>
          <rect x="42" y="1" width="1" height="1" fill="#FFFFFF"/>
          <rect x="40" y="5" width="1" height="1" fill="#FFFFFF"/>

          {/* ===== UNICORN EAR ===== */}
          <rect x="34" y="4" width="2" height="2" fill="#FFFFFF"/>
          <rect x="35" y="6" width="2" height="2" fill="#FFFFFF"/>
          <rect x="35" y="5" width="1" height="2" fill="#FFB6C1"/>

          {/* ===== UNICORN HEAD ===== */}
          <rect x="36" y="8" width="8" height="2" fill="#FFFFFF"/>
          <rect x="34" y="10" width="12" height="2" fill="#FFFFFF"/>
          <rect x="34" y="12" width="14" height="2" fill="#FFFFFF"/>
          <rect x="36" y="14" width="14" height="2" fill="#FFFFFF"/>
          <rect x="40" y="16" width="10" height="2" fill="#FFFFFF"/>
          <rect x="44" y="18" width="6" height="2" fill="#FFE4E1"/>

          {/* Eye */}
          <rect x="40" y="10" width="4" height="4" fill="#2D1B69"/>
          <rect x="41" y="10" width="2" height="2" fill="#FFFFFF"/>

          {/* Nostril */}
          <rect x="48" y="16" width="2" height="2" fill="#FFB6C1"/>

          {/* ===== RAINBOW MANE ===== */}
          <rect x="28" y="6" width="2" height="2" fill="#FF0000"/>
          <rect x="30" y="8" width="2" height="2" fill="#FF0000"/>
          <rect x="26" y="8" width="2" height="2" fill="#FF7F00"/>
          <rect x="28" y="10" width="2" height="2" fill="#FF7F00"/>
          <rect x="24" y="10" width="2" height="2" fill="#FFFF00"/>
          <rect x="26" y="12" width="2" height="2" fill="#FFFF00"/>
          <rect x="22" y="12" width="2" height="2" fill="#00FF00"/>
          <rect x="24" y="14" width="2" height="2" fill="#00FF00"/>
          <rect x="20" y="14" width="2" height="2" fill="#0080FF"/>
          <rect x="22" y="16" width="2" height="2" fill="#0080FF"/>
          <rect x="18" y="16" width="2" height="2" fill="#8B00FF"/>
          <rect x="20" y="18" width="2" height="2" fill="#8B00FF"/>

          {/* ===== NECK (connects head to body) ===== */}
          <rect x="30" y="16" width="8" height="2" fill="#FFFFFF"/>
          <rect x="28" y="18" width="10" height="2" fill="#FFFFFF"/>
          <rect x="26" y="20" width="10" height="2" fill="#FFFFFF"/>
          <rect x="24" y="22" width="10" height="2" fill="#FFFFFF"/>

          {/* ===== BODY ===== */}
          <rect x="10" y="22" width="18" height="2" fill="#FFFFFF"/>
          <rect x="8" y="24" width="24" height="2" fill="#FFFFFF"/>
          <rect x="6" y="26" width="28" height="2" fill="#FFFFFF"/>
          <rect x="6" y="28" width="30" height="2" fill="#FFFFFF"/>
          <rect x="6" y="30" width="30" height="2" fill="#FFFFFF"/>
          <rect x="8" y="32" width="26" height="2" fill="#FFFFFF"/>
          <rect x="10" y="34" width="22" height="2" fill="#FFFFFF"/>

          {/* Body shading */}
          <rect x="6" y="26" width="2" height="6" fill="#F0F0F0"/>
          <rect x="32" y="28" width="2" height="4" fill="#F8F8F8"/>

          {/* ===== RAINBOW TAIL ===== */}
          <rect x="2" y="24" width="2" height="2" fill="#FF0000"/>
          <rect x="0" y="26" width="2" height="2" fill="#FF0000"/>
          <rect x="4" y="26" width="2" height="2" fill="#FF7F00"/>
          <rect x="2" y="28" width="2" height="2" fill="#FFFF00"/>
          <rect x="0" y="30" width="2" height="2" fill="#00FF00"/>
          <rect x="4" y="30" width="2" height="2" fill="#0080FF"/>
          <rect x="2" y="32" width="2" height="2" fill="#8B00FF"/>
          <rect x="0" y="34" width="2" height="2" fill="#FF00FF"/>

          {/* ===== FOUR LEGS ===== */}
          {/* Front-left leg */}
          <rect x="12" y="34" width="4" height="2" fill="#FFFFFF"/>
          <rect x="12" y="36" width="4" height="2" fill="#FFFFFF"/>
          <rect x="12" y="38" width="4" height="2" fill="#FFFFFF"/>
          <rect x="12" y="40" width="4" height="2" fill="#FFFFFF"/>
          <rect x="11" y="42" width="6" height="2" fill="#333333"/>

          {/* Front-right leg */}
          <rect x="20" y="34" width="4" height="2" fill="#FFFFFF"/>
          <rect x="20" y="36" width="4" height="2" fill="#FFFFFF"/>
          <rect x="20" y="38" width="4" height="2" fill="#FFFFFF"/>
          <rect x="20" y="40" width="4" height="2" fill="#FFFFFF"/>
          <rect x="19" y="42" width="6" height="2" fill="#333333"/>

          {/* Back-left leg */}
          <rect x="28" y="34" width="4" height="2" fill="#FFFFFF"/>
          <rect x="28" y="36" width="4" height="2" fill="#FFFFFF"/>
          <rect x="28" y="38" width="4" height="2" fill="#FFFFFF"/>
          <rect x="28" y="40" width="4" height="2" fill="#FFFFFF"/>
          <rect x="27" y="42" width="6" height="2" fill="#333333"/>

          {/* Back-right leg */}
          <rect x="36" y="32" width="4" height="2" fill="#FFFFFF"/>
          <rect x="36" y="34" width="4" height="2" fill="#FFFFFF"/>
          <rect x="36" y="36" width="4" height="2" fill="#FFFFFF"/>
          <rect x="36" y="38" width="4" height="2" fill="#FFFFFF"/>
          <rect x="36" y="40" width="4" height="2" fill="#FFFFFF"/>
          <rect x="35" y="42" width="6" height="2" fill="#333333"/>

          {/* Leg shading */}
          <rect x="12" y="36" width="1" height="6" fill="#E8E8E8"/>
          <rect x="20" y="36" width="1" height="6" fill="#E8E8E8"/>
          <rect x="28" y="36" width="1" height="6" fill="#E8E8E8"/>
          <rect x="36" y="34" width="1" height="8" fill="#E8E8E8"/>

        </svg>
      </div>

      {/* Hello World Text */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center z-10">
        <h1
          className="pixel-font text-3xl md:text-5xl lg:text-6xl animate-bounce-slow"
          style={{
            color: '#FFD700',
            textShadow: '4px 4px 0 #8B4513, -2px -2px 0 #FFA500, 2px -2px 0 #FFA500, -2px 2px 0 #FFA500',
            WebkitTextStroke: '2px #8B4513',
          }}
        >
          WIZARD RUN
        </h1>
        <p className="pixel-font text-xs md:text-sm text-pink-300 mt-6 animate-pulse"
          style={{ textShadow: '2px 2px 0 #4B0082' }}>
          * WELCOME TO THE MYSTICAL LAND *
        </p>
        <Link
          href="/game"
          className="inline-block mt-8 px-6 py-3 pixel-font text-sm md:text-base transition-all hover:scale-105"
          style={{
            backgroundColor: '#8B00FF',
            color: '#FFD700',
            border: '4px solid #FFD700',
            boxShadow: '4px 4px 0 #4B0082, inset 2px 2px 0 rgba(255,255,255,0.3)',
            textShadow: '2px 2px 0 #4B0082',
          }}
        >
          PLAY NOW
        </Link>
      </div>

      {/* Leaderboard Button - Top Left */}
      <Link
        href="/leaderboard"
        className="absolute top-12 left-12 px-4 py-2 pixel-font text-xs md:text-sm transition-all hover:scale-105 z-20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: '#FFD700',
          border: '2px solid #FFD700',
          textShadow: '1px 1px 0 #4B0082',
        }}
      >
        🏆 LEADERBOARD 🏆
      </Link>

      {/* Floating pixel particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLE_POSITIONS.map((particle, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-70"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 2 2" style={{ imageRendering: 'pixelated' }}>
              <rect x="0" y="0" width="2" height="2" fill={PARTICLE_COLORS[i % 5]}/>
            </svg>
          </div>
        ))}
      </div>

      {/* Scanlines overlay for retro CRT effect */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      {/* Pixel border frame - NES style */}
      <div className="absolute inset-2 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
          <rect x="0" y="0" width="100" height="1" fill="#FFD700"/>
          <rect x="0" y="1" width="100" height="1" fill="#FFA500"/>
          <rect x="0" y="99" width="100" height="1" fill="#8B4513"/>
          <rect x="0" y="98" width="100" height="1" fill="#FFA500"/>
          <rect x="0" y="0" width="1" height="100" fill="#FFD700"/>
          <rect x="1" y="0" width="1" height="100" fill="#FFA500"/>
          <rect x="99" y="0" width="1" height="100" fill="#8B4513"/>
          <rect x="98" y="0" width="1" height="100" fill="#FFA500"/>
        </svg>
      </div>
    </main>
  );
}
