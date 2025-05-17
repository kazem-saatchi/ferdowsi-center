"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parseNetBankFile } from "./readFile";

interface BankDataProps {
  onFileChange: (file: File, data: any[]) => void;
  onUpload: () => void;
  loading: boolean;
}

export function UploadNetBankData({
  onFileChange,
  onUpload,
  loading,
}: BankDataProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setFileName(file.name);

      try {
        const data = await parseNetBankFile(file);
        onFileChange(file, data);
      } catch (error) {
        toast.error("خطا در خواندن اطلاعات");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "cursor-pointer inline-flex items-center justify-center rounded-md",
            "text-sm font-medium ring-offset-background transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          )}
        >
          انتخاب فایل
        </label>
        <span className="text-sm text-gray-500">
          {fileName || "فایلی انتخاب نشده است"}
        </span>
      </div>
      <Button
        onClick={onUpload}
        className="w-full"
        disabled={loading || !fileName}
      >
        <Upload className="mr-2 h-4 w-4" />
        {loading ? "در حال بارگذاری" : "بارگذاری اطلاعات"}
      </Button>
    </div>
  );
}
