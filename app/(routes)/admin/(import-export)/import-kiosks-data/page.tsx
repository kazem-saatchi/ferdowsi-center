"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataFileUpload } from "@/components/upload-file/UploadImportFile";
import { PreviewTable } from "@/components/upload-file/PreviewTable";
import { useAddKiosks } from "@/tanstack/mutation/importMutation";
import { AddKioskData } from "@/schema/importSchema";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { toast } from "sonner";

export default function UploadKioskData() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<AddKioskData[]>([]);
  const [previewData, setPreviewData] = React.useState<any[]>([]);

  const mutationAddKiosks = useAddKiosks();
  
  const { isUploading, progress, uploadStats, uploadData, resetUpload } =
    useChunkedUpload<AddKioskData>({
      mutationFn: mutationAddKiosks.mutateAsync,
      invalidateQueries: ["all-persons", "all-shops", "all-histories"],
    });

  const handleFileChange = (selectedFile: File, data: any[]) => {
    setFile(selectedFile);
    setParsedData(data);
    setPreviewData(data);
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
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>آپلود اطلاعات غرفه ها، تابلوها و پارکینگ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DataFileUpload
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          loading={isUploading}
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium ">
              <span>
                درحال پردازش: {uploadStats.totalProcessed}/{parsedData.length}{" "}
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
            <div className="text-xs flex justify-between">
              <span>موفق: {uploadStats.totalAdded}</span>
              <span>ناموفق: {uploadStats.totalFailed}</span>
            </div>
          </div>
        )}

        {previewData.length > 0 && !isUploading && (
          <PreviewTable data={previewData} />
        )}
      </CardContent>
    </Card>
  );
}
