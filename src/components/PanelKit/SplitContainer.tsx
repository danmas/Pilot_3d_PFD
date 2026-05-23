import React, { useRef } from 'react';
import type { SplitDirection } from './types';

interface Props {
  direction: SplitDirection;
  ratio: number;
  onRatioChange: (nextRatio: number) => void;
  children: [React.ReactNode, React.ReactNode];
}

export const SplitContainer: React.FC<Props> = ({ direction, ratio, onRatioChange, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const startRect = container.getBoundingClientRect();
    const isVertical = direction === 'vertical';

    const onPointerMove = (ev: PointerEvent) => {
      let nextRatio = ratio;
      if (isVertical) {
        const offset = ev.clientX - startRect.left;
        nextRatio = offset / startRect.width;
      } else {
        const offset = ev.clientY - startRect.top;
        nextRatio = offset / startRect.height;
      }
      nextRatio = Math.max(0.05, Math.min(nextRatio, 0.95));
      onRatioChange(nextRatio);
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const isVertical = direction === 'vertical';

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex ${isVertical ? 'flex-row' : 'flex-col'} overflow-hidden relative`}
    >
      <div style={{ flex: `${ratio * 100} 1 0%` }} className="overflow-hidden min-w-0 min-h-0">
        {children[0]}
      </div>

      <div
        className={`group flex items-center justify-center z-10 flex-shrink-0 transition-all bg-[#0a0a0f]
          ${isVertical ? 'w-2 h-full cursor-col-resize hover:bg-[#1e1f21]' : 'h-2 w-full cursor-row-resize hover:bg-[#1e1f21]'}
        `}
        onPointerDown={handlePointerDown}
      >
        <div
          className={`bg-[#2d2e30] group-hover:bg-blue-500 transition-colors ${isVertical ? 'w-[1px] h-full' : 'h-[1px] w-full'}`}
        />
      </div>

      <div
        style={{ flex: `${(1 - ratio) * 100} 1 0%` }}
        className="overflow-hidden min-w-0 min-h-0"
      >
        {children[1]}
      </div>
    </div>
  );
};
