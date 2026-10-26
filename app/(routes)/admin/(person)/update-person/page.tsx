"use client";
import { toPersianDigits } from "@/utils/formatNumber";

import { useState, useEffect } from "react";
import { UpdatePersonForm } from "@/components/person/UpdatePersonForm";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { CustomSelect } from "@/components/CustomSelect";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { SafePerson } from "@/schema/personSchema";
import { labels } from "@/utils/label";

export default function UpdatePersonPage() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<SafePerson | null>(null);

  const { data, error, isError, isLoading, refetch } = useFindAllPersons();

  const { personsAll, setPersonsAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (data?.data?.persons) {
      setPersonsAll(data.data.persons);
    }
  }, [data, setPersonsAll]);

  useEffect(() => {
    if (personsAll && selectedPersonId) {
      const selected = personsAll.find(
        (person) => person.id === selectedPersonId
      );
      setSelectedPerson(selected || null);
    } else {
      setSelectedPerson(null);
    }
  }, [selectedPersonId, personsAll]);

  if (isLoading) {
    return <LoadingComponent text="در حال بارگذاری" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error as Error}
        retry={refetch}
        message="خطایی هنگام بارگذاری اطلاعات رخ داد."
      />
    );
  }

  if (!personsAll || personsAll.length === 0) {
    return (
      <ErrorComponent
        error={new Error("هیچ داده‌ای یافت نشد")}
        retry={refetch}
        message="خطایی هنگام بارگذاری اطلاعات رخ داد."
      />
    );
  }

  const personOptions = personsAll.map((person) => ({
    id: person.id,
    label: `${person.firstName} ${person.lastName} (${toPersianDigits(person.IdNumber)})`,
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle>{labels.selectPerson}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <CustomSelect
            options={personOptions}
            value={selectedPersonId || ""}
            onChange={(value) => setSelectedPersonId(value)}
            label={labels.searchByPerson}
          />
        </CardContent>
      </div>
      {selectedPerson ? (
        <UpdatePersonForm
          key={selectedPerson.id}
          initialData={{
            id: selectedPerson.id,
            IdNumber: selectedPerson.IdNumber,
            firstName: selectedPerson.firstName,
            lastName: selectedPerson.lastName,
            phoneOne: selectedPerson.phoneOne,
            phoneTwo: selectedPerson.phoneTwo || null,
            isActive: selectedPerson.isActive,
          }}
        />
      ) : (
        <p className="text-center text-muted-foreground">
          {labels.pleaseSelectAPerson}
        </p>
      )}
    </div>
  );
}
