"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddBankDataFromFile } from "@/tanstack/mutation/importMutation";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { toast } from "sonner";
import { BankDataUpload } from "@/components/upload-file/UploadBankFile";
import { BankPreviewTable } from "@/components/upload-file/BankPreviewTable";
import { BankTransactionData } from "@/components/upload-file/readFile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { labels } from "@/utils/label";
import { cn } from "@/lib/utils";
import { AccountType } from "@prisma/client";
import { Button } from "@/components/ui/button";

export default function UploadBankData() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<BankTransactionData[]>([]);
  const [bankAccountNumber, setBankAccountNumber] = React.useState<string>("");
  const [accountType, setAccountType] = React.useState<AccountType>("BUSINESS");

  // Create an adapted mutation function
  const adaptedMutationFn = async (chunk: BankTransactionData[]) => {
    return mutationAddBankData.mutateAsync({
      accountType,
      bankAccountNumber, // You need to get this from somewhere
      data: chunk,
    });
  };

  const mutationAddBankData = useAddBankDataFromFile();
  const { isUploading, progress, uploadStats, uploadData, resetUpload } =
    useChunkedUpload<BankTransactionData>({
      mutationFn: adaptedMutationFn,
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
        <div
          className={cn(
            "w-full p-4",
            "flex flex-row items-center justify-start gap-4"
          )}
        >
          <Label className="w-36">{labels.bankAccountNumber}</Label>
          <Input
            value={bankAccountNumber}
            onChange={(event) => {
              setBankAccountNumber(event.target.value);
            }}
          />
        </div>
        <div
          className={cn(
            "w-full p-4",
            "flex flex-row items-center justify-start gap-4"
          )}
        >
          <Label className="w-28">{labels.accountType}</Label>
          <Button
            variant="outline"
            onClick={() => {
              setAccountType("BUSINESS");
            }}
            className={cn(accountType === "BUSINESS" && "bg-primary")}
          >
            {labels.businessType}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAccountType("PROPRIETOR");
            }}
            className={cn(accountType === "PROPRIETOR" && "bg-primary")}
          >
            {labels.proprietorType}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAccountType("GENERAL");
            }}
            className={cn(accountType === "GENERAL" && "bg-primary")}

          >
            {labels.generalType}
          </Button>
        </div>
        <BankDataUpload
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          loading={isUploading}
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium ">
              <span>
                درحال پردازش: {uploadStats.totalProcessed}/{parsedData.length}
                رکورد
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 ">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs  flex justify-between">
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
