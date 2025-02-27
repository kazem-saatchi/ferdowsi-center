"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { FileUpload } from "@/components/upload-file/UploadFile";
import { PreviewTable } from "@/components/upload-file/PreviewTable";
import { useAddPersonsFromFile } from "@/tanstack/mutations";

function UploadPersons() {
  //Tanstack Mutation
  const mutationAddPersons = useAddPersonsFromFile();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (selectedFile: File, data: any[]) => {
    setFile(selectedFile);
    setParsedData(data);
    setPreviewData(data); // Preview first 5 rows
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return toast.error("No data to upload.");

    mutationAddPersons.mutate(parsedData);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Upload Persons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload onFileChange={handleFileChange} onUpload={handleUpload} />
        {previewData.length > 0 && <PreviewTable data={previewData} />}
      </CardContent>
    </Card>
  );
}

export default UploadPersons;
