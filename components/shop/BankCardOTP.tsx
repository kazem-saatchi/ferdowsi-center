import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

function BankCardOTP({title}:{title:"bankCardMonthly" |"bankCardYearly"}) {
  const { newShop, setNewShop } = useStore(
    useShallow((state) => ({
      newShop: state.newShop,
      setNewShop: state.setNewShop,
    }))
  );

  return (
    <div className="w-full" dir="ltr">
      <InputOTP
        maxLength={16}
        value={newShop[title]}
        onChange={(value) => setNewShop(title,value)}
        containerClassName="w-full mx-auto justify-around"
      >
        <InputOTPGroup className="w-24 sm:w-28">
          <InputOTPSlot index={0} className="" />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator className="hidden lg:flex" />
        <InputOTPGroup className="w-24 sm:w-28">
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
        </InputOTPGroup>
        <InputOTPSeparator className="hidden lg:flex" />
        <InputOTPGroup className="w-24 sm:w-28">
          <InputOTPSlot index={8} />
          <InputOTPSlot index={9} />
          <InputOTPSlot index={10} />
          <InputOTPSlot index={11} />
        </InputOTPGroup>
        <InputOTPSeparator className="hidden lg:flex" />
        <InputOTPGroup className="w-24 sm:w-28">
          <InputOTPSlot index={12} />
          <InputOTPSlot index={13} />
          <InputOTPSlot index={14} />
          <InputOTPSlot index={15} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

export default BankCardOTP;
