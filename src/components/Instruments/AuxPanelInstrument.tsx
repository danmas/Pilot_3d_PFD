import React from 'react';
import type { PFDFrame } from '../../types';
import { registerInstrument } from '../PanelBuilder/registry';

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const arcs = [
  // left side (ny)
  { r: 160, start: 185, end: 220, color: '#FF0000' },
  { r: 160, start: 220, end: 240, color: '#FFA500' },
  { r: 160, start: 240, end: 330, color: '#FFFFFF' },
  { r: 160, start: 330, end: 345, color: '#FFA500' },
  { r: 160, start: 345, end: 355, color: '#FF0000' },

  // right side (alpha)
  { r: 160, start: 4, end: 50, color: '#FF0000' },
  { r: 160, start: 50, end: 70, color: '#FFA500' },
  { r: 160, start: 70, end: 140, color: '#FFFFFF' },
  { r: 160, start: 140, end: 155, color: '#FFA500' },
  { r: 160, start: 155, end: 175, color: '#FF0000' },

  // cyan bracket
  { r: 170, start: 65, end: 130, color: '#00FFFF' }
];

function LoadsGauge({ frame }: { frame: PFDFrame }) {
  const ny = frame.loads.ny !== null ? frame.loads.ny + 1 : 1.0;
  const alpha = frame.air.aoaDeg !== null ? frame.air.aoaDeg : 4.7;

  const angleNy = 240 + (ny * 30);
  const angleAlpha = 120 - (alpha * (30 / 9));

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="200" cy="200" r="195" fill="black" />

      {/* Draw main outer rims */}
      {arcs.map((a, i) => (
        <path key={i} d={describeArc(200, 200, a.r, a.start, a.end)} fill="none" stroke={a.color} strokeWidth="6" />
      ))}

      {/* Cyan bracket inner ticks */}
      <line x1={polarToCartesian(200, 200, 170, 65).x} y1={polarToCartesian(200, 200, 170, 65).y} x2={polarToCartesian(200, 200, 160, 65).x} y2={polarToCartesian(200, 200, 160, 65).y} stroke="#00FFFF" strokeWidth="2" />
      <line x1={polarToCartesian(200, 200, 170, 130).x} y1={polarToCartesian(200, 200, 170, 130).y} x2={polarToCartesian(200, 200, 160, 130).x} y2={polarToCartesian(200, 200, 160, 130).y} stroke="#00FFFF" strokeWidth="2" />

      {/* Labels Ny */}
      <text x={polarToCartesian(200, 200, 120, 240).x} y={polarToCartesian(200, 200, 120, 240).y + 8} fill="white" fontSize="24" textAnchor="middle" fontFamily="sans-serif">0</text>
      <text x={polarToCartesian(200, 200, 120, 330).x} y={polarToCartesian(200, 200, 120, 330).y + 8} fill="white" fontSize="24" textAnchor="middle" fontFamily="sans-serif">3</text>

      {/* Labels Alpha */}
      <text x={polarToCartesian(200, 200, 110, 120).x} y={polarToCartesian(200, 200, 110, 120).y + 8} fill="white" fontSize="24" textAnchor="middle" fontFamily="sans-serif">0</text>
      <text x={polarToCartesian(200, 200, 110, 90).x} y={polarToCartesian(200, 200, 110, 90).y + 8} fill="white" fontSize="24" textAnchor="middle" fontFamily="sans-serif">9</text>
      <text x={polarToCartesian(200, 200, 110, 70).x} y={polarToCartesian(200, 200, 110, 70).y + 8} fill="white" fontSize="24" textAnchor="middle" fontFamily="sans-serif">15</text>

      {/* Cyan [1 for Ny */}
      <text x="50" y="209" fill="#00FFFF" fontSize="26" fontFamily="sans-serif" textAnchor="middle">1</text>
      <path d="M 40 185 L 25 185 L 25 215 L 40 215" fill="none" stroke="#00FFFF" strokeWidth="2" />

      {/* Center Labels */}
      <text x="170" y="145" fill="white" fontSize="26" textAnchor="middle" fontFamily="serif">ny</text>
      <text x="230" y="145" fill="white" fontSize="28" textAnchor="middle" fontFamily="serif">α</text>

      {/* Digital Boxes */}
      <g transform="translate(90, 240)">
        <rect x="0" y="0" width="80" height="40" rx="8" ry="8" fill="none" stroke="#555" strokeWidth="2" />
        <text x="40" y="28" fill="white" fontSize="28" textAnchor="middle" fontFamily="monospace">
          {ny.toFixed(1)}
        </text>
      </g>
      <g transform="translate(230, 240)">
        <rect x="0" y="0" width="80" height="40" rx="8" ry="8" fill="none" stroke="#555" strokeWidth="2" />
        <text x="40" y="28" fill="white" fontSize="28" textAnchor="middle" fontFamily="monospace">
          {alpha.toFixed(1)}
        </text>
      </g>

      {/* Reset Button */}
      <g transform="translate(150, 310)">
        <rect x="0" y="0" width="100" height="35" rx="10" ry="10" fill="none" stroke="#555" strokeWidth="2" />
        <text x="50" y="25" fill="#aaa" fontSize="22" textAnchor="middle" fontFamily="sans-serif">RESET</text>
      </g>

      {/* Needles */}
      <g transform={`translate(200, 200) rotate(${angleNy - 270})`}>
        <path d="M -2 -8 A 8 8 0 0 0 -2 8 Z" fill="#00FF00" />
        <line x1="-2" y1="0" x2="-140" y2="0" stroke="#00FF00" strokeWidth="3" />
      </g>
      <g transform={`translate(200, 200) rotate(${angleAlpha - 90})`}>
        <path d="M 2 -8 A 8 8 0 0 1 2 8 Z" fill="#00FF00" />
        <line x1="2" y1="0" x2="140" y2="0" stroke="#00FF00" strokeWidth="3" />
      </g>
    </svg>
  );
}

