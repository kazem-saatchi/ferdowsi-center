import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  addShopSchema,
  updateShopInfoSchema,
  updateShopOwner,
  updateShopRenter,
  endShopRenter,
  updateShopStatusSchema,
} from "@/schema/shopSchema";
import {
  getAllShopsHandler,
  getShopByIdHandler,
  createShopHandler,
  updateShopInfoHandler,
  updateShopOwnerHandler,
  updateShopRenterHandler,
  endShopRenterHandler,
  updateShopStatusHandler,
  deleteShopHandler,
} from "./shop-handler";

const shopRoutes = new Hono()
  .get("/", getAllShopsHandler)
  .get("/:id", getShopByIdHandler)
  .post("/", zValidator("json", addShopSchema), createShopHandler)
  .put(
    "/:id",
    zValidator("json", updateShopInfoSchema.omit({ id: true })),
    updateShopInfoHandler
  )
  .patch("/owner", zValidator("json", updateShopOwner), updateShopOwnerHandler)
  .patch(
    "/renter",
    zValidator("json", updateShopRenter),
    updateShopRenterHandler
  )
  .patch("/end-renter", zValidator("json", endShopRenter), endShopRenterHandler)
  .patch(
    "/status",
    zValidator("json", updateShopStatusSchema),
    updateShopStatusHandler
  )
  .delete("/:id", deleteShopHandler);

export { shopRoutes };
