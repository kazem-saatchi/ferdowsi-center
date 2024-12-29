"use server";

import { db } from "@/lib/db";
import { GetChargeByPersonData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
}

async function getAllCharges(
  data: GetChargeByPersonData,
  user: Person
): Promise<FindchargeResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get Person Charges
  const chargeList = await db.charge.findMany({
    where: { personId: data.personId },
    orderBy: [{plaque:"asc"},{ date: "desc" }],
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
  };
}

export default async function findChargesByPerson(data: GetChargeByPersonData) {
  return handleServerAction<FindchargeResponse>((user) =>
    getAllCharges(data, user)
  );
}
