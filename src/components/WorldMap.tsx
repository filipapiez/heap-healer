// =============================================================
// WorldMap.tsx v3 — MentionMyApp network map
// v4 - density clusters (wide scatter): land dots thicken around the HQ and
// every connected city (extra jittered micro-dots with distance
// falloff), plus accent "activity" satellites near each node.
// Real geography, transparent bg, zero dependencies.
//
// Usage: <WorldMap hqLabel="MentionMyApp" accent="#7C6CF6" />
// =============================================================

import { useMemo } from "react";

// ---- packed land bitmask: 220 x 94 grid, lon -180..180, lat 78..-56 ----
const COLS = 220;
const ROWS = 94;
const LAT_TOP = 78;
const LAT_BOT = -56;
const LAND_B64 =
  "AAAAAAYAAPgP////wAABgAAAAAAADgAAAAAAAAAAAAAdnGAAB////AAAAAAAA8AAH/8AA4AAAAAAAAAAgADAAB///8AAAAAAAMAAH/+AAAAAAAAAAAAD0M3bYAD///AAAAAAADgAH////4AAAAAAAAAAN/x5/4AP//8AAAAAAAMB3/////g/wAAAAf8AAB/xx/8Af//wAAAB8AAAHf////////AAAP////9gDzDwAf/8AAAA//gAHu///////////gP///////8T4H/8AAAAH//l//3//////////3z///////+Acwf+AbgAA/fh//////////////GD///////3N8A/gAeAAP5+f/////////////4Cf//////+ADwB8AAAAD+f///////////////wB///////gDwADwAAAAf5//////////////vwAP/z////8AHiADAAAAB/iP////////////hwAAFwB////4A/IAAAAAAHcP///////////4AYAAAEgA////wB/wAAAAA4B5f//////////+ADwAABgAB////4H/gAAAABgWH///////////wAeAAAQAAD////9//gAAAAbBC////////////ABwAAAAAAH////z//AAAADcf/////////////AGAAAAAAAP////v/4AAAAB7/////////////9AAAAAAAAA//////iAAAAAAf/////////////0AAAAAAAABf////9jgAAAAH//////////////AAAAAAAAAD/////8DAAAAA//////////////4AAAAAAAAAP/////6AAAAAB///J/P////////AAAAAAAAAA/////+gAAAAAH/f8n5////////4AAAAAAAAAD/////gAAAAAP8M/gHn////////DAAAAAAAAAP////+AAAAAA/xc+MfH///////gAAAAAAAAAA/////gAAAAAB8ETn/+//////+eAgAAAAAAAAD////8AAAAAAPwAE//x//////wwEAAAAAAAAAH////gAAAAAAeAIR//n//////5gwAAAAAAAAAP////AAAAAAAD8AAP////////GHAAAAAAAAAA////4AAAAAAD/wAA////////4TQAAAAAAAAAA////AAAAAAAf/gAH////////wYAAAAAAAAAAB///wAAAAAAD//zgf////////AAAAAAAAAAAAF//nAAAAAAAP////////////8AAAAAAAAAAAAP/wGAAAAAAB//////f//////wAAAAAAAAAAAAv+AYAAAAAAP////P8///////AAAAAAAAAAAABf4AgAAAAAB////+/4f/////4AAAAAAAAAAAAA/AAgAAAAAH////9/mB/////gAAAAAAAAAAAAB8AAAAAAAA/////z/8D////5AAAAAAAAAAAAADwAYAAAAAD/////v/wH/z/+AAAAAAAAAAAAAAfhgYAAAAAP////+/+AH+H+AAAAAAAAAAAAAAA+MAMAAAAA/////5/4Afwf6AAAAAAAAAAAAAAA/wAAAAAAD/////z/AB+A/gCAAAAAAAAAAAAAA3QAAAAAAP/////PwAHgC/AQAAAAAAAAAAAAAAPgAAAAAB/////+8AAOAD+AAAAAAAAAAAAAAAAGAAAAAAD//////AAA4AL4BAAAAAAAAAAAAAAAYAAAAAAP/////wAADgAngCAAAAAAAAAAAAAAAg/YAAAAf/////+AAEACIAQAAAAAAAAAAAAAABP/gAAAA//////4AAUAIAAgAAAAAAAAAAAAAAA//AAAAD//////AAAQAAACAAAAAAAAAAAAAAAB/+AAAAD+f///8AAAABgEIAAAAAAAAAAAAAAAH//AAAAEB////gAAAAWAwAAAAAAAAAAAAAAAAf/+AAAAAA///+AAAABoHAAAAAAAAAAAAAAAAD//4AAAAAD///wAAAADQ8AAAAAAAAAAAAAAAAf//gAAAAAP//8AAAAAGH1IAAAAAAAAAAAAAAB///wAAAAB///wAAAAAcfYMAAAAAAAAAAAAAAH///wAAAAD//+AAAAAA55gXAAAAAAAAAAAAAA////4AAAAH//wAAAAABgGB/BAAAAAAAAAAAAD////wAAAAf//AAAAAACAQA+KAAAAAAAAAAAAH////gAAAA//8AAAAAAOgAB8AAAAAAAAAAAAAP///+AAAAD//wAAAAAADgAPYEAAAAAAAAAAAA////wAAAAP//AAAAAAAAQAAwAAAAAAAAAAAAB///+AAAAA//+AAAAAAAAAAAAAAAAAAAAAAAAH///4AAAAD//4AAAAAAAADxAAAAAAAAAAAAAAf///AAAAAP//hgAAAAAABeEAAAAAAAAAAAAAA///8AAAAB//+GAAAAAAAP4YAAAAAAAAAAAAAA///wAAAAH//xwAAAAAAA/7gAAEAAAAAAAAAAB///AAAAAf/8HAAAAAAAH/+AAAAAAAAAAAAAAH//8AAAAA//gcAAAAAAA//8AAAAAAAAAAAAAAf//gAAAAD/+BwAAAAAAf//4AAAAAAAAAAAAAB//8AAAAAH/8OAAAAAAD///wAAAAAAAAAAAAAH//AAAAAAf/wYAAAAAAf///gAAAAAAAAAAAAAf/4AAAAAB/8BAAAAAAA///+AAAAAAAAAAAAAB//AAAAAAH/wAAAAAAAH///8AAAAAAAAAAAAAH/8AAAAAAP/AAAAAAAAP///wAAAAAAAAAAAAA//wAAAAAA/4AAAAAAAA////AAAAAAAAAAAAAD/+AAAAAAB/AAAAAAAAB///8AAAAAAAAAAAAAP/wAAAAAAH4AAAAAAAAH4P/gAAAAAAAAAAAAA/+AAAAAAAcAAAAAAAAA+Af8AAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAfwACAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAB/AAAAAAAAAAAAAB/4AAAAAAAAAAAAAAAAAAADQAAYAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAfQAAAAAAAAAAAAAAAAAAAAKAAUAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAQABAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAA=";

