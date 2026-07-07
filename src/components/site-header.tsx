"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LaurelMark } from "@/components/motifs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";

function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-navy transition-colors hover:text-brass"
    >
      <LaurelMark className="size-9 shrink-0" />
      <span className="font-serif text-xl font-semibold tracking-[0.14em] uppercase">
        Arete Academy
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[13px] font-medium tracking-wide text-ink/80 transition-colors hover:text-brass",
                  active && "text-navy underline decoration-brass-soft decoration-2 underline-offset-8"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button asChild size="sm" className="ml-2">
            <Link href="/admissions">Enquire</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-3 xl:hidden">
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/admissions">Enquire</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="tracking-[0.14em] uppercase">
                  Arete Academy
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 pb-6">
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-2 py-2.5 text-base text-ink/90 transition-colors hover:bg-mist/50 hover:text-navy",
                        pathname === item.href && "bg-mist/60 text-navy"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild className="mt-4">
                    <Link href="/admissions">Enquire</Link>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
