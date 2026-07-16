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
  { to: "/seo-audit", label: "SEO audit", icon: "✓" },
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
    <div className="flex min-h-screen bg-[#f8f8fa] font-body text-[#111426]">
      <aside className="flex w-[278px] shrink-0 flex-col border-r border-[#e5e6eb] bg-white">
        <div className="px-7 pb-5 pt-7">
          <div
            className="font-display text-[22px]"
            style={{ fontWeight: 800, letterSpacing: "-.05em" }}
          >
            MentionMy<span style={{ color: "#6366F1" }}>App</span>
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[.13em] text-[#969aa8]">
            Organic growth workspace
          </div>
        </div>
        <WorkspaceSwitcher />
        <div className="px-6 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#a2a6b3]">
          Workspace
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "!bg-[#efefff] !text-[#4f46e5]" }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#666c7d] transition-colors hover:bg-[#f5f5f8] hover:text-[#171a2b]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#e4e5eb] bg-white text-xs">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="m-4 rounded-2xl border border-[#e4e5eb] bg-[#fafafd] p-4 text-xs text-[#737889]">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#9a9eaa]">
            Signed in as
          </div>
          <div className="truncate font-semibold text-[#262a39]">{wsQuery.data?.user.email}</div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 text-[#6366f1] hover:underline"
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
