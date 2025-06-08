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
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">خلاصه اطلاعات</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">واحدهای فعال</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(QuickData?.quickState.data?.shopsCount ?? 0)}
            </p>
            <CardDescription>تجاری و اداری</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">پرداخت های معوق</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(QuickData?.quickState.data?.totalBalance ?? 0)}
            </p>
            <CardDescription>مانده حساب کلی</CardDescription>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">اطلاعیه های جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">New announcements</p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}

export default UserQuickState;
