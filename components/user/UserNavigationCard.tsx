import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowLeft, Building2, FileText, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

function UserNavigationCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {navigationCards.map((card, index) => (
        <Card
          key={index}
          className={`hover:shadow-md transition-shadow cursor-pointer ${card.bgColor}`}
          onClick={() => (window.location.href = card.href)}
        >
          <CardHeader>
            <div
              className={`flex items-center justify-between ${card.textColor}`}
            >
              <CardTitle className="text-lg">{card.title}</CardTitle>
              {card.icon}
            </div>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "flex flex-row items-center justify-start gap-2",
                "text-sm text-muted-foreground hover:underline"
              )}
            >
              <span>مشاهده جزییات</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UserNavigationCard;

const navigationCards = [
  {
    title: "پروفایل من",
    description: "مشاهده و ویرایش اطلاعات شخصی",
    icon: <User className="h-6 w-6" />,
    href: "/user/user-info",
    bgColor: "bg-blue-50 dark:bg-blue-500/30",
    textColor: "text-blue-600 dark:text-blue-50",
  },
  {
    title: "واحدهای من",
    description: "مدیریت مغازه ها و دفتر کارهای شما",
    icon: <Store className="h-6 w-6" />,
    href: "/user/my-shops",
    bgColor: "bg-green-50 dark:bg-green-500/30",
    textColor: "text-green-600 dark:text-green-50",
  },
  {
    title: "اخبار",
    description: "مشاهده اخبار و اطلاعات جدید",
    icon: <FileText className="h-6 w-6" />,
    href: "/user/news",
    bgColor: "bg-purple-50 dark:bg-purple-500/30",
    textColor: "text-purple-600 dark:text-purple-50",
  },
  {
    title: "اطلاعات مجتمع",
    description: "مشاهده بیلان مجتمع",
    icon: <Building2 className="h-6 w-6" />,
    href: "/user/building-info",
    bgColor: "bg-orange-50 dark:bg-orange-500/30",
    textColor: "text-orange-600 dark:text-orange-50",
  },
];
