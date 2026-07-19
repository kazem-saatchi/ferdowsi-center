"use server";

import { db } from "@/lib/db";
import {
  AddProprietorChargeData,
  addProprietorChargeSchema,
} from "@/schema/importSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";

export interface AddProprietorChargeResponse {
  message: string;
  addedShops: number; // added charges (name kept for useChunkedUpload compatibility)
  failedShops: number; // rows that failed
  processed: number;
}

async function addProprietorChargeInternal(
  data: AddProprietorChargeData[],
  admin: { role: string }
): Promise<Omit<AddProprietorChargeResponse, "message">> {
  if (admin.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  let added = 0;
  let failed = 0;
  const processedCount = data.length;

  // Title/date are shared across the chunk (set once on the page).
  const operationTitle = data[0]?.title || "ثبت شارژ مالکانه از فایل";
  const operationDate = data[0]?.date || new Date().toISOString();

  const operation = await db.operation.create({
    data: {
      date: operationDate,
      title: operationTitle,
    },
  });

  console.log(
    `\n[proprietor-charge] ===== New chunk: ${data.length} rows =====`
  );

  for (const row of data) {
    // Log the raw row exactly as received from the client.
    console.log(
      `[proprietor-charge] Raw row -> plaque=${JSON.stringify(
        row.plaque
      )} (typeof ${typeof row.plaque}), amount=${JSON.stringify(
        row.amount
      )} (typeof ${typeof row.amount}), title=${JSON.stringify(row.title)}`
    );

    try {
      const validation = addProprietorChargeSchema.safeParse(row);
      if (!validation.success) {
        failed++;
        console.error(
          `[proprietor-charge] ❌ VALIDATION FAILED for plaque ${row.plaque}:`,
          JSON.stringify(validation.error.flatten().fieldErrors)
        );
        continue;
      }

      const { plaque, amount, title, date, description } = validation.data;

      // Match the shop by plaque; proprietor charge is attached to the owner.
      const shop = await db.shop.findUnique({ where: { plaque: +plaque } });

      if (!shop) {
        failed++;
        console.error(
          `[proprietor-charge] ❌ SHOP NOT FOUND for plaque ${plaque}`
        );
        continue;
      }

      await db.charge.create({
        data: {
          amount,
          date,
          daysCount: 0,
          title,
          operationName: operation.title,
          plaque: shop.plaque,
          shopId: shop.id,
          personId: shop.ownerId,
          personName: shop.ownerName,
          operationId: operation.id,
          proprietor: true,
          description,
        },
      });

      added++;
      console.log(
        `[proprietor-charge] ✅ Added charge for plaque ${shop.plaque}, amount ${amount}`
      );
    } catch (error) {
      failed++;
      console.error(
        `[proprietor-charge] ❌ ERROR for plaque ${row.plaque}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(
    `[proprietor-charge] ===== Chunk done: ${added} added, ${failed} failed =====\n`
  );

  return {
    addedShops: added,
    failedShops: failed,
    processed: processedCount,
  };
}

export default async function addProprietorChargeFromFile(
  data: AddProprietorChargeData[]
) {
  return handleServerAction(async (user) => {
    const result = await addProprietorChargeInternal(data, user);
    const message = `Chunk processed: ${result.addedShops} added, ${result.failedShops} failed out of ${result.processed}.`;
    return { ...result, message };
  });
}
