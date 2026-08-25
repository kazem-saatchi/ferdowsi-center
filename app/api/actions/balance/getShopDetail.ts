"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import {
  getPersonNameMap,
  withCurrentPersonNames,
} from "@/utils/personNames";
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
  personId: string;
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
  personId: string;
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
      personId: true,
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
      personId: true,
      personName: true,
      proprietor: true,
      title: true,
    },
  });

  // personName on these rows is a denormalized copy; resolve the persons'
  // current names in one query so a rename shows up here too.
  const personNames = await getPersonNameMap([
    ...charges.map((charge) => charge.personId),
    ...payments.map((payment) => payment.personId),
  ]);

  return {
    success: true,
    shop,
    payments: withCurrentPersonNames(payments, personNames),
    charges: withCurrentPersonNames(charges, personNames),
  };
}

export default async function getShopFinancialDetails(shopId: string) {
  return handleServerAction<FindResponse>((user) =>
    getShopBalance(shopId, user)
  );
}
