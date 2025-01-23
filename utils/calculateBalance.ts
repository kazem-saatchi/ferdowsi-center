import { db } from "@/lib/db";
import {
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
} from "@/schema/balanceSchema";
import { Charge, Payment } from "@prisma/client";

export interface ShopBalanceResponce {
  chargeList: Charge[];
  paymentList: Payment[];
  shopBalance: ShopBalanceData;
}

export interface PersonBalanceResponce {
  chargeList: Charge[];
  paymentList: Payment[];
  personBalance: PersonBalanceData;
}

export async function calculateShopBalance({
  plaque,
  shopId,
}: {
  shopId: string;
  plaque: number;
}): Promise<ShopBalanceResponce> {
  // Get Shop Charges List
  const chargeList = await db.charge.findMany({
    where: { shopId: shopId },
    orderBy: [{ date: "desc" }],
  });

  // Get Payment List
  const paymentList = await db.payment.findMany({
    where: { shopId: shopId },
    orderBy: { date: "desc" },
  });

  const totalCharge = chargeList.reduce(
    (total, charge) => total + charge.amount,
    0
  );

  const totalPayment = paymentList.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return {
    chargeList,
    paymentList,
    shopBalance: {
      plaque,
      shopId,
      totalCharge,
      totalPayment,
      balance: totalCharge - totalPayment,
    },
  };
}

export async function calculatePersonBalance({
  personId,
  personName,
}: {
  personId: string;
  personName: string;
}): Promise<PersonBalanceResponce> {
  // Get Shop Charges List
  const chargeList = await db.charge.findMany({
    where: { personId: personId },
    orderBy: [{ date: "desc" }],
  });

  // Get Payment List
  const paymentList = await db.payment.findMany({
    where: { personId: personId },
    orderBy: { date: "desc" },
  });

  const totalCharge = chargeList.reduce(
    (total, charge) => total + charge.amount,
    0
  );

  const totalPayment = paymentList.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return {
    chargeList,
    paymentList,
    personBalance: {
      personName,
      personId,
      totalCharge,
      totalPayment,
      balance: totalCharge - totalPayment,
    },
  };
}

export async function calculatePersonBalanceByShop({
  personId,
  personName,
  shopId,
  plaque,
}: {
  personId: string;
  personName: string;
  shopId: string;
  plaque: number;
}): Promise<PersonBalanceByShopData> {
  // Fetch charges and payments for the shop
  const [chargeList, paymentList] = await Promise.all([
    db.charge.findMany({
      where: { shopId, personId },
      orderBy: [{ date: "desc" }],
    }),
    db.payment.findMany({
      where: { shopId, personId },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalCharge = chargeList.reduce(
    (total, charge) => total + charge.amount,
    0
  );

  const totalPayment = paymentList.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return {
    plaque,
    shopId,
    personId,
    personName,
    totalCharge,
    totalPayment,
    balance: totalCharge - totalPayment,
  };
}
