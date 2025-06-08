"use client";

import React, { useState, useEffect } from "react";
import { useGetPersonBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PersonBalanceDisplay } from "@/components/balance/PersonBalanceDisplay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/CustomSelect";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";
import { useFindAllPersons } from "@/tanstack/query/personQuery";

export default function PersonBalancePage() {
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const {
    data: personsData,
    isLoading: personsIsLoading,
    isError: personsIsError,
    error: personsError,
    refetch: personsRefetch,
  } = useFindAllPersons();
  const { data, isLoading, isError, error, refetch } =
    useGetPersonBalance(selectedPersonId);

  const {
    personsAll,
    setPersonsAll,
    setPersonBalance,
    setPersonsBalance,
    setShopsBalance,
    setUserInfo,
  } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
      setPersonBalance: state.setPersonBalance,
      setPersonsBalance: state.setPersonsBalance,
      setShopsBalance: state.setShopsBalance,
      setUserInfo: state.setUserInfo,
    }))
  );

  useEffect(() => {
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [personsData]);

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

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  if (personsIsLoading)
    return <LoadingComponent text={labels.loadingPersonsData} />;
  if (personsIsError)
    return (
      <ErrorComponent
        error={personsError as Error}
        message={labels.errorLoadingPersons}
        retry={personsRefetch}
      />
    );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{labels.personBalanceInfo}</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{labels.selectPerson}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomSelect
            options={personOptions}
            value={selectedPersonId}
            onChange={setSelectedPersonId}
            label={labels.person}
          />
        </CardContent>
      </Card>
      {selectedPersonId !== "" && isLoading && (
        <LoadingComponent text={labels.loadingFinancialData} />
      )}
      {selectedPersonId !== "" && isError && (
        <ErrorComponent
          error={error}
          message={labels.errorLoadingFinancial}
          retry={refetch}
        />
      )}
      {selectedPersonId !== "" &&
        !isLoading &&
        !isError &&
        data?.data &&
        data.data.personBalance && <PersonBalanceDisplay />}
    </div>
  );
}
