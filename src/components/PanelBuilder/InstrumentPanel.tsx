/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutPanelTop, LayoutPanelLeft } from 'lucide-react';
import { Instrument } from './Instrument';
import { SplitContainer } from './SplitContainer';
import type { PanelNode, SplitDirection } from './types';
import type { TelemetryFrame } from '../../types';

interface Props {
  node: PanelNode;
  onChange: (node: PanelNode) => void;
  onRemoveNode: () => void;
  isRoot?: boolean;
  frame?: TelemetryFrame | null;
}

const newId = () => Math.random().toString(36).substring(2, 9);

export const InstrumentPanel: React.FC<Props> = ({ node, onChange, onRemoveNode, isRoot, frame }) => {
  if (node.type === 'split' && node.children) {
    return (
      <SplitContainer
        direction={node.splitDirection!}
        ratio={node.splitRatio ?? 0.5}
        onRatioChange={(r) => onChange({ ...node, splitRatio: r })}
      >
        <InstrumentPanel
          node={node.children[0]}
          onChange={(child) => onChange({ ...node, children: [child, node.children![1]] })}
          onRemoveNode={() => onChange(node.children![1])}
          frame={frame}
        />
        <InstrumentPanel
          node={node.children[1]}
          onChange={(child) => onChange({ ...node, children: [node.children![0], child] })}
          onRemoveNode={() => onChange(node.children![0])}
          frame={frame}
        />
      </SplitContainer>
    );
  }

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const instId = e.dataTransfer.getData('instrumentId');
    if (instId) {
      onChange({ ...node, type: 'instrument', instrumentId: instId });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleSplit = (direction: SplitDirection) => {
    onChange({
      id: node.id,
      type: 'split',
      splitDirection: direction,
      splitRatio: 0.5,
      children: [
        { id: newId(), type: node.type, instrumentId: node.instrumentId },
        { id: newId(), type: 'empty' },
      ],
    });
  };

  return (
    <div
      className={`w-full h-full relative group flex flex-col items-center justify-center
        ${
          node.type === 'empty'
            ? 'border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 cursor-pointer'
            : 'bg-[#161719] border border-[#2d2e30]'
        }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Controls Overlay */}
      <div className="absolute top-1 right-1 hidden group-hover:flex space-x-1 z-20 bg-[#161719] rounded-sm p-1 shadow-lg border border-[#2d2e30]">
        <button
          className="p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors"
          title="Split Vertically (Left/Right)"
          onClick={() => handleSplit('vertical')}
        >
          <LayoutPanelLeft size={14} />
        </button>
        <button
          className="p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors"
          title="Split Horizontally (Top/Bottom)"
          onClick={() => handleSplit('horizontal')}
        >
          <LayoutPanelTop size={14} />
        </button>
        {!isRoot && (
          <button
            className="p-1 hover:bg-red-900/50 rounded-sm text-red-500 hover:text-red-400 transition-colors ml-1"
            title="Remove Panel"
            onClick={onRemoveNode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
      </div>

      {node.type === 'instrument' ? (
        <Instrument
          node={node}
          onRemove={() => onChange({ ...node, type: 'empty', instrumentId: undefined })}
          frame={frame}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 pointer-events-none gap-2">
          <div className="flex gap-4">
            <div className="w-6 h-6 border border-gray-600 flex items-center justify-center text-xs">
              +H
            </div>
            <div className="w-6 h-6 border border-gray-600 flex items-center justify-center text-xs">
              +V
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-tighter hover:text-blue-400">
            Drop Instrument or Split
          </span>
        </div>
      )}
    </div>
  );
};
