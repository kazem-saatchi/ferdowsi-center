import { StateCreator } from "zustand";
import { Person } from "@prisma/client";
import { PersonBalancesResponse } from "@/app/api/actions/user/findAllShopsByPerson";

type Persons = {
  userInfo: Person | null;
  setUserInfo: (person: Person) => void;
  personById: Person | null;
  setPersonById: (person: Person) => void;
  personsAll: Person[] | null;
  setPersonAll: (persons: Person[]) => void;
  personShopsBalance: PersonBalancesResponse | null;
  setPersonShopsBalance: (data: PersonBalancesResponse) => void;
};

export type UserSlice = Persons;

export const createUserSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set) => ({
  // States
  userInfo: null,
  personById: null,
  personsAll: null,
  personShopsBalance: null,

  // Set Utils
  setUserInfo: (person) => set({ userInfo: person }),
  setPersonById: (person) => set({ personById: person }),
  setPersonAll: (persons) => set({ personsAll: persons }),
  setPersonShopsBalance: (data) => set({ personShopsBalance: data }),
});
