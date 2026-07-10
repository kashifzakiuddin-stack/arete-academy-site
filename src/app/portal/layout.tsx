import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LaurelMark } from "@/components/motifs";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/portal");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <Link
            href="/portal"
            className="flex items-center gap-2.5 text-navy transition-colors hover:text-brass"
          >
            <LaurelMark className="size-8" />
            <span className="font-serif text-lg font-semibold tracking-[0.14em] uppercase">
              Arete Academy
            </span>
            <span className="ml-1 hidden text-xs font-medium tracking-wide text-muted-foreground uppercase sm:inline">
              · Practice Portal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile?.full_name || user.email}
              {profile?.role === "tutor" ? " · Tutor" : ""}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Questions about your child&rsquo;s data?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-brass">
          Safeguarding &amp; policies
        </Link>
      </footer>
    </div>
  );
}
