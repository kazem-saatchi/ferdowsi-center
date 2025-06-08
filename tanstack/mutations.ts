"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  AddPersonData,
  UpdatePersonData,
  UpdatePersonPasswordData,
  UpdatePersonRoleData,
} from "@/schema/personSchema";
import addPerson from "@/app/api/actions/person/addPerson";
import { toast } from "sonner";
import updatePersonInfo from "@/app/api/actions/person/updatePerson";
import deletePersonById from "@/app/api/actions/person/deletePerson";
import {
  AddShopData,
  AddShopHistoryData,
  EndShopRenterData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";
import addShop from "@/app/api/actions/shop/addShop";
import updateShopInfo from "@/app/api/actions/shop/updateShopInfo";
import addShopHistory from "@/app/api/actions/history/addShopHistory";
import updateShopOwnerId from "@/app/api/actions/shop/updateShopOwner";
import updateShopRenterId from "@/app/api/actions/shop/updateShopRenter";
import endShopRenterId from "@/app/api/actions/shop/endShopRenter";
import updateShopStatus from "@/app/api/actions/shop/updateShopStatus";
import {
  AddChargeAllShopsData,
  AddChargeByAmountData,
  AddChargeByShopData,
  ShopAnnualChargeReferenceData,
  ShopChargeReferenceData,
} from "@/schema/chargeSchema";
import addChargeByShop from "@/app/api/actions/charge/addChargeByShop";
import addChargeToAllShops from "@/app/api/actions/charge/addChargeToAllShops";
import generateShopChargeReferenceList from "@/app/api/actions/reference/shopChargeReference";
import {
  addPaymentByBankIdData,
  AddPaymentByInfoData,
} from "@/schema/paymentSchema";
import addPaymentByInfo from "@/app/api/actions/payment/addPayment";
import deletePaymentById from "@/app/api/actions/payment/deletePayment";
import addChargeByAmount from "@/app/api/actions/charge/addChargeByAmount";
import updatePersonRole from "@/app/api/actions/person/updatePersonRule";
import generateAnnualShopChargeReferenceList from "@/app/api/actions/reference/shopAnnualChargeReference";
import {
  AddCostData,
  AddCostFromBankData,
  AddIncomeData,
} from "@/schema/cost-IncomeSchema";
import addCost from "@/app/api/actions/cost-income/addCost";
import addPersonsFromFile from "@/app/api/actions/person/addPersonsFromFile";
import addIncome from "@/app/api/actions/cost-income/addIncome";
import addPersonsShops from "@/app/api/actions/import/addPersonsShopsFromFile";
import { AddKioskData, AddPersonsShopsData } from "@/schema/importSchema";
import { ActionResponse } from "@/utils/handleServerAction";
import updateUserPassword from "@/app/api/actions/user/updatePersonPassword";
import { AddPersonsShopsResponse } from "@/app/api/actions/import/addPersonsShopsFromFile";
import addKioskAction, {
  AddKioskResponse,
} from "@/app/api/actions/import/addKioskFromFile";
import addBankDataFromFile, {
  AddBankDataResponse,
} from "@/app/api/actions/import/addBankData";
import {
  BankTransactionData,
  NetBankTransactionData,
} from "@/components/upload-file/readFile";
import addPaymentFromCard from "@/app/api/actions/payment/addPaymentFromCard";
import setRegisterAbleAction from "@/app/api/actions/bank/setRegisterAbleAction";
import addPaymentByBankId from "@/app/api/actions/payment/addPaymentByBankId";
import { AccountType } from "@prisma/client";
import addNetBankDataFromFile from "@/app/api/actions/import/addNetBankData";
import addCostFromBank from "@/app/api/actions/cost-income/addCostFromBank";

// //------------------PERSON--------------------

// // Add Person
// export function useAddPerson() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddPersonData) => await addPerson(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-persons"] });
//         queryClient.refetchQueries({ queryKey: ["all-persons"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Add Persons From File
// export function useAddPersonsFromFile() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: any) => await addPersonsFromFile(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-persons"] });
//         queryClient.refetchQueries({ queryKey: ["all-persons"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Update Person
// export function useUpatePerson() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdatePersonData) => await updatePersonInfo(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         console.log("personId", data.data?.personId);
//         queryClient.invalidateQueries({
//           queryKey: ["person", data.data?.personId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person", data.data?.personId],
//         });

//         queryClient.invalidateQueries({
//           queryKey: ["all-persons"],
//         });

//         queryClient.refetchQueries({
//           queryKey: ["all-persons"],
//         });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Update Person Role
// export function useUpatePersonRole() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdatePersonRoleData) =>
//       await updatePersonRole(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({
//           queryKey: ["person", variables.userId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person", variables.userId],
//         });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Delete Person
// export function useDeletePerson() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (id: string) => await deletePersonById(id),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-persons"] });
//         queryClient.refetchQueries({ queryKey: ["all-persons"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Update User Password
// export function useUpdatePassword() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdatePersonPasswordData) =>
//       await updateUserPassword(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// //------------------SHOP--------------------

// // Add Shop
// export function useAddShop() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddShopData) => await addShop(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Update Shop Info
// export function useUpateShopInfo() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdateShopInfoData) => await updateShopInfo(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });
//         queryClient.invalidateQueries({ queryKey: ["shop", variables.id] });
//         queryClient.refetchQueries({ queryKey: ["shop", variables.id] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // update shop owner
// export function useUpdateShopOwner() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdateShopOwnerData) =>
//       await updateShopOwnerId(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });

//         queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
//         queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // update shop renter
// export function useUpdateShopRenter() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdateShopRenterData) =>
//       await updateShopRenterId(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });

//         queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
//         queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // remove shop renter
// export function useEndShopRenter() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: EndShopRenterData) => await endShopRenterId(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });

//         queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
//         queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // activate/inactivate shop
// export function useUpdateShopStatus() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: UpdateShopStatusData) =>
//       await updateShopStatus(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
//         queryClient.refetchQueries({ queryKey: ["all-shops"] });

//         queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
//         queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// //------------------HISTORY--------------------

// // add history
// export function useAddShopHistory() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (historyData: AddShopHistoryData) =>
//       await addShopHistory(historyData),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-histories"] });
//         queryClient.refetchQueries({ queryKey: ["all-histories"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-history", variables.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-history", variables.shopId],
//         });

//         queryClient.invalidateQueries({
//           queryKey: ["person-history", variables.personId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person-history", variables.personId],
//         });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// //------------------CHARGE--------------------

// // add monthly charge to a shop
// export function useAddChargeByShop() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddChargeByShopData) =>
//       await addChargeByShop(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-charges"] });
//         queryClient.refetchQueries({ queryKey: ["all-charges"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-charges", variables.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-charges", variables.shopId],
//         });

//         // i can't refetch person-charges related to this add charge so invalidate all person
//         queryClient.invalidateQueries({ queryKey: ["person-charges"] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // add charge by amount and id
// export function useAddChargeByAmount() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddChargeByAmount) =>
//       await addChargeByAmount(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-charges"] });
//         queryClient.refetchQueries({ queryKey: ["all-charges"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-charges", variables.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-charges", variables.shopId],
//         });

//         // i can't refetch person-charges related to this add charge so invalidate all person
//         queryClient.invalidateQueries({ queryKey: ["person-charges"] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // add charge to all shop
// export function useAddChargeAllShop() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddChargeAllShopsData) =>
//       await addChargeToAllShops(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         // Invalidate queries related to all charges
//         queryClient.invalidateQueries({ queryKey: ["all-charges"] });

//         // Dynamically invalidate all shop-related charges
//         queryClient.invalidateQueries({ queryKey: ["shop-charges"] });

//         // Dynamically invalidate all person-related charges
//         queryClient.invalidateQueries({ queryKey: ["person-charges"] });

//         // refetch all charges list
//         queryClient.refetchQueries({ queryKey: ["all-charges"] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // generate charge reference Monthly
// export function useCreateChargeReference() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: ShopChargeReferenceData) =>
//       await generateShopChargeReferenceList(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-charges-reference"] });
//         queryClient.refetchQueries({ queryKey: ["all-charges-reference"] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // generate charge reference Yearly
// export function useCreateAnnualChargeReference() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: ShopAnnualChargeReferenceData) =>
//       await generateAnnualShopChargeReferenceList(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-charges-reference"] });
//         queryClient.refetchQueries({ queryKey: ["all-charges-reference"] });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// //------------------PAYMENT--------------------

// // add payment to a shop
// export function useAddPaymentByShop() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddPaymentByInfoData) =>
//       await addPaymentByInfo(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-payments"] });
//         queryClient.refetchQueries({ queryKey: ["all-payments"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-payments", variables.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-payments", variables.shopId],
//         });

//         queryClient.invalidateQueries({
//           queryKey: ["person-payments", variables.personId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person-payments", variables.personId],
//         });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // add payment to a shop by Bank TransactionId
// export function useAddPaymentByBank() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: addPaymentByBankIdData) =>
//       await addPaymentByBankId(data),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-payments"] });
//         queryClient.refetchQueries({ queryKey: ["all-payments"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-payments", variables.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-payments", variables.shopId],
//         });

//         queryClient.invalidateQueries({
//           queryKey: ["person-payments", variables.personId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person-payments", variables.personId],
//         });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // delete a payment
// export function useDeletePaymentById() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (paymentId: string) => await deletePaymentById(paymentId),
//     onSuccess: (data, variables) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-payments"] });
//         queryClient.refetchQueries({ queryKey: ["all-payments"] });

//         queryClient.invalidateQueries({
//           queryKey: ["shop-payments", data?.data?.shopId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["shop-payments", data?.data?.shopId],
//         });

//         queryClient.invalidateQueries({
//           queryKey: ["person-payments", data?.data?.personId],
//         });
//         queryClient.refetchQueries({
//           queryKey: ["person-payments", data?.data?.personId],
//         });

//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

//------------------COST-INCOME--------------------

// // add cost
// export function useAddCost() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddCostData) => await addCost(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-costs"] });
//         queryClient.refetchQueries({ queryKey: ["all-costs"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // Add Cost From Bank Transactions
// export function useAddCostFromBank() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddCostFromBankData) =>
//       await addCostFromBank(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-costs"] });
//         queryClient.refetchQueries({ queryKey: ["all-costs"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// // add income
// export function useAddIncome() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: AddIncomeData) => await addIncome(data),
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ["all-incomes"] });
//         queryClient.refetchQueries({ queryKey: ["all-incomes"] });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// //------------------IMPORT-EXPORT--------------------

