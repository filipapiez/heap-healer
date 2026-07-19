const OUTLETS = [
  "Forbes",
  "Yahoo! Finance",
  "Bloomberg",
  "Business Insider",
  "MarketWatch",
  "TechCrunch",
  "Entrepreneur",
  "USA Today",
] as const;

export default function PressMarquee() {
  const track = [...OUTLETS, ...OUTLETS];

  return (
    <section
      className="press-marquee"
      aria-label={`Visibility targets: ${OUTLETS.join(", ")}. These names are goals, not endorsements.`}
    >
      <style>{`
        @keyframes pressScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .press-marquee {
          padding: 30px 0 28px;
          border-top: 1px solid rgba(229, 231, 235, 0.82);
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(8px);
        }
        .press-marquee__label {
          margin-bottom: 15px;
          text-align: center;
          color: #8b90a0;
          font: 800 10px/1.3 'Inter', system-ui, sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .press-marquee__viewport {
          position: relative;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        }
        .press-marquee__track {
          display: flex;
          width: max-content;
          align-items: center;
          gap: 20px;
          padding-right: 20px;
          animation: pressScroll 30s linear infinite;
          will-change: transform;
        }
        .press-marquee__viewport:hover .press-marquee__track {
          animation-play-state: paused;
        }
        .press-marquee__mark {
          display: inline-flex;
          align-items: center;
          min-height: 46px;
          padding: 0 24px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #fff;
          color: #6f7482;
          box-shadow: 0 8px 24px rgba(23, 26, 43, 0.05);
          font: 700 18px/1 Georgia, 'Times New Roman', serif;
          white-space: nowrap;
        }
        @media (prefers-reduced-motion: reduce) {
          .press-marquee__track {
            width: auto;
            flex-wrap: wrap;
            justify-content: center;
            padding: 0 20px;
            animation: none;
          }
          .press-marquee__track > :nth-child(n + 9) { display: none; }
        }
      `}</style>
      <div className="press-marquee__label">Where ambitious brands want to be discovered</div>
      <div className="press-marquee__viewport" aria-hidden="true">
        <div className="press-marquee__track">
          {track.map((outlet, index) => (
            <span className="press-marquee__mark" key={`${outlet}-${index}`}>
              {outlet}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
