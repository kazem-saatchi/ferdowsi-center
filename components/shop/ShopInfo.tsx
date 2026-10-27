import { toPersianDigits } from "@/utils/formatNumber";
import { Shop } from "@prisma/client";
import { Badge } from "../ui/badge";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";
import ShopBankCards from "./ShopBankCards";

function ShopInfo({ isLoading, shop }: { isLoading: boolean; shop: Shop }) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-0">
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-40 sm:w-48" />
          ) : (
            `واحد #${toPersianDigits(shop?.plaque)}`
          )}
        </CardTitle>
        {!isLoading && (
          <Badge variant={shop?.isActive ? "default" : "secondary"}>
            {shop?.isActive ? labels.active : labels.inactive}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <ShopProperty
              label={labels.type}
              value={shop?.type ? shopTypeLabel(shop.type) : null}
              isLoading={isLoading}
            />
            <ShopProperty
              label={labels.floorNumber}
              value={shop?.floor != null ? toPersianDigits(shop.floor) : null}
              isLoading={isLoading}
            />
            <ShopProperty
              label={labels.areaM2}
              value={shop?.area ? toPersianDigits(shop.area) : null}
              isLoading={isLoading}
            />
          </div>
          <div className="space-y-4">
            <ShopProperty
              label={labels.owner}
              value={shop?.ownerName}
              isLoading={isLoading}
            />
            <ShopProperty
              label={labels.renter}
              value={shop?.renterName || "بدون مستاجر"}
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardContent>

      <div className="my-2">
        <ShopBankCards
          isLoading={isLoading}
          monthly={shop.bankCardMonthly}
          yearly={shop.bankCardYearly}
        />
      </div>
    </>
  );
}

export default ShopInfo;

function ShopProperty({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | number | null;
  isLoading: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-6 w-32 mt-1" />
      ) : (
        <p className="text-lg font-medium">{value}</p>
      )}
    </div>
  );
}
