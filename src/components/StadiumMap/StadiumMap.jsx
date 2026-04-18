import React, { useState, useRef, useEffect } from 'react';
import './StadiumMap.css';

function getDensityColor(density) {
  if (density === 'high') return '#ff0077';
  if (density === 'medium') return '#f59e0b';
  return '#00ffaa';
}

function getDensityGlow(density) {
  if (density === 'high') return 'rgba(255,0,119,0.6)';
  if (density === 'medium') return 'rgba(245,158,11,0.6)';
  return 'rgba(0,255,170,0.6)';
}

// Zone positions in the new layout
const ZONES = [
  {
    id: 'zone-main-stage',
    label: 'Main Stage',
    icon: '🎤',
    shape: 'arc', // top arc seating block
    x: 160, y: 48, w: 280, h: 55, rx: 8,
  },
  {
    id: 'zone-vip',
    label: 'VIP',
    icon: '⭐',
    shape: 'rect',
    x: 460, y: 130, w: 80, h: 140, rx: 10,
  },
  {
    id: 'zone-food-court',
    label: 'Food Court',
    icon: '🍔',
    shape: 'rect',
    x: 60, y: 130, w: 80, h: 140, rx: 10,
  },
  {
    id: 'zone-merch-north',
    label: 'Merch',
    icon: '🛍️',
    shape: 'rect',
    x: 100, y: 310, w: 90, h: 55, rx: 8,
  },
  {
    id: 'zone-medical',
    label: 'Medical',
    icon: '🏥',
    shape: 'rect',
    x: 255, y: 315, w: 90, h: 55, rx: 8,
  },
  {
    id: 'zone-parking-a',
    label: 'Parking',
    icon: '🅿️',
    shape: 'rect',
    x: 410, y: 310, w: 90, h: 55, rx: 8,
  },
];

