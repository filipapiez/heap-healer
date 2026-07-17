import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Client = {
  id: string;
  workspace_id: string | null;
  name: string;
  website: string;
  baseline_date: string;
  baseline_clicks: number;
  baseline_impressions: number;
  baseline_indexed: number;
};
type Metric = { day: string; clicks: number; impressions: number; indexed_pages: number | null };
type Page = {
  id: string;
  url: string;
  keyword: string | null;
  indexed: boolean;
  impressions: number;
  clicks: number;
};
type Backlink = {
  id: string;
  source_domain: string;
  authority: number | null;
  anchor: string | null;
  status: string;
};
type GeoCheck = {
  id: string;
  engine: string;
  query: string;
  mentioned: boolean;
  cited_url: string | null;
};
type SemrushSnapshot = {
  day: string;
  domain: string;
  authority_score: number | null;
  total_backlinks: number | null;
  referring_domains: number | null;
  new_backlinks: number | null;
  lost_backlinks: number | null;
  organic_keywords: number | null;
  organic_traffic: number | null;
  synced_at: string | null;
  sync_status: string | null;
  sync_error: string | null;
};

const fmt = (value: number) => value.toLocaleString();
const change = (value: number, baseline: number) =>
  baseline ? Math.round(((value - baseline) / baseline) * 100) : value ? 100 : 0;

// Growth-report tables were added after the generated client types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seoDb = supabase as any;

