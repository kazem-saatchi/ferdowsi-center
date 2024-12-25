"use client";

import { Button } from "@/components/ui/button";
import { useAddChargeByShop } from "@/tanstack/mutations";

function ChargesByShop() {
  const addChargeMutation = useAddChargeByShop();

  const handleSubmit = async () => {
    addChargeMutation.mutate({
      shopId: "c48178a7-042d-4a76-8acc-45a93c18f8ae",
      fromDate: new Date("2024-12-21 00:00:00"),
      toDate: new Date("2024-12-31 00:00:00"),
      dailyAmount: 100,
    });
  };

  return (
    <div>
      ChargesByShop
      <Button onClick={handleSubmit}>Add</Button>
    </div>
  );
}

export default ChargesByShop;
