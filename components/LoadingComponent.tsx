import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { labels } from "@/utils/label";

/** Spinner with a caption. Full-page by default; `inline` keeps it inside the
 *  card or table it replaces instead of pushing the page a screen tall. */
function LoadingComponent({
  text = labels.loadingData,
  inline = false,
}: {
  text?: string;
  inline?: boolean;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center",
        inline ? "py-10" : "min-h-[60vh]"
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className={cn("mt-4 font-semibold", inline ? "text-sm" : "text-lg")}>
        {text}
      </p>
    </div>
  );
}

export default LoadingComponent;