// HQ: Chicago, Illinois
const HQ: [number, number] = [-87.63, 41.88];

// Destination businesses (lon, lat)
const DESTS: [number, number][] = [
  [-122.42, 37.77],
  [-118.24, 34.05],
  [-99.13, 19.43],
  [-74.01, 40.71],
  [-79.38, 43.65],
  [-58.38, -34.6],
  [-46.63, -23.55],
  [-0.13, 51.51],
  [2.35, 48.86],
  [13.4, 52.52],
  [21.01, 52.23],
  [28.05, -26.2],
  [31.24, 30.04],
  [55.27, 25.2],
  [72.88, 19.08],
  [100.5, 13.76],
  [103.82, 1.35],
  [114.11, 22.4],
  [139.69, 35.69],
  [151.21, -33.87],
  [174.76, -36.85],
  [37.62, 55.75],
];

const W = 1000;
const H = Math.round((W * ROWS) / COLS);
const CELL = W / COLS;

const project = ([lon, lat]: [number, number]): [number, number] => [
  ((lon + 180) / 360) * W,
  ((LAT_TOP - lat) / (LAT_TOP - LAT_BOT)) * H,
];

// deterministic pseudo-random in [-0.5, 0.5)
const jit = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};

type Dot = { x: number; y: number; r: number; o: number; accent?: boolean };

