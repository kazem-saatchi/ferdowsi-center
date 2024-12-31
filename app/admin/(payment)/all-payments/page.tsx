"use client";

import { useEffect } from "react";
import { useFindAllPayments } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTable } from "@/components/payment/PaymentTable";

export default function AllPaymentsPage() {
  const { data, isLoading, isError } = useFindAllPayments();
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>An error occurred while fetching payments.</p>
        </CardContent>
      </Card>
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

