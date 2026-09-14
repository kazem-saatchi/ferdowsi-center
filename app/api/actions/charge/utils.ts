import { z } from "zod";
import { db } from "@/lib/db";
import { errorMSG } from "@/utils/messages";
import { HistoryType, ShopHistory, ShopType } from "@prisma/client";
import { differenceInDays, startOfDay } from "date-fns";


const getHistoriesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  /** Restrict to a single shop. Omit to fetch every shop's histories. */
  shopId: z.string().optional(),
});

export type getHistoriesResponse = {
  success: boolean;
  message: string;
  data?: ShopHistory[];
  totalDays?: number;
};

type getHistoriesData = z.infer<typeof getHistoriesSchema>;

/** Units the building management rents out. On these a charge run bills rent
 *  rather than a shared-cost charge. */
const RENTABLE_SHOP_TYPES: ShopType[] = ["KIOSK", "BOARD", "PARKING"];

/**
 * Whether a history span should be billed rent by addRentAllKiosks.
 *
 * Rent is owed by whoever occupies the unit, and these units belong to the
 * building management — so an unoccupied span would bill the landlord for their
 * own empty unit. getRelatedHistories returns InActive (vacant) and
 * ActiveByOwner (management holding it) spans alongside ActiveByRenter, and on
 * these units the personId of the first two IS the management person. Only
 * ActiveByRenter has someone who owes the rent.
 */
export function isRentBillableHistory(
  history: Pick<ShopHistory, "shopType" | "type">
): boolean {
  return (
    RENTABLE_SHOP_TYPES.includes(history.shopType) &&
    history.type === HistoryType.ActiveByRenter
  );
}

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

  const { startDate, endDate, shopId } = validation.data;

  if (endDate <= startDate) {
    return {
      success: false,
      message: errorMSG.invalidDateRange,
    };
  }

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      ...(shopId ? { shopId } : {}),
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