function buildDots(): { base: Dot[]; cluster: Dot[]; satellites: Dot[] } {
  const bin = atob(LAND_B64);
  const land: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if ((bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1) {
        land.push([((c + 0.5) / COLS) * W, ((r + 0.5) / ROWS) * H]);
      }
    }
  }

  const hq = project(HQ);
  const nodes: { x: number; y: number; w: number }[] = [
    { x: hq[0], y: hq[1], w: 1.7 },
    ...DESTS.map((d) => {
      const [x, y] = project(d);
      return { x, y, w: 1 };
    }),
  ];

  const base: Dot[] = [];
  const cluster: Dot[] = [];
  const satellites: Dot[] = [];
  const satCount = new Map<number, number>();

  land.forEach(([x, y], i) => {
    // nearest node distance (weighted)
    let best = Infinity,
      bestNode = -1;
    for (let n = 0; n < nodes.length; n++) {
      const d = Math.hypot(x - nodes[n].x, y - nodes[n].y) / nodes[n].w;
      if (d < best) {
        best = d;
        bestNode = n;
      }
    }

    base.push({ x, y, r: 1.25, o: 1 });

    // density boost near nodes: extra jittered micro-dots, falloff
    const extra = best < 12 ? 4 : best < 22 ? 3 : best < 34 ? 2 : best < 46 ? 1 : 0;
    for (let k = 1; k <= extra; k++) {
      // spread: 2.4-4.4 cells out, so clusters read as scatter, not doubled dots
      const spread = CELL * (2.4 + Math.abs(jit(i, k + 21)) * 2.0);
      const ang = jit(i, k + 33) * Math.PI * 2;
      cluster.push({
        x: x + Math.cos(ang) * spread,
        y: y + Math.sin(ang) * spread,
        r: 0.8 + Math.abs(jit(i, k + 47)) * 0.5,
        o: 0.85 - k * 0.13,
      });
    }

    // accent satellites: a few land dots closest to each node
    const used = satCount.get(bestNode) ?? 0;
    if (best < 26 && used < 5 && i % 2 === 0) {
      satCount.set(bestNode, used + 1);
      satellites.push({ x, y, r: 1.9, o: 0.85, accent: true });
    }
  });

  return { base, cluster, satellites };
}

