"use client";

import { useEffect, useState } from "react";
import { useFindPaymentsByPerson } from "@/tanstack/query/paymentQuery";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PaymentTable } from "@/components/payment/PaymentTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import { labels } from "@/utils/label";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function PersonPaymentsPage() {
  const [selectedPersonId, setSelectedPersonId] = useState("");

  const {
    data: personsData,
    isLoading: personsIsLoading,
    isError: personsIsError,
    error: personsError,
    refetch: personsRefetch,
  } = useFindAllPersons();
  const {
    data: paymentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFindPaymentsByPerson(selectedPersonId);

  const { personPayments, setPersonPayments, setPersonsAll, personsAll } =
    useStore(
      useShallow((state) => ({
        personPayments: state.personPayments,
        setPersonPayments: state.setPersonPayments,
        personsAll: state.personsAll,
        setPersonsAll: state.setPersonAll,
      }))
    );

  useEffect(() => {
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [personsData, setPersonsAll]);

  useEffect(() => {
    if (paymentsData?.data?.payments) {
      setPersonPayments(paymentsData?.data?.payments);
    }
  }, [paymentsData, setPersonPayments]);

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  if (personsIsLoading) {
    return <LoadingComponent text={labels.loadingPersonsData} />;
  }

  if (personsIsError) {
    return (
      <ErrorComponent
        error={personsError}
        message={labels.errorLoadingPersons}
        retry={personsRefetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.searchPaymentsByPerson}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="person">{labels.selectPerson}</Label>
          <CustomSelect
            options={personOptions}
            value={selectedPersonId}
            onChange={setSelectedPersonId}
            label={labels.person}
          />
        </div>
        {selectedPersonId !== "" && isLoading ? (
          <LoadingComponent text={labels.loadingData} />
        ) : (
          isError && (
            <ErrorComponent
              error={error}
              message={labels.errorOccurred}
              retry={refetch}
            />
          )
        )}
        {selectedPersonId !== "" &&
          personPayments &&
          personPayments.length > 0 && (
            <PaymentTable payments={personPayments} />
          )}
        {selectedPersonId !== "" &&
          personPayments &&
          personPayments.length === 0 && <p>{labels.paymentsNotFound}</p>}
      </CardContent>
    </Card>
  );
}
