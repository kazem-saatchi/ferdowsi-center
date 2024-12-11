import { Loader2 } from "lucide-react";

function LoadingComponent({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-950  dark:text-neutral-100" />
      <p className="mt-4 text-lg font-semibold text-neutral-950 dark:text-neutral-100">
        {text}
      </p>
    </div>
  );
}

export default LoadingComponent;
