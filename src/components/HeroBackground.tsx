// =============================================================
// HeroBackground.tsx — decorative hero backdrop
// Faint micro-grid of square clusters + scattered rounded tiles
// with sparkle glyphs (generic marks in engine brand colors —
// not trademarked logos), radially masked so the center stays
// clean behind the headline. Tiles float gently; static under
// reduced-motion. Pure SVG/CSS, zero dependencies.
//
// Usage — wrap your hero:
//   <div style={{ position: "relative" }}>
//     <HeroBackground />
//     <div style={{ position: "relative", zIndex: 1 }}>
//       ...hero content...
//     </div>
//   </div>
// =============================================================

import EngineIcon, { ENGINE_LIST } from "@/components/engineIcons";

// Deterministic scatter (percent coords, avoids the masked center anyway)
const TILES: { x: number; y: number; c: number; s: number; d: number }[] = [
  { x: 6, y: 12, c: 4, s: 40, d: 0.0 },
  { x: 14, y: 42, c: 0, s: 34, d: 1.2 },
  { x: 9, y: 28, c: 2, s: 38, d: 2.1 },
  { x: 22, y: 30, c: 3, s: 30, d: 0.6 },
  { x: 30, y: 38, c: 1, s: 36, d: 1.8 },
  { x: 38, y: 10, c: 2, s: 32, d: 2.6 },
  { x: 48, y: 18, c: 4, s: 34, d: 0.9 },
  { x: 60, y: 8, c: 1, s: 38, d: 1.5 },
  { x: 70, y: 34, c: 3, s: 32, d: 2.9 },
  { x: 78, y: 26, c: 0, s: 40, d: 0.4 },
  { x: 86, y: 40, c: 2, s: 34, d: 2.3 },
  { x: 93, y: 16, c: 1, s: 36, d: 1.1 },
  { x: 94, y: 36, c: 4, s: 30, d: 1.9 },
];

export default function HeroBackground({
  gridColor = "#6366F1",
  gridOpacity = 0.07,
}: {
  gridColor?: string;
  gridOpacity?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Radial mask: fade the whole layer out behind the headline center
        WebkitMaskImage: "radial-gradient(ellipse 52% 46% at 50% 42%, transparent 38%, #000 78%)",
        maskImage: "radial-gradient(ellipse 52% 46% at 50% 42%, transparent 38%, #000 78%)",
      }}
    >
      <style>{`
        @keyframes tileFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        .hb-tile { animation: tileFloat 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hb-tile { animation: none; } }
      `}</style>

      {/* Layer 1 — micro-grid of square clusters */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="hbCluster" width="150" height="130" patternUnits="userSpaceOnUse">
            {/* one 3x3 cluster of tiny squares per cell */}
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={18 + c * 13}
                  y={16 + r * 13}
                  width="9"
                  height="9"
                  rx="2"
                  fill="none"
                  stroke={gridColor}
                  strokeOpacity={gridOpacity}
                  strokeWidth="1.2"
                />
              )),
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hbCluster)" />
      </svg>

      {/* Layer 2 — scattered floating tiles with sparkle glyphs */}
      {TILES.map((t, i) => (
        <div
          key={i}
          className="hb-tile"
          style={{
            position: "absolute",
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: t.s,
            height: t.s,
            borderRadius: 10,
            background: "#FFFFFF",
            border: "1px solid #ECEDF4",
            boxShadow: "0 6px 18px rgba(23,26,43,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animationDelay: `${t.d}s`,
          }}
        >
          <EngineIcon
            name={ENGINE_LIST[t.c % ENGINE_LIST.length]}
            size={t.s * 0.5}
            opacity={0.55}
          />
        </div>
      ))}
    </div>
  );
}
