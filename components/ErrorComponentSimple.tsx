import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ErrorComponentSimple({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <Alert
        variant="destructive"
        className="max-w-md "
      >
        <AlertTitle className="text-lg">خطا</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="flex flex-row gap-4 items-center mt-6"></div>
    </div>
  );
}

export default ErrorComponentSimple;
