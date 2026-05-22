import React from 'react';
import { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';

interface Props { frame: TelemetryFrame; }

export function AoATape({ frame }: Props) {
  const TAPE_COLOR = "#818181";
  const aoa = (frame.AoA as number) ?? 4.6; 
  const g = (frame.dec_G as number) ?? null;

  const getAoAY = (v: number) => {
    return (aoa - v) * 16.5; 
  };

  return (
    <g>
      <SvgTooltipGroup
        description="Шкала угла атаки (AoA — Angle of Attack), градусы."
        frameVariables={['AoA']}
      >
        {/* Tape shape points left */}
        <path d="M 120 160 L 120 440 L 90 440 L 70 390 L 70 210 L 90 160 Z" fill={TAPE_COLOR} />
      </SvgTooltipGroup>
      
      {/* Top Green Number */}
      <SvgTooltipGroup
        description="Текущий угол атаки — угол между крылом и набегающим потоком, градусы."
        frameVariables={['AoA']}
      >
        <text x="100" y="145" fill="#00FF00" fontSize="20" textAnchor="middle" fontFamily="sans-serif">
          {aoa.toFixed(1)}
        </text>
      </SvgTooltipGroup>

      <g transform="translate(0, 300)">
        {/* Ticks 20 to -5 */}
         <clipPath id="aoa-clip">
            <path d="M 120 -140 L 120 140 L 90 140 L 70 90 L 70 -90 L 90 -140 Z" />
         </clipPath>
         <SvgTooltipGroup
           clipPath="url(#aoa-clip)"
           description="Деления шкалы AoA в градусах."
           frameVariables={['AoA']}
         >
            {[20, 15, 10, 5, 0, -5].map(v => (
            <g key={v} transform={`translate(0, ${getAoAY(v)})`}>
                <line x1="110" y1="0" x2="120" y2="0" stroke="white" strokeWidth="2" />
                <text x="105" y="7" fill="white" fontSize="20" textAnchor="end" fontFamily="sans-serif">{v}</text>
            </g>
            ))}
        </SvgTooltipGroup>
      </g>
      
      {/* Green pointer line originating from left outside the tape */}
      <SvgTooltipGroup
        description="Зелёный указатель текущего AoA на шкале."
        frameVariables={['AoA']}
      >
        <path d={`M 60 300 L 120 300`} stroke="#00FF00" strokeWidth="3" />
      </SvgTooltipGroup>
      
      {/* Bottom G meter text */}
      <SvgTooltipGroup
        description="Перегрузка G — текущая вертикальная перегрузка."
        frameVariables={['dec_G']}
      >
        <text x="65" y="495" fill="white" fontSize="24" fontFamily="sans-serif">G</text>
        <text x="115" y="495" fill={g !== null ? "white" : "#FF9800"} fontSize="24" textAnchor="end" fontFamily="sans-serif" fontWeight="bold">
          {g !== null ? g.toFixed(1) : "- -"}
        </text>
      </SvgTooltipGroup>
    </g>
  );
}
