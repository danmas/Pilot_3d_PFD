/// <reference types="@react-three/fiber" />
/**
 * Aircraft3DInstrument.tsx — 3D-прибор «Самолёт в пространстве».
 *
 * Показывает процедурный самолётик в небесной сфере, ориентированный
 * по данным телеметрии (тангаж, крен, курс). Камера орбитирует вокруг
 * самолёта; доступны пресеты видов и кнопочное вращение.
 *
 * Регистрируется через registerPanelKitWidget и доступен в PanelBuilder.
 */
import React, { useRef, useCallback, Suspense, useState, useEffect, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import type { TelemetryFrame } from '../../types';
import { registerPanelKitWidget } from '../PanelKit';
import { HorizonSphere } from './aircraft3d/HorizonSphere';
import { AircraftModel } from './aircraft3d/AircraftModel';
import { Ground } from './aircraft3d/Ground';
import { Clouds } from './aircraft3d/Clouds';
import { WorldGroup } from './aircraft3d/WorldGroup';
// VelocityVector disabled — inherits airplane rotation + noisy telemetry = unstable
// import { VelocityVector } from './aircraft3d/VelocityVector';
import {
  CameraController,
  CAMERA_PRESETS,
  PROJECTION_LABELS,
  type CameraControls,
  type ProjectionType,
} from './aircraft3d/CameraController';
import { PRIMITIVE_MODEL, type ModelEntry, fetchModels } from './aircraft3d/modelConfig';
import { ModelDialog } from './aircraft3d/ModelDialog';

/* ─── helpers ─── */
const finite = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;
const fmt = (v: unknown, d = 1): string =>
  typeof v === 'number' && Number.isFinite(v) ? v.toFixed(d) : '—';

/* ─── Button definitions ─── */
const VIEW_BUTTONS = [
  { key: 'chase',   label: '🔵' },
  { key: 'top',     label: '🟢' },
  { key: 'side',    label: '🟡' },
  { key: 'cockpit', label: '🔴' },
];

const ROTATE_BUTTONS = [
  { az: -15, po:  0,  label: '◀' },
  { az:  15, po:  0,  label: '▶' },
  { az:   0, po:  15, label: '▲' },
  { az:   0, po: -15, label: '▼' },
];

/* ─── Scene (runs inside <Canvas>) ─── */
interface SceneProps {
  model: ModelEntry;
  cameraRef: React.RefObject<CameraControls | null>;
}

const Scene: React.FC<SceneProps> = ({ model, cameraRef }) => (
  <>
    {/* World group: ground, clouds, horizon — moves opposite to aircraft */}
    <WorldGroup>
      <HorizonSphere />
      <Ground />
      <Clouds />
    </WorldGroup>

    <AircraftModel model={model} />
    {/* VelocityVector disabled — chaotic due to noisy telemetry + inherited rotation */}
    <CameraController ref={cameraRef} />

    {/* Lighting */}
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 20, -10]} intensity={1.0} />
    <directionalLight position={[-5, 10, 5]} intensity={0.3} />
  </>
);

/* ─── Memoized Canvas wrapper (never re-renders on telemetry ticks) ─── */
interface Aircraft3DCanvasProps {
  model: ModelEntry;
  projection: ProjectionType;
  cameraRef: React.RefObject<CameraControls | null>;
}

const Aircraft3DCanvas: React.FC<Aircraft3DCanvasProps> = memo(({ model, projection, cameraRef }) => (
  <Canvas gl={{ antialias: true }} shadows>
    {/* Active camera (switched by projection type) */}
    {projection === 'ortho' ? (
      <OrthographicCamera makeDefault position={CAMERA_PRESETS.chase.position} zoom={40} near={0.1} far={500} />
    ) : (
      <PerspectiveCamera makeDefault position={CAMERA_PRESETS.chase.position} fov={projection === 'wide' ? 80 : 50} near={0.1} far={500} />
    )}
    <Scene model={model} cameraRef={cameraRef} />
  </Canvas>
));

/* ─── Loading placeholder ─── */
const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm select-none pointer-events-none">
    Загрузка 3D…
  </div>
);

