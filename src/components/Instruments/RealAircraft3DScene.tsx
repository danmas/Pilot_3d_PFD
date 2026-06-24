/// <reference types="@react-three/fiber" />
/**
 * RealAircraft3DScene.tsx — полноценный 3D-движок «Самолёт в пространстве».
 *
 * Загружается только при VITE_ENABLE_AIRCRAFT_3D=true.
 * Содержит Three.js Canvas, сцену, модели, камеру, физику полёта.
 *
 * НЕ регистрируется в PanelKit самостоятельно — регистрация в Aircraft3DInstrument.tsx.
 */
import React, { useRef, useCallback, Suspense, useState, useEffect, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import type { TelemetryFrame } from '../../types';
import { HorizonSphere } from './aircraft3d/HorizonSphere';
import { AircraftModel } from './aircraft3d/AircraftModel';
import { GroundDisc } from './aircraft3d/Ground';
import { RealTerrainMesh } from './aircraft3d/terrain/RealTerrainMesh';
import { TerrainLogPanel } from './aircraft3d/terrain/TerrainLogPanel';
import { TerrainManager } from './aircraft3d/terrain/TerrainManager';
import type { TileCoord } from './aircraft3d/terrain/terrainTileUtils';
import { useRealTerrain } from '../../hooks/useRealTerrain';
import { useMapBroadcaster } from '../../map/useMapBroadcaster';
import { Runway } from './aircraft3d/Runway';
import { Clouds } from './aircraft3d/Clouds';
import { Trees } from './aircraft3d/Trees';
import { RedTree } from './aircraft3d/RedTree';
import { GridOverlay } from './aircraft3d/GridOverlay';
import { WorldGroup } from './aircraft3d/WorldGroup';
import { groundTouch } from './aircraft3d/aircraftPosition';
import { getSavedFdm, saveFdm, ImprovedFlightModel, SimpleFlightModel, applyFdmParamsToActive } from './aircraft3d/flightModel';
import {
  CameraController,
  CAMERA_PRESETS,
  PROJECTION_LABELS,
  type CameraControls,
  type ProjectionType,
} from './aircraft3d/CameraController';
import sceneConfig from './aircraft3d/sceneConfig.json';
import { PRIMITIVE_MODEL, type ModelEntry, fetchModels } from './aircraft3d/modelConfig';
import { ModelDialog } from './aircraft3d/ModelDialog';
import TouchControls from '../Controls/TouchControls';
import { APP_VERSION } from '../../version';
import { FlightModelDialog } from './aircraft3d/FlightModelDialog';
import { type ParamsState } from './aircraft3d/flightModelParams';
import { loadFdmParams } from './aircraft3d/flightModel';
import { aircraftPosition, locationRef } from './aircraft3d/aircraftPosition';

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
  useImprovedFdm?: boolean;
  showGrid?: boolean;
  realTerrainEnabled?: boolean;
  satelliteEnabled: boolean;
  realTerrainData: {
    tiles: Array<{ coord: import('./aircraft3d/terrain/terrainTileUtils').TileCoord; data: import('./aircraft3d/terrain/TerrainManager').TerrainTileData }>;
    loading: boolean;
    centerTile: import('./aircraft3d/terrain/terrainTileUtils').TileCoord | null;
  } | null;
  aircraftPos: { x: number; y: number; z: number };
  locationKey: string;
}

const Scene: React.FC<SceneProps> = ({ model, cameraRef, useImprovedFdm, showGrid, realTerrainEnabled, satelliteEnabled, realTerrainData, aircraftPos, locationKey }) => {
  return (
    <>
      <CameraController ref={cameraRef} />

    {/* Lighting */}
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 20, -10]} intensity={1.0} />
    <directionalLight position={[-5, 10, 5]} intensity={0.3} />

    {/* HorizonSphere is fixed in world space — outside WorldGroup */}
    {realTerrainEnabled && realTerrainData?.loading && (!realTerrainData?.tiles || realTerrainData.tiles.length === 0) && (
      <GroundDisc />
    )}

    <WorldGroup>
      {/* RealTerrainMesh внутри WorldGroup — движется вместе с землёй (ВПП, сетка, деревья) */}
      {realTerrainEnabled && realTerrainData?.tiles && realTerrainData.tiles.length > 0 ? (
        <RealTerrainMesh
          key={locationKey}
          tiles={realTerrainData.tiles}
          mode={satelliteEnabled ? 'realistic' : 'schematic'}
          centerTile={realTerrainData.centerTile}
        />
      ) : (
        <GroundDisc />
      )}

      <Runway />
      <Clouds />
      <Trees />
      <RedTree />
      {showGrid && <GridOverlay />}
    </WorldGroup>

    {/* Aircraft (static in world coords, rotates via useFrame) */}
    <AircraftModel model={model} useImprovedFdm={useImprovedFdm} />
    </>
  );
};

