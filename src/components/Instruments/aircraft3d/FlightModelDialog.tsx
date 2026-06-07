/**
 * FlightModelDialog.tsx — редактор параметров Improved FDM.
 *
 * Позволяет:
 *  — Выбрать пресет (Default, Slow, Fast, Custom)
 *  — Твикать каждый параметр ползунком
 *  — Экспортировать/импортировать JSON
 *  — Сохранять кастомный пресет
 */
import React, { useState, useCallback, memo } from 'react';
import {
  CONFIG_PRESETS,
  type FlightModelParams,
  type PresetKey,
  type ParamsState,
} from './flightModelParams';
import { saveParams, exportParams, importParams, applyPreset } from './flightModelParamsIO';

/* ─── Описания параметров для UI ─── */
interface ParamDef {
  key: keyof FlightModelParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const PARAM_DEFS: ParamDef[] = [
  { key: 'elevatorRate',       label: 'Элеватор (deg/s)',    min: 5,   max: 300, step: 1 },
  { key: 'aileronRate',        label: 'Элероны (deg/s)',     min: 5,   max: 400, step: 1 },
  { key: 'rudderRate',         label: 'Руль напр. (deg/s)',  min: 1,   max: 80,  step: 1 },
  { key: 'controlSmoothing',   label: 'Инерция (0..1)',      min: 0.01, max: 0.5, step: 0.01 },
  { key: 'bankToYawFactor',    label: 'Крен→разворот',       min: 5,   max: 80,  step: 1 },
  { key: 'spiralStability',    label: 'Устойчивость крена',  min: 0,   max: 1,   step: 0.01 },
  { key: 'stallSpeed',         label: 'Сваливание (kt)',      min: 10,  max: 200, step: 1 },
  { key: 'elevatorStallPenalty', label: 'Потеря элев. при stall', min: 0, max: 100, step: 1 },
  { key: 'thrustMax',          label: 'Макс. тяга',           min: 10,  max: 300, step: 1 },
  { key: 'dragCoeff',          label: 'Лобовое сопр. (×10⁻⁵)', min: 0.00001, max: 0.001, step: 0.00001 },
  { key: 'climbFactor',        label: 'Набор высоты',         min: 0.01, max: 0.5, step: 0.01 },
  { key: 'stallSinkRate',      label: 'Снижение при stall',   min: 5,   max: 150, step: 1 },
  { key: 'altitudeScale',      label: 'Масштаб высоты',       min: 0.01, max: 0.2, step: 0.01 },
  { key: 'groundY',            label: 'Уровень земли',        min: -20, max: -1,  step: 0.5 },
  { key: 'joystickSensitivity',label: 'Чувств. джойстика',    min: 0.001, max: 0.1,   step: 0.001 },
];

const PRESET_OPTIONS: { key: PresetKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'slow',    label: 'Slow' },
  { key: 'fast',    label: 'Fast' },
  { key: 'custom',  label: 'Custom' },
];

/* ─── Компонент ─── */
interface Props {
  paramsState: ParamsState;
  onApply: (state: ParamsState) => void;
  onClose: () => void;
}

export const FlightModelDialog: React.FC<Props> = memo(({ paramsState, onApply, onClose }) => {
  const [localParams, setLocalParams] = useState<FlightModelParams>(() => ({ ...paramsState.params }));
  const [localPreset, setLocalPreset] = useState<PresetKey>(paramsState.currentPreset);
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [tab, setTab] = useState<'edit' | 'import'>('edit');
  const [message, setMessage] = useState('');

  const updateParam = useCallback((key: keyof FlightModelParams, value: number) => {
    setLocalParams(prev => ({ ...prev, [key]: value }));
    setLocalPreset('custom');
  }, []);

  const handlePreset = useCallback((key: PresetKey) => {
    const state = applyPreset(key);
    setLocalParams({ ...state.params });
    setLocalPreset(key);
    setMessage(`Пресет "${key}" загружен`);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const handleSave = useCallback(() => {
    saveParams(localPreset, localParams);
    onApply({ currentPreset: localPreset, params: localParams });
    setMessage('Сохранено ✅');
    setTimeout(() => setMessage(''), 2000);
  }, [localParams, localPreset, onApply]);

  const handleExport = useCallback(() => {
    const json = exportParams(localParams);
    setExportText(json);
    navigator.clipboard?.writeText(json).catch(() => {});
    setMessage('JSON скопирован в буфер');
    setTimeout(() => setMessage(''), 2000);
  }, [localParams]);

  const handleImport = useCallback(() => {
    if (!importText.trim()) return;
    const parsed = importParams(importText);
    if (parsed) {
      setLocalParams(parsed);
      setLocalPreset('custom');
      setImportText('');
      setMessage('Импортировано ✅');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('❌ Ошибка: неверный формат JSON');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [importText]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-white/10 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto text-white font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">⚙ Flight Model Settings</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white/90 text-lg leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            className={`px-4 py-1.5 text-xs ${tab === 'edit' ? 'text-cyan-400 border-b border-cyan-400' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setTab('edit')}
          >Edit</button>
          <button
            className={`px-4 py-1.5 text-xs ${tab === 'import' ? 'text-cyan-400 border-b border-cyan-400' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setTab('import')}
          >Import / Export</button>
        </div>

        {tab === 'edit' && (
          <div className="p-3 space-y-2">
            {/* Presets */}
            <div className="flex gap-1 mb-2">
              {PRESET_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    localPreset === key
                      ? 'bg-cyan-600/50 text-white font-medium'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                  onClick={() => handlePreset(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            {PARAM_DEFS.map(def => (
              <div key={def.key} className="flex items-center gap-2">
                <label className="text-[11px] text-white/70 w-36 shrink-0 text-right">{def.label}</label>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={localParams[def.key]}
                  onChange={e => updateParam(def.key, parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-cyan-500"
                />
                <span className="text-[11px] text-white/90 w-16 text-right">
                  {def.step <= 0.001
                    ? localParams[def.key].toFixed(5)
                    : def.step >= 0.01 && def.step < 1
                    ? localParams[def.key].toFixed(2)
                    : Math.round(localParams[def.key])}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'import' && (
          <div className="p-3 space-y-3">
            <button
              onClick={handleExport}
              className="w-full px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              📋 Copy JSON to clipboard
            </button>
            {exportText && (
              <pre className="text-[9px] text-white/60 bg-black/30 rounded p-2 max-h-32 overflow-y-auto">{exportText}</pre>
            )}
            <textarea
              placeholder="Paste JSON here…"
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-24 bg-black/30 border border-white/10 rounded p-2 text-[10px] text-white/80 font-mono resize-none"
            />
            <button
              onClick={handleImport}
              className="w-full px-3 py-1.5 text-xs bg-emerald-600/50 hover:bg-emerald-600/70 rounded transition-colors"
            >
              📥 Import JSON
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a2e] border-t border-white/10 px-4 py-2 flex items-center justify-between">
          <span className={`text-[10px] ${message.includes('❌') ? 'text-red-400' : 'text-green-400/70'}`}>{message}&nbsp;</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-[10px] bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-[10px] bg-cyan-600/50 hover:bg-cyan-600/70 rounded transition-colors"
            >
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
