const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/RealAircraft3DScene-rcFdje4N.js","assets/index-D88IFt53.js","assets/mapProtocol-5I4fM8yB.js","assets/LazyAircraft3DInstrument-CnDfhLmU.js"])))=>i.map(i=>d[i]);
import { r as reactExports$1, j as jsxRuntimeExports$1, b as requireReactDom, R as React, c as clientExports } from "./index-D88IFt53.js";
const version = "2.15.0";
const pkg = {
  version
};
const APP_VERSION = pkg.version;
document.getElementById("boot-version").textContent = "v" + APP_VERSION;
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Icon = reactExports$1.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports$1.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports$1.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports$1.forwardRef(
    ({ className, ...props }, ref) => reactExports$1.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$z = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$z);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$y = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$y);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$x = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$x);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$w = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$w);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$v = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$v);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$u = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
];
const CircleDot = createLucideIcon("circle-dot", __iconNode$u);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$t = [
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Clock = createLucideIcon("clock", __iconNode$t);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$s = [
  ["path", { d: "M11 10.27 7 3.34", key: "16pf9h" }],
  ["path", { d: "m11 13.73-4 6.93", key: "794ttg" }],
  ["path", { d: "M12 22v-2", key: "1osdcq" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M14 12h8", key: "4f43i9" }],
  ["path", { d: "m17 20.66-1-1.73", key: "eq3orb" }],
  ["path", { d: "m17 3.34-1 1.73", key: "2wel8s" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "m20.66 17-1.73-1", key: "sg0v6f" }],
  ["path", { d: "m20.66 7-1.73 1", key: "1ow05n" }],
  ["path", { d: "m3.34 17 1.73-1", key: "nuk764" }],
  ["path", { d: "m3.34 7 1.73 1", key: "1ulond" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["circle", { cx: "12", cy: "12", r: "8", key: "46899m" }]
];
const Cog = createLucideIcon("cog", __iconNode$s);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$r = [
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      key: "9ktpf1"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Compass = createLucideIcon("compass", __iconNode$r);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$q = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$q);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$p = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }]
];
const Crosshair = createLucideIcon("crosshair", __iconNode$p);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$o = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
const Database = createLucideIcon("database", __iconNode$o);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$n = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$n);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$m = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }
  ],
  [
    "path",
    { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }
  ]
];
const FileJson = createLucideIcon("file-json", __iconNode$m);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$l = [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
];
const Gauge = createLucideIcon("gauge", __iconNode$l);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$k = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$k);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$j = [
  ["rect", { width: "7", height: "18", x: "3", y: "3", rx: "1", key: "2obqm" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }]
];
const LayoutPanelLeft = createLucideIcon("layout-panel-left", __iconNode$j);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$i = [
  ["rect", { width: "18", height: "7", x: "3", y: "3", rx: "1", key: "f1a2em" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }]
];
const LayoutPanelTop = createLucideIcon("layout-panel-top", __iconNode$i);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$h = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$h);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$g = [["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]];
const Mountain = createLucideIcon("mountain", __iconNode$g);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$f = [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
];
const Navigation = createLucideIcon("navigation", __iconNode$f);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$e = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode$e);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$d = [
  [
    "path",
    {
      d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
      key: "1v9wt8"
    }
  ]
];
const Plane = createLucideIcon("plane", __iconNode$d);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$c = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$c);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$b = [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
];
const Plug = createLucideIcon("plug", __iconNode$b);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$a = [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Radio = createLucideIcon("radio", __iconNode$a);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode$9);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$8);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  ["path", { d: "M12 19h8", key: "baeox8" }],
  ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]
];
const Terminal = createLucideIcon("terminal", __iconNode$7);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
];
const Thermometer = createLucideIcon("thermometer", __iconNode$6);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$5);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode$4);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }],
  ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }],
  ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const WifiOff = createLucideIcon("wifi-off", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2", key: "148xed" }],
  ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2", key: "1u4tom" }],
  ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2", key: "75valh" }]
];
const Wind = createLucideIcon("wind", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const sampleFrame = {
  "schema": "telemetry-frame.v1",
  "seq": 207132,
  "timeMs": 0,
  "replayTimeMs": 0,
  "receivedAt": "2026-05-18T08:07:17.214Z",
  "source": "tnparser-udp-14443",
  "PitchAngle": 4.286693572998047,
  "RollAngle": 0.17028671503067017,
  "MagneticHeading": -138.70814514160156,
  "CAS": 207.8125,
  "AoA": 4.6,
  "dec_RadioAltFt": 5120,
  "dec_BaroAltFt": 12e3,
  "BaroAltitude": 12e3,
  "Vy": -53,
  "NormalG": -0.00650033401325345,
  "dec_G": null,
  "DME_Distance": 49.296875,
  "HeadingSelect": null,
  "SpeedSelect": 200,
  "StandardAltitude": 2e4,
  "VerticalSpeedSelect": null,
  "FlightDirectorOn": null,
  "FD_PitchCmd": null,
  "FD_RollCmd": null
};
const sampleFrames = Array.from({ length: 300 }).map((_, i) => {
  const t = i / 300 * Math.PI * 2;
  return {
    ...sampleFrame,
    seq: sampleFrame.seq + i,
    timeMs: i * 33,
    replayTimeMs: i * 33,
    PitchAngle: 4.28 + Math.sin(t) * 10,
    RollAngle: Math.sin(t * 2) * 30,
    CAS: 207 + Math.sin(t) * 20,
    AoA: 4.6 + Math.cos(t) * 2,
    dec_BaroAltFt: 12e3 + Math.sin(t) * 500,
    Vy: Math.cos(t) * 3e3,
    dec_RadioAltFt: 5120 + Math.sin(t) * 500
  };
});
const FIELD_CATALOG = [
  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — основные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "RadioAltitude",
    param: "0164",
    comment: "Радиовысота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "DME_Distance",
    param: "0202",
    comment: "Дальность DME",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "MagneticHeading",
    param: "0320",
    comment: "Магнитный курс",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "RollAngle",
    param: "0325",
    comment: "Угол крена",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "PitchAngle",
    param: "0324",
    comment: "Угол тангажа",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "NormalG",
    param: "0333",
    comment: "Ny — нормальная перегрузка",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ДВИГАТЕЛИ
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Engine_N1_Left",
    param: "0346",
    comment: "Обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Target_Left",
    param: "0341",
    comment: "Целевые обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Right",
    param: "0346",
    comment: "Обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Target_Right",
    param: "0341",
    comment: "Целевые обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ТОПЛИВО
  // ══════════════════════════════════════════════════════════════════
  {
    key: "TotalFuel",
    param: "0247",
    comment: "Общее количество топлива",
    dataType: "Float",
    group: "ТОПЛИВО"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Шасси — замки убранного/выпущенного положения
  // ══════════════════════════════════════════════════════════════════
  {
    key: "LG_Uplock",
    param: "0270",
    comment: "ЛООШ на замке убрано (Left Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "LG_Downlock",
    param: "0270",
    comment: "ЛООШ на замке выпуска (Left Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_Uplock",
    param: "0271",
    comment: "ПООШ на замке убрано (Right Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_Downlock",
    param: "0271",
    comment: "ПООШ на замке выпуска (Right Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "NG_Uplock",
    param: "0270",
    comment: "ПОШ на замке убрано (Nose Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "NG_Downlock",
    param: "0270",
    comment: "ПОШ на замке выпуска (Nose Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ВСУ (вспомогательная силовая установка)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "APU_Speed",
    param: "005",
    comment: "Обороты ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_OilTemp",
    param: "0157",
    comment: "Температура масла ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_EGT",
    param: "024",
    comment: "Температура газа за турбиной ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_OilPressure",
    param: "007",
    comment: "Давление масла за фильтром ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  КСКВ (комплексная система кондиционирования воздуха)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "ECS_TargetTemp_1",
    param: "012",
    comment: "Целевая температура подачи 1 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  {
    key: "ECS_TargetTemp_2",
    param: "012",
    comment: "Целевая температура подачи 2 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  {
    key: "ECS_TargetTemp_4",
    param: "013",
    comment: "Целевая температура подачи 4 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  БРУ (блок ручного управления) / Flight Control Unit
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FCU_Roll_Left",
    param: "010",
    comment: "Левая БРУ по крену",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Pitch_Left",
    param: "006",
    comment: "Левая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Roll_Right",
    param: "011",
    comment: "Правая БРУ по крену",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Pitch_Right",
    param: "007",
    comment: "Правая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — расширенные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "StandardAltitude",
    param: "0203",
    comment: "Стандартная высота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "BaroAltitude",
    param: "0204",
    comment: "Барометрическая высота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "CAS",
    param: "0206",
    comment: "Вычисленная воздушная скорость (CAS)",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "MachNumber",
    param: "0205",
    comment: "Число Маха",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "AoA",
    param: "0241",
    comment: "AoA #1 — угол атаки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "Alpha",
    param: "0221",
    comment: "Индикаторный угол атаки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "Vy",
    param: "0212",
    comment: "Вертикальная скорость барометрическая",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "AutopilotOn",
    param: "0270",
    comment: "Включение автопилота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FlightDirectorOn",
    param: "0270",
    comment: "Включение пилотажного директора",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "HeadingHoldOn",
    param: "0274",
    comment: "Включение режима HDG",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "HeadingSelect",
    param: "0100",
    comment: "Заданное значение HDG",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "VerticalSpeedSelect",
    param: "0104",
    comment: "Заданная вертикальная скорость",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "SpeedSelect",
    param: "0103",
    comment: "Заданная скорость",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FD_RollCmd",
    param: "0141",
    comment: "Положение креновой директорной планки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FD_PitchCmd",
    param: "0140",
    comment: "Положение тангажной директорной планки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  КСУ — комплексная система управления (Flight Controls)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FlapsLever",
    param: "012",
    comment: "Положение ручки FLAPS",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "FlapsPosition",
    param: "063",
    comment: "Текущее положение закрылок",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "SlatsPosition",
    param: "063",
    comment: "Текущее положение предкрылков",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Center",
    param: "056",
    comment: "Положение интерцептора левого центрального",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Center",
    param: "057",
    comment: "Положение интерцептора правого центрального",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Outer",
    param: "056",
    comment: "Положение интерцептора левого внешнего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Inner",
    param: "056",
    comment: "Положение интерцептора левого внутреннего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Inner",
    param: "057",
    comment: "Положение интерцептора правого внутреннего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Outer",
    param: "057",
    comment: "Положение интерцептора правого внешнего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Airbrake_Inner_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внутренний (воздушный тормоз внутр.)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Airbrake_Outer_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внешний (воздушный тормоз внеш.)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "StabPosition",
    param: "060",
    comment: "Положение стабилизатора",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Upper",
    param: "055",
    comment: "Положение руля направления (верх)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Lower",
    param: "055",
    comment: "Положение руля направления (низ)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Middle",
    param: "055",
    comment: "Положение руля направления (середина)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "RudderTrim",
    param: "042",
    comment: "Триммер по курсу",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Right_Outer",
    param: "055",
    comment: "Положение правого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Left_Outer",
    param: "055",
    comment: "Положение левого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Left_Inner",
    param: "055",
    comment: "Положение левого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Right_Inner",
    param: "055",
    comment: "Положение правого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Right_Inner",
    param: "056",
    comment: "Положение правого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Left_Inner",
    param: "056",
    comment: "Положение левого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Left_Outer",
    param: "056",
    comment: "Положение левого элерона (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Right_Outer",
    param: "056",
    comment: "Положение правого элерона (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "AileronTrim",
    param: "042",
    comment: "Триммер по крену",
    dataType: "Float",
    group: "КСУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Шасси — обжатие (Weight-On-Wheels)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "NG_WOW",
    param: "0272",
    comment: "Обжатие ПОШ (Nose Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "LG_WOW",
    param: "0272",
    comment: "Обжатие ЛООШ (Left Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_WOW",
    param: "0272",
    comment: "Обжатие ПООШ (Right Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "WOW",
    param: "0272",
    comment: "Обжатие всех опор (Weight-On-Wheels all)",
    dataType: "Float",
    group: "ШАССИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статусные слова MIL-STD-1553
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_7",
    param: "",
    comment: "STATUS_7 — статусное слово 1553 (блок 3, линия 1, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_5",
    param: "",
    comment: "STATUS_5 — статусное слово 1553 (блок 3, линия 2, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_6",
    param: "",
    comment: "STATUS_6 — статусное слово 1553 (блок 3, линия 3, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_8",
    param: "",
    comment: "STATUS_8 — статусное слово 1553 (блок 3, линия 4, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статусы блоков ТН (телеметрический накопитель) по слотам
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_TN_0",
    param: "",
    comment: "STATUS_TN_0 — статус телеметрического блока 0",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_1",
    param: "",
    comment: "STATUS_TN_1 — статус телеметрического блока 1",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_2",
    param: "",
    comment: "STATUS_TN_2 — статус телеметрического блока 2",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_3",
    param: "",
    comment: "STATUS_TN_3 — статус телеметрического блока 3",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_4",
    param: "",
    comment: "STATUS_TN_4 — статус телеметрического блока 4",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_5",
    param: "",
    comment: "STATUS_TN_5 — статус телеметрического блока 5",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_6",
    param: "",
    comment: "STATUS_TN_6 — статус телеметрического блока 6",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_7",
    param: "",
    comment: "STATUS_TN_7 — статус телеметрического блока 7",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_8",
    param: "",
    comment: "STATUS_TN_8 — статус телеметрического блока 8",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_9",
    param: "",
    comment: "STATUS_TN_9 — статус телеметрического блока 9",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_10",
    param: "",
    comment: "STATUS_TN_10 — статус телеметрического блока 10",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_11",
    param: "",
    comment: "STATUS_TN_11 — статус телеметрического блока 11",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_12",
    param: "",
    comment: "STATUS_TN_12 — статус телеметрического блока 12",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_13",
    param: "",
    comment: "STATUS_TN_13 — статус телеметрического блока 13",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_14",
    param: "",
    comment: "STATUS_TN_14 — статус телеметрического блока 14",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_15",
    param: "",
    comment: "STATUS_TN_15 — статус телеметрического блока 15",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_16",
    param: "",
    comment: "STATUS_TN_16 — статус телеметрического блока 16",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_17",
    param: "",
    comment: "STATUS_TN_17 — статус телеметрического блока 17",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_18",
    param: "",
    comment: "STATUS_TN_18 — статус телеметрического блока 18",
    dataType: "Short",
    group: "STATUS"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Температуры блоков ТН
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Temp_TN_0",
    param: "",
    comment: "TEMP_TN_0 — температура телеметрического блока 0",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_1",
    param: "",
    comment: "TEMP_TN_1 — температура телеметрического блока 1",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_2",
    param: "",
    comment: "TEMP_TN_2 — температура телеметрического блока 2",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_3",
    param: "",
    comment: "TEMP_TN_3 — температура телеметрического блока 3",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_4",
    param: "",
    comment: "TEMP_TN_4 — температура телеметрического блока 4",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_5",
    param: "",
    comment: "TEMP_TN_5 — температура телеметрического блока 5",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_6",
    param: "",
    comment: "TEMP_TN_6 — температура телеметрического блока 6",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_7",
    param: "",
    comment: "TEMP_TN_7 — температура телеметрического блока 7",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_8",
    param: "",
    comment: "TEMP_TN_8 — температура телеметрического блока 8",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_9",
    param: "",
    comment: "TEMP_TN_9 — температура телеметрического блока 9",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_10",
    param: "",
    comment: "TEMP_TN_10 — температура телеметрического блока 10",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_11",
    param: "",
    comment: "TEMP_TN_11 — температура телеметрического блока 11",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_12",
    param: "",
    comment: "TEMP_TN_12 — температура телеметрического блока 12",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_13",
    param: "",
    comment: "TEMP_TN_13 — температура телеметрического блока 13",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_14",
    param: "",
    comment: "TEMP_TN_14 — температура телеметрического блока 14",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_15",
    param: "",
    comment: "TEMP_TN_15 — температура телеметрического блока 15",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_16",
    param: "",
    comment: "TEMP_TN_16 — температура телеметрического блока 16",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_17",
    param: "",
    comment: "TEMP_TN_17 — температура телеметрического блока 17",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_18",
    param: "",
    comment: "TEMP_TN_18 — температура телеметрического блока 18",
    dataType: "Float",
    group: "TEMP"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Time
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Time",
    param: "0150",
    comment: "Time — время (мс)",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  IG — система измерения газов
  // ══════════════════════════════════════════════════════════════════
  {
    key: "IG_RY1_Open",
    param: "0271",
    comment: "IG_RY1_open — реле 1 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY2_Open",
    param: "0272",
    comment: "IG_RY2_open — реле 2 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY3_Open",
    param: "0272",
    comment: "IG_RY3_open — реле 3 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY3_Close",
    param: "0272",
    comment: "IG_RY3_close — реле 3 закрыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_K1_Open",
    param: "0271",
    comment: "IG_K1_open — контактор 1 открыт",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_K2_Open",
    param: "0271",
    comment: "IG_K2_open — контактор 2 открыт",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_Block_Fault",
    param: "0271",
    comment: "IG_block_fault — неисправность блока",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_System_Fault",
    param: "0271",
    comment: "IG_system_fault — системная неисправность",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_O2_1",
    param: "046",
    comment: "IG_O2_1 — концентрация кислорода, датчик 1",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_O2_2",
    param: "046",
    comment: "IG_O2_2 — концентрация кислорода, датчик 2",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T3",
    param: "",
    comment: "IG_T3 — температура, датчик 3",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T4",
    param: "",
    comment: "IG_T4 — температура, датчик 4",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T5",
    param: "",
    comment: "IG_T5 — температура, датчик 5",
    dataType: "Float",
    group: "IG"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статика — параметры статической прочности
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Stat_L",
    param: "",
    comment: "Stat_L — статика левая (блок 3, слот 9, линия 1, задача 1, минор 7, offset 320 бит)",
    dataType: "Short",
    group: "СТАТИКА"
  },
  {
    key: "Stat_R",
    param: "",
    comment: "Stat_R — статика правая (блок 3, слот 9, линия 4, задача 1, минор 5, offset 560 бит)",
    dataType: "Short",
    group: "СТАТИКА"
  },
  {
    key: "Stat_Kil",
    param: "",
    comment: "Stat_Kil — статика киля (raw, блок 1, слот 1, канал 10)",
    dataType: "Int16",
    group: "СТАТИКА"
  },
  {
    key: "Stat_Stab",
    param: "",
    comment: "Stat_Stab — статика стабилизатора (raw, блок 1, слот 1, канал 9)",
    dataType: "Int16",
    group: "СТАТИКА"
  }
];
const RAW_SSE_URL = "/events/raw";
const AVAILABLE_PORTS = [14442, 14443, 14444, 14445];
const COMMENT_MAP = {};
for (const entry of FIELD_CATALOG) {
  const truncated = entry.comment.length > 30 ? entry.comment.slice(0, 30) + "…" : entry.comment;
  COMMENT_MAP[entry.key] = truncated;
}
function RawMonitor({ onBack }) {
  const [connStatus, setConnStatus] = reactExports$1.useState("idle");
  const [lastFrame, setLastFrame] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(null);
  const [error, setError] = reactExports$1.useState(null);
  const [showHex, setShowHex] = reactExports$1.useState(false);
  const [showAllKeys, setShowAllKeys] = reactExports$1.useState(false);
  const [watchPort, setWatchPort] = reactExports$1.useState(14442);
  const [portPending, setPortPending] = reactExports$1.useState(false);
  const eventSourceRef = reactExports$1.useRef(null);
  const connectSSE = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus("connecting");
    setError(null);
    console.log("[RAW-MONITOR-UI] Connecting SSE to", RAW_SSE_URL);
    const es = new EventSource(RAW_SSE_URL);
    eventSourceRef.current = es;
    es.addEventListener("open", () => {
      console.log("[RAW-MONITOR-UI] SSE connection opened");
      setConnStatus("waiting");
    });
    es.addEventListener("raw-frame", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[RAW-MONITOR-UI] raw-frame received, keys:", Object.keys(data.decoded || {}).length);
        setLastFrame(data);
        setConnStatus("receiving");
        setError(null);
      } catch {
        setError("Failed to parse raw-frame");
      }
    });
    es.addEventListener("status", (event) => {
      var _a;
      try {
        const s = JSON.parse(event.data);
        console.log("[RAW-MONITOR-UI] status received:", JSON.stringify(s));
        setStatus(s);
        if ((_a = s.source) == null ? void 0 : _a.udpPort) {
          setWatchPort(s.source.udpPort);
          setPortPending(false);
        }
        if (s.active) {
          const fresh = s.lastPacketAgeMs !== null && s.lastPacketAgeMs < 3e3;
          setConnStatus(fresh ? "receiving" : "waiting");
        }
      } catch {
      }
    });
    es.addEventListener("error", () => {
      console.error("[RAW-MONITOR-UI] SSE error, readyState:", es.readyState);
      setConnStatus("error");
      setError("SSE connection lost. Retrying...");
    });
  }, []);
  const disconnectSSE = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus("idle");
  }, []);
  const changePort = reactExports$1.useCallback(async (port) => {
    setPortPending(true);
    setWatchPort(port);
    try {
      const res = await fetch("/api/raw/port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port })
      });
      if (!res.ok) {
        setPortPending(false);
        setError(`Failed to switch port: ${res.status}`);
      }
    } catch (e) {
      setPortPending(false);
      setError(`Port switch failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);
  reactExports$1.useEffect(() => {
    connectSSE();
    return () => {
      disconnectSSE();
    };
  }, [connectSSE, disconnectSSE]);
  const statusColor = {
    idle: "bg-white/20",
    connecting: "bg-yellow-500",
    waiting: "bg-yellow-500",
    receiving: "bg-green-500",
    error: "bg-red-500"
  }[connStatus];
  const statusLabel = {
    idle: "idle",
    connecting: "connecting...",
    waiting: "waiting for data",
    receiving: "receiving",
    error: "error"
  }[connStatus];
  const decodedEntries = (lastFrame == null ? void 0 : lastFrame.decoded) ? Object.entries(lastFrame.decoded) : [];
  const displayEntries = showAllKeys ? decodedEntries : decodedEntries.slice(0, 20);
  const packetAge = (status == null ? void 0 : status.lastPacketAgeMs) !== null && (status == null ? void 0 : status.lastPacketAgeMs) !== void 0 ? `${status.lastPacketAgeMs}ms ago` : "—";
  const copyHex = () => {
    if (lastFrame == null ? void 0 : lastFrame.hex) navigator.clipboard.writeText(lastFrame.hex);
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex flex-col p-4", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-5xl mx-auto flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: onBack,
            className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-2 bg-emerald-500/20 text-emerald-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Monitor, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-lg tracking-tight", children: "Raw Data Monitor" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/50 text-sm", children: "Live parser output inspector" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${statusColor}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/60 text-sm", children: statusLabel })
        ] }),
        status && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4 text-white/40 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "packets: ",
            status.receivedPackets
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "frames: ",
            status.receivedFrames
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "age: ",
            packetAge
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm text-white/60", children: "Current Decoder Output" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plug, { className: "w-4 h-4 text-white/40" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "select",
          {
            value: watchPort,
            onChange: (e) => changePort(Number(e.target.value)),
            disabled: portPending,
            className: "bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white font-mono\n                         focus:outline-none focus:border-emerald-400/50 disabled:opacity-50\n                         appearance-none cursor-pointer hover:bg-white/15 transition",
            children: AVAILABLE_PORTS.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: p, className: "bg-[#1a1a2e] text-white", children: [
              "UDP :",
              p
            ] }, p))
          }
        ),
        portPending && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-yellow-400 text-xs animate-pulse", children: "switching..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${(status == null ? void 0 : status.active) ? "bg-green-500" : "bg-red-500"}` }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/40", children: (status == null ? void 0 : status.active) ? `${status.receivedPackets} pkts` : "no data" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-red-400 text-sm font-medium truncate max-w-[400px]", children: error })
    ] }),
    lastFrame ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-black/30 rounded-xl border border-white/5 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("h2", { className: "text-white/80 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(Radio, { className: "w-4 h-4 text-emerald-400" }),
            "Decoded Parameters",
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 font-normal", children: [
              "(",
              decodedEntries.length,
              " fields)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 text-xs", children: [
            "last: ",
            lastFrame.receivedAt ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "max-h-[500px] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("thead", { className: "sticky top-0 bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("tr", { className: "text-white/40 text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Parameter" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-left px-3 py-2 font-medium", children: "Comment" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("tbody", { className: "divide-y divide-white/5", children: displayEntries.map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "tr",
            {
              className: "hover:bg-white/[0.02] transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-4 py-2 text-white/70 font-mono text-xs", children: key }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-3 py-2 text-white/30 text-xs italic max-w-[220px] truncate", title: COMMENT_MAP[key], children: COMMENT_MAP[key] || "" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-4 py-2 text-right text-emerald-400 font-mono text-xs tabular-nums", children: Number.isFinite(value) ? value.toFixed(4) : String(value) })
              ]
            },
            key
          )) })
        ] }) }),
        decodedEntries.length > 20 && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setShowAllKeys(!showAllKeys),
            className: "w-full px-4 py-2 text-white/40 hover:text-white/70 text-xs flex items-center justify-center gap-1 border-t border-white/5 hover:bg-white/[0.02] transition",
            children: showAllKeys ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              "Show less ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronUp, { className: "w-3 h-3" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              "Show all ",
              decodedEntries.length,
              " fields ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronDown, { className: "w-3 h-3" })
            ] })
          }
        )
      ] }),
      lastFrame.hex && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-black/30 rounded-xl border border-white/5 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setShowHex(!showHex),
            className: "w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/80 text-sm font-semibold flex items-center gap-2", children: [
                showHex ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronDown, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronRight, { className: "w-4 h-4 text-white/40" }),
                "Raw Hex",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 font-normal text-xs", children: "(first 512 bytes)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    copyHex();
                  },
                  className: "p-1.5 hover:bg-white/10 rounded transition text-white/40 hover:text-white/80",
                  title: "Copy hex",
                  children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Copy, { className: "w-3.5 h-3.5" })
                }
              )
            ]
          }
        ),
        showHex && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "px-4 pb-4", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("pre", { className: "text-xs font-mono text-amber-400/70 bg-black/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto select-all", children: lastFrame.hex }) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-white/20 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(WifiOff, { className: "w-12 h-12" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-sm", children: "Waiting for decoder stream..." })
    ] })
  ] }) });
}
const UdpSourceDialog = ({ open, onClose }) => {
  const [host, setHost] = reactExports$1.useState("0.0.0.0");
  const [port, setPort] = reactExports$1.useState("14443");
  const [busy, setBusy] = reactExports$1.useState(false);
  const [error, setError] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(null);
  reactExports$1.useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      try {
        const res = await fetch("/api/source/status");
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data);
        setHost(data.udpHost);
        setPort(String(data.udpPort));
      } catch {
      }
    })();
  }, [open]);
  reactExports$1.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  const apply = async () => {
    const portNum = Number(port);
    if (!Number.isFinite(portNum) || portNum < 1 || portNum > 65535) {
      setError("Invalid UDP port (1-65535)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/source/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim() || "0.0.0.0", port: portNum })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error || "Failed to update source");
        return;
      }
      const next = await res.json();
      setStatus(next);
      onClose();
    } catch {
      setError("Failed to update source");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        "div",
        {
          className: "w-full max-w-md bg-[#161719] border border-[#2d2e30] rounded-lg shadow-2xl p-5",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "udp-dialog-title",
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { id: "udp-dialog-title", className: "text-sm font-bold text-white mb-4", children: "UDP Source" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide", children: "Host" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "input",
                  {
                    value: host,
                    onChange: (e) => setHost(e.target.value),
                    className: "w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50",
                    autoFocus: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide", children: "Port" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "input",
                  {
                    value: port,
                    onChange: (e) => setPort(e.target.value),
                    className: "w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50"
                  }
                )
              ] }),
              status && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[10px] text-gray-500 font-mono", children: [
                "active: ",
                status.active ? "yes" : "no",
                " | udp://",
                status.udpHost,
                ":",
                status.udpPort
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-red-400 text-xs", children: error })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  className: "px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#252628] rounded-md transition-colors",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => void apply(),
                  disabled: busy,
                  className: "px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-md transition-colors",
                  children: busy ? "Applying..." : "Apply"
                }
              )
            ] })
          ]
        }
      )
    }
  );
};
var reactDomExports = requireReactDom();
const UI_SETTINGS = {
  tooltip: {
    fontSizePx: 18
  }
};
const TooltipContext = reactExports$1.createContext(null);
const formatTelemetryTooltip = (description, frameVariables) => {
  if (!(frameVariables == null ? void 0 : frameVariables.length)) return description;
  return `${description}

Переменные фрейма:
${frameVariables.join("\n")}`;
};
const InstrumentTooltipProvider = ({ children }) => {
  const containerRef = reactExports$1.useRef(null);
  const [tooltip, setTooltip] = reactExports$1.useState(null);
  const getPosition = reactExports$1.useCallback((event) => {
    return {
      x: event.clientX + 14,
      y: event.clientY + 14
    };
  }, []);
  const value = reactExports$1.useMemo(() => ({
    showTooltip: (text, event) => setTooltip({ text, ...getPosition(event) }),
    moveTooltip: (event) => {
      setTooltip((current) => current ? { ...current, ...getPosition(event) } : current);
    },
    hideTooltip: () => setTooltip(null)
  }), [getPosition]);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(TooltipContext.Provider, { value, children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { ref: containerRef, className: "relative w-full h-full", children: [
    children,
    tooltip && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "div",
        {
          className: "fixed max-w-[min(560px,calc(100vw-16px))] whitespace-pre-wrap rounded-md border border-emerald-400/40 bg-black/90 px-3 py-2 text-left font-mono leading-tight text-white shadow-2xl pointer-events-none z-[9999]",
          style: {
            left: tooltip.x,
            top: tooltip.y,
            fontSize: UI_SETTINGS.tooltip.fontSizePx,
            transform: [
              tooltip.x > window.innerWidth * 0.65 ? "translateX(-100%)" : "",
              tooltip.y > window.innerHeight * 0.65 ? "translateY(-100%)" : ""
            ].filter(Boolean).join(" ") || void 0
          },
          children: tooltip.text
        }
      ),
      document.body
    )
  ] }) });
};
const SvgTooltipGroup = ({
  description,
  frameVariables,
  children,
  className,
  transform,
  clipPath
}) => {
  const tooltip = reactExports$1.useContext(TooltipContext);
  const text = formatTelemetryTooltip(description, frameVariables);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    "g",
    {
      className,
      transform,
      clipPath,
      onMouseEnter: (event) => tooltip == null ? void 0 : tooltip.showTooltip(text, event),
      onMouseMove: (event) => tooltip == null ? void 0 : tooltip.moveTooltip(event),
      onMouseLeave: () => tooltip == null ? void 0 : tooltip.hideTooltip(),
      children
    }
  );
};
const SplitContainer = ({ direction, ratio, onRatioChange, children }) => {
  const containerRef = reactExports$1.useRef(null);
  const handlePointerDown = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const startRect = container.getBoundingClientRect();
    const isVertical2 = direction === "vertical";
    const onPointerMove = (ev) => {
      let nextRatio = ratio;
      if (isVertical2) {
        const offset = ev.clientX - startRect.left;
        nextRatio = offset / startRect.width;
      } else {
        const offset = ev.clientY - startRect.top;
        nextRatio = offset / startRect.height;
      }
      nextRatio = Math.max(0.05, Math.min(nextRatio, 0.95));
      onRatioChange(nextRatio);
    };
    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };
  const isVertical = direction === "vertical";
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "div",
    {
      ref: containerRef,
      className: `w-full h-full flex ${isVertical ? "flex-row" : "flex-col"} overflow-hidden relative`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${ratio * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: children[0] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "div",
          {
            className: `group flex items-center justify-center z-10 flex-shrink-0 transition-all bg-[#0a0a0f]
          ${isVertical ? "w-2 h-full cursor-col-resize hover:bg-[#1e1f21]" : "h-2 w-full cursor-row-resize hover:bg-[#1e1f21]"}
        `,
            onPointerDown: handlePointerDown,
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: `bg-[#2d2e30] group-hover:bg-blue-500 transition-colors ${isVertical ? "w-[1px] h-full" : "h-[1px] w-full"}`
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "div",
          {
            style: { flex: `${(1 - ratio) * 100} 1 0%` },
            className: "overflow-hidden min-w-0 min-h-0",
            children: children[1]
          }
        )
      ]
    }
  );
};
const PanelMenuContext = reactExports$1.createContext(null);
const DEFAULT_MENU = {
  items: []
};
const PanelMenuProvider = ({ menu, actions, children }) => {
  const runAction = reactExports$1.useCallback(
    (action) => {
      const handler = actions[action];
      if (handler) {
        handler();
        return;
      }
      console.warn(`Unknown panel menu action: ${action}`);
    },
    [actions]
  );
  const value = reactExports$1.useMemo(
    () => {
      var _a;
      return {
        items: ((_a = menu == null ? void 0 : menu.items) == null ? void 0 : _a.length) ? menu.items : DEFAULT_MENU.items,
        runAction
      };
    },
    [menu, runAction]
  );
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelMenuContext.Provider, { value, children });
};
const usePanelMenu = () => {
  const ctx = reactExports$1.useContext(PanelMenuContext);
  if (!ctx) {
    throw new Error("usePanelMenu must be used within PanelMenuProvider");
  }
  return ctx;
};
const PanelCommandMenu = () => {
  const { items, runAction } = usePanelMenu();
  const [open, setOpen] = reactExports$1.useState(false);
  const rootRef = reactExports$1.useRef(null);
  reactExports$1.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  if (!items.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { ref: rootRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "button",
      {
        type: "button",
        className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors ml-1",
        title: "Panel commands",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: (e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        },
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "block w-[14px] text-center text-[14px] leading-none font-bold tracking-widest", children: "..." })
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "div",
      {
        role: "menu",
        className: "absolute top-full right-0 mt-1 min-w-[220px] py-1 bg-[#292a2d] border border-[#3c4043] rounded-lg shadow-xl z-50",
        onClick: (e) => e.stopPropagation(),
        children: items.map(
          (item, index) => item.type === "separator" ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "div",
            {
              role: "separator",
              className: "my-1 border-t border-[#3c4043]"
            },
            `sep-${index}`
          ) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: "w-full px-4 py-2 text-left text-[13px] text-[#e8eaed] hover:bg-[#3c4043] transition-colors",
              onClick: () => {
                setOpen(false);
                runAction(item.action);
              },
              children: item.label
            },
            `${item.action}-${index}`
          )
        )
      }
    )
  ] });
};
const GHOST_SIZE = 64;
function createGhost(widgetId) {
  const ghost = document.createElement("div");
  ghost.style.cssText = [
    "position:fixed",
    "pointer-events:none",
    "z-index:99999",
    `width:${GHOST_SIZE}px`,
    `height:${GHOST_SIZE}px`,
    "background:rgba(37,38,40,0.95)",
    "border:2px solid #3b82f6",
    "border-radius:8px",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:4px",
    "box-shadow:0 8px 32px rgba(59,130,246,0.3)",
    "transform:translate(-50%,-50%) scale(0.9)",
    "transition:transform 0.1s",
    "opacity:0.92"
  ].join(";");
  const label = document.createElement("span");
  label.textContent = widgetId;
  label.style.cssText = "font-size:8px;color:#60a5fa;text-transform:uppercase;font-weight:bold;letter-spacing:1px;";
  ghost.appendChild(label);
  return ghost;
}
function destroyGhost() {
  if (window.__touchDragState) {
    window.__touchDragState.ghost.remove();
    window.__touchDragState = void 0;
  }
}
function findDropZoneOrWidget(x, y) {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropWidget !== void 0) {
      return el;
    }
  }
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropZone === "true") {
      return el;
    }
  }
  return null;
}
function useSidebarTouchDrag() {
  const onTouchStart = (e, widgetId) => {
    if (window.__touchDragState) destroyGhost();
    const touch = e.touches[0];
    if (!touch) return;
    const ghost = createGhost(widgetId);
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.top = `${touch.clientY}px`;
    document.body.appendChild(ghost);
    window.__touchDragState = { widgetId, ghost };
    const handleTouchMove = (ev) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t || !window.__touchDragState) return;
      window.__touchDragState.ghost.style.left = `${t.clientX}px`;
      window.__touchDragState.ghost.style.top = `${t.clientY}px`;
      const zone = findDropZoneOrWidget(t.clientX, t.clientY);
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = z === zone ? "2px solid #3b82f6" : "";
          z.style.outlineOffset = z === zone ? "-2px" : "";
        }
      });
    };
    const handleTouchEnd = (ev) => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = "";
          z.style.outlineOffset = "";
        }
      });
      if (!window.__touchDragState) return;
      const changedTouch = ev.changedTouches[0];
      if (!changedTouch) {
        destroyGhost();
        return;
      }
      const zone = findDropZoneOrWidget(changedTouch.clientX, changedTouch.clientY);
      if (zone) {
        const dropEvent = new CustomEvent("touchdrop", {
          bubbles: true,
          cancelable: true,
          detail: { widgetId: window.__touchDragState.widgetId }
        });
        zone.dispatchEvent(dropEvent);
      }
      destroyGhost();
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  };
  return { onTouchStart };
}
function usePanelCanvasTouchDrop(ref, onDrop) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleTouchDrop = (e) => {
      const detail = e.detail;
      if (detail == null ? void 0 : detail.widgetId) {
        onDrop(detail.widgetId);
      }
    };
    el.addEventListener("touchdrop", handleTouchDrop);
    return () => {
      el.removeEventListener("touchdrop", handleTouchDrop);
    };
  }, [ref, onDrop]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleDrop = (e) => {
      var _a, _b;
      e.preventDefault();
      e.stopPropagation();
      const widgetId = ((_a = e.dataTransfer) == null ? void 0 : _a.getData("panelkit/widgetId")) || ((_b = e.dataTransfer) == null ? void 0 : _b.getData("instrumentId"));
      if (widgetId) {
        onDrop(widgetId);
      }
    };
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };
    el.addEventListener("drop", handleDrop);
    el.addEventListener("dragover", handleDragOver);
    return () => {
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("dragover", handleDragOver);
    };
  }, [ref, onDrop]);
}
const newId = () => Math.random().toString(36).substring(2, 9);
const PanelCanvas = ({
  node,
  onChange,
  onRemoveNode,
  isRoot,
  data,
  renderWidget
}) => {
  const canvasRef = reactExports$1.useRef(null);
  const clearRef = reactExports$1.useRef(() => {
  });
  clearRef.current = () => onChange({ ...node, type: "empty", widgetId: void 0 });
  usePanelCanvasTouchDrop(canvasRef, (widgetId) => {
    if (node.type === "empty" || node.type === "widget" && !node.widgetId) {
      onChange({ ...node, type: "widget", widgetId });
    } else if (node.type === "widget" && node.widgetId) {
      onChange({ ...node, widgetId });
    }
    if (window.__panelMoveSource) {
      const moveSource = window.__panelMoveSource;
      window.__panelMoveSource = void 0;
      setTimeout(() => moveSource.clearSource(), 0);
    }
  });
  const handleDragStart = (e) => {
    e.dataTransfer.setData("panelkit/widgetId", node.widgetId);
    e.dataTransfer.setData("instrumentId", node.widgetId);
    e.dataTransfer.effectAllowed = "copyMove";
    window.__panelMoveSource = {
      widgetId: node.widgetId,
      clearSource: () => clearRef.current()
    };
  };
  const handleDragEnd = () => {
    window.__panelMoveSource = void 0;
  };
  if (node.type === "split" && node.children) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SplitContainer,
      {
        direction: node.splitDirection,
        ratio: node.splitRatio ?? 0.5,
        onRatioChange: (nextRatio) => onChange({ ...node, splitRatio: nextRatio }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            PanelCanvas,
            {
              node: node.children[0],
              onChange: (child) => onChange({ ...node, children: [child, node.children[1]] }),
              onRemoveNode: () => onChange(node.children[1]),
              data,
              renderWidget
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            PanelCanvas,
            {
              node: node.children[1],
              onChange: (child) => onChange({ ...node, children: [node.children[0], child] }),
              onRemoveNode: () => onChange(node.children[0]),
              data,
              renderWidget
            }
          )
        ]
      }
    );
  }
  const handleSplit = (direction) => {
    onChange({
      id: node.id,
      type: "split",
      splitDirection: direction,
      splitRatio: 0.5,
      children: [
        { id: newId(), type: node.type, widgetId: node.widgetId },
        { id: newId(), type: "empty" }
      ]
    });
  };
  const isWidget = node.type === "widget" && !!node.widgetId;
  const isDraggable = isWidget && node.widgetId !== "aircraft-3d";
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "div",
    {
      ref: canvasRef,
      "data-drop-zone": "true",
      "data-drop-widget": isWidget ? "" : void 0,
      draggable: isDraggable,
      onDragStart: isDraggable ? handleDragStart : void 0,
      onDragEnd: isDraggable ? handleDragEnd : void 0,
      className: `w-full h-full relative group flex flex-col items-center justify-center
        ${node.type === "empty" ? "border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 cursor-pointer" : "bg-[#161719] border border-[#2d2e30]"}
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-1 right-1 hidden group-hover:flex space-x-1 z-20 bg-[#161719] rounded-sm p-1 shadow-lg border border-[#2d2e30]", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors",
              title: "Split Vertically (Left/Right)",
              onClick: (e) => {
                e.stopPropagation();
                handleSplit("vertical");
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutPanelLeft, { size: 14 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors",
              title: "Split Horizontally (Top/Bottom)",
              onClick: (e) => {
                e.stopPropagation();
                handleSplit("horizontal");
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutPanelTop, { size: 14 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelCommandMenu, {}),
          !isRoot && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-red-900/50 rounded-sm text-red-500 hover:text-red-400 transition-colors ml-1",
              title: "Remove Panel",
              onClick: (e) => {
                e.stopPropagation();
                onRemoveNode();
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
                    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
                  ]
                }
              )
            }
          )
        ] }),
        isWidget ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full", children: renderWidget(
          node,
          () => onChange({ ...node, type: "empty", widgetId: void 0 }),
          data
        ) }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center justify-center w-full h-full text-gray-500 pointer-events-none gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-6 h-6 border border-gray-600 flex items-center justify-center text-xs", children: "+H" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-6 h-6 border border-gray-600 flex items-center justify-center text-xs", children: "+V" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[9px] uppercase tracking-tighter hover:text-blue-400", children: "Drop Widget or Split" })
        ] })
      ]
    }
  );
};
const Sidebar = ({ items, getIcon }) => {
  const { onTouchStart } = useSidebarTouchDrag();
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("panelkit/widgetId", id);
    e.dataTransfer.setData("instrumentId", id);
    e.dataTransfer.effectAllowed = "copy";
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("aside", { className: "w-56 bg-[#161719] border-l border-[#2d2e30] flex flex-col z-20", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 border-b border-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest", children: "Library" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 p-2 grid grid-cols-2 gap-2 content-start overflow-y-auto", children: items.map((item) => {
      const Icon2 = getIcon(item.iconName);
      return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        "div",
        {
          draggable: true,
          onDragStart: (e) => handleDragStart(e, item.id),
          onTouchStart: (e) => onTouchStart(e, item.id),
          className: "aspect-square bg-[#252628] border border-[#2d2e30] flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing hover:bg-[#2d2e30] transition-colors group select-none touch-none",
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-gray-400 group-hover:text-blue-400 transition-colors flex items-center justify-center h-8", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Icon2, { size: 20, className: "stroke-2" }) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[8px] uppercase text-gray-400 group-hover:text-gray-200 transition-colors text-center w-full truncate px-1", children: item.name })
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-auto border-t border-[#2d2e30] p-3 bg-[#0a0a0f]", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[9px] text-gray-500 leading-tight uppercase", children: [
        "Nodes: ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-blue-400 text-xs font-mono", children: [
          items.length,
          " Elements"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-3 flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 h-1 bg-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-[45%] h-full bg-blue-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[8px] text-gray-600", children: "SYS_RDY" })
      ] })
    ] })
  ] });
};
const PANELKIT_ICONS = {
  Gauge,
  Activity,
  Navigation,
  Compass,
  Zap,
  Crosshair,
  Thermometer,
  Wind,
  Clock,
  Mountain,
  TrendingUp,
  Cog,
  Plane,
  CircleDot
};
const getPanelKitIcon = (iconName) => {
  return PANELKIT_ICONS[iconName] ?? Gauge;
};
const registry = /* @__PURE__ */ new Map();
const registerPanelKitWidget = (widget) => {
  registry.set(widget.id, widget);
};
const getRegisteredPanelKitWidget = (id) => registry.get(id);
const getAllRegisteredPanelKitWidgets = () => Array.from(registry.values());
const isPanelKitMenuConfig = (value) => {
  if (!value || typeof value !== "object") return false;
  const items = value.items;
  if (!Array.isArray(items)) return false;
  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    if (item.type === "separator") return true;
    if (item.type === "item") {
      return typeof item.label === "string" && typeof item.action === "string";
    }
    return false;
  });
};
const AviationWidget = ({ widgetId, frame, onRemove, readOnly = false }) => {
  const registered = getRegisteredPanelKitWidget(widgetId);
  if (!registered) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center text-red-500 relative group bg-[#161719]", children: [
      !readOnly && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            onRemove();
          },
          className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-20",
          title: "Remove Widget",
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "12",
              height: "12",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
              ]
            }
          )
        }
      ),
      "Unknown Widget"
    ] });
  }
  const Icon2 = getPanelKitIcon(registered.iconName);
  const WidgetComponent = registered.Component;
  const showLive = !!frame && !!WidgetComponent;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative group min-h-[100px] overflow-hidden bg-[#161719] flex flex-col items-center justify-center text-center", children: [
    !readOnly && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-30",
        title: "Remove Widget",
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "12",
            height: "12",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-2 left-2 text-[9px] font-mono bg-black/60 px-1 text-gray-400 border border-[#2d2e30] z-20 pointer-events-none", children: [
      "WIDGET_",
      registered.id.toUpperCase()
    ] }),
    showLive ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute inset-0 w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(InstrumentTooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(WidgetComponent, { frame }) }) }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white mb-2 relative z-10", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        Icon2,
        {
          size: 48,
          className: "stroke-1 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-gray-500 uppercase font-mono tracking-wider mt-1 z-10", children: registered.name }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none opacity-10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-48 h-[1px] bg-white" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-48 w-[1px] bg-white absolute" })
      ] })
    ] })
  ] });
};
const CURRENT_CONFIG_API$1 = "/api/panel/config/current";
const PANEL_MENU_API = "/api/panel/menu";
const CURRENT_CONFIG_FILE_NAME = "panel-config-current.json";
const createEmptyRoot = () => ({ id: "root", type: "empty" });
const normalizePanelNode = (value) => {
  if (!value || typeof value !== "object") return null;
  const node = value;
  if (typeof node.id !== "string" || typeof node.type !== "string") return null;
  if (node.type === "empty") {
    return { id: node.id, type: "empty" };
  }
  if (node.type === "instrument" || node.type === "widget") {
    const widgetId = typeof node.widgetId === "string" ? node.widgetId : typeof node.instrumentId === "string" ? node.instrumentId : void 0;
    return {
      id: node.id,
      type: widgetId ? "widget" : "empty",
      widgetId
    };
  }
  if (node.type === "split") {
    if (!Array.isArray(node.children) || node.children.length !== 2) return null;
    const first = normalizePanelNode(node.children[0]);
    const second = normalizePanelNode(node.children[1]);
    if (!first || !second) return null;
    return {
      id: node.id,
      type: "split",
      splitDirection: node.splitDirection === "horizontal" ? "horizontal" : "vertical",
      splitRatio: typeof node.splitRatio === "number" ? node.splitRatio : 0.5,
      children: [first, second]
    };
  }
  return null;
};
const toLegacyPanelNode = (node) => {
  if (node.type === "split" && node.children) {
    return {
      id: node.id,
      type: "split",
      splitDirection: node.splitDirection ?? "vertical",
      splitRatio: node.splitRatio ?? 0.5,
      children: [toLegacyPanelNode(node.children[0]), toLegacyPanelNode(node.children[1])]
    };
  }
  if (node.type === "widget") {
    return {
      id: node.id,
      type: "instrument",
      instrumentId: node.widgetId
    };
  }
  return { id: node.id, type: "empty" };
};
const TelemetryContext = reactExports$1.createContext({ frame: null });
const TelemetryProvider = ({ frame, children }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(TelemetryContext.Provider, { value: { frame }, children });
const useTelemetry = () => reactExports$1.useContext(TelemetryContext);
function AttitudeIndicator({ frame }) {
  const cx = 400, cy = 300;
  const finiteNumber2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const pitch = frame.PitchAngle ?? 0;
  const roll = frame.RollAngle ?? 0;
  const valid = Number.isFinite(pitch) && Number.isFinite(roll);
  if (!valid) return null;
  const pitchScale = 6;
  const yTranslate = pitch * pitchScale;
  const radioAlt = finiteNumber2(frame.RadioAltitude) ?? finiteNumber2(frame.dec_RadioAltFt) ?? 0;
  const fdPitch = frame.FD_PitchCmd ?? null;
  const fdRoll = frame.FD_RollCmd ?? null;
  const SKY = "#316499";
  const GND = "#603c15";
  const renderPitchLadder = () => {
    const ticks = [];
    for (let p = -90; p <= 90; p += 5) {
      if (p === 0) continue;
      const y = -p * pitchScale;
      const isMajor = p % 10 === 0;
      if (isMajor) {
        ticks.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-35", y1: "0", x2: "-20", y2: "0", stroke: "white", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: "0", x2: "35", y2: "0", stroke: "white", strokeWidth: "2" }),
            p === 10 || p === 20 || p === -10 || p === -20 ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-35", y1: "0", x2: "-35", y2: p > 0 ? 8 : -8, stroke: "white", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "35", y1: "0", x2: "35", y2: p > 0 ? 8 : -8, stroke: "white", strokeWidth: "2" })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-42", y: "6", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "sans-serif", children: Math.abs(p) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "42", y: "6", fill: "white", fontSize: "18", textAnchor: "start", fontFamily: "sans-serif", children: Math.abs(p) })
          ] }, p)
        );
      } else {
        ticks.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: -p * pitchScale, x2: "10", y2: -p * pitchScale, stroke: "white", strokeWidth: "2" }, p));
      }
    }
    return ticks;
  };
  const renderRollScaleTicks = () => {
    return [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map((angle) => {
      let tick;
      if (Math.abs(angle) === 10 || Math.abs(angle) === 20) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -5,-150 5,-150", fill: "none", stroke: "white", strokeWidth: "2" });
      } else if (Math.abs(angle) === 30 || Math.abs(angle) === 60) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -8,-142 8,-142", fill: "none", stroke: "white", strokeWidth: "2" });
      } else if (Math.abs(angle) === 45) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-160", x2: "0", y2: "-145", stroke: "white", strokeWidth: "2" });
      }
      return /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: `rotate(${angle})`, children: tick }, angle);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(${cx}, ${cy})`, children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "att-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "160" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#att-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `rotate(${-roll}) translate(0, ${yTranslate})`,
        description: "Авиагоризонт — положение самолёта относительно горизонта. Синий = небо, коричневый = земля.",
        frameVariables: ["PitchAngle", "RollAngle"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-250", y: "-300", width: "500", height: "600", fill: SKY }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-250", y: "0", width: "500", height: "300", fill: GND }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-250", y1: "0", x2: "250", y2: "0", stroke: "white", strokeWidth: "2" }),
          renderPitchLadder()
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Шкала крена — угол наклона на левое/правое крыло в градусах.",
        frameVariables: ["RollAngle"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: `M ${-160 * Math.sin(60 * Math.PI / 180)} ${-160 * Math.cos(60 * Math.PI / 180)} A 160 160 0 0 1 ${160 * Math.sin(60 * Math.PI / 180)} ${-160 * Math.cos(60 * Math.PI / 180)}`, fill: "none", stroke: "white", strokeWidth: "2" }),
          renderRollScaleTicks()
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Жёлтый неподвижный маркер нулевого крена на шкале авиагоризонта.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -10,-140 10,-140", fill: "none", stroke: "#FFEA00", strokeWidth: "3" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        transform: `rotate(${-roll})`,
        description: "Жёлтый указатель текущего крена. Красный крест — индикатор бокового скольжения.",
        frameVariables: ["RollAngle"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, -140)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,0 -12,18 12,18", fill: "none", stroke: "#FFEA00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "18", x2: "25", y2: "18", stroke: "#FFEA00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M-10,-5 L10,12 M-10,12 L10,-5", stroke: "red", strokeWidth: "3", opacity: "0.8" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -160 0 L -175 -8 L -175 8 Z", fill: "none", stroke: "white", strokeWidth: "2" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 160 0 L 175 -8 L 175 8 Z", fill: "none", stroke: "white", strokeWidth: "2" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Flight Director — команды автопилота: вертикальная линия = крен, горизонтальная линия = тангаж.",
        frameVariables: ["FD_PitchCmd", "FD_RollCmd"],
        children: [
          fdRoll !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-100", y1: "0", x2: "100", y2: "0", stroke: "#00FF00", strokeWidth: "1.5" }),
          fdPitch !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-100", x2: "0", y2: "100", stroke: "#00FF00", strokeWidth: "1.5" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(SvgTooltipGroup, { description: "Символ самолёта — неподвижная точка отсчёта пространственного положения ЛА.", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -130 0 L -40 0 L -40 18 L -25 18 L -25 4 L -130 4 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 130 0 L 40 0 L 40 18 L 25 18 L 25 4 L 130 4 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-5", y: "-5", width: "10", height: "10", fill: "black", stroke: "#FFEA00", strokeWidth: "2" })
    ] }),
    Number.isFinite(radioAlt) && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, 160)",
        description: "Радиовысотомер (Radio Altimeter) — высота над поверхностью земли в футах.",
        frameVariables: ["RadioAltitude", "dec_RadioAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-40", y: "-18", width: "80", height: "30", fill: "black" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: "5", fill: "#00FF00", fontSize: "24", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: Math.round(radioAlt) })
        ]
      }
    )
  ] });
}
function AirspeedTape({ frame }) {
  const TAPE_COLOR = "#818181";
  const speed = frame.CAS ?? 207.8;
  const valid = Number.isFinite(frame.CAS);
  const selectedSpeed = frame.SpeedSelect ?? null;
  const pxPerKnot = 4.5;
  const renderTicks = () => {
    const ticks = [];
    const minS = Math.floor(speed / 10) * 10 - 50;
    const maxS = Math.floor(speed / 10) * 10 + 50;
    for (let s = minS; s <= maxS; s += 10) {
      if (s < 0) continue;
      const y = (speed - s) * pxPerKnot;
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: "0", x2: "195", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "187", y: "7", fill: "white", fontSize: "22", textAnchor: "end", fontFamily: "sans-serif", children: s }),
          s + 5 <= maxS && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: -5 * pxPerKnot, x2: "200", y2: -5 * pxPerKnot, stroke: "white", strokeWidth: "2" })
        ] }, s)
      );
    }
    return ticks;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Лента приборной скорости — CAS (Calibrated Airspeed), узлы.",
        frameVariables: ["CAS"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "150", y: "60", width: "55", height: "460", fill: TAPE_COLOR }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "air-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "150", y: "60", width: "55", height: "460" }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#air-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 300)", children: valid && renderTicks() }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Заданная скорость автопилота (Selected Speed), узлы.",
        frameVariables: ["SpeedSelect"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "177", y: "45", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: selectedSpeed !== null ? Math.round(selectedSpeed).toString().padStart(3, "0") : "000" })
      }
    ),
    valid && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(150, 300)",
        description: "Текущая приборная скорость (CAS). Жёлтая линия — тренд изменения скорости.",
        frameVariables: ["CAS"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 0 0 L 15 -25 L 90 -25 L 90 25 L 15 25 Z", fill: "black", stroke: "white", strokeWidth: "1", transform: "translate(-85, 0)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-40", y: "8", fill: "white", fontSize: "28", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: Math.round(speed) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: "0", x2: "85", y2: "0", stroke: "#FFEA00", strokeWidth: "3" })
        ]
      }
    )
  ] });
}
function AltitudeTape({ frame }) {
  const TAPE_COLOR = "#818181";
  const finiteNumber2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const baroAltFt = finiteNumber2(frame.BaroAltitude) ?? finiteNumber2(frame.dec_BaroAltFt);
  const radioAltFt = finiteNumber2(frame.RadioAltitude) ?? finiteNumber2(frame.dec_RadioAltFt);
  const selectedAltFt = finiteNumber2(frame.StandardAltitude);
  const displayAlt = baroAltFt ?? radioAltFt ?? 12e3;
  const metricAlt = displayAlt * 0.3048;
  const pxPerFt = 0.55;
  const renderTicks = () => {
    const ticks = [];
    const minA = Math.floor(displayAlt / 100) * 100 - 400;
    const maxA = Math.floor(displayAlt / 100) * 100 + 400;
    for (let a = minA; a <= maxA; a += 100) {
      if (a < -1e3) continue;
      const y = (displayAlt - a) * pxPerFt;
      let val100 = Math.floor(a / 100);
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "600", y1: "0", x2: "610", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "645", y: "7", fill: "white", fontSize: "22", textAnchor: "end", fontFamily: "sans-serif", children: val100 }),
          a + 50 <= maxA && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "600", y1: -50 * pxPerFt, x2: "605", y2: -50 * pxPerFt, stroke: "white", strokeWidth: "2" })
        ] }, a)
      );
    }
    return ticks;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Лента барометрической высоты — сотни футов.",
        frameVariables: ["BaroAltitude", "dec_BaroAltFt", "RadioAltitude", "dec_RadioAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "600", y: "60", width: "55", height: "460", fill: TAPE_COLOR }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "alt-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "600", y: "60", width: "55", height: "460" }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#alt-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 300)", children: renderTicks() }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Заданная высота автопилота (Selected Altitude), футы.",
        frameVariables: ["StandardAltitude"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "627", y: "45", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: selectedAltFt !== null ? Math.round(selectedAltFt) : "0200" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Нижняя часть цифрового окна высоты — последние две цифры футов.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "627", y: "550", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: "000" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(560, 300)",
        description: "Текущая барометрическая высота. Зелёный текст — высота в метрах.",
        frameVariables: ["BaroAltitude", "dec_BaroAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M0,0 L15,-35 L100,-35 L100,35 L15,35 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "15", y1: "-12", x2: "100", y2: "-12", stroke: "#FFEA00", strokeWidth: "1" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "95", y: "-16", fill: "#00FF00", fontSize: "18", textAnchor: "end", fontFamily: "sans-serif", children: [
            Math.round(metricAlt),
            " M"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "24", fill: "#00FF00", fontSize: "34", fontWeight: "bold", textAnchor: "end", fontFamily: "sans-serif", children: Math.floor(displayAlt / 100) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "14", fill: "#00FF00", fontSize: "22", textAnchor: "start", fontFamily: "sans-serif", children: "00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "-4", fill: "#00FF00", fontSize: "14", fillOpacity: "0.8", textAnchor: "start", fontFamily: "sans-serif", children: "20" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "32", fill: "#00FF00", fontSize: "14", fillOpacity: "0.8", textAnchor: "start", fontFamily: "sans-serif", children: "80" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "0", x2: "0", y2: "0", stroke: "white", strokeWidth: "2" })
        ]
      }
    )
  ] });
}
function VerticalSpeed({ frame }) {
  const TAPE_COLOR = "#818181";
  const vs = frame.Vy ?? 0;
  const getVsY = (val) => {
    const abs = Math.abs(val);
    const sign = Math.sign(val);
    let y = 0;
    if (abs <= 1) y = abs / 1 * 45;
    else if (abs <= 3) y = 45 + (abs - 1) / 2 * 45;
    else y = 90 + (abs - 3) / 3 * 55;
    return y * -sign;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Вариометр — вертикальная скорость (набор высоты / снижение), м/с. Зелёная линия — текущее значение.",
        frameVariables: ["Vy"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 680 160 L 730 160 L 730 440 L 680 440 L 660 390 L 660 210 Z", fill: TAPE_COLOR })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, 300)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          description: "Шкала вариометра — деления вертикальной скорости в м/с.",
          frameVariables: ["Vy"],
          children: [6, 3, 1, 0, -1, -3, -6].map((v) => {
            const y = getVsY(v);
            const isZero = v === 0;
            return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "660", y1: "0", x2: isZero ? "675" : "670", y2: "0", stroke: "white", strokeWidth: "2" }),
              !isZero && /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "680", y: "7", fill: "white", fontSize: "20", textAnchor: "start", fontFamily: "sans-serif", children: Math.abs(v) })
            ] }, v);
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          description: "Зелёная линия — текущая вертикальная скорость.",
          frameVariables: ["Vy"],
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "640", y1: getVsY(vs / 1e3), x2: "720", y2: getVsY(vs / 1e3), stroke: "#00FF00", strokeWidth: "3" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        SvgTooltipGroup,
        {
          description: "Нулевая вертикальная скорость — горизонтальный полёт.",
          frameVariables: ["Vy"],
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 670 -12 L 660 -12 L 660 12 L 670 12", fill: "none", stroke: "#00FFFF", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "663", y: "-5", width: "4", height: "10", fill: "#00FFFF" })
          ]
        }
      )
    ] })
  ] });
}
function AoATape({ frame }) {
  const TAPE_COLOR = "#818181";
  const aoa = frame.AoA ?? 4.6;
  const g = frame.dec_G ?? null;
  const getAoAY = (v) => {
    return (aoa - v) * 16.5;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Шкала угла атаки (AoA — Angle of Attack), градусы.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 120 160 L 120 440 L 90 440 L 70 390 L 70 210 L 90 160 Z", fill: TAPE_COLOR })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Текущий угол атаки — угол между крылом и набегающим потоком, градусы.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "100", y: "145", fill: "#00FF00", fontSize: "20", textAnchor: "middle", fontFamily: "sans-serif", children: aoa.toFixed(1) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, 300)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "aoa-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 120 -140 L 120 140 L 90 140 L 70 90 L 70 -90 L 90 -140 Z" }) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          clipPath: "url(#aoa-clip)",
          description: "Деления шкалы AoA в градусах.",
          frameVariables: ["AoA"],
          children: [20, 15, 10, 5, 0, -5].map((v) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${getAoAY(v)})`, children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "110", y1: "0", x2: "120", y2: "0", stroke: "white", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "105", y: "7", fill: "white", fontSize: "20", textAnchor: "end", fontFamily: "sans-serif", children: v })
          ] }, v))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Зелёный указатель текущего AoA на шкале.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: `M 60 300 L 120 300`, stroke: "#00FF00", strokeWidth: "3" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Перегрузка G — текущая вертикальная перегрузка.",
        frameVariables: ["dec_G"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "65", y: "495", fill: "white", fontSize: "24", fontFamily: "sans-serif", children: "G" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "115", y: "495", fill: g !== null ? "white" : "#FF9800", fontSize: "24", textAnchor: "end", fontFamily: "sans-serif", fontWeight: "bold", children: g !== null ? g.toFixed(1) : "- -" })
        ]
      }
    )
  ] });
}
function PFD({ frame }) {
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-black font-sans overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      className: "w-full h-full absolute inset-0",
      viewBox: "0 0 800 600",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AttitudeIndicator, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AirspeedTape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AoATape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AltitudeTape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(VerticalSpeed, { frame })
      ]
    }
  ) });
}
const PFDInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(PFD, { frame }) });
registerPanelKitWidget({
  id: "pfd",
  name: "Flight Display",
  iconName: "Activity",
  Component: PFDInstrument,
  tooltip: "Flight Display — основной пилотажный индикатор: авиагоризонт, скорость, высота, вариометр, AoA, G и команды Flight Director.",
  frameVariables: [
    "PitchAngle",
    "RollAngle",
    "RadioAltitude",
    "dec_RadioAltFt",
    "FD_PitchCmd",
    "FD_RollCmd",
    "CAS",
    "SpeedSelect",
    "AoA",
    "dec_G",
    "BaroAltitude",
    "dec_BaroAltFt",
    "StandardAltitude",
    "Vy"
  ]
});
const AttitudeInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "200 100 400 420", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AttitudeIndicator, { frame }) }) });
registerPanelKitWidget({
  id: "attitude",
  name: "Attitude Indicator",
  iconName: "Crosshair",
  Component: AttitudeInstrument,
  tooltip: "Attitude Indicator — положение самолёта относительно горизонта: тангаж, крен, радиовысота и команды Flight Director.",
  frameVariables: [
    "PitchAngle",
    "RollAngle",
    "RadioAltitude",
    "dec_RadioAltFt",
    "FD_PitchCmd",
    "FD_RollCmd"
  ]
});
const AirspeedInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "60 30 180 540", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AirspeedTape, { frame }) }) });
registerPanelKitWidget({
  id: "airspeed",
  name: "Airspeed",
  iconName: "Gauge",
  Component: AirspeedInstrument,
  tooltip: "Airspeed — лента приборной скорости CAS и заданная скорость автопилота.",
  frameVariables: [
    "CAS",
    "SpeedSelect"
  ]
});
const AltitudeInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "525 30 145 540", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AltitudeTape, { frame }) }) });
registerPanelKitWidget({
  id: "altitude",
  name: "Altitude",
  iconName: "Mountain",
  Component: AltitudeInstrument,
  tooltip: "Altitude — лента высоты: барометрическая высота, fallback на радиовысоту, метрическая индикация и заданная высота.",
  frameVariables: [
    "BaroAltitude",
    "dec_BaroAltFt",
    "RadioAltitude",
    "dec_RadioAltFt",
    "StandardAltitude"
  ]
});
const VerticalSpeedInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "630 145 115 320", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(VerticalSpeed, { frame }) }) });
registerPanelKitWidget({
  id: "vertical-speed",
  name: "Vertical Speed",
  iconName: "TrendingUp",
  Component: VerticalSpeedInstrument,
  tooltip: "Vertical Speed — вариометр, показывает вертикальную скорость набора или снижения.",
  frameVariables: [
    "Vy"
  ]
});
const AoAInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "45 125 95 385", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AoATape, { frame }) }) });
registerPanelKitWidget({
  id: "aoa",
  name: "Angle of Attack",
  iconName: "Wind",
  Component: AoAInstrument,
  tooltip: "Angle of Attack — угол атаки и текущая вертикальная перегрузка G.",
  frameVariables: [
    "AoA",
    "dec_G"
  ]
});
const finiteNumber$4 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const NavDisplayInstrument = ({ frame }) => {
  let heading = finiteNumber$4(frame.MagneticHeading) ?? 0;
  heading = heading % 360;
  if (heading < 0) heading += 360;
  const selectedHeading = finiteNumber$4(frame.HeadingSelect) ?? 220;
  const dme = finiteNumber$4(frame.DME_Distance);
  const renderCompassRose = () => {
    const elements = [];
    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 10 === 0;
      const length = isMajor ? 14 : 7;
      elements.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "line",
          {
            x1: "0",
            y1: -140,
            x2: "0",
            y2: -140 - length,
            stroke: "white",
            strokeWidth: isMajor ? 2 : 1.5,
            transform: `rotate(${i})`
          },
          `tick-${i}`
        )
      );
      if (i % 30 === 0) {
        let label = (i / 10).toString();
        if (i === 0) label = "N";
        if (i === 90) label = "E";
        if (i === 180) label = "S";
        if (i === 270) label = "W";
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "text",
            {
              x: "0",
              y: "-110",
              fill: "white",
              fontSize: "22",
              fontWeight: "bold",
              textAnchor: "middle",
              fontFamily: "sans-serif",
              transform: `rotate(${i})`,
              children: label
            },
            `label-${i}`
          )
        );
      }
      if (i % 90 === 45) {
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "polygon",
            {
              points: "0,-138 -6,-124 6,-124",
              fill: "none",
              stroke: "white",
              strokeWidth: "2",
              transform: `rotate(${i})`
            },
            `tri-${i}`
          )
        );
      }
    }
    return elements;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      viewBox: "0 0 600 400",
      className: "w-full h-full",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            description: "Заданный курс автопилота, градусы.",
            frameVariables: ["HeadingSelect"],
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "30", y: "50", fill: "white", fontSize: "22", fontFamily: "sans-serif", children: [
              "HDG",
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("tspan", { fill: "#00FFFF", children: [
                Math.round(selectedHeading).toString().padStart(3, "0"),
                " °"
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(480, 80)",
            description: "NAV-блок: курсовые/радионавигационные данные и DME-дистанция.",
            frameVariables: ["DME_Distance"],
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", fontSize: "20", fontFamily: "sans-serif", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "10", y: "0", fill: "#00FFFF", textAnchor: "end", letterSpacing: "4", children: "---" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "0", children: "A" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "10", y: "30", fill: "#00FFFF", textAnchor: "end", letterSpacing: "4", children: "---" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "30", children: "°" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "text",
                {
                  x: "10",
                  y: "60",
                  fill: "#FFA500",
                  textAnchor: "end",
                  letterSpacing: dme === null ? "4" : "0",
                  children: dme !== null && dme !== void 0 ? dme.toFixed(1) : "---"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "60", children: "NM" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(300, 200)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `rotate(${-heading})`,
              description: "Компасная роза — текущий магнитный курс разворачивает шкалу относительно самолёта.",
              frameVariables: ["MagneticHeading"],
              children: [
                renderCompassRose(),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: `rotate(${selectedHeading}) translate(0, -154)`, children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "path",
                  {
                    d: "M -12 0 L -12 -8 L 12 -8 L 12 0 L 6 0 L 6 -4 L -6 -4 L -6 0 Z",
                    fill: "#00FFFF"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Жёлтый индекс самолёта — неподвижная отметка текущего направления.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "polygon",
            {
              points: "0,-156 -10,-174 10,-174",
              fill: "none",
              stroke: "#FFEA00",
              strokeWidth: "2"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-160", y1: "0", x2: "-180", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "160", y1: "0", x2: "180", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "160", x2: "0", y2: "180", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Символ самолёта в центре навигационного дисплея.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#FFEA00", strokeWidth: "4", fill: "none", strokeLinecap: "square", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-30", x2: "0", y2: "25" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "-5", x2: "25", y2: "-5" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "20", x2: "12", y2: "20" })
          ] }) })
        ] })
      ]
    }
  ) });
};
registerPanelKitWidget({
  id: "nav-display",
  name: "Nav Display",
  iconName: "Compass",
  Component: NavDisplayInstrument,
  tooltip: "Nav Display — компасная роза, текущий магнитный курс, заданный курс и DME-дистанция.",
  frameVariables: [
    "MagneticHeading",
    "HeadingSelect",
    "DME_Distance"
  ]
});
const finiteNumber$3 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function polarToCartesian$2(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian$2(x, y, radius, endAngle);
  const end = polarToCartesian$2(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
const arcs = [
  // left side (ny)
  { r: 160, start: 185, end: 220, color: "#FF0000" },
  { r: 160, start: 220, end: 240, color: "#FFA500" },
  { r: 160, start: 240, end: 330, color: "#FFFFFF" },
  { r: 160, start: 330, end: 345, color: "#FFA500" },
  { r: 160, start: 345, end: 355, color: "#FF0000" },
  // right side (alpha)
  { r: 160, start: 4, end: 50, color: "#FF0000" },
  { r: 160, start: 50, end: 70, color: "#FFA500" },
  { r: 160, start: 70, end: 140, color: "#FFFFFF" },
  { r: 160, start: 140, end: 155, color: "#FFA500" },
  { r: 160, start: 155, end: 175, color: "#FF0000" },
  // cyan bracket
  { r: 170, start: 65, end: 130, color: "#00FFFF" }
];
function LoadsGauge({ frame }) {
  const normalG = finiteNumber$3(frame.NormalG);
  const ny = normalG !== null ? normalG + 1 : 1;
  const alpha = finiteNumber$3(frame.AoA) ?? 4.7;
  const angleNy = 240 + ny * 30;
  const angleAlpha = 120 - alpha * (30 / 9);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 400 400", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Шкала перегрузки Ny и угла атаки Alpha.",
        frameVariables: ["NormalG", "AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "200", cy: "200", r: "195", fill: "black" }),
          arcs.map((a, i) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: describeArc(200, 200, a.r, a.start, a.end), fill: "none", stroke: a.color, strokeWidth: "6" }, i)),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: polarToCartesian$2(200, 200, 170, 65).x, y1: polarToCartesian$2(200, 200, 170, 65).y, x2: polarToCartesian$2(200, 200, 160, 65).x, y2: polarToCartesian$2(200, 200, 160, 65).y, stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: polarToCartesian$2(200, 200, 170, 130).x, y1: polarToCartesian$2(200, 200, 170, 130).y, x2: polarToCartesian$2(200, 200, 160, 130).x, y2: polarToCartesian$2(200, 200, 160, 130).y, stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 120, 240).x, y: polarToCartesian$2(200, 200, 120, 240).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "0" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 120, 330).x, y: polarToCartesian$2(200, 200, 120, 330).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 120).x, y: polarToCartesian$2(200, 200, 110, 120).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "0" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 90).x, y: polarToCartesian$2(200, 200, 110, 90).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 70).x, y: polarToCartesian$2(200, 200, 110, 70).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "15" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "209", fill: "#00FFFF", fontSize: "26", fontFamily: "sans-serif", textAnchor: "middle", children: "1" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 40 185 L 25 185 L 25 215 L 40 215", fill: "none", stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "170", y: "145", fill: "white", fontSize: "26", textAnchor: "middle", fontFamily: "serif", children: "ny" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "230", y: "145", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "serif", children: "α" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(90, 240)",
        description: "Цифровое значение Ny: нормальная перегрузка, смещенная к приборной шкале.",
        frameVariables: ["NormalG"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "80", height: "40", rx: "8", ry: "8", fill: "none", stroke: "#555", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "28", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "monospace", children: ny.toFixed(1) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(230, 240)",
        description: "Цифровое значение угла атаки Alpha.",
        frameVariables: ["AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "80", height: "40", rx: "8", ry: "8", fill: "none", stroke: "#555", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "28", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "monospace", children: alpha.toFixed(1) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(150, 310)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "100", height: "35", rx: "10", ry: "10", fill: "none", stroke: "#555", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "25", fill: "#aaa", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: "RESET" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `translate(200, 200) rotate(${angleNy - 270})`,
        description: "Зелёная стрелка Ny — текущая нормальная перегрузка.",
        frameVariables: ["NormalG"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -2 -8 A 8 8 0 0 0 -2 8 Z", fill: "#00FF00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-2", y1: "0", x2: "-140", y2: "0", stroke: "#00FF00", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `translate(200, 200) rotate(${angleAlpha - 90})`,
        description: "Зелёная стрелка Alpha — текущий угол атаки.",
        frameVariables: ["AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 2 -8 A 8 8 0 0 1 2 8 Z", fill: "#00FF00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "2", y1: "0", x2: "140", y2: "0", stroke: "#00FF00", strokeWidth: "3" })
        ]
      }
    )
  ] });
}
function ControlGrid({ frame }) {
  const roll = finiteNumber$3(frame.RollAngle) ?? 0;
  const pitch = finiteNumber$3(frame.PitchAngle) ?? 0;
  const xVal = Math.max(-1, Math.min(1, roll / 45));
  const yVal = Math.max(-1, Math.min(1, pitch / 20));
  const px = 200 + xVal * 150;
  const py = 200 - yVal * 150;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "0 0 400 400", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    SvgTooltipGroup,
    {
      description: "Индикатор управления: по горизонтали крен, по вертикали тангаж, нормировано к диапазону -1..+1.",
      frameVariables: ["RollAngle", "PitchAngle"],
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "50", y: "50", width: "300", height: "300", fill: "black", stroke: "white", strokeWidth: "2" }),
        [125, 200, 275].map((v) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "50", y1: v, x2: "350", y2: v, stroke: "#444", strokeWidth: "1", strokeDasharray: "4 4" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: v, y1: "50", x2: v, y2: "350", stroke: "#444", strokeWidth: "1", strokeDasharray: "4 4" })
        ] }, v)),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "-1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "125", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "200", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "0" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "275", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "+0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "350", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "+1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "55", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "+1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "130", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "205", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "280", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "355", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "-1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "380", fill: "#FF00FF", fontSize: "24", textAnchor: "middle", fontWeight: "bold", children: "L" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "350", y: "380", fill: "#00FF00", fontSize: "24", textAnchor: "middle", fontWeight: "bold", children: "R" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: px, y1: "50", x2: px, y2: "350", stroke: "#00FF00", strokeWidth: "2", strokeDasharray: "2 2" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "50", y1: py, x2: "350", y2: py, stroke: "#00FF00", strokeWidth: "2", strokeDasharray: "2 2" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: px, y: 368, fill: "#00FF00", fontSize: "16", textAnchor: "middle", fontFamily: "monospace", children: xVal < 0 && xVal > -0.1 ? "-0.0" : xVal.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: 358, y: py + 5, fill: "#00FF00", fontSize: "16", textAnchor: "start", fontFamily: "monospace", children: yVal > 0 && yVal < 0.1 ? "-0.0" : yVal.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: px, cy: py, r: "6", fill: "#00FF00" })
      ]
    }
  ) });
}
const AuxPanelInstrument = ({ frame }) => {
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-row items-center justify-center select-none overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(ControlGrid, { frame }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(LoadsGauge, { frame })
  ] });
};
registerPanelKitWidget({
  id: "aux-panel",
  name: "Aux Panel",
  iconName: "Gauge",
  Component: AuxPanelInstrument,
  tooltip: "Aux Panel — вспомогательная панель с индикатором управления по тангажу/крену и шкалой перегрузки/AoA.",
  frameVariables: [
    "RollAngle",
    "PitchAngle",
    "NormalG",
    "AoA"
  ]
});
const finiteNumber$2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function polarToCartesian$1(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
function EngineDial({ cx, cy, label, value, frameVariable, maxVal = 100, tickInterval = 20 }) {
  const angleRange = 300;
  const startAngle = -150;
  const endAngle = 150;
  const radiusOuter = 95;
  const radiusInner = 80;
  const ticks = [];
  for (let i = 0; i <= maxVal; i += tickInterval / 2) {
    const isMajor = i % tickInterval === 0;
    const a = startAngle + i / maxVal * angleRange;
    const p1 = polarToCartesian$1(cx, cy, radiusOuter, a);
    const p2 = polarToCartesian$1(cx, cy, isMajor ? radiusInner - 5 : radiusInner + 5, a);
    ticks.push(
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "white", strokeWidth: isMajor ? 3 : 1.5 }, `tick-${label}-${i}`)
    );
    if (isMajor) {
      const pText = polarToCartesian$1(cx, cy, radiusInner - 20, a);
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: pText.x, y: pText.y + 6, fill: "white", fontSize: "18", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: i / 10 }, `text-${label}-${i}`)
      );
    }
  }
  const safeValue = value !== null ? Math.max(0, Math.min(value, 110)) : 0;
  const needleAngle = startAngle + safeValue / maxVal * angleRange;
  const pNeedleOuter = polarToCartesian$1(cx, cy, radiusInner - 5, needleAngle);
  const pNeedleInner = polarToCartesian$1(cx, cy, -15, needleAngle);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    SvgTooltipGroup,
    {
      description: `${label.toUpperCase()} — обороты двигателя, проценты.`,
      frameVariables: [frameVariable],
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "path",
          {
            d: `M ${polarToCartesian$1(cx, cy, radiusOuter, startAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, startAngle).y} A ${radiusOuter} ${radiusOuter} 0 1 1 ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).y}`,
            fill: "none",
            stroke: "white",
            strokeWidth: "2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "path",
          {
            d: `M ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).y} A ${radiusOuter} ${radiusOuter} 0 0 1 ${polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).y}`,
            fill: "none",
            stroke: "#FF0000",
            strokeWidth: "4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "line",
          {
            x1: polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).x,
            y1: polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).y,
            x2: polarToCartesian$1(cx, cy, radiusInner, endAngle + 15).x,
            y2: polarToCartesian$1(cx, cy, radiusInner, endAngle + 15).y,
            stroke: "#FF0000",
            strokeWidth: "4"
          }
        ),
        ticks,
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: cx, y: cy - 20, fill: "white", fontSize: "24", fontFamily: "sans-serif", textAnchor: "middle", children: [
          "n",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", dy: "4", children: label.replace("n", "") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: cx, y: cy + 10, fill: "white", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "%" }),
        value !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: pNeedleInner.x, y1: pNeedleInner.y, x2: pNeedleOuter.x, y2: pNeedleOuter.y, stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx, cy, r: "6", fill: "#00FF00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx, cy, r: "3", fill: "black" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(${cx - 35}, ${cy + radiusOuter - 15})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "70", height: "35", rx: "5", ry: "5", fill: "black", stroke: "#666", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "35", y: "24", fill: "white", fontSize: "20", fontFamily: "monospace", textAnchor: "middle", children: value !== null ? value.toFixed(1) : "---" })
        ] })
      ]
    }
  );
}
const EngineDisplayInstrument = ({ frame }) => {
  const engine = {
    n1: finiteNumber$2(frame.Engine_N1_Left),
    n2: finiteNumber$2(frame.Engine_N1_Right),
    fuelFlow: finiteNumber$2(frame.TotalFuel),
    egt: finiteNumber$2(frame.APU_EGT),
    oilPress: finiteNumber$2(frame.APU_OilPressure),
    oilTemp: finiteNumber$2(frame.APU_OilTemp),
    vibration: null
  };
  const rows = [
    { label: "FF", labelSub: "", value: engine.fuelFlow, unit: "T/h", fixed: 2 },
    { label: "t", labelSub: "г", value: engine.egt, unit: "x 100 °C", fixed: 1 },
    { label: "P", labelSub: "м", value: engine.oilPress, unit: "КГ/СМ²", fixed: 1 },
    { label: "T", labelSub: "м", value: engine.oilTemp, unit: "°C", fixed: 0 },
    { label: "Вибр", labelSub: "", value: engine.vibration, unit: "%", fixed: 1 }
  ];
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 600 460", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(EngineDial, { cx: 180, cy: 130, label: "n1", value: engine.n1 ?? 0, frameVariable: "Engine_N1_Left" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(EngineDial, { cx: 420, cy: 130, label: "n2", value: engine.n2 ?? 0, frameVariable: "Engine_N1_Right" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 20)", children: rows.map((r, i) => {
      const y = 260 + i * 36;
      const frameVariables = [
        ["TotalFuel"],
        ["APU_EGT"],
        ["APU_OilPressure"],
        ["APU_OilTemp"],
        []
      ][i];
      return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        SvgTooltipGroup,
        {
          description: `${r.label}${r.labelSub} — ${r.unit}`,
          frameVariables,
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "270", y, fill: "white", fontSize: "20", fontFamily: "sans-serif", textAnchor: "end", children: [
              r.label,
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "15", dy: "5", children: r.labelSub })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(285, ${y - 20})`, children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { width: "60", height: "26", rx: "4", fill: "black", stroke: "#666", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "19", fill: "white", fontSize: "18", fontFamily: "monospace", textAnchor: "middle", children: r.value !== null && r.value !== void 0 ? r.value.toFixed(r.fixed) : "---" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "355", y, fill: "white", fontSize: "16", fontFamily: "sans-serif", textAnchor: "start", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { dy: r.labelSub ? "-5" : "0", children: r.unit }) })
          ]
        },
        i
      );
    }) })
  ] }) });
};
registerPanelKitWidget({
  id: "engine-display",
  name: "Engine Display",
  iconName: "Cog",
  Component: EngineDisplayInstrument,
  tooltip: "Engine Display — параметры двигателей и APU: N1/N2, топливо, EGT, давление и температура масла.",
  frameVariables: [
    "Engine_N1_Left",
    "Engine_N1_Right",
    "TotalFuel",
    "APU_EGT",
    "APU_OilPressure",
    "APU_OilTemp"
  ]
});
const finiteNumber$1 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const ConfigDisplayInstrument = ({ frame }) => {
  const flaps = finiteNumber$1(frame.FlapsPosition) ?? 0;
  const slats = finiteNumber$1(frame.SlatsPosition) ?? 0;
  const s = {
    flapL: flaps,
    flapR: flaps,
    slatL: slats,
    slatR: slats,
    phiST: finiteNumber$1(frame.StabPosition) ?? -1.8,
    deltaPB: finiteNumber$1(frame.Airbrake_Inner_Cmd) ?? -0.1,
    deltaEPL: finiteNumber$1(frame.Elev_Left_Inner) ?? finiteNumber$1(frame.Elev_Left_Outer),
    deltaEPR: finiteNumber$1(frame.Elev_Right_Inner) ?? finiteNumber$1(frame.Elev_Right_Outer)
  };
  const formatWithComma = (val) => {
    if (val === null) return "--,-";
    return val.toFixed(1).replace(".", ",");
  };
  const formatWithDot = (val) => {
    if (val === null) return "--.-";
    return val.toFixed(1);
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 800 600", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, -30)",
        description: "Вид спереди: текущие положения стабилизатора, интерцептора, рулей высоты, закрылков и предкрылков.",
        frameVariables: [
          "StabPosition",
          "Airbrake_Inner_Cmd",
          "Elev_Left_Inner",
          "Elev_Left_Outer",
          "Elev_Right_Inner",
          "Elev_Right_Outer",
          "FlapsPosition",
          "SlatsPosition"
        ],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#999", strokeWidth: "1.5", fill: "none", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 370 240 Q 200 240 100 170 Q 150 250 370 255" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 430 240 Q 600 240 700 170 Q 650 250 430 255" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 100 170 Q 100 150 110 140" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 700 170 Q 700 150 690 140" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "310", cy: "270", r: "18" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "310", cy: "270", r: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 310 252 L 310 248 L 330 248 L 330 252" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "490", cy: "270", r: "18" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "490", cy: "270", r: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 490 252 L 490 248 L 470 248 L 470 252" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "35" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 380 215 Q 400 190 420 215", strokeWidth: "1" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "5", strokeWidth: "1" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 395 205 L 395 60 Q 400 55 405 60 L 405 205" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 395 180 L 320 185 L 320 190 L 395 195" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 405 180 L 480 185 L 480 190 L 405 195" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "396", y: "275", width: "8", height: "25" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "388", y: "300", width: "10", height: "20", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "402", y: "300", width: "10", height: "20", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "348", y: "280", width: "6", height: "30" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "335", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "355", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "446", y: "280", width: "6", height: "30" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "433", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "453", y: "300", width: "12", height: "24", rx: "3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "#FFA500", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "325", y: "330", width: "45", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "375", y: "330", width: "50", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "430", y: "330", width: "45", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "325", y: "345", width: "150", height: "10" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fontSize: "20", fontFamily: "sans-serif", textAnchor: "middle", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "320", y: "100", fill: "white", children: "ϕST" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "320", y: "125", fill: "#00FF00", children: formatWithComma(s.phiST) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "480", y: "100", fill: "white", children: "δPB" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "480", y: "125", fill: "#00FF00", children: formatWithComma(s.deltaPB) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "130", fill: "#444", children: "δЭП-L" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "155", fill: s.deltaEPL === null ? "#155015" : "#00FF00", children: formatWithComma(s.deltaEPL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "660", y: "130", fill: "#444", children: "δЭП-R" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "660", y: "155", fill: s.deltaEPR === null ? "#155015" : "#00FF00", children: formatWithComma(s.deltaEPR) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "160", fill: "white", children: "FlapL" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "185", fill: "#00FF00", children: formatWithComma(s.flapL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "160", fill: "white", children: "FlapR" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "185", fill: "#00FF00", children: formatWithComma(s.flapR) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "270", fill: "white", children: "SlatL" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "295", fill: "#00FF00", children: formatWithComma(s.slatL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "270", fill: "white", children: "SlatR" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "295", fill: "#00FF00", children: formatWithComma(s.slatR) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, 100)",
        description: "Вид сверху: положения закрылков и предкрылков слева/справа.",
        frameVariables: ["FlapsPosition", "SlatsPosition"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "360,300 60,420 360,420", fill: "none", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "85,408 340,305 340,314 95,417", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "120,413 340,413 340,418 120,418", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3", transform: "translate(0, -10)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "440,300 740,420 440,420", fill: "none", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "715,408 460,305 460,314 705,417", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "680,413 460,413 460,418 680,418", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3", transform: "translate(0, -10)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fontSize: "22", fontFamily: "monospace", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "40", y: "340", fill: "white", children: [
              "SLAT",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "L" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.slatL) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "170", y: "470", fill: "white", children: [
              "FLAP",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "L" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.flapL) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "610", y: "340", fill: "white", children: [
              "SLAT",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "R" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.slatR) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "480", y: "470", fill: "white", children: [
              "FLAP",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "R" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.flapR) })
            ] })
          ] })
        ]
      }
    )
  ] }) });
};
registerPanelKitWidget({
  id: "config-display",
  name: "Config Display",
  iconName: "Plane",
  Component: ConfigDisplayInstrument,
  tooltip: "Config Display — конфигурация самолёта: закрылки, предкрылки, стабилизатор, интерцептор и рули высоты.",
  frameVariables: [
    "FlapsPosition",
    "SlatsPosition",
    "StabPosition",
    "Airbrake_Inner_Cmd",
    "Elev_Left_Inner",
    "Elev_Left_Outer",
    "Elev_Right_Inner",
    "Elev_Right_Outer"
  ]
});
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
const finiteNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const PFD2Instrument = ({ frame }) => {
  const pitch = finiteNumber(frame.PitchAngle) ?? 0;
  const roll = finiteNumber(frame.RollAngle) ?? 0;
  const pxPerDegPitch = 8;
  const pitchOffset = pitch * pxPerDegPitch;
  const slipOffset = roll ? -(roll / 45) * 15 : 0;
  const fdPitchOffset = Math.sin(Date.now() / 1500) * 15;
  const fdRollAngle = Math.cos(Date.now() / 2e3) * 10;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      viewBox: "-300 -300 600 600",
      className: "w-full h-full",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "adi-mask2", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -160,-220 L 160,-220 A 240 240 0 0 1 240,0 A 240 240 0 0 1 160,220 L -160,220 A 240 240 0 0 1 -240,0 A 240 240 0 0 1 -160,-220 Z" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { clipPath: "url(#adi-mask2)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `translate(0, ${pitchOffset})`,
              description: "Подвижный фон авиагоризонта и шкала тангажа.",
              frameVariables: ["PitchAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-400", y: "-800", width: "800", height: "800", fill: "#145A96" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-400", y: "0", width: "800", height: "800", fill: "#914920" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-400", y1: "0", x2: "400", y2: "0", stroke: "white", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "white", strokeWidth: "2", textAnchor: "middle", fill: "white", fontFamily: "sans-serif", fontSize: "22", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-30", y1: -10 * pxPerDegPitch, x2: "30", y2: -10 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -10 * pxPerDegPitch + 8, stroke: "#145A96", strokeWidth: "5", strokeLinejoin: "round", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -10 * pxPerDegPitch + 8, stroke: "none", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-40", y1: -20 * pxPerDegPitch, x2: "40", y2: -20 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -20 * pxPerDegPitch + 8, stroke: "#145A96", strokeWidth: "5", strokeLinejoin: "round", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -20 * pxPerDegPitch + 8, stroke: "none", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-60", y1: -23 * pxPerDegPitch, x2: "-20", y2: -23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: -23 * pxPerDegPitch, x2: "60", y2: -23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-30", y1: 10 * pxPerDegPitch, x2: "30", y2: 10 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 10 * pxPerDegPitch + 8, stroke: "#914920", strokeWidth: "5", strokeLinejoin: "round", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 10 * pxPerDegPitch + 8, stroke: "none", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-40", y1: 20 * pxPerDegPitch, x2: "40", y2: 20 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 20 * pxPerDegPitch + 8, stroke: "#914920", strokeWidth: "5", strokeLinejoin: "round", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 20 * pxPerDegPitch + 8, stroke: "none", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-60", y1: 23 * pxPerDegPitch, x2: "-20", y2: 23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: 23 * pxPerDegPitch, x2: "60", y2: 23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: -5 * pxPerDegPitch, x2: "15", y2: -5 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: 5 * pxPerDegPitch, x2: "15", y2: 5 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: -15 * pxPerDegPitch, x2: "15", y2: -15 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: 15 * pxPerDegPitch, x2: "15", y2: 15 * pxPerDegPitch })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            SvgTooltipGroup,
            {
              description: "Неподвижные боковые маркеры горизонта.",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "white", strokeWidth: "2", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -235,0 L -205,0 L -215,-7 Z", fill: "none" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 235,0 L 205,0 L 215,-7 Z", fill: "none" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-205", y1: "0", x2: "-180", y2: "0", strokeDasharray: "5 5" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: "0", x2: "180", y2: "0", strokeDasharray: "5 5" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              description: "Шкала крена, градусы.",
              frameVariables: ["RollAngle"],
              children: [
                [-60, -45, -30, -15, 0, 15, 30, 45, 60].map((a) => {
                  const isMajor = Math.abs(a) === 30 || Math.abs(a) === 60 || a === 0;
                  const p1 = polarToCartesian(0, 0, 180, 180 + a);
                  const p2 = polarToCartesian(0, 0, isMajor ? 198 : 190, 180 + a);
                  const textP = polarToCartesian(0, 0, 160, 180 + a);
                  const elements = [];
                  elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "white", strokeWidth: "2" }, `tick-${a}`));
                  if (Math.abs(a) === 15 || Math.abs(a) === 60) {
                    elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: textP.x, y: textP.y + 6, fill: "white", fontSize: "16", textAnchor: "middle", fontFamily: "sans-serif", children: Math.abs(a) }, `txt-${a}`));
                  }
                  if (Math.abs(a) === 45) {
                    const textP45 = polarToCartesian(0, 0, 165, 180 + a);
                    elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: textP45.x, y: textP45.y + 6, fill: "white", fontSize: "16", textAnchor: "middle", fontFamily: "sans-serif", children: Math.abs(a) }, `txt-${a}`));
                  }
                  return elements;
                }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -106 148 C -120 135, -140 110, -155 70", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 106 148 C 120 135, 140 110, 155 70", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -135 60 L -140 50 L -130 50", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 135 60 L 140 50 L 130 50", fill: "none", stroke: "#D32F2F", strokeWidth: "2" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-190", y: "75", width: "100", height: "34", fill: "#E87C24", opacity: "0.9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-140", y: "98", fill: "#111", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "ПЗ ИНС" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "90", y: "75", width: "100", height: "34", fill: "#E87C24", opacity: "0.9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "98", fill: "#111", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "ПЗ СБКВ" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            SvgTooltipGroup,
            {
              transform: `rotate(${roll})`,
              description: "Оранжевый символ самолёта — текущий крен относительно шкалы.",
              frameVariables: ["RollAngle"],
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#E87C24", strokeWidth: "4", fill: "none", strokeLinecap: "square", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "22" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "3", fill: "#E87C24" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-22", y1: "0", x2: "-80", y2: "0" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-80", y1: "0", x2: "-100", y2: "20" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "22", y1: "0", x2: "80", y2: "0" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "80", y1: "0", x2: "100", y2: "20" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "22", x2: "0", y2: "182", stroke: "#E87C24", strokeWidth: "3" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: "translate(0, 205)",
              description: "Индикатор бокового скольжения. Сейчас смещение вычисляется из крена как визуальная имитация.",
              frameVariables: ["RollAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-40", y: "-12", width: "80", height: "24", rx: "12", fill: "white", stroke: "#333", strokeWidth: "1" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "-12", x2: "-12", y2: "12", stroke: "black", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "12", y1: "-12", x2: "12", y2: "12", stroke: "black", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: slipOffset, cy: "0", r: "10", fill: "black" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `translate(0, ${pitchOffset - 20 + fdPitchOffset})`,
              description: "Flight Director — демонстрационные командные планки, анимированы для визуальной активности.",
              frameVariables: ["PitchAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#C6E33B", strokeWidth: "5", fill: "none", strokeLinecap: "square", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-90", y1: "-10", x2: "90", y2: "-10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-80", y1: "-10", x2: "-80", y2: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "80", y1: "-10", x2: "80", y2: "10" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "30", y1: "-80", x2: "-30", y2: "50", stroke: "#C6E33B", strokeWidth: "5", transform: `rotate(${fdRollAngle})` })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(260, 0)",
            description: "Шкала глиссады и указатель отклонения.",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: "0", x2: "10", y2: "0", stroke: "white", strokeWidth: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -5 10 L -25 10 L -25 25 L -5 25 L 5 17.5 Z", fill: "#C6E33B", stroke: "#000", strokeWidth: "1" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(-260, 0)",
            description: "Шкала localizer и указатель бокового отклонения.",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "0", x2: "12", y2: "0", stroke: "white", strokeWidth: "5" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "12", fill: "none", stroke: "white", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 0 -13 L 0 5 M -15 5 L 15 5", stroke: "white", strokeWidth: "3", fill: "none", transform: "translate(0, 15)" })
            ] })
          }
        )
      ]
    }
  ) });
};
registerPanelKitWidget({
  id: "pfd2",
  name: "PFD-2 (ADI)",
  iconName: "CircleDot",
  Component: PFD2Instrument,
  tooltip: "PFD-2 (ADI) — альтернативный авиагоризонт с тангажом, креном, шкалой крена и индикатором скольжения.",
  frameVariables: [
    "PitchAngle",
    "RollAngle"
  ]
});
const finite = (v) => typeof v === "number" && Number.isFinite(v) ? v : 0;
const fmt = (v, d = 1) => typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "—";
const LoadingFallback = () => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a14] flex items-center justify-center select-none", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/20 text-sm font-mono", children: "Loading 3D engine…" }) });
let RealScene = null;
{
  RealScene = reactExports$1.lazy(() => __vitePreload(() => import("./RealAircraft3DScene-rcFdje4N.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => ({ default: m.RealAircraft3DScene })));
}
const Aircraft3DStub = reactExports$1.memo(({ frame }) => {
  const pitch = finite(frame == null ? void 0 : frame.PitchAngle);
  const roll = finite(frame == null ? void 0 : frame.RollAngle);
  const heading = finite(frame == null ? void 0 : frame.Heading1);
  const alt = frame == null ? void 0 : frame.RAltitude;
  const cas = finite(frame == null ? void 0 : frame.CAS);
  const vy = finite(frame == null ? void 0 : frame.Vy);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative bg-[#0a0a14] overflow-hidden select-none flex flex-col items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.025]",
        style: {
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "relative z-10 mb-6", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { width: "100", height: "64", viewBox: "0 0 100 64", className: "text-cyan-500/30", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M50 4 L57 32 L90 34 L94 30 L90 34 L94 38 L90 34 L57 36 L50 60 L43 36 L10 34 L6 30 L10 34 L6 38 L10 34 L43 32 Z" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/15 text-xl font-mono tracking-[0.3em] uppercase mb-4 z-10", children: "3D Aircraft" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/8 text-xs font-mono tracking-wider mb-10 z-10", children: "Flight Visualization · Coming Soon" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "PITCH ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          fmt(pitch),
          "°"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "ROLL",
        "  ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          fmt(roll),
          "°"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-4 right-4 text-[11px] font-mono text-white/40 leading-tight text-right z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "HDG ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          Math.round(heading).toString().padStart(3, "0"),
          "°"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "ALT ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-orange-400/50", children: [
          fmt(alt, 0),
          " м"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute bottom-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "CAS ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400/50", children: fmt(cas, 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "Vy",
        "  ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400/50", children: fmt(vy) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-10", children: ["🔵", "🟢", "🟡", "🔴"].map((icon, i) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "px-2 py-0.5 text-[13px] rounded bg-white/[0.03] text-white/15 leading-none", children: icon }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "absolute bottom-4 right-4 px-2 py-0.5 text-[11px] rounded bg-white/[0.03] text-white/15 z-10 font-mono", children: "✈ Primitive" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/12 z-10", children: [
      "v",
      APP_VERSION
    ] })
  ] });
}, (prev, next) => {
  const pf = prev.frame;
  const nf = next.frame;
  if (!pf || !nf) return false;
  return pf.PitchAngle === nf.PitchAngle && pf.RollAngle === nf.RollAngle && pf.Heading1 === nf.Heading1 && pf.CAS === nf.CAS && pf.Vy === nf.Vy && pf.RAltitude === nf.RAltitude;
});
const Aircraft3DInstrument$1 = reactExports$1.memo(({ frame }) => {
  if (RealScene) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(reactExports$1.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LoadingFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(RealScene, { frame }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(Aircraft3DStub, { frame });
});
registerPanelKitWidget({
  id: "aircraft-3d",
  name: "3D Aircraft",
  iconName: "Plane",
  Component: Aircraft3DInstrument$1,
  tooltip: "3D Aircraft — визуализация пространственного положения. Pitch, Roll, Heading, скорость, высота.",
  frameVariables: ["PitchAngle", "RollAngle", "Heading1", "CAS", "Vy", "RAltitude"]
});
const Aircraft3DInstrument$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Aircraft3DInstrument$1
}, Symbol.toStringTag, { value: "Module" }));
const MAX_POINTS = 300;
const TIME_WINDOW_SEC = 30;
function formatValue(v) {
  const abs = Math.abs(v);
  if (abs >= 1e4) return v.toFixed(0);
  if (abs >= 1e3) return v.toFixed(1);
  if (abs >= 100) return v.toFixed(1);
  if (abs >= 10) return v.toFixed(2);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}
const GraphRenderer = ({
  frame,
  fieldKey,
  label,
  unit = "",
  lineColor = "#00ff88"
}) => {
  const canvasRef = reactExports$1.useRef(null);
  const containerRef = reactExports$1.useRef(null);
  const bufferRef = reactExports$1.useRef([]);
  const sizeRef = reactExports$1.useRef({ w: 0, h: 0 });
  reactExports$1.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.floor(entry.contentRect.width * dpr);
        const h = Math.floor(entry.contentRect.height * dpr);
        sizeRef.current = { w, h };
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = entry.contentRect.width + "px";
          canvas.style.height = entry.contentRect.height + "px";
        }
      }
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const draw = reactExports$1.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const buf = bufferRef.current;
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);
    if (buf.length < 2) {
      ctx.fillStyle = "#555";
      ctx.font = `${Math.max(10, h / 20)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Waiting for data...", w / 2, h / 2);
      return;
    }
    const margin = { top: 26, right: 14, bottom: 20, left: 50 };
    const pw = w - margin.left - margin.right;
    const ph = h - margin.top - margin.bottom;
    const vals = buf.map((p) => p.v);
    let yMin = Math.min(...vals);
    let yMax = Math.max(...vals);
    if (yMax === yMin) {
      yMin -= 1;
      yMax += 1;
    }
    const pad = (yMax - yMin) * 0.1;
    yMin -= pad;
    yMax += pad;
    const tMin = buf[0].t;
    const tMax = buf[buf.length - 1].t;
    const tRange = tMax - tMin || 1;
    const gridLines = 4;
    const yFontSize = Math.max(9, h / 48);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + ph * i / gridLines;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();
      const labelVal = yMax - (yMax - yMin) * i / gridLines;
      ctx.fillStyle = "#777";
      ctx.font = `${yFontSize}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(formatValue(labelVal), margin.left - 5, y + yFontSize / 3);
    }
    const xFontSize = Math.max(9, h / 52);
    ctx.fillStyle = "#555";
    ctx.font = `${xFontSize}px monospace`;
    ctx.textAlign = "center";
    for (let i = 0; i <= 3; i++) {
      const relSec = tRange * (1 - i / 3);
      const x = margin.left + pw * (i / 3);
      ctx.fillText(`-${relSec.toFixed(0)}s`, x, h - 4);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < buf.length; i++) {
      const x = margin.left + (buf[i].t - tMin) / tRange * pw;
      const y = margin.top + ph - (buf[i].v - yMin) / (yMax - yMin) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = lineColor;
    ctx.lineTo(margin.left + pw, margin.top + ph);
    ctx.lineTo(margin.left, margin.top + ph);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#aaa";
    ctx.font = `bold ${Math.max(11, h / 32)}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(label, margin.left, 16);
    const cv = buf[buf.length - 1].v;
    ctx.fillStyle = lineColor;
    ctx.font = `bold ${Math.max(12, h / 28)}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${formatValue(cv)}${unit}`, w - margin.right, 16);
  }, [lineColor, label, unit]);
  const value = frame[fieldKey];
  const t0 = frame._t0_ms;
  reactExports$1.useEffect(() => {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    const buf = bufferRef.current;
    const now = t0 ? t0 / 1e3 : Date.now() / 1e3;
    const last = buf.length > 0 ? buf[buf.length - 1] : null;
    if (last && last.t === now && last.v === value) return;
    buf.push({ t: now, v: value });
    const cutoff = now - TIME_WINDOW_SEC;
    while (buf.length > 1 && buf[0].t < cutoff) buf.shift();
    while (buf.length > MAX_POINTS) buf.shift();
    draw();
  }, [value, t0, draw]);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { ref: containerRef, className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("canvas", { ref: canvasRef, className: "w-full h-full block" }) });
};
function createGraphWidget(config) {
  const {
    id,
    name,
    fieldKey,
    label,
    unit = "",
    lineColor = "#00ff88",
    iconName = "TrendingUp",
    tooltip
  } = config;
  const Component = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    GraphRenderer,
    {
      frame,
      fieldKey,
      label,
      unit,
      lineColor
    }
  );
  registerPanelKitWidget({
    id,
    name,
    iconName,
    Component,
    tooltip: tooltip ?? `Graph: ${label} (${fieldKey})`,
    frameVariables: [fieldKey]
  });
  return Component;
}
createGraphWidget({
  id: "graph-cas",
  name: "Graph: Airspeed",
  fieldKey: "CAS",
  label: "CAS",
  unit: " kt",
  lineColor: "#00e676",
  tooltip: "График приборной скорости (CAS)"
});
createGraphWidget({
  id: "graph-alt",
  name: "Graph: Altitude",
  fieldKey: "BaroAltitude",
  label: "Altitude",
  unit: " ft",
  lineColor: "#4fc3f7",
  tooltip: "График барометрической высоты"
});
createGraphWidget({
  id: "graph-roll",
  name: "Graph: Roll",
  fieldKey: "RollAngle",
  label: "Roll",
  unit: "°",
  lineColor: "#ff8a65",
  tooltip: "График угла крена"
});
createGraphWidget({
  id: "graph-pitch",
  name: "Graph: Pitch",
  fieldKey: "PitchAngle",
  label: "Pitch",
  unit: "°",
  lineColor: "#ffd54f",
  tooltip: "График угла тангажа"
});
createGraphWidget({
  id: "graph-vs",
  name: "Graph: Vert Speed",
  fieldKey: "Vy",
  label: "Vy",
  unit: " fpm",
  lineColor: "#ce93d8",
  tooltip: "График вертикальной скорости"
});
createGraphWidget({
  id: "graph-hdg",
  name: "Graph: Heading",
  fieldKey: "MagneticHeading",
  label: "Heading",
  unit: "°",
  lineColor: "#81d4fa",
  tooltip: "График магнитного курса"
});
createGraphWidget({
  id: "graph-aoa",
  name: "Graph: AoA",
  fieldKey: "AoA",
  label: "AoA",
  unit: "°",
  lineColor: "#ef5350",
  tooltip: "График угла атаки"
});
createGraphWidget({
  id: "graph-n1",
  name: "Graph: N1 Left",
  fieldKey: "Engine_N1_Left",
  label: "N1 Left",
  unit: "%",
  lineColor: "#a5d6a7",
  tooltip: "График оборотов N1 левого двигателя"
});
createGraphWidget({
  id: "graph-g",
  name: "Graph: G-Load",
  fieldKey: "NormalG",
  label: "G-Load",
  unit: " g",
  lineColor: "#ffcc80",
  tooltip: "График нормальной перегрузки (Ny)"
});
createGraphWidget({
  id: "graph-ra",
  name: "Graph: Radio Alt",
  fieldKey: "RadioAltitude",
  label: "Radio Alt",
  unit: " ft",
  lineColor: "#80cbc4",
  tooltip: "График радиовысоты"
});
const CURRENT_PROFILE_ID = "current";
const PANELS_API = "/api/panels";
const CURRENT_CONFIG_API = "/api/panel/config/current";
async function getProfiles$1() {
  try {
    const [panelsRes, currentRes] = await Promise.all([
      fetch(PANELS_API, { cache: "no-store" }),
      fetch(CURRENT_CONFIG_API, { cache: "no-store" })
    ]);
    const profiles = [];
    if (currentRes.ok) {
      profiles.push({ id: CURRENT_PROFILE_ID, name: "Current" });
    }
    if (panelsRes.ok) {
      const list = await panelsRes.json();
      for (const p of list) {
        profiles.push({ id: p.name, name: p.name, updatedAt: p.updatedAt });
      }
    }
    return profiles;
  } catch {
    return [{ id: CURRENT_PROFILE_ID, name: "Current" }];
  }
}
async function saveProfile(name, treeJson) {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function saveCurrentProfile(treeJson) {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(CURRENT_CONFIG_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function loadProfile$1(name) {
  try {
    if (name === CURRENT_PROFILE_ID) {
      const res2 = await fetch(CURRENT_CONFIG_API, { cache: "no-store" });
      if (!res2.ok) return null;
      const data = await res2.json();
      return JSON.stringify(data);
    }
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return JSON.stringify(json.data);
  } catch {
    return null;
  }
}
async function deleteProfile(name) {
  if (name === CURRENT_PROFILE_ID) return false;
  try {
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch {
    return false;
  }
}
const PanelBuilder = ({ onBack }) => {
  const { frame } = useTelemetry();
  const [rootNode, setRootNode] = reactExports$1.useState(createEmptyRoot);
  const [configStatus, setConfigStatus] = reactExports$1.useState("Loading current config...");
  const [panelMenu, setPanelMenu] = reactExports$1.useState(null);
  const [udpDialogOpen, setUdpDialogOpen] = reactExports$1.useState(false);
  const hasHydrated = reactExports$1.useRef(false);
  const lastSavedJson = reactExports$1.useRef(null);
  const [profiles, setProfiles] = reactExports$1.useState([]);
  const [selectedProfileId, setSelectedProfileId] = reactExports$1.useState(CURRENT_PROFILE_ID);
  const [profilesLoading, setProfilesLoading] = reactExports$1.useState(true);
  const currentTreeJson = reactExports$1.useCallback(() => {
    return JSON.stringify(toLegacyPanelNode(rootNode), null, 2);
  }, [rootNode]);
  const refreshProfiles = reactExports$1.useCallback(async () => {
    try {
      const list = await getProfiles$1();
      setProfiles(list);
      return list;
    } catch {
      return [];
    }
  }, []);
  const saveToProfile = reactExports$1.useCallback(async (profileId) => {
    const json = currentTreeJson();
    const name = profileId === CURRENT_PROFILE_ID ? "Current" : profileId;
    const ok = profileId === CURRENT_PROFILE_ID ? await saveCurrentProfile(json) : await saveProfile(profileId, json);
    if (ok) {
      lastSavedJson.current = json;
      setConfigStatus(`Saved to "${name}"`);
    } else {
      setConfigStatus(`Failed to save "${name}"`);
    }
  }, [currentTreeJson]);
  const loadFromProfile = reactExports$1.useCallback(async (profileId) => {
    const json = await loadProfile$1(profileId);
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
        const name = profileId === CURRENT_PROFILE_ID ? "Current" : profileId;
        setConfigStatus(`Loaded "${name}"`);
      } else {
        setConfigStatus(`Invalid profile data`);
      }
    } catch {
      setConfigStatus(`Failed to parse profile`);
    }
  }, []);
  const handleSaveAs = reactExports$1.useCallback(async () => {
    const name = prompt("Profile name:");
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
  const handleDeleteProfile = reactExports$1.useCallback(async () => {
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
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await refreshProfiles();
      if (cancelled) return;
      const pending = window.__pendingPanelLoad;
      if (pending) {
        window.__pendingPanelLoad = null;
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
      try {
        const res = await fetch(CURRENT_CONFIG_API$1, { cache: "no-store" });
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
    return () => {
      cancelled = true;
    };
  }, [CURRENT_CONFIG_API$1, refreshProfiles]);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const loadPanelMenu = async () => {
      try {
        const response = await fetch(PANEL_MENU_API, { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) return;
        const parsed = await response.json();
        if (isPanelKitMenuConfig(parsed)) {
          setPanelMenu(parsed);
        }
      } catch {
      }
    };
    void loadPanelMenu();
    return () => {
      cancelled = true;
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (!hasHydrated.current) return;
    const json = currentTreeJson();
    if (json === lastSavedJson.current) return;
    window.__panelBuilderRootNode = toLegacyPanelNode(rootNode);
    const timeoutId = window.setTimeout(() => {
      lastSavedJson.current = json;
      void saveCurrentProfile(json);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [rootNode, currentTreeJson]);
  const saveCurrentConfig = reactExports$1.useCallback(async (node) => {
    const json = JSON.stringify(toLegacyPanelNode(node), null, 2);
    setConfigStatus(`Saving ${CURRENT_CONFIG_FILE_NAME}...`);
    try {
      const response = await fetch(CURRENT_CONFIG_API$1, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      lastSavedJson.current = json;
      setConfigStatus(`Saved to ${CURRENT_CONFIG_FILE_NAME}`);
      return true;
    } catch (error) {
      console.warn("Failed to save current panel config", error);
      setConfigStatus(`Autosave unavailable: ${CURRENT_CONFIG_FILE_NAME}`);
      return false;
    }
  }, []);
  const handleSaveFile = async () => {
    const json = JSON.stringify(toLegacyPanelNode(rootNode), null, 2);
    const fsWindow = window;
    if (fsWindow.showSaveFilePicker) {
      try {
        const handle = await fsWindow.showSaveFilePicker({
          suggestedName: CURRENT_CONFIG_FILE_NAME,
          types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        await saveCurrentConfig(rootNode);
        setConfigStatus(`Exported to ${handle.name}; current updated`);
        return;
      } catch (err) {
        if (err instanceof DOMException && (err.name === "AbortError" || err.name === "SecurityError")) {
          return;
        }
      }
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
  const handleLoadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      try {
        const json = (_a = e.target) == null ? void 0 : _a.result;
        const parsed = JSON.parse(json);
        const normalized = normalizePanelNode(parsed);
        if (normalized) {
          setRootNode(normalized);
          setConfigStatus(`Imported; will autosave to ${CURRENT_CONFIG_FILE_NAME}`);
        } else {
          alert("Invalid configuration file structure.");
        }
      } catch {
        alert("Failed to parse the configuration file.");
      }
    };
    reader.readAsText(file);
  };
  const onFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) handleLoadFile(file);
    if (e.target) e.target.value = "";
  };
  const triggerLoadFile = reactExports$1.useCallback(() => {
    var _a;
    (_a = document.getElementById("panel-builder-load")) == null ? void 0 : _a.click();
  }, []);
  const menuActions = reactExports$1.useMemo(
    () => ({
      openUdpDialog: () => setUdpDialogOpen(true),
      saveConfig: () => void handleSaveFile(),
      loadConfig: triggerLoadFile,
      saveCurrentConfig: () => void saveCurrentConfig(rootNode)
    }),
    [rootNode, saveCurrentConfig, triggerLoadFile]
  );
  const availableWidgets = reactExports$1.useMemo(
    () => getAllRegisteredPanelKitWidgets().map((widget) => ({
      id: widget.id,
      name: widget.name,
      iconName: widget.iconName
    })),
    []
  );
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelMenuProvider, { menu: panelMenu, actions: menuActions, children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col h-screen w-screen bg-[#0a0a0f] text-[#d1d5db] font-sans overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "h-12 border-b border-[#2d2e30] bg-[#161719] flex items-center justify-between px-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => void handleBack(),
            className: "p-1.5 hover:bg-[#252628] rounded-md text-gray-400 hover:text-white transition-colors",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-[#2d2e30]" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-sm font-bold tracking-wide text-white", children: "Panel Builder" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-[#2d2e30]" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "select",
            {
              className: "bg-[#252628] border border-[#2d2e30] text-[11px] text-white rounded px-2 py-1 max-w-[160px] cursor-pointer outline-none focus:border-blue-500",
              value: selectedProfileId,
              onChange: async (e) => {
                const newId2 = e.target.value;
                if (newId2 !== selectedProfileId) {
                  await saveToProfile(selectedProfileId);
                  await loadFromProfile(newId2);
                }
              },
              disabled: profilesLoading,
              children: profiles.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: p.id, children: p.id === CURRENT_PROFILE_ID ? `⚡ ${p.name}` : p.name }, p.id))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void saveToProfile(selectedProfileId),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-emerald-400 transition-colors",
              title: "Save to profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Save, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void handleSaveAs(),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-blue-400 transition-colors",
              title: "Save as new profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Copy, { className: "w-3.5 h-3.5" })
            }
          ),
          selectedProfileId !== CURRENT_PROFILE_ID && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void handleDeleteProfile(),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-red-400 transition-colors",
              title: "Delete profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = document.getElementById("panel-builder-load")) == null ? void 0 : _a.click();
            },
            className: "px-3 py-1.5 bg-[#252628] hover:bg-[#2d2e30] border border-[#2d2e30] text-[10px] font-bold uppercase transition-colors flex items-center gap-2 text-white rounded-md",
            title: "Load layout from JSON file",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(Upload, { className: "w-3.5 h-3.5" }),
              "Load"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "input",
          {
            type: "file",
            id: "panel-builder-load",
            className: "hidden",
            accept: ".json,application/json",
            onChange: onFileChange
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: handleSaveFile,
            className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2 rounded-md",
            title: "Save layout to JSON file",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(Download, { className: "w-3.5 h-3.5" }),
              "Save"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("main", { className: "flex-1 bg-[#0a0a0f] p-4 flex gap-2 relative", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full border-2 border-dashed border-[#2d2e30] flex relative", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        PanelCanvas,
        {
          node: rootNode,
          onChange: setRootNode,
          onRemoveNode: () => setRootNode(createEmptyRoot()),
          isRoot: true,
          data: frame,
          renderWidget: (node, clearWidget) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            AviationWidget,
            {
              widgetId: node.widgetId,
              frame,
              onRemove: clearWidget
            }
          )
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(Sidebar, { items: availableWidgets, getIcon: getPanelKitIcon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("footer", { className: "h-6 bg-[#161719] border-t border-[#2d2e30] flex items-center px-4 justify-between text-[10px] shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-emerald-500", children: "READY" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-gray-500", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-gray-400", children: "NODE_RENDERER: ACTIVE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-gray-500 font-mono", children: configStatus })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(UdpSourceDialog, { open: udpDialogOpen, onClose: () => setUdpDialogOpen(false) })
  ] }) });
};
const renderNode = (node, frame) => {
  if (node.type === "split" && node.children) {
    const isVertical = node.splitDirection === "vertical";
    const ratio = node.splitRatio ?? 0.5;
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: `w-full h-full flex ${isVertical ? "flex-row" : "flex-col"} overflow-hidden relative`, children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${ratio * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: renderNode(node.children[0], frame) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "div",
        {
          className: `flex-shrink-0 bg-[#0a0a0f] ${isVertical ? "w-2 h-full" : "h-2 w-full"}`,
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: `bg-[#2d2e30] ${isVertical ? "w-[1px] h-full mx-auto" : "h-[1px] w-full my-auto"}` })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${(1 - ratio) * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: renderNode(node.children[1], frame) })
    ] });
  }
  if (node.type === "widget" && node.widgetId) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#161719] border border-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AviationWidget, { widgetId: node.widgetId, frame, readOnly: true, onRemove: () => void 0 }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#161719] border border-[#2d2e30] flex items-center justify-center text-gray-600 text-[10px] uppercase tracking-wider", children: "Empty panel" });
};
const PanelDisplay = ({ frame }) => {
  const [rootNode, setRootNode] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(`Loading ${CURRENT_CONFIG_FILE_NAME}...`);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const loadConfig = async () => {
      try {
        const response = await fetch(CURRENT_CONFIG_API$1, { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const parsed = await response.json();
        const normalized = normalizePanelNode(parsed);
        if (!normalized) {
          throw new Error("Invalid panel config");
        }
        setRootNode(normalized);
        setStatus("");
      } catch (error) {
        console.warn("Failed to load panel config for display", error);
        if (!cancelled) {
          setRootNode(null);
          setStatus(`Cannot load ${CURRENT_CONFIG_FILE_NAME}`);
        }
      }
    };
    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);
  if (!rootNode) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-black flex items-center justify-center text-white/50 text-sm", children: status });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] overflow-hidden", children: renderNode(rootNode, frame) });
};
const telemetryRef = { current: null };
const aircraftControlsRef = {
  current: { active: false, pitch: 0, roll: 0, yaw: 0, throttle: 0, modelYaw: 0, _wasActive: false, telemetryLocked: false, onTelemetryUpdate: null }
};
const PROFILES_API = "/api/profiles";
async function getProfiles() {
  try {
    const res = await fetch(PROFILES_API, { cache: "no-store" });
    if (!res.ok) return [];
    const list = await res.json();
    return list;
  } catch {
    return [];
  }
}
async function loadProfile(id) {
  try {
    const res = await fetch(`${PROFILES_API}/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
const MAX_SAMPLES$1 = 5e3;
function percentile$1(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
const samples = [];
let sampleCount = 0;
function addSample(s) {
  if (samples.length < MAX_SAMPLES$1) {
    samples.push(s);
  } else {
    samples[sampleCount % MAX_SAMPLES$1] = s;
  }
  sampleCount++;
}
function getStats() {
  if (samples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0, over100: 0, over100Pct: 0, processingP99: 0 };
  }
  const displaySorted = samples.map((s) => s.display_ms).sort((a, b) => a - b);
  const procSorted = samples.map((s) => s.processing_ms).sort((a, b) => a - b);
  const over100 = displaySorted.filter((v) => v > 100).length;
  return {
    count: samples.length,
    p50: percentile$1(displaySorted, 50),
    p95: percentile$1(displaySorted, 95),
    p99: percentile$1(displaySorted, 99),
    max: displaySorted[displaySorted.length - 1],
    over100,
    over100Pct: samples.length > 0 ? over100 / samples.length * 100 : 0,
    processingP99: percentile$1(procSorted, 99)
  };
}
function exportCsv() {
  const header = "frame_id,t_recv_ms,t_decoded_ms,t_paint_ms,processing_ms,display_ms";
  const rows = samples.map(
    (s) => `${s.frame_id},${s.t_recv_ms},${s.t_decoded_ms},${s.t_paint_ms},${s.processing_ms},${s.display_ms}`
  );
  return [header, ...rows].join("\n");
}
const LatencyOverlay = reactExports$1.memo(() => {
  const [stats, setStats] = reactExports$1.useState(() => getStats());
  reactExports$1.useEffect(() => {
    const t = setInterval(() => setStats(getStats()), 500);
    return () => clearInterval(t);
  }, []);
  const handleExport = reactExports$1.useCallback(() => {
    const csv = exportCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `latency_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
  const handleReset = reactExports$1.useCallback(() => {
    samples.length = 0;
    sampleCount = 0;
    setStats(getStats());
  }, []);
  const fmt2 = (v) => v.toFixed(1);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { style: {
    position: "fixed",
    bottom: 8,
    left: 8,
    zIndex: 9999,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    borderRadius: 6,
    padding: "6px 10px",
    fontFamily: "'Courier New', monospace",
    fontSize: 10,
    color: "#a0aec0",
    lineHeight: 1.5,
    border: "1px solid rgba(255,255,255,0.1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }, children: "⏱ Latency" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      "N: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#e2e8f0" }, children: stats.count })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      "P50: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#48bb78" }, children: fmt2(stats.p50) }),
      " ",
      "P95: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#ecc94b" }, children: fmt2(stats.p95) }),
      " ",
      "P99: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#fc8181" }, children: fmt2(stats.p99) }),
      " ",
      "MAX: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#f56565" }, children: fmt2(stats.max) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      ">100ms: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { style: { color: stats.over100 > 0 ? "#f56565" : "#48bb78" }, children: [
        stats.over100,
        " (",
        fmt2(stats.over100Pct),
        "%)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { style: { display: "flex", gap: 4, marginTop: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: handleExport,
          style: {
            background: "rgba(59,130,246,0.3)",
            border: "1px solid #3b82f6",
            color: "#93c5fd",
            borderRadius: 3,
            padding: "1px 6px",
            fontSize: 9,
            cursor: "pointer",
            fontFamily: "inherit"
          },
          children: "CSV"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: handleReset,
          style: {
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#a0aec0",
            borderRadius: 3,
            padding: "1px 6px",
            fontSize: 9,
            cursor: "pointer",
            fontFamily: "inherit"
          },
          children: "Reset"
        }
      )
    ] })
  ] });
});
LatencyOverlay.displayName = "LatencyOverlay";
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production.Activity = REACT_ACTIVITY_TYPE;
  react_production.Children = Children;
  react_production.Component = Component;
  react_production.Fragment = REACT_FRAGMENT_TYPE;
  react_production.Profiler = REACT_PROFILER_TYPE;
  react_production.PureComponent = PureComponent;
  react_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production.Suspense = REACT_SUSPENSE_TYPE;
  react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  react_production.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  react_production.cacheSignal = function() {
    return null;
  };
  react_production.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_production.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_production.createRef = function() {
    return { current: null };
  };
  react_production.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_production.isValidElement = isValidElement;
  react_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  };
  react_production.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production.useDebugValue = function() {
  };
  react_production.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
  };
  react_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production.version = "19.2.7";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
