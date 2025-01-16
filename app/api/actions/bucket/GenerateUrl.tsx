"use server";

import { S3 } from "aws-sdk";

const accessKeyId = process.env.LIARA_ACCESS_KEY!;
const secretAccessKey = process.env.LIARA_SECRET_KEY!;
const bucket = process.env.LIARA_BUCKET_NAME!;
const endpoint = process.env.LIARA_ENDPOINT!;

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
