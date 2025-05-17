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
  ShoppingBag,
  ToggleLeft,
  UserX,
  PlusSquare,
  Edit,
  BookText,
  FileChartColumn,
  Banknote,
  Import,
  Car,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";

type AdminMenuKeys =
  | "balance"
  | "charge"
  | "cost"
  | "history"
  | "payment"
  | "person"
  | "shop"
  | "import"
  | "bank";
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
        name: "مانده حساب شارژ ماهانه",
        href: "/all-shops-monthly-balance",
        icon: BarChart2,
      },
      {
        id: 2,
        name: "مانده حساب شارژ مالکانه",
        href: "/all-shops-yearly-balance",
        icon: BarChart2,
      },
      {
        id: 3,
        name: "حساب یک واحد",
        href: "/shop-balance",
        icon: PieChart,
      },
      {
        id: 4,
        name: "ریز حساب واحد",
        href: "/shop-balance-detail",
        icon: BookText,
      },
      {
        id: 5,
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
        name: "لیست شارژها ثبت شده",
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
        name: "لیست شارژ مرجع ماهانه / مالکانه",
        href: "/all-charge-reference",
        icon: List,
      },
      {
        id: 8,
        name: "ساخت لیست مرجع شارژ ماهانه",
        href: "/generate-charge-list",
        icon: FileText,
      },
      {
        id: 9,
        name: "ساخت لیست مرجع شارژ مالکانه",
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
  import: {
    title: "بارگذاری اطلاعات",
    baseUrl: "/admin",
    icon: Import,
    items: [
      {
        id: 1,
        name: "ثبت اشخاص و واحدها با فایل",
        href: "/import-shops-data",
        icon: FileChartColumn,
      },
      {
        id: 2,
        name: "ثبت اطلاعات بانک",
        href: "/import-net-bank",
        icon: Banknote,
      },
      {
        id: 3,
        name: "ثبت اطلاعات غرفه ها",
        href: "/import-kiosks-data",
        icon: Car,
      },
    ],
  },
  bank: {
    title: "حساب بانکی",
    baseUrl: "/admin",
    icon: CircleDollarSign,
    items: [
      {
        id: 1,
        name: "مشاهده تراکنش ها",
        href: "/bank-transactions",
        icon: Banknote,
      },
      {
        id: 2,
        name: "کارت به کارت",
        href: "/card-transfer",
        icon: CreditCard,
      },
    ],
  },
};
