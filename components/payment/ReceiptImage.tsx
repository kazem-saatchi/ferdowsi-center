import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

interface ImageProps {
  src: string;
  viewPage: Dispatch<SetStateAction<boolean>>;
}

function ReceiptImage({ viewPage, src }: ImageProps) {
  return (
    <Image
      alt="receipt image"
      src={src}
      width="400"
      height="400"
      onClick={() => {
        viewPage(false);
      }}
    />
  );
}

export default ReceiptImage;
