"use client";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { ShopsTable } from "@/components/shop/ShopTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { useFindAllShops } from "@/tanstack/queries";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function AllShopsPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllShops();

  // Zustand State
  const { setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.shops) {
      setShopsAll(data?.data?.shops);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingComponent text="loading data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : "Unknown error"}
        error={error}
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Shops</CardTitle>
      </CardHeader>
      <CardContent>
        {shopsAll && shopsAll.length > 0 ? (
          <ShopsTable shops={shopsAll} />
        ) : (
          <p>No shops found.</p>
        )}
      </CardContent>
    </Card>
  );
}
