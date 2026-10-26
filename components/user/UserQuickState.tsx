import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useGetUserQuickState } from "@/tanstack/query/personQuery";
import LoadingComponent from "../LoadingComponent";
import { labels } from "@/utils/label";
import ErrorComponent from "../ErrorComponent";
import { formatNumber } from "@/utils/formatNumber";
import { cn } from "@/lib/utils";

function UserQuickState() {
  const {
    data: QuickData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserQuickState();

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={labels.errorMessage}
        retry={refetch}
      />
    );
  }

  const balance = QuickData?.quickState.data?.totalBalance ?? 0;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
        خلاصه اطلاعات
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">واحدهای فعال</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold break-all">
              {formatNumber(QuickData?.quickState.data?.shopsCount ?? 0)}
            </p>
            <CardDescription>تجاری و اداری</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              {labels.totalBalance}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p
              className={cn(
                "text-xl sm:text-2xl font-bold break-all",
                balance < 0 && "text-red-500",
                balance > 0 && "text-green-500"
              )}
            >
              {formatNumber(Math.abs(balance))} {labels.rial}
            </p>
            {/* balance is payments minus charges: below zero means owing */}
            <CardDescription>
              {balance < 0
                ? labels.debtor
                : balance > 0
                  ? labels.creditor
                  : labels.statusSettled}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserQuickState;
