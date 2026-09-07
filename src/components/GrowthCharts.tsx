const INK = "#0C0E1A";
const VIOLET = "#6C5CE7";
const MUTED = "#6B7086";
const LINE = "rgba(12,14,26,0.08)";

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const IMPRESSIONS = [4200, 6100, 9800, 15400, 22800, 31600];
const CLICKS = [120, 210, 380, 660, 1040, 1520];
const BACKLINKS = [3, 9, 18, 27, 41, 58];
const PAGES = [0, 30, 61, 92, 123, 154];

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function pathFor(values: number[], w: number, h: number, pad: number) {
  const max = Math.max(...values);
  const stepX = (w - pad * 2) / (values.length - 1);
  return values.map((v, i) => {
    const x = round(pad + i * stepX);
    const y = round(h - pad - (v / max) * (h - pad * 2));
    return { x, y };
  });
}

function AreaChart({
  values,
  label,
  total,
  delta,
}: {
  values: number[];
  label: string;
  total: string;
  delta: string;
}) {
  const w = 520;
  const h = 220;
  const pad = 26;
  const pts = pathFor(values, w, h, pad);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div style={{ flex: "1 1 320px", minWidth: 280 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: MUTED }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: VIOLET }}>{delta}</span>
      </div>
      <div className="grotesk" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {total}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", marginTop: 8 }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIOLET} stopOpacity="0.28" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={pad}
            x2={w - pad}
            y1={round(pad + (i * (h - pad * 2)) / 3)}
            y2={round(pad + (i * (h - pad * 2)) / 3)}
            stroke={LINE}
            strokeWidth="1"
          />
        ))}
        <path d={area} fill={`url(#g-${id})`} />
        <path d={line} fill="none" stroke={VIOLET} strokeWidth="3" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={VIOLET} strokeWidth="2.5" />
        ))}
        {pts.map((p, i) => (
          <text
            key={`t-${i}`}
            x={p.x}
            y={h - 6}
            textAnchor="middle"
            fontSize="12"
            fill={MUTED}
            fontFamily="DM Sans, sans-serif"
          >
            {MONTHS[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

function Bars({ values, label, caption }: { values: number[]; label: string; caption: string }) {
  const max = Math.max(...values);
  return (
    <div style={{ flex: "1 1 240px", minWidth: 220 }}>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130 }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                height: round((v / max) * 110),
                borderRadius: 8,
                background: i === values.length - 1 ? VIOLET : "rgba(108,92,231,0.22)",
              }}
            />
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8 }}>{MONTHS[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>{caption}</div>
    </div>
  );
}

export default function GrowthCharts() {
  return (
    <div
      className="box"
      style={{ padding: 34, background: "#fff", color: INK, marginTop: 20 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 26,
        }}
      >
        <div>
          <div className="eyebrow">Six months on autopilot</div>
          <h3
            className="grotesk"
            style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: "-0.02em" }}
          >
            What compounding looks like
          </h3>
        </div>
        <div style={{ fontSize: 13.5, color: MUTED, maxWidth: 340, lineHeight: 1.55 }}>
          Every number below comes straight from your own Search Console and verified backlink
          checks — nothing is estimated.
        </div>
      </div>

      <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
        <AreaChart
          values={IMPRESSIONS}
          label="Search impressions"
          total="31,600"
          delta="+652%"
        />
        <AreaChart values={CLICKS} label="Organic clicks" total="1,520" delta="+1,166%" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 34,
          flexWrap: "wrap",
          marginTop: 34,
          paddingTop: 30,
          borderTop: `1px solid ${LINE}`,
        }}
      >
        <Bars
          values={BACKLINKS}
          label="Verified backlinks live"
          caption="Counted only after the directory page publicly links back."
        />
        <Bars
          values={PAGES}
          label="Pages published"
          caption="One quality page per day, written and shipped for you."
        />
      </div>
    </div>
  );
}
