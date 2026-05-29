import type { PanelKitNode } from '../PanelKit';

export const CURRENT_CONFIG_API = '/api/panel/config/current';
export const PANEL_MENU_API = '/api/panel/menu';
export const CURRENT_CONFIG_FILE_NAME = 'panel-config-current.json';

export const createEmptyRoot = (): PanelKitNode => ({ id: 'root', type: 'empty' });

export type LegacyPanelNode = {
  id: string;
  type: 'empty' | 'instrument' | 'widget' | 'split';
  instrumentId?: string;
  widgetId?: string;
  splitDirection?: 'horizontal' | 'vertical';
  splitRatio?: number;
  children?: [LegacyPanelNode, LegacyPanelNode];
};

export const normalizePanelNode = (value: unknown): PanelKitNode | null => {
  if (!value || typeof value !== 'object') return null;
  const node = value as Record<string, unknown>;
  if (typeof node.id !== 'string' || typeof node.type !== 'string') return null;

  if (node.type === 'empty') {
    return { id: node.id, type: 'empty' };
  }

  if (node.type === 'instrument' || node.type === 'widget') {
    const widgetId =
      typeof node.widgetId === 'string'
        ? node.widgetId
        : typeof node.instrumentId === 'string'
          ? node.instrumentId
          : undefined;

    return {
      id: node.id,
      type: widgetId ? 'widget' : 'empty',
      widgetId,
    };
  }

  if (node.type === 'split') {
    if (!Array.isArray(node.children) || node.children.length !== 2) return null;
    const first = normalizePanelNode(node.children[0]);
    const second = normalizePanelNode(node.children[1]);
    if (!first || !second) return null;

    return {
      id: node.id,
      type: 'split',
      splitDirection: node.splitDirection === 'horizontal' ? 'horizontal' : 'vertical',
      splitRatio: typeof node.splitRatio === 'number' ? node.splitRatio : 0.5,
      children: [first, second],
    };
  }

  return null;
};

export const toLegacyPanelNode = (node: PanelKitNode): LegacyPanelNode => {
  if (node.type === 'split' && node.children) {
    return {
      id: node.id,
      type: 'split',
      splitDirection: node.splitDirection ?? 'vertical',
      splitRatio: node.splitRatio ?? 0.5,
      children: [toLegacyPanelNode(node.children[0]), toLegacyPanelNode(node.children[1])],
    };
  }

  if (node.type === 'widget') {
    return {
      id: node.id,
      type: 'instrument',
      instrumentId: node.widgetId,
    };
  }

  return { id: node.id, type: 'empty' };
};
