"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
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
import { MOCK_WORKSPACES, MOCK_CURRENT_WORKSPACE } from "@/lib/mock-data";
import type { Workspace } from "@/types";

export function WorkspaceSwitcher() {
  const [current, setCurrent] = useState<Workspace>(MOCK_CURRENT_WORKSPACE);

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
          <span className="text-xs text-muted-foreground capitalize">
            {current.plan === "pro" ? "Pro" : "Free"}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-60"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>

          {MOCK_WORKSPACES.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setCurrent(ws)}
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
