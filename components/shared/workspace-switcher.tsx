"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import type { Workspace } from "@/types";

const STORAGE_KEY = "pipeflow:workspace";
const COOKIE_KEY = "pipeflow_workspace";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function persistWorkspace(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
  document.cookie = `${COOKIE_KEY}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<Workspace | null>(null);

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
    }

    load();
  }, []);

  function switchWorkspace(ws: Workspace) {
    setCurrent(ws);
    persistWorkspace(ws.id);
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

        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm">Criar workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
