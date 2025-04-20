import { Loader2 } from "lucide-react";

function LoadingComponent({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <Loader2 className="h-8 w-8 animate-spin " />
      <p className="mt-4 text-lg font-semibold ">{text}</p>
    </div>
  );
}

export default LoadingComponent;
