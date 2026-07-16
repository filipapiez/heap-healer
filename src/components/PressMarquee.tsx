// =============================================================
// PressMarquee.tsx — "As mentioned in" scrolling strip
// Infinite horizontal marquee of press wordmarks, gradient-faded
// edges, pauses on hover, static row under reduced-motion.
// Transparent background — drops straight under the hero.
//
// Edit OUTLETS freely; add a url to make a wordmark clickable
// (linking each name to the real article is the strongest
// version of this strip — do that as soon as coverage is live).
// =============================================================

import React from "react";

const OUTLETS: { name: string; url?: string }[] = [
  { name: "Forbes" },
  { name: "Yahoo! Finance" },
  { name: "Bloomberg" },
  { name: "Business Insider" },
  { name: "MarketWatch" },
  { name: "TechCrunch" },
  { name: "Entrepreneur" },
  { name: "USA Today" },
];

const SPEED_S = 28; // seconds per full loop — higher = slower

export default function PressMarquee({
  label = "AS MENTIONED IN",
  color = "#9AA0AA",
}: {
  label?: string;
  color?: string;
}) {
  // Track duplicated for a seamless loop
  const track = [...OUTLETS, ...OUTLETS];

  return (
    <div
      style={{ padding: "38px 0 24px", position: "relative" }}
      aria-label={`${label}: ${OUTLETS.map((o) => o.name).join(", ")}`}
    >
      <style>{`
        @keyframes pressScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .press-viewport {
          overflow: hidden; position: relative;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
        }
        .press-track {
          display: inline-flex; align-items: center; gap: 58px;
          white-space: nowrap; will-change: transform;
          animation: pressScroll ${SPEED_S}s linear infinite;
          padding-right: 58px;
        }
        .press-viewport:hover .press-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .press-track { animation: none; flex-wrap: wrap; justify-content: center; white-space: normal; }
        }
      `}</style>

      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.2em",
          color,
          marginBottom: 16,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {label}
      </div>

      <div className="press-viewport">
        <div className="press-track" aria-hidden>
          {track.map((o, i) => {
            const mark = (
              <span
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color,
                  opacity: 0.85,
                  whiteSpace: "nowrap",
                }}
              >
                {o.name}
              </span>
            );
            return o.url ? (
              <a
                key={i}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{ textDecoration: "none" }}
              >
                {mark}
              </a>
            ) : (
              <React.Fragment key={i}>{mark}</React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
