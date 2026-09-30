import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, RefreshCw, Wrench } from "lucide-react";
import { toast } from "sonner";
import { listSeoFixes, startSeoFix } from "@/lib/seo-fix.functions";
import { formatMinutes, planFix } from "@/lib/seo-fix";

export function FixList({
  categories,
  onReaudit,
  reauditing,
}: {
  categories: Array<{ name: string; issues?: string[] }>;
  onReaudit: () => void;
  reauditing: boolean;
}) {
  const queryClient = useQueryClient();
  const fixesQuery = useQuery({ queryKey: ["seo-fixes"], queryFn: () => listSeoFixes() });
  const [running, setRunning] = useState<Set<string>>(new Set());
  const byIssue = fixesQuery.data?.byIssue ?? {};
  const gh = fixesQuery.data?.githubConnected ?? false;
  const items = categories.flatMap((c) =>
    (c.issues ?? []).map((issue) => ({ issue, category: c.name, plan: planFix(issue) })),
  );
  const fixable = items.filter(
    (i) => i.plan.auto && !["saved", "verified", "fixing"].includes(byIssue[i.issue]?.status ?? ""),
  );
  const totalMin = fixable.reduce((s, i) => s + i.plan.minutes, 0);
  const anySaved = items.some((i) => byIssue[i.issue]?.status === "saved");

  async function fix(list: typeof items) {
    for (const item of list) {
      setRunning((s) => new Set(s).add(item.issue));
      try {
        const r = await startSeoFix({ data: { issue: item.issue, category: item.category } });
        if (r.status === "failed") toast.error(`Couldn't fix: ${item.issue}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Fix failed");
      } finally {
        setRunning((s) => {
          const n = new Set(s);
          n.delete(item.issue);
          return n;
        });
        await queryClient.invalidateQueries({ queryKey: ["seo-fixes"] });
      }
    }
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-[#27242b]">What to fix</h3>
        <div className="flex items-center gap-2">
          {anySaved && (
            <button
              type="button"
              onClick={onReaudit}
              disabled={reauditing}
              className="h-9 rounded-full border border-[#dcdae0] px-4 text-sm font-semibold text-[#302d34] disabled:opacity-45"
            >
              {reauditing ? "Checking…" : "Re-check my site"}
            </button>
          )}
          {gh && fixable.length > 0 && (
            <button
              type="button"
              disabled={running.size > 0}
              onClick={() => fix(fixable)}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#18161b] px-4 text-sm font-semibold text-white disabled:opacity-45"
            >
              <Wrench className="h-4 w-4" /> Fix all · {formatMinutes(totalMin)}
            </button>
          )}
        </div>
      </div>
      {!gh && (
        <p className="mt-2 text-xs text-[#85818b]">
          Connect your website's GitHub on the{" "}
          <Link to="/accounts" className="underline">Accounts</Link> page and we'll fix these for you.
        </p>
      )}
      {anySaved && (
        <p className="mt-2 text-xs text-[#85818b]">
          Fixes are saved into your site. Once your site updates (Lovable sites: click Publish → Update), press Re-check my site to confirm.
        </p>
      )}
      <ul className="mt-3 divide-y divide-[#efedf1] rounded-xl border border-[#ebe9ed]">
        {items.map(({ issue, category, plan }, i) => {
          const job = byIssue[issue];
          const busy = running.has(issue) || job?.status === "fixing";
          const status = busy ? "fixing" : job?.status;
          return (
            <li key={`${category}-${i}`} className="flex items-start gap-3 px-4 py-3 text-sm">
              {plan.auto && (status === "verified" || status === "saved") ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c4772b]" />
              )}
              <div className="min-w-0 flex-1">
                <div className={plan.auto && status === "verified" ? "text-[#85818b] line-through" : "text-[#302d34]"}>{issue}</div>
                <div className="mt-0.5 text-xs text-[#85818b]">
                  {category}
                  {plan.auto && !status && ` · ${formatMinutes(plan.minutes)}`}
                  {plan.auto && status === "saved" && " · Saved to your site, confirming once it updates"}
                  {plan.auto && status === "verified" && " · Confirmed on your live site"}
                </div>
                {!plan.auto && <div className="mt-1 text-xs text-[#6b6770]">Needs you: {plan.steps}</div>}
                {(status === "failed" || status === "didnt_take") && job?.error && (
                  <div className="mt-1 text-xs text-red-600">{job.error}</div>
                )}
              </div>
              <div className="shrink-0">
                {!plan.auto ? (
                  <span className="rounded-full bg-[#f3f2f5] px-2.5 py-1 text-xs font-medium text-[#6b6770]">Needs you</span>
                ) : status === "fixing" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#efefff] px-2.5 py-1 text-xs font-medium text-[#5b5bd6]">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Fixing…
                  </span>
                ) : status === "saved" || status === "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Check className="h-3 w-3" /> Fixed
                  </span>
                ) : gh ? (
                  <button
                    type="button"
                    disabled={running.size > 0}
                    onClick={() => fix([{ issue, category, plan }])}
                    className="h-8 rounded-full bg-[#18161b] px-3.5 text-xs font-semibold text-white disabled:opacity-45"
                  >
                    {status === "failed" || status === "didnt_take" ? "Try again" : "Fix"}
                  </button>
                ) : null}
                {status === "didnt_take" && <div className="mt-1 text-right text-[10px] text-red-600">Fix didn't take</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
