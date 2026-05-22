import React from 'react';
import { TelemetryFrame } from '../../types';
import { SvgTooltipGroup } from '../PanelBuilder/InstrumentTooltip';

interface Props { frame: TelemetryFrame; }

export function VerticalSpeed({ frame }: Props) {
  const TAPE_COLOR = "#818181";
  const vs = (frame.Vy as number) ?? 0;

  // Non-linear scale mapping
  const getVsY = (val: number) => {
    const abs = Math.abs(val);
    const sign = Math.sign(val);
    let y = 0;
    if (abs <= 1) y = (abs / 1) * 45;
    else if (abs <= 3) y = 45 + ((abs - 1) / 2) * 45;
    else y = 90 + ((abs - 3) / 3) * 55;
    return y * -sign;
  };

  return (
    <g>
      <SvgTooltipGroup
        description="Вариометр — вертикальная скорость (набор высоты / снижение), м/с. Зелёная линия — текущее значение."
        frameVariables={['Vy']}
      >
        <path d="M 680 160 L 730 160 L 730 440 L 680 440 L 660 390 L 660 210 Z" fill={TAPE_COLOR} />
      </SvgTooltipGroup>
      
      <g transform="translate(0, 300)">
        <SvgTooltipGroup
          description="Шкала вариометра — деления вертикальной скорости в м/с."
          frameVariables={['Vy']}
        >
          {[6, 3, 1, 0, -1, -3, -6].map(v => {
            const y = getVsY(v);
            const isZero = v === 0;
            return (
              <g key={v} transform={`translate(0, ${y})`}>
                <line x1="660" y1="0" x2={isZero ? "675" : "670"} y2="0" stroke="white" strokeWidth="2" />
                {!isZero && (
                  <text x="680" y="7" fill="white" fontSize="20" textAnchor="start" fontFamily="sans-serif">
                    {Math.abs(v)}
                  </text>
                )}
              </g>
            );
          })}
        </SvgTooltipGroup>
        {/* Horizontal green pointer line from left to right */}
        <SvgTooltipGroup
          description="Зелёная линия — текущая вертикальная скорость."
          frameVariables={['Vy']}
        >
          <line x1="640" y1={getVsY(vs/1000)} x2="720" y2={getVsY(vs/1000)} stroke="#00FF00" strokeWidth="3" />
        </SvgTooltipGroup>
        
        {/* Cyan bracket bracket at 0 */}
        <SvgTooltipGroup
          description="Нулевая вертикальная скорость — горизонтальный полёт."
          frameVariables={['Vy']}
        >
          <path d="M 670 -12 L 660 -12 L 660 12 L 670 12" fill="none" stroke="#00FFFF" strokeWidth="2" />
          <rect x="663" y="-5" width="4" height="10" fill="#00FFFF" />
        </SvgTooltipGroup>
      </g>
    </g>
  );
}
