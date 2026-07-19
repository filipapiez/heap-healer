import { useEffect, useState } from "react";
import chatgptLogo from "@/assets/engines/chatgpt.png.asset.json";
import claudeLogo from "@/assets/engines/claude.png.asset.json";
import perplexityLogo from "@/assets/engines/perplexity.png.asset.json";
import geminiLogo from "@/assets/engines/gemini.png.asset.json";
import googleLogo from "@/assets/engines/google.png.asset.json";

type Engine = { name: string; src: string };
const ENGINES: Engine[] = [
  { name: "ChatGPT", src: chatgptLogo.url },
  { name: "Claude", src: claudeLogo.url },
  { name: "Perplexity", src: perplexityLogo.url },
  { name: "Gemini", src: geminiLogo.url },
  { name: "Google", src: googleLogo.url },
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
          vertical-align: -0.18em;
        }
        .engine-rotator__item {
          grid-area: 1 / 1;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        .engine-rotator__logo {
          height: 0.92em;
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
            <img src={engine.src} alt={engine.name} className="engine-rotator__logo" />
          </span>
        );
      })}
    </span>
  );
}
