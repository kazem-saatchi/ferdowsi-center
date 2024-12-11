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

interface PersonSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function PersonSelect({ value, onChange, label }: PersonSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { personsAll, setPersonAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonAll: state.setPersonAll,
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

  const handleSelect = (person: Person) => {
    onChange(person.id);
    setOpen(false);
  };

  const selectedPerson = personsAll?.find((person) => person.id === value);

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-left font-normal"
      >
        {selectedPerson
          ? `${selectedPerson.firstName} ${selectedPerson.lastName} (${selectedPerson.IdNumber})`
          : `Select ${label}`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select {label}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search persons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 max-h-[300px] overflow-y-auto">
            {filteredPersons.map((person) => (
              <Button
                key={person.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(person)}
              >
                {person.firstName} {person.lastName} ({person.IdNumber})
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
