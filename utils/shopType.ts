import type { ShopType } from "@prisma/client";
import { labels } from "./label";

/** The Persian name of each unit type, in one place: the dashboard, the person
 *  balance page and its report all print the same word for a type. */
export const SHOP_TYPE_LABELS: Record<ShopType, string> = {
  STORE: labels.store,
  OFFICE: labels.office,
  KIOSK: labels.kiosk,
  PARKING: labels.parking,
  BOARD: labels.board,
};

export const shopTypeLabel = (type: ShopType): string =>
  SHOP_TYPE_LABELS[type] ?? type;

/** How a unit reads in a unit picker. Digits stay Latin so typing "101" in
 *  the picker's search still finds it. */
export const shopOptionLabel = (shop: {
  plaque: number | string;
  floor: number | string | null;
}): string => `${labels.unit} ${shop.plaque} (${labels.floorNumber} ${shop.floor ?? "-"})`;
