"use client";
import { useAddPaymentFromCard } from "@/tanstack/mutation/paymentMutation";
import React from "react";
import { Button } from "../ui/button";

function AddPaymentButton({ id }: { id: string }) {
  const [isMutating, setIsMutating] = React.useState<boolean>(false);
  const [isRegistred, setIsRegistred] = React.useState<boolean>(false);
  const addMutation = useAddPaymentFromCard();

  function registerHandler() {
    setIsMutating(true);
    addMutation.mutate(id, {
      onSuccess: (data) => {
        data.data?.success && setIsRegistred(true);
      },
      onSettled: () => {
        setIsMutating(false);
      },
    });
  }
  return (
    <Button
      variant="outline"
      disabled={isMutating || isRegistred}
      onClick={registerHandler}
    >
      {!isRegistred && isMutating && "در حال ثبت"}
      {!isRegistred && !isMutating && "ثبت پرداخت"}
      {isRegistred && "ثبت شده"}
    </Button>
  );
}

export default AddPaymentButton;
