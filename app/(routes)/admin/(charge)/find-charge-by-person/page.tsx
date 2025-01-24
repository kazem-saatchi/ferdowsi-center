"use client";

import { useEffect, useState } from "react";
import { useFindAllPersons, useFindChargesByPerson } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";

import { labels } from "@/utils/label";
import { CustomSelect } from "@/components/CustomSelect";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function FindChargesByPerson() {
  const [personId, setPersonId] = useState<string>("");
  const {
    data: persons,
    isLoading: isPersonsLoading,
    isError: isPersonsError,
    error: personsError,
    refetch: personsRefetch,
  } = useFindAllPersons();
  const { data, isLoading, isError, error, refetch } = useFindChargesByPerson({
    personId,
  });

  // Zustand State
  const { shopCharges, setShopCharges, personsAll, setPersonAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonAll: state.setPersonAll,
      shopCharges: state.shopCharges,
      setShopCharges: state.setShopCharges,
    }))
  );

  useEffect(() => {
    if (persons?.data?.persons) {
      setPersonAll(persons.data.persons);
    }
  }, [persons, setPersonAll]);

  useEffect(() => {
    if (data?.data?.charges) {
      setShopCharges(data.data.charges);
    }
  }, [data, setShopCharges]);

  if (isPersonsLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isPersonsError) {
    return (
      <ErrorComponent
        error={personsError}
        message={data?.message || labels.generalErrorMessage}
        retry={personsRefetch}
      />
    );
  }

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.personCharges}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="person">{labels.selectPerson}</Label>
          <CustomSelect
            options={personOptions}
            value={personId}
            onChange={setPersonId}
            label={labels.person}
          />
        </div>
        <Separator className="my-4" />
        {personId !== "" && isLoading && (
          <LoadingComponent text={labels.loadingData} />
        )}

        {personId !== "" && isError && (
          <ErrorComponent
            error={error}
            message={data?.message || labels.generalErrorMessage}
            retry={refetch}
          />
        )}

        {personId !== "" &&
          !isLoading &&
          !isError &&
          shopCharges &&
          shopCharges.length > 0 && <ChargeTable charges={shopCharges} />}

        {personId !== "" &&
          !isLoading &&
          !isError &&
          shopCharges &&
          shopCharges.length === 0 && <p>{labels.chargesNotFound}</p>}
      </CardContent>
    </Card>
  );
}
