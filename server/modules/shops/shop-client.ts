import apiClient from "@/lib/axios";
import {
  AddShopData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  EndShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";

// Generic response types
interface ApiResponse<T> {
  message?: string;
  shop?: T;
  error?: string;
}

// GET /api/shops - Get all shops
export const getAllShops = async () => {
  const response = await apiClient.get<any[]>("/api/shops");
  return response.data;
};

// GET /api/shops/:id - Get shop by ID
export const getShopById = async (id: string) => {
  const response = await apiClient.get<any>(`/api/shops/${id}`);
  return response.data;
};

// POST /api/shops - Create new shop
export const createShop = async (data: AddShopData) => {
  const response = await apiClient.post<ApiResponse<any>>("/api/shops", data);
  return response.data;
};

// PUT /api/shops/:id - Update shop info
export const updateShopInfo = async (
  id: string,
  data: Omit<UpdateShopInfoData, "id">
) => {
  const response = await apiClient.put<ApiResponse<any>>(
    `/api/shops/${id}`,
    data
  );
  return response.data;
};

// PATCH /api/shops/owner - Update shop owner
export const updateShopOwner = async (data: UpdateShopOwnerData) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    "/api/shops/owner",
    data
  );
  return response.data;
};

// PATCH /api/shops/renter - Update shop renter
export const updateShopRenter = async (data: UpdateShopRenterData) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    "/api/shops/renter",
    data
  );
  return response.data;
};

// PATCH /api/shops/end-renter - End shop renter
export const endShopRenter = async (data: EndShopRenterData) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    "/api/shops/end-renter",
    data
  );
  return response.data;
};

// PATCH /api/shops/status - Update shop status
export const updateShopStatus = async (data: UpdateShopStatusData) => {
  const response = await apiClient.patch<ApiResponse<any>>(
    "/api/shops/status",
    data
  );
  return response.data;
};

// DELETE /api/shops/:id - Delete shop
export const deleteShop = async (id: string) => {
  const response = await apiClient.delete(`/api/shops/${id}`);
  return response.data;
};
