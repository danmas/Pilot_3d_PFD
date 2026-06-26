const MAP_CHANNEL = "pilot-map-state";
function tileKey(t) {
  return `${t.z}/${t.x}/${t.y}`;
}
function tileBounds(t) {
  const n = Math.pow(2, t.z);
  const lonLeft = t.x / n * 360 - 180;
  const lonRight = (t.x + 1) / n * 360 - 180;
  const latTopRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (t.y / n))));
  const latTop = latTopRad * 180 / Math.PI;
  const latBottomRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ((t.y + 1) / n))));
  const latBottom = latBottomRad * 180 / Math.PI;
  return [
    [latBottom, lonLeft],
    [latTop, lonRight]
  ];
}
export {
  MAP_CHANNEL as M,
  tileKey as a,
  tileBounds as t
};
