/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, Upload, Save, Copy, Trash2 } from 'lucide-react';
import { UdpSourceDialog } from './UdpSourceDialog';
import { AviationWidget } from './AviationWidget';
import {
  CURRENT_CONFIG_API,
  CURRENT_CONFIG_FILE_NAME,
  PANEL_MENU_API,
  createEmptyRoot,
  normalizePanelNode,
  toLegacyPanelNode,
} from './panelConfig';
import {
  PanelCanvas,
  PanelMenuProvider,
  Sidebar,
  getAllRegisteredPanelKitWidgets,
  getPanelKitIcon,
  isPanelKitMenuConfig,
  type PanelKitMenuConfig,
  type PanelKitNode,
} from '../PanelKit';
import { useTelemetry } from '../../context/TelemetryContext';
// Importing the Instruments barrel triggers self-registration of all
// instrument components into the registry.
import '../Instruments';
import {
  getProfiles,
  saveProfile,
  loadProfile,
  saveCurrentProfile,
  deleteProfile,
  CURRENT_PROFILE_ID,
  type PanelProfile,
} from '../../stores/panelStore';

const PANELS_API = '/api/panels';

interface PanelBuilderProps {
  onBack: () => void;
}

export const PanelBuilder: React.FC<PanelBuilderProps> = ({ onBack }) => {
  // ---- Telemetry from context (live or sample, provided by parent) ----
  const { frame } = useTelemetry();

  // ---- State: panel layout tree ----
  const [rootNode, setRootNode] = useState<PanelKitNode>(createEmptyRoot);
  const [configStatus, setConfigStatus] = useState('Loading current config...');
  const [panelMenu, setPanelMenu] = useState<PanelKitMenuConfig | null>(null);
  const [udpDialogOpen, setUdpDialogOpen] = useState(false);
  const hasHydrated = useRef(false);
  const lastSavedJson = useRef<string | null>(null);

  // ---- Profile management ----
  const [profiles, setProfiles] = useState<PanelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState(CURRENT_PROFILE_ID);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const currentTreeJson = useCallback(() => {
    return JSON.stringify(toLegacyPanelNode(rootNode), null, 2);
  }, [rootNode]);

  // ---- Load profile list from server ----
  const refreshProfiles = useCallback(async () => {
    try {
      const list = await getProfiles();
      setProfiles(list);
      return list;
    } catch {
      return [] as PanelProfile[];
    }
  }, []);

  // ---- Save current to a named profile on server ----
  const saveToProfile = useCallback(async (profileId: string) => {
    const json = currentTreeJson();
    const name = profileId === CURRENT_PROFILE_ID
      ? 'Current'
      : profileId;
    const ok = profileId === CURRENT_PROFILE_ID
      ? await saveCurrentProfile(json)
      : await saveProfile(profileId, json);
    if (ok) {
      lastSavedJson.current = json;
      setConfigStatus(`Saved to "${name}"`);
    } else {
      setConfigStatus(`Failed to save "${name}"`);
    }
  }, [currentTreeJson]);

  // ---- Load profile from server ----
  const loadFromProfile = useCallback(async (profileId: string) => {
    const json = await loadProfile(profileId);
    if (!json) {
      setConfigStatus(`Failed to load profile`);
      return;
    }
    try {
      const parsed = JSON.parse(json);
      const normalized = normalizePanelNode(parsed);
      if (normalized) {
        lastSavedJson.current = json;
        setRootNode(normalized);
        setSelectedProfileId(profileId);
        const name = profileId === CURRENT_PROFILE_ID ? 'Current' : profileId;
        setConfigStatus(`Loaded "${name}"`);
      } else {
        setConfigStatus(`Invalid profile data`);
      }
    } catch {
      setConfigStatus(`Failed to parse profile`);
    }
  }, []);

  // ---- Save as new profile ----
  const handleSaveAs = useCallback(async () => {
    const name = prompt('Profile name:');
    if (!name || !name.trim()) return;
    const ok = await saveProfile(name.trim(), currentTreeJson());
    if (ok) {
      await refreshProfiles();
      setSelectedProfileId(name.trim());
      setConfigStatus(`Saved as "${name.trim()}"`);
    } else {
      setConfigStatus(`Failed to save "${name.trim()}"`);
    }
  }, [currentTreeJson, refreshProfiles]);

  // ---- Delete profile ----
  const handleDeleteProfile = useCallback(async () => {
    if (selectedProfileId === CURRENT_PROFILE_ID) return;
    const name = selectedProfileId;
    if (!confirm(`Delete profile "${name}"?`)) return;
    const ok = await deleteProfile(name);
    if (ok) {
      await refreshProfiles();
      setSelectedProfileId(CURRENT_PROFILE_ID);
      await loadFromProfile(CURRENT_PROFILE_ID);
      setConfigStatus(`Deleted "${name}", switched to Current`);
    } else {
      setConfigStatus(`Failed to delete "${name}"`);
    }
  }, [selectedProfileId, refreshProfiles, loadFromProfile]);

  // ---- Auto-load from server on mount ----
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await refreshProfiles();
      if (cancelled) return;

      // Check if a profile switch triggered a pending panel load
      const pending = (window as any).__pendingPanelLoad;
      if (pending) {
        (window as any).__pendingPanelLoad = null;
        const normalized = normalizePanelNode(pending);
        if (normalized) {
          lastSavedJson.current = JSON.stringify(toLegacyPanelNode(normalized), null, 2);
          setRootNode(normalized);
          setConfigStatus(`Loaded from profile`);
        } else {
          setConfigStatus(`Invalid profile panel config`);
        }
        if (!cancelled) {
          hasHydrated.current = true;
          setProfilesLoading(false);
        }
        return;
      }

      // Load current config
      try {
        const res = await fetch(CURRENT_CONFIG_API, { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const parsed = await res.json();
          const normalized = normalizePanelNode(parsed);
          if (normalized) {
            lastSavedJson.current = JSON.stringify(toLegacyPanelNode(normalized), null, 2);
            setRootNode(normalized);
            setConfigStatus(`Loaded from ${CURRENT_CONFIG_FILE_NAME}`);
          } else {
            setConfigStatus(`Invalid ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
          }
        } else if (res.status === 404) {
          setConfigStatus(`No ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
        } else {
          setConfigStatus(`Cannot read ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
        }
      } catch {
        if (!cancelled) setConfigStatus(`Cannot read ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
      } finally {
        if (!cancelled) {
          hasHydrated.current = true;
          setProfilesLoading(false);
        }
      }
    };

    void init();
    return () => { cancelled = true; };
  }, [CURRENT_CONFIG_API, refreshProfiles]);

  // ---- Load panel-menu.json ----
  useEffect(() => {
    let cancelled = false;

    const loadPanelMenu = async () => {
      try {
        const response = await fetch(PANEL_MENU_API, { cache: 'no-store' });
        if (cancelled) return;
        if (!response.ok) return;
        const parsed = await response.json();
        if (isPanelKitMenuConfig(parsed)) {
          setPanelMenu(parsed);
        }
      } catch {
        // ignore
      }
    };

    void loadPanelMenu();
    return () => { cancelled = true; };
  }, []);

  // ---- Auto-save to panel-config-current.json on change ----
  useEffect(() => {
    if (!hasHydrated.current) return;
    const json = currentTreeJson();
    if (json === lastSavedJson.current) return;

    // Expose rootNode for profile switch in App
    (window as any).__panelBuilderRootNode = toLegacyPanelNode(rootNode);

    const timeoutId = window.setTimeout(() => {
      lastSavedJson.current = json;
      void saveCurrentProfile(json);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [rootNode, currentTreeJson]);

  // ---- File save / load (unchanged) ----
  const saveCurrentConfig = useCallback(async (node: PanelKitNode): Promise<boolean> => {
    const json = JSON.stringify(toLegacyPanelNode(node), null, 2);
    setConfigStatus(`Saving ${CURRENT_CONFIG_FILE_NAME}...`);
    try {
      const response = await fetch(CURRENT_CONFIG_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: json,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      lastSavedJson.current = json;
      setConfigStatus(`Saved to ${CURRENT_CONFIG_FILE_NAME}`);
      return true;
    } catch (error) {
      console.warn('Failed to save current panel config', error);
      setConfigStatus(`Autosave unavailable: ${CURRENT_CONFIG_FILE_NAME}`);
      return false;
    }
  }, []);

  const handleSaveFile = async () => {
    const json = JSON.stringify(toLegacyPanelNode(rootNode), null, 2);

    const fsWindow = window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{
          description?: string;
          accept: Record<string, string[]>;
        }>;
      }) => Promise<FileSystemFileHandle>;
    };

    if (fsWindow.showSaveFilePicker) {
      try {
        const handle = await fsWindow.showSaveFilePicker({
          suggestedName: CURRENT_CONFIG_FILE_NAME,
          types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        await saveCurrentConfig(rootNode);
        setConfigStatus(`Exported to ${handle.name}; current updated`);
        return;
      } catch (err: unknown) {
        if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'SecurityError')) {
          return;
        }
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = CURRENT_CONFIG_FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
    await saveCurrentConfig(rootNode);
    setConfigStatus(`Downloaded ${CURRENT_CONFIG_FILE_NAME}; current updated`);
  };

  const handleBack = async () => {
    await saveCurrentConfig(rootNode);
    onBack();
  };

  const handleLoadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json);
        const normalized = normalizePanelNode(parsed);
        if (normalized) {
          setRootNode(normalized);
          setConfigStatus(`Imported; will autosave to ${CURRENT_CONFIG_FILE_NAME}`);
        } else {
          alert('Invalid configuration file structure.');
        }
      } catch {
        alert('Failed to parse the configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLoadFile(file);
    if (e.target) e.target.value = '';
  };

  const triggerLoadFile = useCallback(() => {
    document.getElementById('panel-builder-load')?.click();
  }, []);

  const menuActions = useMemo<Record<string, () => void>>(
    () => ({
      openUdpDialog: () => setUdpDialogOpen(true),
      saveConfig: () => void handleSaveFile(),
      loadConfig: triggerLoadFile,
      saveCurrentConfig: () => void saveCurrentConfig(rootNode),
    }),
    [rootNode, saveCurrentConfig, triggerLoadFile],
  );

  const availableWidgets = useMemo(
    () =>
      getAllRegisteredPanelKitWidgets().map((widget) => ({
        id: widget.id,
        name: widget.name,
        iconName: widget.iconName,
      })),
    [],
  );

  return (
    <PanelMenuProvider menu={panelMenu} actions={menuActions}>
      <div className="flex flex-col h-screen w-screen bg-[#0a0a0f] text-[#d1d5db] font-sans overflow-hidden">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#2d2e30] bg-[#161719] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleBack()}
            className="p-1.5 hover:bg-[#252628] rounded-md text-gray-400 hover:text-white transition-colors"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-[1px] bg-[#2d2e30]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-sm font-bold tracking-wide text-white">
              Panel Builder
            </span>
          </div>
          <div className="h-4 w-[1px] bg-[#2d2e30]" />
          {/* ── Profile switcher ── */}
          <div className="flex items-center gap-1">
            <select
              className="bg-[#252628] border border-[#2d2e30] text-[11px] text-white rounded px-2 py-1 max-w-[160px] cursor-pointer outline-none focus:border-blue-500"
              value={selectedProfileId}
              onChange={async (e) => {
                const newId = e.target.value;
                if (newId !== selectedProfileId) {
                  await saveToProfile(selectedProfileId);
                  await loadFromProfile(newId);
                }
              }}
              disabled={profilesLoading}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === CURRENT_PROFILE_ID ? `⚡ ${p.name}` : p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => void saveToProfile(selectedProfileId)}
              className="p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-emerald-400 transition-colors"
              title="Save to profile"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => void handleSaveAs()}
              className="p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-blue-400 transition-colors"
              title="Save as new profile"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {selectedProfileId !== CURRENT_PROFILE_ID && (
              <button
                onClick={() => void handleDeleteProfile()}
                className="p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-red-400 transition-colors"
                title="Delete profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => document.getElementById('panel-builder-load')?.click()}
            className="px-3 py-1.5 bg-[#252628] hover:bg-[#2d2e30] border border-[#2d2e30] text-[10px] font-bold uppercase transition-colors flex items-center gap-2 text-white rounded-md"
            title="Load layout from JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            Load
          </button>
          <input
            type="file"
            id="panel-builder-load"
            className="hidden"
            accept=".json,application/json"
            onChange={onFileChange}
          />
          <button
            onClick={handleSaveFile}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2 rounded-md"
            title="Save layout to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </header>

      {/* ─── Main: canvas + sidebar ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-[#0a0a0f] p-4 flex gap-2 relative">
          <div className="w-full h-full border-2 border-dashed border-[#2d2e30] flex relative">
            <PanelCanvas
              node={rootNode}
              onChange={setRootNode}
              onRemoveNode={() => setRootNode(createEmptyRoot())}
              isRoot
              data={frame}
              renderWidget={(node, clearWidget) => (
                <AviationWidget
                  widgetId={node.widgetId!}
                  frame={frame}
                  onRemove={clearWidget}
                />
              )}
            />
          </div>
        </main>

        <Sidebar items={availableWidgets} getIcon={getPanelKitIcon} />
      </div>

      {/* ─── Status bar ───────────────────────────────────────────── */}
      <footer className="h-6 bg-[#161719] border-t border-[#2d2e30] flex items-center px-4 justify-between text-[10px] shrink-0">
        <div className="flex gap-4">
          <span className="text-emerald-500">READY</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">NODE_RENDERER: ACTIVE</span>
        </div>
        <div className="text-gray-500 font-mono">{configStatus}</div>
      </footer>

      <UdpSourceDialog open={udpDialogOpen} onClose={() => setUdpDialogOpen(false)} />
    </div>
    </PanelMenuProvider>
  );
};

export default PanelBuilder;
