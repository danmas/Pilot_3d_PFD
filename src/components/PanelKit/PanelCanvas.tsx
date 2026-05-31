import React, { useRef } from 'react';
import { LayoutPanelLeft, LayoutPanelTop } from 'lucide-react';
import { SplitContainer } from './SplitContainer';
import { PanelCommandMenu } from './PanelCommandMenu';
import { usePanelCanvasTouchDrop } from '../../hooks/useTouchDrag';
import type { PanelKitNode, SplitDirection } from './types';

interface Props<TData = unknown> {
  node: PanelKitNode;
  onChange: (node: PanelKitNode) => void;
  onRemoveNode: () => void;
  isRoot?: boolean;
  data?: TData | null;
  renderWidget: (
    node: PanelKitNode,
    clearWidget: () => void,
    data?: TData | null,
  ) => React.ReactNode;
}

const newId = () => Math.random().toString(36).substring(2, 9);

export const PanelCanvas = <TData,>({
  node,
  onChange,
  onRemoveNode,
  isRoot,
  data,
  renderWidget,
}: Props<TData>) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  usePanelCanvasTouchDrop(canvasRef, (widgetId: string) => {
    if (node.type === 'empty' || (node.type === 'widget' && !node.widgetId)) {
      onChange({ ...node, type: 'widget', widgetId });
    }
  });

  if (node.type === 'split' && node.children) {
    return (
      <SplitContainer
        direction={node.splitDirection!}
        ratio={node.splitRatio ?? 0.5}
        onRatioChange={(nextRatio) => onChange({ ...node, splitRatio: nextRatio })}
      >
        <PanelCanvas
          node={node.children[0]}
          onChange={(child) => onChange({ ...node, children: [child, node.children![1]] })}
          onRemoveNode={() => onChange(node.children![1])}
          data={data}
          renderWidget={renderWidget}
        />
        <PanelCanvas
          node={node.children[1]}
          onChange={(child) => onChange({ ...node, children: [node.children![0], child] })}
          onRemoveNode={() => onChange(node.children![0])}
          data={data}
          renderWidget={renderWidget}
        />
      </SplitContainer>
    );
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const widgetId =
      e.dataTransfer.getData('panelkit/widgetId') || e.dataTransfer.getData('instrumentId');
    if (widgetId) {
      onChange({ ...node, type: 'widget', widgetId });
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
        { id: newId(), type: node.type, widgetId: node.widgetId },
        { id: newId(), type: 'empty' },
      ],
    });
  };

  return (
    <div
      ref={canvasRef}
      data-drop-zone="true"
      className={`w-full h-full relative group flex flex-col items-center justify-center
        ${
          node.type === 'empty'
            ? 'border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 cursor-pointer'
            : 'bg-[#161719] border border-[#2d2e30]'
        }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        <PanelCommandMenu />
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

      {node.type === 'widget' && node.widgetId ? (
        <div className="w-full h-full">
          {renderWidget(
            node,
            () => onChange({ ...node, type: 'empty', widgetId: undefined }),
            data,
          )}
        </div>
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
            Drop Widget or Split
          </span>
        </div>
      )}
    </div>
  );
};
