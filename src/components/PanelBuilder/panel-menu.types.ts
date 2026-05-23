export type PanelMenuActionId =
  | 'openUdpDialog'
  | 'saveConfig'
  | 'loadConfig'
  | 'saveCurrentConfig';

export type PanelMenuItem =
  | { type: 'item'; label: string; action: PanelMenuActionId }
  | { type: 'separator' };

export type PanelMenuConfig = {
  items: PanelMenuItem[];
};

export const isPanelMenuConfig = (value: unknown): value is PanelMenuConfig => {
  if (!value || typeof value !== 'object') return false;
  const items = (value as PanelMenuConfig).items;
  if (!Array.isArray(items)) return false;
  return items.every((item) => {
    if (!item || typeof item !== 'object') return false;
    if (item.type === 'separator') return true;
    if (item.type === 'item') {
      return typeof item.label === 'string' && typeof item.action === 'string';
    }
    return false;
  });
};
