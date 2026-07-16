import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#5b5bd6";
const INK = "#0b1020";
const MUTED = "#68708c";
const PANEL = "#f7f8fc";
const LINE = "#e4e7f2";
const POS = "#14966f";

type Report = {
  client: {
    name: string;
    website: string;
    baseline_date: string;
    baseline_clicks: number;
    baseline_impressions: number;
    baseline_indexed: number;
  };
  metrics: { day: string; clicks: number; impressions: number; indexed_pages: number | null }[];
  backlinks: {
    source_domain: string;
    authority: number | null;
    anchor: string | null;
    status: string;
    created_at: string;
  }[];
  pages: {
    url: string;
    keyword: string | null;
    indexed: boolean;
    impressions: number;
    clicks: number;
    published_at: string;
  }[];
  geo: { engine: string; query: string; mentioned: boolean; cited_url: string | null }[];
};

const fmt = (value: number) => value.toLocaleString();
const change = (current: number, baseline: number) =>
  baseline ? Math.round(((current - baseline) / baseline) * 100) : current ? 100 : 0;

export default function GrowthReport({ token }: { token: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void (async () => {
      // get_growth_report RPC is not in the generated types.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("get_growth_report", { token });
      if (error || !data?.client) setMissing(true);
      else setReport(data as Report);
      setLoading(false);
    })();
  }, [token]);

  const chart = useMemo(() => {
    if (!report?.metrics.length) return "";
    const values = report.metrics.map((metric) => metric.impressions);
    const max = Math.max(...values, 1);
    return values
      .map(
        (value, index) =>
          `${index ? "L" : "M"} ${(index / Math.max(1, values.length - 1)) * 760} ${190 - (value / max) * 175}`,
      )
      .join(" ");
  }, [report]);

  if (loading) return <ReportState title="Loading your growth report…" />;
  if (missing || !report) return <ReportState title="This report link is unavailable." />;

  const latest = report.metrics.at(-1);
  const indexed = latest?.indexed_pages ?? report.client.baseline_indexed;
  const liveLinks = report.backlinks.filter((link) => link.status === "live").length;
  const mentions = report.geo.filter((item) => item.mentioned).length;
  const day = Math.min(
    90,
    Math.max(1, Math.floor((Date.now() - +new Date(report.client.baseline_date)) / 864e5)),
  );

  return (
    <main className="growth-report">
      <style>{`
        .growth-report{min-height:100vh;background:${PANEL};color:${INK};font-family:Inter,system-ui,sans-serif;padding:38px 18px 70px}.gr-wrap{max-width:1080px;margin:auto;display:grid;gap:16px}.gr-header{display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap}.gr-brand{font-weight:850;color:${ACCENT};letter-spacing:.08em;font-size:12px;text-transform:uppercase}.gr-header h1{font-size:34px;margin:6px 0 0;letter-spacing:-.04em}.gr-muted{color:${MUTED};font-size:13px}.gr-card{background:#fff;border:1px solid ${LINE};border-radius:20px;box-shadow:0 12px 34px #222b5510}.gr-progress{padding:22px}.gr-progress-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:12px}.gr-kicker{font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:${MUTED}}.gr-track{height:10px;background:${PANEL};border-radius:99px;overflow:hidden}.gr-track span{display:block;height:100%;background:linear-gradient(90deg,${ACCENT},#8b7cf6);border-radius:inherit}.gr-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.gr-stat{padding:20px}.gr-stat strong{display:block;font-size:28px;margin:7px 0 3px}.gr-positive{color:${POS};font-size:12px;font-weight:750}.gr-chart{padding:22px}.gr-chart svg{width:100%;height:auto;margin-top:12px}.gr-tables{display:grid;grid-template-columns:1fr 1fr;gap:14px}.gr-table-card{overflow:hidden}.gr-table-title{padding:18px 18px 8px}.gr-table{width:100%;border-collapse:collapse;font-size:13px}.gr-table th,.gr-table td{text-align:left;padding:11px 18px;border-bottom:1px solid ${LINE}}.gr-table th{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:${MUTED}}.gr-badge{display:inline-block;border-radius:99px;padding:4px 9px;background:#e8f8f1;color:${POS};font-size:11px;font-weight:750}.gr-empty{padding:24px 18px;color:${MUTED};font-size:13px}.gr-footer{text-align:center;color:${MUTED};font-size:11px;padding-top:6px}@media(max-width:760px){.gr-stats{grid-template-columns:1fr 1fr}.gr-tables{grid-template-columns:1fr}.growth-report{padding:24px 12px 50px}}
      `}</style>
      <div className="gr-wrap">
        <header className="gr-header">
          <div>
            <div className="gr-brand">MentionMyApp · Growth report</div>
            <h1>{report.client.name}</h1>
          </div>
          <div className="gr-muted">
            {report.client.website}
            <br />
            Baseline: {report.client.baseline_date}
          </div>
        </header>
        <section className="gr-card gr-progress">
          <div className="gr-progress-head">
            <span className="gr-kicker">90-day guarantee progress</span>
            <strong>Day {day} of 90</strong>
          </div>
          <div className="gr-track">
            <span style={{ width: `${(day / 90) * 100}%` }} />
          </div>
        </section>
        <section className="gr-stats">
          <Stat
            label="Indexed pages"
            value={fmt(indexed)}
            delta={`+${indexed - report.client.baseline_indexed} from baseline`}
          />
          <Stat
            label="Impressions"
            value={fmt(latest?.impressions ?? 0)}
            delta={`${change(latest?.impressions ?? 0, report.client.baseline_impressions)}% vs baseline`}
          />
          <Stat
            label="Organic clicks"
            value={fmt(latest?.clicks ?? 0)}
            delta={`${change(latest?.clicks ?? 0, report.client.baseline_clicks)}% vs baseline`}
          />
          <Stat
            label="Backlinks built"
            value={fmt(liveLinks)}
            delta={`${report.backlinks.length - liveLinks} pending or lost`}
          />
        </section>
        <section className="gr-card gr-chart">
          <div className="gr-kicker">Organic visibility since baseline</div>
          {chart ? (
            <svg viewBox="0 0 760 200" role="img" aria-label="Impressions growth chart">
              <defs>
                <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor={ACCENT} stopOpacity=".25" />
                  <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${chart} L 760 200 L 0 200 Z`} fill="url(#growth-fill)" />
              <path d={chart} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <div className="gr-empty">
              Growth data will appear after the first Search Console sync.
            </div>
          )}
        </section>
        <section className="gr-tables">
          <ReportTable
            title={`Backlinks built (${report.backlinks.length})`}
            headers={["Source", "Authority", "Status"]}
            empty="Backlinks will appear here as they are verified."
          >
            {report.backlinks.map((item) => (
              <tr key={`${item.source_domain}-${item.created_at}`}>
                <td>
                  <strong>{item.source_domain}</strong>
                  <div className="gr-muted">{item.anchor}</div>
                </td>
                <td>{item.authority ?? "—"}</td>
                <td>
                  <span className="gr-badge">{item.status}</span>
                </td>
              </tr>
            ))}
          </ReportTable>
          <ReportTable
            title={`Pages published (${report.pages.length})`}
            headers={["Page", "Impressions", "Indexing"]}
            empty="New SEO pages will appear here after publishing."
          >
            {report.pages.map((item) => (
              <tr key={item.url}>
                <td>
                  <strong>{item.url}</strong>
                  <div className="gr-muted">{item.keyword}</div>
                </td>
                <td>{fmt(item.impressions)}</td>
                <td>
                  <span className="gr-badge">{item.indexed ? "Indexed" : "Pending"}</span>
                </td>
              </tr>
            ))}
          </ReportTable>
        </section>
        <section className="gr-card gr-progress">
          <div className="gr-progress-head">
            <span className="gr-kicker">AI search visibility</span>
            <strong>
              {mentions}/{report.geo.length} queries mention your brand
            </strong>
          </div>
          <div className="gr-muted">
            Tracked across ChatGPT, Perplexity, Google AI Overviews, and Gemini.
          </div>
        </section>
        <footer className="gr-footer">
          Metrics sync from Google Search Console and verified campaign records.
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="gr-card gr-stat">
      <span className="gr-kicker">{label}</span>
      <strong>{value}</strong>
      <span className="gr-positive">{delta}</span>
    </div>
  );
}
function ReportTable({
  title,
  headers,
  empty,
  children,
}: {
  title: string;
  headers: string[];
  empty: string;
  children: React.ReactNode;
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="gr-card gr-table-card">
      <div className="gr-table-title gr-kicker">{title}</div>
      {hasRows ? (
        <table className="gr-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      ) : (
        <div className="gr-empty">{empty}</div>
      )}
    </div>
  );
}
function ReportState({ title }: { title: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "Inter, system-ui",
        color: INK,
        background: PANEL,
      }}
    >
      <h1>{title}</h1>
    </main>
  );
}
