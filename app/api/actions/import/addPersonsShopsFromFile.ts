"use server";

import { db } from "@/lib/db";
import { AddPersonsShopsData } from "@/schema/importSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Prisma, ShopType } from "@prisma/client";

export interface AddPersonsShopsResponse {
  message: string;
  addedShops: number;
  failedShops: number;
  processed: number;
}

async function addPersonsAndShopsInternal(
  data: AddPersonsShopsData[],
  admin: { role: string }
): Promise<Omit<AddPersonsShopsResponse, "message">> {
  if (admin.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  let addedShops = 0;
  let failedShops = 0;
  const processedCount = data.length; // Track the size of the input chunk

  // a constant date for shop start date
  const startDate = "2024-01-01T00:00:00.000Z";
  const todayDate = new Date().toISOString();

  const pastBalanceTitle = "بدهی قبلی";
  const pastPropreitorBalanceTitle = "بدهی قبلی مالکانه";
  const pastBalanceDescription =
    "این مبلغ از سیستم حسابداری قبلی وارد شده است.";

  const ActiveByRenter = "فعال توسط مستاجر";
  const ActiveByOwner = "فعال توسط مالک";

  const operation = await db.operation.create({
    data: {
      date: todayDate,
      title: `ثبت اطلاعات اولیه از فایل - `,
    },
  });

  for (const row of data) {
    await db.$transaction(
      async (prisma) => {
        try {
          // Check if the owner exists
          let owner = await prisma.person.findUnique({
            where: { IdNumber: row.ownerIdNumber.toString() },
          });

          // Hash password for Owner
          const ownerHashedPassword: string = await hashPassword(
            row.ownerPhoneOne.toString()
          );

          if (!owner) {
            // Create owner if not exists
            owner = await prisma.person.create({
              data: {
                IdNumber: row.ownerIdNumber.toString(),
                firstName: row.ownerFirstName.toString(),
                lastName: row.ownerLastName.toString(),
                phoneOne: row.ownerPhoneOne.toString(),
                address: "",
                password: ownerHashedPassword,
              },
            });
          }

          let renter = null;
          if (row.renterIdNumber) {
            // Check if the renter exists
            renter = await prisma.person.findUnique({
              where: { IdNumber: row.renterIdNumber.toString() },
            });

            // Hash password for Renter
            const renterHashedPassword = await hashPassword(
              row.renterPhoneOne.toString()
            );

            if (!renter) {
              // Create renter if they exist in the Excel data
              renter = await prisma.person.create({
                data: {
                  IdNumber: row.renterIdNumber.toString(),
                  firstName: row.renterFirstName.toString(),
                  lastName: row.renterLastName.toString(),
                  phoneOne: row.renterPhoneOne.toString(),
                  address: "",
                  password: renterHashedPassword,
                },
              });
            }
          }

          // Check for duplicate plaque
          const existingShop = await prisma.shop.findUnique({
            where: { plaque: +row.plaque },
          });

          if (existingShop) {
            failedShops++;
            return; // Skip to next row
          }

          // Create shop
          const newShop = await prisma.shop.create({
            data: {
              plaque: row.plaque,
              area: row.area,
              floor: row.floor,
              type: row.type as ShopType,
              ownerId: owner.id,
              renterId: renter ? renter.id : null,
              ownerName: `${owner.firstName} ${owner.lastName}`,
              renterName: renter
                ? `${renter.firstName} ${renter.lastName}`
                : null,
              bankCardMonthly: row.bankCardMonthly,
              bankCardYearly: row.bankCardYearly,
            },
          });

          // Add Owner Monthly Balance
          const ownerCharge = await prisma.charge.create({
            data: {
              amount: row.ownerBalance,
              date: todayDate,
              daysCount: 0,
              title: pastBalanceTitle,
              operationName: operation.title,
              plaque: newShop.plaque,
              shopId: newShop.id,
              personId: owner.id,
              personName: `${owner.firstName} ${owner.lastName}`,
              operationId: operation.id,
              proprietor: false,
              description: pastBalanceDescription,
            },
          });

          let renterCharge = null;

          // Add Renter Monthly Balance if Exist
          if (renter) {
            renterCharge = await prisma.charge.create({
              data: {
                amount: row.renterBalance,
                date: todayDate,
                daysCount: 0,
                title: pastBalanceTitle,
                operationName: operation.title,
                plaque: newShop.plaque,
                shopId: newShop.id,
                personId: renter.id,
                personName: `${renter.firstName} ${renter.lastName}`,
                operationId: operation.id,
                proprietor: false,
                description: pastBalanceDescription,
              },
            });
          }

          // Add Owner Proprietor Balance
          const proprietorBalance = await prisma.charge.create({
            data: {
              amount: row.ownershipBalance,
              date: todayDate,
              daysCount: 0,
              title: pastPropreitorBalanceTitle,
              operationName: operation.title,
              plaque: newShop.plaque,
              shopId: newShop.id,
              personId: owner.id,
              personName: `${owner.firstName} ${owner.lastName}`,
              operationId: operation.id,
              proprietor: true,
              description: pastBalanceDescription,
            },
          });

          // Create shop history
          const historyEntries: Prisma.ShopHistoryCreateManyInput[] = [
            {
              shopId: newShop.id,
              plaque: newShop.plaque,
              personId: newShop.ownerId,
              personName: newShop.ownerName,
              type: "Ownership",
              startDate: startDate,
              shopType: newShop.type,
            },
            {
              shopId: newShop.id,
              plaque: newShop.plaque,
              personId: newShop.renterId || newShop.ownerId,
              personName: newShop.renterName || newShop.ownerName,
              type: newShop.renterId ? "ActiveByRenter" : "ActiveByOwner",
              startDate: startDate,
              shopType: newShop.type,
            },
          ];

          await prisma.shopHistory.createMany({
            data: historyEntries,
          });
          console.log(`shop ${newShop.plaque} added successfully`);
          addedShops++;
        } catch (error) {
          failedShops++;
          console.error("Failed to add plaque:", row.plaque, error);
        }
      },
      { timeout: 60_000 } // Increases timeout to 60 seconds
    );
  }

  return {
    addedShops,
    failedShops,
    processed: processedCount,
  };
}

export default async function addPersonsShops(data: AddPersonsShopsData[]) {
  // Wrap with handleServerAction, which adds success/data structure
  return handleServerAction(async (user) => {
    const result = await addPersonsAndShopsInternal(data, user); // Call the internal logic
    // Construct the final message based on chunk results
    const message = `Chunk processed: ${result.addedShops} added, ${result.failedShops} failed out of ${result.processed}.`;
    return { ...result, message };
  });
}
