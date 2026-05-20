/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SplitDirection = 'horizontal' | 'vertical';
export type NodeType = 'empty' | 'instrument' | 'split';

export interface PanelNode {
  id: string;
  type: NodeType;
  instrumentId?: string; // If type is 'instrument'
  splitDirection?: SplitDirection; // If type is 'split'
  splitRatio?: number; // 0.0 to 1.0, defines size of the first child
  children?: [PanelNode, PanelNode]; // Left/Right or Top/Bottom
}

export interface InstrumentDef {
  id: string;
  name: string;
  iconName: string;
}