// // Add Persons and Shops from File
// // export function useAddPersonsShops() {
// //   const queryClient = useQueryClient();
// //   const router = useRouter();

// //   return useMutation({
// //     mutationFn: async (data: AddPersonsShopsData[]) =>
// //       await addPersonsShops(data),
// //     onSuccess: (data) => {
// //       if (data.success) {
// //         queryClient.invalidateQueries({ queryKey: ["all-persons"] });
// //         queryClient.refetchQueries({ queryKey: ["all-persons"] });

// //         queryClient.invalidateQueries({ queryKey: ["all-shops"] });
// //         queryClient.refetchQueries({ queryKey: ["all-shops"] });

// //         queryClient.invalidateQueries({ queryKey: ["all-histories"] });
// //         queryClient.refetchQueries({ queryKey: ["all-histories"] });
// //         toast.success(data.data?.message);
// //       } else {
// //         toast.error(data.data?.message || data.message);
// //       }
// //     },
// //     onError: (error) => {
// //       toast.error(error.message);
// //     },
// //   });
// // }

// // Add Persons and Shops from File
// export function useAddPersonsShops() {
//   const queryClient = useQueryClient();

//   return useMutation<
//     ActionResponse<AddPersonsShopsResponse>, // Type of the data returned by the mutationFn
//     Error, // Type of error
//     AddPersonsShopsData[] // Type of variables passed to mutate/mutateAsync
//   >({
//     mutationFn: async (data: AddPersonsShopsData[]) => {
//       return await addPersonsShops(data);
//     },
//   });
// }

