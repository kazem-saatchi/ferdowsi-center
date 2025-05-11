// app/actions/user.ts
"use server";

import { db } from "@/lib/db"; // Your database client
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

export async function getUserQuickState(userId: string, user: Person) {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user.id !== userId && user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  try {
    // Get count of user's shops
    const shopsCount = await db.shop.count({
      where: { OR: [{ ownerId: userId }, { renterId: userId }] },
    });

    // Get total balance of all user's shops
    const charges = await db.charge.aggregate({
      where: { personId: userId },
      _sum: { amount: true },
    });

    const payments = await db.payment.aggregate({
      where: { personId: userId },
      _sum: { amount: true },
    });

    const totalBalance =
      (payments._sum.amount ? payments._sum.amount : 0) -
      (charges._sum.amount ? charges._sum.amount : 0);

    return {
      shopsCount,
      totalBalance,
    };
  } catch (error) {
    console.error("Error fetching user shop stats:", error);
    return {
      shopsCount: 0,
      totalBalance: 0,
    };
  }
}

export default async function findUserQuickState(userId: string) {
  return handleServerAction((user) => getUserQuickState(userId, user));
}
