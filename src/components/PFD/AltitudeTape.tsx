import React from 'react';
import { TelemetryFrame } from '../../types';

interface Props { frame: TelemetryFrame; }

export function AltitudeTape({ frame }: Props) {
  const TAPE_COLOR = "#818181";
  
  const baroAltFt = (frame.dec_BaroAltFt as number) ?? null;
  const radioAltFt = (frame.dec_RadioAltFt as number) ?? null;
  const baroAltM = (frame.BaroAltitude as number) ?? null;
  const selectedAltFt = (frame.StandardAltitude as number) ?? null;
  
  const displayAlt = baroAltFt ?? radioAltFt ?? 12000;
  const metricAlt = baroAltM ?? displayAlt * 0.3048;
  const pxPerFt = 0.55; 

  const renderTicks = () => {
    const ticks = [];
    const minA = Math.floor(displayAlt / 100) * 100 - 400;
    const maxA = Math.floor(displayAlt / 100) * 100 + 400;

    for (let a = minA; a <= maxA; a += 100) {
      if (a < -1000) continue;
      const y = (displayAlt - a) * pxPerFt;
      let val100 = Math.floor(a / 100);
      
      ticks.push(
        <g key={a} transform={`translate(0, ${y})`}>
          <line x1="600" y1="0" x2="610" y2="0" stroke="white" strokeWidth="2" />
          <text x="645" y="7" fill="white" fontSize="22" textAnchor="end" fontFamily="sans-serif">
            {val100}
          </text>
          {a + 50 <= maxA && (
            <line x1="600" y1={-50 * pxPerFt} x2="605" y2={-50 * pxPerFt} stroke="white" strokeWidth="2" />
          )}
        </g>
      );
    }
    return ticks;
  };

  return (
    <g>
      <title>Лента барометрической высоты — сотни футов.
      Источник: dec_BaroAltFt, dec_RadioAltFt</title>
      {/* Background */}
      <rect x="600" y="60" width="55" height="460" fill={TAPE_COLOR} />

      <clipPath id="alt-clip"><rect x="600" y="60" width="55" height="460" /></clipPath>
      <g clipPath="url(#alt-clip)">
        <g transform="translate(0, 300)">
          {renderTicks()}
        </g>
      </g>

      {/* Target alt cyans */}
      <g>
        <title>Заданная высота автопилота (Selected Altitude), футы.
        Источник: StandardAltitude</title>
        <text x="627" y="45" fill="#00FFFF" fontSize="22" textAnchor="middle" fontFamily="sans-serif">
          {selectedAltFt !== null ? Math.round(selectedAltFt) : "0200"}
        </text>
      </g>
      
      {/* Bottom zeros */}
      <text x="627" y="550" fill="#00FFFF" fontSize="22" textAnchor="middle" fontFamily="sans-serif">000</text>

      {/* Center Black Indicator Box */}
      <g transform="translate(560, 300)">
        <title>Текущая барометрическая высота. Зелёный текст — высота в метрах.
        Источник: dec_BaroAltFt, BaroAltitude</title>
        <path d="M0,0 L15,-35 L100,-35 L100,35 L15,35 Z" fill="black" stroke="#FFEA00" strokeWidth="2" />
        <line x1="15" y1="-12" x2="100" y2="-12" stroke="#FFEA00" strokeWidth="1" />
        
        {/* Metric Alt */}
        <text x="95" y="-16" fill="#00FF00" fontSize="18" textAnchor="end" fontFamily="sans-serif">
          {Math.round(metricAlt)} M
        </text>

        {/* Main Alt text */}
        <text x="50" y="24" fill="#00FF00" fontSize="34" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">
          {Math.floor(displayAlt / 100)}
        </text>
        <text x="52" y="14" fill="#00FF00" fontSize="22" textAnchor="start" fontFamily="sans-serif">00</text>
        <text x="52" y="-4" fill="#00FF00" fontSize="14" fillOpacity="0.8" textAnchor="start" fontFamily="sans-serif">20</text>
        <text x="52" y="32" fill="#00FF00" fontSize="14" fillOpacity="0.8" textAnchor="start" fontFamily="sans-serif">80</text>
        
        {/* Needle pointing Right */}
        <line x1="-25" y1="0" x2="0" y2="0" stroke="white" strokeWidth="2" /> 
      </g>
    </g>
  );
}
