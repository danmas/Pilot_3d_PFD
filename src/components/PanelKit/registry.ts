import type { RegisteredPanelKitWidget } from './types';

const registry = new Map<string, RegisteredPanelKitWidget<unknown>>();

export const registerPanelKitWidget = <TData = unknown>(widget: RegisteredPanelKitWidget<TData>) => {
  registry.set(widget.id, widget as RegisteredPanelKitWidget<unknown>);
};

export const getRegisteredPanelKitWidget = (id: string) => registry.get(id);

export const getAllRegisteredPanelKitWidgets = (): RegisteredPanelKitWidget<unknown>[] =>
  Array.from(registry.values());
