"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "../ui/dialog";
import { cn } from '@/lib/utils';
import { labels } from '@/utils/label';
import ChangeUser, { type BalanceTransactionRow } from './ChangeUser';
import { Button } from '../ui/button';

interface ChangeUserDialogProps {
  selectedTransaction: BalanceTransactionRow | null;
  setSelectedTransaction: (transaction: BalanceTransactionRow | null) => void;
}

export default function ChangeUserDialog({ selectedTransaction, setSelectedTransaction }: ChangeUserDialogProps) {
  return (
    <Dialog
    open={selectedTransaction !== null}
    onOpenChange={(open) => {
      if (!open) setSelectedTransaction(null);
    }}
  >
    <DialogContent
      className={cn(
        "flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
        "[&>button.absolute]:hidden",
      )}
    >
      <DialogHeader className="space-y-1 border-b bg-muted/40 px-6 py-4 text-right sm:text-right">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          {labels.changeBalanceRowPerson}
        </DialogTitle>
        <DialogDescription className="text-sm font-normal text-muted-foreground">
          {labels.changeBalanceRowPersonDescription}
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {selectedTransaction ? (
          <ChangeUser
            transaction={selectedTransaction}
            onSuccess={() => setSelectedTransaction(null)}
          />
        ) : null}
      </div>
      <DialogFooter className="border-t bg-muted/20 px-6 py-3 sm:justify-start">
        <Button
          type="button"
          variant="secondary"
          className="min-w-[7rem]"
          onClick={() => setSelectedTransaction(null)}
        >
          {labels.close}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}