// // Add Kiosk from File
// export function useAddKiosks() {
//   const queryClient = useQueryClient();

//   return useMutation<
//     ActionResponse<AddKioskResponse>, // Type of the data returned by the mutationFn
//     Error, // Type of error
//     AddKioskData[] // Type of variables passed to mutate/mutateAsync
//   >({
//     mutationFn: async (data: AddKioskData[]) => {
//       return await addKioskAction(data);
//     },
//   });
// }

// // Add Bank Data
// export function useAddBankDataFromFile() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (params: {
//       accountType: AccountType;
//       bankAccountNumber: string;
//       data: BankTransactionData[];
//     }) => {
//       return await addBankDataFromFile(
//         params.accountType,
//         params.bankAccountNumber,
//         params.data
//       );
//     },
//   });
// }

// export function useAddNetBankDataFromFile() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (params: {
//       accountType: AccountType;
//       bankAccountNumber: string;
//       data: NetBankTransactionData[];
//     }) => {
//       return await addNetBankDataFromFile(
//         params.accountType,
//         params.bankAccountNumber,
//         params.data
//       );
//     },
//   });
// }

// export function useAddPaymentFromCard() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => await addPaymentFromCard(id),
//     onSuccess: (data) => {
//       if (data.data?.success) {
//         // queryClient.invalidateQueries({
//         //   queryKey: ["cardTransfer"],
//         //   refetchType: "active",
//         // });
//         // queryClient.refetchQueries({
//         //   queryKey: ["cardTransfer"],
//         //   refetchType: "active",
//         // });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }

// set a Transaction as Registerable

// export function useSetRegisterAble() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => await setRegisterAbleAction(id),
//     onSuccess: (data) => {
//       if (data.data?.success) {
//         // queryClient.invalidateQueries({
//         //   queryKey: ["cardTransfer"],
//         //   refetchType: "active",
//         // });
//         // queryClient.refetchQueries({
//         //   queryKey: ["cardTransfer"],
//         //   refetchType: "active",
//         // });
//         toast.success(data.data?.message);
//       } else {
//         toast.error(data.data?.message || data.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// }
