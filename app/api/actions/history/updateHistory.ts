"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Prisma, HistoryType } from "@prisma/client";
import {
  recomputeShopMonthlyCharges,
  OperationChargeDiff,
} from "@/app/api/actions/charge/recalcCharges";

export interface UpdateHistoryData {
  id: string;
  shopId: string;
  personId: string;
  date: Date;
  type: "startDate" | "endDate";
}

export interface UpdateHistoryResponse {
  success: boolean;
  message: string;
  recalculated?: OperationChargeDiff[];
}

/**
 * Applies a start/end date change to a ShopHistory row (and its adjacent
 * "twin" row that shares the boundary) inside the given transaction.
 *
 * Throws on any validation failure so the surrounding transaction rolls back.
 * Returns the shopId whose charges may need recalculation.
 */
export async function applyHistoryDateChange(
  tx: Prisma.TransactionClient,
  data: UpdateHistoryData
): Promise<{ shopId: string }> {
  const { id, shopId, personId, date, type } = data;

  const newDate = new Date(date);

  const history = await tx.shopHistory.findUnique({ where: { id } });

  if (!history) {
    throw new Error(errorMSG.historyNotFound);
  }

  if (shopId !== history.shopId || personId !== history.personId) {
    throw new Error(errorMSG.shopIdMismatch);
  }

  if (type === "startDate") {
    if (history.endDate && newDate > history.endDate) {
      throw new Error(errorMSG.invalidStartDate);
    }
  }

  if (type === "endDate") {
    if (newDate < history.startDate) {
      throw new Error(errorMSG.invalidEndDate);
    }
    // A still-open (null) end date cannot be edited.
    if (history.endDate === null) {
      throw new Error(errorMSG.invalidEndDate);
    }
  }

  // Keep the adjacent period that shares this boundary in sync.
  //
  // The twin is the row sitting on the OTHER side of the boundary we are
  // moving, so it must be located by this row's CURRENT edge (not the new
  // target date). It must also belong to the same history family — an
  // occupancy edit (Active*/InActive) only pairs with an occupancy row, and
  // an ownership edit only pairs with another Ownership row — so we never
  // accidentally drag an Ownership boundary while editing occupancy, or vice
  // versa, when both happen to share a date.
  const twinTypeFilter: Prisma.EnumHistoryTypeFilter =
    history.type === HistoryType.Ownership
      ? { equals: HistoryType.Ownership }
      : {
          in: [
            HistoryType.ActiveByOwner,
            HistoryType.ActiveByRenter,
            HistoryType.InActive,
          ],
        };

  const twinSearchParams: Prisma.ShopHistoryWhereInput =
    type === "startDate"
      ? // moving this row's start → twin is the row that currently ENDS here
        {
          shopId,
          id: { not: id },
          type: twinTypeFilter,
          endDate: history.startDate,
        }
      : // moving this row's end → twin is the row that currently STARTS here
        {
          shopId,
          id: { not: id },
          type: twinTypeFilter,
          startDate: history.endDate as Date,
        };

  const twinHistory = await tx.shopHistory.findFirst({
    where: twinSearchParams,
  });

  if (twinHistory) {
    if (type === "startDate") {
      // twin.endDate will become newDate → its period must not go negative.
      if (newDate < twinHistory.startDate) {
        throw new Error(errorMSG.invalidStartDate);
      }
    }

    if (type === "endDate") {
      // twin.startDate will become newDate → must not pass twin's own end.
      if (twinHistory.endDate && newDate > twinHistory.endDate) {
        throw new Error(errorMSG.invalidEndDate);
      }
    }

    await tx.shopHistory.update({
      where: { id: twinHistory.id },
      data: {
        endDate: type === "startDate" ? newDate : twinHistory.endDate,
        startDate: type === "endDate" ? newDate : twinHistory.startDate,
      },
    });
  }

  await tx.shopHistory.update({
    where: { id },
    data: {
      startDate: type === "startDate" ? newDate : history.startDate,
      endDate: type === "endDate" ? newDate : history.endDate,
    },
  });

  return { shopId: history.shopId };
}

async function updateHistory(
  data: UpdateHistoryData
): Promise<UpdateHistoryResponse> {
  const recalculated = await db.$transaction(async (tx) => {
    const { shopId } = await applyHistoryDateChange(tx, data);
    return recomputeShopMonthlyCharges(tx, shopId, { apply: true });
  });

  return {
    success: true,
    message: successMSG.historyUpdated,
    recalculated,
  };
}

export default async function updateHistoryAction(data: UpdateHistoryData) {
  return handleServerAction<UpdateHistoryResponse>(() => updateHistory(data));
}
