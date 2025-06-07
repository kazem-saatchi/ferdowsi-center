import { z } from "zod";
import { db } from "@/lib/db";
import { errorMSG } from "@/utils/messages";
import { ShopHistory, ShopType } from "@prisma/client";
import { differenceInDays, startOfDay } from "date-fns";


const getHistoriesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export type getHistoriesResponse = {
  success: boolean;
  message: string;
  data?: ShopHistory[];
  totalDays?: number;
};

type getHistoriesData = z.infer<typeof getHistoriesSchema>;

export async function getRelatedHistories(
  data: getHistoriesData
): Promise<getHistoriesResponse> {
  const validation = getHistoriesSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map((err) => err.message).join(", "),
    };
  }

  const { startDate, endDate } = validation.data;

  if (endDate <= startDate) {
    return {
      success: false,
      message: errorMSG.invalidDateRange,
    };
  }

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] }, // Exclude "Ownership"
      startDate: { lte: endDate },
      OR: [
        { endDate: null }, // Include ongoing periods
        { endDate: { gte: startDate } }, // Include overlapping periods
      ],
    },
    orderBy: { startDate: "asc" },
  });

  // Calculate the number of days (inclusive)
  const totalDays = differenceInDays(endDate, startDate) + 1;

  return {
    success: true,
    message: "Histories fetched successfully",
    data: relevantHistories,
    totalDays,
  };
}
//--------------------------------------------------------------------------------------
