"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

export interface UpdateChargeUserProps {
  userId: string;
  shopId: string;
  chargeId: string;
}

async function updateChargeUser(data: UpdateChargeUserProps, person: Person) {
  const { userId, chargeId } = data;

  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const user = await db.person.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(errorMSG.userNotFound);
  }

  const charge = await db.charge.findUnique({
    where: { id: chargeId },
  });

  if (!charge) {
    throw new Error(errorMSG.chargeNotFound);
  }

  if (charge.shopId !== data.shopId) {
    throw new Error(errorMSG.shopIdMismatch);
  }

  const updatedCharge = await db.charge.update({
    where: { id: chargeId },
    data: {
      personId: userId,
      personName: `${user.firstName} ${user.lastName}`,
    },
  });

  return {
    success: true,
    message: successMSG.chargeUpdated,
  };
}

export default async function updateChargeUserAction(
  data: UpdateChargeUserProps,
) {
  return handleServerAction(async (person) => updateChargeUser(data, person));
}
