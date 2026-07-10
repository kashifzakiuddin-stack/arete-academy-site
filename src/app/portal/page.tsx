import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addChild } from "./actions";

export default async function PortalHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "tutor") redirect("/portal/tutor");

  const { data: children } = await supabase
    .from("children")
    .select("id, first_name, year_group, created_at")
    .order("created_at");

  return (
    <div className="space-y-10">
      <header>
        <p className="inscription">Family account</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Your children</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Each child has their own profile, practice history, and progress
          picture. Choose a child to practise or to see how they are getting
          on.
        </p>
      </header>

      {children && children.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="text-2xl">{child.first_name}</CardTitle>
                <CardDescription>{child.year_group || "Year group not set"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href={`/portal/children/${child.id}/practice`}>
                    Practise
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/portal/children/${child.id}`}>Progress</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No children added yet — add your first below.
        </p>
      )}

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Add a child</CardTitle>
          <CardDescription>
            A first name and year group is all we store — nothing more is
            needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addChild} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required maxLength={40} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearGroup">Year group</Label>
              <Input
                id="yearGroup"
                name="yearGroup"
                placeholder="e.g. Year 5"
                maxLength={20}
              />
            </div>
            <Button type="submit">Add child</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
