"use server";

import { db } from "@/lib/db";
import { AddKioskData } from "@/schema/importSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Prisma, ShopType } from "@prisma/client";

export interface AddKioskResponse {
  message: string;
  addedShops: number;
  failedShops: number;
  processed: number;
}

async function addKioskInternal(
  data: AddKioskData[],
  admin: { role: string }
): Promise<Omit<AddKioskResponse, "message">> {
  if (admin.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  let addedShops = 0;
  let failedShops = 0;
  const processedCount = data.length; // Track the size of the input chunk

  // a constant date for shop start date
  const startDate = "2024-01-01T00:00:00.000Z";
  const todayDate = new Date().toISOString();

  const pastBalanceTitle = "بدهی قبلی شارژ ماهانه";
  const pastPropreitorBalanceTitle = "بدهی قبلی اجاره";
  const pastBalanceDescription =
    "این مبلغ از سیستم حسابداری قبلی وارد شده است.";

  const operation = await db.operation.create({
    data: {
      date: todayDate,
      title: `ثبت اطلاعات اولیه غرفه ها از فایل - `,
    },
  });

  const ferdowsiData = {
    IdNumber: "0000000000",
    firstName: "مجتمع فردوسی",
    lastName: "آبادگران",
    phoneOne: "0000000000",
    address: "",
    password: "0000000000",
  };

  // Check if the owner exists
  let owner = await db.person.findUnique({
    where: { IdNumber: ferdowsiData.IdNumber },
  });

  if (!owner) {
    // Hash password for Owner
    const ownerHashedPassword: string = await hashPassword(
      ferdowsiData.password
    );

    // Create owner if not exists
    owner = await db.person.create({
      data: {
        IdNumber: ferdowsiData.IdNumber,
        firstName: ferdowsiData.firstName.toString(),
        lastName: ferdowsiData.lastName.toString(),
        phoneOne: ferdowsiData.phoneOne.toString(),
        phoneTwo: null,
        address: "",
        password: ownerHashedPassword,
      },
    });
  }

  for (const row of data) {
    await db.$transaction(
      async (prisma) => {
        try {
          //--------------------------------Check for duplicate plaque--------------------------------
          let newShop = null;
          newShop = await prisma.shop.findUnique({
            where: { plaque: +row.plaque },
          });

          console.log(row.plaque, row);

          if (newShop) {
            console.log(`Plaque ${row.plaque} already exists, skipping.`);
            failedShops++;
            return; // Skip to next row
          }

          //--------------------------------Check if the shop is inactive--------------------------------
          if (!row.isActive) {
            console.log("shop is inactive, creating shop");
            newShop = await prisma.shop.create({
              data: {
                plaque: row.plaque,
                area: row.area,
                floor: row.floor,
                type: row.type as ShopType,
                ownerId: owner.id,
                ownerName: `${owner.firstName} ${owner.lastName}`,
                bankCardMonthly: row.bankCardMonthly || "",
                bankCardYearly: row.bankCardYearly || "",
                isActive: false,
              },
            });
            console.log(`shop ${row.plaque} added successfully`);
          }

          //--------------------------------Check for missing renterIdNumber--------------------------------
          // if (!row.renterIdNumber) {
          //   console.log(
          //     `Skipping row with plaque ${row.plaque} due to missing renterIdNumber`
          //   );
          //   failedShops++;
          //   return; // Skip to next row if renterIdNumber is not provided
          // }

          //--------------------------------Check if the renter exists--------------------------------
          let renter = null;
          if (row.renterIdNumber) {
            renter = await prisma.person.findUnique({
              where: { IdNumber: row.renterIdNumber.toString() },
            });
          }

          if (renter) {
            console.log("renter found", renter);
          }

          //--------------------------------Check if the renter exists--------------------------------
          if (row.renterPhoneOne && row.renterIdNumber) {
            // Hash password for Renter
            const renterHashedPassword = await hashPassword(
              row.renterPhoneOne.toString()
            );

            if (!renter) {
              console.log("renter not found, creating renter");
              // Create renter if they exist in the Excel data
              renter = await prisma.person.create({
                data: {
                  IdNumber: row.renterIdNumber.toString(),
                  firstName: row.renterFirstName?.toString() || "",
                  lastName: row.renterLastName?.toString() || "",
                  phoneOne: row.renterPhoneOne.toString(),
                  address: "",
                  password: renterHashedPassword,
                },
              });
            }
            //--------------------------------Create shop--------------------------------
            newShop = await prisma.shop.create({
              data: {
                plaque: row.plaque,
                area: row.area,
                floor: row.floor,
                type: row.type as ShopType,
                ownerId: owner.id,
                renterId: renter.id,
                ownerName: `${owner.firstName} ${owner.lastName}`,
                renterName: `${renter.firstName} ${renter.lastName}`,
                bankCardMonthly: row.bankCardMonthly || "",
                bankCardYearly: row.bankCardYearly || "",
              },
            });

            //--------------------------------Add Renter Rent Balance--------------------------------
            const renterRentBalance = await prisma.charge.create({
              data: {
                amount: row.renterRentBalance || 0,
                date: todayDate,
                daysCount: 0,
                title: pastBalanceTitle,
                operationName: operation.title,
                plaque: newShop.plaque,
                shopId: newShop.id,
                personId: renter.id,
                personName: `${renter.firstName} ${renter.lastName}`,
                operationId: operation.id,
                proprietor: true,
                description: pastPropreitorBalanceTitle,
              },
            });

            //--------------------------------Add Renter Charge Balance--------------------------------
            const renterChargeBalance = await prisma.charge.create({
              data: {
                amount: row.renterChargeBalance || 0,
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

          if (!newShop) {
            console.log(`shop ${row.plaque} not found, skipping.`);
            failedShops++;
            return;
          }

          //--------------------------------Create shop history--------------------------------
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
              type: newShop.renterId ? "ActiveByRenter" : "InActive",
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

export default async function addKioskAction(data: AddKioskData[]) {
  // Wrap with handleServerAction, which adds success/data structure
  return handleServerAction(async (user) => {
    const result = await addKioskInternal(data, user); // Call the internal logic
    // Construct the final message based on chunk results
    const message = `Chunk processed: ${result.addedShops} added, ${result.failedShops} failed out of ${result.processed}.`;
    return { ...result, message };
  });
}
