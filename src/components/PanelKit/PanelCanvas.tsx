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

interface PanelMoveSource {
  widgetId: string;
  clearSource: () => void;
}

declare global {
  interface Window {
    __panelMoveSource?: PanelMoveSource;
  }
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

  // Ref для очистки источника (всегда свежий)
  const clearRef = useRef<() => void>(() => {});
  clearRef.current = () => onChange({ ...node, type: 'empty', widgetId: undefined });

  // ── Drop handler ───────────────────────────────────────────────────
  usePanelCanvasTouchDrop(canvasRef, (widgetId: string) => {
    if (node.type === 'empty' || (node.type === 'widget' && !node.widgetId)) {
      onChange({ ...node, type: 'widget', widgetId });
    } else if (node.type === 'widget' && node.widgetId) {
      onChange({ ...node, widgetId });
    }

    // Если перетащили из другой ячейки — очистить источник
    // setTimeout(0): сначала React закоммитит onChange цели,
    // иначе clearSource() перетрёт состояние корня и цель потеряет прибор.
    if (window.__panelMoveSource) {
      const moveSource = window.__panelMoveSource;
      window.__panelMoveSource = undefined;
      setTimeout(() => moveSource.clearSource(), 0);
    }
  });

  // ── HTML5 DnD источник (аналогично Sidebar) ───────────────────────
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('panelkit/widgetId', node.widgetId!);
    e.dataTransfer.setData('instrumentId', node.widgetId!);
    e.dataTransfer.effectAllowed = 'copyMove';
    window.__panelMoveSource = {
      widgetId: node.widgetId!,
      clearSource: () => clearRef.current(),
    };
  };

  const handleDragEnd = () => {
    window.__panelMoveSource = undefined;
  };

  // ── Split view ─────────────────────────────────────────────────────
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

  const isWidget = node.type === 'widget' && !!node.widgetId;

  return (
    <div
      ref={canvasRef}
      data-drop-zone="true"
      data-drop-widget={isWidget ? '' : undefined}
      draggable={isWidget}
      onDragStart={isWidget ? handleDragStart : undefined}
      onDragEnd={isWidget ? handleDragEnd : undefined}
      className={`w-full h-full relative group flex flex-col items-center justify-center
        ${
          node.type === 'empty'
            ? 'border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 cursor-pointer'
            : 'bg-[#161719] border border-[#2d2e30]'
        }
        ${isWidget ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="absolute top-1 right-1 hidden group-hover:flex space-x-1 z-20 bg-[#161719] rounded-sm p-1 shadow-lg border border-[#2d2e30]">
        <button
          className="p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors"
          title="Split Vertically (Left/Right)"
          onClick={(e) => {
            e.stopPropagation();
            handleSplit('vertical');
          }}
        >
          <LayoutPanelLeft size={14} />
        </button>
        <button
          className="p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors"
          title="Split Horizontally (Top/Bottom)"
          onClick={(e) => {
            e.stopPropagation();
            handleSplit('horizontal');
          }}
        >
          <LayoutPanelTop size={14} />
        </button>
        <PanelCommandMenu />
        {!isRoot && (
          <button
            className="p-1 hover:bg-red-900/50 rounded-sm text-red-500 hover:text-red-400 transition-colors ml-1"
            title="Remove Panel"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveNode();
            }}
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

      {isWidget ? (
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
