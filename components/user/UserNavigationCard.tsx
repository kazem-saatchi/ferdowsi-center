// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";

// function UserNavigationCard() {
//   return (
//     <Card
//       key={index}
//       className={`hover:shadow-md transition-shadow cursor-pointer ${card.bgColor}`}
//       onClick={() => (window.location.href = card.href)}
//     >
//       <CardHeader>
//         <div className={`flex items-center justify-between ${card.textColor}`}>
//           <CardTitle className="text-lg">{card.title}</CardTitle>
//           {card.icon}
//         </div>
//         <CardDescription>{card.description}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="text-sm text-muted-foreground hover:underline">
//           View details →
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default UserNavigationCard;

// const navigationCards = [
//   {
//     title: "پروفایل من",
//     description: "مشاهده و ویرایش اطلاعات شخصی",
//     icon: <User className="h-6 w-6" />,
//     href: "/user/user-info",
//     bgColor: "bg-blue-50",
//     textColor: "text-blue-600",
//   },
//   {
//     title: "واحدهای من",
//     description: "مدیریت مغازه ها و دفتر کارهای شما",
//     icon: <Store className="h-6 w-6" />,
//     href: "/user/my-shops",
//     bgColor: "bg-green-50",
//     textColor: "text-green-600",
//   },
//   {
//     title: "اسناد",
//     description: "دسترسی به فاکتورها و قراردادها",
//     icon: <FileText className="h-6 w-6" />,
//     href: "/user/documents",
//     bgColor: "bg-purple-50",
//     textColor: "text-purple-600",
//   },
//   {
//     title: "اطلاعات ساختمان",
//     description: "مشاهده اطلاعیه ها و خدمات ساختمان",
//     icon: <Building2 className="h-6 w-6" />,
//     href: "/building-info",
//     bgColor: "bg-orange-50",
//     textColor: "text-orange-600",
//   },
// ];
