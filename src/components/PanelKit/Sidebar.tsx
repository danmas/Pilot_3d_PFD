import React from 'react';
import type { PanelKitItem } from './types';

interface Props {
  items: PanelKitItem[];
  getIcon: (iconName: string) => React.ElementType;
}

export const Sidebar: React.FC<Props> = ({ items, getIcon }) => {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('panelkit/widgetId', id);
    e.dataTransfer.setData('instrumentId', id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-56 bg-[#161719] border-l border-[#2d2e30] flex flex-col z-20">
      <div className="p-3 border-b border-[#2d2e30]">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Library</h2>
      </div>

      <div className="flex-1 p-2 grid grid-cols-2 gap-2 content-start overflow-y-auto">
        {items.map((item) => {
          const Icon = getIcon(item.iconName);
          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="aspect-square bg-[#252628] border border-[#2d2e30] flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing hover:bg-[#2d2e30] transition-colors group"
            >
              <div className="text-gray-400 group-hover:text-blue-400 transition-colors flex items-center justify-center h-8">
                <Icon size={20} className="stroke-2" />
              </div>
              <span className="text-[8px] uppercase text-gray-400 group-hover:text-gray-200 transition-colors text-center w-full truncate px-1">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[#2d2e30] p-3 bg-[#0a0a0f]">
        <div className="text-[9px] text-gray-500 leading-tight uppercase">
          Nodes: <span className="text-blue-400 text-xs font-mono">{items.length} Elements</span>
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <div className="flex-1 h-1 bg-[#2d2e30]">
            <div className="w-[45%] h-full bg-blue-500"></div>
          </div>
          <span className="text-[8px] text-gray-600">SYS_RDY</span>
        </div>
      </div>
    </aside>
  );
};
