"use server";

import { S3 } from "aws-sdk";
import { verifyToken } from "@/utils/auth";
import { errorMSG } from "@/utils/messages";

const accessKeyId = process.env.LIARA_ACCESS_KEY!;
const secretAccessKey = process.env.LIARA_SECRET_KEY!;
const bucket = process.env.LIARA_BUCKET_NAME!;
const endpoint = process.env.LIARA_ENDPOINT!;

// Mirrors the accepted types the picker enforces in
// components/upload-file/UploadImage.tsx — the client check is a convenience,
// this one is the real gate.
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// A key segment is interpolated straight into the S3 Key, so anything that
// could climb out of the intended folder is rejected rather than rewritten.
function isSafeKeySegment(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("..")
  );
}

interface GenerateUploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  message: string;
}

export default async function generateUploadUrl(
  id: string,
  fileType: string,
  folderName: string
): Promise<GenerateUploadUrlResponse> {
  const auth = await verifyToken();

  if (!auth.success || !auth.person) {
    return { success: false, message: errorMSG.unauthorized };
  }

  if (!ACCEPTED_FILE_TYPES.includes(fileType)) {
    return { success: false, message: errorMSG.invalidInput };
  }

  if (!isSafeKeySegment(id) || !isSafeKeySegment(folderName)) {
    return { success: false, message: errorMSG.invalidInput };
  }

  const fileName = `${id}`;
  const dateTime = new Date().getTime();

  try {
    const s3 = new S3({
      accessKeyId,
      secretAccessKey,
      endpoint,
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    });

    const params = {
      Bucket: bucket,
      Key: `${folderName}/${fileName}t${dateTime}`,
      ContentType: fileType,
      ACL: "public-read", // Make object public
      Expires: 3600, // 1 hour
    };

    // Generate a pre-signed URL for the client to upload the file
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    // Construct the public URL
    const publicUrl = `${endpoint}/${bucket}/${folderName}/${fileName}t${dateTime}`;

    return { success: true, uploadUrl, publicUrl, message: "URL generated" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
