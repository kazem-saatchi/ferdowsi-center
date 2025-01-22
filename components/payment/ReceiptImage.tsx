import { labels } from "@/utils/label";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

interface ImageProps {
  src: string;
  viewPage: Dispatch<SetStateAction<boolean>>;
}

function ReceiptImage({ viewPage, src }: ImageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => viewPage(false)}>
      <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <Image
          alt="receipt image"
          src={src || "/placeholder.svg"}
          width={800}
          height={800}
          className="object-contain"
        />
        <button 
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          onClick={() => viewPage(false)}
        >
          {labels.close}
        </button>
      </div>
    </div>
  );
}

export default ReceiptImage;

