import { StateCreator } from "zustand";
import type { SafePerson } from "@/schema/personSchema";
import { PersonBalancesResponse } from "@/app/api/actions/user/findAllShopsByPerson";

type Persons = {
  userInfo: SafePerson | null;
  setUserInfo: (person: SafePerson) => void;
  personById: SafePerson | null;
  setPersonById: (person: SafePerson) => void;
  personsAll: SafePerson[] | null;
  setPersonAll: (persons: SafePerson[]) => void;
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
