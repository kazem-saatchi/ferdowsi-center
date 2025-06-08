"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { PersonList } from "@/components/person/PersonList";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function AllPersonsPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllPersons();

  const { personsAll, setPersonAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (data?.data?.persons) {
      setPersonAll(data.data.persons);
    }
  }, [data, setPersonAll]);

  if (isLoading) {
    return <LoadingComponent text="در حال بارگذاری" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error as Error}
        retry={refetch}
        message="An error occurred while loading your data."
      />
    );
  }

  if (!data?.data || !data.data.persons) {
    return (
      <ErrorComponent
        error={new Error("No data found")}
        retry={refetch}
        message="An error occurred while loading your data."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست اشخاص</CardTitle>
      </CardHeader>
      <CardContent>
        {personsAll && personsAll.length > 0 ? (
          <PersonList persons={personsAll} />
        ) : (
          <p>شخصی پیدا نشد</p>
        )}
      </CardContent>
    </Card>
  );
}