/* ─── Memoized Canvas wrapper (never re-renders on telemetry ticks) ─── */
interface Aircraft3DCanvasProps {
  model: ModelEntry;
  projection: ProjectionType;
  cameraRef: React.RefObject<CameraControls | null>;
  useImprovedFdm?: boolean;
  showGrid?: boolean;
  realTerrainEnabled?: boolean;
  satelliteEnabled: boolean;
  realTerrainData: {
    tiles: Array<{ coord: import('./aircraft3d/terrain/terrainTileUtils').TileCoord; data: import('./aircraft3d/terrain/TerrainManager').TerrainTileData }>;
    loading: boolean;
    centerTile: import('./aircraft3d/terrain/terrainTileUtils').TileCoord | null;
  } | null;
  aircraftPos: { x: number; y: number; z: number };
  locationKey: string;
}

const Aircraft3DCanvas: React.FC<Aircraft3DCanvasProps> = memo(({ model, projection, cameraRef, useImprovedFdm, showGrid, realTerrainEnabled, satelliteEnabled, realTerrainData, aircraftPos, locationKey }) => {
  const PROJ = sceneConfig.projection;
  return (
  <Canvas
    gl={{
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    }}
    onCreated={(state) => {
      if (!state.gl.getContextAttributes()) {
        console.warn('[Aircraft3D] WebGL context creation failed');
      }
    }}
    onError={(err) => console.error('[Aircraft3D] Canvas error:', err)}
  >
    {projection === 'ortho' ? (
      <OrthographicCamera makeDefault position={CAMERA_PRESETS.chase.position} zoom={40} near={0.1} far={PROJ.ortho.far} />
    ) : (
      <PerspectiveCamera makeDefault position={CAMERA_PRESETS.chase.position} fov={projection === 'wide' ? PROJ.wide.fov : PROJ.perspective.fov} near={0.1} far={PROJ.perspective.far} />
    )}
    <Scene model={model} cameraRef={cameraRef} useImprovedFdm={useImprovedFdm} showGrid={showGrid} realTerrainEnabled={realTerrainEnabled} satelliteEnabled={satelliteEnabled} realTerrainData={realTerrainData} aircraftPos={aircraftPos} locationKey={locationKey} />
  </Canvas>
  );
});

/* ─── Loading placeholder ─── */
const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm select-none pointer-events-none">
    Загрузка 3D…
  </div>
);

