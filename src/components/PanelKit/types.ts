import type React from 'react';

export type SplitDirection = 'horizontal' | 'vertical';
export type PanelKitNodeType = 'empty' | 'widget' | 'split';

export interface PanelKitNode {
  id: string;
  type: PanelKitNodeType;
  widgetId?: string;
  splitDirection?: SplitDirection;
  splitRatio?: number;
  children?: [PanelKitNode, PanelKitNode];
}

export interface PanelKitItem {
  id: string;
  name: string;
  iconName: string;
}

export type PanelKitWidgetComponent<TData = unknown> = React.FC<{
  frame: TData;
}>;

export interface RegisteredPanelKitWidget<TData = unknown> {
  id: string;
  name: string;
  iconName: string;
  Component: PanelKitWidgetComponent<TData>;
  tooltip?: string;
  frameVariables?: string[];
}
