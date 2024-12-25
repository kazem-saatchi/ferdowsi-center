"use client";

import { useEffect } from "react";
import { useFindAllCharges } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function AllChargesPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllCharges();
  const { allCharges, setAllCharges } = useStore();

  useEffect(() => {
    if (data?.data?.charges) {
      setAllCharges(data.data.charges);
    }
  }, [data, setAllCharges]);

  if (isLoading) {
    return <LoadingComponent text="loading Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={data?.message || "Something Went Wrong"}
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Charges</CardTitle>
      </CardHeader>
      <CardContent>
        {allCharges && allCharges.length > 0 ? (
          <ChargeTable charges={allCharges} />
        ) : (
          <p>No charges found.</p>
        )}
      </CardContent>
    </Card>
  );
}