/* ─── Real 3D Scene component ─── */
const RealAircraft3DScene: React.FC<{ frame: TelemetryFrame }> = memo(({ frame }) => {
  const cameraRef = useRef<CameraControls>(null);
  const [selectedModel, setSelectedModel] = useState<ModelEntry>(PRIMITIVE_MODEL);
  const [models, setModels] = useState<ModelEntry[]>([PRIMITIVE_MODEL]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projection, setProjection] = useState<ProjectionType>('perspective');
  const [showTouchdown, setShowTouchdown] = useState(false);
  const [useImprovedFdm, setUseImprovedFdm] = useState(() => getSavedFdm() === 'improved');
  const [fdmDialogOpen, setFdmDialogOpen] = useState(false);
  const [fdmParamsState, setFdmParamsState] = useState<ParamsState>(() => loadFdmParams());
  const [showGrid, setShowGrid] = useState(() => {
    try { return localStorage.getItem('pilot-3d-pfd:showGrid') === 'true'; } catch { return false; }
  });
  const [realTerrainEnabled, setRealTerrainEnabled] = useState(() => {
    try { return localStorage.getItem('pilot-3d-pfd:realTerrain') === 'true'; } catch { return false; }
  });
  const [satelliteEnabled, setSatelliteEnabled] = useState(() => {
    try { return localStorage.getItem('pilot-3d-pfd:satelliteTerrain') !== 'false'; } catch { return true; }
  });
  const [loadAllCached, setLoadAllCached] = useState<{ loading: boolean; total: number; done: number }>({ loading: false, total: 0, done: 0 });
  const [currentLocation, setCurrentLocation] = useState(() => {
    try { return localStorage.getItem('pilot-3d-pfd:location') || sceneConfig.defaultLocation; } catch { return sceneConfig.defaultLocation; }
  });

  const realTerrain = useRealTerrain(
    frame.Latitude as number | undefined,
    frame.Longitude as number | undefined,
    realTerrainEnabled,
  );

  // Транслируем состояние сцены в окно Карты (BroadcastChannel)
  useMapBroadcaster(frame);

  /* ── Периодическая проверка groundTouch ── */
  useEffect(() => {
    let rafId: number;
    const check = () => {
      if (groundTouch.touched) {
        setShowTouchdown(true);
        // Сброс через 3.5 сек
        setTimeout(() => {
          setShowTouchdown(false);
          groundTouch.reset();
        }, 3500);
      }
      rafId = requestAnimationFrame(check);
    };
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    fetchModels().then(setModels);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      cameraRef.current?.reset();
    }, 500);
    return () => clearTimeout(t);
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

  const handleSaveModels = useCallback(async (allModels: ModelEntry[]) => {
    const glbModels = allModels.filter((m) => m.url != null);
    try {
      await fetch('/api/aircraft3d/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: glbModels }),
      });
      const refreshed = await fetchModels();
      setModels(refreshed);
    } catch (e) {
      console.error('[Aircraft3D] Failed to save models:', e);
    }
  }, []);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden select-none">
      <Suspense fallback={<LoadingOverlay />}>
        <Aircraft3DCanvas
          model={selectedModel}
          projection={projection}
          cameraRef={cameraRef}
          useImprovedFdm={useImprovedFdm}
          showGrid={showGrid}
          realTerrainEnabled={realTerrainEnabled}
          satelliteEnabled={satelliteEnabled}
          realTerrainData={{
            tiles: realTerrain.tiles,
            loading: realTerrain.loading,
            centerTile: realTerrain.centerTile,
          }}
          aircraftPos={{ x: 0, y: finite(alt), z: 0 }}
          locationKey={currentLocation}
        />
      </Suspense>

      <TouchControls />

      {/* HUD overlay */}
      <div className="absolute top-2 left-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none">
        <div>PITCH <span className="text-cyan-400">{fmt(pitch)}°</span></div>
        <div>ROLL{'  '}<span className="text-cyan-400">{fmt(roll)}°</span></div>
      </div>
      <div className="absolute top-2 right-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none text-right">
        <div>HDG <span className="text-cyan-400">{Math.round(heading).toString().padStart(3, '0')}°</span></div>
        <div>ALT <span className="text-orange-400">{fmt(alt, 0)} м</span></div>
        <div className="text-[9px] mt-1 opacity-40">FDM: {useImprovedFdm ? 'Improved' : 'Direct'}</div>
      </div>

      {/* Terrain log panel — под ALT справа вверху */}
      <TerrainLogPanel />
      <div className="absolute bottom-8 left-2 text-[11px] font-mono text-white/80 leading-tight pointer-events-none">
        <div>CAS <span className="text-green-400">{fmt(cas, 0)}</span></div>
        <div>Vy{'  '}<span className="text-green-400">{fmt(vy)}</span></div>
      </div>

      {/* Camera preset buttons */}
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
        <span className="mx-0.5 text-white/30 select-none">│</span>
        {/* FDM selector */}
        <button
          title={SimpleFlightModel.description}
          className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
            ${!useImprovedFdm
              ? 'bg-amber-600/50 text-white font-medium'
              : 'bg-white/15 hover:bg-white/30 text-white/70'
            }`}
          onClick={() => {
            setUseImprovedFdm(false);
            saveFdm('simple');
          }}
        >
          {SimpleFlightModel.label}
        </button>
        <button
          title={ImprovedFlightModel.description}
          className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
            ${useImprovedFdm
              ? 'bg-emerald-600/50 text-white font-medium'
              : 'bg-white/15 hover:bg-white/30 text-white/70'
            }`}
          onClick={() => {
            setUseImprovedFdm(true);
            saveFdm('improved');
          }}
        >
          {ImprovedFlightModel.label}
        </button>
        {/* FDM Settings button (only when improved) */}
        {useImprovedFdm && (
          <button
            onClick={() => setFdmDialogOpen(true)}
            className="px-1.5 py-0.5 text-[10px] rounded bg-white/15 hover:bg-cyan-600/50
                       text-white/90 backdrop-blur-sm transition-colors leading-none"
            title="Настройки FDM"
          >
            ⚙
          </button>
        )}
        {/* Grid toggle */}
        <button
          onClick={() => {
            const next = !showGrid;
            setShowGrid(next);
            try { localStorage.setItem('pilot-3d-pfd:showGrid', String(next)); } catch {}
          }}
          className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
            ${showGrid ? 'bg-green-600/50 text-white font-medium' : 'bg-white/15 hover:bg-white/30 text-white/70'}`}
          title="Сетка на земле"
        >
          ▦
        </button>
        {/* Real terrain toggle */}
        <button
          onClick={() => {
            const next = !realTerrainEnabled;
            setRealTerrainEnabled(next);
            try { localStorage.setItem('pilot-3d-pfd:realTerrain', String(next)); } catch {}
          }}
          className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
            ${realTerrainEnabled
              ? 'bg-cyan-600/50 text-white font-medium'
              : 'bg-white/15 hover:bg-white/30 text-white/70'}
            ${realTerrain.loading ? 'animate-pulse' : ''}`}
          title={realTerrainEnabled ? 'Реальный ландшафт' : 'Схематичный ландшафт'}
        >
          🏔
          {realTerrain.loading && ' ⟳'}
        </button>
        {/* Satellite toggle (only when realTerrain is on) */}
        {realTerrainEnabled && (
          <button
            onClick={() => {
              const next = !satelliteEnabled;
              setSatelliteEnabled(next);
              try { localStorage.setItem('pilot-3d-pfd:satelliteTerrain', String(next)); } catch {}
            }}
            className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
              ${satelliteEnabled
                ? 'bg-green-600/50 text-white font-medium'
                : 'bg-white/15 hover:bg-white/30 text-white/70'}`}
            title={satelliteEnabled ? 'Со спутниковой текстурой' : 'Без спутника (только рельеф)'}
          >
            🛰
          </button>
        )}
        {/* Load all cached terrain tiles */}
        {realTerrainEnabled && (
          <button
            onClick={async () => {
              setLoadAllCached({ loading: true, total: 0, done: 0 });
              const loaded = await TerrainManager.loadAllCached(locationRef.lat, locationRef.lon, (done, total) => {
                setLoadAllCached(prev => ({ ...prev, done, total }));
              });
              setLoadAllCached(prev => ({ ...prev, loading: false, done: loaded }));
            }}
            disabled={loadAllCached.loading}
            className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
              ${loadAllCached.loading
                ? 'bg-yellow-600/50 text-white animate-pulse'
                : 'bg-white/15 hover:bg-cyan-600/50 text-white/70'}`}
            title="Загрузить ВСЕ кэшированные тайлы (без интернета)"
          >
            📦{loadAllCached.loading && ` ${loadAllCached.done}/${loadAllCached.total}`}
          </button>
        )}
        {/* Location selector */}
        {realTerrainEnabled && (
          <>
            <span className="mx-0.5 text-white/30 select-none">│</span>
            {Object.entries(sceneConfig.locations).map(([id, loc]) => (
              <button
                key={id}
                onClick={() => {
                  locationRef.lat = loc.lat;
                  locationRef.lon = loc.lon;
                  aircraftPosition.set(0, 0, 0);
                  TerrainManager.clearAll();
                  setCurrentLocation(id);
                  try { localStorage.setItem('pilot-3d-pfd:location', id); } catch {}
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none
                  ${currentLocation === id
                    ? 'bg-cyan-600/50 text-white font-medium'
                    : 'bg-white/15 hover:bg-white/30 text-white/70'}`}
                title={loc.name}
              >
                {id === 'alps' ? '🏔️' : '🌲'} {loc.name.split(' ')[0]}
              </button>
            ))}
          </>
        )}

        {/* Open Map window */}
        <span className="mx-0.5 text-white/30 select-none">│</span>
        <button
          onClick={() => window.open('/map.html', 'pilot-map', 'width=1000,height=720')}
          className="px-1.5 py-0.5 text-[10px] rounded backdrop-blur-sm transition-colors leading-none bg-white/15 hover:bg-cyan-600/50 text-white/70"
          title="Открыть окно Карты тайлов"
        >
          🗺
        </button>
      </div>

      {/* Model button */}
      <button
        onClick={() => setDialogOpen(true)}
        className="absolute bottom-1.5 right-2 px-2 py-0.5 text-[11px] rounded bg-white/15 hover:bg-white/30
                   text-white/90 backdrop-blur-sm transition-colors leading-none"
        title="Выбор модели"
      >
        ✈ {selectedModel.label}
      </button>

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

      {fdmDialogOpen && (
        <FlightModelDialog
          paramsState={fdmParamsState}
          onApply={(state) => {
            setFdmParamsState(state);
            applyFdmParamsToActive(state.params);
            setFdmDialogOpen(false);
          }}
          onClose={() => setFdmDialogOpen(false)}
        />
      )}

      {/* ── TOUCHDOWN overlay ── */}
      {showTouchdown && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center">
            <div className="text-[clamp(2rem,8vw,6rem)] font-black text-red-500/90
                          [text-shadow:0_0_20px_rgba(239,68,68,0.6),0_0_60px_rgba(239,68,68,0.3)]
                          tracking-[0.15em] animate-pulse">
              TOUCHDOWN
            </div>
            <div className="text-sm font-mono text-white/60 mt-2 tracking-[0.1em]">
              LANDING DETECTED
            </div>
          </div>
        </div>
      )}

      {/* Rotation + reset buttons */}
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

      {/* Version */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/10 pointer-events-none">
        v{APP_VERSION}
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
    pf.RAltitude === nf.RAltitude &&
    pf.Latitude === nf.Latitude &&
    pf.Longitude === nf.Longitude
  );
});

export { RealAircraft3DScene };
