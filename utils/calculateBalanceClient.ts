import {
  RawTransactionShopData,
  ShopBalanceDetails,
  ShopsBalanceData,
} from "@/schema/balanceSchema";

/**
 * Calculate all three balance types for a single shop from raw transaction data
 * Filters transactions by proprietor flag (monthly=false, yearly=true)
 */
export function calculateShopBalanceDetailsOnClient(
  shopData: RawTransactionShopData,
  proprietor: boolean = false
): ShopBalanceDetails {
  // Filter charges and payments by proprietor flag
  const chargesForType = shopData.charges.filter(
    (c) => c.proprietor === proprietor
  );
  const paymentsForType = shopData.payments.filter(
    (p) => p.proprietor === proprietor
  );

  // Calculate total charges and payments for this proprietor type
  const totalCharges = chargesForType.reduce((sum, c) => sum + c.amount, 0);
  const totalPayments = paymentsForType.reduce((sum, p) => sum + p.amount, 0);

  // Total Balance = All Payments - All Charges (for this proprietor type)
  const totalBalance = totalPayments - totalCharges;

  // Owner Balance: exclude renter transactions
  // Owner charges: charges where personId != renterId AND proprietor flag matches
  // Owner payments: payments where personId != renterId AND proprietor flag matches
  const ownerCharges = chargesForType
    .filter((c) => c.personId !== shopData.renterId)
    .reduce((sum, c) => sum + c.amount, 0);

  const ownerPayments = paymentsForType
    .filter((p) => p.personId !== shopData.renterId)
    .reduce((sum, p) => sum + p.amount, 0);

  const ownerBalance = ownerPayments - ownerCharges;

  // Renter Balance: only renter transactions (personId == renterId)
  // Only applicable if there is a renter
  let renterBalance = 0;
  if (shopData.renterId) {
    const renterCharges = chargesForType
      .filter((c) => c.personId === shopData.renterId)
      .reduce((sum, c) => sum + c.amount, 0);

    const renterPayments = paymentsForType
      .filter((p) => p.personId === shopData.renterId)
      .reduce((sum, p) => sum + p.amount, 0);

    renterBalance = renterPayments - renterCharges;
  }

  return {
    plaque: shopData.plaque,
    ownerName: shopData.ownerName,
    renterName: shopData.renterName,
    totalBalance,
    ownerBalance,
    renterBalance,
  };
}

/**
 * Calculate balances for all shops on the client side
 * proprietor=false for monthly balances, proprietor=true for yearly balances
 */
export function calculateAllShopsBalanceDetailsOnClient(
  rawShopsData: RawTransactionShopData[],
  proprietor: boolean = false
): ShopBalanceDetails[] {
  return rawShopsData.map((shop) =>
    calculateShopBalanceDetailsOnClient(shop, proprietor)
  );
}

/**
 * Calculate total balance across all shops
 */
export function calculateTotalBalance(balances: ShopBalanceDetails[]): number {
  return balances.reduce((sum, shop) => sum + shop.totalBalance, 0);
}

/**
 * Calculate total owner balance across all shops
 */
export function calculateTotalOwnerBalance(
  balances: ShopBalanceDetails[]
): number {
  return balances.reduce((sum, shop) => sum + shop.ownerBalance, 0);
}

/**
 * Calculate total renter balance across all shops
 */
export function calculateTotalRenterBalance(
  balances: ShopBalanceDetails[]
): number {
  return balances.reduce((sum, shop) => sum + shop.renterBalance, 0);
}

/**
 * Convert ShopBalanceDetails to ShopsBalanceData (using totalBalance for compatibility)
 */
export function convertToShopsBalanceData(
  balances: ShopBalanceDetails[]
): ShopsBalanceData[] {
  return balances.map((balance) => ({
    plaque: balance.plaque,
    balance: balance.totalBalance,
    ownerName: balance.ownerName,
    renterName: balance.renterName,
  }));
}
