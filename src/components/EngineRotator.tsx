// =============================================================
// EngineRotator.tsx — cycling engine name for the hero headline
// "Grow organic traffic on autopilot from <ChatGPT ▸ Claude ▸
//  Perplexity ▸ Gemini ▸ Google>" — smooth vertical roll every
// 2.2s, no layout shift, respects reduced-motion.
//
// Usage inside the hero h1:
//   Grow organic traffic <span style={{color: ACCENT}}>on autopilot</span>
//   {" "}from <EngineRotator />
// =============================================================

import { useEffect, useState } from "react";

const ENGINES: { name: string; color: string }[] = [
  { name: "ChatGPT", color: "#10A37F" },
  { name: "Claude", color: "#D97757" },
  { name: "Perplexity", color: "#20808D" },
  { name: "Gemini", color: "#4285F4" },
  { name: "Google", color: "#EA4335" },
];

const INTERVAL = 2200; // ms per engine

export default function EngineRotator() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ENGINES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      style={{
        display: "inline-grid",
        verticalAlign: "baseline",
        overflow: "hidden",
        // every engine occupies the same grid cell; the widest
        // (Perplexity) sets the width -> zero layout shift
      }}
      aria-label="ChatGPT, Claude, Perplexity, Gemini, and Google"
    >
      <style>{`
        @keyframes engineIn {
          0%   { transform: translateY(0.9em); opacity: 0; }
          100% { transform: translateY(0);     opacity: 1; }
        }
        .engine-cell { grid-area: 1 / 1; white-space: nowrap; display: inline-flex; align-items: baseline; gap: 0.18em; }
        .engine-cell.active { animation: engineIn 380ms cubic-bezier(0.22, 1, 0.36, 1); }
        @media (prefers-reduced-motion: reduce) {
          .engine-cell.active { animation: none; }
        }
      `}</style>
      {ENGINES.map((e, i) => (
        <span
          key={e.name}
          className={`engine-cell${i === idx ? " active" : ""}`}
          style={{
            visibility: i === idx ? "visible" : "hidden",
            color: e.color,
            fontWeight: 800,
          }}
          aria-hidden={i !== idx}
        >
          <span
            aria-hidden
            style={{
              fontSize: "0.55em",
              transform: "translateY(-0.35em)",
              display: "inline-block",
            }}
          >
            ✦
          </span>
          {e.name}
        </span>
      ))}
    </span>
  );
}
