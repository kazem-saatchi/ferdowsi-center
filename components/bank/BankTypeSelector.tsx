import { labels } from "@/utils/label";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetStateAction } from "react";

function BankTypeSelector({
  type,
  setType,
  isFetching,
  setPage,
}: {
  type: "INCOME" | "PAYMENT" | undefined;
  setType: (value: "INCOME" | "PAYMENT" | undefined) => void;
  isFetching: boolean;
  setPage: (value: SetStateAction<number>) => void;
}) {
  const handleTypeChange = (type: "INCOME" | "PAYMENT" | undefined) => {
    setType(type);
    setPage(1);
  };

  return (
    <div className="flex fle-row items-center justify-start gap-4 p-4">
      <Label>{labels.type}</Label>
      <Button
        onClick={() => {
          handleTypeChange(undefined);
        }}
        className={cn(type === undefined && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && type === undefined ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.allType}
      </Button>
      <Button
        onClick={() => {
          handleTypeChange("INCOME");
        }}
        className={cn(type === "INCOME" && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && type === "INCOME" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.income}
      </Button>
      <Button
        onClick={() => {
          handleTypeChange("PAYMENT");
        }}
        className={cn(type === "PAYMENT" && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && type === "PAYMENT" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.cost}
      </Button>
    </div>
  )
}

export default BankTypeSelector