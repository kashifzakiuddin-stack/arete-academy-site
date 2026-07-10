"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function addChild(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const yearGroup = String(formData.get("yearGroup") ?? "").trim();
  if (!firstName) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // RLS guarantees parent_id must equal the caller — a forged parent_id
  // would simply fail the policy's with-check.
  await supabase.from("children").insert({
    parent_id: user.id,
    first_name: firstName,
    year_group: yearGroup,
  });

  revalidatePath("/portal");
}
