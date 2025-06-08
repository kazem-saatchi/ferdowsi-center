// server/modules/persons/person-service.ts

import { db } from "@/lib/db";
import {
  AddPersonData,
  UpdatePersonData,
  UpdatePersonRoleData,
  FindPersonByFilterData,
  UpdatePersonPasswordData,
} from "@/schema/personSchema";
import { personLabels } from "./labels";
import { hashPassword, comparePassword } from "@/utils/hashPassword";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

export const findAll = async () => {
  return db.person.findMany({ where: { isActive: true } });
};

export const findById = async (id: string) => {
  const person = await db.person.findUnique({ where: { IdNumber: id } });
  if (!person) throw new Error(personLabels.personNotFound);
  return person;
};

export const findByFilter = async (filters: FindPersonByFilterData) => {
  const whereClause: Record<string, any> = {};
  if (filters.firstName)
    whereClause.firstName = {
      contains: filters.firstName,
      mode: "insensitive",
    };
  if (filters.lastName)
    whereClause.lastName = { contains: filters.lastName, mode: "insensitive" };
  if (filters.phoneOne) whereClause.phoneOne = { contains: filters.phoneOne };
  if (filters.IdNumber) whereClause.IdNumber = { contains: filters.IdNumber };
  if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;

  return db.person.findMany({ where: whereClause });
};

export const findByShop = async (shopId: string) => {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: true,
      renter: true,
      histories: true && { include: { person: true } },
    },
  });

  if (!shop) throw new Error(errorMSG.shopNotFound);

  const personsSet = new Set<Person>();

  // Add owners
  if (shop.owner) {
    personsSet.add(shop.owner);
  }

  // Add renters
  if (shop.renter) {
    personsSet.add(shop.renter);
  }

  // Add persons from ShopHistory
  if (shop.histories) {
    shop.histories.forEach((history) => {
      if (history.person) {
        personsSet.add(history.person);
      }
    });
  }

  // Convert Set to Array (to remove duplicates)
  const persons = Array.from(personsSet);

  return persons;
};

export const create = async (data: AddPersonData) => {
  const existingPerson = await db.person.findUnique({
    where: { IdNumber: data.IdNumber },
  });
  if (existingPerson) throw new Error(personLabels.duplicateIdNumber);

  const hashedPassword = await hashPassword(data.password);
  return db.person.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

export const update = async (
  id: string,
  data: Omit<UpdatePersonData, "id">
) => {
  return db.person.update({
    where: { id },
    data,
  });
};

export const updateRole = async (data: UpdatePersonRoleData) => {
  return db.person.update({
    where: { id: data.userId },
    data: { role: data.role },
  });
};

export const updatePassword = async (
  userId: string,
  data: UpdatePersonPasswordData,
  requestingUserRole: "ADMIN" | "MANAGER" | "STAFF" | "USER"
) => {
  const personToUpdate = await db.person.findUnique({ where: { id: userId } });
  if (!personToUpdate) throw new Error(personLabels.userNotFound);

  if (requestingUserRole !== "ADMIN") {
    const isPasswordValid = await comparePassword(
      data.currentPassword,
      personToUpdate.password
    );
    if (!isPasswordValid) throw new Error(personLabels.invalidPassword);
  }

  const hashedPassword = await hashPassword(data.password);
  return db.person.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const deletePerson = async (id: string) => {
  return db.person.delete({ where: { id } });
};
