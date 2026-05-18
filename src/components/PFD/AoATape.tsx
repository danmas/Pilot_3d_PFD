import React from 'react';
import { PFDFrame } from '../../types';

interface Props { frame: PFDFrame; }

export function AoATape({ frame }: Props) {
  const TAPE_COLOR = "#818181";
  const aoa = 4.6; 

  const getAoAY = (v: number) => {
    return (4.6 - v) * 16.5; 
  };

  return (
    <g>
      {/* Tape shape points left */}
      <path d="M 120 160 L 120 440 L 90 440 L 70 390 L 70 210 L 90 160 Z" fill={TAPE_COLOR} />
      
      {/* Top Green Number */}
      <text x="100" y="145" fill="#00FF00" fontSize="20" textAnchor="middle" fontFamily="sans-serif">
        {aoa.toFixed(1)}
      </text>

      <g transform="translate(0, 300)">
        {/* Ticks 20 to -5 */}
         <clipPath id="aoa-clip">
            <path d="M 120 -140 L 120 140 L 90 140 L 70 90 L 70 -90 L 90 -140 Z" />
         </clipPath>
         <g clipPath="url(#aoa-clip)">
            {[20, 15, 10, 5, 0, -5].map(v => (
            <g key={v} transform={`translate(0, ${getAoAY(v)})`}>
                <line x1="110" y1="0" x2="120" y2="0" stroke="white" strokeWidth="2" />
                <text x="105" y="7" fill="white" fontSize="20" textAnchor="end" fontFamily="sans-serif">{v}</text>
            </g>
            ))}
        </g>
      </g>
      
      {/* Green pointer line originating from left outside the tape */}
      <path d={`M 60 300 L 120 300`} stroke="#00FF00" strokeWidth="3" />
      
      {/* Bottom G meter text */}
      <text x="65" y="495" fill="white" fontSize="24" fontFamily="sans-serif">G</text>
      <text x="115" y="495" fill="#FF9800" fontSize="24" textAnchor="end" fontFamily="sans-serif" fontWeight="bold">- -</text>
    </g>
  );
}
