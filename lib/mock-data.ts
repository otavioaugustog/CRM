import type { Workspace, WorkspaceMember } from "@/types";

export const MOCK_USER = {
  id: "user-1",
  name: "Otávio Augusto",
  email: "otavio@pipeflow.com.br",
  avatarInitials: "OA",
};

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-1",
    name: "Agência Digital",
    slug: "agencia-digital",
    plan: "pro",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "ws-2",
    name: "Consultoria B2B",
    slug: "consultoria-b2b",
    plan: "free",
    created_at: "2024-03-20T14:30:00Z",
  },
  {
    id: "ws-3",
    name: "E-commerce Moda",
    slug: "ecommerce-moda",
    plan: "free",
    created_at: "2024-06-01T09:00:00Z",
  },
];

export const MOCK_CURRENT_WORKSPACE = MOCK_WORKSPACES[0];

export const MOCK_MEMBERS: WorkspaceMember[] = [
  {
    id: "member-1",
    workspace_id: "ws-1",
    user_id: "user-1",
    role: "admin",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "member-2",
    workspace_id: "ws-1",
    user_id: "user-2",
    role: "member",
    created_at: "2024-02-01T10:00:00Z",
  },
];
