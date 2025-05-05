"use client";
import { useAddPaymentFromCard } from "@/tanstack/mutations";
import React from "react";
import { Button } from "../ui/button";

function AddPaymentButton({ id }: { id: string }) {
  const [isMutating, setIsMutating] = React.useState<boolean>(false);
  const addMutation = useAddPaymentFromCard();

  function registerHandler() {
    setIsMutating(true);
    addMutation.mutate(id, {
      onSettled: () => {
        setIsMutating(false);
      },
    });
  }
  return (
    <Button variant="outline" disabled={isMutating} onClick={registerHandler}>
      {isMutating ? "در حال ثبت" : "ثبت پرداخت"}
    </Button>
  );
}

export default AddPaymentButton;
