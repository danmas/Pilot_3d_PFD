import React from 'react';
import { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';

interface Props { frame: TelemetryFrame; }

export function AirspeedTape({ frame }: Props) {
  const TAPE_COLOR = "#818181";
  const speed = (frame.CAS as number) ?? 207.8;
  const valid = Number.isFinite(frame.CAS as number);
  const selectedSpeed = (frame.SpeedSelect as number) ?? null;
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
      <SvgTooltipGroup
        description="Лента приборной скорости — CAS (Calibrated Airspeed), узлы."
        frameVariables={['CAS']}
      >
        {/* Background */}
        <rect x="150" y="60" width="55" height="460" fill={TAPE_COLOR} />
        
        {/* Tape */}
        <clipPath id="air-clip"><rect x="150" y="60" width="55" height="460" /></clipPath>
        <g clipPath="url(#air-clip)">
           <g transform="translate(0, 300)">
             {valid && renderTicks()}
           </g>
        </g>
      </SvgTooltipGroup>
      
      {/* Target top cyans */}
      <SvgTooltipGroup
        description="Заданная скорость автопилота (Selected Speed), узлы."
        frameVariables={['SpeedSelect']}
      >
        <text x="177" y="45" fill="#00FFFF" fontSize="22" textAnchor="middle" fontFamily="sans-serif">
           {selectedSpeed !== null ? Math.round(selectedSpeed).toString().padStart(3, '0') : "000"}
        </text>
      </SvgTooltipGroup>

      {/* Center Black Indicator Box for Speed */}
      {valid && (
        <SvgTooltipGroup
          transform="translate(150, 300)"
          description="Текущая приборная скорость (CAS). Жёлтая линия — тренд изменения скорости."
          frameVariables={['CAS']}
        >
          {/* Black box pointing left */}
          <path d="M 0 0 L 15 -25 L 90 -25 L 90 25 L 15 25 Z" fill="black" stroke="white" strokeWidth="1" transform="translate(-85, 0)" />
          
          <text x="-40" y="8" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            {Math.round(speed)}
          </text>

          {/* Yellow trend / pointer line */}
          <line x1="-10" y1="0" x2="85" y2="0" stroke="#FFEA00" strokeWidth="3" />
        </SvgTooltipGroup>
      )}
    </g>
  );
}
