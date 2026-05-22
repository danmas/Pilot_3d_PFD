/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getInstrumentIcon } from './instruments';
import { getRegisteredInstrument } from './registry';
import type { PanelNode } from './types';
import type { TelemetryFrame } from '../../types';

interface Props {
  node: PanelNode;
  onRemove: () => void;
  frame?: TelemetryFrame | null;
}

export const Instrument: React.FC<Props> = ({ node, onRemove, frame }) => {
  const registered = node.instrumentId
    ? getRegisteredInstrument(node.instrumentId)
    : undefined;

  if (!registered) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 relative group bg-[#161719]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-20"
          title="Remove Instrument"
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
        Unknown Instrument
      </div>
    );
  }

  const Icon = getInstrumentIcon(registered.iconName);
  const InstrumentComponent = registered.Component;
  const showLive = !!frame && !!InstrumentComponent;

  return (
    <div className="w-full h-full relative group min-h-[100px] overflow-hidden bg-[#161719] flex flex-col items-center justify-center text-center">
      {/* Remove button overlay */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-30"
        title="Remove Instrument"
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

      {/* ID label overlay */}
      <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/60 px-1 text-gray-400 border border-[#2d2e30] z-20 pointer-events-none">
        INST_{registered.id.toUpperCase()}
      </div>

      {showLive ? (
        // Render real instrument component, fill the entire cell
        <div className="absolute inset-0 w-full h-full">
          <InstrumentComponent frame={frame} />
        </div>
      ) : (
        // Fallback: icon-based placeholder when no telemetry data
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

          {/* Crosshair decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-48 h-[1px] bg-white"></div>
            <div className="h-48 w-[1px] bg-white absolute"></div>
          </div>
        </div>
      )}
    </div>
  );
};
