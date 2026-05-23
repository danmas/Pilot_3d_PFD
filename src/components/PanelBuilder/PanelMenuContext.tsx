/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { PanelMenuConfig, PanelMenuItem } from './panel-menu.types';

export type PanelMenuActions = {
  openUdpDialog: () => void;
  saveConfig: () => void;
  loadConfig: () => void;
  saveCurrentConfig: () => void;
};

type PanelMenuContextValue = {
  items: PanelMenuItem[];
  runAction: (action: string) => void;
};

const PanelMenuContext = createContext<PanelMenuContextValue | null>(null);

const DEFAULT_MENU: PanelMenuConfig = {
  items: [
    { type: 'item', label: 'UDP Source...', action: 'openUdpDialog' },
    { type: 'separator' },
    { type: 'item', label: 'Save Configuration...', action: 'saveConfig' },
    { type: 'item', label: 'Load Configuration...', action: 'loadConfig' },
  ],
};

type Props = {
  menu: PanelMenuConfig | null;
  actions: PanelMenuActions;
  children: React.ReactNode;
};

export const PanelMenuProvider: React.FC<Props> = ({ menu, actions, children }) => {
  const runAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'openUdpDialog':
          actions.openUdpDialog();
          break;
        case 'saveConfig':
          actions.saveConfig();
          break;
        case 'loadConfig':
          actions.loadConfig();
          break;
        case 'saveCurrentConfig':
          actions.saveCurrentConfig();
          break;
        default:
          console.warn(`Unknown panel menu action: ${action}`);
      }
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
