import addBankDataFromFile from "@/app/api/actions/import/addBankData";
import addKioskAction, { AddKioskResponse } from "@/app/api/actions/import/addKioskFromFile";
import addNetBankDataFromFile from "@/app/api/actions/import/addNetBankData";
import addPersonsShops, { AddPersonsShopsResponse } from "@/app/api/actions/import/addPersonsShopsFromFile";
import { BankTransactionData, NetBankTransactionData } from "@/components/upload-file/readFile";
import { AddKioskData, AddPersonsShopsData } from "@/schema/importSchema";
import { ActionResponse } from "@/utils/handleServerAction";
import { AccountType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";


//------------------IMPORT-EXPORT--------------------

// Add Persons and Shops from File
export function useAddPersonsShops() {
    const queryClient = useQueryClient();
  
    return useMutation<
      ActionResponse<AddPersonsShopsResponse>, // Type of the data returned by the mutationFn
      Error, // Type of error
      AddPersonsShopsData[] // Type of variables passed to mutate/mutateAsync
    >({
      mutationFn: async (data: AddPersonsShopsData[]) => {
        return await addPersonsShops(data);
      },
    });
  }
  
  // Add Kiosk from File
  export function useAddKiosks() {
    const queryClient = useQueryClient();
  
    return useMutation<
      ActionResponse<AddKioskResponse>, // Type of the data returned by the mutationFn
      Error, // Type of error
      AddKioskData[] // Type of variables passed to mutate/mutateAsync
    >({
      mutationFn: async (data: AddKioskData[]) => {
        return await addKioskAction(data);
      },
    });
  }
  
  // Add Bank Data
  export function useAddBankDataFromFile() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (params: {
        accountType: AccountType;
        bankAccountNumber: string;
        data: BankTransactionData[];
      }) => {
        return await addBankDataFromFile(
          params.accountType,
          params.bankAccountNumber,
          params.data
        );
      },
    });
  }
  
  export function useAddNetBankDataFromFile() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (params: {
        accountType: AccountType;
        bankAccountNumber: string;
        data: NetBankTransactionData[];
      }) => {
        return await addNetBankDataFromFile(
          params.accountType,
          params.bankAccountNumber,
          params.data
        );
      },
    });
  }