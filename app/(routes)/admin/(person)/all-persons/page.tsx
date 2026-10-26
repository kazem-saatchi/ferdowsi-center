"use client";
import { labels } from "@/utils/label";

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
        message={labels.somethingWentWrong}
      />
    );
  }

  if (!data?.data || !data.data.persons) {
    return (
      <ErrorComponent
        error={new Error(labels.noDataFound)}
        retry={refetch}
        message={labels.somethingWentWrong}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست اشخاص</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {personsAll && personsAll.length > 0 ? (
          <PersonList persons={personsAll} />
        ) : (
          <p>شخصی پیدا نشد</p>
        )}
      </CardContent>
    </Card>
  );
}
