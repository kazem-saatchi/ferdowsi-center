import { create } from "zustand";
import {immer} from 'zustand/middleware/immer'
import { createUserSlice, UserSlice } from "./userSlice";

 // Store Type
export type StoreType = UserSlice;


// Store Main State
export const useStore = create<StoreType>()(immer((...a) => ({
  ...createUserSlice(...a),
})));
