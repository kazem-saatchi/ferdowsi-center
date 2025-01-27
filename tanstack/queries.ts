"use client";

import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";
import findBalanceByPerson from "@/app/api/actions/balance/getPersonBalance";
import findBalanceByShop from "@/app/api/actions/balance/getShopBalance";
import findAllCharges from "@/app/api/actions/charge/getAllCharges";
import findAllChargesReference from "@/app/api/actions/reference/getAllChargesReference";
import findChargesByPerson from "@/app/api/actions/charge/getChargesByPerson";
import findChargesByShop from "@/app/api/actions/charge/getChargesByShop";
import findAllShopHistory from "@/app/api/actions/history/getAllHistory";
import findHistoryByPerson from "@/app/api/actions/history/getHistoryByPerson";
import findHistoryByShop from "@/app/api/actions/history/getHistoryByShop";
import findAllPayments from "@/app/api/actions/payment/getAllPayments";
import findPaymentsByPerson from "@/app/api/actions/payment/getAllPaymentsByPerson";
import findPaymentsByShop from "@/app/api/actions/payment/getAllPaymentsByShop";
import findPersonAll from "@/app/api/actions/person/findPersonAll";
import findPersonById from "@/app/api/actions/person/findPersonById";
import findPersonByShop from "@/app/api/actions/person/findPersonByShop";
import findAllShops from "@/app/api/actions/shop/allShops";
import findShopById from "@/app/api/actions/shop/findShopById";
import findAllShopsByPerson from "@/app/api/actions/user/findAllShopsByPerson";
import {
  GetChargeByPersonData,
  GetChargeByShopData,
} from "@/schema/chargeSchema";
import { verifyToken } from "@/utils/auth";
import { useQuery } from "@tanstack/react-query";
import allCosts from "@/app/api/actions/cost-income/allCosts";

//------------------PERSON--------------------

export function useFindPersonById(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => await findPersonById(id),
  });
}

export function useFindAllPersons() {
  return useQuery({
    queryKey: ["all-persons"],
    queryFn: async () => await findPersonAll(),
  });
}
export function usePersonsByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-persons", shopId],
    queryFn: async () => await findPersonByShop(shopId),
  });
}

//------------------SHOP--------------------

export function useFindAllShops() {
  return useQuery({
    queryKey: ["all-shops"],
    queryFn: async () => await findAllShops(),
  });
}

export function useFindShopById(id: string) {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: async () => await findShopById(id),
  });
}

//------------------CHARGE--------------------

export function useFindAllCharges() {
  return useQuery({
    queryKey: ["all-charges"],
    queryFn: async () => await findAllCharges(),
  });
}

export function useFindChargesByShop(data: GetChargeByShopData) {
  return useQuery({
    queryKey: ["shop-charges", data.shopId],
    queryFn: async () => await findChargesByShop({ shopId: data.shopId }),
  });
}

export function useFindChargesByPerson(data: GetChargeByPersonData) {
  return useQuery({
    queryKey: ["person-charges", data.personId],
    queryFn: async () => await findChargesByPerson({ personId: data.personId }),
  });
}

export function useFindAllChargesReference() {
  return useQuery({
    queryKey: ["all-charges-reference"],
    queryFn: async () => await findAllChargesReference(),
  });
}

//------------------HISTORY--------------------

export function useShopHistoryAll() {
  return useQuery({
    queryKey: ["all-histories"],
    queryFn: async () => await findAllShopHistory(),
  });
}

export function useShopHistoryByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-history", shopId],
    queryFn: async () => await findHistoryByShop(shopId),
  });
}

export function useShopHistoryByPerson(personId: string) {
  return useQuery({
    queryKey: ["person-history", personId],
    queryFn: async () => await findHistoryByPerson(personId),
  });
}

//------------------PAYMENT--------------------

export function useFindAllPayments() {
  return useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => await findAllPayments(),
  });
}

export function useFindPaymentsByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-payments", shopId],
    queryFn: async () => await findPaymentsByShop(shopId),
  });
}

export function useFindPaymentsByPerson(personId: string) {
  return useQuery({
    queryKey: ["person-payments", personId],
    queryFn: async () => await findPaymentsByPerson(personId),
  });
}

//------------------BALANCE--------------------

export function useGetAllShopsBalance() {
  return useQuery({
    queryKey: ["all-balances"],
    queryFn: async () => await findBalanceAllShops(),
  });
}

export function useGetShopBalance(shopId: string) {
  return useQuery({
    queryKey: ["shop-balance", shopId],
    queryFn: async () => await findBalanceByShop({ shopId }),
  });
}

export function useGetPersonBalance(personId: string) {
  return useQuery({
    queryKey: ["person-balance", personId],
    queryFn: async () => await findBalanceByPerson({ personId }),
  });
}

//------------------USER--------------------

export function useGetAllShopsByPerson() {
  return useQuery({
    queryKey: ["person-Shops"],
    queryFn: async () => await findAllShopsByPerson(),
  });
}

export function useGetUserInfo() {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async () => await verifyToken(),
  });
}

//------------------COST--------------------

// get all costs data
export function useGetAllCosts() {
  return useQuery({
    queryKey: ["all-costs"],
    queryFn: async () => await allCosts(),
  });
}
