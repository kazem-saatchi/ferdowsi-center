// server/modules/persons/person.routes.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  addPersonSchema,
  updatePersonSchema,
  updatePersonRoleSchema,
  updatePersonPassword,
  findPersonByFilterSchema
} from '@/schema/personSchema';
import {
    getAllPersonsHandler,
    getPersonByIdHandler,
    createPersonHandler,
    updatePersonHandler,
    updatePersonRoleHandler,
    deletePersonHandler,
    getPersonsByFilterHandler,
    getPersonsByShopHandler,
    updatePersonPasswordHandler
} from './person-handler';

const personRoutes = new Hono()
  .get('/', getAllPersonsHandler)
  .get('/search', zValidator('query', findPersonByFilterSchema), getPersonsByFilterHandler)
  .get('/by-shop/:shopId', getPersonsByShopHandler)
  .get('/:id', getPersonByIdHandler)
  .post('/', zValidator('json', addPersonSchema), createPersonHandler)
  .put('/:id', zValidator('json', updatePersonSchema.omit({ id: true })), updatePersonHandler)
  .patch('/:id/role', zValidator('json', updatePersonRoleSchema.omit({ userId: true })), updatePersonRoleHandler)
  .patch('/:id/password', zValidator('json', updatePersonPassword.omit({ userId: true })), updatePersonPasswordHandler)
  .delete('/:id', deletePersonHandler);

export { personRoutes };