import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";

interface CardFormProps {
  title: string;
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function BankCardOTPForm({ title, value, handleChange }: CardFormProps) {
  return (
    <div className="w-full" dir="ltr">
      <InputOTP
        id={title}
        name={title}
        maxLength={16}
        value={value}
        onChange={(value) => {
          handleChange;
        }}
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

export default BankCardOTPForm;
