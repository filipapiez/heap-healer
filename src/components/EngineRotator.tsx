import { useEffect, useState } from "react";
import chatgptLogo from "@/assets/engines/chatgpt.png.asset.json";
import claudeLogo from "@/assets/engines/claude.png.asset.json";
import perplexityLogo from "@/assets/engines/perplexity.png.asset.json";
import geminiLogo from "@/assets/engines/gemini.png.asset.json";
import googleLogo from "@/assets/engines/google.png.asset.json";

type Engine = { name: string; src: string; scale: number; nudge: number };
// scale = height in em; nudge = vertical alignment tweak in em (positive = down).
// Tuned per-logo so wordmark cap-heights and baselines visually match the headline.
const ENGINES: Engine[] = [
  { name: "ChatGPT", src: chatgptLogo.url, scale: 1.35, nudge: 0 },
  { name: "Claude", src: claudeLogo.url, scale: 3.2, nudge: 0 },
  { name: "Perplexity", src: perplexityLogo.url, scale: 1.35, nudge: 0 },
  { name: "Gemini", src: geminiLogo.url, scale: 1.5, nudge: 0 },
  { name: "Google", src: googleLogo.url, scale: 1.55, nudge: 0 },
];
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
          vertical-align: -0.22em;
          line-height: 1;
        }
        .engine-rotator__item {
          grid-area: 1 / 1;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        .engine-rotator__logo {
          width: auto;
          display: block;
          object-fit: contain;
        }
        .engine-rotator__item--active {
          animation: engineIn 380ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .engine-rotator__item--active { animation: none; }
        }
      `}</style>
      {ENGINES.map((engine, index) => {
        const active = index === activeIndex;
        return (
          <span
            key={engine.name}
            className={`engine-rotator__item${active ? " engine-rotator__item--active" : ""}`}
            style={{ visibility: active ? "visible" : "hidden" }}
            aria-hidden="true"
          >
            <img
              src={engine.src}
              alt={engine.name}
              className="engine-rotator__logo"
              style={{
                height: `${engine.scale}em`,
                transform: engine.nudge ? `translateY(${engine.nudge}em)` : undefined,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}
