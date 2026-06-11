# Система стыковки terrain-тайлов (Tile Seam System)

## Описание

Terrain тайлы загружаются по мере движения самолёта (lazy loading) и собираются в сетку.  
Каждый тайл — это `PlaneGeometry` с displacement по высотам из DEM (Mapbox Terrain-RGB).

Для того чтобы соседние тайлы стыковались без щелей, необходимо соблюдать три условия.

---

## Условие 1. Единый размер тайла (`tileWU`)

Все тайлы в сетке используют **один и тот же размер в World Units** — `tileWU`.  
Он берётся от центрального тайла сетки:

```ts
const midIdx = Math.floor(tiles.length / 2);
const baseTileSize = tiles[midIdx].data.worldUnits;
const tileWU = baseTileSize > 0 ? baseTileSize * 2 : 200;
const halfW = tileWU / 2;
```

**Почему это важно:**  
Каждый тайл имеет свой `worldUnits` (зависит от широты — тайл на экваторе больше, чем у полюса).  
Если каждый тайл использует свой `worldUnits`, то соседние тайлы будут иметь разный размер — появятся щели или нахлёсты.

**Что делать:**  
Всегда использовать `tileWU` центрального тайла для всех тайлов сетки:
- Размер геометрии: `geoWidth = tileWU`
- Шаг сетки вершин: `stepX = tileWU / segX`
- Смещение соседнего тайла: `offsetX = (x - refX) * tileWU`

---

## Условие 2. Глобальная минимальная высота (`globalMinElev`)

Все тайлы используют **одну и ту же точку отсчёта высоты** — глобальный минимум по всей сетке:

```ts
let globalMinElev = Infinity;
for (const { data } of tiles) {
  if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
}
// Для каждой вершины:
const hWu = (height - globalMinElev) / 40;
```

**Почему это важно:**  
DEM-высоты — это абсолютные метры над уровнем моря. Если каждый тайл вычитает свой локальный `minH`, то на стыке двух тайлов одна и та же точка рельефа получит разный Y:

| Тайл | minH | Точка на стыке (h=1700м) | Y в сцене |
|------|------|--------------------------|-----------|
| Левый | 1500м | (1700-1500)/40 = **5 WU** | выше |
| Правый | 1800м | (1700-1800)/40 = **-2.5 WU** | ниже |

Щель = 7.5 WU.

**Что делать:**  
Собрать `minElevation` со всех тайлов, взять глобальный минимум, использовать его для всех вершин.

---

## Условие 3. Стыковка позиций впритык (`offset`)

Смещение каждого тайла в сетке вычисляется от центрального тайла:

```ts
const refX = tiles[midIdx].coord.x;
const refY = tiles[midIdx].coord.y;

const offsetX = (x - refX) * tileWU;  // смещение по X в WU
const offsetZ = (y - refY) * tileWU;  // смещение по Z (y в Slippy Map)
```

**Геометрия тайла** простирается от `-halfW` до `+halfW` по обеим осям.  
Тогда правый край тайла 0 (X = `offset0_X + halfW`) совпадает с левым краем тайла 1 (X = `offset1_X - halfW`), если:

```
offset0_X + halfW = offset1_X - halfW
(x0 - refX) * tileWU + halfW = (x1 - refX) * tileWU - halfW
Для соседних тайлов: x1 = x0 + 1
(x0 - refX) * tileWU + halfW = (x0 + 1 - refX) * tileWU - halfW
x0*tileWU - refX*tileWU + halfW = x0*tileWU + tileWU - refX*tileWU - halfW
halfW = tileWU - halfW
halfW = halfW ✅
```

---

## Методика проверки стыковки по цветным маркерам

### Принцип

На углах двух соседних тайлов ставятся сферы двух цветов:
- **🔴 Красные** — на стыкующихся сторонах (восток тайла 0 = запад тайла 1)
- **🔵 Синие** — на не стыкующихся сторонах (запад тайла 0, восток тайла 1)

Если красные кружки совпадают — стык идеальный.  
Если разъехались — проблема в offsetX/offsetZ или tileWU.

### Цвета по позиции

| Позиция угла | Тайл 0 (левый) | Тайл 1 (правый) |
|--------------|----------------|-----------------|
| Восток (X = +halfW) | 🔴 красный | 🔵 синий |
| Запад (X = -halfW) | 🔵 синий | 🔴 красный |

### Формула проверки

```ts
// 🔴 Стык: восток tile0 vs запад tile1
red1 = NE(tile0) = (t0_offX + halfW, t0_offZ - halfW)
    vs NW(tile1) = (t1_offX - halfW, t1_offZ - halfW)
// dX = 0, dZ = -tileWU (разные Y в Slippy Map — нормально)

red2 = SE(tile0) = (t0_offX + halfW, t0_offZ + halfW)
    vs SW(tile1) = (t1_offX - halfW, t1_offZ + halfW)
// dX = 0, dZ = -tileWU

// 🔵 Не стык (для контроля):
blue1 = NW(tile0) vs NE(tile1)  // dX = -2*halfW = -tileWU
blue2 = SW(tile0) vs SE(tile1)  // dX = -2*halfW = -tileWU
```

**Если `red.dX === 0` — стык идеальный по X.**  
**Если `red.dX !== 0` — проблема в tileWU или offset.**

### Реализация в коде

```tsx
// Сохраняем в window для доступа из консоли
(window as any)[`_dbg_t${ti}_${cornerName}`] = { x: sx, z: sz, color };

// Сфера-маркер
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 12, 12),
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 })
);
sphere.position.set(sx, -5.8, sz);
sphere.frustumCulled = false;
group.add(sphere);
```

### Чтение результатов

В консоли браузера:

```js
// Все данные разом
window._dbg_result

// По отдельности
window._dbg_t0_NE  // восток тайла 0 (красный)
window._dbg_t1_NW  // запад тайла 1 (красный, должен совпасть)
window._dbg_t0_NW  // запад тайла 0 (синий)
window._dbg_t1_NE  // восток тайла 1 (синий)
```

---

## Типичные проблемы и их причины

| Проблема | dX | Причина |
|----------|----|---------|
| Красные совпадают ✅ | 0 | Стык ОК |
| Красные разъехались ❌ | > 0 | Разный `tileWU` у соседних тайлов |
| Красные разъехались ❌ | != tileWU | Ошибка в `offset` (refX/refY) |
| Тайлы по Z не стыкуются | 0 по X, > 0 по Z | Разные Y-координаты в Slippy Map — норма |
| Зазор по Y (вертикальный) | — | Разный `minH` у тайлов → использовать `globalMinElev` |
