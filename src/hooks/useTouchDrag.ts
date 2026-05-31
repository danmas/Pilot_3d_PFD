/**
 * useTouchDrag.ts — touch drag & drop для PanelKit (мобильные устройства).
 */
import React from 'react';

const GHOST_SIZE = 64;

interface TouchDragState {
  widgetId: string;
  ghost: HTMLElement;
}

// Global drag state — передаёт widgetId между компонентами без props drilling
declare global {
  interface Window {
    __touchDragState?: TouchDragState;
  }
}

/* ─── Создание / удаление призрака ─── */

function createGhost(widgetId: string): HTMLElement {
  const ghost = document.createElement('div');
  ghost.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:99999',
    `width:${GHOST_SIZE}px`,
    `height:${GHOST_SIZE}px`,
    'background:rgba(37,38,40,0.95)',
    'border:2px solid #3b82f6',
    'border-radius:8px',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'gap:4px',
    'box-shadow:0 8px 32px rgba(59,130,246,0.3)',
    'transform:translate(-50%,-50%) scale(0.9)',
    'transition:transform 0.1s',
    'opacity:0.92',
  ].join(';');

  // Label
  const label = document.createElement('span');
  label.textContent = widgetId;
  label.style.cssText = 'font-size:8px;color:#60a5fa;text-transform:uppercase;font-weight:bold;letter-spacing:1px;';
  ghost.appendChild(label);

  return ghost;
}

function destroyGhost() {
  if (window.__touchDragState) {
    window.__touchDragState.ghost.remove();
    window.__touchDragState = undefined;
  }
}

/* ─── Поиск drop-зоны под пальцем ─── */

function findDropZone(x: number, y: number): HTMLElement | null {
  // Ищем элемент с data-drop-zone="true" под координатами
  // Используем document.elementsFromPoint для точности
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropZone === 'true') {
      return el;
    }
  }
  return null;
}

/* ─── Хук для Sidebar (источник) ─── */

export function useSidebarTouchDrag() {
  const onTouchStart = (e: React.TouchEvent, widgetId: string) => {
    if (window.__touchDragState) destroyGhost();
    const touch = e.touches[0];
    if (!touch) return;

    const ghost = createGhost(widgetId);
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.top = `${touch.clientY}px`;
    document.body.appendChild(ghost);

    window.__touchDragState = { widgetId, ghost };

    const handleTouchMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t || !window.__touchDragState) return;
      window.__touchDragState.ghost.style.left = `${t.clientX}px`;
      window.__touchDragState.ghost.style.top = `${t.clientY}px`;

      // Подсветка drop-зоны
      const zone = findDropZone(t.clientX, t.clientY);
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = z === zone ? '2px solid #3b82f6' : '';
          z.style.outlineOffset = z === zone ? '-2px' : '';
        }
      });
    };

    const handleTouchEnd = (ev: TouchEvent) => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);

      // Убираем подсветку
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = '';
          z.style.outlineOffset = '';
        }
      });

      if (!window.__touchDragState) return;
      const changedTouch = ev.changedTouches[0];
      if (!changedTouch) { destroyGhost(); return; }

      const zone = findDropZone(changedTouch.clientX, changedTouch.clientY);
      if (zone) {
        // Dispatch a custom event similar to HTML5 drop
        const dropEvent = new CustomEvent('touchdrop', {
          bubbles: true,
          cancelable: true,
          detail: { widgetId: window.__touchDragState.widgetId },
        });
        zone.dispatchEvent(dropEvent);
      }

      destroyGhost();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  return { onTouchStart };
}

/* ─── Хук для PanelCanvas (приёмник) ─── */

export function usePanelCanvasTouchDrop(
  ref: React.RefObject<HTMLDivElement | null>,
  onDrop: (widgetId: string) => void,
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchDrop = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.widgetId) {
        onDrop(detail.widgetId);
      }
    };

    el.addEventListener('touchdrop', handleTouchDrop as EventListener);
    return () => {
      el.removeEventListener('touchdrop', handleTouchDrop as EventListener);
    };
  }, [ref, onDrop]);

  // Также слушаем HTML5 drop (десктоп)
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const widgetId =
        e.dataTransfer?.getData('panelkit/widgetId') ||
        e.dataTransfer?.getData('instrumentId');
      if (widgetId) {
        onDrop(widgetId);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    el.addEventListener('drop', handleDrop);
    el.addEventListener('dragover', handleDragOver);
    return () => {
      el.removeEventListener('drop', handleDrop);
      el.removeEventListener('dragover', handleDragOver);
    };
  }, [ref, onDrop]);
}
