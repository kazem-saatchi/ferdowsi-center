"use server";

import { db } from "@/lib/db";
import { GetChargeByPersonData } from "@/schema/chargeSchema";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
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
  return adminReadAction<FindchargeResponse>((user) =>
    getAllCharges(data, user)
  );
}
