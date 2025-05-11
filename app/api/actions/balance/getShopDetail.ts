"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { Person, Shop } from "@prisma/client";

interface FindResponse {
  success: boolean;
  shop?: Shop;
  payments?: PaymentDetail[];
  charges?: ChargeDetail[];
}

interface PaymentDetail {
  id: string;
  amount: number;
  date: Date;
  description: string;
  personName: string;
  proprietor: boolean;
  bankTransactionId: string | null;
  title: string;
}

interface ChargeDetail {
  id: string;
  amount: number;
  date: Date;
  description: string;
  personName: string;
  proprietor: boolean;
  title: string;
}

async function getShopBalance(
  shopId: string,
  user: Person
): Promise<FindResponse> {
  // Get Shop
  const shop = await db.shop.findUnique({ where: { id: shopId } });

  if (!shop) {
    return {
      success: false,
    };
  }

  const payments = await db.payment.findMany({
    where: { shopId: shop.id },
    select: {
      id: true,
      amount: true,
      date: true,
      description: true,
      personName: true,
      proprietor: true,
      bankTransactionId: true,
      title: true,
    },
  });

  const charges = await db.charge.findMany({
    where: { shopId: shop.id },
    select: {
      id: true,
      amount: true,
      date: true,
      description: true,
      personName: true,
      proprietor: true,
      title: true,
    },
  });

  return {
    success: true,
    shop,
    payments,
    charges,
  };
}

export default async function getShopFinancialDetails(shopId: string) {
  return handleServerAction<FindResponse>((user) =>
    getShopBalance(shopId, user)
  );
}
