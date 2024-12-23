"use server";

import { db } from "@/lib/db";
import { calculateFinancialResponsibility } from "@/utils/calculateFinancialResponsibility";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person, ShopHistory } from "@prisma/client";

interface SplitPeriodsResponse {
  success: boolean;
  message: string;
  periods?: ShopHistory[];
}

interface SplitPeriodsProbs {
  fromDate: Date;
  ToDate: Date;
  shopId: string;
}

async function splitPeriods(
  data: SplitPeriodsProbs,
  user: Person
): Promise<SplitPeriodsResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Query Histories
  const shopHistory = await db.shopHistory.findMany({
    where: { shopId: data.shopId },
    orderBy: { createdAt: "asc" },
  });

  console.log("All-Histories", shopHistory);

  const activityPeriods = shopHistory.filter(
    (entry) => entry.type === "activePeriod" || entry.type === "deactivePeriod"
  );

  console.log("Active-history", activityPeriods);

  const responsibilityPeriods = shopHistory.filter(
    (entry) => entry.type === "ownership" || entry.type === "rental"
  );

  console.log("owner-rental", responsibilityPeriods);

  const periods = calculateFinancialResponsibility(
    activityPeriods,
    responsibilityPeriods,
    data.ToDate
  );

  console.log("Results", periods);
  console.log("-----------------------------------------");

  return { success: true, message: "success", periods };
}
export default async function splitHistories(data: SplitPeriodsProbs) {
  return handleServerAction<SplitPeriodsResponse>((user) =>
    splitPeriods(data, user)
  );
}
