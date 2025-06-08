// server/modules/persons/person-handler.ts

import { Context } from "hono";
import * as PersonService from "./person-service";
import { personLabels } from "./labels";
import {
  AddPersonData,
  UpdatePersonData,
  UpdatePersonRoleData,
  UpdatePersonPasswordData,
  findPersonByFilterSchema,
} from "@/schema/personSchema";

export const getAllPersonsHandler = async (c: Context) => {
  const persons = await PersonService.findAll();
  return c.json(persons);
};

export const getPersonByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  try {
    const person = await PersonService.findById(id);
    return c.json(person);
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};

export const getPersonsByFilterHandler = async (c: Context) => {
  const rawQuery = c.req.query();
  const query = findPersonByFilterSchema.parse({
    firstName: rawQuery.firstName,
    lastName: rawQuery.lastName,
    phoneOne: rawQuery.phoneOne,
    phoneTwo: rawQuery.phoneTwo,
    IdNumber: rawQuery.IdNumber,
    isActive: rawQuery.isActive ? rawQuery.isActive === "true" : undefined,
  });
  const persons = await PersonService.findByFilter(query);
  return c.json(persons);
};

export const getPersonsByShopHandler = async (c: Context) => {
  const shopId = c.req.param("shopId");
  try {
    const persons = await PersonService.findByShop(shopId);
    return c.json(persons);
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};

export const createPersonHandler = async (c: Context) => {
  const body = await c.req.json<AddPersonData>();
  try {
    const newPerson = await PersonService.create(body);
    const { password, ...personResponse } = newPerson; // Exclude password from response
    return c.json(
      {
        message: personLabels.personCreatedSuccessfully,
        person: personResponse,
      },
      201
    );
  } catch (e: any) {
    c.status(409); // Conflict
    return c.json({ error: e.message });
  }
};

export const updatePersonHandler = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<Omit<UpdatePersonData, "id">>();
  try {
    const updatedPerson = await PersonService.update(id, body);
    const { password, ...personResponse } = updatedPerson;
    return c.json({
      message: personLabels.personUpdatedSuccessfully,
      person: personResponse,
    });
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};

export const updatePersonRoleHandler = async (c: Context) => {
  const body = await c.req.json<UpdatePersonRoleData>();
  try {
    const updatedPerson = await PersonService.updateRole(body);
    const { password, ...personResponse } = updatedPerson;
    return c.json({
      message: personLabels.roleUpdatedSuccessfully,
      person: personResponse,
    });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const updatePersonPasswordHandler = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<UpdatePersonPasswordData>();
  const requestingUserRole = "ADMIN"; // Placeholder for real auth context
  try {
    await PersonService.updatePassword(id, body, requestingUserRole);
    return c.json({ message: personLabels.passwordUpdatedSuccessfully });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const deletePersonHandler = async (c: Context) => {
  const id = c.req.param("id");
  try {
    await PersonService.deletePerson(id);
    return c.body(null, 204);
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};
