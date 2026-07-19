import { useEffect, useState } from "react";
import EngineIcon, { ENGINE_LIST, engineColor, type EngineName } from "@/components/engineIcons";

const ENGINES: EngineName[] = ENGINE_LIST;
const INTERVAL_MS = 2200;

export default function EngineRotator() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const interval = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % ENGINES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="engine-rotator" aria-label="ChatGPT, Claude, Perplexity, Gemini, and Google">
      <style>{`
        @keyframes engineIn {
          0% { transform: translateY(0.75em); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .engine-rotator {
          display: inline-grid;
          overflow: hidden;
          vertical-align: -0.15em;
        }
        .engine-rotator__item {
          grid-area: 1 / 1;
          display: inline-flex;
          align-items: center;
          gap: 0.3em;
          white-space: nowrap;
        }
        .engine-rotator__item--active {
          animation: engineIn 380ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .engine-rotator__item--active { animation: none; }
        }
      `}</style>
      {ENGINES.map((name, index) => {
        const active = index === activeIndex;
        return (
          <span
            key={name}
            className={`engine-rotator__item${active ? " engine-rotator__item--active" : ""}`}
            style={{
              visibility: active ? "visible" : "hidden",
              color: engineColor(name),
            }}
            aria-hidden="true"
          >
            <EngineIcon name={name} size="0.95em" />
            {name}
          </span>
        );
      })}
    </span>
  );
}
