"use server";

import { db } from "@/lib/db";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge, Payment } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
  payments?: Payment[];
  shopBalance?: ShopBalance;
  personsBalance?: PersonBalance[];
}

interface ShopBalance {
  plaque: number;
  totalCharge: number;
  totalPayment: number;
}

interface PersonBalance {
  personId: string;
  personName: string;
  totalCharge: number;
  totalPayment: number;
}

async function getAllBalance(
  data: GetChargeByShopData,
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
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

  //-------------Shop-Persons-Balance-Block-------------

  const uniquePersonIds = await db.charge.findMany({
    where: { shopId }, // Filter charges for the specific shop
    select: { personId: true, personName: true }, // Select only the personId and personName field
    distinct: ["personId"], // Ensure personId is unique
  });

  const personsBalance: PersonBalance[] = await Promise.all(
    uniquePersonIds.map(async (person) => {
      // Fetch charges and payments for the shop
      const [chargeList, paymentList] = await Promise.all([
        db.charge.findMany({
          where: { shopId: shop.id, personId: person.personId },
          orderBy: [{ date: "desc" }],
        }),
        db.payment.findMany({
          where: { shopId: shop.id, personId: person.personId },
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
        personId: person.personId,
        personName: person.personName,
        totalCharge,
        totalPayment,
      };
    })
  );

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
    payments: paymentList,
    shopBalance: { plaque: shop?.plaque, totalCharge, totalPayment },
  };
}

export default async function findBalanceByShop(data: GetChargeByShopData) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllBalance(data, user)
  );
}
