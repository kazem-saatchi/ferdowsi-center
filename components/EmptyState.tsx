import { cn } from "@/lib/utils";
import { labels } from "@/utils/label";

/** What a list shows when it has no rows. One wording everywhere unless the
 *  caller has something more specific to say. */
function EmptyState({
  message = labels.nothingFound,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <p className={cn("py-8 text-center text-muted-foreground", className)}>
      {message}
    </p>
  );
}

export default EmptyState;