function ControlGrid({ frame }: { frame: PFDFrame }) {
  const roll = frame.attitude.rollDeg || 0;
  const pitch = frame.attitude.pitchDeg || 0;

  const xVal = Math.max(-1, Math.min(1, roll / 45));
  const yVal = Math.max(-1, Math.min(1, pitch / 20));

  const px = 200 + xVal * 150;
  const py = 200 - yVal * 150;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect x="50" y="50" width="300" height="300" fill="black" stroke="white" strokeWidth="2" />

      {/* Grid lines */}
      {[125, 200, 275].map(v => (
        <React.Fragment key={v}>
          <line x1="50" y1={v} x2="350" y2={v} stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={v} y1="50" x2={v} y2="350" stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
        </React.Fragment>
      ))}

      <text x="50" y="40" fill="white" fontSize="18" textAnchor="middle" fontFamily="monospace">-1</text>
      <text x="125" y="40" fill="white" fontSize="18" textAnchor="middle" fontFamily="monospace">-0.5</text>
      <text x="200" y="40" fill="white" fontSize="18" textAnchor="middle" fontFamily="monospace">0</text>
      <text x="275" y="40" fill="white" fontSize="18" textAnchor="middle" fontFamily="monospace">+0.5</text>
      <text x="350" y="40" fill="white" fontSize="18" textAnchor="middle" fontFamily="monospace">+1</text>

      <text x="40" y="55" fill="white" fontSize="18" textAnchor="end" fontFamily="monospace">+1</text>
      <text x="40" y="130" fill="white" fontSize="18" textAnchor="end" fontFamily="monospace">0.5</text>
      <text x="40" y="205" fill="white" fontSize="18" textAnchor="end" fontFamily="monospace">0</text>
      <text x="40" y="280" fill="white" fontSize="18" textAnchor="end" fontFamily="monospace">0.5</text>
      <text x="40" y="355" fill="white" fontSize="18" textAnchor="end" fontFamily="monospace">-1</text>

      <text x="50" y="380" fill="#FF00FF" fontSize="24" textAnchor="middle" fontWeight="bold">L</text>
      <text x="350" y="380" fill="#00FF00" fontSize="24" textAnchor="middle" fontWeight="bold">R</text>

      {/* Green crosshairs */}
      <line x1={px} y1="50" x2={px} y2="350" stroke="#00FF00" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="50" y1={py} x2="350" y2={py} stroke="#00FF00" strokeWidth="2" strokeDasharray="2 2" />

      {/* Dynamic labels */}
      <text x={px} y={368} fill="#00FF00" fontSize="16" textAnchor="middle" fontFamily="monospace">{(xVal < 0 && xVal > -0.1) ? "-0.0" : xVal.toFixed(1)}</text>
      <text x={358} y={py + 5} fill="#00FF00" fontSize="16" textAnchor="start" fontFamily="monospace">{(yVal > 0 && yVal < 0.1) ? "-0.0" : yVal.toFixed(1)}</text>

      {/* Center dot */}
      <circle cx={px} cy={py} r="6" fill="#00FF00" />
    </svg>
  );
}

const AuxPanelInstrument: React.FC<{ frame: PFDFrame }> = ({ frame }) => {
  return (
    <div className="w-full h-full relative bg-[#050505] font-sans flex flex-row items-center justify-center select-none overflow-hidden">
      <ControlGrid frame={frame} />
      <LoadsGauge frame={frame} />
    </div>
  );
};

registerInstrument({
  id: 'aux-panel',
  name: 'Aux Panel',
  iconName: 'Gauge',
  Component: AuxPanelInstrument,
});

export default AuxPanelInstrument;
