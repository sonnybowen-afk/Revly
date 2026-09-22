import { cn } from "@/lib/utils";

/**
 * An endless horizontal ribbon of short phrases.
 *
 * The list is rendered twice and the track slides exactly -50%, which is
 * what makes the loop seamless — at the end of the cycle the second copy
 * sits precisely where the first started. The duplicate is aria-hidden so
 * a screen reader reads the phrases once, not twice.
 */
export function Marquee({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-[var(--gold-hairline)] py-5",
        // Fade the ends so phrases dissolve rather than getting guillotined.
        "[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div className="annie-marquee flex w-max items-center">
        <Row items={items} />
        <Row items={items} aria-hidden="true" />
      </div>
    </div>
  );
}

function Row({
  items,
  ...props
}: {
  items: readonly string[];
} & React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className="flex items-center" {...props}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-sm text-muted-foreground">{item}</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-primary/50" />
        </li>
      ))}
    </ul>
  );
}
