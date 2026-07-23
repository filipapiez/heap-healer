import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { toast } from "sonner";
import { Link2, Radar } from "lucide-react";
import {
  getDirectoryProfile,
  listBacklinkQueue,
  saveDirectoryProfile,
  seedDirectories,
} from "@/lib/directories.functions";
import { LogoUploader } from "@/components/LogoUploader";

export const Route = createFileRoute("/_authenticated/backlinks")({
  head: () => ({ meta: [{ title: "Backlink builder — MentionMyApp" }] }),
  component: BacklinksPage,
});

type Submission = {
  id: string;
  status: string;
  scheduled_for: string;
  submitted_at: string | null;
  live_url: string | null;
  notes: string | null;
  auto_result: unknown;
  directory: {
    id: string;
    name: string;
    slug: string;
    homepage_url: string;
    submit_url: string;
    category: string;
    tier: number;
    submission_method: string;
    domain_authority: number | null;
    notes: string | null;
  };
};

type SubmissionStatus = "queued" | "submitted" | "live" | "rejected" | "skipped" | "pending_action";

type DirectoryProfile = {
  product_name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  category?: string | null;
  contact_email?: string | null;
  pricing_model?: string | null;
  founder_name?: string | null;
};

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  queued: { label: "Submitting…", className: "bg-slate-100 text-slate-700" },
  pending_action: { label: "Submitting…", className: "bg-slate-100 text-slate-700" },
  auto_submitted: { label: "Submitted", className: "bg-indigo-100 text-indigo-800" },
  submitted: { label: "Submitted", className: "bg-indigo-100 text-indigo-800" },
  live: { label: "Live", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  skipped: { label: "Skipped", className: "bg-slate-200 text-slate-600" },
};

function BacklinksPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"queue" | "history" | "profile">("queue");

  const queueQuery = useQuery({ queryKey: ["backlink-queue"], queryFn: () => listBacklinkQueue() });

  const seedMut = useMutation({
    mutationFn: () => seedDirectories(),
    onSuccess: (r) => {
      toast.success(`Seeded ${r.seeded} directories`);
      qc.invalidateQueries({ queryKey: ["backlink-queue"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (queueQuery.isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (queueQuery.error)
    return <div className="p-8 text-red-600">{(queueQuery.error as Error).message}</div>;

  const data = queueQuery.data!;
  const submissions = (data.submissions ?? []) as Submission[];
  const active = submissions.filter((s) =>
    ["queued", "pending_action", "auto_submitted", "submitted"].includes(s.status),
  );
  const history = submissions.filter((s) => ["live", "rejected", "skipped"].includes(s.status));

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dde4f3] bg-white px-4 py-3 text-xs text-[#71809b]">
        <span className="flex items-center gap-2">
          <Radar className="h-3.5 w-3.5 text-[#6366e8]" /> Live status requires a reachable
          placement page that links to your website
        </span>
        <span className="rounded-full border border-[#e5e4e8] px-3 py-1.5 font-semibold text-[#57535d]">
          Backlink workflow · Assisted
        </span>
      </div>

      <header className="mb-6 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#efefff] text-[#5b5bd6]">
          <Link2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
            Backlinks
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#85818b]">
            Build authority with a truthful directory-placement queue. MentionMyApp schedules 15
            relevant directories each week, assists submission, and only counts a backlink after it
            is verified live.
          </p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="This queue" value={active.length} />
        <Stat label="Auto-submitted" value={data.counts.auto_submitted ?? 0} />
        <Stat label="Live backlinks" value={data.counts.live ?? 0} />
        <Stat
          label="Submitted (total)"
          value={
            (data.counts.submitted ?? 0) +
            (data.counts.auto_submitted ?? 0) +
            (data.counts.live ?? 0)
          }
        />
        <Stat label="Remaining in catalog" value={data.remaining} />
      </div>

      {data.totalCatalog === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Directory catalog is empty.{" "}
          <button
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
            className="font-semibold underline"
          >
            {seedMut.isPending ? "Seeding…" : "Seed the catalog now"}
          </button>{" "}
          to load ~95 directories.
        </div>
      )}

      {data.remaining < 30 && data.totalCatalog > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          Catalog runway is getting low ({data.remaining} unsubmitted). We're adding a fresh batch
          soon.
        </div>
      )}

      {!data.profile?.product_name && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <strong>Fill your submission profile first.</strong> Auto-submit and one-click paste both
          need it.{" "}
          <button onClick={() => setTab("profile")} className="font-semibold underline">
            Open profile
          </button>
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl border border-[#e4e3e7] bg-white p-1 text-sm font-semibold">
        <TabBtn on={tab === "queue"} onClick={() => setTab("queue")}>
          This queue ({active.length})
        </TabBtn>
        <TabBtn on={tab === "history"} onClick={() => setTab("history")}>
          History ({history.length})
        </TabBtn>
        <TabBtn on={tab === "profile"} onClick={() => setTab("profile")}>
          Profile
        </TabBtn>
      </div>

      {tab === "queue" && <QueueList rows={active} profile={data.profile} />}
      {tab === "history" && <HistoryTable rows={history} />}
      {tab === "profile" && <ProfileForm initial={data.profile} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e4e3e7] bg-white p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#77737e]">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-[#302d34]">{value}</div>
    </div>
  );
}

function TabBtn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 rounded-lg px-3 py-2 transition-colors " +
        (on ? "bg-[#f5f5f7] text-[#252229]" : "text-[#77737e] hover:text-[#302d34]")
      }
    >
      {children}
    </button>
  );
}

function QueueList({ rows, profile }: { rows: Submission[]; profile: DirectoryProfile | null }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nothing queued yet. Weekly cron runs Monday 9am UTC. Or the catalog needs seeding above.
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((s) => (
        <SubmissionCard key={s.id} sub={s} profile={profile} />
      ))}
    </div>
  );
}

