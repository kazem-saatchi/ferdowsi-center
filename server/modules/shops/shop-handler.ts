import { Context } from "hono";
import * as ShopService from "./shop-service";
import { shopLabels } from "./labels";
import {
  AddShopData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  EndShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";

export const getAllShopsHandler = async (c: Context) => {
  const shops = await ShopService.findAll();
  return c.json(shops);
};

export const getShopByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  try {
    const shop = await ShopService.findById(id);
    return c.json(shop);
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};

export const createShopHandler = async (c: Context) => {
  const body = await c.req.json<AddShopData>();
  try {
    const newShop = await ShopService.create(body);
    return c.json(
      { message: shopLabels.shopCreatedSuccessfully, shop: newShop },
      201
    );
  } catch (e: any) {
    c.status(409); // Conflict
    return c.json({ error: e.message });
  }
};

export const updateShopInfoHandler = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<Omit<UpdateShopInfoData, "id">>();
  try {
    const updatedShop = await ShopService.updateInfo(id, body);
    return c.json({
      message: shopLabels.shopUpdatedSuccessfully,
      shop: updatedShop,
    });
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};

export const updateShopOwnerHandler = async (c: Context) => {
  const body = await c.req.json<UpdateShopOwnerData>();
  try {
    const updatedShop = await ShopService.updateOwner(body);
    return c.json({
      message: shopLabels.shopOwnerUpdatedSuccessfully,
      shop: updatedShop,
    });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const updateShopRenterHandler = async (c: Context) => {
  const body = await c.req.json<UpdateShopRenterData>();
  try {
    const updatedShop = await ShopService.updateRenter(body);
    return c.json({
      message: shopLabels.shopRenterUpdatedSuccessfully,
      shop: updatedShop,
    });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const endShopRenterHandler = async (c: Context) => {
  const body = await c.req.json<EndShopRenterData>();
  try {
    const updatedShop = await ShopService.endRenter(body);
    return c.json({
      message: shopLabels.shopRenterEndedSuccessfully,
      shop: updatedShop,
    });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const updateShopStatusHandler = async (c: Context) => {
  const body = await c.req.json<UpdateShopStatusData>();
  try {
    const updatedShop = await ShopService.updateStatus(body);
    return c.json({
      message: shopLabels.shopStatusUpdatedSuccessfully,
      shop: updatedShop,
    });
  } catch (e: any) {
    c.status(400);
    return c.json({ error: e.message });
  }
};

export const deleteShopHandler = async (c: Context) => {
  const id = c.req.param("id");
  try {
    await ShopService.deleteShop(id);
    return c.body(null, 204);
  } catch (e: any) {
    c.status(404);
    return c.json({ error: e.message });
  }
};
