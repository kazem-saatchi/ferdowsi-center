import { db } from "@/lib/db";
import {
  AddShopData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  EndShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";
import { shopLabels } from "./labels";
import { ShopType, Prisma } from "@prisma/client";

export const findAll = async () => {
  return await db.shop.findMany({
    orderBy: { plaque: "asc" },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
      renter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
    },
  });
};

export const findById = async (id: string) => {
  const shop = await db.shop.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
      renter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
    },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  return shop;
};

export const create = async (data: AddShopData) => {
  // Check if plaque already exists
  const existingShop = await db.shop.findUnique({
    where: { plaque: data.plaque },
    select: { id: true },
  });

  if (existingShop) {
    throw new Error(shopLabels.duplicatePlaque);
  }

  // Verify owner exists
  const owner = await db.person.findUnique({
    where: { id: data.ownerId },
    select: { firstName: true, lastName: true },
  });

  if (!owner) {
    throw new Error(shopLabels.ownerNotFound);
  }

  // Verify renter exists if provided
  let renter = null;
  if (data.renterId) {
    renter = await db.person.findUnique({
      where: { id: data.renterId },
      select: { firstName: true, lastName: true },
    });

    if (!renter) {
      throw new Error(shopLabels.renterNotFound);
    }
  }

  const currentDate = new Date().toISOString();

  return await db.$transaction(async (prisma) => {
    const newShop = await prisma.shop.create({
      data: {
        plaque: data.plaque,
        area: data.area,
        floor: data.floor,
        type: data.type as ShopType,
        ownerId: data.ownerId,
        renterId: data.renterId || null,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : null,
        bankCardMonthly: data.bankCardMonthly,
        bankCardYearly: data.bankCardYearly,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
      },
    });

    // Create history entries
    const historyEntries: Prisma.ShopHistoryCreateManyInput[] = [
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.ownerId,
        personName: newShop.ownerName,
        type: "Ownership",
        startDate: currentDate,
        shopType: newShop.type,
      },
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.renterId || newShop.ownerId,
        personName: newShop.renterName || newShop.ownerName,
        type: newShop.renterId ? "ActiveByRenter" : "ActiveByOwner",
        startDate: currentDate,
        shopType: newShop.type,
      },
    ];

    await prisma.shopHistory.createMany({
      data: historyEntries,
    });

    return newShop;
  });
};

export const updateInfo = async (
  id: string,
  data: Omit<UpdateShopInfoData, "id">
) => {
  const shop = await db.shop.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  return await db.shop.update({
    where: { id },
    data: {
      plaque: data.plaque,
      area: data.area,
      floor: data.floor,
      bankCardMonthly: data.bankCardMonthly,
      bankCardYearly: data.bankCardYearly,
      type: data.type as ShopType,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
      renter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneOne: true,
        },
      },
    },
  });
};