function arcPath(a: [number, number], b: [number, number]): string {
  const [x1, y1] = a,
    [x2, y2] = b;
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2;
  const dx = x2 - x1,
    dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const lift = Math.min(dist * 0.24, 84);
  const px = -dy / dist,
    py = dx / dist;
  const sign = py < 0 ? 1 : -1;
  const cx = mx + px * lift * sign,
    cy = my + py * lift * sign;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

const CYCLE = 9;

export default function WorldMap({
  accent = "#7C6CF6",
  dot = "#B9B3E8",
  dotOpacity = 0.5,
  height = 480,
  hqLabel = "",
  animate = true,
}: {
  accent?: string;
  dot?: string;
  dotOpacity?: number;
  height?: number;
  hqLabel?: string;
  animate?: boolean;
}) {
  const { base, cluster, satellites } = useMemo(buildDots, []);
  const hq = useMemo(() => project(HQ), []);
  const dests = useMemo(() => DESTS.map(project), []);
  const arcs = useMemo(() => dests.map((d, i) => ({ d: arcPath(hq, d), i, dest: d })), [hq, dests]);

  return (
    <div style={{ width: "100%", maxHeight: height, lineHeight: 0 }} aria-hidden>
      <style>{`
        @keyframes wmDrawArc {
          0%   { stroke-dashoffset: 340; opacity: 0; }
          8%   { opacity: 0.85; }
          45%  { stroke-dashoffset: 0; opacity: 0.85; }
          62%  { opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes wmPulse {
          0%   { transform: scale(0.4); opacity: 0.85; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes wmDestPing {
          0%, 38% { transform: scale(0); opacity: 0; }
          46%  { transform: scale(1); opacity: 0.9; }
          70%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes wmHqGlow { 50% { opacity: 0.9; } }
        @keyframes wmSat { 50% { opacity: 0.35; } }
        .wm-arc { stroke-dasharray: 340; animation: wmDrawArc ${CYCLE}s ease-in-out infinite; }
        .wm-pulse { transform-origin: center; transform-box: fill-box; animation: wmPulse 2.4s ease-out infinite; }
        .wm-ping { transform-origin: center; transform-box: fill-box; animation: wmDestPing ${CYCLE}s ease-out infinite; }
        .wm-hqglow { animation: wmHqGlow 3s ease-in-out infinite; }
        .wm-sat { animation: wmSat 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wm-arc { animation: none; stroke-dashoffset: 0; opacity: 0.45; }
          .wm-pulse, .wm-ping, .wm-hqglow, .wm-sat { animation: none; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", background: "transparent" }}
      >
        <defs>
          <radialGradient id="wmGlow">
            <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wmArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Base land dots */}
        <g fill={dot} opacity={dotOpacity}>
          {base.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} />
          ))}
        </g>

        {/* Density clusters around nodes */}
        <g fill={dot} opacity={Math.min(1, dotOpacity + 0.15)}>
          {cluster.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} opacity={p.o} />
          ))}
        </g>

        {/* Accent activity satellites */}
        <g fill={accent}>
          {satellites.map((p, i) => (
            <circle
              key={i}
              className={animate ? "wm-sat" : undefined}
              cx={p.x}
              cy={p.y}
              r={p.r}
              opacity={p.o}
              style={animate ? { animationDelay: `${(i * 0.53) % 3.6}s` } : undefined}
            />
          ))}
        </g>

        {/* Arcs from HQ */}
        <g fill="none" stroke="url(#wmArcGrad)" strokeWidth="1.3" strokeLinecap="round">
          {arcs.map(({ d, i, dest }) => {
            const delay = (i * (CYCLE / arcs.length)).toFixed(2);
            return (
              <g key={i}>
                <path
                  className={animate ? "wm-arc" : undefined}
                  d={d}
                  style={animate ? { animationDelay: `${delay}s` } : { opacity: 0.4 }}
                />
                {animate && (
                  <>
                    <circle r="2.4" fill={accent} opacity="0">
                      <animateMotion
                        dur={`${CYCLE}s`}
                        repeatCount="indefinite"
                        begin={`${delay}s`}
                        path={d}
                        keyPoints="0;1;1"
                        keyTimes="0;0.45;1"
                        calcMode="linear"
                      />
                      <animate
                        attributeName="opacity"
                        values="0;0.95;0.95;0;0"
                        keyTimes="0;0.06;0.45;0.55;1"
                        dur={`${CYCLE}s`}
                        repeatCount="indefinite"
                        begin={`${delay}s`}
                      />
                    </circle>
                    <circle
                      className="wm-ping"
                      cx={dest[0]}
                      cy={dest[1]}
                      r={6}
                      fill="none"
                      stroke={accent}
                      strokeWidth="1.2"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Destination nodes */}
        <g>
          {dests.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={7} fill="url(#wmGlow)" />
              <circle cx={x} cy={y} r={4.5} fill={accent} opacity="0.22" />
              <circle cx={x} cy={y} r={2.4} fill={accent} />
              <circle cx={x} cy={y} r={1} fill="#fff" />
            </g>
          ))}
        </g>

        {/* HQ: Chicago */}
        <g>
          <circle
            cx={hq[0]}
            cy={hq[1]}
            r={26}
            fill="url(#wmGlow)"
            className={animate ? "wm-hqglow" : undefined}
          />
          {animate && (
            <>
              <circle
                className="wm-pulse"
                cx={hq[0]}
                cy={hq[1]}
                r={10}
                fill="none"
                stroke={accent}
                strokeWidth="1.4"
              />
              <circle
                className="wm-pulse"
                cx={hq[0]}
                cy={hq[1]}
                r={10}
                fill="none"
                stroke={accent}
                strokeWidth="1.4"
                style={{ animationDelay: "1.2s" }}
              />
            </>
          )}
          <circle cx={hq[0]} cy={hq[1]} r={8} fill={accent} opacity="0.3" />
          <circle cx={hq[0]} cy={hq[1]} r={5.2} fill={accent} />
          <circle cx={hq[0]} cy={hq[1]} r={2.2} fill="#fff" />
          {hqLabel && (
            <text
              x={hq[0]}
              y={hq[1] - 16}
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill={accent}
            >
              {hqLabel}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
