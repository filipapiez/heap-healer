import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Image, LockKeyhole, PlugZap, Settings2, UserRound, Users } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { WatermarkSelector } from "@/components/WatermarkSelector";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — MentionMyApp" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const workspaceQuery = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });
  const data = workspaceQuery.data;

  return (
    <div className="mx-auto max-w-[1120px]">
      <header className="mb-7">
        <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[#85818b]">
          Manage your account, brand workspace, publishing connections and output.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="self-start rounded-2xl border border-[#e4e3e7] bg-white p-3">
          <SettingsGroup label="Personal">
            <SettingsItem icon={UserRound} label="Account" active />
            <SettingsItem icon={Users} label="Team & role" />
          </SettingsGroup>
          <SettingsGroup label="Business">
            <Link to="/accounts">
              <SettingsItem icon={PlugZap} label="Integrations" />
            </Link>
            <SettingsItem icon={Settings2} label="Brand workspace" />
          </SettingsGroup>
          <SettingsGroup label="Content">
            <Link to="/media">
              <SettingsItem icon={Image} label="Media & visuals" />
            </Link>
            <Link to="/resources">
              <SettingsItem icon={BookOpen} label="Resources" />
            </Link>
          </SettingsGroup>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[#e4e3e7] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#302d34]">Account</h2>
            <p className="mt-1 text-xs text-[#85818b]">
              Your signed-in identity and active brand workspace.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Name" value={data?.user.displayName || "Not set"} />
              <ReadOnlyField label="Email" value={data?.user.email || "—"} />
              <ReadOnlyField label="Workspace" value={data?.workspace.name || "—"} />
              <ReadOnlyField label="Workspace role" value={data?.role || "—"} capitalize />
            </div>
          </section>

          <section className="rounded-2xl border border-[#e4e3e7] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#302d34]">
                  Publishing connections
                </h2>
                <p className="mt-1 text-xs text-[#85818b]">
                  Connect social accounts, Search Console and website delivery destinations.
                </p>
              </div>
              <Link
                to="/accounts"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#18161b] px-4 text-xs font-semibold text-white"
              >
                <PlugZap className="h-3.5 w-3.5" /> Manage connections
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e4e3e7] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#302d34]">Brand visuals</h2>
            <p className="mt-1 text-xs text-[#85818b]">
              Control how your brand watermark is applied to generated media.
            </p>
            <div className="mt-5">
              <WatermarkSelector />
            </div>
          </section>

          <section className="rounded-2xl border border-[#e4e3e7] bg-white p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-[#6366e8]" />
              <h2 className="font-display text-lg font-semibold text-[#302d34]">Security</h2>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-[#77737e]">
              <li>Search Console uses read-only Google authorization.</li>
              <li>
                CMS credentials are encrypted server-side and are never returned to the browser.
              </li>
              <li>Media is served through short-lived signed URLs.</li>
              <li>Every publishing attempt is logged with sanitized metadata for auditing.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#96929b]">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof UserRound;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium ${active ? "bg-[#f5f5f7] text-[#302d34]" : "text-[#77737e] hover:bg-[#f8f8f9]"}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </span>
  );
}

function ReadOnlyField({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#77737e]">{label}</label>
      <div
        className={`mt-1 rounded-xl border border-[#e5e3e8] bg-[#fbfbfc] px-4 py-3 text-sm text-[#302d34] ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
