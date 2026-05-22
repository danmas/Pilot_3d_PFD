import React from 'react';
import type { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';
import { registerInstrument } from '../PanelBuilder/registry';

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const NavDisplayInstrument: React.FC<{ frame: TelemetryFrame }> = ({ frame }) => {
  let heading = finiteNumber(frame.MagneticHeading) ?? 0;
  heading = heading % 360;
  if (heading < 0) heading += 360;

  const selectedHeading = finiteNumber(frame.HeadingSelect) ?? 220;
  const dme = finiteNumber(frame.DME_Distance);

  const renderCompassRose = () => {
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 10 === 0;
      const innerR = 140;
      const length = isMajor ? 14 : 7;

      elements.push(
        <line
          key={`tick-${i}`}
          x1="0"
          y1={-innerR}
          x2="0"
          y2={-innerR - length}
          stroke="white"
          strokeWidth={isMajor ? 2 : 1.5}
          transform={`rotate(${i})`}
        />
      );

      if (i % 30 === 0) {
        let label = (i / 10).toString();
        if (i === 0) label = 'N';
        if (i === 90) label = 'E';
        if (i === 180) label = 'S';
        if (i === 270) label = 'W';

        elements.push(
          <text
            key={`label-${i}`}
            x="0"
            y="-110"
            fill="white"
            fontSize="22"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
            transform={`rotate(${i})`}
          >
            {label}
          </text>
        );
      }

      if (i % 90 === 45) {
        elements.push(
          <polygon
            key={`tri-${i}`}
            points="0,-138 -6,-124 6,-124"
            fill="none"
            stroke="white"
            strokeWidth="2"
            transform={`rotate(${i})`}
          />
        );
      }
    }
    return elements;
  };

  return (
    <div className="w-full h-full relative bg-[#050505] font-sans flex items-center justify-center select-none overflow-hidden">
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Top left HDG text */}
        <SvgTooltipGroup
          description="Заданный курс автопилота, градусы."
          frameVariables={['HeadingSelect']}
        >
          <text x="30" y="50" fill="white" fontSize="22" fontFamily="sans-serif">
            HDG{' '}
            <tspan fill="#00FFFF">
              {Math.round(selectedHeading).toString().padStart(3, '0')} °
            </tspan>
          </text>
        </SvgTooltipGroup>

        {/* Top right NAV data */}
        <SvgTooltipGroup
          transform="translate(480, 80)"
          description="NAV-блок: курсовые/радионавигационные данные и DME-дистанция."
          frameVariables={['DME_Distance']}
        >
          <g fill="white" fontSize="20" fontFamily="sans-serif">
            <text x="10" y="0" fill="#00FFFF" textAnchor="end" letterSpacing="4">
              ---
            </text>
            <text x="30" y="0">A</text>

            <text x="10" y="30" fill="#00FFFF" textAnchor="end" letterSpacing="4">
              ---
            </text>
            <text x="30" y="30">°</text>

            <text
              x="10"
              y="60"
              fill="#FFA500"
              textAnchor="end"
              letterSpacing={dme === null ? '4' : '0'}
            >
              {dme !== null && dme !== undefined ? dme.toFixed(1) : '---'}
            </text>
            <text x="30" y="60">NM</text>
          </g>
        </SvgTooltipGroup>

        <g transform="translate(300, 200)">
          {/* Rotating Compass Rose */}
          <SvgTooltipGroup
            transform={`rotate(${-heading})`}
            description="Компасная роза — текущий магнитный курс разворачивает шкалу относительно самолёта."
            frameVariables={['MagneticHeading']}
          >
            {renderCompassRose()}

            {/* Selected heading bug (cyan) */}
            <g transform={`rotate(${selectedHeading}) translate(0, -154)`}>
              <path
                d="M -12 0 L -12 -8 L 12 -8 L 12 0 L 6 0 L 6 -4 L -6 -4 L -6 0 Z"
                fill="#00FFFF"
              />
            </g>
          </SvgTooltipGroup>

          {/* Outer fixed elements */}
          <SvgTooltipGroup description="Жёлтый индекс самолёта — неподвижная отметка текущего направления.">
            <polygon
              points="0,-156 -10,-174 10,-174"
              fill="none"
              stroke="#FFEA00"
              strokeWidth="2"
            />
          </SvgTooltipGroup>

          {/* Left, Right, Bottom fixed tick marks */}
          <line x1="-160" y1="0" x2="-180" y2="0" stroke="white" strokeWidth="2" />
          <line x1="160" y1="0" x2="180" y2="0" stroke="white" strokeWidth="2" />
          <line x1="0" y1="160" x2="0" y2="180" stroke="white" strokeWidth="2" />

          {/* Center Airplane Symbol */}
          <SvgTooltipGroup description="Символ самолёта в центре навигационного дисплея.">
            <g stroke="#FFEA00" strokeWidth="4" fill="none" strokeLinecap="square">
              <line x1="0" y1="-30" x2="0" y2="25" />
              <line x1="-25" y1="-5" x2="25" y2="-5" />
              <line x1="-12" y1="20" x2="12" y2="20" />
            </g>
          </SvgTooltipGroup>
        </g>
      </svg>
    </div>
  );
};

registerInstrument({
  id: 'nav-display',
  name: 'Nav Display',
  iconName: 'Compass',
  Component: NavDisplayInstrument,
  tooltip: 'Nav Display — компасная роза, текущий магнитный курс, заданный курс и DME-дистанция.',
  frameVariables: [
    'MagneticHeading',
    'HeadingSelect',
    'DME_Distance',
  ],
});

export default NavDisplayInstrument;
