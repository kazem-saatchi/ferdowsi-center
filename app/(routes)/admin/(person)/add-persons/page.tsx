"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { toast } from "sonner"
import { UploadFile } from "@/components/upload-file/UploadFile"
import { PreviewTable } from "@/components/upload-file/PreviewTable"
import { parseFile } from "@/utils/fileParser"

function UploadPersons() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    const data = await parseFile(selectedFile)
    setPreviewData(data.slice(0, 5)) // Preview first 5 rows
  }

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file.")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload-persons", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (response.ok) {
        toast.success(`Successfully added ${result.count} persons!`)
      } else {
        toast.error(`Error: ${result.message}`)
      }
    } catch (error) {
      toast.error("An error occurred while uploading the file.")
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Upload Persons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <UploadFile onFileChange={handleFileChange} onUpload={handleUpload} />
        {previewData.length > 0 && <PreviewTable data={previewData} />}
      </CardContent>
    </Card>
  )
}

export default UploadPersons

