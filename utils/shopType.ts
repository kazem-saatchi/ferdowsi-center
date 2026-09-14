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
