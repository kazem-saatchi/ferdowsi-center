import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, CreditCard, Import, ReceiptText } from "lucide-react";
import { labels } from "@/utils/label";
import type { LucideIcon } from "lucide-react";

/** The four pages the admins actually open every day, in the order the work
 *  happens: import the statement, book what it brought in, then read balances. */
const QUICK_LINKS: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: labels.importBankDataCard,
    description: labels.importBankDataCardHint,
    href: "/admin/import-net-bank",
    icon: Import,
  },
  {
    title: labels.unregisteredPaymentsCard,
    description: labels.unregisteredPaymentsCardHint,
    href: "/admin/card-transfer",
    icon: CreditCard,
  },
  {
    title: labels.shopBalanceDetailCard,
    description: labels.shopBalanceDetailCardHint,
    href: "/admin/shop-balance-detail",
    icon: ReceiptText,
  },
  {
    title: labels.monthlyBalanceListCard,
    description: labels.monthlyBalanceListCardHint,
    href: "/admin/all-shops-monthly-balance",
    icon: BarChart2,
  },
];

export default function AdminMainPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">{labels.adminWelcomeTitle}</h1>
      <p className="mb-8 text-lg">{labels.adminWelcomeText}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {QUICK_LINKS.map(({ title, description, href, icon: Icon }) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon className="ml-2" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={href}>{labels.goToPage}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
