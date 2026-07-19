type Outlet = {
  name: string;
  font: string;
  weight: number;
  tracking: string;
  transform?: "uppercase" | "none";
  italic?: boolean;
};

// Per-outlet typography chosen to evoke the flavor of each masthead
// without reproducing any trademarked wordmark.
const OUTLETS: Outlet[] = [
  { name: "Forbes",           font: "'Playfair Display', Georgia, serif", weight: 900, tracking: "-0.02em" },
  { name: "Yahoo! Finance",   font: "'Inter', system-ui, sans-serif",     weight: 800, tracking: "-0.02em" },
  { name: "Bloomberg",        font: "'Inter', system-ui, sans-serif",     weight: 800, tracking: "-0.015em" },
  { name: "Business Insider", font: "'Inter', system-ui, sans-serif",     weight: 800, tracking: "-0.02em" },
  { name: "MarketWatch",      font: "'Inter', system-ui, sans-serif",     weight: 700, tracking: "-0.01em" },
  { name: "TechCrunch",       font: "'Inter', system-ui, sans-serif",     weight: 900, tracking: "-0.04em", transform: "uppercase" },
  { name: "Entrepreneur",     font: "'Playfair Display', Georgia, serif", weight: 700, tracking: "-0.01em", italic: true },
  { name: "USA Today",        font: "'Inter', system-ui, sans-serif",     weight: 800, tracking: "-0.02em" },
];

export default function PressMarquee() {
  const track = [...OUTLETS, ...OUTLETS];

  return (
    <section
      className="press-marquee"
      aria-label={`Visibility targets: ${OUTLETS.map((o) => o.name).join(", ")}. These names are goals, not endorsements.`}
    >
      <style>{`
        @keyframes pressScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .press-marquee {
          padding: 36px 0 34px;
          border-top: 1px solid rgba(229, 231, 235, 0.9);
          border-bottom: 1px solid rgba(229, 231, 235, 0.9);
          background: #ffffff;
        }
        .press-marquee__label {
          margin-bottom: 22px;
          text-align: center;
          color: #9098a8;
          font: 700 10.5px/1.3 'Inter', system-ui, sans-serif;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }
        .press-marquee__viewport {
          position: relative;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
        }
        .press-marquee__track {
          display: flex;
          width: max-content;
          align-items: center;
          gap: 68px;
          padding-right: 68px;
          animation: pressScroll 48s linear infinite;
          will-change: transform;
        }
        .press-marquee__viewport:hover .press-marquee__track {
          animation-play-state: paused;
        }
        .press-marquee__mark {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 0;
          color: #9aa0ae;
          font-size: 26px;
          line-height: 1;
          white-space: nowrap;
          transition: color 200ms ease;
        }
        .press-marquee__mark:hover {
          color: #1e2333;
        }
        @media (prefers-reduced-motion: reduce) {
          .press-marquee__track {
            width: auto;
            flex-wrap: wrap;
            justify-content: center;
            gap: 40px 56px;
            padding: 0 24px;
            animation: none;
          }
          .press-marquee__track > :nth-child(n + 9) { display: none; }
        }
      `}</style>
      <div className="press-marquee__label">Where ambitious brands want to be discovered</div>
      <div className="press-marquee__viewport" aria-hidden="true">
        <div className="press-marquee__track">
          {track.map((outlet, index) => (
            <span
              className="press-marquee__mark"
              key={`${outlet.name}-${index}`}
              style={{
                fontFamily: outlet.font,
                fontWeight: outlet.weight,
                letterSpacing: outlet.tracking,
                textTransform: outlet.transform ?? "none",
                fontStyle: outlet.italic ? "italic" : "normal",
              }}
            >
              {outlet.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
