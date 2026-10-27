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
import {
  Page,
  PageSection,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { Label } from "@/components/ui/label";
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
    <Page>
      {/* Same shape as the other lookup pages: page title, then a labelled
          full-width picker; the form below keeps form width. */}
      <PageHeader>
        <PageTitle>{labels.updatePerson}</PageTitle>
      </PageHeader>
      <PageBody className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="person">{labels.selectPerson}</Label>
          <CustomSelect
            id="person"
            options={personOptions}
            value={selectedPersonId || ""}
            onChange={(value) => setSelectedPersonId(value)}
            label={labels.searchByPerson}
          />
        </div>
        {!selectedPerson && (
          <p className="text-sm text-muted-foreground">
            {labels.pleaseSelectAPerson}
          </p>
        )}
      </PageBody>
      {selectedPerson && (
        <PageSection width="form">
          <UpdatePersonForm
            key={selectedPerson.id}
            title={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
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
        </PageSection>
      )}
    </Page>
  );
}
