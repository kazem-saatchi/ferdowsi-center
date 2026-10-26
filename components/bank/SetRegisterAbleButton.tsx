import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { useSetRegisterAble } from "@/tanstack/mutation/incomeCostMutation";
import { useConfirm } from "@/components/ConfirmDialog";

function SetRegisterAbleButton({
  id,
  cancelFn,
}: {
  id: string;
  cancelFn?: Dispatch<SetStateAction<string | null>>;
}) {
  const [isMutating, setIsMutating] = React.useState<boolean>(false);
  const [isRegistred, setIsRegistred] = React.useState<boolean>(false);
  const addMutation = useSetRegisterAble();
  const { confirm, dialog } = useConfirm();

  async function registerHandler() {
    const ok = await confirm({
      title: "این تراکنش از لیست پرداخت‌های ثبت‌نشده حذف شود؟",
      description:
        "برای تراکنش‌هایی که پرداخت شارژ نیستند. پرداختی برای هیچ واحدی ثبت نمی‌شود.",
      confirmLabel: "حذف از لیست",
      destructive: true,
    });
    if (!ok) return;
    setIsMutating(true);
    addMutation.mutate(id, {
      onSuccess: (data) => {
        data.data?.success && setIsRegistred(true);
        cancelFn && cancelFn(null);
      },
      onSettled: () => {
        setIsMutating(false);
      },
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={isMutating || isRegistred}
        onClick={registerHandler}
        className="w-36"
      >
        {!isRegistred && isMutating && "در حال انجام"}
        {!isRegistred && !isMutating && "حذف"}
        {isRegistred && "انجام شد"}
      </Button>
      {dialog}
    </>
  );
}

export default SetRegisterAbleButton;
