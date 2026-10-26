"use client";
import { labels } from "@/utils/label";

import { UpdatePersonForm } from "@/components/person/UpdatePersonForm";
import { useFindPersonById } from "@/tanstack/query/personQuery";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

interface UpdatePersonPageProps {
  params: { idNumber: string };
}

export default function UpdatePersonPage({ params }: UpdatePersonPageProps) {
  const { data, error, isError, isLoading, refetch } = useFindPersonById(
    params.idNumber
  );

  const { personById, setPersonById } = useStore(
    useShallow((state) => ({
      personById: state.personById,
      setPersonById: state.setPersonById,
    }))
  );

  useEffect(() => {
    if (!!data?.data && data.data.person !== undefined) {
      setPersonById(data.data.person);
    }
  }, [data, isLoading]);

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

  if (!data?.data || !data.data.person || !personById) {
    return (
      <ErrorComponent
        error={new Error(labels.noDataFound)}
        retry={refetch}
        message={labels.somethingWentWrong}
      />
    );
  }

  const initialData = {
    id: personById.id,
    IdNumber: personById.IdNumber,
    firstName: personById.firstName,
    lastName: personById.lastName,
    phoneOne: personById.phoneOne,
    phoneTwo: personById.phoneTwo || null,
    isActive: personById.isActive,
  };

  return (
    <div className="container mx-auto py-8">
      <UpdatePersonForm initialData={initialData} />
    </div>
  );
}
