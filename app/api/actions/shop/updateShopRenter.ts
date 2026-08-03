"use server";

import { db } from "@/lib/db";
import { updateShopRenter, UpdateShopRenterData } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

export interface RenterChargeWarning {
  operationName: string;
  personName: string;
  amount: number;
  daysCount: number;
}

interface UpdateShopResponse {
  renterName: string | null; // Allow null if renter is being cleared
  message: string;
  /**
   * Monthly charges that were already generated for periods the new renter is
   * being backdated into. They stay on the person they were billed to — the
   * admin has to decide whether to re-split them (history date edit) and move
   * the matching payments.
   */
  chargeWarnings: RenterChargeWarning[];
}

async function updateShop(data: UpdateShopRenterData, user: Person) {
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = updateShopRenter.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { shopId, renterId, startDate } = validation.data;

  const newRenter = renterId
    ? await db.person.findUnique({
        where: { id: renterId },
        select: { id: true, firstName: true, lastName: true },
      })
    : null;

  if (renterId && !newRenter) {
    throw new Error(errorMSG.userNotFound);
  }

  const renterName = newRenter
    ? `${newRenter.firstName} ${newRenter.lastName}`
    : null;

  const newStartDate = new Date(startDate);

  const currentRentalHistory = await db.shopHistory.findFirst({
    where: {
      shopId,
      type: "ActiveByRenter",
      endDate: null,
    },
  });

  if (currentRentalHistory) {
    const currentStartDate = new Date(currentRentalHistory.startDate);
    if (newStartDate < currentStartDate) {
      throw new Error(errorMSG.invalidEndDate);
    }
  }

  const currentOwnerHistory = await db.shopHistory.findFirst({
    where: { shopId, type: "ActiveByOwner", endDate: null },
  });

  // The open owner period is closed at newStartDate below. Backdating past its
  // own start would give it a negative length, which then breaks every
  // day-based charge split built on top of it.
  if (currentOwnerHistory) {
    const ownerStartDate = new Date(currentOwnerHistory.startDate);
    if (newStartDate < ownerStartDate) {
      throw new Error(errorMSG.invalidEndDate);
    }
  }

  // Monthly charges already generated for days the new renter now covers.
  // These are NOT re-attributed here (that only happens on an explicit history
  // date edit, which shows a full preview first) — we just report them.
  const overlappingCharges = await db.charge.findMany({
    where: {
      shopId,
      proprietor: false,
      forRent: false,
      date: { gte: newStartDate },
    },
    select: {
      operationName: true,
      personName: true,
      amount: true,
      daysCount: true,
    },
    orderBy: { date: "asc" },
  });

  const chargeWarnings: RenterChargeWarning[] = overlappingCharges.map((c) => ({
    operationName: c.operationName,
    personName: c.personName,
    amount: c.amount,
    daysCount: c.daysCount,
  }));

  const transaction = await db.$transaction(async (prisma) => {
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        renterId: newRenter?.id || null,
        renterName,
      },
    });

    if (currentRentalHistory) {
      await prisma.shopHistory.update({
        where: { id: currentRentalHistory.id },
        data: {
          endDate: newStartDate.toISOString(),
          isActive: false,
        },
      });
    }

    if(currentOwnerHistory) {
      await prisma.shopHistory.update({
        where:{id:currentOwnerHistory.id},
        data:{
          endDate: newStartDate.toISOString(),
          isActive: false,
        }
      })
    }

    if (newRenter && renterName) {
      await prisma.shopHistory.create({
        data: {
          shopId: updatedShop.id,
          plaque: updatedShop.plaque,
          personId: newRenter.id,
          personName: renterName,
          type: "ActiveByRenter",
          startDate: newStartDate.toISOString(),
          shopType: updatedShop.type,
        },
      });
    }

    return updatedShop;
  });

  return {
    message: successMSG.shopUpdated,
    renterName,
    chargeWarnings,
  };
}

export default async function updateShopRenterId(data: UpdateShopRenterData) {
  return handleServerAction<UpdateShopResponse>((user) =>
    updateShop(data, user)
  );
}
