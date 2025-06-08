import apiClient from "@/lib/axios";
import {
  AddPersonData,
  UpdatePersonData,
  UpdatePersonRoleData,
  UpdatePersonPasswordData,
  FindPersonByFilterData,
} from "@/schema/personSchema";

// Generic response types
interface ApiResponse<T> {
  message?: string;
  person?: T;
  error?: string;
}

interface PersonsResponse {
  data: any[];
}

// GET /api/persons - Get all persons
export const getAllPersons = async () => {
  const response = await apiClient.get<any[]>("/api/persons");
  return response.data;
};

// GET /api/persons/:id - Get person by ID
export const getPersonById = async (id: string) => {
  const response = await apiClient.get<any>(`/api/persons/${id}`);
  return response.data;
};

// GET /api/persons/search - Get persons by filter
export const getPersonsByFilter = async (filters: FindPersonByFilterData) => {
  const params = new URLSearchParams();

  if (filters.firstName) params.append("firstName", filters.firstName);
  if (filters.lastName) params.append("lastName", filters.lastName);
  if (filters.phoneOne) params.append("phoneOne", filters.phoneOne);
  if (filters.phoneTwo) params.append("phoneTwo", filters.phoneTwo);
  if (filters.IdNumber) params.append("IdNumber", filters.IdNumber);
  if (filters.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());

  const response = await apiClient.get<any[]>(
    `/api/persons/search?${params.toString()}`
  );
  return response.data;
};

// GET /api/persons/by-shop/:shopId - Get persons by shop
export const getPersonsByShop = async (shopId: string) => {
  const response = await apiClient.get<any[]>(`/api/persons/by-shop/${shopId}`);
  return response.data;
};

// POST /api/persons - Create new person
export const createPerson = async (data: AddPersonData) => {
  const response = await apiClient.post<ApiResponse<any>>("/api/persons", data);
  return response.data;
};

// PUT /api/persons/:id - Update person
export const updatePerson = async (
  id: string,
  data: Omit<UpdatePersonData, "id">
) => {
  const response = await apiClient.put<ApiResponse<any>>(
    `/api/persons/${id}`,
    data
  );
  return response.data;
};

// PATCH /api/persons/:id/role - Update person role
export const updatePersonRole = async (
  id: string,
  data: Omit<UpdatePersonRoleData, "userId">
) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    `/api/persons/${id}/role`,
    data
  );
  return response.data;
};

// PATCH /api/persons/:id/password - Update person password
export const updatePersonPassword = async (
  id: string,
  data: Omit<UpdatePersonPasswordData, "userId">
) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    `/api/persons/${id}/password`,
    data
  );
  return response.data;
};

// DELETE /api/persons/:id - Delete person
export const deletePerson = async (id: string) => {
  const response = await apiClient.delete(`/api/persons/${id}`);
  return response.data;
};
