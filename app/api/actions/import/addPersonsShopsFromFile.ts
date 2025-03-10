"use server";

import { db } from "@/lib/db";
import { AddPersonsShopsData } from "@/schema/importSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Prisma } from "@prisma/client";

interface AddPersonsShopsResponse {
  message: string;
  addedShops: number;
  failedShops: number;
}

async function addPersonsAndShops(
  data: AddPersonsShopsData[],
  admin: { role: string }
) {
  if (admin.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  let addedShops = 0;
  let failedShops = 0;

  // a constant date for shop start date
  const currentDate = "2024-01-01T00:00:00.000Z";

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
              type: row.type,
              ownerId: owner.id,
              renterId: renter ? renter.id : null,
              ownerName: `${owner.firstName} ${owner.lastName}`,
              renterName: renter
                ? `${renter.firstName} ${renter.lastName}`
                : null,
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
              startDate: currentDate,
            },
            {
              shopId: newShop.id,
              plaque: newShop.plaque,
              personId: newShop.renterId || newShop.ownerId,
              personName: newShop.renterName || newShop.ownerName,
              type: newShop.renterId ? "ActiveByRenter" : "ActiveByOwner",
              startDate: currentDate,
            },
          ];

          await prisma.shopHistory.createMany({
            data: historyEntries,
          });

          addedShops++;
        } catch (error) {
          failedShops++;
          console.error("Failed to add row:", error);
        }
      },
      { timeout: 30_000 } // Increases timeout to 30 seconds
    );
  }


  return {
    message: `تعداد ${addedShops} واحد اضافه شد.
    تعداد ${failedShops} ناموفق بود`,
    addedShops,
    failedShops,
  };
}

export default async function addPersonsShops(data: AddPersonsShopsData[]) {
  return handleServerAction<AddPersonsShopsResponse>((user) =>
    addPersonsAndShops(data, user)
  );
}
