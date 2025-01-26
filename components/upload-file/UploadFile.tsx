"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface FileUploadProps {
  onFileChange: (file: File, data: any[]) => void
  onUpload: () => void
}

export function FileUpload({ onFileChange, onUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0]
      setFileName(file.name)

      try {
        const data = await parseFile(file)
        onFileChange(file, data)
      } catch (error) {
        toast.error("Error parsing file. Please try again.")
      }
    }
  }

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const data = e.target?.result
        try {
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const parsedData = XLSX.utils.sheet_to_json(sheet)
          resolve(parsedData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsBinaryString(file)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Choose File
        </label>
        <span className="text-sm text-gray-500">{fileName || "No file chosen"}</span>
      </div>
      <Button onClick={onUpload} className="w-full">
        <Upload className="mr-2 h-4 w-4" /> Upload
      </Button>
    </div>
  )
}

