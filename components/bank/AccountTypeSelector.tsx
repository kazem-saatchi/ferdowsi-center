import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-wrap items-center gap-2">
      <Label>{labels.accountType}</Label>
      <Button
        onClick={() => {
          handleAccountTypeChange(undefined);
        }}
        variant={accountType === undefined ? "default" : "outline"}
        aria-pressed={accountType === undefined}
        disabled={isFetching}
      >
        {isFetching && accountType === undefined ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.allAccountType}
      </Button>
      <Button
        onClick={() => {
          handleAccountTypeChange("BUSINESS");
        }}
        variant={accountType === "BUSINESS" ? "default" : "outline"}
        aria-pressed={accountType === "BUSINESS"}
        disabled={isFetching}
      >
        {isFetching && accountType === "BUSINESS" ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.businessType}
      </Button>
      <Button
        onClick={() => {
          handleAccountTypeChange("PROPRIETOR");
        }}
        variant={accountType === "PROPRIETOR" ? "default" : "outline"}
        aria-pressed={accountType === "PROPRIETOR"}
        disabled={isFetching}
      >
        {isFetching && accountType === "PROPRIETOR" ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : null}
        {labels.proprietorType}
      </Button>
    </div>
  );
}

export default AccountTypeSelector;
