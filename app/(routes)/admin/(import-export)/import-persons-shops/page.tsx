"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileUpload } from "@/components/upload-file/UploadFile";
import { PreviewTable } from "@/components/upload-file/PreviewTable";
import { useAddPersonsShops } from "@/tanstack/mutations";
import { AddPersonsShopsData } from "@/schema/importSchema";
import { useQueryClient } from "@tanstack/react-query";

function UploadPersons() {
  const queryClient = useQueryClient();
  //Tanstack Mutation
  const mutationAddPersonsShops = useAddPersonsShops();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AddPersonsShopsData[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStats, setUploadStats] = useState({
    totalAdded: 0,
    totalFailed: 0,
    totalProcessed: 0,
  });

  const handleFileChange = (selectedFile: File, data: any[]) => {
    setFile(selectedFile);
    setParsedData(data);
    setPreviewData(data);
    setProgress(0); // Reset progress on new file
    setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0 }); // Reset stats
    setIsUploading(false); // Ensure upload state is reset
  };

  const handleUpload = async () => {
    if (parsedData.length === 0 || !file) {
      toast.error("لطفا ابتدا یک فایل معتبر انتخاب و بارگذاری کنید.");
      return;
    }
    if (isUploading) {
      toast.info("بارگذاری در حال انجام است.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadStats({ totalAdded: 0, totalFailed: 0, totalProcessed: 0 }); // Reset stats for new upload

    const CHUNK_SIZE = 10; // Keep chunk size reasonable
    let currentProcessed = 0;
    let cumulativeAdded = 0;
    let cumulativeFailed = 0;
    const totalRecords = parsedData.length;

    try {
      for (let i = 0; i < totalRecords; i += CHUNK_SIZE) {
        const chunk = parsedData.slice(i, i + CHUNK_SIZE);
        console.log(
          `Uploading chunk: ${i / CHUNK_SIZE + 1}, records: ${
            i + 1
          } to ${Math.min(i + CHUNK_SIZE, totalRecords)}`
        );

        try {
          // Use mutateAsync to wait for the chunk to complete
          const result = await mutationAddPersonsShops.mutateAsync(chunk);

          if (result.success && result.data) {
            // Chunk processed successfully (even if some rows failed internally)
            cumulativeAdded += result.data.addedShops;
            cumulativeFailed += result.data.failedShops;
            currentProcessed += result.data.processed; // Add processed count from this chunk
            toast.success(
              result.message || `Chunk ${i / CHUNK_SIZE + 1} processed.`
            );
          } else {
            // Server action reported failure for the whole chunk
            cumulativeFailed += chunk.length; // Assume all in chunk failed if server action failed
            currentProcessed += chunk.length;
            toast.error(
              `Failed to process chunk ${i / CHUNK_SIZE + 1}: ${
                result.message || "Unknown server error"
              }`
            );
            // Optional: break the loop if one chunk fails catastrophically
            // break;
          }
        } catch (error: any) {
          // Network error or error before/outside server action execution
          cumulativeFailed += chunk.length; // Assume all in chunk failed
          currentProcessed += chunk.length;
          toast.error(
            `Error uploading chunk ${i / CHUNK_SIZE + 1}: ${error.message}`
          );
          // Optional: break the loop on network errors
          // break;
        }

        // Update progress based on the number of records processed so far
        setProgress(Math.floor((currentProcessed / totalRecords) * 100));
        setUploadStats({
          totalAdded: cumulativeAdded,
          totalFailed: cumulativeFailed,
          totalProcessed: currentProcessed,
        });
      } // End of loop

      // Final summary after loop finishes
      toast.info(
        `Upload finished. Total processed: ${currentProcessed}/${totalRecords}. Added: ${cumulativeAdded}, Failed: ${cumulativeFailed}.`
      );

      // Invalidate queries *after* all chunks are processed
      if (cumulativeAdded > 0) {
        // Only invalidate if something was potentially added/changed
        console.log("Invalidating queries...");
        queryClient.clear();
        // Consider using refetchQueries if immediate data update is strictly needed,
        // but invalidateQueries is often sufficient and better for performance.
        // queryClient.refetchQueries({ queryKey: ["all-persons"] });
        // queryClient.refetchQueries({ queryKey: ["all-shops"] });
        // queryClient.refetchQueries({ queryKey: ["all-histories"] });
      }
    } catch (error) {
      // Catch any unexpected errors outside the loop/mutateAsync specific catches
      toast.error("An unexpected error occurred during the upload process.");
      console.error("Upload process error:", error);
    } finally {
      setIsUploading(false); // Ensure uploading state is reset even on error
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>آپلود اطلاعات فروشگاه و اشخاص</CardTitle>{" "}
        {/* Updated Title */}
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          loading={isUploading} // Use the renamed state
        />

        {/* Progress indicator */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              {/* Display detailed stats */}
              <span>
                درحال پردازش: {uploadStats.totalProcessed}/{parsedData.length}{" "}
                رکورد
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" // Added transition
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
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

export default UploadPersons;
