import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UploadStats {
  totalAdded: number;
  totalFailed: number;
  totalProcessed: number;
}

interface UseChunkedUploadOptions<T> {
  mutationFn: (chunk: T[]) => Promise<{
    success: boolean;
    message?: string;
    data?: { addedShops: number; failedShops: number; processed: number };
  }>;
  onSuccess?: (stats: UploadStats) => void;
  onError?: (error: unknown) => void;
  invalidateQueries?: string[];
}

export function useChunkedUpload<T>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseChunkedUploadOptions<T>) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalAdded: 0,
    totalFailed: 0,
    totalProcessed: 0,
  });

  const uploadData = async (data: T[], chunkSize = 10) => {
    if (data.length === 0) {
      toast.error("لطفا ابتدا یک فایل معتبر انتخاب و بارگذاری کنید.");
      return;
    }
    if (isUploading) {
      toast.info("بارگذاری در حال انجام است.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0 });

    let currentProcessed = 0;
    let cumulativeAdded = 0;
    let cumulativeFailed = 0;
    const totalRecords = data.length;

    try {
      for (let i = 0; i < totalRecords; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        try {
          const result = await mutationFn(chunk);

          if (result.success && result.data) {
            cumulativeAdded += result.data.addedShops;
            cumulativeFailed += result.data.failedShops;
            currentProcessed += result.data.processed;
            toast.success(result.message || `بخش ${i / chunkSize + 1} پردازش شد.`);
          } else {
            cumulativeFailed += chunk.length;
            currentProcessed += chunk.length;
            toast.error(
              `خطا در پردازش بخش ${i / chunkSize + 1}: ${
                result.message || "خطای ناشناخته سرور"
              }`
            );
          }
        } catch (error: any) {
          cumulativeFailed += chunk.length;
          currentProcessed += chunk.length;
          toast.error(
            `خطا در آپلود بخش ${i / chunkSize + 1}: ${error.message}`
          );
        }

        setProgress(Math.floor((currentProcessed / totalRecords) * 100));
        setUploadStats({
          totalAdded: cumulativeAdded,
          totalFailed: cumulativeFailed,
          totalProcessed: currentProcessed,
        });
      }

      toast.info(
        `بارگذاری به پایان رسید\n- کل پردازش شده: ${currentProcessed}/${totalRecords}\n- موفق: ${cumulativeAdded}\n- ناموفق: ${cumulativeFailed}`
      );

      if (cumulativeAdded > 0 && invalidateQueries.length > 0) {
        queryClient.invalidateQueries({ queryKey: invalidateQueries });
      }

      onSuccess?.({
        totalAdded: cumulativeAdded,
        totalFailed: cumulativeFailed,
        totalProcessed: currentProcessed,
      });
    } catch (error) {
      toast.error("خطای غیرمنتظره در فرایند آپلود رخ داد.");
      console.error("Upload process error:", error);
      onError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    progress,
    uploadStats,
    uploadData,
    resetUpload: () => {
      setProgress(0);
      setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0 });
    },
  };
}