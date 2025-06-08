"use client";

import { useState, useEffect } from "react";
import { UpdatePersonForm } from "@/components/person/UpdatePersonForm";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { CustomSelect } from "@/components/CustomSelect";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Person } from "@prisma/client";
import { labels } from "@/utils/label";

export default function UpdatePersonPage() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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
    label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{labels.selectPerson}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomSelect
            options={personOptions}
            value={selectedPersonId || ""}
            onChange={(value) => setSelectedPersonId(value)}
            label={labels.searchByPerson}
          />
        </CardContent>
      </Card>
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
        <p className="text-center text-gray-500">
          {labels.pleaseSelectAPerson}
        </p>
      )}
    </div>
  );
}
