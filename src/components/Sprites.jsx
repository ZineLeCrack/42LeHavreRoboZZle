import React from 'react';

export const SPACE_BG = {
  backgroundImage: [
    'radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,0.8), transparent)',
    'radial-gradient(1px 1px at 90px 120px, rgba(255,255,255,0.6), transparent)',
    'radial-gradient(1.5px 1.5px at 160px 60px, rgba(255,255,255,0.7), transparent)',
    'radial-gradient(1px 1px at 60px 170px, rgba(255,255,255,0.5), transparent)',
    'linear-gradient(to bottom, #0b1020, #151a3d 55%, #1d1448)',
  ].join(', '),
  backgroundSize: '200px 200px, 200px 200px, 200px 200px, 200px 200px, 100% 100%',
};

export function Rocket({ angle = 0, className = "w-4/5 h-4/5" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={{ transform: `rotate(${angle}deg)`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}
    >
      <defs>
        <linearGradient id="rocket-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#b6c2d6" />
        </linearGradient>
      </defs>
      <g className="animate-pulse">
        <path d="M17 32 L3 24 Q8 32 3 40 Z" fill="#fb923c" />
        <path d="M17 32 L8 28 Q11 32 8 36 Z" fill="#fde047" />
      </g>
      <path d="M24 24 L12 12 L34 22 Z" fill="#ef4444" />
      <path d="M24 40 L12 52 L34 42 Z" fill="#ef4444" />
      <path
        d="M16 32 C16 24 28 20 40 21 C50 22 57 28 61 32 C57 36 50 42 40 43 C28 44 16 40 16 32 Z"
        fill="url(#rocket-body)"
        stroke="#94a3b8"
        stroke-width="1"
      />
      <path d="M49 23.5 C55 25.5 58.5 29 61 32 C58.5 35 55 38.5 49 40.5 C52 36 52 28 49 23.5 Z" fill="#ef4444" />
      <circle cx="35" cy="32" r="5.5" fill="#38bdf8" stroke="#0369a1" stroke-width="1.5" />
      <circle cx="33.3" cy="30.3" r="1.6" fill="#ffffff" fill-opacity="0.8" />
    </svg>
  );
}

export function Star({ className = "w-4/5 h-4/5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.85))" }}
    >
      <defs>
        <linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fef08a" />
          <stop offset="1" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"
        fill="url(#star-fill)"
        stroke="#d97706"
        stroke-width="0.8"
        stroke-linejoin="round"
      />
    </svg>
  );
}
