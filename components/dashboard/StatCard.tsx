import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  /** Headline figure, already formatted for display. */
  value: string;
  /** Small line under the figure — a count, a share, a date. */
  hint?: string;
  icon: LucideIcon;
  href?: string;
  /** Draws attention to a figure that needs action, e.g. unbooked payments. */
  emphasis?: "default" | "warning";
}

/** One figure on the dashboard. The whole card is the link when `href` is set,
 *  so the click target matches what the reader is looking at. */
export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  href,
  emphasis = "default",
}: StatCardProps) {
  const body = (
    <Card
      className={cn(
        "h-full transition-colors",
        href && "hover:border-primary hover:bg-accent/40",
        emphasis === "warning" && "border-amber-500/60"
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-2xl font-bold",
              emphasis === "warning" && "text-amber-600 dark:text-amber-400"
            )}
          >
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground",
            emphasis === "warning" && "text-amber-600 dark:text-amber-400"
          )}
        />
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
