"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetPersonBalance } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PersonBalanceDisplay } from "@/components/balance/PersonBalanceDisplay";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function PersonBalanceByIdPage() {
  const params = useParams();
  const personId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useGetPersonBalance(personId);

  const { setPersonBalance, setPersonsBalance, setShopsBalance, setUserInfo } =
    useStore(
      useShallow((state) => ({
        setPersonBalance: state.setPersonBalance,
        setPersonsBalance: state.setPersonsBalance,
        setShopsBalance: state.setShopsBalance,
        setUserInfo: state.setUserInfo,
      }))
    );

  useEffect(() => {
    if (data?.data?.personBalance) {
      setPersonBalance(data.data.personBalance.personBalance);
    }
    if (data?.data?.shopsBalance) {
      setShopsBalance(data?.data.shopsBalance.map((data) => data.shopBalance));
    }
    if (data?.data?.personBalanceByShops) {
      setPersonsBalance(data.data.personBalanceByShops);
    }
    if (data?.data?.person) {
      setUserInfo(data.data.person);
    }
  }, [data, setPersonBalance, setPersonsBalance]);

  if (isLoading)
    return <LoadingComponent text="در حال بارگذاری اطلاعات مالی" />;
  if (isError)
    return (
      <ErrorComponent
        error={error as Error}
        message="خطا در دریافت اطلاعات مالی"
        retry={refetch}
      />
    );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">اطلاعات مالی شخص</h1>
      {data?.data && data?.data.personBalance && <PersonBalanceDisplay />}
    </div>
  );
}
