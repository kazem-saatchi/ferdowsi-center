import { Shop } from "@prisma/client";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { labels } from "@/utils/label";

function ShopInfo({ isLoading, shop }: { isLoading: boolean; shop: Shop }) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-0 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-40 sm:w-48" />
          ) : (
            `واحد #${shop?.plaque}`
          )}
        </CardTitle>
        {!isLoading && (
          <Badge variant={shop?.isActive ? "default" : "secondary"}>
            {shop?.isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <ShopProperty
              label={labels.type}
              value={shop?.type}
              isLoading={isLoading}
            />
            <ShopProperty
              label={labels.floorNumber}
              value={shop?.floor}
              isLoading={isLoading}
            />
            <ShopProperty
              label={labels.areaM2}
              value={shop?.area ? `${shop.area}` : null}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 my-2">
        <BankCard
          isLoading={isLoading}
          shopCard={shop.bankCardMonthly}
          title="ماهانه"
        />
        <BankCard
          isLoading={isLoading}
          shopCard={shop.bankCardYearly}
          title="مالکانه"
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

function BankCard({
  isLoading,
  shopCard,
  title,
}: {
  shopCard: string | null;
  isLoading: boolean;
  title: string;
}) {
  const handleCopyCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return;

    navigator.clipboard
      .writeText(cardNumber)
      .then(() => {
        toast.success("شماره کارت با موفقیت کپی شد");
      })
      .catch(() => {
        toast.error("خطا در کپی شماره کارت");
      });
  };

  const formatBankCard = (cardNumber: string) => {
    if (!cardNumber) return "N/A";
    return cardNumber.replace(/(\d{4})(?=\d)/g, "$1-");
  };
  return (
    <Card
      className={cn(
        "bg-gradient-to-r from-neutral-200/70 to-gray-300/70",
        "dark:from-neutral-700/70 dark:to-gray-700/70",
        "min-h-40 sm:min-h-48 md:h-64 w-full max-w-full cursor-pointer",
        "flex flex-col items-center justify-center gap-4 sm:gap-6 p-4",
        "hover:to-neutral-400 dark:hover:to-neutral-200",
        "touch-manipulation active:scale-[0.99] transition-transform"
      )}
      onClick={() => {
        handleCopyCardNumber(shopCard);
      }}
    >
      <CardHeader className="p-0 sm:p-6 text-center">
        <CardTitle className="text-base sm:text-lg">
          شماره کارت شارژ {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 w-full text-center">
        {isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <p
            dir="ltr"
            className="font-bold text-base sm:text-xl md:text-2xl tracking-wider break-all"
          >
            {formatBankCard(shopCard || "")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
