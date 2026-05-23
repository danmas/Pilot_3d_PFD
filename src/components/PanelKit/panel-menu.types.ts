export type PanelKitMenuItem = { type: 'item'; label: string; action: string } | { type: 'separator' };

export type PanelKitMenuConfig = {
  items: PanelKitMenuItem[];
};

export const isPanelKitMenuConfig = (value: unknown): value is PanelKitMenuConfig => {
  if (!value || typeof value !== 'object') return false;
  const items = (value as PanelKitMenuConfig).items;
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
