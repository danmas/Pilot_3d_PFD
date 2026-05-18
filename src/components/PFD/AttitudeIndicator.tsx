import React from 'react';
import { PFDFrame } from '../../types';

interface Props { frame: PFDFrame; }

export function AttitudeIndicator({ frame }: Props) {
  const { attitude, altitude } = frame;
  const cx = 400, cy = 300, r = 160;
  
  if (!attitude.valid) return null;

  const pitch = attitude.pitchDeg ?? 0;
  const roll = attitude.rollDeg ?? 0;
  
  const pitchScale = 6;
  const yTranslate = pitch * pitchScale;

  const SKY = "#316499";
  const GND = "#603c15";

  const renderPitchLadder = () => {
    const ticks = [];
    for (let p = -90; p <= 90; p += 5) {
      if (p === 0) continue;
      const y = -p * pitchScale;
      const isMajor = p % 10 === 0;
      if (isMajor) {
        ticks.push(
          <g key={p} transform={`translate(0, ${y})`}>
            <line x1="-35" y1="0" x2="-20" y2="0" stroke="white" strokeWidth="2" />
            <line x1="20" y1="0" x2="35" y2="0" stroke="white" strokeWidth="2" />
            {p === 10 || p === 20 || p === -10 || p === -20 ? ( // side drops
                <>
                  <line x1="-35" y1="0" x2="-35" y2={p > 0 ? 8 : -8} stroke="white" strokeWidth="2" />
                  <line x1="35" y1="0" x2="35" y2={p > 0 ? 8 : -8} stroke="white" strokeWidth="2" />
                </>
            ): null}
            <text x="-42" y="6" fill="white" fontSize="18" textAnchor="end" fontFamily="sans-serif">{Math.abs(p)}</text>
            <text x="42" y="6" fill="white" fontSize="18" textAnchor="start" fontFamily="sans-serif">{Math.abs(p)}</text>
          </g>
        );
      } else {
        ticks.push(<line key={p} x1="-10" y1={-p * pitchScale} x2="10" y2={-p * pitchScale} stroke="white" strokeWidth="2" />);
      }
    }
    return ticks;
  };

  const renderRollScaleTicks = () => {
    return [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map(angle => {
      let tick;
      if (Math.abs(angle) === 10 || Math.abs(angle) === 20) {
        tick = <polygon points="0,-160 -5,-150 5,-150" fill="none" stroke="white" strokeWidth="2" />;
      } else if (Math.abs(angle) === 30 || Math.abs(angle) === 60) {
        tick = <polygon points="0,-160 -8,-142 8,-142" fill="none" stroke="white" strokeWidth="2" />;
      } else if (Math.abs(angle) === 45) {
        tick = <line x1="0" y1="-160" x2="0" y2="-145" stroke="white" strokeWidth="2" />;
      }
      return <g key={angle} transform={`rotate(${angle})`}>{tick}</g>;
    });
  }

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <defs>
        <clipPath id="att-clip"><circle cx="0" cy="0" r="160" /></clipPath>
      </defs>
      
      {/* Rotating Background & Pitch */}
      <g clipPath="url(#att-clip)">
        <g transform={`rotate(${-roll}) translate(0, ${yTranslate})`}>
          <rect x="-250" y="-300" width="500" height="600" fill={SKY} />
          <rect x="-250" y="0" width="500" height="300" fill={GND} />
          <line x1="-250" y1="0" x2="250" y2="0" stroke="white" strokeWidth="2" />
          {renderPitchLadder()}
        </g>
      </g>

      {/* Fixed Roll Scale Line */}
      <path d={`M ${-160 * Math.sin(60*Math.PI/180)} ${-160 * Math.cos(60*Math.PI/180)} A 160 160 0 0 1 ${160 * Math.sin(60*Math.PI/180)} ${-160 * Math.cos(60*Math.PI/180)}`} fill="none" stroke="white" strokeWidth="2" />
      {renderRollScaleTicks()}
      
      {/* Target Fixed Yellow Triangle Top */}
      <polygon points="0,-160 -10,-140 10,-140" fill="none" stroke="#FFEA00" strokeWidth="3" />

      {/* Rotating Roll Pointer beneath */}
      <g transform={`rotate(${-roll})`}>
        <g transform="translate(0, -140)">
           <polygon points="0,0 -12,18 12,18" fill="none" stroke="#FFEA00" strokeWidth="3" />
           <line x1="-25" y1="18" x2="25" y2="18" stroke="#FFEA00" strokeWidth="3" />
           {/* Red X slip indicator */}
           <path d="M-10,-5 L10,12 M-10,12 L10,-5" stroke="red" strokeWidth="3" opacity="0.8" />
        </g>
      </g>

      {/* Horizon Side Pointers Fixed */}
      <path d="M -160 0 L -175 -8 L -175 8 Z" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 160 0 L 175 -8 L 175 8 Z" fill="none" stroke="white" strokeWidth="2" />
      
      {/* FD Crosshairs */}
      <line x1="-100" y1="0" x2="100" y2="0" stroke="#00FF00" strokeWidth="1.5" />
      <line x1="0" y1="-100" x2="0" y2="100" stroke="#00FF00" strokeWidth="1.5" />

      {/* Center Aircraft */}
      <path d="M -130 0 L -40 0 L -40 18 L -25 18 L -25 4 L -130 4 Z" fill="black" stroke="#FFEA00" strokeWidth="2" />
      <path d="M 130 0 L 40 0 L 40 18 L 25 18 L 25 4 L 130 4 Z" fill="black" stroke="#FFEA00" strokeWidth="2" />
      <rect x="-5" y="-5" width="10" height="10" fill="black" stroke="#FFEA00" strokeWidth="2" />

      {/* Radio Altimeter Box at Bottom */}
      {altitude.valid && (
        <g transform="translate(0, 160)">
          <rect x="-40" y="-18" width="80" height="30" fill="black" />
          <text x="0" y="5" fill="#00FF00" fontSize="24" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            {altitude.radioAlt !== null ? Math.round(altitude.radioAlt) : "5120"}
          </text>
        </g>
      )}
    </g>
  );
}
