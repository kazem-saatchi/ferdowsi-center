"use server";

import { RawTransactionShopData } from "@/schema/balanceSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import { db } from "@/lib/db";

interface FindRawTransactionResponse {
  success: boolean;
  message: string;
  shopsData?: RawTransactionShopData[];
  totalCount?: number;
}

async function getAllShopsRawTransactionData(
  user: Person,
  skip: number = 0,
  take: number = 10
): Promise<FindRawTransactionResponse> {
  // Check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  // only calculate for store, office, kiosk
  const shopType = ["STORE", "OFFICE", "KIOSK"];

  // Get total count of shops
  const totalCount = await db.shop.count({
    where: { type: { in: shopType as any } },
  });

  // Fetch shops with pagination
  const shops = await db.shop.findMany({
    where: { type: { in: shopType as any } },
    orderBy: { plaque: "asc" },
    skip,
    take,
  });

  const results: RawTransactionShopData[] = [];

  // Fetch raw transaction data for paginated shops
  const shopsData = await db.$transaction(
    async (tx) => {
      return Promise.all(
        shops.map(async (shop) => {
          // Get all charges for this shop (without aggregation)
          const charges = await tx.charge.findMany({
            where: { shopId: shop.id },
            select: {
              amount: true,
              personId: true,
              proprietor: true,
            },
          });

          // Get all payments for this shop (without aggregation)
          const payments = await tx.payment.findMany({
            where: { shopId: shop.id },
            select: {
              amount: true,
              personId: true,
              proprietor: true,
            },
          });

          return {
            shopId: shop.id,
            plaque: shop.plaque,
            ownerName: shop.ownerName,
            renterName: shop.renterName,
            ownerId: shop.ownerId,
            renterId: shop.renterId,
            type: shop.type,
            charges,
            payments,
          };
        })
      );
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );

  results.push(...shopsData);

  console.log(
    `Raw transaction data fetched: ${results.length} shops (skip: ${skip}, take: ${take}), total count: ${totalCount}`
  );

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsData: results,
    totalCount,
  };
}

export default async function findBalanceAllShops(
  propreitor: boolean,
  skip?: number,
  take?: number
) {
  return handleServerAction<FindRawTransactionResponse>((user) =>
    getAllShopsRawTransactionData(user, skip ?? 0, take ?? 10)
  );
}
