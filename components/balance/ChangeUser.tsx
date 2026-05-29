"use client";

import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import { labels } from "@/utils/label";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Charge, Payment } from "@prisma/client";
import { useUpdateChargeUser } from "@/tanstack/mutation/chargeMutation";
import { useUpdatePaymentUser } from "@/tanstack/mutation/paymentMutation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "../CustomSelect";

export type BalanceTransactionRow =
  | (Charge & { type: "charge" })
  | (Payment & { type: "payment" });

interface ChangeUserProps {
  transaction: BalanceTransactionRow;
  onSuccess: () => void;
}

export default function ChangeUser({ transaction, onSuccess }: ChangeUserProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("");

  const updateCharge = useUpdateChargeUser();
  const updatePayment = useUpdatePaymentUser();
  const mutationPending =
    updateCharge.isPending || updatePayment.isPending;

  const { data: personsData } = useFindAllPersons();

  const { personsAll, setPersonsAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
    })),
  );

  useEffect(() => {
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [personsData, setPersonsAll]);

  useEffect(() => {
    setSelectedPersonId("");
  }, [transaction.id, transaction.type]);

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  const hasSelection = Boolean(selectedPersonId);
  const isDifferentPerson = selectedPersonId !== transaction.personId;
  const hasPersonOptions = personOptions.length > 0;
  const canSubmit =
    hasSelection &&
    isDifferentPerson &&
    !mutationPending &&
    hasPersonOptions;

  const handleSubmit = async () => {
    if (!hasSelection) {
      toast.error(labels.pleaseSelectAPerson);
      return;
    }
    if (!isDifferentPerson) {
      return;
    }
    if (!hasPersonOptions) {
      toast.error(labels.errorLoadingPersons);
      return;
    }

    const payloadBase = {
      userId: selectedPersonId,
      shopId: transaction.shopId,
    };

    try {
      if (transaction.type === "charge") {
        const result = await updateCharge.mutateAsync({
          ...payloadBase,
          chargeId: transaction.id,
        });
        if (result.success) {
          onSuccess();
        }
        return;
      }

      const result = await updatePayment.mutateAsync({
        ...payloadBase,
        paymentId: transaction.id,
      });
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : transaction.type === "charge"
            ? labels.errorLoadingCharges
            : labels.errorLoadingPayments,
      );
    }
  };

  const kindLabel =
    transaction.type === "charge" ? labels.charge : labels.payment;

  return (
    <div className="space-y-4">
      <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
        <p>
          <span className="text-muted-foreground">
            {labels.transactionKindShort}
            {": "}
          </span>
          <span>{kindLabel}</span>
        </p>
        <p>
          <span className="text-muted-foreground">{labels.title}:</span>{" "}
          {transaction.title}
        </p>
        <p>
          <span className="text-muted-foreground">{labels.amount}:</span>{" "}
          {transaction.amount.toLocaleString()}
        </p>
        <p>
          <span className="text-muted-foreground">{labels.currentPerson}</span>
          {": "}
          {transaction.personName}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance-change-person-trigger">{labels.personName}</Label>
        <div id="balance-change-person-trigger">
          <CustomSelect
            options={personOptions}
            value={selectedPersonId}
            onChange={setSelectedPersonId}
            label={labels.person}
            disabled={mutationPending || !hasPersonOptions}
            inline
          />
        </div>
      </div>
      {!hasPersonOptions && (
        <p className="text-xs text-destructive">{labels.errorLoadingPersons}</p>
      )}
      {hasPersonOptions && !hasSelection && (
        <p className="text-xs text-muted-foreground">
          {labels.pleaseSelectAPerson}
        </p>
      )}
      {hasPersonOptions && hasSelection && !isDifferentPerson && (
        <p className="text-xs text-muted-foreground">
          {labels.selectDifferentPersonHint}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSubmit()}
          disabled={mutationPending || !canSubmit}
          className="inline-flex items-center gap-2"
          aria-busy={mutationPending}
        >
          {mutationPending ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              <span>{labels.updatingInfo}</span>
            </>
          ) : (
            labels.updateInfo
          )}
        </Button>
      </div>
    </div>
  );
}
