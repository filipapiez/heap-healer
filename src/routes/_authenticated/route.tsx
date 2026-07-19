import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Image,
  LayoutDashboard,
  Link2,
  Menu,
  MessageCircleMore,
  PlugZap,
  ScanSearch,
  Settings,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { getWebsiteConnectionStatus } from "@/lib/website-connections.functions";
import { summarizeWebsiteConnections, WEBSITE_CONNECTION_QUERY_KEY } from "@/connection-status";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useState, type ComponentType } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: DashboardLayout,
});

type NavItem = {
  to:
    | "/dashboard"
    | "/analytics"
    | "/scheduled"
    | "/backlinks"
    | "/seo-audit"
    | "/accounts"
    | "/media"
    | "/engagement"
    | "/settings"
    | "/resources";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const PRIMARY_NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/scheduled", label: "Content plan", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/backlinks", label: "Backlinks", icon: Link2 },
  { to: "/seo-audit", label: "Technical audit", icon: ScanSearch },
  { to: "/engagement", label: "Reddit", icon: MessageCircleMore },
];

const OTHER_NAV: NavItem[] = [
  { to: "/accounts", label: "Connections", icon: PlugZap },
  { to: "/media", label: "Content assets", icon: Image },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/resources", label: "Growth resources", icon: BookOpen },
];

function DashboardLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const wsQuery = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });
  const connectionQuery = useQuery({
    queryKey: WEBSITE_CONNECTION_QUERY_KEY,
    queryFn: () => getWebsiteConnectionStatus(),
  });

  async function signOut() {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const user = wsQuery.data?.user;
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const connectionSummary = summarizeWebsiteConnections(connectionQuery.data);
  const deliveryConnected = connectionSummary.publishingConnected;
  const publishingReady = connectionSummary.publishingReady;
  const connectionStatusUnavailable = connectionQuery.isError && !connectionQuery.data;

  const sidebar = (
    <>
      <div className="flex h-[70px] items-center px-8">
        <Link
          to="/dashboard"
          className="font-display text-[21px] font-extrabold tracking-[-.055em] text-[#161616]"
          onClick={() => setMobileOpen(false)}
        >
          Mention<span className="text-[#6366e8]">My</span>App
        </Link>
      </div>
      <div className="border-y border-[#f0eff2] px-8 py-5 lg:hidden">
        <div className="font-display text-lg font-semibold text-[#1f1c24]">{displayName}</div>
        <div className="mt-1 truncate text-xs text-[#85818b]">{user?.email}</div>
        <div className="mt-4">
          <WorkspaceSwitcher />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-8 pb-5 pt-5">
        <NavGroup items={PRIMARY_NAV} onNavigate={() => setMobileOpen(false)} />
        <div className="mb-2 mt-8 px-3 font-display text-[11px] font-semibold uppercase tracking-[.08em] text-[#777681]">
          Other
        </div>
        <NavGroup items={OTHER_NAV} onNavigate={() => setMobileOpen(false)} />
      </nav>
      <div className="px-8 pb-8">
        <Link
          to="/accounts"
          onClick={() => setMobileOpen(false)}
          className="block rounded-2xl border border-[#e6e6e9] bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,.08)] transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${connectionStatusUnavailable ? "bg-amber-400" : deliveryConnected ? "bg-[#36b37e]" : "bg-[#b9b7ff]"}`}
            />
            <strong className="font-display text-[15px] font-semibold text-[#1f1d25]">
              {connectionStatusUnavailable
                ? "Status unavailable"
                : publishingReady
                  ? "Publishing ready"
                  : deliveryConnected
                    ? "Website connected"
                    : "Setup pending"}
            </strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#777681]">
            {connectionStatusUnavailable
              ? "MentionMyApp could not verify your website connection. Open Connections to retry."
              : deliveryConnected
                ? publishingReady
                  ? "MentionMyApp can publish approved content to your connected website."
                  : "Your website connection is approved. Choose a delivery repository when ready."
                : "Connect your website to publish approved content automatically."}
          </p>
          <span className="mt-3 inline-flex text-xs font-semibold text-[#5b5bd6]">
            {connectionStatusUnavailable
              ? "Check connection →"
              : deliveryConnected
                ? "Manage connection →"
                : "Finish setup →"}
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-body text-[#17151b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-[#f0eff2] bg-white shadow-[0_1px_2px_rgba(0,0,0,.05)] lg:flex">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/25"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-[272px] flex-col bg-white shadow-2xl">
            <button
              className="absolute right-4 top-5 rounded-full p-2 text-[#64616c] hover:bg-[#f6f6f8]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-h-screen bg-[#f7f8fa] lg:ml-[272px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#f0eff2] bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,.05)] sm:px-6 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#57545f] hover:bg-[#f6f6f8] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <WorkspaceSwitcher />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={signOut}
              disabled={signingOut}
              title={
                signingOut
                  ? "Signing out…"
                  : `Signed in as ${user?.email ?? displayName}. Click to sign out.`
              }
              className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ecebfd] text-xs font-bold text-[#5558d8] transition hover:ring-2 hover:ring-[#d8d7ff]"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials || "MA"
              )}
            </button>
          </div>
        </header>
        <main className="px-4 pb-10 pt-7 sm:px-6 lg:px-12 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavGroup({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeProps={{ className: "!bg-[#f5f5f7] !font-semibold !text-[#17151b]" }}
            className="flex h-[42px] items-center gap-3 rounded-lg px-3 text-sm text-[#403d46] transition-colors hover:bg-[#f8f8f9] hover:text-[#17151b]"
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