export const updateOwner = async (data: UpdateShopOwnerData) => {
  // Verify shop exists
  const shop = await db.shop.findUnique({
    where: { id: data.shopId },
    select: { id: true, ownerId: true },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  // Verify new owner exists
  const newOwner = await db.person.findUnique({
    where: { id: data.ownerId },
    select: { firstName: true, lastName: true },
  });

  if (!newOwner) {
    throw new Error(shopLabels.newOwnerNotFound);
  }

  return await db.$transaction(async (prisma) => {
    // Update shop owner
    const updatedShop = await prisma.shop.update({
      where: { id: data.shopId },
      data: {
        ownerId: data.ownerId,
        ownerName: `${newOwner.firstName} ${newOwner.lastName}`,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
      },
    });

    // Add history entry
    await prisma.shopHistory.create({
      data: {
        shopId: data.shopId,
        plaque: updatedShop.plaque,
        personId: data.ownerId,
        personName: `${newOwner.firstName} ${newOwner.lastName}`,
        type: "Ownership",
        startDate: data.startDate,
        shopType: updatedShop.type,
      },
    });

    return updatedShop;
  });
};

export const updateRenter = async (data: UpdateShopRenterData) => {
  // Verify shop exists
  const shop = await db.shop.findUnique({
    where: { id: data.shopId },
    select: { id: true, renterId: true },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  // Verify new renter exists
  const newRenter = await db.person.findUnique({
    where: { id: data.renterId },
    select: { firstName: true, lastName: true },
  });

  if (!newRenter) {
    throw new Error(shopLabels.newRenterNotFound);
  }

  return await db.$transaction(async (prisma) => {
    // Update shop renter
    const updatedShop = await prisma.shop.update({
      where: { id: data.shopId },
      data: {
        renterId: data.renterId,
        renterName: `${newRenter.firstName} ${newRenter.lastName}`,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
      },
    });

    // Add history entry
    await prisma.shopHistory.create({
      data: {
        shopId: data.shopId,
        plaque: updatedShop.plaque,
        personId: data.renterId,
        personName: `${newRenter.firstName} ${newRenter.lastName}`,
        type: "ActiveByRenter",
        startDate: data.startDate,
        shopType: updatedShop.type,
      },
    });

    return updatedShop;
  });
};

export const endRenter = async (data: EndShopRenterData) => {
  // Verify shop exists and has the specified renter
  const shop = await db.shop.findUnique({
    where: { id: data.shopId },
    select: { id: true, renterId: true, ownerName: true, ownerId: true },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  if (shop.renterId !== data.renterId) {
    throw new Error(shopLabels.shopDoesNotHaveSpecifiedRenter);
  }

  return await db.$transaction(async (prisma) => {
    // Remove renter from shop
    const updatedShop = await prisma.shop.update({
      where: { id: data.shopId },
      data: {
        renterId: null,
        renterName: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
      },
    });

    // End renter history and start owner active history
    await prisma.shopHistory.updateMany({
      where: {
        shopId: data.shopId,
        personId: data.renterId,
        type: "ActiveByRenter",
        endDate: null,
      },
      data: {
        endDate: data.endDate,
        isActive: false,
      },
    });

    // Add new owner active history
    await prisma.shopHistory.create({
      data: {
        shopId: data.shopId,
        plaque: updatedShop.plaque,
        personId: shop.ownerId,
        personName: shop.ownerName,
        type: "ActiveByOwner",
        startDate: data.endDate,
        shopType: updatedShop.type,
      },
    });

    return updatedShop;
  });
};

export const updateStatus = async (data: UpdateShopStatusData) => {
  // Verify shop exists
  const shop = await db.shop.findUnique({
    where: { id: data.shopId },
    select: {
      id: true,
      plaque: true,
      type: true,
      renterId: true,
      renterName: true,
      ownerId: true,
      ownerName: true,
    },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  const historyType =
    data.newStatus === "ACTIVATE"
      ? shop.renterId
        ? "ActiveByRenter"
        : "ActiveByOwner"
      : "InActive";

  const personId =
    data.newStatus === "ACTIVATE"
      ? shop.renterId || shop.ownerId
      : shop.renterId || shop.ownerId;

  const personName =
    data.newStatus === "ACTIVATE"
      ? shop.renterName || shop.ownerName
      : shop.renterName || shop.ownerName;

  return await db.$transaction(async (prisma) => {
    // Add history entry
    await prisma.shopHistory.create({
      data: {
        shopId: data.shopId,
        plaque: shop.plaque,
        personId: personId,
        personName: personName,
        type: historyType,
        startDate: data.date,
        shopType: shop.type,
      },
    });

    return await prisma.shop.findUnique({
      where: { id: data.shopId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneOne: true,
          },
        },
      },
    });
  });
};

export const deleteShop = async (id: string) => {
  const shop = await db.shop.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!shop) {
    throw new Error(shopLabels.shopNotFound);
  }

  await db.shop.delete({
    where: { id },
  });
};
