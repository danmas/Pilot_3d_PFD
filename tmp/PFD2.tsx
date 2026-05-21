import React from 'react';
import { PFDFrame } from '../../types';

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export function PFD2({ frame }: { frame: PFDFrame }) {
  const { attitude } = frame;
  const pitch = attitude.pitchDeg ?? 0;
  const roll = attitude.rollDeg ?? 0;

  const pxPerDegPitch = 8;
  const pitchOffset = pitch * pxPerDegPitch;

  // Animate slip slightly for effect since we don't have slip data
  const slipOffset = roll ? -(roll / 45) * 15 : 0; 

  // Animate Flight Director bars slightly to look active
  const fdPitchOffset = Math.sin(Date.now() / 1500) * 15;
  const fdRollAngle = Math.cos(Date.now() / 2000) * 10;
  
  return (
    <div className="w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center p-8 select-none overflow-hidden">
      <svg width="600" height="600" viewBox="-300 -300 600 600">
        
        <defs>
          <clipPath id="adi-mask2">
            <path d="M -160,-220 L 160,-220 A 240 240 0 0 1 240,0 A 240 240 0 0 1 160,220 L -160,220 A 240 240 0 0 1 -240,0 A 240 240 0 0 1 -160,-220 Z" />
          </clipPath>
        </defs>

        <g clipPath="url(#adi-mask2)">
          {/* Pitch moving background  */}
          <g transform={`translate(0, ${pitchOffset})`}>
            {/* Blue Sky */}
            <rect x="-400" y="-800" width="800" height="800" fill="#145A96" />
            {/* Brown Ground */}
            <rect x="-400" y="0" width="800" height="800" fill="#914920" />
            {/* Horizon line */}
            <line x1="-400" y1="0" x2="400" y2="0" stroke="white" strokeWidth="3" />

            {/* Pitch scale (fixed to horizon) */}
            <g stroke="white" strokeWidth="2" textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="22">
              
              {/* +10 */}
              <line x1="-30" y1={-10 * pxPerDegPitch} x2="30" y2={-10 * pxPerDegPitch} />
              <text x="0" y={-10 * pxPerDegPitch + 8} stroke="#145A96" strokeWidth="5" strokeLinejoin="round">10</text>
              <text x="0" y={-10 * pxPerDegPitch + 8} stroke="none">10</text>

              {/* +20 */}
              <line x1="-40" y1={-20 * pxPerDegPitch} x2="40" y2={-20 * pxPerDegPitch} />
              <text x="0" y={-20 * pxPerDegPitch + 8} stroke="#145A96" strokeWidth="5" strokeLinejoin="round">20</text>
              <text x="0" y={-20 * pxPerDegPitch + 8} stroke="none">20</text>
              
              <line x1="-60" y1={-23 * pxPerDegPitch} x2="-20" y2={-23 * pxPerDegPitch} stroke="#DE3121" strokeWidth="3" />
              <line x1="20" y1={-23 * pxPerDegPitch} x2="60" y2={-23 * pxPerDegPitch} stroke="#DE3121" strokeWidth="3" />

              {/* -10 */}
              <line x1="-30" y1={10 * pxPerDegPitch} x2="30" y2={10 * pxPerDegPitch} />
              <text x="0" y={10 * pxPerDegPitch + 8} stroke="#914920" strokeWidth="5" strokeLinejoin="round">10</text>
              <text x="0" y={10 * pxPerDegPitch + 8} stroke="none">10</text>

              {/* -20 */}
              <line x1="-40" y1={20 * pxPerDegPitch} x2="40" y2={20 * pxPerDegPitch} />
              <text x="0" y={20 * pxPerDegPitch + 8} stroke="#914920" strokeWidth="5" strokeLinejoin="round">20</text>
              <text x="0" y={20 * pxPerDegPitch + 8} stroke="none">20</text>
              
              <line x1="-60" y1={23 * pxPerDegPitch} x2="-20" y2={23 * pxPerDegPitch} stroke="#DE3121" strokeWidth="3" />
              <line x1="20" y1={23 * pxPerDegPitch} x2="60" y2={23 * pxPerDegPitch} stroke="#DE3121" strokeWidth="3" />

              {/* Ticks 5, 15 */}
              <line x1="-15" y1={-5 * pxPerDegPitch} x2="15" y2={-5 * pxPerDegPitch} />
              <line x1="-15" y1={5 * pxPerDegPitch} x2="15" y2={5 * pxPerDegPitch} />
              <line x1="-15" y1={-15 * pxPerDegPitch} x2="15" y2={-15 * pxPerDegPitch} />
              <line x1="-15" y1={15 * pxPerDegPitch} x2="15" y2={15 * pxPerDegPitch} />
            </g>
          </g>
          
          {/* Static elements on the mask */}
          <g stroke="white" strokeWidth="2">
            {/* Fixed Horizon indicators (small arrows on the side) */}
            <path d="M -235,0 L -205,0 L -215,-7 Z" fill="none" />
            <path d="M 235,0 L 205,0 L 215,-7 Z" fill="none" />
            <line x1="-205" y1="0" x2="-180" y2="0" strokeDasharray="5 5"/>
            <line x1="205" y1="0" x2="180" y2="0" strokeDasharray="5 5"/>
          </g>

          {/* Roll scale (Bank angle) */}
          <g>
            {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map(a => {
               const isMajor = Math.abs(a) === 30 || Math.abs(a) === 60 || a === 0;
               const p1 = polarToCartesian(0, 0, 180, 180 + a);
               const p2 = polarToCartesian(0, 0, isMajor ? 198 : 190, 180 + a);
               const textP = polarToCartesian(0, 0, 160, 180 + a);
               
               let elements = [];
               elements.push(<line key={`tick-${a}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="white" strokeWidth="2" />);
               
               if (Math.abs(a) === 15 || Math.abs(a) === 60) {
                 elements.push(<text key={`txt-${a}`} x={textP.x} y={textP.y + 6} fill="white" fontSize="16" textAnchor="middle" fontFamily="sans-serif" >{Math.abs(a)}</text>);
               }
               if (Math.abs(a) === 45) {
                 const textP45 = polarToCartesian(0, 0, 165, 180 + a);
                 elements.push(<text key={`txt-${a}`} x={textP45.x} y={textP45.y + 6} fill="white" fontSize="16" textAnchor="middle" fontFamily="sans-serif" >{Math.abs(a)}</text>);
               }
               
               return elements;
            })}
            
            {/* Red tracking arcs on the bottom */}
            <path d="M -106 148 C -120 135, -140 110, -155 70" fill="none" stroke="#D32F2F" strokeWidth="2" />
            <path d="M 106 148 C 120 135, 140 110, 155 70" fill="none" stroke="#D32F2F" strokeWidth="2" />
            {/* Small red flags pointing from 15 inwards */}
            <path d="M -135 60 L -140 50 L -130 50" fill="none" stroke="#D32F2F" strokeWidth="2" />
            <path d="M 135 60 L 140 50 L 130 50" fill="none" stroke="#D32F2F" strokeWidth="2" />
          </g>

          {/* Warning blocks */}
          <rect x="-190" y="75" width="100" height="34" fill="#E87C24" opacity="0.9" />
          <text x="-140" y="98" fill="#111" fontSize="18" fontFamily="sans-serif" textAnchor="middle">ПЗ ИНС</text>

          <rect x="90" y="75" width="100" height="34" fill="#E87C24" opacity="0.9" />
          <text x="140" y="98" fill="#111" fontSize="18" fontFamily="sans-serif" textAnchor="middle">ПЗ СБКВ</text>

          {/* The orange moving aircraft symbol */}
          {/* In Outside-In ADI, positive roll (right wing down) makes the symbol rotate clockwise. */}
          <g transform={`rotate(${roll})`}>
            {/* Orange Aircraft Symbol */}
            <g stroke="#E87C24" strokeWidth="4" fill="none" strokeLinecap="square">
              {/* Circle center */}
              <circle cx="0" cy="0" r="22" />
              <circle cx="0" cy="0" r="3" fill="#E87C24" />
              {/* Wings */}
              <line x1="-22" y1="0" x2="-80" y2="0" />
              <line x1="-80" y1="0" x2="-100" y2="20" />

              <line x1="22" y1="0" x2="80" y2="0" />
              <line x1="80" y1="0" x2="100" y2="20" />
              
              {/* Needle pointing to bank scale */}
              <line x1="0" y1="22" x2="0" y2="182" stroke="#E87C24" strokeWidth="3" />
            </g>
          </g>

          {/* Slip indicator (pill) - stationary relative to roll */}
          <g transform="translate(0, 205)">
             <rect x="-40" y="-12" width="80" height="24" rx="12" fill="white" stroke="#333" strokeWidth="1" />
             <line x1="-12" y1="-12" x2="-12" y2="12" stroke="black" strokeWidth="3" />
             <line x1="12" y1="-12" x2="12" y2="12" stroke="black" strokeWidth="3" />
             
             <circle cx={slipOffset} cy="0" r="10" fill="black" />
          </g>

          {/* Yellow Flight Director */}
          {/* Animated relative to pitch background for effect */}
          <g transform={`translate(0, ${pitchOffset - 20 + fdPitchOffset})`}>
             <g stroke="#C6E33B" strokeWidth="5" fill="none" strokeLinecap="square">
               <line x1="-90" y1="-10" x2="90" y2="-10" />
               <line x1="-80" y1="-10" x2="-80" y2="10" />
               <line x1="80" y1="-10" x2="80" y2="10" />
             </g>
             
             {/* Yellow slant crossbar */}
             <line x1="30" y1="-80" x2="-30" y2="50" stroke="#C6E33B" strokeWidth="5" transform={`rotate(${fdRollAngle})`} />
          </g>

        </g>
        
        {/* Out of Mask instruments (GlideSlope, Localizer) */}
        {/* Glideslope on the right */}
        <g transform="translate(260, 0)" fill="white">
           <circle cx="0" cy="-60" r="3" />
           <circle cx="0" cy="-30" r="3" />
           <line x1="-10" y1="0" x2="10" y2="0" stroke="white" strokeWidth="3" />
           <circle cx="0" cy="30" r="3" />
           <circle cx="0" cy="60" r="3" />
           
           {/* Glideslope Indicator */}
           <path d="M -5 10 L -25 10 L -25 25 L -5 25 L 5 17.5 Z" fill="#C6E33B" stroke="#000" strokeWidth="1" />
        </g>

        {/* Localizer on the left */}
        <g transform="translate(-260, 0)" fill="white">
           <circle cx="0" cy="-60" r="3" />
           <circle cx="0" cy="-30" r="3" />
           <line x1="-12" y1="0" x2="12" y2="0" stroke="white" strokeWidth="5" />
           <circle cx="0" cy="0" r="12" fill="none" stroke="white" strokeWidth="2" />
           <circle cx="0" cy="30" r="3" />
           <circle cx="0" cy="60" r="3" />
           
           {/* Localizer Indicator (circle with line) */}
           <path d="M 0 -13 L 0 5 M -15 5 L 15 5" stroke="white" strokeWidth="3" fill="none" transform="translate(0, 15)" />
        </g>
      </svg>
    </div>
  );
}
