import { db } from "@/lib/db";
import {
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
  ShopsBalanceData,
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

//-------------Calculate-Shop-Balance-------------

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

  const totalChargeMonthly = chargeList
    .filter((charge) => !charge.proprietor)
    .reduce((total, charge) => total + charge.amount, 0);

  const totalChargeYearly = chargeList
    .filter((charge) => charge.proprietor)
    .reduce((total, charge) => total + charge.amount, 0);

  const totalPaymentMonthly = paymentList
    .filter((payment) => !payment.proprietor)
    .reduce((total, payment) => total + payment.amount, 0);

  const totalPaymentYearly = paymentList
    .filter((payment) => payment.proprietor)
    .reduce((total, payment) => total + payment.amount, 0);

  return {
    chargeList,
    paymentList,
    shopBalance: {
      plaque,
      shopId,
      totalCharge,
      totalPayment,
      balance: totalCharge - totalPayment,
      totalChargeMonthly,
      totalChargeYearly,
      totalPaymentMonthly,
      totalPaymentYearly,
    },
  };
}

//-------------Calculate-Person-Balance-------------

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

// More efficient version using transaction
export async function calculateAllShopMonthlyBalance(
  proprietor: boolean
): Promise<ShopsBalanceData[]> {
  const BATCH_SIZE = 10;
  const allShops = await db.shop.findMany();
  const results: ShopsBalanceData[] = [];

  for (let i = 0; i < allShops.length; i += BATCH_SIZE) {
    const batch = allShops.slice(i, i + BATCH_SIZE);

    const batchResults = await db.$transaction(
      async (tx) => {
        return Promise.all(
          batch.map(async (shop) => {
            const [charges, payments] = await Promise.all([
              tx.charge.aggregate({
                where: { shopId: shop.id, proprietor },
                _sum: { amount: true },
              }),
              tx.payment.aggregate({
                where: { shopId: shop.id, proprietor },
                _sum: { amount: true },
              }),
            ]);

            return {
              plaque: shop.plaque,
              balance: (payments._sum.amount || 0) - (charges._sum.amount || 0),
              ownerName: shop.ownerName,
              renterName: shop.renterName,
            };
          })
        );
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    results.push(...batchResults);
    console.log(
      `Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
        allShops.length / BATCH_SIZE
      )}`
    );
  }

  return results;
}
