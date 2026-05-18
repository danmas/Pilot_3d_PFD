import React from 'react';
import { PFDFrame } from '../../types';

interface Props { frame: PFDFrame; }

export function AirspeedTape({ frame }: Props) {
  const { air, autopilot } = frame;
  const TAPE_COLOR = "#818181";
  const speed = air.cas ?? 207.8;
  const pxPerKnot = 4.5;

  const renderTicks = () => {
    const ticks = [];
    const minS = Math.floor(speed / 10) * 10 - 50;
    const maxS = Math.floor(speed / 10) * 10 + 50;

    for (let s = minS; s <= maxS; s += 10) {
      if (s < 0) continue;
      const y = (speed - s) * pxPerKnot;
      ticks.push(
        <g key={s} transform={`translate(0, ${y})`}>
          <line x1="205" y1="0" x2="195" y2="0" stroke="white" strokeWidth="2" />
          <text x="187" y="7" fill="white" fontSize="22" textAnchor="end" fontFamily="sans-serif">
            {s}
          </text>
          {s + 5 <= maxS && (
             <line x1="205" y1={-5 * pxPerKnot} x2="200" y2={-5 * pxPerKnot} stroke="white" strokeWidth="2" />
          )}
        </g>
      );
    }
    return ticks;
  };

  return (
    <g>
      {/* Background */}
      <rect x="150" y="60" width="55" height="460" fill={TAPE_COLOR} />
      
      {/* Tape */}
      <clipPath id="air-clip"><rect x="150" y="60" width="55" height="460" /></clipPath>
      <g clipPath="url(#air-clip)">
         <g transform="translate(0, 300)">
           {air.valid && renderTicks()}
         </g>
      </g>
      
      {/* Target top cyans */}
      <text x="177" y="45" fill="#00FFFF" fontSize="22" textAnchor="middle" fontFamily="sans-serif">
         {autopilot.selectedSpeed !== null ? Math.round(autopilot.selectedSpeed).toString().padStart(3, '0') : "000"}
      </text>

      {/* Current Value Marker - Thick yellow line extending from the tape right edge to the attitude center */}
      {air.valid && (
        <line x1="205" y1="300" x2="235" y2="300" stroke="#FFEA00" strokeWidth="4" />
      )}
    </g>
  );
}
