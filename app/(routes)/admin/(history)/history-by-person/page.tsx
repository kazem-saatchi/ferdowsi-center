"use client";
import EmptyState from "@/components/EmptyState";
import { toPersianDigits } from "@/utils/formatNumber";

import { useEffect, useState } from "react";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useShopHistoryByPerson } from "@/tanstack/query/historyQuery";
import { useStore } from "@/store/store";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";
import { labels } from "@/utils/label";
import { CustomSelect } from "@/components/CustomSelect";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import HistoryTable from "@/components/history/HistoryTable";

export default function HistoryByPersonInfo() {
  const [personId, setPersonId] = useState<string>("");

  const {
    data: persons,
    isLoading: isPersonsLoading,
    isError: isPersonsError,
    error: personsError,
    refetch: personsRefetch,
  } = useFindAllPersons();

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByPerson(personId);

  // Zustand State
  const { personHistories, setPersonHistories, personsAll, setPersonAll } =
    useStore(
      useShallow((state) => ({
        personsAll: state.personsAll,
        setPersonAll: state.setPersonAll,
        personHistories: state.personHistories,
        setPersonHistories: state.setPersonHistories,
      }))
    );

  useEffect(() => {
    if (persons?.data?.persons) {
      setPersonAll(persons.data.persons);
    }
  }, [persons, setPersonAll]);

  useEffect(() => {
    if (data?.data?.histories) {
      setPersonHistories(data.data.histories);
    }
  }, [data, setPersonHistories]);

  if (isPersonsLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isPersonsError) {
    return (
      <ErrorComponent
        error={personsError}
        message={
          personsError instanceof Error
            ? personsError.message
            : labels.somethingWentWrong
        }
        retry={personsRefetch}
      />
    );
  }

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${toPersianDigits(person.IdNumber)})`,
    })) || [];

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.personHistory}</PageTitle>
      </PageHeader>
      <PageBody>
        <div className="space-y-2">
          <Label htmlFor="person">{labels.selectPerson}</Label>
          <CustomSelect id="person"
            options={personOptions}
            value={personId}
            onChange={setPersonId}
            label={labels.person}
          />
        </div>
        <Separator className="my-4" />

        {personId !== "" && isLoading && (
          <LoadingComponent inline text={labels.loadingShopHistory} />
        )}

        {personId !== "" && isError && (
          <ErrorComponent inline
            error={error}
            message={
              error instanceof Error
                ? error.message
                : labels.somethingWentWrong
            }
            retry={refetch}
          />
        )}

        {personId !== "" &&
          !isLoading &&
          !isError &&
          personHistories &&
          personHistories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {personHistories[0].personName}
              </h3>
              <HistoryTable allHistories={personHistories} />
            </div>
          )}

        {personId !== "" &&
          !isLoading &&
          !isError &&
          personHistories &&
          personHistories.length === 0 && <EmptyState message={labels.historiesNotFound} />}
      </PageBody>
    </Page>
  );
}