export default function SeoDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [geo, setGeo] = useState<GeoCheck[]>([]);
  const [semrush, setSemrush] = useState<SemrushSnapshot | null>(null);
  const [semrushLoading, setSemrushLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError(userError?.message ?? "You must be signed in to view SEO Growth");
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("current_workspace_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profileError || !profile?.current_workspace_id) {
        setError(profileError?.message ?? "No active workspace was found");
        setLoading(false);
        return;
      }
      const { data, error: loadError } = await seoDb
        .from("seo_clients")
        .select("*")
        .eq("workspace_id", profile.current_workspace_id)
        .order("created_at");
      if (loadError) setError(loadError.message);
      const rows = (data ?? []) as Client[];
      setClients(rows);
      setClientId(rows[0]?.id ?? "");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    setSemrushLoading(true);
    void (async () => {
      const results = await Promise.all([
        seoDb.from("seo_metrics_daily").select("*").eq("client_id", clientId).order("day"),
        seoDb
          .from("seo_pages")
          .select("*")
          .eq("client_id", clientId)
          .order("published_at", { ascending: false }),
        seoDb
          .from("seo_backlinks")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
        seoDb
          .from("seo_geo_checks")
          .select("*")
          .eq("client_id", clientId)
          .order("checked_at", { ascending: false }),
        seoDb
          .from("seo_semrush_snapshots")
          .select(
            "day,domain,authority_score,total_backlinks,referring_domains,new_backlinks,lost_backlinks,organic_keywords,organic_traffic,synced_at,sync_status,sync_error",
          )
          .eq("client_id", clientId)
          .order("day", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const [metricRows, pageRows, backlinkRows, geoRows, semrushRow] = results;
      const loadError = results.find((result) => result.error)?.error;
      if (loadError) {
        setError(loadError.message);
        setSemrushLoading(false);
        return;
      }
      setMetrics((metricRows.data ?? []) as Metric[]);
      setPages((pageRows.data ?? []) as Page[]);
      setBacklinks((backlinkRows.data ?? []) as Backlink[]);
      setGeo((geoRows.data ?? []) as GeoCheck[]);
      setSemrush((semrushRow.data ?? null) as SemrushSnapshot | null);
      setSemrushLoading(false);
    })();
  }, [clientId]);

  const client = clients.find((item) => item.id === clientId);
  const latest = metrics.at(-1);
  const last28 = metrics.slice(-28);
  const indexedNow = latest?.indexed_pages ?? client?.baseline_indexed ?? 0;
  const clicksNow = last28.reduce((total, item) => total + item.clicks, 0);
  const impressionsNow = last28.reduce((total, item) => total + item.impressions, 0);
  const liveLinks = backlinks.filter((item) => item.status === "live").length;
  const mentions = geo.filter((item) => item.mentioned).length;
  const day = client
    ? Math.min(90, Math.max(1, Math.floor((Date.now() - +new Date(client.baseline_date)) / 864e5)))
    : 1;
  const chart = useMemo(() => {
    if (!metrics.length) return { impressions: "", clicks: "", area: "" };
    const width = 720;
    const height = 170;
    const line = (values: number[]) => {
      const max = Math.max(...values, 1);
      return values
        .map((value, index) => {
          const x = (index / Math.max(1, values.length - 1)) * width;
          const y = height - (value / max) * 155;
          return `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
    };
    const impressions = line(metrics.map((item) => item.impressions));
    return {
      impressions,
      clicks: line(metrics.map((item) => item.clicks)),
      area: `${impressions} L 720 170 L 0 170 Z`,
    };
  }, [metrics]);

  if (loading) return <State title="Loading SEO growth…" />;
  if (error) return <State title="SEO Growth could not load" detail={error} />;
  if (!client)
    return (
      <State
        title="Your SEO Growth report is ready to be connected"
        detail="Create the first client record after onboarding, then the daily Search Console sync will populate this dashboard automatically."
      />
    );

  return (
    <div className="mx-auto max-w-[1500px] text-[#171a2b]">
      <style>{`
        .label{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#6b7280}
        .seo-table th{padding:11px 16px;border-bottom:1px solid #e9eaf2;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6b7280}
        .seo-table td{padding:12px 16px;border-bottom:1px solid #e9eaf2;font-weight:650}
        .seo-table tbody tr:last-child td{border-bottom:0}.seo-table small{display:block;margin-top:3px;color:#6b7280;font-weight:400}
      `}</style>
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-.04em]">SEO Growth</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {client.website} · baseline {client.baseline_date}
          </p>
        </div>
        {clients.length > 1 && (
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="ml-auto rounded-xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm font-semibold"
          >
            {clients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </header>

      <Card className="mb-4 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="label">90-day guarantee · Day {day} of 90</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            Measured against day one
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#f2f2f8]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5]"
            style={{ width: `${(day / 90) * 100}%` }}
          />
        </div>
      </Card>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat
          label="Pages indexed"
          value={fmt(indexedNow)}
          delta={indexedNow - client.baseline_indexed}
          note={`day one: ${fmt(client.baseline_indexed)}`}
        />
        <Stat
          label="Pages published"
          value={fmt(pages.length)}
          delta={pages.length}
          note={`${pages.filter((item) => !item.indexed).length} awaiting index`}
        />
        <Stat
          label="Impressions · 28d"
          value={fmt(impressionsNow)}
          delta={change(impressionsNow, client.baseline_impressions)}
          note={`day one: ${fmt(client.baseline_impressions)}`}
          suffix="%"
        />
        <Stat
          label="Clicks · 28d"
          value={fmt(clicksNow)}
          delta={change(clicksNow, client.baseline_clicks)}
          note={`day one: ${fmt(client.baseline_clicks)}`}
          suffix="%"
        />
        <Stat
          label="Backlinks live"
          value={fmt(liveLinks)}
          delta={liveLinks}
          note={`${backlinks.length - liveLinks} pending`}
        />
        <Stat
          label="AI mentions"
          value={`${mentions}/${geo.length}`}
          delta={mentions}
          note="tested queries"
        />
      </section>

      <Card className="mb-4 p-6">
        <div className="mb-3 flex flex-wrap justify-between gap-2">
          <span className="label">Impressions & clicks since baseline</span>
          <span className="text-xs text-[#6b7280]">Indigo: impressions · Ink: clicks</span>
        </div>
        {metrics.length ? (
          <svg
            viewBox="0 0 720 170"
            className="w-full"
            role="img"
            aria-label="Search Console growth chart"
          >
            <defs>
              <linearGradient id="seoFill" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6366f1" stopOpacity=".2" />
                <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chart.area} fill="url(#seoFill)" />
            <path d={chart.impressions} fill="none" stroke="#6366f1" strokeWidth="3" />
            <path d={chart.clicks} fill="none" stroke="#171a2b" strokeWidth="2" opacity=".75" />
          </svg>
        ) : (
          <p className="py-16 text-center text-sm text-[#6b7280]">
            The chart will appear after the first daily Search Console sync.
          </p>
        )}
      </Card>

      <section className="mb-4 grid gap-4 lg:grid-cols-3">
        <InsightCard
          label="Semrush Authority Score"
          value={
            semrushLoading
              ? "…"
              : semrush?.sync_status === "success" && semrush.authority_score != null
                ? String(semrush.authority_score)
                : "—"
          }
          suffix={
            !semrushLoading && semrush?.sync_status === "success" && semrush.authority_score != null
              ? "/100"
              : ""
          }
          detail={
            semrushLoading
              ? "Loading latest Semrush snapshot…"
              : semrush?.sync_status === "failed"
                ? `Last Semrush sync failed: ${semrush.sync_error ?? "unknown error"}.`
                : semrush
                  ? `Semrush Authority Score for ${semrush.domain}.`
                  : "No Semrush snapshot yet — the daily sync will populate this."
          }
          action={
            semrushLoading
              ? "Loading…"
              : semrush?.synced_at
                ? `Last synced ${new Date(semrush.synced_at).toLocaleString()}`
                : "Sync pending"
          }
        />
        <InsightCard
          label="Content opportunities"
          value={String(pages.filter((item) => !item.indexed).length)}
          detail="Pages awaiting indexing, plus future keyword and competitor-gap recommendations."
          action="View pages"
        />
        <InsightCard
          label="GEO score"
          value={geo.length ? `${Math.round((mentions / geo.length) * 100)}` : "—"}
          suffix={geo.length ? "/100" : ""}
          detail="Share of tracked AI-search questions that currently mention your brand."
          action={`${geo.length - mentions} visibility gaps`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <TableCard
          title={`Pages (${pages.length})`}
          headers={["Page / keyword", "Impr.", "Clicks", "Indexing"]}
        >
          {pages.map((item) => (
            <tr key={item.id}>
              <td>
                <b>{item.url}</b>
                <small>{item.keyword}</small>
              </td>
              <td>{fmt(item.impressions)}</td>
              <td>{fmt(item.clicks)}</td>
              <td>
                <Badge live={item.indexed}>{item.indexed ? "indexed" : "pending"}</Badge>
              </td>
            </tr>
          ))}
        </TableCard>
        <TableCard title={`Backlinks (${backlinks.length})`} headers={["Source", "DR", "Status"]}>
          {backlinks.map((item) => (
            <tr key={item.id}>
              <td>
                <b>{item.source_domain}</b>
                <small>{item.anchor}</small>
              </td>
              <td>{item.authority ?? "—"}</td>
              <td>
                <Badge live={item.status === "live"}>{item.status}</Badge>
              </td>
            </tr>
          ))}
        </TableCard>
      </section>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex justify-between gap-3">
          <span className="label">AI search visibility (GEO)</span>
          <span className="text-xs text-[#6b7280]">
            {mentions} of {geo.length} queries mention the brand
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {geo.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#e9eaf2] p-4">
              <div className="flex justify-between text-sm font-bold">
                <span>{item.engine}</span>
                <span className={item.mentioned ? "text-green-600" : "text-[#6b7280]"}>
                  {item.mentioned ? "mentioned ✓" : "not yet"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#6b7280]">“{item.query}”</p>
              {item.cited_url && (
                <p className="mt-1 text-xs text-green-600">cites {item.cited_url}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="label">Semrush snapshot</span>
          <span className="text-xs text-[#6b7280]">
            {semrushLoading
              ? "Loading…"
              : semrush?.synced_at
                ? `${semrush.domain} · last synced ${new Date(semrush.synced_at).toLocaleString()}`
                : "No Semrush data yet for this client"}
          </span>
        </div>
        {semrushLoading ? (
          <p className="py-4 text-sm text-[#6b7280]">Loading latest Semrush snapshot…</p>
        ) : semrush?.sync_status === "failed" ? (
          <p className="py-4 text-sm text-red-600">
            Last Semrush sync failed: {semrush.sync_error ?? "unknown error"}. It will retry on the next daily run.
          </p>
        ) : semrush?.sync_status === "success" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Authority Score" value={semrush.authority_score} suffix="/100" />
            <MiniStat label="Total backlinks" value={semrush.total_backlinks} />
            <MiniStat label="Referring domains" value={semrush.referring_domains} />
            <MiniStat label="Organic keywords" value={semrush.organic_keywords} />
            <MiniStat label="Organic traffic · est." value={semrush.organic_traffic} suffix="/mo" />
            <MiniStat label="New backlinks · vs last snap" value={semrush.new_backlinks} />
            <MiniStat label="Lost backlinks · vs last snap" value={semrush.lost_backlinks} />
          </div>
        ) : (
          <p className="py-4 text-sm text-[#6b7280]">
            The daily Semrush sync will populate Authority Score, backlinks, referring domains, and organic keywords.
          </p>
        )}
      </Card>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#e9eaf2] bg-white shadow-[0_8px_24px_rgba(23,26,43,.05)] ${className}`}
    >
      {children}
    </div>
  );
}
function MiniStat({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number | null;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e9eaf2] p-4">
      <div className="label">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-[-.03em]">
        {value == null ? "—" : fmt(value)}
        {value != null && suffix ? (
          <span className="ml-1 text-xs font-semibold text-[#8a8f9d]">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
function Stat({
  label,
  value,
  delta,
  note,
  suffix = "",
}: {
  label: string;
  value: string;
  delta: number;
  note: string;
  suffix?: string;
}) {
  return (
    <Card className="p-4">
      <div className="label">{label}</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <strong className="text-3xl tracking-[-.04em]">{value}</strong>
        {delta > 0 && (
          <span className="text-xs font-bold text-green-600">
            ▲ +{delta}
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-[#6b7280]">{note}</div>
    </Card>
  );
}
function Badge({ children, live }: { children: React.ReactNode; live: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${live ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
    >
      {children}
    </span>
  );
}
function InsightCard({
  label,
  value,
  suffix = "",
  detail,
  action,
}: {
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  action: string;
}) {
  return (
    <Card className="p-5">
      <div className="label">{label}</div>
      <div className="mt-3">
        <strong className="text-4xl tracking-[-.05em]">{value}</strong>
        <span className="ml-1 text-sm text-[#8a8f9d]">{suffix}</span>
      </div>
      <p className="mt-3 min-h-10 text-xs leading-5 text-[#6b7280]">{detail}</p>
      <div className="mt-4 border-t border-[#ececf2] pt-3 text-xs font-bold text-[#6366f1]">
        {action} →
      </div>
    </Card>
  );
}
function TableCard({
  title,
  headers,
  children,
}: {
  title: string;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="label p-5 pb-2">{title}</div>
      <div className="overflow-x-auto">
        <table className="seo-table w-full text-left text-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}
function State({ title, detail }: { title: string; detail?: string }) {
  return (
    <Card className="mx-auto max-w-2xl p-12 text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {detail && <p className="mt-3 text-sm leading-6 text-[#6b7280]">{detail}</p>}
    </Card>
  );
}
