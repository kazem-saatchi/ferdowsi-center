"use server";

import { db } from "@/lib/db";
import {
  AddChargeByAmountToShopListData,
  addChargeByAmountToShopListSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

async function createCharge(
  data: AddChargeByAmountToShopListData,
  user: Person
) {
  // Authorization check
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Schema validation
  const validation = addChargeByAmountToShopListSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { date, amount, shopIdList, title, proprietor, description } =
    validation.data;

  const isoDate = date.toISOString();

  const operation = await db.operation.create({
    data: { date: isoDate, title },
  });

  if (!operation) {
    throw new Error(errorMSG.operationCreationFailed);
  }

  const shops = await db.shop.findMany({ where: { id: { in: shopIdList } } });

  if (shops.length !== shopIdList.length) {
    throw new Error(errorMSG.shopNotFound);
  }

  const chargeData = shops.map((shop)=> ({
    amount,
    date: isoDate,
    daysCount: 0,
    title,
    operationName: operation.title,
    plaque: shop.plaque,
    shopId: shop.id,
    personId: shop.ownerId,
    personName: shop.ownerName,
    operationId: operation.id,
    proprietor,
    description,
  }));

  const charges = await db.charge.createMany({ data: chargeData });

  if (charges.count !== chargeData.length) {
    throw new Error(errorMSG.chargeCreationFailed);
  }

  return { success: true, message: successMSG.chargesCreated };
}

export default async function addChargeByAmountToShopList(
  data: AddChargeByAmountToShopListData
) {
  return handleServerAction(async (person) => createCharge(data, person));
}
