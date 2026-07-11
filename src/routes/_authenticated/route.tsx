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
  { to: "/dashboard", label: "Overview", icon: "◫" },
  { to: "/new-post", label: "New Post", icon: "＋" },
  { to: "/media", label: "Media Library", icon: "▤" },
  { to: "/accounts", label: "Connected Accounts", icon: "⛓" },
  { to: "/scheduled", label: "Scheduled", icon: "◷" },
  { to: "/engagement", label: "Engagement", icon: "♥" },
  { to: "/history", label: "History", icon: "≡" },
  { to: "/settings", label: "Settings", icon: "⚙" },
  { to: "/admin", label: "Admin", icon: "▲" },
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
    <div className="flex min-h-screen bg-[var(--color-mist-50)] font-body text-[var(--color-ink-900)]">
      <aside className="flex w-64 shrink-0 flex-col bg-[var(--color-ink-900)] text-white">
        <div className="px-5 pb-2 pt-6">
          <div className="font-display text-xl font-bold">MentionMyApp</div>
          <div className="text-[11px] text-white/40">Compose once. Publish everywhere.</div>
        </div>
        <WorkspaceSwitcher />
        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to}
              activeProps={{ className: "!bg-white/10 !text-white" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
              <span className="w-4 text-center opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-xs text-white/50">
          <div className="truncate">{wsQuery.data?.user.email}</div>
          <button onClick={signOut} disabled={signingOut}
            className="mt-2 w-full rounded-md px-2 py-1 text-left text-white/70 hover:bg-white/5 hover:text-white">
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}