import { db } from "@/lib/db";
import {
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
  ShopsBalanceData,
} from "@/schema/balanceSchema";
import { Charge, Payment, ShopType } from "@prisma/client";

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

// DEPRECATED: This function is no longer used.
// Calculations have been moved to client-side.
// See: app/(routes)/admin/(balance)/all-shops-monthly-balance/page.tsx
// and utils/calculateBalanceClient.ts
export async function calculateAllShopMonthlyBalance(
  proprietor: boolean,
  skip?: number,
  take?: number
): Promise<{ results: ShopsBalanceData[]; totalCount: number }> {
  const BATCH_SIZE = 10;

  // only claculate monthly charge for store, office, kiosk
  // only claculate yearly charge for store, office
  const shopType: ShopType[] = proprietor
    ? ["STORE", "OFFICE"]
    : ["STORE", "OFFICE", "KIOSK"];

  const whereClause = { type: { in: shopType } };

  // Get total count of shops
  const totalCount = await db.shop.count({
    where: whereClause,
  });

  // Fetch shops with pagination if skip/take provided
  const queryOptions: any = {
    where: whereClause,
    orderBy: { plaque: "asc" },
  };

  if (skip !== undefined) {
    queryOptions.skip = skip;
  }

  if (take !== undefined) {
    queryOptions.take = take;
  }

  const allShops = await db.shop.findMany(queryOptions);
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
  }

  return { results, totalCount };
}

export async function calculateAllRentsBalance(): Promise<ShopsBalanceData[]> {
  // BOARD (تابلو) and PARKING are rented out by the building management and are
  // billed only as rent, so they get their own list. KIOSK is deliberately not
  // here: it carries a monthly charge as well as rent, so it stays in the
  // all-shops views until that split is designed.
  const shopType: ShopType[] = ["BOARD", "PARKING"];

  // Three aggregate queries for every unit rather than two per unit. On these
  // types `proprietor` marks rent owed by the occupant, not a مالکانه levy.
  const [shops, chargeSums, paymentSums] = await Promise.all([
    db.shop.findMany({
      where: { type: { in: shopType } },
      orderBy: { plaque: "asc" },
      select: { id: true, plaque: true, ownerName: true, renterName: true },
    }),
    db.charge.groupBy({
      by: ["shopId"],
      where: { proprietor: true, shop: { type: { in: shopType } } },
      _sum: { amount: true },
    }),
    db.payment.groupBy({
      by: ["shopId"],
      where: { proprietor: true, shop: { type: { in: shopType } } },
      _sum: { amount: true },
    }),
  ]);

  const charged = new Map(
    chargeSums.map((row) => [row.shopId, row._sum.amount ?? 0])
  );
  const paid = new Map(
    paymentSums.map((row) => [row.shopId, row._sum.amount ?? 0])
  );

  return shops.map((shop) => ({
    plaque: shop.plaque,
    balance: (paid.get(shop.id) ?? 0) - (charged.get(shop.id) ?? 0),
    ownerName: shop.ownerName,
    renterName: shop.renterName,
  }));
}
