const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-LHUmYaX8.js","assets/index-CPSOVAFD.css"])))=>i.map(i=>d[i]);
import { r as reactExports, R as React, j as jsxRuntimeExports, _ as __vitePreload } from "./index-LHUmYaX8.js";
const Inner3D = reactExports.lazy(() => __vitePreload(() => import("./index-LHUmYaX8.js").then((n) => n.a), true ? __vite__mapDeps([0,1]) : void 0));
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
