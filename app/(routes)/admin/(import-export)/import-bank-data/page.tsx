"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddBankDataFromFile } from "@/tanstack/mutations";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { toast } from "sonner";
import { BankDataUpload } from "@/components/upload-file/UploadBankFile";
import { BankPreviewTable } from "@/components/upload-file/BankPreviewTable";
import { parseBankData } from "@/components/upload-file/parseBankData";
import { BankTransactionData } from "@/components/upload-file/readFile";

export default function UploadBankData() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<BankTransactionData[]>([]);

  const mutationAddBankData = useAddBankDataFromFile();
  const { isUploading, progress, uploadStats, uploadData, resetUpload } =
    useChunkedUpload<BankTransactionData>({
      mutationFn: mutationAddBankData.mutateAsync,
      invalidateQueries: ["all-persons", "all-shops", "all-histories"],
    });

  const handleFileChange = (selectedFile: File, data: any[]) => {
    setFile(selectedFile);
    setParsedData(data);
    resetUpload();
  };

  const handleUpload = () => {
    if (parsedData.length === 0 || !file) {
      toast.error("لطفا ابتدا یک فایل معتبر انتخاب و بارگذاری کنید.");
      return;
    }
    // console.log("bank transfer", parseBankData(parsedData));
    uploadData(parsedData);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>آپلود اطلاعات بانک</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BankDataUpload
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          loading={isUploading}
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>
                درحال پردازش: {uploadStats.totalProcessed}/{parsedData.length}{" "}
                رکورد
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>موفق: {uploadStats.totalAdded}</span>
              <span>ناموفق: {uploadStats.totalFailed}</span>
            </div>
          </div>
        )}

        {parsedData.length > 0 && !isUploading && (
          <BankPreviewTable data={parsedData} />
        )}
      </CardContent>
    </Card>
  );
}
