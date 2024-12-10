"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Person } from "@prisma/client";
import { PersonSearchForm } from "@/components/person/PersonSearchForm";
import { PersonList } from "@/components/person/PersonList";
import findPersonByFilter from "@/app/api/actions/person/findPersonByFilter";

export default function SearchPersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (filters: any) => {
    setIsLoading(true);
    try {
      const result = await findPersonByFilter(filters);
      console.log("find person",result);
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Search Persons</h1>
      <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
        <PersonSearchForm onSearch={handleSearch} />
        <div>
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : persons.length > 0 ? (
            <PersonList persons={persons} />
          ) : (
            <p className="text-center">
              No persons found. Try adjusting your search criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
