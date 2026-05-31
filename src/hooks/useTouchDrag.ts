/** Simplified Touch Drag & Drop for Mobile */
import { useEffect, useRef } from 'react';

const GHOST_SIZE = 80;

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function createGhost(id: string, el: HTMLElement) {
  const ghost = document.createElement('div');
  ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;width:' + GHOST_SIZE + 'px;height:' + GHOST_SIZE + 'px;background:rgba(37,38,40,0.95);border:2px solid #3b82f6;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 8px 32px rgba(59,130,246,0.3);transform:translate(-50%,-50%) scale(0.9);transition:transform 0.1s;opacity:0.92;';
  const icon = el.querySelector('svg')?.cloneNode(true) as SVGElement | null;
  const name = el.querySelector('span')?.textContent ?? id;
  if (icon) { icon.style.cssText = 'width:24px;height:24px;color:#60a5fa;'; ghost.appendChild(icon); }
  const label = document.createElement('span');
  label.style.cssText = 'font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;';
  label.textContent = name;
  ghost.appendChild(label);
  document.body.appendChild(ghost);
  return ghost;
}

export function useSidebarTouchDrag() {
  const dragItemRef = useRef<HTMLElement | null>(null);
  const onTouchStart = (e: React.TouchEvent, id: string): void => {
    const touch = e.touches[0];
    if (!touch) return;
    const target = e.currentTarget as HTMLElement;
    dragItemRef.current = target;
    window.__dragState = { active: true, id, startX: touch.clientX, startY: touch.clientY, ghost: createGhost(id, target), scrollPrevented: false };
    window.__dragState.ghost.style.left = touch.clientX + 'px';
    window.__dragState.ghost.style.top = touch.clientY + 'px';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    window.__dragState.scrollPrevented = true;
  };
  useEffect(() => {
    return () => {
      if (window.__dragState?.active) {
        window.__dragState.ghost?.remove();
        if (window.__dragState.scrollPrevented) {
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
        }
        window.__dragState = null;
      }
    };
  }, []);
  return { onTouchStart };
}

export function usePanelCanvasTouchDrop(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  onDrop: (widgetId: string) => void,
) {
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const findDropTarget = (x: number, y: number): HTMLElement | null => {
      const zones = el.querySelectorAll<HTMLElement>('[data-drop-zone]');
      let best: HTMLElement | null = null;
      let smallestArea = Infinity;
      for (const zone of zones) {
        const r = zone.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          const area = r.width * r.height;
          if (area < smallestArea) { smallestArea = area; best = zone; }
        }
      }
      return best;
    };
    const onTouchMove = (e: TouchEvent) => {
      const s = window.__dragState;
      if (!s?.active) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      if (s.ghost) { s.ghost.style.left = touch.clientX + 'px'; s.ghost.style.top = touch.clientY + 'px'; }
      const zone = findDropTarget(touch.clientX, touch.clientY);
      if (zone) zone.style.outline = '2px solid #3b82f6';
    };
    const onTouchEnd = (e: TouchEvent) => {
      const s = window.__dragState;
      if (!s?.active) return;
      s.active = false;
      s.ghost?.remove();
      if (s.scrollPrevented) { document.body.style.overflow = ''; document.body.style.touchAction = ''; }
      const zone = findDropTarget(s.startX, s.startY);
      if (zone) zone.style.outline = '';
      if (zone && s.id) onDrop(s.id);
      window.__dragState = null;
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [canvasRef, onDrop]);
}
