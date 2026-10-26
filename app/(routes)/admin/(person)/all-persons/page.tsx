"use client";
import { labels } from "@/utils/label";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { PersonList } from "@/components/person/PersonList";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import EmptyState from "@/components/EmptyState";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";
import type { SafePerson } from "@/schema/personSchema";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: labels.all },
  { value: "active", label: labels.active },
  { value: "inactive", label: labels.inactive },
];

/** Every person, with the search that used to live on its own page: name,
 *  national ID and both phone numbers, in any digit script. */
export default function AllPersonsPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllPersons();
  const [status, setStatus] = useState<StatusFilter>("all");

  const list = useClientList<SafePerson>(
    data?.data?.persons,
    (person) => [
      person.firstName,
      person.lastName,
      person.IdNumber,
      person.phoneOne,
      person.phoneTwo,
    ],
    (person) =>
      status === "all" || person.isActive === (status === "active")
  );

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError || !data?.data?.persons) {
    return (
      <ErrorComponent
        error={(error as Error) ?? new Error(labels.noDataFound)}
        retry={refetch}
        message={labels.somethingWentWrong}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>{labels.allPersonsList}</CardTitle>
        <ListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder={labels.searchPersonsPlaceholder}
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          matchCount={list.matchCount}
        >
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={labels.status}
          >
            {STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? "default" : "outline"}
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  list.resetPage();
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </ListToolbar>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {list.pageItems.length > 0 ? (
          <>
            <PersonList persons={list.pageItems} />
            <Pager
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        ) : (
          <EmptyState message={labels.personsNotFound} />
        )}
      </CardContent>
    </Card>
  );
}
