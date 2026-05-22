import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { UI_SETTINGS } from '../../ui-settings';

type TooltipState = {
  text: string;
  x: number;
  y: number;
} | null;

type TooltipContextValue = {
  showTooltip: (text: string, event: React.MouseEvent<SVGElement>) => void;
  moveTooltip: (event: React.MouseEvent<SVGElement>) => void;
  hideTooltip: () => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

export const formatTelemetryTooltip = (description: string, frameVariables?: string[]) => {
  if (!frameVariables?.length) return description;
  return `${description}\n\nПеременные фрейма:\n${frameVariables.join('\n')}`;
};

export const InstrumentTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const getPosition = useCallback((event: React.MouseEvent<SVGElement>) => {
    return {
      x: event.clientX + 14,
      y: event.clientY + 14,
    };
  }, []);

  const value = useMemo<TooltipContextValue>(() => ({
    showTooltip: (text, event) => setTooltip({ text, ...getPosition(event) }),
    moveTooltip: (event) => {
      setTooltip((current) => current ? { ...current, ...getPosition(event) } : current);
    },
    hideTooltip: () => setTooltip(null),
  }), [getPosition]);

  return (
    <TooltipContext.Provider value={value}>
      <div ref={containerRef} className="relative w-full h-full">
        {children}
        {tooltip && createPortal(
          <div
            className="fixed max-w-[min(560px,calc(100vw-16px))] whitespace-pre-wrap rounded-md border border-emerald-400/40 bg-black/90 px-3 py-2 text-left font-mono leading-tight text-white shadow-2xl pointer-events-none z-[9999]"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              fontSize: UI_SETTINGS.tooltip.fontSizePx,
              transform: [
                tooltip.x > window.innerWidth * 0.65 ? 'translateX(-100%)' : '',
                tooltip.y > window.innerHeight * 0.65 ? 'translateY(-100%)' : '',
              ].filter(Boolean).join(' ') || undefined,
            }}
          >
            {tooltip.text}
          </div>,
          document.body
        )}
      </div>
    </TooltipContext.Provider>
  );
};

type SvgTooltipGroupProps = {
  description: string;
  frameVariables?: string[];
  children: React.ReactNode;
  className?: string;
  transform?: string;
  clipPath?: string;
};

export const SvgTooltipGroup: React.FC<SvgTooltipGroupProps> = ({
  description,
  frameVariables,
  children,
  className,
  transform,
  clipPath,
}) => {
  const tooltip = useContext(TooltipContext);
  const text = formatTelemetryTooltip(description, frameVariables);

  return (
    <g
      className={className}
      transform={transform}
      clipPath={clipPath}
      onMouseEnter={(event) => tooltip?.showTooltip(text, event)}
      onMouseMove={(event) => tooltip?.moveTooltip(event)}
      onMouseLeave={() => tooltip?.hideTooltip()}
    >
      {children}
    </g>
  );
};
