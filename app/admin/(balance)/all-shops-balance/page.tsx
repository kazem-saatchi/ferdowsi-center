"use client";

import { useEffect } from "react";
import { useGetAllShopsBalance } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { BalanceTable } from "@/components/balance/BalanceTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function AllShopsBalancePage() {
  const { data, isLoading, isError, error, refetch } = useGetAllShopsBalance();
  const { allBalances, setAllBalances } = useStore(
    useShallow((state) => ({
      allBalances: state.allBalances,
      setAllBalances: state.setAllBalances,
    }))
  );

  useEffect(() => {
    if (data?.data?.shopsBalance) {
      setAllBalances(data?.data?.shopsBalance);
    }
  }, [data, setAllBalances]);

  if (isLoading) {
    return <LoadingComponent text="Loading..." />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message="Error on Getting Data"
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Shops Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {allBalances && allBalances.length > 0 ? (
          <BalanceTable balances={allBalances} />
        ) : (
          <p>No balance information found.</p>
        )}
      </CardContent>
    </Card>
  );
}
