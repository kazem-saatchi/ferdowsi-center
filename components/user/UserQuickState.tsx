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
              پرداخت های معوق
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl sm:text-2xl font-bold break-all">
              {formatNumber(QuickData?.quickState.data?.totalBalance ?? 0)}
            </p>
            <CardDescription>مانده حساب کلی</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserQuickState;
