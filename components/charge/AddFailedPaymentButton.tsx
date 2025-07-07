"use client";
import React from "react";
import { useAddFailedPayment } from "@/tanstack/mutation/paymentMutation";
import { Button } from "../ui/button";

function AddFailedPaymentButton({ id }: { id: string }) {
  const [isMutating, setIsMutating] = React.useState<boolean>(false);
  const [isRegistred, setIsRegistred] = React.useState<boolean>(false);
  const addMutation = useAddFailedPayment();

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
      {!isRegistred && !isMutating && "ثبت برگشتی"}
      {isRegistred && "ثبت شده"}
    </Button>
  );
}

export default AddFailedPaymentButton;
