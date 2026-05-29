import React, { useEffect, useState } from 'react';
import { AviationWidget } from './AviationWidget';
import {
  CURRENT_CONFIG_API,
  CURRENT_CONFIG_FILE_NAME,
  normalizePanelNode,
} from './panelConfig';
import type { TelemetryFrame } from '../../types';
import type { PanelKitNode } from '../PanelKit';
// Importing the Instruments barrel triggers self-registration of all widgets.
import '../Instruments';

interface PanelDisplayProps {
  frame: TelemetryFrame;
}

const renderNode = (node: PanelKitNode, frame: TelemetryFrame): React.ReactNode => {
  if (node.type === 'split' && node.children) {
    const isVertical = node.splitDirection === 'vertical';
    const ratio = node.splitRatio ?? 0.5;

    return (
      <div className={`w-full h-full flex ${isVertical ? 'flex-row' : 'flex-col'} overflow-hidden relative`}>
        <div style={{ flex: `${ratio * 100} 1 0%` }} className="overflow-hidden min-w-0 min-h-0">
          {renderNode(node.children[0], frame)}
        </div>
        <div
          className={`flex-shrink-0 bg-[#0a0a0f] ${isVertical ? 'w-2 h-full' : 'h-2 w-full'}`}
        >
          <div className={`bg-[#2d2e30] ${isVertical ? 'w-[1px] h-full mx-auto' : 'h-[1px] w-full my-auto'}`} />
        </div>
        <div style={{ flex: `${(1 - ratio) * 100} 1 0%` }} className="overflow-hidden min-w-0 min-h-0">
          {renderNode(node.children[1], frame)}
        </div>
      </div>
    );
  }

  if (node.type === 'widget' && node.widgetId) {
    return (
      <div className="w-full h-full bg-[#161719] border border-[#2d2e30]">
        <AviationWidget widgetId={node.widgetId} frame={frame} readOnly onRemove={() => undefined} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#161719] border border-[#2d2e30] flex items-center justify-center text-gray-600 text-[10px] uppercase tracking-wider">
      Empty panel
    </div>
  );
};

export const PanelDisplay: React.FC<PanelDisplayProps> = ({ frame }) => {
  const [rootNode, setRootNode] = useState<PanelKitNode | null>(null);
  const [status, setStatus] = useState(`Loading ${CURRENT_CONFIG_FILE_NAME}...`);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const response = await fetch(CURRENT_CONFIG_API, { cache: 'no-store' });
        if (cancelled) return;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const parsed = await response.json();
        const normalized = normalizePanelNode(parsed);
        if (!normalized) {
          throw new Error('Invalid panel config');
        }

        setRootNode(normalized);
        setStatus('');
      } catch (error) {
        console.warn('Failed to load panel config for display', error);
        if (!cancelled) {
          setRootNode(null);
          setStatus(`Cannot load ${CURRENT_CONFIG_FILE_NAME}`);
        }
      }
    };

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!rootNode) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white/50 text-sm">
        {status}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0f] overflow-hidden">
      {renderNode(rootNode, frame)}
    </div>
  );
};

export default PanelDisplay;
