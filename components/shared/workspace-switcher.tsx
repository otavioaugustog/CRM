"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { createWorkspace } from "@/app/actions/workspace";
import type { Workspace } from "@/types";

const STORAGE_KEY = "pipeflow:workspace";
const COOKIE_KEY = "pipeflow_workspace";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function persistWorkspace(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
  document.cookie = `${COOKIE_KEY}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

interface WorkspaceSwitcherProps {
  onPlanChange?: (plan: string) => void;
}

export function WorkspaceSwitcher({ onPlanChange }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      // cast necessário — supabase-js v2.104+ usa PostgrestVersion que difere do tipo manual
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: raw } = await (supabase as any)
        .from("workspaces")
        .select("*")
        .order("created_at");

      const data = raw as Workspace[] | null;
      if (!data || data.length === 0) return;

      setWorkspaces(data);

      const savedId = localStorage.getItem(STORAGE_KEY);
      const saved = savedId ? data.find((w) => w.id === savedId) : null;
      const active = saved ?? data[0];
      setCurrent(active);
      persistWorkspace(active.id);
      onPlanChange?.(active.plan ?? "free");
    }

    load();
  }, [onPlanChange]);

  function switchWorkspace(ws: Workspace) {
    setCurrent(ws);
    persistWorkspace(ws.id);
    onPlanChange?.(ws.plan ?? "free");
    router.refresh();
  }

  function closeCreate() {
    setCreateOpen(false);
    setNewName("");
    setCreateError("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const result = await createWorkspace(newName.trim());
      if (result && "error" in result) {
        setCreateError(result.error);
      }
      // em caso de sucesso, createWorkspace faz redirect — não chega aqui
    });
  }

  if (!current) {
    return (
      <div className="flex h-10 w-full items-center gap-2 rounded-lg px-2 py-2">
        <div className="h-7 w-7 shrink-0 rounded-md bg-muted animate-pulse" />
        <div className="h-3 flex-1 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none">
          <Avatar className="h-7 w-7 shrink-0 rounded-md">
            <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs font-bold">
              {getInitials(current.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {current.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {current.plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start" className="w-60" sideOffset={4}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>

            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => switchWorkspace(ws)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6 shrink-0 rounded-md">
                  <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(ws.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm">{ws.name}</span>
                <div className="flex items-center gap-1.5">
                  {ws.plan === "pro" && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 text-[10px] font-semibold text-primary"
                    >
                      Pro
                    </Badge>
                  )}
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 text-primary",
                      current.id === ws.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 text-muted-foreground"
            onClick={() => setCreateOpen(true)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm">Criar workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Criar workspace</h3>
              <button
                onClick={closeCreate}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="new-ws-name">
                  Nome
                </label>
                <input
                  id="new-ws-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Minha Empresa"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {createError && (
                  <p className="text-xs text-destructive">{createError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newName.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? "Criando…" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
