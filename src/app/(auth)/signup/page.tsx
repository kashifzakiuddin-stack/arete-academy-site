"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 10) {
      setError("Please choose a password of at least 10 characters.");
      setBusy(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password,
      options: {
        data: { full_name: String(form.get("fullName")) },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.replace("/portal");
      router.refresh();
      return;
    }
    // Email confirmation is switched on in Supabase: tell the parent
    // what happens next rather than leaving them on a dead form.
    setAwaitingConfirmation(true);
    setBusy(false);
  }

  if (awaitingConfirmation) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">One more step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We have sent a confirmation link to your email address. Follow it
            to finish creating your account, then sign in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create a family account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              At least 10 characters. One account per family — you will add
              each child as a profile inside it.
            </p>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/signin" className="font-medium text-mid-blue hover:text-brass">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
