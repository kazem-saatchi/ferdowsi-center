"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Person } from "@prisma/client";
import { PersonSearchForm } from "@/components/person/PersonSearchForm";
import { PersonList } from "@/components/person/PersonList";
import findPersonByFilter from "@/app/api/actions/person/findPersonByFilter";
import { Separator } from "@/components/ui/separator";

export default function SearchPersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (filters: any) => {
    setIsLoading(true);
    try {
      const result = await findPersonByFilter(filters);
      console.log("find person", result);
      if (result.success && result.data?.persons) {
        setPersons(result.data.persons);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during search"
      );
      setPersons([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col">
        <PersonSearchForm onSearch={handleSearch} />
        <div className="mt-4">
          {isLoading && <p className="text-center">در حال بارگذاری...</p>}
          {!isLoading && persons.length > 0 && (
            <>
              <Separator />
              <PersonList persons={persons} />
            </>
          )}
          {!isLoading && persons.length === 0 && (
            <p className="text-center">شخصی یافت نشد</p>
          )}
        </div>
      </div>
    </div>
  );
}
