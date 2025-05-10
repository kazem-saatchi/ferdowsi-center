"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useFindPersonFromSession } from "@/tanstack/queries";
import { Building2, User, Store, FileText } from "lucide-react";

export default function UserMainPage() {
  const { data: session } = useFindPersonFromSession();

  // Get current time for greeting
  const currentHour = new Date().getHours();
  let greeting = "خوش آمدید";

  if (currentHour < 12) {
    greeting = "صبح بخیر";
  } else if (currentHour < 18) {
    greeting = "ظهر بخیر";
  } else {
    greeting = "عصر بخیر";
  }

  const navigationCards = [
    {
      title: "My Profile",
      description: "View and update your personal information",
      icon: <User className="h-6 w-6" />,
      href: "/user/user-info",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "My Units",
      description: "Manage your shops and office spaces",
      icon: <Store className="h-6 w-6" />,
      href: "/user/my-shops",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Documents",
      description: "Access your invoices and contracts",
      icon: <FileText className="h-6 w-6" />,
      href: "/user/documents",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Building Info",
      description: "View building announcements and services",
      icon: <Building2 className="h-6 w-6" />,
      href: "/building-info",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}
          {session?.person?.lastName
            ? `,${session.person.firstName} ${session.person.lastName}`
            : ""}
          !
        </h1>
        <p className="text-muted-foreground">
          به اپلیکیشن مجتع فردوسی خوش آمدید
        </p>
      </div>

      {/* Navigation Cards Grid */}
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
              <div className="text-sm text-muted-foreground hover:underline">
                View details →
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Section (optional) */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Units</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Shops & offices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$1,250</p>
              <p className="text-sm text-muted-foreground">Due this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">New announcements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