function SubmissionCard({ sub, profile }: { sub: Submission; profile: DirectoryProfile | null }) {
  const qc = useQueryClient();
  const style = STATUS_STYLE[sub.status] ?? STATUS_STYLE.queued;
  const [liveUrl, setLiveUrl] = useState(sub.live_url ?? "");

  const update = useMutation({
    mutationFn: (vars: { status: SubmissionStatus; live_url?: string }) =>
      updateSubmission({ data: { submissionId: sub.id, ...vars } }),
    onSuccess: (result) => {
      toast.success(result.verified ? "Backlink verified live" : "Submission updated");
      qc.invalidateQueries({ queryKey: ["backlink-queue"] });
      qc.invalidateQueries({ queryKey: ["growth-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const retry = useMutation({
    mutationFn: () => triggerAutoSubmit({ data: { submissionId: sub.id } }),
    onSuccess: (r) => {
      if (r.ok) toast.success("Auto-submitted");
      else toast.info(r.error ?? "Needs manual submission");
      qc.invalidateQueries({ queryKey: ["backlink-queue"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAndCopy() {
    const parts = [
      profile?.product_name && `Name: ${profile.product_name}`,
      profile?.tagline && `Tagline: ${profile.tagline}`,
      profile?.website_url && `URL: ${profile.website_url}`,
      profile?.short_description && `Short: ${profile.short_description}`,
      profile?.long_description && `Long: ${profile.long_description}`,
      profile?.category && `Category: ${profile.category}`,
      profile?.contact_email && `Email: ${profile.contact_email}`,
      profile?.pricing_model && `Pricing: ${profile.pricing_model}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(parts).catch(() => {});
    window.open(sub.directory.submit_url, "_blank", "noopener");
    toast.success("Opened directory + copied your profile to clipboard");
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a
            href={sub.directory.homepage_url}
            target="_blank"
            rel="noopener"
            className="font-display text-base font-bold hover:text-[#5b5bd6]"
          >
            {sub.directory.name}
          </a>
          <div className="mt-0.5 text-xs text-slate-500">
            Tier {sub.directory.tier} · DA {sub.directory.domain_authority ?? "?"} ·{" "}
            {sub.directory.category} · {sub.directory.submission_method}
          </div>
        </div>
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + style.className}>
          {style.label}
        </span>
      </div>
      {sub.directory.notes && (
        <div className="mt-2 text-xs text-slate-500">{sub.directory.notes}</div>
      )}
      {sub.notes && (
        <div className="mt-2 text-xs text-slate-600">
          <strong>Note:</strong> {sub.notes}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={openAndCopy}
          className="rounded-lg bg-[#0b1020] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2040]"
        >
          Open & submit
        </button>
        <button
          onClick={() => update.mutate({ status: "submitted", live_url: liveUrl || undefined })}
          disabled={update.isPending}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Mark submitted
        </button>
        <button
          onClick={() => update.mutate({ status: "live", live_url: liveUrl || undefined })}
          disabled={update.isPending || !(liveUrl || sub.live_url)}
          className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {update.isPending ? "Checking…" : "Verify live"}
        </button>
        {(sub.directory.submission_method === "api" ||
          sub.directory.submission_method === "form") && (
          <button
            onClick={() => retry.mutate()}
            disabled={retry.isPending}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {retry.isPending ? "Trying…" : "Try auto-submit"}
          </button>
        )}
        <button
          onClick={() => update.mutate({ status: "skipped" })}
          className="ml-auto text-xs text-slate-400 hover:text-slate-700"
        >
          Skip
        </button>
      </div>
      <input
        value={liveUrl}
        onChange={(e) => setLiveUrl(e.target.value)}
        placeholder="Paste the public listing URL to verify it live"
        className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
      />
    </div>
  );
}

function HistoryTable({ rows }: { rows: Submission[] }) {
  if (rows.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nothing submitted yet.
      </div>
    );
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-2">Directory</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Submitted</th>
            <th className="px-3 py-2">Live URL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-3 py-2 font-semibold">{s.directory.name}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                    (STATUS_STYLE[s.status]?.className ?? "")
                  }
                >
                  {STATUS_STYLE[s.status]?.label ?? s.status}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-600">{s.submitted_at?.slice(0, 10) ?? "—"}</td>
              <td className="px-3 py-2">
                {s.live_url ? (
                  <a
                    href={s.live_url}
                    className="text-[#5b5bd6] hover:underline"
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileForm({ initial }: { initial: DirectoryProfile | null }) {
  const qc = useQueryClient();
  const queueData = qc.getQueryData<{ workspaceId?: string }>(["backlink-queue"]);
  const workspaceId: string | undefined = queueData?.workspaceId;
  const [form, setForm] = useState({
    product_name: initial?.product_name ?? "",
    tagline: initial?.tagline ?? "",
    short_description: initial?.short_description ?? "",
    long_description: initial?.long_description ?? "",
    website_url: initial?.website_url ?? "",
    logo_url: initial?.logo_url ?? "",
    category: initial?.category ?? "",
    contact_email: initial?.contact_email ?? "",
    pricing_model: initial?.pricing_model ?? "",
    founder_name: initial?.founder_name ?? "",
  });
  const save = useMutation({
    mutationFn: () =>
      saveDirectoryProfile({
        data: {
          ...form,
          website_url: form.website_url || null,
          logo_url: form.logo_url || null,
          contact_email: form.contact_email || null,
        },
      }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["backlink-queue"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2"
    >
      <Field label="Product name" value={form.product_name} onChange={set("product_name")} />
      <Field
        label="Website URL"
        value={form.website_url}
        onChange={set("website_url")}
        placeholder="https://…"
      />
      <Field label="Tagline (≤120 chars)" value={form.tagline} onChange={set("tagline")} />
      <Field
        label="Category"
        value={form.category}
        onChange={set("category")}
        placeholder="AI, SaaS, marketing…"
      />
      <Field
        label="Contact email"
        value={form.contact_email}
        onChange={set("contact_email")}
        type="email"
      />
      <div>
        {workspaceId ? (
          <LogoUploader
            workspaceId={workspaceId}
            value={form.logo_url}
            onChange={(url) => setForm((f) => ({ ...f, logo_url: url }))}
          />
        ) : (
          <Field
            label="Logo URL"
            value={form.logo_url}
            onChange={set("logo_url")}
            placeholder="https://…"
          />
        )}
      </div>
      <Field
        label="Pricing model"
        value={form.pricing_model}
        onChange={set("pricing_model")}
        placeholder="Free, Freemium, Paid"
      />
      <div className="md:col-span-2">
        <Label>Short description (≤280 chars)</Label>
        <textarea
          className={inputClass + " min-h-[72px]"}
          value={form.short_description}
          onChange={set("short_description")}
        />
      </div>
      <div className="md:col-span-2">
        <Label>Long description</Label>
        <textarea
          className={inputClass + " min-h-[140px]"}
          value={form.long_description}
          onChange={set("long_description")}
        />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-[#5b5bd6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a4ac5]"
        >
          {save.isPending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#5b5bd6] focus:outline-none";

function Field({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input className={inputClass} {...rest} />
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </label>
  );
}