const MIN_WINDOW = 5;
const MAX_WINDOW = 600;
const DEFAULT_WINDOW = 60;
function createViewState() {
  return {
    timeWindowSec: DEFAULT_WINDOW,
    cursorTimeSec: -1,
    viewStartSec: 0,
    viewEndSec: DEFAULT_WINDOW
  };
}
function computeViewRange(sessionTimeSec, timeWindowSec) {
  if (sessionTimeSec > timeWindowSec) {
    return {
      viewStartSec: sessionTimeSec - timeWindowSec,
      viewEndSec: sessionTimeSec
    };
  }
  return {
    viewStartSec: 0,
    viewEndSec: Math.max(timeWindowSec, sessionTimeSec)
  };
}
function updateViewRange(state, sessionTimeSec) {
  const range = computeViewRange(sessionTimeSec, state.timeWindowSec);
  state.viewStartSec = range.viewStartSec;
  state.viewEndSec = range.viewEndSec;
}
function applyZoom(state, sessionTimeSec, factor) {
  state.timeWindowSec = Math.max(
    MIN_WINDOW,
    Math.min(MAX_WINDOW, state.timeWindowSec * factor)
  );
  updateViewRange(state, sessionTimeSec);
}
const PALETTE = [
  { r: 0, g: 200, b: 255 },
  // #00C8FF
  { r: 255, g: 180, b: 0 },
  // #FFB400
  { r: 80, g: 220, b: 120 },
  // #50DC78
  { r: 255, g: 90, b: 90 },
  // #FF5A5A
  { r: 180, g: 140, b: 255 },
  // #B48CFF
  { r: 255, g: 120, b: 200 },
  // #FF78C8
  { r: 200, g: 200, b: 80 },
  // #C8C850
  { r: 120, g: 180, b: 255 }
  // #78B4FF
];
function paletteColor(index) {
  const c = PALETTE[index % PALETTE.length];
  return `rgb(${c.r},${c.g},${c.b})`;
}
const THEME = {
  widgetBg: "#0B0F14",
  plotBg: "#151A22",
  border: "#283241",
  cursor: "#00DCFF",
  textDim: "#788CA0",
  text: "#B4C8DC"
};
const STACKED_LAYOUT = {
  leftMargin: 50,
  rightMargin: 10,
  minStripHeight: 8,
  maxSeries: 20
};
const OVERLAY_LAYOUT = {
  plotLeft: 56,
  plotRight: 12,
  plotTop: 12,
  plotBottom: 36,
  legendLineHeight: 16,
  maxSeries: 24
};
function getPlotMargins(mode) {
  if (mode === "stacked") {
    return { left: STACKED_LAYOUT.leftMargin, right: STACKED_LAYOUT.rightMargin };
  }
  return { left: OVERLAY_LAYOUT.plotLeft, right: OVERLAY_LAYOUT.plotRight };
}
function uniformStride(samples2, maxPoints) {
  const cap = Math.max(2, maxPoints);
  const len = samples2.length;
  if (len <= cap) {
    return samples2.map((s) => ({ x: s.timeSec, y: s.value }));
  }
  const step = len / cap;
  const result = [];
  for (let i = 0; i < cap; i++) {
    const idx = Math.min(len - 1, Math.floor(i * step));
    result.push({ x: samples2[idx].timeSec, y: samples2[idx].value });
  }
  return result;
}
function minMaxBuckets(samples2, maxPoints) {
  const len = samples2.length;
  const bucketCount = Math.max(1, Math.floor(maxPoints / 2));
  const bucketSize = Math.ceil(len / bucketCount);
  const result = [];
  for (let b = 0; b < bucketCount; b++) {
    const start = b * bucketSize;
    const end = Math.min(start + bucketSize, len);
    if (start >= end) break;
    let minIdx = start;
    let maxIdx = start;
    for (let i = start + 1; i < end; i++) {
      if (samples2[i].value < samples2[minIdx].value) minIdx = i;
      if (samples2[i].value > samples2[maxIdx].value) maxIdx = i;
    }
    const first = Math.min(minIdx, maxIdx);
    const second = Math.max(minIdx, maxIdx);
    result.push({ x: samples2[first].timeSec, y: samples2[first].value });
    if (first !== second) {
      result.push({ x: samples2[second].timeSec, y: samples2[second].value });
    }
  }
  return result;
}
function toDisplayPoints(samples2, _tMin, _tMax, maxPoints) {
  const cap = Math.max(2, maxPoints);
  if (samples2.length <= cap) {
    return uniformStride(samples2, cap);
  }
  return minMaxBuckets(samples2, cap);
}
function computeStripLayout(paramKeys, viewWidth, viewHeight) {
  const count = Math.min(paramKeys.length, STACKED_LAYOUT.maxSeries);
  if (count === 0) return [];
  const plotWidth = Math.max(10, viewWidth - STACKED_LAYOUT.leftMargin - STACKED_LAYOUT.rightMargin);
  const rawStripHeight = viewHeight / count;
  const stripHeight = Math.max(STACKED_LAYOUT.minStripHeight, rawStripHeight);
  const strips = [];
  for (let i = 0; i < count; i++) {
    strips.push({
      key: paramKeys[i],
      x: STACKED_LAYOUT.leftMargin,
      y: i * stripHeight,
      w: plotWidth,
      h: stripHeight - 1
    });
  }
  return strips;
}
function drawStrip(ctx, strip, points, label, colorIndex, viewStartSec, viewEndSec) {
  const { x, y, w, h } = strip;
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  ctx.fillStyle = THEME.plotBg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  if (points.length < 2) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 4);
    return;
  }
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  if (Math.abs(yMax - yMin) < 1e-12) {
    yMin -= 1;
    yMax += 1;
  }
  const yRange = Math.max(1e-3, yMax - yMin);
  const innerH = Math.max(1, h - 10);
  const color = paletteColor(colorIndex);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < points.length; i++) {
    const px = x + (points[i].x - viewStartSec) / dt * w;
    const py = y + h - 5 - (points[i].y - yMin) / yRange * innerH;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.fillStyle = THEME.text;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + 6, y + 2);
  if (h >= 30) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const maxLabel = yMax.toFixed(yRange < 10 ? 1 : 0);
    const minLabel = yMin.toFixed(yRange < 10 ? 1 : 0);
    ctx.fillText(maxLabel, x + w - 4, y + 8);
    ctx.fillText(minLabel, x + w - 4, y + h - 8);
  }
}
function renderStackedCached(ctx, strips, cachedPoints, keys, viewStartSec, viewEndSec) {
  for (let i = 0; i < strips.length; i++) {
    const strip = strips[i];
    const points = cachedPoints[i] ?? [];
    drawStrip(ctx, strip, points, keys[i] ?? strip.key, i, viewStartSec, viewEndSec);
  }
}
function renderStackedCursor(ctx, cursorX, viewWidth, viewHeight) {
  if (cursorX < STACKED_LAYOUT.leftMargin || cursorX > viewWidth - STACKED_LAYOUT.rightMargin) return;
  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, 0);
  ctx.lineTo(cursorX, viewHeight);
  ctx.stroke();
  ctx.restore();
}
function computeOverlayLayout(paramCount, viewWidth, viewHeight) {
  const legendHeight = Math.min(
    viewHeight / 3,
    Math.min(paramCount, OVERLAY_LAYOUT.maxSeries) * OVERLAY_LAYOUT.legendLineHeight + 8
  );
  const plotLeft = OVERLAY_LAYOUT.plotLeft;
  const plotTop = OVERLAY_LAYOUT.plotTop;
  const plotWidth = Math.max(10, viewWidth - OVERLAY_LAYOUT.plotLeft - OVERLAY_LAYOUT.plotRight);
  const plotHeight = Math.max(10, viewHeight - OVERLAY_LAYOUT.plotTop - OVERLAY_LAYOUT.plotBottom - legendHeight);
  return { plotLeft, plotTop, plotWidth, plotHeight, legendHeight };
}
function computeOverlaySeries(snapshots, paramKeys, viewStartSec, viewEndSec, plotWidth) {
  let yMin = Infinity;
  let yMax = -Infinity;
  const seriesList = [];
  let colorIndex = 0;
  const snapshotMap = new Map(snapshots.map((s) => [s.key, s.samples]));
  const maxPoints = Math.max(64, plotWidth);
  for (const key of paramKeys.slice(0, OVERLAY_LAYOUT.maxSeries)) {
    const samples2 = snapshotMap.get(key);
    if (!samples2 || samples2.length < 2) continue;
    const points = toDisplayPoints(samples2, viewStartSec, viewEndSec, maxPoints);
    if (points.length < 2) continue;
    const color = paletteColor(colorIndex++);
    for (const p of points) {
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    }
    seriesList.push({ key, color, path: points });
  }
  if (yMin > yMax) {
    yMin = -1;
    yMax = 1;
  }
  if (Math.abs(yMax - yMin) < 1e-12) {
    yMin -= 1;
    yMax += 1;
  }
  return { seriesList, yMin, yMax };
}
function seriesToPixelPath(points, viewStartSec, viewEndSec, plotLeft, plotWidth, plotBottom, plotHeight, yMin, yMax) {
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  const yRange = Math.max(1e-3, yMax - yMin);
  const innerH = plotHeight - 4;
  return points.map((p) => ({
    x: plotLeft + (p.x - viewStartSec) / dt * plotWidth,
    y: plotBottom - (p.y - yMin) / yRange * innerH - 2
  }));
}
function renderOverlay(ctx, paramKeys, snapshots, viewStartSec, viewEndSec, viewWidth, viewHeight) {
  const layout = computeOverlayLayout(paramKeys.length, viewWidth, viewHeight);
  const { plotLeft, plotTop, plotWidth, plotHeight } = layout;
  const plotBottom = plotTop + plotHeight;
  ctx.fillStyle = THEME.widgetBg;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
  ctx.fillStyle = THEME.plotBg;
  ctx.beginPath();
  const r = 4;
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.stroke();
  const { seriesList, yMin, yMax } = computeOverlaySeries(
    snapshots,
    paramKeys,
    viewStartSec,
    viewEndSec,
    plotWidth
  );
  if (seriesList.length > 0) {
    const yRange = yMax - yMin || 1;
    const tickCount = 4;
    ctx.fillStyle = THEME.textDim;
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= tickCount; i++) {
      const val = yMin + yRange * i / tickCount;
      const tickY = plotBottom - (val - yMin) / yRange * (plotHeight - 4) - 2;
      ctx.fillText(val.toFixed(yRange < 10 ? 1 : 0), plotLeft - 6, tickY);
      ctx.strokeStyle = THEME.border;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(plotLeft + 1, tickY);
      ctx.lineTo(plotLeft + plotWidth, tickY);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  if (seriesList.length === 0) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Ожидание данных…", plotLeft + plotWidth / 2, plotTop + plotHeight / 2);
    return;
  }
  for (const entry of seriesList) {
    const pixelPath = seriesToPixelPath(
      entry.path,
      viewStartSec,
      viewEndSec,
      plotLeft,
      plotWidth,
      plotBottom,
      plotHeight,
      yMin,
      yMax
    );
    ctx.beginPath();
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < pixelPath.length; i++) {
      if (i === 0) {
        ctx.moveTo(pixelPath[i].x, pixelPath[i].y);
      } else {
        ctx.lineTo(pixelPath[i].x, pixelPath[i].y);
      }
    }
    ctx.stroke();
  }
  const labelY = plotBottom + 14;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(viewStartSec.toFixed(1) + "s", plotLeft, labelY);
  ctx.textAlign = "right";
  ctx.fillText(viewEndSec.toFixed(1) + "s", plotLeft + plotWidth, labelY);
  const legendY = plotBottom + OVERLAY_LAYOUT.plotBottom;
  for (let i = 0; i < seriesList.length; i++) {
    const entry = seriesList[i];
    const ly = legendY + i * OVERLAY_LAYOUT.legendLineHeight;
    ctx.fillStyle = entry.color;
    ctx.fillRect(plotLeft + 4, ly + 6, 14, 3);
    const label = entry.key.length > 28 ? entry.key.substring(0, 25) + "…" : entry.key;
    ctx.fillStyle = THEME.text;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, plotLeft + 22, ly + 2);
  }
}
function renderOverlayCached(ctx, paramKeys, cachedSeries, cachedYMin, cachedYMax, viewStartSec, viewEndSec, viewWidth, viewHeight) {
  const layout = computeOverlayLayout(paramKeys.length, viewWidth, viewHeight);
  const { plotLeft, plotTop, plotWidth, plotHeight } = layout;
  const plotBottom = plotTop + plotHeight;
  ctx.fillStyle = THEME.widgetBg;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
  ctx.fillStyle = THEME.plotBg;
  ctx.beginPath();
  const r = 4;
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.stroke();
  const yRange = cachedYMax - cachedYMin || 1;
  const tickCount = 4;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "9px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= tickCount; i++) {
    const val = cachedYMin + yRange * i / tickCount;
    const tickY = plotBottom - (val - cachedYMin) / yRange * (plotHeight - 4) - 2;
    ctx.fillText(val.toFixed(yRange < 10 ? 1 : 0), plotLeft - 6, tickY);
    ctx.strokeStyle = THEME.border;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(plotLeft + 1, tickY);
    ctx.lineTo(plotLeft + plotWidth, tickY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  const yr = Math.max(1e-3, cachedYMax - cachedYMin);
  const innerH = plotHeight - 4;
  for (const entry of cachedSeries) {
    ctx.beginPath();
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < entry.path.length; i++) {
      const px = plotLeft + (entry.path[i].x - viewStartSec) / dt * plotWidth;
      const py = plotBottom - (entry.path[i].y - cachedYMin) / yr * innerH - 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  const labelY = plotBottom + 14;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(viewStartSec.toFixed(1) + "s", plotLeft, labelY);
  ctx.textAlign = "right";
  ctx.fillText(viewEndSec.toFixed(1) + "s", plotLeft + plotWidth, labelY);
  const legendY = plotBottom + OVERLAY_LAYOUT.plotBottom;
  for (let i = 0; i < cachedSeries.length; i++) {
    const entry = cachedSeries[i];
    const ly = legendY + i * OVERLAY_LAYOUT.legendLineHeight;
    ctx.fillStyle = entry.color;
    ctx.fillRect(plotLeft + 4, ly + 6, 14, 3);
    const label = entry.key.length > 28 ? entry.key.substring(0, 25) + "…" : entry.key;
    ctx.fillStyle = THEME.text;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, plotLeft + 22, ly + 2);
  }
}
function renderOverlayCursor(ctx, cursorX, plotLeft, plotWidth, plotTop, plotHeight) {
  if (cursorX < plotLeft || cursorX > plotLeft + plotWidth) return;
  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, plotTop);
  ctx.lineTo(cursorX, plotTop + plotHeight);
  ctx.stroke();
  ctx.restore();
}
const MAX_SAMPLES = 1e3;
const displaySamples = [];
let sampleHead = 0;
function addChartSample(displayMs) {
  if (displaySamples.length < MAX_SAMPLES) {
    displaySamples.push(displayMs);
  } else {
    displaySamples[sampleHead % MAX_SAMPLES] = displayMs;
  }
  sampleHead++;
}
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
function getChartStats() {
  if (displaySamples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...displaySamples].sort((a, b) => a - b);
  return {
    count: displaySamples.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1]
  };
}
function resetChartLatency() {
  displaySamples.length = 0;
  sampleHead = 0;
}
const ChartsPanel = ({
  dataSource,
  paramKeys,
  mode = "stacked",
  cursorTimeSecRef,
  onCursorChange,
  lastT0MsRef
}) => {
  const containerRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const backBufferRef = reactExports.useRef(null);
  const viewStateRef = reactExports.useRef(createViewState());
  const lastRevisionRef = reactExports.useRef(-1);
  const cursorXRef = reactExports.useRef(null);
  const cursorDirtyRef = reactExports.useRef(false);
  const cachedOverlayRef = reactExports.useRef(null);
  const cachedStackedRef = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState({ width: 0, height: 0 });
  reactExports.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width * devicePixelRatio);
        const h = Math.floor(height * devicePixelRatio);
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = size.width / devicePixelRatio + "px";
    canvas.style.height = size.height / devicePixelRatio + "px";
    if (backBufferRef.current) {
      backBufferRef.current.width = size.width;
      backBufferRef.current.height = size.height;
    }
    lastRevisionRef.current = -1;
    cachedOverlayRef.current = null;
    cachedStackedRef.current = null;
  }, [size]);
  const render = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = size.width;
    const h = size.height;
    const state = viewStateRef.current;
    updateViewRange(state, dataSource.getSessionTimeSec());
    const curRevision = dataSource.getRevision();
    const dataChanged = curRevision !== lastRevisionRef.current;
    const cursorDirty = cursorDirtyRef.current;
    const cx = cursorXRef.current;
    if (dataChanged) {
      lastRevisionRef.current = curRevision;
      if (mode === "stacked") {
        const strips = computeStripLayout(paramKeys, w, h);
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 20),
          state.viewStartSec,
          state.viewEndSec
        );
        const snapshotMap = new Map(snapshots.map((s) => [s.key, s.samples]));
        const displayPoints = strips.map((strip) => {
          const samples2 = snapshotMap.get(strip.key) ?? [];
          return toDisplayPoints(samples2, state.viewStartSec, state.viewEndSec, Math.max(32, strip.w));
        });
        cachedStackedRef.current = { strips, displayPoints };
        if (backBufferRef.current) backBufferRef.current = null;
        renderStackedCached(ctx, strips, displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
      } else {
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 24),
          state.viewStartSec,
          state.viewEndSec
        );
        const result = computeOverlaySeries(snapshots, paramKeys, state.viewStartSec, state.viewEndSec, w);
        cachedOverlayRef.current = { seriesList: result.seriesList, yMin: result.yMin, yMax: result.yMax };
        renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, w, h);
      }
      if (lastT0MsRef && lastT0MsRef.current > 0) {
        const tPaint = performance.timeOrigin + performance.now();
        addChartSample(tPaint - lastT0MsRef.current);
      }
    } else if (mode === "stacked" && cachedStackedRef.current) {
      const cs = cachedStackedRef.current;
      renderStackedCached(ctx, cs.strips, cs.displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
    } else if (mode === "overlay" && cachedOverlayRef.current) {
      const c = cachedOverlayRef.current;
      renderOverlayCached(
        ctx,
        paramKeys,
        c.seriesList,
        c.yMin,
        c.yMax,
        state.viewStartSec,
        state.viewEndSec,
        w,
        h
      );
    }
    if (cx !== null && (dataChanged || cursorDirty)) {
      if (mode === "stacked") {
        if (!dataChanged && cachedStackedRef.current) {
          const cs = cachedStackedRef.current;
          renderStackedCached(ctx, cs.strips, cs.displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
        }
        renderStackedCursor(ctx, cx, w, h);
      } else {
        if (!dataChanged && cachedOverlayRef.current) {
          const c = cachedOverlayRef.current;
          renderOverlayCached(
            ctx,
            paramKeys,
            c.seriesList,
            c.yMin,
            c.yMax,
            state.viewStartSec,
            state.viewEndSec,
            w,
            h
          );
        }
        const layout = computeOverlayLayout(Math.min(paramKeys.length, 24), w, h);
        renderOverlayCursor(ctx, cx, layout.plotLeft, layout.plotWidth, layout.plotTop, layout.plotHeight);
      }
      cursorDirtyRef.current = false;
    }
  }, [dataSource, paramKeys, mode, size]);
  reactExports.useEffect(() => {
    let rafId;
    let wasHidden = false;
    const loop = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        rafId = requestAnimationFrame(loop);
        return;
      }
      if (wasHidden) {
        lastRevisionRef.current = -1;
        wasHidden = false;
      }
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render]);
  const handleMouseMove = reactExports.useCallback((e) => {
    if (mode === "overlay") {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      cursorXRef.current = px;
      cursorDirtyRef.current = true;
      if (onCursorChange) {
        const dt = Math.max(1e-3, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins("overlay");
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      }
    }
  }, [mode, onCursorChange, size]);
  const handleMouseDown = reactExports.useCallback((e) => {
    if (mode === "stacked") {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      if (cursorXRef.current !== null && Math.abs(cursorXRef.current - px) < 5) {
        cursorXRef.current = null;
      } else {
        cursorXRef.current = px;
      }
      cursorDirtyRef.current = true;
      if (cursorTimeSecRef && cursorXRef.current !== null && onCursorChange) {
        const dt = Math.max(1e-3, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins("stacked");
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      } else if (cursorTimeSecRef && cursorXRef.current === null && onCursorChange) {
        onCursorChange(-1);
      }
    }
  }, [mode, onCursorChange, size, cursorTimeSecRef]);
  const handleMouseUp = reactExports.useCallback(() => {
  }, [mode]);
  const handleWheel = reactExports.useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    applyZoom(viewStateRef.current, dataSource.getSessionTimeSec(), factor);
    lastRevisionRef.current = -1;
    render();
  }, [dataSource, render]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      ref: canvasRef,
      style: { display: "block", cursor: mode === "overlay" ? "none" : "crosshair" },
      onMouseMove: handleMouseMove,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onWheel: handleWheel
    }
  ) });
};
const RING_CAPACITY = 3e3;
const EPS = 1e-9;
class RingBuffer {
  constructor() {
    this.head = 0;
    this.count = 0;
    this.buf = new Array(RING_CAPACITY);
  }
  /** Push a point. Overwrites oldest if full. */
  push(timeSec, value, valid) {
    this.buf[this.head] = { timeSec, value, valid };
    this.head = (this.head + 1) % RING_CAPACITY;
    if (this.count < RING_CAPACITY) {
      this.count++;
    }
  }
  /** Return points in [tMin, tMax] in chronological order (old → new). */
  samplesInWindow(tMin, tMax) {
    if (this.count === 0) return [];
    const result = [];
    const len = this.count;
    const startIdx = this.head;
    for (let i = 0; i < len; i++) {
      const idx = (startIdx - 1 - i + RING_CAPACITY) % RING_CAPACITY;
      const pt = this.buf[idx];
      if (!pt) continue;
      if (!pt.valid) continue;
      if (pt.timeSec > tMax + EPS) continue;
      if (pt.timeSec < tMin - EPS) break;
      result.push(pt);
    }
    result.reverse();
    return result;
  }
  /** Number of valid points stored */
  size() {
    return this.count;
  }
}
class DataHub {
  constructor(maxTrackedKeys = 50) {
    this.buffers = /* @__PURE__ */ new Map();
    this.paramIndex = /* @__PURE__ */ new Map();
    this.paramDisplayName = /* @__PURE__ */ new Map();
    this.activeKeys = [];
    this.revision = 0;
    this.sessionStartMs = 0;
    this.sessionTimeSec = 0;
    this.initialized = false;
    this.maxTrackedKeys = maxTrackedKeys;
  }
  /** Configure active parameters from an ordered list of ParamInfo */
  configure(params) {
    const keys = params.map((p) => p.key);
    this.activeKeys = keys.slice(0, this.maxTrackedKeys);
    for (const p of params) {
      if (!this.activeKeys.includes(p.key)) continue;
      this.paramIndex.set(p.key, p.index);
      this.paramDisplayName.set(p.key, p.displayName);
      if (!this.buffers.has(p.key)) {
        this.buffers.set(p.key, new RingBuffer());
      }
    }
  }
  /** Get currently active keys */
  getActiveKeys() {
    return [...this.activeKeys];
  }
  /** Get display name for a key */
  getDisplayName(key) {
    return this.paramDisplayName.get(key) ?? key;
  }
  /** Ingest a decoded frame */
  ingestFrame(values, epochMs) {
    if (!this.initialized) {
      this.sessionStartMs = epochMs;
      this.initialized = true;
    }
    this.sessionTimeSec = (epochMs - this.sessionStartMs) / 1e3;
    for (const key of this.activeKeys) {
      const idx = this.paramIndex.get(key);
      if (idx === void 0) continue;
      const value = idx < values.length ? values[idx] : 0;
      const valid = idx < values.length && Number.isFinite(value);
      const buf = this.buffers.get(key);
      if (buf) {
        buf.push(this.sessionTimeSec, value, valid);
      }
    }
    this.revision++;
  }
  /** Get samples for keys in time window */
  chartSnapshots(keys, tMin, tMax) {
    return keys.map((key) => {
      const buf = this.buffers.get(key);
      const samples2 = buf ? buf.samplesInWindow(tMin, tMax) : [];
      return { key, samples: samples2 };
    });
  }
  /** Current revision number */
  getRevision() {
    return this.revision;
  }
  /** Current session time in seconds */
  getSessionTimeSec() {
    return this.sessionTimeSec;
  }
  /** Session start epoch ms */
  getSessionStartMs() {
    return this.sessionStartMs;
  }
  /** Release all buffers and reset state */
  destroy() {
    this.buffers.clear();
    this.paramIndex.clear();
    this.paramDisplayName.clear();
    this.activeKeys = [];
    this.revision = 0;
    this.sessionTimeSec = 0;
    this.sessionStartMs = 0;
    this.initialized = false;
  }
}
class PFDTelemetryHub {
  constructor(params, frameToValues) {
    this.hub = new DataHub(50);
    this.hub.configure(params);
    this.frameToValues = frameToValues;
  }
  /** Ingest a telemetry frame */
  ingest(frame, epochMs) {
    const values = this.frameToValues(frame);
    this.hub.ingestFrame(values, epochMs);
  }
  getActiveKeys() {
    return this.hub.getActiveKeys();
  }
  getDisplayName(key) {
    return this.hub.getDisplayName(key);
  }
  getRevision() {
    return this.hub.getRevision();
  }
  getSessionTimeSec() {
    return this.hub.getSessionTimeSec();
  }
  chartSnapshots(keys, tMin, tMax) {
    return this.hub.chartSnapshots(keys, tMin, tMax);
  }
  destroy() {
    this.hub.destroy();
  }
}
function paramsFromCatalog(catalog) {
  return catalog.map((entry, idx) => ({
    key: entry.key,
    displayName: entry.comment,
    index: idx
  }));
}
function frameToValuesFromCatalog(catalog, frame) {
  return catalog.map((entry) => {
    const val = frame[entry.key];
    return typeof val === "number" && Number.isFinite(val) ? val : 0;
  });
}
const ChartsView = ({ frame, epochMs, catalog, initialMode = "stacked" }) => {
  const hubRef = reactExports.useRef(null);
  const lastT0MsRef = reactExports.useRef(0);
  const [keys, setKeys] = reactExports.useState([]);
  const [mode, setMode] = reactExports.useState(initialMode);
  const cursorTimeSecRef = reactExports.useRef(-1);
  const [cursorTimeLabel, setCursorTimeLabel] = reactExports.useState(null);
  const [latStats, setLatStats] = reactExports.useState(() => getChartStats());
  reactExports.useEffect(() => {
    const params = paramsFromCatalog(catalog);
    const converter = (f) => frameToValuesFromCatalog(catalog, f);
    const hub = new PFDTelemetryHub(params, converter);
    hubRef.current = hub;
    setKeys(hub.getActiveKeys());
    return () => {
      hub.destroy();
    };
  }, [catalog]);
  reactExports.useEffect(() => {
    if (!hubRef.current) return;
    hubRef.current.ingest(frame, epochMs);
    const t0 = frame._t0_ms;
    if (typeof t0 === "number" && t0 > 0) {
      lastT0MsRef.current = t0;
    }
  }, [frame, epochMs]);
  reactExports.useEffect(() => {
    const t = setInterval(() => setLatStats(getChartStats()), 500);
    return () => clearInterval(t);
  }, []);
  const handleCursorChange = reactExports.useCallback((timeSec) => {
    cursorTimeSecRef.current = timeSec;
    if (timeSec >= 0) {
      setCursorTimeLabel(timeSec.toFixed(1) + "s");
    } else {
      setCursorTimeLabel(null);
    }
  }, []);
  const fmt2 = (v) => v.toFixed(1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col bg-[#0B0F14]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex items-center gap-3 px-4 py-2 bg-black/60 border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMode("stacked"),
          className: `px-3 py-1 rounded text-xs font-medium transition ${mode === "stacked" ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`,
          children: "Stacked"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMode("overlay"),
          className: `px-3 py-1 rounded text-xs font-medium transition ${mode === "overlay" ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`,
          children: "Overlay"
        }
      ),
      latStats.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-white/50 ml-2 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/30", children: "⏱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P50:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#48bb78]", children: fmt2(latStats.p50) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P95:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#ecc94b]", children: fmt2(latStats.p95) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P99:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#fc8181]", children: fmt2(latStats.p99) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "MAX:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#f56565]", children: fmt2(latStats.max) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/20", children: "ms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              resetChartLatency();
              setLatStats(getChartStats());
            },
            className: "text-white/20 hover:text-white/50 text-[9px] ml-1",
            title: "Reset",
            children: "↺"
          }
        )
      ] }),
      cursorTimeLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[#00DCFF] text-xs font-mono", children: [
        "cursor: ",
        cursorTimeLabel
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0", children: hubRef.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChartsPanel,
      {
        dataSource: hubRef.current,
        paramKeys: keys,
        mode,
        cursorTimeSecRef,
        onCursorChange: handleCursorChange,
        lastT0MsRef
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-white/30 text-sm", children: "Initializing charts…" }) })
  ] });
};
const Aircraft3DInstrument = React.lazy(() => __vitePreload(() => import("./LazyAircraft3DInstrument-CnDfhLmU.js"), true ? __vite__mapDeps([3,1]) : void 0));
const LIVE_PFD_URL = "/events/pfd";
function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const [currentView, setCurrentView] = reactExports$1.useState("hub");
  const [frame, setFrame] = reactExports$1.useState(sampleFrames[0]);
  const [error, setError] = reactExports$1.useState(null);
  const [isPlaying, setIsPlaying] = reactExports$1.useState(true);
  const [frameIndex, setFrameIndex] = reactExports$1.useState(0);
  const [activeTab, setActiveTab] = reactExports$1.useState("pfd");
  const [dataMode, setDataMode] = reactExports$1.useState("sample");
  const [connStatus, setConnStatus] = reactExports$1.useState("disconnected");
  const [liveSeq, setLiveSeq] = reactExports$1.useState(null);
  const [sourceStatus, setSourceStatus] = reactExports$1.useState(null);
  const [settingsHost, setSettingsHost] = reactExports$1.useState("0.0.0.0");
  const [settingsPort, setSettingsPort] = reactExports$1.useState("14443");
  const [settingsSimAltitudeFt, setSettingsSimAltitudeFt] = reactExports$1.useState("10000");
  const [settingsSimCasKt, setSettingsSimCasKt] = reactExports$1.useState("250");
  const [settingsSimThrottlePct, setSettingsSimThrottlePct] = reactExports$1.useState("60");
  const [settingsSimPitchDeg, setSettingsSimPitchDeg] = reactExports$1.useState("3");
  const [settingsBusy, setSettingsBusy] = reactExports$1.useState(false);
  const [backendMode, setBackendMode] = reactExports$1.useState("udp");
  const [isRecording, setIsRecording] = reactExports$1.useState(false);
  const [recordingFrames, setRecordingFrames] = reactExports$1.useState(0);
  const [recordings, setRecordings] = reactExports$1.useState([]);
  const [replayFrames, setReplayFrames] = reactExports$1.useState([]);
  const [replayIndex, setReplayIndex] = reactExports$1.useState(0);
  const [simulatorProfiles, setSimulatorProfiles] = reactExports$1.useState([]);
  const [selectedSimulatorProfileId, setSelectedSimulatorProfileId] = reactExports$1.useState("trim_hold_60s");
  const [simulatorInitialPresets, setSimulatorInitialPresets] = reactExports$1.useState([]);
  const [selectedSimulatorPresetId, setSelectedSimulatorPresetId] = reactExports$1.useState("cruise_10000_250");
  const [profileRunBusy, setProfileRunBusy] = reactExports$1.useState(false);
  const [profileRunResult, setProfileRunResult] = reactExports$1.useState(null);
  const [activeProfileReplay, setActiveProfileReplay] = reactExports$1.useState(null);
  const [profiles, setProfiles] = reactExports$1.useState([]);
  const [selectedProfileId, setSelectedProfileId] = reactExports$1.useState("default");
  const [profilesLoading, setProfilesLoading] = reactExports$1.useState(true);
  const frameRef = reactExports$1.useRef(frameIndex);
  const eventSourceRef = reactExports$1.useRef(null);
  const pressedKeys = reactExports$1.useRef(/* @__PURE__ */ new Set());
  const telemetryCallbackRef = reactExports$1.useRef(setFrame);
  telemetryCallbackRef.current = setFrame;
  reactExports$1.useEffect(() => {
    console.log("[App] wiring onTelemetryUpdate");
    window.__appControlsRef = aircraftControlsRef;
    aircraftControlsRef.current.onTelemetryUpdate = (f) => {
      telemetryCallbackRef.current(f);
    };
    return () => {
      console.log("[App] cleanup onTelemetryUpdate");
      aircraftControlsRef.current.onTelemetryUpdate = null;
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "sample") return;
    let animationId;
    let lastTime = 0;
    const tick = (time) => {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      if (dt > 33) {
        frameRef.current = (frameRef.current + 1) % sampleFrames.length;
        setFrameIndex(frameRef.current);
        const f = sampleFrames[frameRef.current];
        if (!aircraftControlsRef.current.telemetryLocked) {
          telemetryRef.current = f;
        }
        setFrame(f);
        lastTime = time;
      }
      if (isPlaying) animationId = requestAnimationFrame(tick);
    };
    if (isPlaying) animationId = requestAnimationFrame(tick);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, dataMode]);
  const connectLive = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus("connecting");
    const es = new EventSource(LIVE_PFD_URL);
    eventSourceRef.current = es;
    es.addEventListener("open", () => {
      setConnStatus("waiting");
      setError(null);
    });
    es.addEventListener("pfd-frame", (event) => {
      try {
        const data = JSON.parse(event.data);
        const browserRecvMs = performance.timeOrigin + performance.now();
        telemetryRef.current = data;
        setFrame(data);
        setLiveSeq(data.seq ?? null);
        setConnStatus("receiving");
        setError(null);
        if (document.visibilityState === "hidden") return;
        const t0 = typeof data._t0_ms === "number" ? data._t0_ms : 0;
        const tDecode = typeof data._t_decode_ms === "number" ? data._t_decode_ms : 0;
        const frameId = typeof data._frame_id === "number" ? data._frame_id : 0;
        requestAnimationFrame(() => {
          const tPaintMs = performance.timeOrigin + performance.now();
          addSample({
            frame_id: frameId,
            t_recv_ms: t0,
            t_decoded_ms: tDecode,
            t_paint_ms: tPaintMs,
            processing_ms: tDecode - t0,
            display_ms: tPaintMs - t0
          });
        });
      } catch {
        setError("Failed to parse pfd-frame");
      }
    });
    es.addEventListener("status", (event) => {
      try {
        const status = JSON.parse(event.data);
        const fresh = status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3e3 || status.simulatorActive;
        setConnStatus(fresh ? "receiving" : "waiting");
        if (status.simulatorMode) {
          setBackendMode(status.simulatorMode);
        }
      } catch {
      }
    });
    es.addEventListener("error", () => {
      setConnStatus("disconnected");
      setError("SSE connection lost. Retrying...");
    });
  }, []);
  const disconnectLive = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus("disconnected");
    setLiveSeq(null);
  }, []);
  const loadSourceStatus = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/source/status");
      if (!res.ok) return;
      const data = await res.json();
      setSourceStatus(data);
    } catch {
    }
  }, []);
  const loadSimulatorConfig = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/config");
      if (!res.ok) return;
      const data = await res.json();
      setSettingsSimAltitudeFt(String(Math.round(data.altitudeFt)));
      setSettingsSimCasKt(String(Math.round(data.casKt)));
      setSettingsSimThrottlePct(String(Math.round(data.throttle * 100)));
      setSettingsSimPitchDeg(String(data.pitchDeg));
    } catch {
    }
  }, []);
  const loadSimulatorProfiles = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/profiles");
      if (!res.ok) return;
      const data = await res.json();
      setSimulatorProfiles(data);
      if (data.length > 0 && !data.some((profile) => profile.id === selectedSimulatorProfileId)) {
        setSelectedSimulatorProfileId(data[0].id);
      }
    } catch {
    }
  }, [selectedSimulatorProfileId]);
  const loadSimulatorInitialPresets = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/profile-presets");
      if (!res.ok) return;
      const data = await res.json();
      setSimulatorInitialPresets(data);
      if (data.length > 0 && !data.some((preset) => preset.id === selectedSimulatorPresetId)) {
        setSelectedSimulatorPresetId(data[0].id);
      }
    } catch {
    }
  }, [selectedSimulatorPresetId]);
  reactExports$1.useEffect(() => {
    if (dataMode === "live") {
      setIsPlaying(false);
      connectLive();
    } else disconnectLive();
    return () => {
      disconnectLive();
    };
  }, [dataMode, connectLive, disconnectLive]);
  reactExports$1.useEffect(() => {
    loadSourceStatus();
    loadSimulatorConfig();
    loadSimulatorProfiles();
    loadSimulatorInitialPresets();
    const id = window.setInterval(loadSourceStatus, 1500);
    return () => window.clearInterval(id);
  }, [loadSourceStatus, loadSimulatorConfig, loadSimulatorProfiles, loadSimulatorInitialPresets]);
  reactExports$1.useEffect(() => {
    if (!sourceStatus) return;
    if (currentView !== "settings") {
      setSettingsHost(sourceStatus.udpHost);
      setSettingsPort(String(sourceStatus.udpPort));
    }
  }, [sourceStatus, currentView]);
  reactExports$1.useEffect(() => {
    if (currentView === "settings") {
      void loadSimulatorConfig();
    }
  }, [currentView, loadSimulatorConfig]);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getProfiles();
        if (cancelled) return;
        setProfiles(list);
      } catch {
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleProfileChange = reactExports$1.useCallback(async (profileId) => {
    if (profileId === selectedProfileId) return;
    try {
      const rootNode = window.__panelBuilderRootNode;
      if (rootNode) {
        const json = JSON.stringify(rootNode, null, 2);
        await saveCurrentProfile(json);
      }
    } catch {
    }
    const profile = await loadProfile(profileId);
    if (!profile) return;
    if (profile.panelConfigName) {
      const panelJson = await loadProfile$1(profile.panelConfigName);
      if (panelJson) {
        window.__pendingPanelLoad = JSON.parse(panelJson);
      }
    }
    setSelectedProfileId(profileId);
  }, [selectedProfileId]);
  const loadRecordings = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/recordings");
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch {
    }
  }, []);
  const checkCaptureStatus = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/capture/status");
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {
    }
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "live") return;
    loadRecordings();
    checkCaptureStatus();
    const id = setInterval(() => {
      loadRecordings();
      checkCaptureStatus();
    }, 2e3);
    return () => clearInterval(id);
  }, [dataMode, loadRecordings, checkCaptureStatus]);
  reactExports$1.useEffect(() => {
    const handleKeyDown = (e) => {
      var _a2, _b2;
      if (((_a2 = document.activeElement) == null ? void 0 : _a2.tagName) === "INPUT" || ((_b2 = document.activeElement) == null ? void 0 : _b2.tagName) === "TEXTAREA") {
        return;
      }
      pressedKeys.current.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "spacebar"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      pressedKeys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "live" || backendMode !== "simulator") return;
    let currentRoll = 0;
    let currentPitch = 0;
    let currentRudder = 0;
    let currentThrottle = 0.6;
    fetch("/api/simulator/status").then((res) => res.json()).then((data) => {
      if (data == null ? void 0 : data.controls) {
        currentRoll = data.controls.roll;
        currentPitch = data.controls.pitch;
        currentRudder = data.controls.rudder;
        currentThrottle = data.controls.throttle;
      }
    }).catch(() => {
    });
    const interval = setInterval(() => {
      const keys = pressedKeys.current;
      let targetRoll = 0;
      let targetPitch = 0;
      let targetRudder = 0;
      if (keys.has("a") || keys.has("arrowleft")) targetRoll = -1;
      else if (keys.has("d") || keys.has("arrowright")) targetRoll = 1;
      if (keys.has("w") || keys.has("arrowup")) targetPitch = -1;
      else if (keys.has("s") || keys.has("arrowdown")) targetPitch = 1;
      if (keys.has("q")) targetRudder = -1;
      else if (keys.has("e")) targetRudder = 1;
      currentRoll += (targetRoll - currentRoll) * 0.35;
      currentPitch += (targetPitch - currentPitch) * 0.35;
      currentRudder += (targetRudder - currentRudder) * 0.35;
      if (keys.has("shift")) {
        currentThrottle = Math.min(1, currentThrottle + 0.015);
      }
      if (keys.has("control")) {
        currentThrottle = Math.max(0, currentThrottle - 0.015);
      }
      if (keys.has(" ") || keys.has("r")) {
        resetSimulation();
      }
      fetch("/api/simulator/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll: currentRoll,
          pitch: currentPitch,
          rudder: currentRudder,
          throttle: currentThrottle,
          pilot: {
            keys: Array.from(keys),
            rollCmdRaw: targetRoll,
            pitchCmdRaw: targetPitch,
            rudderCmdRaw: targetRudder,
            throttleCmdRaw: currentThrottle
          }
        })
      }).catch(() => {
      });
    }, 50);
    return () => clearInterval(interval);
  }, [dataMode, backendMode]);
  reactExports$1.useEffect(() => {
    if (dataMode !== "replay" || replayFrames.length === 0 || !isPlaying) return;
    const interval = setInterval(() => {
      setReplayIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= replayFrames.length) {
          setIsPlaying(false);
          return prevIndex;
        }
        const f = replayFrames[nextIndex];
        telemetryRef.current = f;
        setFrame(f);
        return nextIndex;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [dataMode, replayFrames, isPlaying]);
  const setBackendSimulatorMode = async (mode) => {
    try {
      const res = await fetch("/api/simulator/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        setBackendMode(mode);
        setError(null);
      }
    } catch {
      setError("Failed to switch backend mode");
    }
  };
  const resetSimulation = async () => {
    try {
      await fetch("/api/simulator/reset", { method: "POST" });
    } catch {
    }
  };
  const runSimulatorProfile = async () => {
    try {
      setProfileRunBusy(true);
      setProfileRunResult(null);
      const res = await fetch("/api/simulator/profile/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to run simulator profile");
      }
      setProfileRunResult(data);
      setError(null);
      await loadRecordings();
      if (data.telemetryRecordingId) {
        setActiveTab("pfd");
        setActiveProfileReplay({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId,
          recordingId: data.telemetryRecordingId,
          frames: data.frames ?? 0
        });
        await startReplay(data.telemetryRecordingId);
      }
    } catch (e) {
      const message = (e == null ? void 0 : e.message) || "Failed to run simulator profile";
      setProfileRunResult({ ok: false, error: message });
      setError(message);
    } finally {
      setProfileRunBusy(false);
    }
  };
  const handleStartCapture = async () => {
    try {
      const source = (sourceStatus == null ? void 0 : sourceStatus.source) || "unknown";
      const res = await fetch("/api/capture/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, duration: "capture" })
      });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {
    }
  };
  const handleStopCapture = async () => {
    try {
      const res = await fetch("/api/capture/stop", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        await loadRecordings();
      }
    } catch {
    }
  };
  const startReplay = async (recordingId) => {
    try {
      setError("Loading recording...");
      const res = await fetch(`/api/recordings/${recordingId}/range?limit=50000`);
      if (!res.ok) throw new Error("Failed to load recording frames");
      const frames = await res.json();
      if (!Array.isArray(frames) || frames.length === 0) {
        throw new Error("Recording is empty");
      }
      setReplayFrames(frames);
      setReplayIndex(0);
      telemetryRef.current = frames[0];
      setFrame(frames[0]);
      setDataMode("replay");
      setIsPlaying(true);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to start replay");
    }
  };
  const handleFileUpload = (event) => {
    var _a2;
    const file = (_a2 = event.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a3;
      try {
        const text = (_a3 = e.target) == null ? void 0 : _a3.result;
        const json = JSON.parse(text);
        telemetryRef.current = json;
        setFrame(json);
        setIsPlaying(false);
        setError(null);
      } catch {
        setError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };
  const openViewer = () => {
    window.location.href = "/viewer/";
  };
  const saveSourceSettings = async () => {
    const port = Number(settingsPort);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      setError("Invalid UDP port (1-65535)");
      return;
    }
    const altitudeFt = Number(settingsSimAltitudeFt);
    const casKt = Number(settingsSimCasKt);
    const throttlePct = Number(settingsSimThrottlePct);
    const pitchDeg = Number(settingsSimPitchDeg);
    if (!Number.isFinite(altitudeFt) || altitudeFt < 0 || altitudeFt > 6e4) {
      setError("Invalid simulator altitude (0-60000 ft)");
      return;
    }
    if (!Number.isFinite(casKt) || casKt < 60 || casKt > 500) {
      setError("Invalid simulator CAS (60-500 kt)");
      return;
    }
    if (!Number.isFinite(throttlePct) || throttlePct < 0 || throttlePct > 100) {
      setError("Invalid simulator throttle (0-100%)");
      return;
    }
    if (!Number.isFinite(pitchDeg) || pitchDeg < -10 || pitchDeg > 15) {
      setError("Invalid simulator pitch (-10..15 deg)");
      return;
    }
    setSettingsBusy(true);
    try {
      const [sourceRes, simulatorRes] = await Promise.all([
        fetch("/api/source/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host: settingsHost.trim() || "0.0.0.0", port })
        }),
        fetch("/api/simulator/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            altitudeFt,
            casKt,
            throttle: throttlePct / 100,
            pitchDeg
          })
        })
      ]);
      if (!sourceRes.ok) {
        const e = await sourceRes.json().catch(() => ({}));
        setError(e.error || "Failed to update source");
      } else if (!simulatorRes.ok) {
        const e = await simulatorRes.json().catch(() => ({}));
        setError(e.error || "Failed to update simulator");
      } else {
        const simulatorData = await simulatorRes.json().catch(() => null);
        const config = simulatorData == null ? void 0 : simulatorData.initialConfig;
        if (config) {
          setSettingsSimAltitudeFt(String(Math.round(config.altitudeFt)));
          setSettingsSimCasKt(String(Math.round(config.casKt)));
          setSettingsSimThrottlePct(String(Math.round(config.throttle * 100)));
          setSettingsSimPitchDeg(String(config.pitchDeg));
        }
        setError(null);
        await loadSourceStatus();
      }
    } catch {
      setError("Failed to update settings");
    } finally {
      setSettingsBusy(false);
    }
  };
  const connStatusColor = { disconnected: "bg-red-500", connecting: "bg-yellow-500", waiting: "bg-yellow-500", receiving: "bg-green-500" }[connStatus];
  const connStatusLabel = { disconnected: "disconnected", connecting: "connecting...", waiting: `waiting UDP (${(sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "?"})`, receiving: `UDP (${(sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "?"})` }[connStatus];
  if (currentView === "hub") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex flex-col items-center p-8 pt-16", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-3xl mx-auto flex flex-col gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("h1", { className: "text-5xl font-bold text-white tracking-tight mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-blue-400", children: "Pilot" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-400", children: "3D" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400", children: "PFD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/40 text-lg", children: "Flight Display · Live Telemetry · Diagnostic Viewer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("pfd"),
            className: "group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-8 text-left hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-blue-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutDashboard, { className: "w-8 h-8 text-blue-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Flight Display" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Attitude indicator, airspeed tape, altitude tape,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "AoA, vertical speed. Sample & Live UDP modes."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" }),
                " Open PFD →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("aircraft3d"),
            className: "group relative bg-gradient-to-br from-sky-900/40 to-indigo-900/40 border border-sky-500/20 rounded-2xl p-8 text-left hover:border-sky-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-sky-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-sky-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-sky-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plane, { className: "w-8 h-8 text-sky-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "3D Aircraft" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Flight visualization:",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "pitch, roll, heading, speed, altitude."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-sky-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open 3D →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("rawMonitor"),
            className: "group relative bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-8 text-left hover:border-emerald-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-emerald-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-emerald-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Terminal, { className: "w-8 h-8 text-emerald-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Raw Data Monitor" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Live parser output inspector,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "decoded parameters, raw hex view."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Monitor →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("panelBuilder"),
            className: "group relative bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/20 rounded-2xl p-8 text-left hover:border-amber-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-amber-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-amber-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutDashboard, { className: "w-8 h-8 text-amber-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Panel Builder" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Design custom instrument layouts,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "drag-and-drop cockpit composition."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-amber-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Builder →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: openViewer,
            className: "group relative bg-gradient-to-br from-cyan-900/40 to-teal-900/40 border border-cyan-500/20 rounded-2xl p-8 text-left hover:border-cyan-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-cyan-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-cyan-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Monitor, { className: "w-8 h-8 text-cyan-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Diagnostic Viewer" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Live telemetry stream, capture control,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "recording replay, raw frame inspector."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-cyan-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Viewer →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("settings"),
            className: "group relative bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/20 rounded-2xl p-8 text-left hover:border-violet-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-violet-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-violet-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Settings, { className: "w-8 h-8 text-violet-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Global Source Settings" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Runtime decoder source config,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "one UDP host/port for all pages."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-violet-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Settings →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("charts"),
            className: "group relative bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-500/20 rounded-2xl p-8 text-left hover:border-teal-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-teal-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-teal-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-teal-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-8 h-8 text-teal-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Realtime Charts" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Stacked & Overlay telemetry plots,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "realtime decimated line charts."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-teal-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Charts →"
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-center gap-6 text-white/30 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(Gauge, { className: "w-3.5 h-3.5" }),
          " UDP (",
          (sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "...",
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: (sourceStatus == null ? void 0 : sourceStatus.schema) ?? "telemetry-frame.v1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: (sourceStatus == null ? void 0 : sourceStatus.active) ? "active" : "inactive" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/25", children: [
          "v",
          APP_VERSION
        ] })
      ] })
    ] }) });
  }
  if (currentView === "aircraft3d") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "h-screen w-screen bg-[#121212] flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "shrink-0 flex items-center gap-3 bg-black/60 px-4 py-2 border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-1.5 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-1.5 bg-sky-500/20 text-sky-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plane, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-base tracking-tight", children: "3D Aircraft" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 text-xs ml-auto", children: "Pitch / Roll / Heading · telemetry-frame.v1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(reactExports$1.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex items-center justify-center h-full text-white/30", children: "Loading 3D..." }), children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Aircraft3DInstrument, { frame }) }) })
    ] });
  }
  if (currentView === "rawMonitor") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(RawMonitor, { onBack: () => setCurrentView("hub") });
  }
  if (currentView === "charts") {
    const epochMs = performance.timeOrigin + performance.now();
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "h-screen w-screen bg-[#0a0a0f] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "shrink-0 flex items-center gap-3 bg-black/60 px-4 py-2 border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-1.5 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-1.5 bg-teal-500/20 text-teal-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-base tracking-tight", children: "Realtime Charts" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 text-xs ml-auto", children: "stacked / overlay · telemetry-frame.v1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        ChartsView,
        {
          frame,
          epochMs,
          catalog: FIELD_CATALOG
        }
      ) })
    ] });
  }
  if (currentView === "panelBuilder") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(TelemetryProvider, { frame, children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelBuilder, { onBack: () => setCurrentView("hub") }) });
  }
  if (currentView === "settings") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex items-start justify-center p-6 pt-16", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-3xl bg-black/40 border border-white/10 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => setCurrentView("hub"),
              className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
              title: "Back to Hub",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white text-xl font-semibold", children: "Global Source Settings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs text-white/40 font-mono", children: (sourceStatus == null ? void 0 : sourceStatus.source) ?? "tnparser-udp-..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "UDP host" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              value: settingsHost,
              onChange: (e) => setSettingsHost(e.target.value),
              className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "UDP port" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              value: settingsPort,
              onChange: (e) => setSettingsPort(e.target.value),
              className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm font-medium text-white mb-3", children: "Simulator initial state" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start altitude, ft" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 6e4,
                  value: settingsSimAltitudeFt,
                  onChange: (e) => setSettingsSimAltitudeFt(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start CAS, kt" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 60,
                  max: 500,
                  value: settingsSimCasKt,
                  onChange: (e) => setSettingsSimCasKt(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start throttle, %" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  value: settingsSimThrottlePct,
                  onChange: (e) => setSettingsSimThrottlePct(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start pitch, deg" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: -10,
                  max: 15,
                  step: 0.1,
                  value: settingsSimPitchDeg,
                  onChange: (e) => setSettingsSimPitchDeg(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-xs text-white/35 mt-3", children: "Applies on simulator start/reset. Active simulation keeps current state until reset." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm font-medium text-white mb-3", children: "UI settings" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm text-white/70", children: "Instrument tooltip font size" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-xs text-white/35", children: "Common value from UI_SETTINGS.tooltip.fontSizePx" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "font-mono text-lg text-emerald-300", children: [
              UI_SETTINGS.tooltip.fontSizePx,
              "px"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/40 text-sm", children: [
            "active: ",
            (sourceStatus == null ? void 0 : sourceStatus.active) ? "yes" : "no",
            " | schema: ",
            (sourceStatus == null ? void 0 : sourceStatus.schema) ?? "telemetry-frame.v1"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: saveSourceSettings,
              disabled: settingsBusy,
              className: "px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium",
              children: settingsBusy ? "Applying..." : "Apply"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-red-400 text-sm", children: error })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-screen w-screen bg-[#121212] flex flex-col overflow-hidden p-3", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col gap-3 min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "shrink-0 flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-2 bg-blue-500/20 text-blue-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(FileJson, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-lg tracking-tight", children: "Flight Display" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/50 text-sm", children: "saved PanelBuilder layout · telemetry-frame.v1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-white/10" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "select",
          {
            className: "bg-white/10 border border-white/10 text-xs text-white rounded px-2 py-1.5 max-w-[160px] cursor-pointer outline-none focus:border-blue-500",
            value: selectedProfileId,
            onChange: (e) => void handleProfileChange(e.target.value),
            disabled: profilesLoading,
            children: profilesLoading ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "", children: "Loading..." }) : profiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "", children: "No profiles" }) : profiles.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: p.id, children: [
              p.name,
              p.panelConfigName ? ` (${p.panelConfigName})` : ""
            ] }, p.id))
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => {
                setDataMode("sample");
                setActiveProfileReplay(null);
              },
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === "sample" ? "bg-purple-500/20 text-purple-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" }),
                " Sample"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => {
                setDataMode("live");
                setActiveProfileReplay(null);
              },
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === "live" ? "bg-green-500/20 text-green-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Radio, { className: "w-4 h-4" }),
                " Live"
              ]
            }
          ),
          dataMode === "replay" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500/20 text-blue-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(FileJson, { className: "w-4 h-4" }),
            " Replay Mode"
          ] })
        ] }),
        dataMode === "live" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${connStatusColor}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/60 text-sm", children: backendMode === "simulator" ? "Simulating" : connStatusLabel }),
          liveSeq !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 text-xs", children: [
            "#",
            liveSeq
          ] })
        ] }),
        dataMode === "replay" && activeProfileReplay && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${isPlaying ? "bg-purple-400 animate-pulse" : "bg-white/35"}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-purple-200 text-sm", children: [
            "Profile ",
            isPlaying ? "running" : "paused"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-purple-200/50 text-xs font-mono", children: [
            replayIndex + 1,
            "/",
            replayFrames.length || activeProfileReplay.frames
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => setActiveTab("pfd"),
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === "pfd" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-4 h-4" }),
                " Display"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => setActiveTab("data"),
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === "data" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Database, { className: "w-4 h-4" }),
                " Data"
              ]
            }
          )
        ] }),
        (dataMode === "sample" || dataMode === "replay") && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setIsPlaying(!isPlaying),
            className: "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10",
            children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" })
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-red-400 text-sm font-medium max-w-[200px] truncate", children: error }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("label", { className: "cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(Upload, { className: "w-4 h-4" }),
          " Upload JSON",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("input", { type: "file", accept: ".json", className: "hidden", onChange: handleFileUpload })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 min-h-0 gap-4 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 min-w-0 min-h-0 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("main", { className: "w-full flex-1 min-h-0 bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 select-none flex", children: activeTab === "pfd" ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelDisplay, { frame }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full p-6 overflow-auto text-sm font-mono text-green-400 bg-black/90", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("pre", { children: JSON.stringify(frame, null, 2) }) }) }),
        dataMode === "replay" && replayFrames.length > 0 && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-4 bg-black/45 border border-white/10 rounded-xl p-4 flex flex-col gap-2 shadow-lg backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between items-center text-xs text-white/50", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "font-mono", children: [
              "Time: ",
              (frame.timeMs / 1e3).toFixed(1),
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "font-mono", children: [
              "Total: ",
              ((((_a = replayFrames[replayFrames.length - 1]) == null ? void 0 : _a.timeMs) ?? 0) / 1e3).toFixed(1),
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              type: "range",
              min: 0,
              max: replayFrames.length - 1,
              value: replayIndex,
              onChange: (e) => {
                const idx = Number(e.target.value);
                setReplayIndex(idx);
                setFrame(replayFrames[idx]);
              },
              className: "w-full accent-blue-500 bg-zinc-750 h-1.5 rounded-lg appearance-none cursor-pointer"
            }
          )
        ] })
      ] }),
      (dataMode === "live" || dataMode === "replay") && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-80 shrink-0 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 text-white shadow-lg backdrop-blur-md", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h3", { className: "text-md font-bold tracking-tight", children: "Backend Source Mode" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10 w-full mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: () => setBackendSimulatorMode("udp"),
                className: `flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === "udp" ? "bg-blue-600/90 text-white shadow-sm shadow-black/40 cursor-pointer" : "text-white/60 hover:text-white cursor-pointer"}`,
                children: "UDP Stream"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: () => setBackendSimulatorMode("simulator"),
                className: `flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === "simulator" ? "bg-purple-600/90 text-white shadow-sm shadow-black/40 cursor-pointer" : "text-white/60 hover:text-white cursor-pointer"}`,
                children: "Simulator"
              }
            )
          ] })
        ] }),
        backendMode === "simulator" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-4 border-t border-white/5 pt-3 animate-fadeIn", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[10px] text-white/40 uppercase tracking-wider font-semibold", children: "Stick Control" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-32 h-32 bg-zinc-950/80 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute w-full h-[1px] bg-zinc-900" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute h-full w-[1px] bg-zinc-900" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "div",
                {
                  className: "w-3.5 h-3.5 bg-red-500 rounded-full absolute transition-all duration-75 shadow-lg shadow-red-500/50",
                  style: {
                    left: `calc(50% + ${(frame.FCU_Roll_Left ?? 0) * 42}% - 7px)`,
                    top: `calc(50% + ${(frame.FCU_Pitch_Left ?? 0) * -42}% - 7px)`
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/30 text-center font-mono", children: [
              "Roll: ",
              ((frame.FCU_Roll_Left ?? 0) * 100).toFixed(0),
              "% | Pitch: ",
              ((frame.FCU_Pitch_Left ?? 0) * 100).toFixed(0),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between text-[10px] text-white/50 font-mono font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Throttle (Shift/Ctrl)" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                Math.round(frame.Engine_N1_Target_Left ?? 60),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: "bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-75",
                style: { width: `${Math.max(0, Math.min(100, frame.Engine_N1_Target_Left ?? 60))}%` }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-white/50 flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "font-semibold text-white/70 mb-0.5", children: "Control Bindings:" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Pitch (Elevator):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "W / S" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Roll (Aileron):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "A / D" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Yaw (Rudder):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Q / E" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Thrust:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Shift / Ctrl" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Reset Simulation:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Space / R" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: resetSimulation,
                className: "mt-2 w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition border border-white/5 cursor-pointer",
                children: "Reset Plane"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-white/60", children: "Scripted Profiles" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/35 font-mono", children: [
              simulatorProfiles.length,
              " tests"
            ] })
          ] }),
          activeProfileReplay && dataMode === "replay" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-200 font-semibold", children: "Profile Replay" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-200/60 font-mono", children: isPlaying ? "RUNNING" : replayIndex >= replayFrames.length - 1 ? "FINISHED" : "PAUSED" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[10px] text-purple-100/60 font-mono truncate", title: activeProfileReplay.recordingId, children: [
              activeProfileReplay.profileId,
              " / ",
              activeProfileReplay.presetId
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: "h-full bg-purple-400 transition-all duration-75",
                style: {
                  width: `${Math.min(100, Math.max(0, (replayIndex + 1) / Math.max(1, replayFrames.length || activeProfileReplay.frames) * 100))}%`
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between text-[10px] text-purple-100/50 font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "Frame ",
                replayIndex + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: replayFrames.length || activeProfileReplay.frames })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-purple-100/45 leading-snug", children: "`trim_hold_60s` специально почти неподвижен: это проверка удержания CAS/ALT/G." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "select",
            {
              value: selectedSimulatorProfileId,
              onChange: (e) => {
                setSelectedSimulatorProfileId(e.target.value);
                setProfileRunResult(null);
              },
              className: "w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60",
              children: simulatorProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "trim_hold_60s", children: "trim_hold_60s" }) : simulatorProfiles.map((profile) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: profile.id, children: [
                profile.id,
                " (",
                Math.round(profile.durationMs / 1e3),
                "s)"
              ] }, profile.id))
            }
          ),
          ((_b = simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)) == null ? void 0 : _b.description) && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[11px] text-white/45 leading-snug", children: (_c = simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)) == null ? void 0 : _c.description }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-white/40 uppercase tracking-wider font-bold", children: "Initial Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "select",
              {
                value: selectedSimulatorPresetId,
                onChange: (e) => {
                  setSelectedSimulatorPresetId(e.target.value);
                  setProfileRunResult(null);
                },
                className: "w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60",
                children: simulatorInitialPresets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "cruise_10000_250", children: "Cruise 250 kt / 10000 ft" }) : simulatorInitialPresets.map((preset) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: preset.id, children: preset.name }, preset.id))
              }
            ),
            simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId) && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-lg bg-white/[0.025] border border-white/5 p-2 text-[10px] font-mono text-white/50 grid grid-cols-2 gap-x-3 gap-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "ALT ",
                (_d = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _d.config.altitudeFt,
                " ft"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "CAS ",
                (_e = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _e.config.casKt,
                " kt"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "THR ",
                Math.round((((_f = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _f.config.throttle) ?? 0) * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "PITCH ",
                (_g = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _g.config.pitchDeg,
                " deg"
              ] })
            ] }),
            ((_h = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _h.description) && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[11px] text-white/35 leading-snug", children: (_i = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _i.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: runSimulatorProfile,
              disabled: profileRunBusy,
              className: "w-full py-2 bg-purple-600/15 border border-purple-500/25 hover:bg-purple-600/25 disabled:opacity-50 disabled:hover:bg-purple-600/15 text-purple-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed",
              children: profileRunBusy ? "Running profile..." : "Run Profile"
            }
          ),
          profileRunResult && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: `rounded-lg border p-2 text-[10px] leading-snug font-mono ${profileRunResult.ok ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-red-500/20 bg-red-500/5 text-red-300"}`, children: profileRunResult.ok ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "OK: ",
              profileRunResult.frames,
              " frames"
            ] }),
            profileRunResult.telemetryRecordingId && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "REPLAY: ",
              profileRunResult.telemetryRecordingId
            ] }),
            profileRunResult.initialConfig && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "INIT: ",
              profileRunResult.initialConfig.altitudeFt,
              "ft / ",
              profileRunResult.initialConfig.casKt,
              "kt / THR ",
              Math.round(profileRunResult.initialConfig.throttle * 100),
              "% / P ",
              profileRunResult.initialConfig.pitchDeg,
              "deg"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate", title: profileRunResult.telemetryPath, children: [
              "TEL: ",
              profileRunResult.telemetryPath
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate", title: profileRunResult.blackboxPath, children: [
              "BB: ",
              profileRunResult.blackboxPath
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { children: profileRunResult.error }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-white/60", children: "Flight Recording" }),
            isRecording && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "flex items-center gap-1 text-[11px] text-red-400 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 animate-ping" }),
              "REC (",
              recordingFrames,
              " f)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex gap-2", children: !isRecording ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: handleStartCapture,
              className: "flex-1 py-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 rounded-lg text-xs font-semibold transition text-center cursor-pointer",
              children: "Start Recording"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: handleStopCapture,
              className: "flex-1 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition text-center cursor-pointer",
              children: "Stop Recording"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-2 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[10px] text-white/40 uppercase tracking-wider font-bold", children: "Recent Recordings" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex flex-col gap-1.5 overflow-y-auto max-h-48 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800", children: recordings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs text-white/30 italic py-1", children: "No recordings yet" }) : recordings.slice(0, 5).map((rec) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => startReplay(rec.id),
              className: "text-left p-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition flex items-center justify-between text-xs group w-full cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate flex flex-col gap-0.5 max-w-[80%]", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "font-semibold text-white/80 group-hover:text-blue-400 transition truncate", children: rec.id }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/40 font-mono", children: [
                    (rec.bytes / 1024).toFixed(1),
                    " KB"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-3.5 h-3.5 text-white/40 group-hover:text-blue-400 transition flex-shrink-0" })
              ]
            },
            rec.id
          )) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(LatencyOverlay, {})
  ] }) });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports$1.jsx(App, {})
);
requestAnimationFrame(() => {
  if (window.__bootStatus) {
    window.__bootStatus("app", "done", "App loaded");
  }
  if (window.__bootBridgeReady) {
    window.__bootBridgeReady();
  }
});
export {
  APP_VERSION as A,
  __vitePreload as _,
  Aircraft3DInstrument$2 as a,
  aircraftControlsRef as b,
  telemetryRef as t
};
