import React, { useEffect, useRef, useState } from 'react';
import { usePanelMenu } from './PanelMenuContext';

export const PanelCommandMenu: React.FC = () => {
  const { items, runAction } = usePanelMenu();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors ml-1"
        title="Panel commands"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span className="block w-[14px] text-center text-[14px] leading-none font-bold tracking-widest">
          ...
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-1 min-w-[220px] py-1 bg-[#292a2d] border border-[#3c4043] rounded-lg shadow-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) =>
            item.type === 'separator' ? (
              <div
                key={`sep-${index}`}
                role="separator"
                className="my-1 border-t border-[#3c4043]"
              />
            ) : (
              <button
                key={`${item.action}-${index}`}
                type="button"
                role="menuitem"
                className="w-full px-4 py-2 text-left text-[13px] text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                onClick={() => {
                  setOpen(false);
                  runAction(item.action);
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};
