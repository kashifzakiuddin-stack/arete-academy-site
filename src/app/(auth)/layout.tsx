import Link from "next/link";

import { LaurelMark } from "@/components/motifs";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 text-navy transition-colors hover:text-brass"
      >
        <LaurelMark className="size-10" />
        <span className="font-serif text-xl font-semibold tracking-[0.14em] uppercase">
          Arete Academy
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-brass">
          ← Back to the main site
        </Link>
      </p>
    </div>
  );
}
