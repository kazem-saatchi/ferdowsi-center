"use server";

import { db } from "@/lib/db";
import {
  ChargePaymentData,
  PersonBalanceByShopData,
  ShopBalanceData,
} from "@/schema/balanceSchema";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { PersonInfoSafe } from "@/schema/personSchema";
import {
  calculatePersonBalanceByShop,
  calculateShopBalance,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge, Payment } from "@prisma/client";

interface FindBalanceResponse {
  owner?: PersonInfoSafe;
  renter?: PersonInfoSafe;
  /** Id of the *current* renter. Anything charged to anyone else — the owner or
   *  a previous renter — is the owner's responsibility, because unpaid charges
   *  follow the shop. */
  renterId?: string | null;
  success: boolean;
  message: string;
  charges?: Charge[];
  payments?: Payment[];
  shopBalance?: ShopBalanceData;
  personsBalance?: PersonBalanceByShopData[];
  ownerChargeList: ChargePaymentData[];
  ownerPaymentList: ChargePaymentData[];
  renterChargeList: ChargePaymentData[];
  renterPaymentList: ChargePaymentData[];
  /** Newest bank statement row in the database. Reports print it so the reader
   *  knows payments made after that date are not reflected yet. */
  lastBankTransactionDate?: Date;
}

async function getAllBalance(
  data: GetChargeByShopData,
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // Extract ShopId
  const { shopId } = data;

  //-------------Shop-Total-Balance-Block-------------

  // Get Shop
  const shop = await db.shop.findUnique({ where: { id: shopId } });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Check authentication
  if (
    shop.ownerId !== user.id &&
    shop.renterId !== user.id &&
    user.role !== "ADMIN"
  ) {
    throw new Error(errorMSG.unauthorized);
  }

  const owner: PersonInfoSafe | null = await db.person.findUnique({
    where: { id: shop.ownerId },
    select: { firstName: true, lastName: true, phoneOne: true },
  });
  let renter: PersonInfoSafe | null = null;
  if (shop.renterId) {
    renter = await db.person.findUnique({
      where: { id: shop.renterId },
      select: { firstName: true, lastName: true, phoneOne: true },
    });
  }

  // Calculate shop balance from utils
  const { chargeList, paymentList, shopBalance } = await calculateShopBalance({
    shopId,
    plaque: shop.plaque,
  });

  //-------------Shop-Owner-Renter-Balance-Block-------------

  let ownerChargeList: ChargePaymentData[] = [];
  let ownerPaymentList: ChargePaymentData[] = [];
  let renterChargeList: ChargePaymentData[] = [];
  let renterPaymentList: ChargePaymentData[] = [];

  if (shop.renterId) {
    renterChargeList = chargeList
      .filter((charge) => charge.personId === shop.renterId)
      .map((charge) => {
        return {
          id: charge.id,
          amount: charge.amount,
          title: charge.title,
          date: charge.date,
          proprietor: charge.proprietor,
        };
      });
    renterPaymentList = paymentList
      .filter((payment) => payment.personId === shop.renterId)
      .map((payment) => {
        return {
          id: payment.id,
          amount: payment.amount,
          title: "",
          date: payment.date,
          proprietor: payment.proprietor,
          bankTransactionId: payment.bankTransactionId ?? undefined,
        };
      });
  }
  ownerChargeList = chargeList
    .filter((charge) => charge.personId !== shop.renterId)
    .map((charge) => {
      return {
        id: charge.id,
        amount: charge.amount,
        title: charge.title,
        date: charge.date,
        proprietor: charge.proprietor,
      };
    });
  ownerPaymentList = paymentList
    .filter((payment) => payment.personId !== shop.renterId)
    .map((payment) => {
      return {
        id: payment.id,
        amount: payment.amount,
        title: "",
        date: payment.date,
        proprietor: payment.proprietor,
        bankTransactionId: payment.bankTransactionId ?? undefined,
      };
    });

  //-------------Shop-Persons-Balance-Block-------------

  const uniquePersonIds = await db.charge.findMany({
    where: { shopId }, // Filter charges for the specific shop
    select: { personId: true, personName: true }, // Select only the personId and personName field
    distinct: ["personId"], // Ensure personId is unique
  });

  const personsBalance: PersonBalanceByShopData[] = await Promise.all(
    uniquePersonIds.map(async (person) => {
      // calculate person balance from the shop
      return await calculatePersonBalanceByShop({
        personId: person.personId,
        personName: person.personName,
        shopId,
        plaque: shop.plaque,
      });
    })
  );

  //-------------Last-Imported-Bank-Statement-Block-------------

  const lastBankTransaction = await db.bankTransaction.aggregate({
    _max: { date: true },
  });

  return {
    owner: owner ? owner : undefined,
    renter: renter ? renter : undefined,
    renterId: shop.renterId,
    success: true,
    message: successMSG.balancesFound,
    lastBankTransactionDate: lastBankTransaction._max.date ?? undefined,
    charges: chargeList,
    payments: paymentList,
    shopBalance,
    personsBalance,
    ownerChargeList,
    ownerPaymentList,
    renterChargeList,
    renterPaymentList,
  };
}

export default async function findBalanceByShop(data: GetChargeByShopData) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllBalance(data, user)
  );
}
