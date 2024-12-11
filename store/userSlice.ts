import { StateCreator } from "zustand";
import { Person } from "@prisma/client";

type Persons = {
  personById: Person | null;
  setPersonById: (person: Person) => void;
  personsAll: Person[] | null;
  setPersonAll: (persons: Person[]) => void;
};

export type UserSlice = Persons;

export const createUserSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set) => ({
  // States
  personById: null,
  personsAll: null,

  // Set Utils
  setPersonById: (person) => set({ personById: person }),
  setPersonAll: (persons) => set({ personsAll: persons }),
});
