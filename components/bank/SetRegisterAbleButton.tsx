import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { useSetRegisterAble } from "@/tanstack/mutations";

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

  function registerHandler() {
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
    <Button
      variant="destructive"
      disabled={isMutating || isRegistred}
      onClick={registerHandler}
      className="w-36"
    >
      {!isRegistred && isMutating && "در حال انجام"}
      {!isRegistred && !isMutating && "حذف"}
      {isRegistred && "انجام شد"}
    </Button>
  );
}

export default SetRegisterAbleButton;
