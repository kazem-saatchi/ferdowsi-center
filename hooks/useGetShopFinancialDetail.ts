"use client";

import getShopFinancialDetails from "@/app/api/actions/balance/getShopDetail";
import { useEffect, useState } from "react";

interface MergedTransaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  personName: string;
  proprietor: boolean;
  title: string;
  type: "payment" | "charge";
  bankTransactionId: string | null;
}

export function useGetShopFinancialDetail(shopId: string) {
  const [data, setData] = useState<MergedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getShopFinancialDetails(shopId);

        if (!result.success) {
          throw new Error("Shop not found");
        }

        // Merge and sort transactions
        const merged: MergedTransaction[] = [
          ...(result.data?.payments?.map((payment) => ({
            ...payment,
            type: "payment" as const,
          })) || []),
          ...(result.data?.charges?.map((charge) => ({
            ...charge,
            type: "charge" as const,
            bankTransactionId: null,
          })) || []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData(merged);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  return { data, loading, error };
}