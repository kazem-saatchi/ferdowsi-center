"use client";

import { UpdatePersonForm } from "@/components/person/UpdatePersonForm";
import { useFindPersonById } from "@/tanstack/queries";
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
        message="An error occurred while loading your data."
      />
    );
  }

  if (!data?.data || !data.data.person || !personById) {
    return (
      <ErrorComponent
        error={new Error("No data found")}
        retry={refetch}
        message="An error occurred while loading your data."
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
      <h1 className="text-3xl font-bold mb-8">Update Person</h1>
      <UpdatePersonForm initialData={initialData} />
    </div>
  );
}
