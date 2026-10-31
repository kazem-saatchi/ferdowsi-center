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
  KeyRound,
  ReceiptText,
  DatabaseBackup,
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
  | "bank"
  | "operation";
type AdminMenuCollection = Record<AdminMenuKeys, MenuData>;

export type MenuData = {
  title: string;
  baseUrl: string;
  icon: LucideIcon;
  items: MenuItems[];
};

export type MenuItems = {
  id: number;
  name: string;
  href: string;
  icon: LucideIcon;
  /** Changes data, so only roles in WRITE_ROLES see it. */
  write?: boolean;
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
        name: "مانده حساب اجاره",
        href: "/all-rents-balance",
        icon: BarChart2,
      },
      {
        id: 4,
        name: "حساب یک واحد",
        href: "/shop-balance",
        icon: PieChart,
      },
      {
        id: 5,
        name: "ریز حساب واحد",
        href: "/shop-balance-detail",
        icon: BookText,
      },
      {
        id: 6,
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
        write: true,
      },
      {
        id: 5,
        name: "ثبت اجاره ماهانه به غرفه‌ها",
        href: "/add-rent-all-kiosks",
        icon: DollarSign,
        write: true,
      },
      {
        id: 6,
        name: "ثبت شارژ ماهانه یک واحد",
        href: "/add-charge-to-shop",
        icon: PlusCircle,
        write: true,
      },
      {
        id: 7,
        name: "ثبت شارژ یک واحد با مبلغ",
        href: "/add-charge-by-amount",
        icon: DollarSign,
        write: true,
      },
      {
        id: 8,
        name: "ثبت شارژ چند واحد با مبلغ",
        href: "/add-charge-to-list",
        icon: DollarSign,
        write: true,
      },
      {
        id: 9,
        name: "لیست شارژ مرجع ماهانه / مالکانه",
        href: "/all-charge-reference",
        icon: List,
      },
      {
        id: 10,
        name: "ساخت لیست مرجع شارژ ماهانه",
        href: "/generate-charge-list",
        icon: FileText,
        write: true,
      },
      {
        id: 11,
        name: "ساخت لیست مرجع شارژ مالکانه",
        href: "/generate-annual-charge-list",
        icon: House,
        write: true,
      },
    ],
  },
  cost: {
    title: "هزینه‌ها و درآمدها",
    baseUrl: "/admin",
    icon: DollarSign,
    items: [
      {
        id: 1,
        name: "ثبت هزینه",
        href: "/add-cost",
        icon: PlusCircle,
        write: true,
      },
      {
        id: 2,
        name: "لیست هزینه‌ها",
        href: "/all-costs",
        icon: List,
      },
      {
        id: 3,
        name: "ثبت درآمد",
        href: "/add-income",
        icon: CircleDollarSign,
        write: true,
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
        write: true,
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
        write: true,
      },
      {
        id: 4,
        name: "ویرایش اطلاعات شخص",
        href: "/update-person",
        icon: UserCog,
        write: true,
      },
      {
        id: 5,
        name: "تغییر نقش شخص",
        href: "/update-person-role",
        icon: UserCheck,
        write: true,
      },
      {
        id: 6,
        name: "تغییر رمز کاربری شخص",
        href: "/update-person-password",
        icon: KeyRound,
        write: true,
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
        write: true,
      },
      {
        id: 3,
        name: "ویرایش اطلاعات واحد",
        href: "/edit-shop",
        icon: Edit,
        write: true,
      },
      {
        id: 4,
        name: "ثبت مالک جدید برای یک واحد",
        href: "/update-shop-owner",
        icon: UserCheck,
        write: true,
      },
      {
        id: 5,
        name: "ثبت مستاجر جدید برای یک واحد",
        href: "/update-shop-renter",
        icon: ShoppingBag,
        write: true,
      },
      {
        id: 6,
        name: "حذف مستاجر یک واحد",
        href: "/remove-shop-renter",
        icon: UserX,
        write: true,
      },
      {
        id: 7,
        name: "فعال / غیر فعال کردن یک واحد",
        href: "/update-shop-status",
        icon: ToggleLeft,
        write: true,
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
        write: true,
      },
      {
        id: 2,
        name: "ثبت اطلاعات بانک",
        href: "/import-net-bank",
        icon: Banknote,
        write: true,
      },
      {
        id: 3,
        name: "ثبت اطلاعات غرفه‌ها",
        href: "/import-kiosks-data",
        icon: Car,
        write: true,
      },
      {
        id: 4,
        name: "ثبت شارژ مالکانه با فایل",
        href: "/import-proprietor-charge",
        icon: CircleDollarSign,
        write: true,
      },
      {
        id: 5,
        name: "ثبت اطلاعات بانک با فایل اکسل",
        href: "/import-bank-data",
        icon: FileText,
        write: true,
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
        name: "همه تراکنش‌ها",
        href: "/bank-transactions",
        icon: Banknote,
      },
      {
        id: 2,
        name: "لیست کارت به کارت‌ها",
        href: "/card-transfer",
        icon: CreditCard,
      },
      {
        id: 3,
        name: "لیست دریافتی‌های دیگر",
        href: "/other-incomes",
        icon: DollarSign,
      },
      {
        id: 4,
        name: "لیست هزینه‌ها",
        href: "/cost-bank-list",
        icon: ReceiptText,
      },
      {
        id: 5,
        name: "لیست تراکنش های ناموفق",
        href: "/failed-card-transfer",
        icon: Banknote,
      },
    ],
  },
  operation: {
    title: "عملیات‌های قابل بازگشت",
    baseUrl: "/admin",
    icon: DatabaseBackup,
    items: [
      {
        id: 1,
        name: "لیست تمام عملیات‌ها",
        href: "/all-operations",
        icon: ClipboardList,
      },
    ],
  },
};

/** Header titles for every admin page, in the words the sidebar uses. */
export const adminPageTitles: { href: string; name: string }[] = [
  { href: "/admin/dashboard", name: "داشبورد" },
  ...Object.values(adminMenuData).flatMap((group) =>
    group.items.map((item) => ({
      href: `${group.baseUrl}${item.href}`,
      name: item.name,
    }))
  ),
];

/** Every page that changes data, including the per-row edit pages under
 *  them (e.g. /admin/edit-shop/[id]). A read-only role is shown a notice there. */
export const adminWritePaths: string[] = Object.values(adminMenuData).flatMap(
  (group) =>
    group.items
      .filter((item) => item.write)
      .map((item) => `${group.baseUrl}${item.href}`)
);