/* ─── Main instrument component ─── */
const Aircraft3DInstrument: React.FC<{ frame: TelemetryFrame }> = memo(({ frame }) => {
  const cameraRef = useRef<CameraControls>(null);
  const [selectedModel, setSelectedModel] = useState<ModelEntry>(PRIMITIVE_MODEL);
  const [models, setModels] = useState<ModelEntry[]>([PRIMITIVE_MODEL]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projection, setProjection] = useState<ProjectionType>('perspective');

  // Загружаем манифест моделей при монтировании
  useEffect(() => {
    fetchModels().then(setModels);
  }, []);

  const pitch   = finite(frame.PitchAngle);
  const roll    = finite(frame.RollAngle);
  const heading = finite(frame.Heading1);
  const vy      = finite(frame.Vy);
  const cas     = finite(frame.CAS);
  const alt     = frame.RAltitude;

  const setPreset = useCallback((name: string) => cameraRef.current?.setPreset(name), []);
  const rotateBy  = useCallback((az: number, po: number) => cameraRef.current?.rotateBy(az, po), []);
  const resetView = useCallback(() => cameraRef.current?.reset(), []);
  const changeProjection = useCallback((type: ProjectionType) => {
    setProjection(type);
    cameraRef.current?.setProjection(type);
  }, []);

  /** Сохранить модели в models.json через bridge-plugin API */
  const handleSaveModels = useCallback(async (allModels: ModelEntry[]) => {
    // Сохраняем только GLB-модели (примитивная всегда добавляется автоматически)
    const glbModels = allModels.filter((m) => m.url != null);
    try {
      await fetch('/api/aircraft3d/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: glbModels }),
      });
      // Перечитываем после сохранения
      const refreshed = await fetchModels();
      setModels(refreshed);
    } catch (e) {
      console.error('[Aircraft3D] Failed to save models:', e);
    }
  }, []);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden select-none">
      {/* ── 3D Canvas (memoized — never re-renders on telemetry ticks) ── */}
      <Suspense fallback={<LoadingOverlay />}>
        <Aircraft3DCanvas
          model={selectedModel}
          projection={projection}
          cameraRef={cameraRef}
        />
      </Suspense>

      {/* ── HUD overlay ── */}
      <div className="absolute top-2 left-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none">
        <div>PITCH <span className="text-cyan-400">{fmt(pitch)}°</span></div>
        <div>ROLL{'  '}<span className="text-cyan-400">{fmt(roll)}°</span></div>
      </div>
      <div className="absolute top-2 right-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none text-right">
        <div>HDG <span className="text-cyan-400">{Math.round(heading).toString().padStart(3, '0')}°</span></div>
        <div>ALT <span className="text-orange-400">{fmt(alt, 0)} м</span></div>
      </div>
      <div className="absolute bottom-8 left-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none">
        <div>CAS <span className="text-green-400">{fmt(cas, 0)}</span></div>
        <div>Vy{'  '}<span className="text-green-400">{fmt(vy)}</span></div>
      </div>

      {/* ── Camera preset buttons (top centre) ── */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
        {VIEW_BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            title={key}
            className="px-2 py-0.5 text-[13px] rounded bg-white/15 hover:bg-white/30 text-white/90
                       backdrop-blur-sm transition-colors leading-none"
            onClick={() => setPreset(key)}
          >
            {label}
          </button>
        ))}
        {/* ── Projection selector ── */}
        <span className="mx-0.5 text-white/30 select-none">│</span>
        {(Object.keys(PROJECTION_LABELS) as ProjectionType[]).map((key) => (
          <button
            key={key}
            title={PROJECTION_LABELS[key]}
            className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
              ${projection === key
                ? 'bg-cyan-600/50 text-white font-medium'
                : 'bg-white/15 hover:bg-white/30 text-white/70'
              }`}
            onClick={() => changeProjection(key)}
          >
            {PROJECTION_LABELS[key]}
          </button>
        ))}
      </div>

      {/* ── Model button (bottom right) ── */}
      <button
        onClick={() => setDialogOpen(true)}
        className="absolute bottom-1.5 right-2 px-2 py-0.5 text-[11px] rounded bg-white/15 hover:bg-white/30
                   text-white/90 backdrop-blur-sm transition-colors leading-none"
        title="Выбор модели"
      >
        ✈ {selectedModel.label}
      </button>

      {/* ── Model dialog ── */}
      {dialogOpen && (
        <ModelDialog
          models={models}
          current={selectedModel}
          onApply={(m) => {
            setSelectedModel(m);
            setDialogOpen(false);
          }}
          onSave={handleSaveModels}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {/* ── Rotation + reset buttons (bottom centre) ── */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
        {ROTATE_BUTTONS.map(({ az, po, label }, i) => (
          <button
            key={i}
            className="px-2 py-0.5 text-[13px] rounded bg-white/15 hover:bg-white/30 text-white/90
                       backdrop-blur-sm transition-colors leading-none"
            onClick={() => rotateBy(az, po)}
          >
            {label}
          </button>
        ))}
        <button
          className="px-2 py-0.5 text-[13px] rounded bg-white/15 hover:bg-white/30 text-white/90
                     backdrop-blur-sm transition-colors leading-none ml-1"
          onClick={resetView}
        >
          ↺
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  const pf = prev.frame;
  const nf = next.frame;
  return (
    pf.PitchAngle === nf.PitchAngle &&
    pf.RollAngle === nf.RollAngle &&
    pf.Heading1 === nf.Heading1 &&
    pf.CAS === nf.CAS &&
    pf.Vy === nf.Vy &&
    pf.RAltitude === nf.RAltitude
  );
});

/* ─── Registration ─── */
registerPanelKitWidget({
  id: 'aircraft-3d',
  name: '3D Aircraft',
  iconName: 'Plane',
  Component: Aircraft3DInstrument,
  tooltip:
    '3D Aircraft — самолётик в небесной сфере: тангаж, крен, курс, вектор скорости. Управление камерой мышью и кнопками.',
  frameVariables: ['PitchAngle', 'RollAngle', 'Heading1', 'CAS', 'Vy', 'RAltitude'],
});

export default Aircraft3DInstrument;
