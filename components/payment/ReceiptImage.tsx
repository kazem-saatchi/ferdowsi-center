import { labels } from "@/utils/label";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageProps {
  src: string;
  viewPage: Dispatch<SetStateAction<boolean>>;
}

/** The receipt in a dialog: it follows the theme, closes on Escape and on a
 *  click outside, and keeps focus inside while open. */
function ReceiptImage({ viewPage, src }: ImageProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && viewPage(false)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogTitle>{labels.receiptImage}</DialogTitle>
        <Image
          alt={labels.receiptImage}
          src={src || "/placeholder.svg"}
          width={800}
          height={800}
          className="object-contain"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => viewPage(false)}>
            {labels.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptImage;
