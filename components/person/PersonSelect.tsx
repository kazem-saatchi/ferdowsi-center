"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Person } from "@prisma/client";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/store";
import { labels } from "@/utils/label";

interface PersonSelectProps {
  property: string;
  label: string;
}

export function PersonSelect({ label, property }: PersonSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { personsAll, newShop, setNewShop } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setNewShop: state.setNewShop,
      newShop: state.newShop,
    }))
  );

  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);

  useEffect(() => {
    if (personsAll) {
      setFilteredPersons(
        personsAll.filter(
          (person) =>
            person.firstName.toLowerCase().includes(search.toLowerCase()) ||
            person.lastName.toLowerCase().includes(search.toLowerCase()) ||
            person.IdNumber.includes(search)
        )
      );
    }
  }, [search, personsAll]);

  const selectedPerson = personsAll?.find(
    (person) =>
      (person.id === newShop[property as "ownerId" | "renterId"] &&
        newShop[property as "ownerId" | "renterId"]) ||
      undefined
  );

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-left font-normal"
        type="button"
      >
        {selectedPerson
          ? `${selectedPerson.firstName} ${selectedPerson.lastName} (${selectedPerson.IdNumber})`
          : `Select ${label}`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{labels.select} {label}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={labels.searchPersonPlaceHolder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {filteredPersons.map((person) => (
              <div
                key={person.id}
                // variant="ghost"
                className=" justify-start p-2 m-2 border rounded-md cursor-pointer"
                onClick={() => {
                  setNewShop(property, person.id);
                  setOpen(false);
                }}
                // type="button"
              >
                {person.firstName} {person.lastName} ({person.IdNumber})
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
