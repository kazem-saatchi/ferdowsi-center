import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { labels } from "@/utils/label";
import { AccountType } from "@prisma/client";
import { Loader2 } from "lucide-react";
import React, { SetStateAction } from "react";

function AccountTypeSelector({
  accountType,
  setAccountType,
  isFetching,
  setPage,
}: {
  accountType: AccountType | undefined;
  setAccountType: (value: AccountType | undefined) => void;
  setPage: (value: SetStateAction<number>) => void;
  isFetching: boolean;
}) {
  const handleAccountTypeChange = (type: AccountType | undefined) => {
    setAccountType(type);
    setPage(1); // Reset to first page when filter changes
  };
  return (
    <div className="flex fle-row items-center justify-start gap-4 p-4">
      <Label>{labels.accountType}</Label>
      <Button
        onClick={() => {
          handleAccountTypeChange(undefined);
        }}
        className={cn(accountType === undefined && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && accountType === undefined ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.allAccountType}
      </Button>
      <Button
        onClick={() => {
          handleAccountTypeChange("BUSINESS");
        }}
        className={cn(accountType === "BUSINESS" && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && accountType === "BUSINESS" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.businessType}
      </Button>
      <Button
        onClick={() => {
          handleAccountTypeChange("PROPRIETOR");
        }}
        className={cn(accountType === "PROPRIETOR" && "bg-primary")}
        variant="outline"
        disabled={isFetching}
      >
        {isFetching && accountType === "PROPRIETOR" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.proprietorType}
      </Button>
    </div>
  );
}

export default AccountTypeSelector;
