"use client";
import { toPersianDigits } from "@/utils/formatNumber";

import React, { useState, useEffect } from "react";
import { useGetPersonBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PersonBalanceDisplay } from "@/components/balance/PersonBalanceDisplay";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

  const { personsAll, setPersonsAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [personsData]);

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${toPersianDigits(person.IdNumber)})`,
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
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{labels.personBalanceInfo}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="person">{labels.selectPerson}</Label>
          <CustomSelect id="person"
            options={personOptions}
            value={selectedPersonId}
            onChange={setSelectedPersonId}
            label={labels.person}
          />
        </div>

        {selectedPersonId !== "" && isLoading && (
          <LoadingComponent inline text={labels.loadingFinancialData} />
        )}
        {selectedPersonId !== "" && isError && (
          <ErrorComponent inline
            error={error}
            message={labels.errorLoadingFinancial}
            retry={refetch}
          />
        )}
        {selectedPersonId !== "" && !isLoading && !isError && data?.data && (
          <PersonBalanceDisplay
            person={data.data.person}
            summary={data.data.summary}
            units={data.data.units}
          />
        )}
      </CardContent>
    </div>
  );
}
