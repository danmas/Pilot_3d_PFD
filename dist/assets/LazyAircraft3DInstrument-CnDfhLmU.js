const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-DwShow9e.js","assets/index-D88IFt53.js","assets/main-BtMFd34c.css"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from "./main-DwShow9e.js";
import { r as reactExports, R as React, j as jsxRuntimeExports } from "./index-D88IFt53.js";
const Inner3D = reactExports.lazy(() => __vitePreload(() => import("./main-DwShow9e.js").then((n) => n.a), true ? __vite__mapDeps([0,1,2]) : void 0));
const LazyAircraft3DInstrument = ({ frame }) => {
  const [show, setShow] = reactExports.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);
  if (!show) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full bg-[#121212]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/30 text-sm", children: "Preparing 3D..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full bg-[#121212]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/30 text-sm", children: "Loading 3D engine..." }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Inner3D, { frame }) });
};
export {
  LazyAircraft3DInstrument as default
};
