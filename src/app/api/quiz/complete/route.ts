import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import {
  AccessDeniedError,
  requireChildAccess,
  requireUser,
} from "@/lib/practice/authz";

const BodySchema = z.object({ sessionId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    const userClient = await createSupabaseServerClient();
    await requireUser(userClient);

    const { data: session } = await userClient
      .from("quiz_sessions")
      .select("id, child_id, completed_at")
      .eq("id", body.sessionId)
      .maybeSingle();
    if (!session) throw new AccessDeniedError();
    await requireChildAccess(userClient, session.child_id);

    if (!session.completed_at) {
      const service = createSupabaseServiceClient();
      await service
        .from("quiz_sessions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", session.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw error;
  }
}
