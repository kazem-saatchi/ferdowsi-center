"use server";

import { db } from "@/lib/db";
import { adminWriteAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import {
  recomputeShopMonthlyCharges,
  OperationChargeDiff,
} from "@/app/api/actions/charge/recalcCharges";
import {
  applyHistoryDateChange,
  UpdateHistoryData,
} from "./applyHistoryDateChange";

export type { UpdateHistoryData } from "./applyHistoryDateChange";

export interface UpdateHistoryResponse {
  success: boolean;
  message: string;
  recalculated?: OperationChargeDiff[];
  noOccupantWindows?: boolean;
}

async function updateHistory(
  data: UpdateHistoryData,
  user: Person
): Promise<UpdateHistoryResponse> {
  const recalculated = await db.$transaction(async (tx) => {
    const { shopId } = await applyHistoryDateChange(tx, data);
    return recomputeShopMonthlyCharges(tx, shopId, { apply: true });
  });

  const noOccupantWindows = recalculated.some((op) => op.noOccupantInWindow);

  return {
    success: true,
    message: noOccupantWindows
      ? successMSG.historyUpdatedChargesKept
      : successMSG.historyUpdated,
    recalculated,
    noOccupantWindows,
  };
}

export default async function updateHistoryAction(data: UpdateHistoryData) {
  return adminWriteAction<UpdateHistoryResponse>((user) =>
    updateHistory(data, user)
  );
}
