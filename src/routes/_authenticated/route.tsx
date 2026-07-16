import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Growth overview", icon: "⌁" },
  { to: "/seo-audit", label: "SEO Growth", icon: "↗" },
  { to: "/accounts", label: "Connections", icon: "⛓" },
  { to: "/resources", label: "Growth resources", icon: "◇" },
  { to: "/settings", label: "Settings", icon: "⚙" },
] as const;

function DashboardLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const wsQuery = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });

  async function signOut() {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-[#fafafe] font-body text-[#111426]">
      <aside className="flex w-[278px] shrink-0 flex-col bg-[#0b1020] text-white">
        <div className="px-7 pb-5 pt-7">
          <div
            className="font-display text-[22px]"
            style={{ fontWeight: 800, letterSpacing: "-.05em" }}
          >
            Mention<span style={{ color: "#7c7cf0" }}>My</span>App
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[.13em] text-white/35">
            Organic growth workspace
          </div>
        </div>
        <WorkspaceSwitcher />
        <div className="px-6 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-white/35">
          Workspace
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "!bg-[#5b5bd633] !text-white" }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#a9b0cc] transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/35">
            Signed in as
          </div>
          <div className="truncate font-semibold text-white/80">{wsQuery.data?.user.email}</div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 text-[#9b9bf5] hover:underline"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
