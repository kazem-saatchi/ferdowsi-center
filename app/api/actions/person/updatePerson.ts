"use server";

import { db } from "@/lib/db";
import { UpdatePersonData, updatePersonSchema } from "@/schema/personSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updatePersonResponse {
  lastName: string;
  personId: string;
  message: string;
  /** How many denormalized name copies were rewritten by the rename cascade.
   *  Zero when the name did not change. */
  renamedRows: number;
}

async function updatePerson(data: UpdatePersonData, person: Person) {
  // Only admins or authorized roles can update new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updatePersonSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const current = await db.person.findUnique({
    where: { id: validation.data.id },
    select: { firstName: true, lastName: true },
  });

  if (!current) {
    throw new Error(errorMSG.personNotFound);
  }

  const nameChanged =
    current.firstName !== validation.data.firstName ||
    current.lastName !== validation.data.lastName;

  const fullName = `${validation.data.firstName} ${validation.data.lastName}`;

  // Shop.ownerName / Shop.renterName / ShopHistory.personName /
  // Charge.personName / Payment.personName are denormalized copies of the
  // person's name, written once when the row is created. A rename has to be
  // pushed into all of them in the same transaction, otherwise every report
  // that reads those columns (shop-balance-detail, history lists, charge and
  // payment tables) keeps showing the old name forever.
  const [updatedPerson, ...cascade] = await db.$transaction([
    db.person.update({
      where: { id: validation.data.id },
      data: {
        IdNumber: validation.data.IdNumber,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        phoneOne: validation.data.phoneOne,
        phoneTwo: validation.data.phoneTwo,
        isActive: validation.data.isActive,
      },
    }),
    ...(nameChanged
      ? [
          db.shop.updateMany({
            where: { ownerId: validation.data.id },
            data: { ownerName: fullName },
          }),
          db.shop.updateMany({
            where: { renterId: validation.data.id },
            data: { renterName: fullName },
          }),
          db.shopHistory.updateMany({
            where: { personId: validation.data.id },
            data: { personName: fullName },
          }),
          db.charge.updateMany({
            where: { personId: validation.data.id },
            data: { personName: fullName },
          }),
          db.payment.updateMany({
            where: { personId: validation.data.id },
            data: { personName: fullName },
          }),
        ]
      : []),
  ]);

  const renamedRows = cascade.reduce(
    (total, result) => total + (result as { count: number }).count,
    0
  );

  return {
    personId: updatedPerson.IdNumber,
    message: successMSG.personUpdated,
    lastName: updatedPerson.lastName,
    renamedRows,
  };
}

export default async function updatePersonInfo(data: UpdatePersonData) {
  return handleServerAction<updatePersonResponse>((user) =>
    updatePerson(data, user)
  );
}
