"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Trash } from "lucide-react";
import { useDeletePerson } from "@/tanstack/mutation/personMutation";

function DeletePerson({id}:{id: string}) {
  //Tanstack Mutation
  const mutationDeletePerson = useDeletePerson();

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDelete = () => {
    setIsLoading(true);

    mutationDeletePerson.mutate(id, {
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };
  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Trash />}
    </Button>
  );
}

export default DeletePerson;
