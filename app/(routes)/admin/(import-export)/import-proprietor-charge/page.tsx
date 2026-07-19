"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataFileUpload } from "@/components/upload-file/UploadImportFile";
import { PreviewTable } from "@/components/upload-file/PreviewTable";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { useAddProprietorCharge } from "@/tanstack/mutation/importMutation";
import { AddProprietorChargeData } from "@/schema/importSchema";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { labels } from "@/utils/label";
import { toast } from "sonner";

export default function UploadProprietorCharge() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [previewData, setPreviewData] = React.useState<any[]>([]);

  const [date, setDate] = React.useState<Date | null>(new Date());
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");

  const mutationAddProprietorCharge = useAddProprietorCharge();
  const { isUploading, progress, uploadStats, uploadData, resetUpload } =
    useChunkedUpload<AddProprietorChargeData>({
      mutationFn: mutationAddProprietorCharge.mutateAsync,
      invalidateQueries: ["all-charges", "all-histories", "all-shops-balance"],
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
    if (!title.trim()) {
      toast.error("عنوان شارژ را وارد کنید");
      return;
    }
    if (!date) {
      toast.error("تاریخ را انتخاب کنید");
      return;
    }

    // Merge the page-level title/date/description into every row from the file.
    const isoDate = date.toISOString();
    const rows: AddProprietorChargeData[] = parsedData.map((row) => ({
      plaque: Number(row.plaque),
      amount: Number(row.amount),
      title: title.trim(),
      date: isoDate,
      description: description.trim(),
    }));

    uploadData(rows);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>آپلود شارژ مالکانه با فایل</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-500">
          فایل اکسل باید دارای دو ستون <span className="font-medium">plaque</span>{" "}
          (پلاک) و <span className="font-medium">amount</span> (مبلغ) باشد. عنوان،
          تاریخ و توضیحات یک بار در این صفحه وارد شده و برای همه ردیف‌ها اعمال
          می‌شود. شارژ به نام مالک هر واحد ثبت می‌شود.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <JalaliDayCalendar date={date} setDate={setDate} title={labels.date} />

          <div className="space-y-2">
            <Label htmlFor="title">{labels.title}</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان شارژ را وارد کنید"
              className="text-right"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="description">{labels.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات (اختیاری)"
              className="text-right min-h-[80px]"
              maxLength={250}
            />
            <p className="text-sm text-gray-500 text-left">
              {description.length}/250
            </p>
          </div>
        </div>

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
            <div className="text-xs  flex justify-between">
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
