/**
 * ModelDialog.tsx — диалоговое окно выбора и настройки 3D-модели.
 *
 * Отображается поверх Canvas при нажатии кнопки «Модель».
 * Позволяет выбрать модель и подстроить параметры (scale, yaw, offset).
 *
 * При «Применить» вызывает onApply с обновлённой ModelEntry.
 */
import { useState, useCallback } from 'react';
import type { ModelEntry } from './modelConfig';

/* ─── Props ─── */
interface ModelDialogProps {
  /** Список доступных моделей (примитивы + GLB) */
  models: ModelEntry[];
  /** Текущая выбранная модель */
  current: ModelEntry;
  /** Применить выбор + настройки (в 3D-сцену) */
  onApply: (model: ModelEntry) => void;
  /** Сохранить models.json на диск */
  onSave: (models: ModelEntry[]) => void;
  /** Закрыть без применения */
  onClose: () => void;
}

/* ─── Number input (compact) ─── */
const NumInput: React.FC<{
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}> = ({ label, value, step = 0.1, onChange }) => (
  <label className="flex items-center gap-1.5 text-[11px] text-white/80">
    <span className="w-14 shrink-0 text-right">{label}</span>
    <input
      type="number"
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-16 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-white
                 focus:outline-none focus:border-cyan-500/60 [appearance:textfield]
                 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  </label>
);

/* ─── Main component ─── */
export const ModelDialog: React.FC<ModelDialogProps> = ({
  models,
  current,
  onApply,
  onSave,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState(current.id);
  const [scale, setScale] = useState(current.scale ?? 1);
  const [yawOffsetDeg, setYawOffsetDeg] = useState(current.yawOffsetDeg ?? 0);
  const [offsetX, setOffsetX] = useState(current.offsetX ?? 0);
  const [offsetY, setOffsetY] = useState(current.offsetY ?? 0);
  const [offsetZ, setOffsetZ] = useState(current.offsetZ ?? 0);

  const selectedModel = models.find((m) => m.id === selectedId);
  const isGlb = selectedModel?.url != null;

  /** При смене модели — подгружаем дефолтные параметры из описания */
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const m = models.find((x) => x.id === id);
      if (m) {
        setScale(m.scale ?? 1);
        setYawOffsetDeg(m.yawOffsetDeg ?? 0);
        setOffsetX(m.offsetX ?? 0);
        setOffsetY(m.offsetY ?? 0);
        setOffsetZ(m.offsetZ ?? 0);
      }
    },
    [models],
  );

  const handleApply = useCallback(() => {
    if (!selectedModel) return;
    onApply({
      ...selectedModel,
      scale,
      yawOffsetDeg,
      offsetX,
      offsetY,
      offsetZ,
    });
  }, [selectedModel, scale, yawOffsetDeg, offsetX, offsetY, offsetZ, onApply]);

  /** Сохранить все модели (с текущими правками для выбранной) в models.json */
  const handleSave = useCallback(() => {
    if (!selectedModel) return;
    const updated: ModelEntry = {
      ...selectedModel,
      scale,
      yawOffsetDeg,
      offsetX,
      offsetY,
      offsetZ,
    };
    const allUpdated = models.map((m) => (m.id === updated.id ? updated : m));
    onSave(allUpdated);
  }, [models, selectedModel, scale, yawOffsetDeg, offsetX, offsetY, offsetZ, onSave]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-900/95 border border-white/20 rounded-lg shadow-xl w-72 max-h-[90%] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span className="text-sm font-semibold text-white">Выбор модели</span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* ── Model list ── */}
        <div className="px-3 py-2 space-y-1">
          {models.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[12px] transition-colors
                ${m.id === selectedId ? 'bg-cyan-600/30 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              <input
                type="radio"
                name="model-select"
                checked={m.id === selectedId}
                onChange={() => handleSelect(m.id)}
                className="accent-cyan-500"
              />
              <span className="truncate">{m.label}</span>
            </label>
          ))}
        </div>

        {/* ── Parameters (only for GLB models) ── */}
        {isGlb && (
          <div className="px-3 py-2 border-t border-white/10 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Параметры
            </div>
            <NumInput label="Масштаб" value={scale} step={0.1} onChange={setScale} />
            <NumInput label="Yaw °" value={yawOffsetDeg} step={5} onChange={setYawOffsetDeg} />

            <div className="text-[10px] uppercase tracking-wider text-white/40 mt-2 mb-1">
              Сдвиг (offset)
            </div>
            <NumInput label="X" value={offsetX} step={0.5} onChange={setOffsetX} />
            <NumInput label="Y" value={offsetY} step={0.5} onChange={setOffsetY} />
            <NumInput label="Z" value={offsetZ} step={0.5} onChange={setOffsetZ} />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex justify-between px-3 py-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-3 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            Отмена
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-[12px] rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              💾 Сохранить
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-[12px] rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
