"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";

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
}

async function updateHistory(
  data: UpdateHistoryData
): Promise<UpdateHistoryResponse> {
  const { id, shopId, personId, date, type } = data;

  const newDate = new Date(date);

  const history = await db.shopHistory.findUnique({
    where: { id },
  });

  if (!history) {
    return { success: false, message: errorMSG.historyNotFound };
  }

  if (shopId !== history.shopId || personId !== history.personId) {
    return { success: false, message: errorMSG.shopIdMismatch };
  }

  if (type === "startDate") {
    if (history.endDate && date > history.endDate) {
      return { success: false, message: errorMSG.invalidStartDate };
    }
  }

  if (type === "endDate") {
    if (date < history.startDate) {
      return { success: false, message: errorMSG.invalidEndDate };
    }

    // we can't update a null end date
    if (history.endDate === null) {
      return { success: false, message: errorMSG.invalidEndDate };
    }
  }

  //Check if we need to update related history
  const twinSearchParams =
    type === "startDate"
      ? { shopId, startDate: date, id: { not: id } }
      : { shopId, endDate: date, id: { not: id } };

  const twinHistory = await db.shopHistory.findFirst({
    where: twinSearchParams,
  });

  if (twinHistory) {
    // check if also twin can handle date change
    if (type === "startDate") {
      if (twinHistory.endDate && date > twinHistory.endDate) {
        return { success: false, message: errorMSG.invalidStartDate };
      }
    }

    if (type === "endDate") {
      if (date < twinHistory.startDate) {
        return { success: false, message: errorMSG.invalidEndDate };
      }
    }

    // update twin history
    await db.shopHistory.update({
      where: { id: twinHistory.id },
      data: {
        endDate: type === "startDate" ? newDate : twinHistory.endDate,
        startDate: type === "endDate" ? newDate : twinHistory.startDate,
      },
    });
  }

  

  await db.shopHistory.update({
    where: { id },
    data: {
      startDate: type === "startDate" ? newDate : history.startDate,
      endDate: type === "endDate" ? newDate : history.endDate,
    },
  });

  return { success: true, message: successMSG.historyUpdated };
}

export default async function updateHistoryAction(data: UpdateHistoryData) {
  return handleServerAction<UpdateHistoryResponse>((user) =>
    updateHistory(data)
  );
}
