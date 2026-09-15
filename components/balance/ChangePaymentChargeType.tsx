"use client";

import React, { useEffect, useState } from "react";
import { Payment } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { labels } from "@/utils/label";
import { useUpdatePaymentProprietor } from "@/tanstack/mutation/paymentMutation";
import { useGetPaymentBucketPreview } from "@/tanstack/query/paymentQuery";

interface ChangePaymentChargeTypeProps {
  payment: Payment;
  onSuccess: () => void;
}

/**
 * Moves one payment between the monthly and مالکانه balance lists.
 *
 * The charge type is binary, so there is no picker — the only move available is
 * to the other type, and the button says which. The optional person update is
 * resolved on the server from the payment's own date; the name it would produce
 * is shown here first so the checkbox is never ticked blind.
 */
export default function ChangePaymentChargeType({
  payment,
  onSuccess,
}: ChangePaymentChargeTypeProps) {
  const [reassignPerson, setReassignPerson] = useState(false);

  const updateProprietor = useUpdatePaymentProprietor();
  const { data: previewResponse, isLoading: previewLoading } =
    useGetPaymentBucketPreview(payment.id);

  useEffect(() => {
    setReassignPerson(false);
  }, [payment.id]);

  const preview = previewResponse?.success ? previewResponse.data : undefined;

  // The target is always the opposite type.
  const targetProprietor = !payment.proprietor;

  // A null monthly name is the server saying this shop type has no monthly
  // list at all (پارکینگ، تابلو), so the move would remove the payment from
  // every list rather than move it.
  const monthlyAvailable = preview ? preview.monthlyPersonName !== null : true;
  const blocked = !targetProprietor && !monthlyAvailable;

  const targetPersonName = targetProprietor
    ? preview?.proprietorPersonName
    : preview?.monthlyPersonName;

  const currentTypeLabel = payment.proprietor
    ? labels.proprietorCharge
    : labels.monthlyCharge;
  const targetTypeLabel = targetProprietor
    ? labels.proprietorCharge
    : labels.monthlyCharge;

  const handleSubmit = async () => {
    if (blocked) {
      toast.error(labels.monthlyUnavailableForShopType);
      return;
    }

    try {
      const result = await updateProprietor.mutateAsync({
        paymentId: payment.id,
        shopId: payment.shopId,
        proprietor: targetProprietor,
        reassignPerson,
      });
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : labels.errorLoadingPayments,
      );
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-sm font-medium">{labels.changePaymentChargeType}</p>

      <p className="text-sm">
        <span className="text-muted-foreground">
          {labels.currentChargeType}
          {": "}
        </span>
        <span>{currentTypeLabel}</span>
      </p>

      <div className="flex items-start gap-2">
        <Checkbox
          id="reassign-person"
          checked={reassignPerson}
          onCheckedChange={(checked) => setReassignPerson(checked === true)}
          disabled={updateProprietor.isPending || blocked}
        />
        <div className="space-y-1">
          <Label htmlFor="reassign-person" className="text-sm font-normal">
            {labels.alsoUpdatePerson}
          </Label>
          {reassignPerson && (
            <p className="text-xs text-muted-foreground">
              {previewLoading ? (
                labels.loadingData
              ) : targetPersonName ? (
                <>
                  {labels.personAfterChange}
                  {": "}
                  <span className="font-medium text-foreground">
                    {targetPersonName}
                  </span>
                </>
              ) : null}
            </p>
          )}
          {reassignPerson && preview && !preview.fromHistory && (
            <p className="text-xs text-muted-foreground">
              {labels.noHistoryForPaymentDateHint}
            </p>
          )}
        </div>
      </div>

      {blocked && (
        <p className="text-xs text-destructive">
          {labels.monthlyUnavailableForShopType}
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() => void handleSubmit()}
        disabled={updateProprietor.isPending || blocked}
        className="inline-flex items-center gap-2"
        aria-busy={updateProprietor.isPending}
      >
        {updateProprietor.isPending ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <span>{labels.updatingInfo}</span>
          </>
        ) : (
          `${labels.changePaymentChargeType} ← ${targetTypeLabel}`
        )}
      </Button>
    </div>
  );
}
