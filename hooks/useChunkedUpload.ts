import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UploadStats {
  totalAdded: number;
  totalFailed: number;
  totalProcessed: number;
  /** Rows the server recognised as already imported. Only reported by importers
   *  that can tell a duplicate from an error — absent elsewhere, hence 0. */
  totalSkipped: number;
  /** Per-row reasons for genuine failures, so a partial import is visible
   *  instead of looking identical to a clean one. */
  failures: { reference: string; reason: string }[];
}

interface UseChunkedUploadOptions<T> {
  mutationFn: (chunk: T[]) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      addedShops: number;
      failedShops: number;
      processed: number;
      skipped?: number;
      failures?: { reference: string; reason: string }[];
    };
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
    totalSkipped: 0,
    failures: [],
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
    setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0, totalSkipped: 0, failures: [] });

    let currentProcessed = 0;
    let cumulativeAdded = 0;
    let cumulativeFailed = 0;
    let cumulativeSkipped = 0;
    const allFailures: { reference: string; reason: string }[] = [];
    const totalRecords = data.length;

    try {
      for (let i = 0; i < totalRecords; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        try {
          const result = await mutationFn(chunk);

          if (result.success && result.data) {
            cumulativeAdded += result.data.addedShops;
            cumulativeFailed += result.data.failedShops;
            cumulativeSkipped += result.data.skipped ?? 0;
            currentProcessed += result.data.processed;
            if (result.data.failures?.length) {
              allFailures.push(...result.data.failures);
            }
            // A chunk that wrote nothing but failed rows must not read as success.
            if (result.data.failedShops > 0) {
              toast.error(result.message || `بخش ${i / chunkSize + 1} با خطا پردازش شد.`);
            } else {
              toast.success(result.message || `بخش ${i / chunkSize + 1} پردازش شد.`);
            }
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
          totalSkipped: cumulativeSkipped,
          failures: [...allFailures],
        });
      }

      const summary = [
        `کل پردازش شده: ${currentProcessed}/${totalRecords}`,
        `ثبت شد: ${cumulativeAdded}`,
        `تکراری (قبلا ثبت شده): ${cumulativeSkipped}`,
        `ناموفق: ${cumulativeFailed}`,
      ].join("\n- ");

      // A partial import must never look like a clean one.
      if (cumulativeFailed > 0) {
        toast.error(`بارگذاری با ${cumulativeFailed} خطا به پایان رسید\n- ${summary}`, {
          duration: 15000,
          description: allFailures
            .slice(0, 5)
            .map((f) => `${f.reference}: ${f.reason}`)
            .join("\n"),
        });
      } else {
        toast.info(`بارگذاری به پایان رسید\n- ${summary}`);
      }

      if (cumulativeAdded > 0 && invalidateQueries.length > 0) {
        queryClient.invalidateQueries({ queryKey: invalidateQueries });
      }

      onSuccess?.({
        totalAdded: cumulativeAdded,
        totalFailed: cumulativeFailed,
        totalProcessed: currentProcessed,
        totalSkipped: cumulativeSkipped,
        failures: allFailures,
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
      setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0, totalSkipped: 0, failures: [] });
    },
  };
}