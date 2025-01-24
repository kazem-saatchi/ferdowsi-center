"use client";

import { useEffect, useState } from "react";
import { useFindPaymentsByPerson, useFindAllPersons } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PaymentTable } from "@/components/payment/PaymentTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import { labels } from "@/utils/label";

export default function PersonPaymentsPage() {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const { data: personsData } = useFindAllPersons();
  const { data: paymentsData, isLoading, isError } = useFindPaymentsByPerson(selectedPersonId);
  
  

  const { personPayments, setPersonPayments, setPersonsAll, personsAll } = useStore(
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

  const personOptions = personsAll?.map((person) => ({
    id: person.id,
    label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
  })) || [];

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
        {isLoading ? (
          <Skeleton className="w-full h-[400px]" />
        ) : isError ? (
          <p>{labels.errorOccurred}</p>
        ) : personPayments && personPayments.length > 0 ? (
          <PaymentTable payments={personPayments} />
        ) : (
          <p>{labels.paymentsNotFound}</p>
        )}
      </CardContent>
    </Card>
  );
}

