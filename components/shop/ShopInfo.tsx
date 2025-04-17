import { Shop } from "@prisma/client";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function ShopInfo({isLoading,shop}: { isLoading: boolean,shop:Shop }) {
  const formatBankCard = (cardNumber: string) => {
    if (!cardNumber) return "N/A";
    return cardNumber.replace(/(\d{4})(?=\d)/g, "$1-");
  };
  return (
    <>
      
     
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              `Shop #${shop?.plaque}`
            )}
          </CardTitle>
          {!isLoading && (
            <Badge variant={shop?.isActive ? "default" : "secondary"}>
              {shop?.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ShopProperty
                label="Type"
                value={shop?.type}
                isLoading={isLoading}
              />
              <ShopProperty
                label="Floor"
                value={shop?.floor}
                isLoading={isLoading}
              />
              <ShopProperty
                label="Area"
                value={shop?.area ? `${shop.area} m²` : null}
                isLoading={isLoading}
              />
            </div>
            <div className="space-y-4">
              <ShopProperty
                label="Owner"
                value={shop?.ownerName}
                isLoading={isLoading}
              />
              <ShopProperty
                label="Renter"
                value={shop?.renterName || "Not rented"}
                isLoading={isLoading}
              />
            </div>
          </div>
        </CardContent>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Bank Card</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <p className="font-mono">
                {formatBankCard(shop?.bankCardMonthly || "")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yearly Bank Card</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <p className="font-mono">
                {formatBankCard(shop?.bankCardYearly || "")}
              </p>
            )}
          </CardContent>
        </Card>
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
