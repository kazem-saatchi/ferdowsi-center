"use client";

import React from "react";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { useAddBankDataFromFile } from "@/tanstack/mutation/importMutation";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { toast } from "sonner";
import { BankDataUpload } from "@/components/upload-file/UploadBankFile";
import { BankPreviewTable } from "@/components/upload-file/BankPreviewTable";
import { BankTransactionData } from "@/components/upload-file/readFile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { labels } from "@/utils/label";
import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
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
    uploadData(parsedData);
  };

  return (
    <Page>
      <PageHeader>
        <PageTitle>آپلود اطلاعات بانک</PageTitle>
      </PageHeader>
      <PageBody className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">{labels.bankAccountNumber}</Label>
          <Input
            id="bankAccountNumber"
            dir="ltr"
            className="text-left"
            value={bankAccountNumber}
            onChange={(event) => {
              setBankAccountNumber(event.target.value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label id="accountType-label">{labels.accountType}</Label>
          <div
            role="group"
            aria-labelledby="accountType-label"
            className="flex flex-wrap gap-2"
          >
            <Button
              type="button"
              variant={accountType === "BUSINESS" ? "default" : "outline"}
              aria-pressed={accountType === "BUSINESS"}
              onClick={() => setAccountType("BUSINESS")}
            >
              {labels.businessType}
            </Button>
            <Button
              type="button"
              variant={accountType === "PROPRIETOR" ? "default" : "outline"}
              aria-pressed={accountType === "PROPRIETOR"}
              onClick={() => setAccountType("PROPRIETOR")}
            >
              {labels.proprietorType}
            </Button>
            <Button
              type="button"
              variant={accountType === "GENERAL" ? "default" : "outline"}
              aria-pressed={accountType === "GENERAL"}
              onClick={() => setAccountType("GENERAL")}
            >
              {labels.generalType}
            </Button>
          </div>
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
                درحال پردازش: {formatNumber(uploadStats.totalProcessed)}/
                {formatNumber(parsedData.length)} رکورد
              </span>
              <span>{toPersianDigits(progress)}٪</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 ">
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
      </PageBody>
    </Page>
  );
}
