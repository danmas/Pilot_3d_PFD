import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { PanelKitMenuConfig, PanelKitMenuItem } from './panel-menu.types';

type PanelMenuContextValue = {
  items: PanelKitMenuItem[];
  runAction: (action: string) => void;
};

const PanelMenuContext = createContext<PanelMenuContextValue | null>(null);

const DEFAULT_MENU: PanelKitMenuConfig = {
  items: [],
};

type Props = {
  menu: PanelKitMenuConfig | null;
  actions: Record<string, () => void>;
  children: React.ReactNode;
};

export const PanelMenuProvider: React.FC<Props> = ({ menu, actions, children }) => {
  const runAction = useCallback(
    (action: string) => {
      const handler = actions[action];
      if (handler) {
        handler();
        return;
      }
      console.warn(`Unknown panel menu action: ${action}`);
    },
    [actions],
  );

  const value = useMemo<PanelMenuContextValue>(
    () => ({
      items: menu?.items?.length ? menu.items : DEFAULT_MENU.items,
      runAction,
    }),
    [menu, runAction],
  );

  return <PanelMenuContext.Provider value={value}>{children}</PanelMenuContext.Provider>;
};

export const usePanelMenu = (): PanelMenuContextValue => {
  const ctx = useContext(PanelMenuContext);
  if (!ctx) {
    throw new Error('usePanelMenu must be used within PanelMenuProvider');
  }
  return ctx;
};
