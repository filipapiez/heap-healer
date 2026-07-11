import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { listWorkspaces, setActiveWorkspace, createWorkspace } from "@/lib/workspace.functions";

/**
 * Brand switcher. Each workspace = one brand with its own connected accounts,
 * media, posts, and engagement. Lives at the top of the sidebar.
 */
export default function WorkspaceSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => listWorkspaces(),
  });

  const setActive = useMutation({
    mutationFn: (workspaceId: string) => setActiveWorkspace({ data: { workspaceId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.invalidate();
      setOpen(false);
    },
  });

  const create = useMutation({
    mutationFn: (name: string) => createWorkspace({ data: { name } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.invalidate();
      setCreating(false);
      setNewName("");
      setOpen(false);
    },
  });

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const workspaces = data?.workspaces ?? [];
  const active = workspaces.find((w) => w.active);

  return (
    <div ref={ref} className="relative px-3 pb-2">
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-sm text-white hover:bg-white/10">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{active?.name ?? "My workspace"}</span>
          <span className="block text-[11px] text-white/40">Brand workspace</span>
        </span>
        <span className="ml-2 text-white/40">⇵</span>
      </button>

      {open && (
        <div className="absolute left-3 right-3 z-40 mt-1 rounded-lg border border-[var(--color-mist-200)] bg-white p-1 text-[var(--color-ink-900)] shadow-lg">
          {workspaces.map((w) => (
            <button key={w.id} onClick={() => setActive.mutate(w.id)} disabled={setActive.isPending}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--color-mist-50)] ${w.active ? "font-semibold text-[var(--color-signal-600)]" : ""}`}>
              <span className="truncate">{w.name}</span>
              {w.active && <span>✓</span>}
            </button>
          ))}
          <div className="my-1 border-t border-[var(--color-mist-200)]" />
          {creating ? (
            <div className="p-2">
              <input autoFocus className="input text-sm" placeholder="e.g. RoadEvidence" value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newName.trim() && create.mutate(newName.trim())} />
              <div className="mt-2 flex justify-end gap-2">
                <button className="btn-ghost text-xs" onClick={() => setCreating(false)}>Cancel</button>
                <button className="btn-primary text-xs" onClick={() => newName.trim() && create.mutate(newName.trim())}
                  disabled={create.isPending || !newName.trim()}>
                  {create.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--color-signal-600)] hover:bg-[var(--color-mist-50)]">
              + New brand workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}