import { labels } from "@/utils/label";
import type { PageTitle } from "@/components/layout/AppHeader";

/** Header titles for the owner pages, in the words the sidebar uses. */
export const userPageTitles: PageTitle[] = [
  { href: "/user/dashboard", name: labels.userDashboard },
  { href: "/user/my-shops", name: labels.myUnits },
  { href: "/user/shop-detail", name: labels.shopDetails },
  { href: "/user/building-info/bank-report", name: labels.buildingBankReport },
  { href: "/user/news", name: labels.newsTitle },
  { href: "/user/user-info", name: labels.userInfo },
  { href: "/user/update-password", name: labels.updatePassword },
];
