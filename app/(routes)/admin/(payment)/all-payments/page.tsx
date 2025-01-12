"use client";

import { useEffect } from "react";
import { useFindAllPayments } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTable } from "@/components/payment/PaymentTable";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function AllPaymentsPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllPayments();
  const { allPayments, setAllPayments } = useStore(
    useShallow((state) => ({
      allPayments: state.allPayments,
      setAllPayments: state.setAllPayments,
    }))
  );

  useEffect(() => {
    if (data?.data?.payments) {
      setAllPayments(data.data.payments);
    }
  }, [data, setAllPayments]);

  if (isLoading) {
    return <LoadingComponent text="loading Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message="an error occured"
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {allPayments && allPayments.length > 0 ? (
          <PaymentTable payments={allPayments} />
        ) : (
          <p>No payments found.</p>
        )}
      </CardContent>
    </Card>
  );
}
