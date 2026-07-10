/*
  Role/ownership boundary logic, kept pure so it can be unit tested.

  Defence in depth — this logic is enforced twice:
  1. In the database, by Row Level Security (see supabase/migrations
     and supabase/tests/rls_check.sql).
  2. In the application server, before any service-key operation,
     via requireChildAccess() below — the service key bypasses RLS,
     so nothing service-side may touch a child without this check.
*/

import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "parent" | "tutor";

export interface RequestUser {
  id: string;
  role: Role;
}

/** Pure decision: may this user see/act for this child? */
export function canAccessChild(
  user: RequestUser,
  child: { id: string; parentId: string },
  tutorAssignedChildIds: ReadonlySet<string>
): boolean {
  if (user.role === "parent") {
    // Parents are never granted access via assignments — only ownership.
    return child.parentId === user.id;
  }
  if (user.role === "tutor") {
    return tutorAssignedChildIds.has(child.id);
  }
  return false;
}

export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/**
 * Server-side gate used by API routes before any service-key write.
 * Resolves the child THROUGH THE CALLER'S OWN client, so Row Level
 * Security answers the ownership question: if the row comes back, the
 * caller is the parent or an assigned tutor; if not, access is denied.
 */
export async function requireChildAccess(
  userClient: SupabaseClient,
  childId: string
): Promise<{ childId: string; firstName: string }> {
  const { data, error } = await userClient
    .from("children")
    .select("id, first_name")
    .eq("id", childId)
    .maybeSingle();

  if (error || !data) {
    throw new AccessDeniedError();
  }
  return { childId: data.id, firstName: data.first_name };
}

export async function requireUser(userClient: SupabaseClient) {
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) throw new AccessDeniedError("Not signed in");
  return user;
}

export async function getRole(
  userClient: SupabaseClient,
  userId: string
): Promise<Role> {
  const { data } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "tutor" ? "tutor" : "parent";
}
