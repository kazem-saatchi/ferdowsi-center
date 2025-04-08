import {
  BarChart2,
  DollarSign,
  FileText,
  House,
  List,
  LucideIcon,
  PieChart,
  PlusCircle,
  Store,
  UserPlus,
  Zap,
  ClipboardList,
  User,
  Users,
  Search,
  UserCog,
  UserCheck,
  Sheet,
  ShoppingBag,
  ToggleLeft,
  UserX,
  PlusSquare,
  Edit,
} from "lucide-react";

type AdminMenuKeys =
  | "balance"
  | "charge"
  | "cost"
  | "history"
  | "payment"
  | "person"
  | "shop";
type AdminMenuCollection = Record<AdminMenuKeys, MenuData>;

export type MenuData = {
  title: string;
  baseUrl: string;
  icon: LucideIcon;
  items: MenuItems[];
};

type MenuItems = {
  id: number;
  name: string;
  href: string;
  icon: LucideIcon;
};

export const adminMenuData: AdminMenuCollection = {
  balance: {
    title: "تراز مالی",
    baseUrl: "/admin",
    icon: BarChart2,
    items: [
      {
        id: 1,
        name: "حساب همه واحدها",
        href: "/all-shops-balance",
        icon: BarChart2,
      },
      {
        id: 2,
        name: "حساب یک واحد",
        href: "/shops-balance",
        icon: PieChart,
      },
      {
        id: 3,
        name: "حساب یک شخص",
        href: "/person-balance",
        icon: UserPlus,
      },
    ],
  },
  charge: {
    title: "شارژها",
    baseUrl: "/admin",
    icon: Zap,
    items: [
      {
        id: 1,
        name: "لیست تمام شارژها",
        href: "/all-charges-list",
        icon: DollarSign,
      },
      {
        id: 2,
        name: "شارژهای یک واحد",
        href: "/find-charge-by-shop",
        icon: Store,
      },
      {
        id: 3,
        name: "شارژهای یک شخص",
        href: "/find-charge-by-person",
        icon: UserPlus,
      },
      {
        id: 4,
        name: "ثبت شارژ ماهانه به واحدها",
        href: "/add-charges-all-shops",
        icon: Zap,
      },
      {
        id: 5,
        name: "ثبت شارژ ماهانه یک واحد",
        href: "/add-charge-to-shop",
        icon: PlusCircle,
      },
      {
        id: 6,
        name: "ثبت شارژ یک واحد با مبلغ",
        href: "/add-charge-by-amount",
        icon: DollarSign,
      },
      {
        id: 7,
        name: "لیست شارژ ماهانه",
        href: "/all-charge-reference",
        icon: List,
      },
      {
        id: 8,
        name: "ساخت لیست شارژ ماهانه",
        href: "/generate-charge-list",
        icon: FileText,
      },
      {
        id: 9,
        name: "ساخت لیست شارژ مالکانه",
        href: "/generate-annual-charge-list",
        icon: House,
      },
    ],
  },
  cost: {
    title: "هزینه‌ها",
    baseUrl: "/admin",
    icon: DollarSign,
    items: [
      {
        id: 1,
        name: "ثبت هزینه",
        href: "/add-cost",
        icon: PlusCircle,
      },
      {
        id: 2,
        name: "لیست هزینه‌ها",
        href: "/all-costs",
        icon: List,
      },
    ],
  },
  history: {
    title: "تاریخچه",
    baseUrl: "/admin",
    icon: ClipboardList,
    items: [
      {
        id: 1,
        name: "لیست تمام تاریخچه",
        href: "/all-shop-history",
        icon: ClipboardList,
      },
      {
        id: 2,
        name: "تاریخچه یک واحد",
        href: "/history-by-shop",
        icon: Store,
      },
      {
        id: 3,
        name: "تاریخچه یک شخص",
        href: "/history-by-person",
        icon: User,
      },
    ],
  },
  payment: {
    title: "پرداختی‌ها",
    baseUrl: "/admin",
    icon: DollarSign,
    items: [
      {
        id: 1,
        name: "لیست تمام پرداختی‌ها",
        href: "/all-payments",
        icon: DollarSign,
      },
      {
        id: 2,
        name: "پرداختی‌های یک واحد",
        href: "/payment-by-shop",
        icon: Store,
      },
      {
        id: 3,
        name: "پرداختی‌های یک شخص",
        href: "/payment-by-person",
        icon: User,
      },
      {
        id: 4,
        name: "ثبت پرداختی",
        href: "/add-payment",
        icon: PlusCircle,
      },
    ],
  },
  person: {
    title: "مدیریت اشخاص",
    baseUrl: "/admin",
    icon: Users,
    items: [
      {
        id: 1,
        name: "لیست تمام اشخاص",
        href: "/all-persons",
        icon: Users,
      },
      {
        id: 2,
        name: "ثبت شخص جدید",
        href: "/add-person",
        icon: UserPlus,
      },
      {
        id: 3,
        name: "جستجوی اشخاص",
        href: "/search-persons",
        icon: Search,
      },
      {
        id: 4,
        name: "ویرایش اطلاعات شخص",
        href: "/update-person",
        icon: UserCog,
      },
      {
        id: 5,
        name: "تغییر نقش شخص",
        href: "/update-person-role",
        icon: UserCheck,
      },
      {
        id: 6,
        name: "ثبت اشخاص با فایل",
        href: "/add-persons",
        icon: Sheet,
      },
    ],
  },
  shop: {
    title: "مدیریت واحدها",
    baseUrl: "/admin",
    icon: ShoppingBag,
    items: [
      {
        id: 1,
        name: "لیست تمام واحدها",
        href: "/all-shops",
        icon: List,
      },
      {
        id: 2,
        name: "افزودن واحد جدید",
        href: "/add-shop",
        icon: PlusSquare,
      },
      {
        id: 3,
        name: "ویرایش اطلاعات واحد",
        href: "/edit-shop",
        icon: Edit,
      },
      {
        id: 4,
        name: "ثبت مالک جدید برای یک واحد",
        href: "/update-shop-owner",
        icon: UserCheck,
      },
      {
        id: 5,
        name: "ثبت مستاجر جدید برای یک واحد",
        href: "/update-shop-renter",
        icon: ShoppingBag,
      },
      {
        id: 6,
        name: "حذف مستاجر یک واحد",
        href: "/remove-shop-renter",
        icon: UserX,
      },
      {
        id: 7,
        name: "فعال / غیر فعال کردن یک واحد",
        href: "/update-shop-status",
        icon: ToggleLeft,
      },
    ],
  },
};
