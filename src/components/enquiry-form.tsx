"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const YEAR_GROUPS = [
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Other / not sure",
];

export function EnquiryForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [yearGroup, setYearGroup] = React.useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      parentName: formData.get("parentName"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      yearGroup,
      targetSchools: formData.get("targetSchools"),
      familyContext: formData.get("familyContext"),
      submittedAt: new Date().toISOString(),
    };
    // TODO: PHASE 2 — wire to backend (email notification + CRM/database).
    // For now the payload is logged so the flow can be inspected end to end.
    console.log("Enquiry payload (not sent anywhere yet):", payload);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="size-10 text-mid-blue" aria-hidden="true" />
          <h2 className="text-2xl">Thank you</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            We have received your enquiry and will be in touch shortly to
            arrange a consultation. There is nothing further you need to do.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
          <div className="space-y-2">
            <Label htmlFor="parentName">Parent or guardian&rsquo;s name</Label>
            <Input
              id="parentName"
              name="parentName"
              autoComplete="name"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearGroup">Child&rsquo;s current year group</Label>
            <Select value={yearGroup} onValueChange={setYearGroup} required>
              <SelectTrigger id="yearGroup" aria-label="Child's current year group">
                <SelectValue placeholder="Select a year group" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_GROUPS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetSchools">Target school or schools</Label>
            <Input
              id="targetSchools"
              name="targetSchools"
              placeholder="e.g. Whitgift, Trinity, a local grammar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyContext">
              Anything you would like us to know{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="familyContext"
              name="familyContext"
              rows={5}
              placeholder="Your child's current level, interests, anything about your circumstances you'd like us to understand — entirely as you prefer."
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Send enquiry
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            We reply personally, usually within two working days. Details you
            share are used only to prepare for our conversation.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
