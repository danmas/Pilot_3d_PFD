import React from 'react';
import { InstrumentTooltipProvider } from './InstrumentTooltip';
import {
  getPanelKitIcon,
  getRegisteredPanelKitWidget,
} from '../PanelKit';
import type { TelemetryFrame } from '../../types';

interface Props {
  widgetId: string;
  frame?: TelemetryFrame | null;
  onRemove: () => void;
  readOnly?: boolean;
}

export const AviationWidget: React.FC<Props> = ({ widgetId, frame, onRemove, readOnly = false }) => {
  const registered = getRegisteredPanelKitWidget(widgetId);

  if (!registered) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 relative group bg-[#161719]">
        {!readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-20"
            title="Remove Widget"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
        Unknown Widget
      </div>
    );
  }

  const Icon = getPanelKitIcon(registered.iconName);
  const WidgetComponent = registered.Component as React.FC<{ frame: TelemetryFrame }>;
  const showLive = !!frame && !!WidgetComponent;

  return (
    <div className="w-full h-full relative group min-h-[100px] overflow-hidden bg-[#161719] flex flex-col items-center justify-center text-center">
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-30"
          title="Remove Widget"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}

      <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/60 px-1 text-gray-400 border border-[#2d2e30] z-20 pointer-events-none">
        WIDGET_{registered.id.toUpperCase()}
      </div>

      {showLive ? (
        <div className="absolute inset-0 w-full h-full">
          <InstrumentTooltipProvider>
            <WidgetComponent frame={frame} />
          </InstrumentTooltipProvider>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          <div className="text-white mb-2 relative z-10">
            <Icon
              size={48}
              className="stroke-1 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            />
          </div>

          <div className="text-[10px] text-gray-500 uppercase font-mono tracking-wider mt-1 z-10">
            {registered.name}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-48 h-[1px] bg-white"></div>
            <div className="h-48 w-[1px] bg-white absolute"></div>
          </div>
        </div>
      )}
    </div>
  );
};
