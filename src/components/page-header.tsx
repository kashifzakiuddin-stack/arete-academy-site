import { GreekKeyDivider } from "@/components/motifs";

export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center sm:pt-24">
      {kicker ? <p className="inscription mb-4">{kicker}</p> : null}
      <h1 className="text-4xl leading-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {lede ? (
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {lede}
        </p>
      ) : null}
      <GreekKeyDivider className="mt-10" />
    </header>
  );
}
