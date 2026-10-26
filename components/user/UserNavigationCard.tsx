import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Building2, FileText, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { labels } from "@/utils/label";

type NavigationCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
  /** No href means the page is not built yet: the card shows greyed out. */
  href?: string;
  bgColor: string;
  textColor: string;
};

function UserNavigationCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {navigationCards.map((card) => {
        const body = (
          <Card
            className={cn(
              "h-full",
              card.href
                ? cn(
                    "hover:shadow-md transition-shadow active:scale-[0.99] touch-manipulation",
                    card.bgColor
                  )
                : "border-dashed opacity-60"
            )}
          >
            <CardHeader className="p-4 sm:p-6">
              <div
                className={cn(
                  "flex items-center justify-between gap-2",
                  card.href ? card.textColor : "text-muted-foreground"
                )}
              >
                <CardTitle className="text-base sm:text-lg">
                  {card.title}
                </CardTitle>
                {card.icon}
              </div>
              <CardDescription className="text-xs sm:text-sm">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {card.href ? (
                <div className="flex flex-row items-center justify-start gap-2 text-sm text-muted-foreground group-hover:underline">
                  <span>{labels.viewDetails}</span>
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                </div>
              ) : (
                <Badge variant="secondary">{labels.comingSoon}</Badge>
              )}
            </CardContent>
          </Card>
        );

        return card.href ? (
          <Link
            key={card.title}
            href={card.href}
            className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {body}
          </Link>
        ) : (
          <div key={card.title} aria-disabled="true">
            {body}
          </div>
        );
      })}
    </div>
  );
}

export default UserNavigationCard;

const navigationCards: NavigationCard[] = [
  {
    title: labels.myProfile,
    description: labels.myProfileHint,
    icon: <User className="h-6 w-6" />,
    href: "/user/user-info",
    bgColor: "bg-blue-50 dark:bg-blue-500/30",
    textColor: "text-blue-600 dark:text-blue-50",
  },
  {
    title: labels.myUnits,
    description: labels.myUnitsHint,
    icon: <Store className="h-6 w-6" />,
    href: "/user/my-shops",
    bgColor: "bg-green-50 dark:bg-green-500/30",
    textColor: "text-green-600 dark:text-green-50",
  },
  {
    title: labels.buildingInfoTitle,
    description: labels.buildingInfoHint,
    icon: <Building2 className="h-6 w-6" />,
    href: "/user/building-info/bank-report",
    bgColor: "bg-orange-50 dark:bg-orange-500/30",
    textColor: "text-orange-600 dark:text-orange-50",
  },
  {
    // The news page is still a placeholder.
    title: labels.newsTitle,
    description: labels.newsHint,
    icon: <FileText className="h-6 w-6" />,
    bgColor: "bg-purple-50 dark:bg-purple-500/30",
    textColor: "text-purple-600 dark:text-purple-50",
  },
];
