import allCosts from "@/app/api/actions/cost-income/allCosts";
import { add } from "date-fns";

export const labels = {
  plaque: "پلاک",
  totalCharge: "کل جمع شارژ (ریال)",
  totalPayment: "کل جمع پرداخت (ریال)",
  totalBalance: "مانده حساب کل",
  personName: "نام شخص",

  title: "عنوان",
  amount: "مبلغ - ریال",
  date: "تاریخ",
  operationName: "موضوع",
  daysCount: "تعداد روز",

  constAmount: "مبلغ ثابت",
  metricAmount: "مبلغ متری",

  shopId: "واحد",
  personId: "شخص",
  type: "نوع",
  startDate: "تاریخ شروع",
  endDate: "تاریخ پایان",
  status: "وضعیت",

  active: "فعال",
  inactive: "غیر فعال",

  previous: "قبل",
  page: "صفحه",
  of: "از",
  next: "بعد",

  paymentType: "نحوه پرداخت",
  paymentCategory: "مالکانه / ماهانه",
  receiptImage: "تصویر رسید",
  delete: "حذف",
  deleting: "در حال حذف",

  proprietorCharge: "مالکانه",
  monthlyCharge: "ماهانه",

  viewReceipt: "مشاهده رسید",
  noReceipt: "بدون رسید",

  close: "بستن صفحه",

  nationalId: "کد ملی",
  name: "نام",
  lastName: "فامیلی",
  mobile: "شماره موبایل",
  secondMobile: "شماره تماس دوم",

  editInfo: "ویرایش اطلاعات",
  histories: "تاریخچه",
  charges: "شارژها",
  balance: "مانده حساب",
  notAvailable: "ثبت نشده",

  edit: "ویرایش",
  view: "مشاهده",

  searchByPerson: "جستجوی اشخاص",
  searchOnlyActivePersons: "جستجوی فقط بین اشخاص فعال",
  search: "جستجو",

  select: "انتخاب",
  searchPersonPlaceHolder: "جستجوی اشخاص ...",

  updatePerson: "ویرایش اطلاعات",
  updateInfo: "ثبت تغییرات",
  updatingInfo: "در حال ثبت تغییرات",

  areaM2: "مساحت (متر مربع)",
  floorNumber: "طبقه",
  ownerName: "مالک",
  renterName: "مستاجر",
  storeOrOffice: "تجاری / اداری",
  store: "تجاری",
  office: "اداری",
  kiosk: "مشاعات",

  // Add new labels for shop history
  addShopHistory: "ثبت تاریخچه واحد",
  shopHistoryDetails: "جزئیات تاریخچه واحد",
  ownership: "مالکیت",
  activePeriod: "دوره فعال",
  deactivePeriod: "دوره غیرفعال",
  rental: "اجاره",
  addingHistory: "در حال ثبت تاریخچه...",
  selectType: "انتخاب نوع",
  shop: "واحد",
  person: "شخص",

  optional: "اختیاری",

  // New translations for Charge Reference
  chargeReferenceList: "لیست شارژ مرجع",
  monthlyChargeList: "لیست شارژ ماهانه",
  proprietorChargeList: "لیست شارژ مالکانه",
  viewMonthlyList: "مشاهده لیست ماهانه",
  viewProprietorList: "مشاهده لیست مالکانه",
  loadingData: "درحال دریافت اطلاعات",
  errorOccurred: "خطایی رخ داده است",

  // New labels for GenerateShopAnnualChargeReferencePage
  generateShopsAnnualChargeReference: "ایجاد مرجع شارژ سالانه مغازه‌ها",
  chargeReferenceDetails: "جزئیات مرجع شارژ",
  shopMetricValue: "مقدار متریک مغازه",
  officeMetricValue: "مقدار متریک دفتر",
  generating: "در حال ایجاد...",
  generateChargeReference: "ایجاد مرجع شارژ",

  // New labels for GenerateShopChargeReferencePage
  generateShopChargeReference: "ایجاد مرجع شارژ مغازه",
  shopConstantValue: "مقدار ثابت مغازه",
  officeConstantValue: "مقدار ثابت دفتر",

  // Common labels
  successMessage: "مرجع شارژ مغازه با موفقیت ایجاد شد",
  errorMessage: "خطا در ایجاد مرجع شارژ مغازه",
  generalErrorMessage: "خطایی هنگام ایجاد مرجع شارژ مغازه رخ داد",

  // Add new label for all shop history page
  allShopHistory: "تاریخچه همه واحدها",
  loadingShopHistory: "در حال بارگذاری تاریخچه واحدها...",
  historiesNotFound: "تاریخچه‌ای یافت نشد",
  shopHistory: "تاریخچه واحد",
  personHistory: "تاریخچه شخص",

  removeShopRenter: "حذف مستاجر واحد",
  endRentalAgreement: "پایان قرارداد اجاره",
  noCurrentRenter: "مستاجری ندارد",
  removingRenter: "در حال حذف مستاجر...",
  removeRenter: "حذف مستاجر",

  // Add new labels for update shop owner page
  updateShopOwner: "تغییر مالک واحد",
  changeShopOwner: "تغییر مالک",
  currentOwner: "مالک فعلی",
  newOwner: "مالک جدید",
  ownerChangeDate: "تاریخ تغییر مالکیت",
  updatingOwner: "در حال تغییر مالک...",
  selectRequiredFields: "لطفا واحد، مالک جدید و تاریخ تغییر را انتخاب کنید",
  ownerUpdateSuccess: "مالک واحد با موفقیت تغییر کرد",
  ownerUpdateError: "خطا در تغییر مالک واحد",

  // Add new labels for update shop renter page
  updateShopRenter: "تغییر مستاجر واحد",
  changeShopRenter: "تغییر مستاجر",
  currentRenter: "مستاجر فعلی",
  renterChangeDate: "تاریخ تغییر مستاجر",
  updatingRenter: "در حال تغییر مستاجر...",
  selectRequiredFieldsRenter:
    "لطفا واحد، مستاجر جدید و تاریخ تغییر را انتخاب کنید",
  renterUpdateSuccess: "مستاجر واحد با موفقیت تغییر کرد",
  renterUpdateError: "خطا در تغییر مستاجر واحد",
  newRenter: "مستاجر جدید",

  // Add new labels for update shop status page
  updateShopStatus: "تغییر وضعیت واحد",
  changeShopActiveStatus: "تغییر وضعیت فعال بودن واحد",
  statusChangeDate: "تاریخ تغییر وضعیت",
  updatingStatus: "در حال تغییر وضعیت...",
  activateShop: "فعال کردن واحد",
  deactivateShop: "غیرفعال کردن واحد",
  selectShopAndDate: "لطفا واحد و تاریخ تغییر را انتخاب کنید",
  shopStatusUpdateSuccess: "وضعیت واحد با موفقیت تغییر کرد",
  shopStatusUpdateError: "خطا در تغییر وضعیت واحد",

  // Add new labels for payment page
  addPayment: "ثبت پرداختی",
  paymentDetails: "جزییات پرداخت",
  selectUnit: "انتخاب واحد",
  payingPerson: "شخص پرداخت کننده",
  personNotOwnerOrRenter: "شخص انتخاب شده مالک یا مستاجر ملک مورد نظر نیست",
  paymentDate: "تاریخ پرداخت",
  amountInRials: "مبلغ به ریال",
  chargeType: "نوع شارژ",
  description: "توضیحات",
  paymentMethod: "نوع پرداخت",
  cash: "نقدی",
  cheque: "چک",
  posDevice: "دستگاه کارت خوان",
  bankTransfer: "کارت به کارت",
  otherMethods: "سایر روش ها",
  uploadReceiptImage: "آپلود تصویر رسید",
  receiptRequired:
    "در حالت کارت به کارت، چک و کارتخوان، آپلود عکس رسید الزامی هست",
  submitting: "در حال ثبت...",
  submit: "ثبت پرداختی",
  paymentAddedSuccess: "پرداختی با موفقیت ثبت شد",
  paymentAddedError: "خطا در ثبت پرداختی",
  selectRequiredFieldsPayment:
    "لطفا واحد، شخص پرداخت کننده، تاریخ پرداخت و مبلغ را انتخاب کنید",

  allPaymentsList: "لیست تمام پرداختی‌ها",
  paymentsNotFound: "پرداختی یافت نشد",
  loadingPayments: "در حال بارگذاری اطلاعات",
  errorLoadingPayments: "خطایی رخ داده است",

  searchPaymentsByPerson: "جستجوی پرداختی‌ها بر اساس شخص",
  selectPerson: "انتخاب شخص",

  searchPaymentsByShop: "جستجوی پرداختی‌ها بر اساس واحد",

  // Add new labels for balance page
  allShopsBalance: "مانده حساب همه واحدها",
  downloadAsPDF: "دانلود به صورت PDF",
  downloadAsExcel: "دانلود به صورت EXCEL",
  noDataFound: "اطلاعاتی یافت نشد",

  // Add new labels for person balance page
  personBalanceInfo: "اطلاعات مالی شخص",
  loadingPersonsData: "در حال بارگذاری اطلاعات اشخاص",
  errorLoadingPersons: "خطا در دریافت اطلاعات اشخاص",
  loadingFinancialData: "در حال بارگذاری اطلاعات مالی",
  errorLoadingFinancial: "خطا در دریافت اطلاعات مالی",
  personFinancialInfo: "اطلاعات مالی شخص",

  // Add new labels
  shopBalanceTitle: "حساب یک واحد",
  selectShop: "انتخاب واحد",
  relatedPersonsBalance: "حساب اشخاص مرتبط",
  noInformationFound: "هیچ اطلاعاتی یافت نشد",
  loadingShopsData: "در حال بارگذاری اطلاعات واحدها",
  unitAccountBalance: "مانده حساب واحد",
  personsAccountBalance: "مانده حساب اشخاص",
  errorLoadingShops: "خطا در بارگذاری اطلاعات واحدها",

  // Add new labels
  addChargeByAmount: "ثبت شارژ بر اساس مبلغ",
  chargeDetails: "جزئیات شارژ",
  owner: "مالک",
  renter: "مستاجر",
  noRenter: "بدون مستاجر",
  chargeDate: "تاریخ شارژ",
  addingCharge: "در حال ثبت شارژ...",
  addCharge: "ثبت شارژ",
  fillRequiredFields:
    "لطفا تمامی فیلدهای الزامی را پر کنید: واحد، شخص، تاریخ شارژ، مبلغ و عنوان",
  failedToAddCharge: "خطا در ثبت شارژ",

  // Add new labels for add charge to shop page
  addChargeToShop: "ثبت شارژ برای واحد",
  chargeMonth: "ماه شارژ",
  addingChargeToShop: "در حال ثبت شارژ...",
  pleaseSelectShop: "لطفا یک واحد را انتخاب کنید",
  chargeAddedSuccess: "شارژ با موفقیت ثبت شد",
  errorAddingCharge: "خطایی در ثبت شارژ رخ داد",

  // Add new labels for add charges to all shops page
  addChargesToAllShops: "ثبت شارژ برای همه واحدها",
  addingChargesToAllShops: "در حال ثبت شارژ...",
  chargesAddedSuccess: "شارژ با موفقیت برای همه واحدها ثبت شد",
  failedToAddCharges: "خطا در ثبت شارژ برای همه واحدها",
  chargeDetailsTitle: "جزئیات شارژ",

  // Add new label for all charges page
  allChargesTitle: "همه شارژها",
  chargesNotFound: "شارژی یافت نشد",
  personCharges: "شارژهای شخص",
  // Add new labels
  findChargesByShop: "جستجوی شارژها بر اساس واحد",
  loadingShopData: "در حال بارگذاری اطلاعات واحد",
  allShops: "همه واحدها",

  // Add new labels for add shop page
  addNewShop: "ثبت واحد جدید",
  shopDetails: "مشخصات واحد",
  addingShop: "در حال ثبت واحد...",
  plaqueNumber: "شماره پلاک",

  editShopInfo: "ویرایش اطلاعات واحد",
  selectShopForEdit: "انتخاب واحد",
  pleaseSelectShopForEdit: "لطفاً یک واحد را برای ویرایش انتخاب کنید",
  updatingShopInfo: "در حال به‌روزرسانی...",
  updateShopInfo: "به‌روزرسانی اطلاعات واحد",
  shopUpdateSuccess: "اطلاعات واحد با موفقیت به‌روزرسانی شد",
  shopUpdateError: "خطا در به‌روزرسانی اطلاعات واحد",

  // Add these new labels
  somethingWentWrong: "خطایی رخ داده است",
  shopNotFound: "واحد یافت نشد",

  // cost labels
  electricity: "برق",
  water: "آب",
  gas: "گاز",
  elevator: "آسانسور",
  escalator: "پله برقی",
  chiller: "چیلر",
  cleaning: "نظافت",
  security: "امنیت",
  other: "سایر",

  // Add new labels for add cost page
  addCost: "ثبت هزینه",
  costDetails: "جزئیات ثبت هزینه",
  addingCost: "در حال ثبت هزینه...",
  addCostButton: "ثبت هزینه",
  costAddedSuccess: "هزینه با موفقیت ثبت شد",
  costAddedError: "خطا در ثبت هزینه",
  selectRequiredFieldsCost:
    "لطفا عنوان، مبلغ، تاریخ، توضیحات و نوع هزینه را انتخاب کنید",
  costDate: "تاریخ",
  costFrom: "هزینه از",
  costCategory: "دسته بندی",
  uploadBillImage: "آپلود تصویر رسید",

  allCostsTitle: "همه هزینه‌ها",
  addNewCost: "ثبت هزینه جدید",
  costsNotFound: "هزینه‌ای یافت نشد",
  noDescription: "بدون توضیحات",
  noImage: "بدون تصویر",
  all: "همه",

  addIncome:"",
  incomeDetails:"",
  incomeAddedError:"",
  selectRequiredFieldsIncome:
    "لطفا عنوان، مبلغ، تاریخ، توضیحات و نوع درآمد را انتخاب کنید",
    proprietorIncome:"",
    addingIncome:"",
    addIncomeButton:"",
    incomeDate:"",
};
