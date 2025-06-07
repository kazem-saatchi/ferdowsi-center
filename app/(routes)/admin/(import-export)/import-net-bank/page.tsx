"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddNetBankDataFromFile } from "@/tanstack/mutation/importMutation";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { toast } from "sonner";
import { NetBankTransactionData } from "@/components/upload-file/readFile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { labels } from "@/utils/label";
import { cn } from "@/lib/utils";
import { AccountType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { UploadNetBankData } from "@/components/upload-file/UploadNetBankFile";
import { NetBankPreviewTable } from "@/components/upload-file/NetBankPreviewTable";

const bankAccountNumberList = {
  PROPRIETOR: "2504-306",
  BUSINESS: "2504-101",
  GENERAL: null,
};

export default function UploadNetBankDataPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<NetBankTransactionData[]>(
    []
  );
  const [bankAccountNumber, setBankAccountNumber] = React.useState<
    string | null
  >(null);
  const [accountType, setAccountType] = React.useState<AccountType | null>(
    null
  );

  useEffect(() => {
    if (accountType) {
      setBankAccountNumber(bankAccountNumberList[accountType]);
    } else {
      setBankAccountNumber(null);
    }
  }, [accountType]);

  // Create an adapted mutation function
  const adaptedMutationFn = async (chunk: NetBankTransactionData[]) => {
    if (!accountType || !bankAccountNumber) {
      toast.error("نوع حساب را انتخاب کنید");
      return {
        success: false,
        message: "Account type and bank account number are required",
      };
    }
    return mutationAddBankData.mutateAsync({
      accountType,
      bankAccountNumber,
      data: chunk,
    });
  };

  const mutationAddBankData = useAddNetBankDataFromFile();
  const { isUploading, progress, uploadStats, uploadData, resetUpload } =
    useChunkedUpload<NetBankTransactionData>({
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
            value={bankAccountNumber ?? ""}
            onChange={(event) => {
              setBankAccountNumber(event.target.value);
            }}
            disabled
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
          {/* <Button
            variant="outline"
            onClick={() => {
              setAccountType("GENERAL");
            }}
            className={cn(accountType === "GENERAL" && "bg-primary")}
          >
            {labels.generalType}
          </Button> */}
        </div>
        <UploadNetBankData
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
          <NetBankPreviewTable data={parsedData} />
        )}
      </CardContent>
    </Card>
  );
}
