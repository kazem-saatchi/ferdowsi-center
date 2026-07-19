"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import {
  recomputeShopMonthlyCharges,
  OperationChargeDiff,
} from "@/app/api/actions/charge/recalcCharges";
import {
  applyHistoryDateChange,
  UpdateHistoryData,
} from "@/app/api/actions/history/updateHistory";

export interface PreviewHistoryDateChangeResponse {
  success: boolean;
  message: string;
  diffs: OperationChargeDiff[];
}

// Sentinel used to roll back the preview transaction after computing the diff.
class PreviewRollback {
  constructor(public diffs: OperationChargeDiff[]) {}
}

/**
 * Computes what would happen to a shop's monthly charges if a history date
 * were changed — WITHOUT persisting anything. It runs the exact same
 * apply + recompute code path as the real commit inside a transaction, then
 * throws a sentinel to roll it back. This guarantees the preview can never
 * diverge from what the commit actually does.
 */
async function previewHistoryDateChange(
  data: UpdateHistoryData
): Promise<PreviewHistoryDateChangeResponse> {
  let diffs: OperationChargeDiff[] = [];

  try {
    await db.$transaction(async (tx) => {
      const { shopId } = await applyHistoryDateChange(tx, data);
      diffs = await recomputeShopMonthlyCharges(tx, shopId, { apply: false });
      throw new PreviewRollback(diffs);
    });
  } catch (error) {
    if (error instanceof PreviewRollback) {
      diffs = error.diffs;
    } else {
      // Real validation / DB error — let handleServerAction report it.
      throw error;
    }
  }

  return {
    success: true,
    message: successMSG.actionSucceeded,
    diffs,
  };
}

export default async function previewHistoryDateChangeAction(
  data: UpdateHistoryData
) {
  return handleServerAction<PreviewHistoryDateChangeResponse>(() =>
    previewHistoryDateChange(data)
  );
}
