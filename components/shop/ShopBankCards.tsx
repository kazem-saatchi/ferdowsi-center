import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { labels } from "@/utils/label";

/** The unit's two charge card numbers, side by side; a tap copies one. */
function ShopBankCards({
  monthly,
  yearly,
  isLoading = false,
}: {
  monthly: string | null;
  yearly: string | null;
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
      <BankCard isLoading={isLoading} shopCard={monthly} title="ماهانه" />
      <BankCard isLoading={isLoading} shopCard={yearly} title="مالکانه" />
    </div>
  );
}

export default ShopBankCards;

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
    if (!cardNumber) return labels.noValue;
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
