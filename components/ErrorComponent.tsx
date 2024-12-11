import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HomeIcon, RefreshCw } from "lucide-react";
import Link from "next/link";

function ErrorComponent({
  error,
  retry,
  message,
}: {
  error: Error;
  retry: () => void;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen  bg-neutral-100 dark:bg-neutral-900">
      <Alert
        variant="destructive"
        className="max-w-md dark:bg-neutral-800 dark:text-red-400"
      >
        <AlertTitle className="text-lg">خطا</AlertTitle>
        <AlertDescription>{error.message || message}</AlertDescription>
      </Alert>
      <div className="flex flex-row gap-4 items-center mt-6">
        <Button className="flex flex-row gap-2 items-center py-6">
          <HomeIcon />
          <Link href="/">صفحه اصلی</Link>
        </Button>
        <Button
          onClick={retry}
          className="flex flex-row gap-2 items-center py-6"
        >
          <RefreshCw />
          تلاش مجدد
        </Button>
      </div>
    </div>
  );
}

export default ErrorComponent;
