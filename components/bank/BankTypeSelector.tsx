import { labels } from "@/utils/label";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-2">
      <Label>{labels.type}</Label>
      <Button
        onClick={() => {
          handleTypeChange(undefined);
        }}
        variant={type === undefined ? "default" : "outline"}
        aria-pressed={type === undefined}
        disabled={isFetching}
      >
        {isFetching && type === undefined ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.allType}
      </Button>
      <Button
        onClick={() => {
          handleTypeChange("INCOME");
        }}
        variant={type === "INCOME" ? "default" : "outline"}
        aria-pressed={type === "INCOME"}
        disabled={isFetching}
      >
        {isFetching && type === "INCOME" ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.income}
      </Button>
      <Button
        onClick={() => {
          handleTypeChange("PAYMENT");
        }}
        variant={type === "PAYMENT" ? "default" : "outline"}
        aria-pressed={type === "PAYMENT"}
        disabled={isFetching}
      >
        {isFetching && type === "PAYMENT" ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.cost}
      </Button>
    </div>
  )
}

export default BankTypeSelector