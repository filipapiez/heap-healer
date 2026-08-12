import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Globe2, Plus } from "lucide-react";
import { listWorkspaces, setActiveWorkspace, createWorkspace } from "@/lib/workspace.functions";

function prettyDomain(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** The active website/domain selector shown in the authenticated top bar. */
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
      // A brand-new website has nothing connected yet — send them to setup.
      router.navigate({ to: "/accounts", search: { focus: "setup" } });
    },
  });

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const workspaces = data?.workspaces ?? [];
  const active = workspaces.find((workspace) => workspace.active);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 max-w-[240px] items-center gap-2 rounded-full bg-[#f7f8fa] px-4 text-left text-sm text-[#211f25] transition hover:bg-[#f0f1f4] sm:min-w-[205px] sm:max-w-[270px]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe2 className="h-4 w-4 shrink-0 text-[#777681]" />
        <span className="min-w-0 flex-1 truncate">
          {active?.website ? prettyDomain(active.website) : (active?.name ?? "My website")}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#777681]" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-[280px] rounded-2xl border border-[#e7e6ea] bg-white p-2 text-[#17151b] shadow-[0_18px_45px_rgba(16,24,40,.14)]">
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#8a8790]">
            Your websites
          </div>
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setActive.mutate(workspace.id)}
              disabled={setActive.isPending}
              role="option"
              aria-selected={workspace.active}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[#f7f7f9] ${workspace.active ? "font-semibold text-[#5558d8]" : ""}`}
            >
              <span className="min-w-0">
                <span className="block truncate">
                  {workspace.website ? prettyDomain(workspace.website) : workspace.name}
                </span>
                <span className="block truncate text-xs font-normal text-[#8a8790]">
                  {workspace.website ? workspace.name : "No website connected yet"}
                </span>
              </span>
              {workspace.active && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
          <div className="my-1 border-t border-[#eeedf0]" />
          {creating ? (
            <div className="p-2">
              <input
                autoFocus
                className="input text-sm"
                placeholder="New website name (e.g. Second Domain)"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && newName.trim() && create.mutate(newName.trim())
                }
              />
              <div className="mt-2 flex justify-end gap-2">
                <button className="btn-ghost text-xs" onClick={() => setCreating(false)}>
                  Cancel
                </button>
                <button
                  className="btn-primary text-xs"
                  onClick={() => newName.trim() && create.mutate(newName.trim())}
                  disabled={create.isPending || !newName.trim()}
                >
                  {create.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#5558d8] hover:bg-[#f7f7f9]"
            >
              <Plus className="h-4 w-4" /> Add another website
            </button>
          )}
        </div>
      )}
    </div>
  );
}
