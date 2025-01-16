"use client";

import generateUploadUrl from "@/app/api/actions/bucket/GenerateUrl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Check } from "lucide-react";
import Image from "next/image";
import React, { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface UploadImageProps {
  shopId: string;
  setUploadPage: Dispatch<SetStateAction<boolean>>;
  setImageUrl: Dispatch<SetStateAction<string>>;
}

function UploadImage({ shopId, setImageUrl, setUploadPage }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadUrl(null);
    setPublicUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Check size limit
      if (file.size > 2 * 1024 * 1024) {
        // 2 MB limit
        throw new Error("Max upload size reached (2 MB).");
      }

      // Check types
      const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Only JPEG, JPG, and PNG are allowed."
        );
      }

      // Get pre-signed URLs from the server
      const { success, message, publicUrl, uploadUrl } =
        await generateUploadUrl(shopId, file.type, "payment-image");

      if (!success || !uploadUrl || !publicUrl) {
        throw new Error(message);
      }

      // Upload the file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the file to S3");
      }

      setImageUrl(publicUrl);

      // Set the links
      setPublicUrl(publicUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <CardHeader>حداکثر حجم عکس 2 مگابایت می‌باشد</CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <Button asChild variant="secondary">
            <label htmlFor="file">انتخاب عکس</label>
          </Button>
          <Input
            type="file"
            id="file"
            accept="image/jpeg, image/jpg, image/png"
            onChange={handleFileChange}
            className="p-2 border rounded"
            style={{ display: "none" }}
          />
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            آپلود
          </Button>
        </div>
        {publicUrl && (
          <Image src={publicUrl} alt="Project Image" width={400} height={400} />
        )}

        {error && <p className="text-red-500">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="default"
          className="sm:w-24"
          onClick={() => setUploadPage(false)}
        >
          <Check className=" h-4 w-4" />
          <span>بازگشت</span>
        </Button>
      </CardFooter>
    </>
  );
}

export default UploadImage;
