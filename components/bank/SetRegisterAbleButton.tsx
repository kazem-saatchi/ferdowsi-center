import React from "react";
import { Button } from "../ui/button";
import { useSetRegisterAble } from "@/tanstack/mutations";

function SetRegisterAbleButton({ id }: { id: string }) {
  const [isMutating, setIsMutating] = React.useState<boolean>(false);
  const [isRegistred, setIsRegistred] = React.useState<boolean>(false);
  const addMutation = useSetRegisterAble();

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
      variant="destructive"
      disabled={isMutating || isRegistred}
      onClick={registerHandler}
    >
      {!isRegistred && isMutating && "در حال انجام"}
      {!isRegistred && !isMutating && "حذف"}
      {isRegistred && "انجام شد"}
    </Button>
  );
}

export default SetRegisterAbleButton;
