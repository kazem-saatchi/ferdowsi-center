"use client";

import splitHistories from "@/app/api/actions/charge/addChargeByShop";

async function ChargesByShop() {
    await splitHistories({shopId:"64dcdc00-36ad-40f1-92d1-50476e306a8f",fromDate:new Date("2024-12-21 17:08:11.617"),ToDate:new Date("2024-12-31 00:00:00")})
  return <div>ChargesByShop</div>;
}

export default ChargesByShop;