export default function StadiumMap({ zones = {}, isMini = false, onExpand }) {
  const [hovered, setHovered] = useState(null);
  const [scanY, setScanY] = useState(50);
  const animRef = useRef(null);

  useEffect(() => {
    if (isMini) return;
    let y = 50;
    let dir = 1;
    animRef.current = setInterval(() => {
      y += dir * 1.2;
      if (y > 370) dir = -1;
      if (y < 50) dir = 1;
      setScanY(y);
    }, 16);
    return () => clearInterval(animRef.current);
  }, [isMini]);

  const getZoneData = (id) => zones[id] || {};

  return (
    <div
      className={`smap-wrap ${isMini ? 'smap-mini' : 'smap-full'}`}
      onClick={isMini ? onExpand : undefined}
    >
      <svg
        viewBox="0 0 600 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="sfglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="bl" />
            <feMerge><feMergeNode in="bl" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="sfglow-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="bl" />
            <feMerge><feMergeNode in="bl" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="sfglow-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="bl" />
            <feMerge><feMergeNode in="bl" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Grass gradient */}
          <radialGradient id="grassGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e5c30" />
            <stop offset="60%" stopColor="#174d27" />
            <stop offset="100%" stopColor="#0f3318" />
          </radialGradient>

          {/* Outer track gradient */}
          <radialGradient id="trackGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Zone gradients */}
          {ZONES.map(z => {
            const d = getZoneData(z.id);
            const color = getDensityColor(d.density);
            return (
              <linearGradient key={`grad-${z.id}`} id={`grad-${z.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.5" />
              </linearGradient>
            );
          })}

          {/* Clip path for stadium boundary */}
          <clipPath id="stadiumClip">
            <ellipse cx="300" cy="210" rx="285" ry="182" />
          </clipPath>
        </defs>

        {/* ─── Background ─── */}
        <ellipse cx="300" cy="210" rx="295" ry="190" fill="rgba(8,10,18,0.8)" />
        <ellipse cx="300" cy="210" rx="285" ry="182" fill="rgba(12,16,28,0.9)" />

        {/* ─── Seating bowl rings ─── */}
        {[1, 0.75, 0.5].map((s, i) => (
          <ellipse
            key={i}
            cx="300" cy="210"
            rx={260 * s} ry={165 * s}
            fill="none"
            stroke={`rgba(255,255,255,${0.04 - i * 0.01})`}
            strokeWidth={i === 0 ? 18 : 10}
          />
        ))}

        {/* ─── Running track ─── */}
        <ellipse cx="300" cy="210" rx="192" ry="120" fill="none"
          stroke="rgba(200,160,80,0.15)" strokeWidth="8" />

        {/* ─── Pitch/Field ─── */}
        <ellipse cx="300" cy="210" rx="182" ry="112" fill="url(#grassGrad)" />

        {/* Pitch lines */}
        <ellipse cx="300" cy="210" rx="182" ry="112" fill="none"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <line x1="300" y1="100" x2="300" y2="320"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <ellipse cx="300" cy="210" rx="40" ry="28" fill="none"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {/* Center dot */}
        <circle cx="300" cy="210" r="4" fill="rgba(255,255,255,0.3)"
          filter="url(#sfglow-sm)" />
        {/* Goal boxes */}
        <rect x="254" y="100" width="92" height="28" fill="none"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <rect x="254" y="292" width="92" height="28" fill="none"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />

        {/* Corner arcs */}
        {[[-180, 100], [0, 100], [-180, 320], [0, 320]].map(([rotate, cy], i) => (
          <path key={i}
            d={`M ${118 + (i % 2) * 364} ${cy} a 14 14 0 0 ${i % 2 === 0 ? 1 : 0} 14 14`}
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"
          />
        ))}

        {/* ─── Scanning line (full map only) ─── */}
        {!isMini && (
          <line
            x1="15" y1={scanY} x2="585" y2={scanY}
            stroke="rgba(0,255,170,0.15)"
            strokeWidth="1"
            filter="url(#sfglow-sm)"
            clipPath="url(#stadiumClip)"
          />
        )}

        {/* ─── Zone overlays ─── */}
        {ZONES.map(z => {
          const d = getZoneData(z.id);
          if (!d.density && !isMini) return null;
          const color = getDensityColor(d.density);
          const glow = getDensityGlow(d.density);
          const isHovered = hovered === z.id;
          const alpha = isMini ? 0.5 : isHovered ? 0.85 : 0.65;

          return (
            <g key={z.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(z.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={z.x} y={z.y}
                width={z.w} height={z.h}
                rx={z.rx}
                fill={`url(#grad-${z.id})`}
                opacity={alpha}
                filter={isHovered ? 'url(#sfglow-lg)' : 'url(#sfglow)'}
                style={{ transition: 'opacity 0.3s' }}
              />
              {!isMini && (
                <>
                  <text
                    x={z.x + z.w / 2}
                    y={z.y + z.h / 2 - 6}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isHovered ? 12 : 10}
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight="700"
                    letterSpacing="1"
                    style={{ transition: 'font-size 0.2s', pointerEvents: 'none' }}
                  >
                    {z.label}
                  </text>
                  {d.currentOccupancy && (
                    <text
                      x={z.x + z.w / 2}
                      y={z.y + z.h / 2 + 12}
                      textAnchor="middle"
                      fill={color}
                      fontSize="8"
                      fontFamily="Space Grotesk, sans-serif"
                      fontWeight="600"
                      style={{ pointerEvents: 'none' }}
                    >
                      {d.currentOccupancy?.toLocaleString()} ppl
                    </text>
                  )}
                </>
              )}

              {/* Hover tooltip */}
              {isHovered && !isMini && d.currentOccupancy && (
                <g>
                  <rect
                    x={z.x + z.w / 2 - 65} y={z.y - 46}
                    width="130" height="34"
                    rx="6"
                    fill="rgba(0,0,0,0.85)"
                    stroke={color}
                    strokeWidth="0.8"
                  />
                  <text
                    x={z.x + z.w / 2} y={z.y - 28}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {d.currentOccupancy?.toLocaleString()} / {d.maxCapacity?.toLocaleString()} •{' '}
                    <tspan fill={color}>{(d.density || '').toUpperCase()}</tspan>
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ─── Stadium entrance markers ─── */}
        {!isMini && [
          { x: 300, y: 22, label: 'N' },
          { x: 300, y: 398, label: 'S' },
          { x: 10, y: 210, label: 'W' },
          { x: 590, y: 210, label: 'E' },
        ].map(({ x, y, label }) => (
          <g key={label}>
            <circle cx={x} cy={y} r="12"
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1" />
            <text x={x} y={y + 4} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="9"
              fontFamily="Space Grotesk" fontWeight="700">
              {label}
            </text>
          </g>
        ))}

        {/* ─── Mini overlay prompt ─── */}
        {isMini && (
          <g>
            <rect x="175" y="180" width="250" height="60" rx="10"
              fill="rgba(0,0,0,0.65)"
              stroke="rgba(0,255,170,0.5)"
              strokeWidth="1" />
            <text x="300" y="207" textAnchor="middle"
              fill="rgba(0,255,170,1)" fontSize="10"
              fontFamily="Space Grotesk" fontWeight="700" letterSpacing="3">
              EXPAND ATLAS
            </text>
            <text x="300" y="228" textAnchor="middle"
              fill="rgba(255,255,255,0.35)" fontSize="8"
              fontFamily="Space Grotesk" letterSpacing="1">
              Click to view full map
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {!isMini && (
        <div className="smap-legend">
          {[
            { color: '#00ffaa', label: 'Low Density' },
            { color: '#f59e0b', label: 'Medium' },
            { color: '#ff0077', label: 'High / Critical' },
          ].map(({ color, label }) => (
            <div key={label} className="smap-legend-item">
              <span className="smap-legend-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
