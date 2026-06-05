/**
 * LazyAircraft3DInstrument.tsx — обёртка для динамической загрузки
 * Aircraft3DInstrument только когда пользователь открывает страницу.
 *
 * Компонент монтируется, но Three.js загружается только через
 * динамический import() при монтировании (через React.lazy внутри).
 * Пока Three.js не загружен — показываем простой div.
 */
import React, { Suspense, lazy, useState } from 'react';

const Inner3D = lazy(() => import('./Aircraft3DInstrument'));

interface Props {
  frame: any;
}

const LazyAircraft3DInstrument: React.FC<Props> = ({ frame }) => {
  const [show, setShow] = useState(false);

  // Откладываем загрузку Three.js на следующий тик после монтирования
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!show) {
    return <div className="flex items-center justify-center h-full bg-[#121212]">
      <div className="text-white/30 text-sm">Preparing 3D...</div>
    </div>;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-[#121212]">
        <div className="text-white/30 text-sm">Loading 3D engine...</div>
      </div>
    }>
      <Inner3D frame={frame} />
    </Suspense>
  );
};

export default LazyAircraft3DInstrument;
