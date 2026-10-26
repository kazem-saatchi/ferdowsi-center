import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { labels } from "@/utils/label";
import { HomeIcon, RefreshCw } from "lucide-react";
import Link from "next/link";

function ErrorComponent({
  error,
  retry,
  message,
  inline = false,
}: {
  error?: Error | null;
  retry?: () => void;
  message?: string;
  inline?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        inline ? "py-10" : "min-h-[60vh]"
      )}
    >
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle className="text-lg">{labels.errorTitle}</AlertTitle>
        <AlertDescription>
          {error?.message || message || labels.somethingWentWrong}
        </AlertDescription>
      </Alert>
      <div className="flex flex-row gap-4 items-center mt-6">
        {!inline && (
          <Button asChild variant="outline">
            <Link href="/" className="flex flex-row gap-2 items-center">
              <HomeIcon className="h-4 w-4" />
              {labels.homePage}
            </Link>
          </Button>
        )}
        {retry && (
          <Button onClick={retry} className="flex flex-row gap-2 items-center">
            <RefreshCw className="h-4 w-4" />
            {labels.retry}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorComponent;
