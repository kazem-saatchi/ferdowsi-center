import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileChange: (file: File) => void
  onUpload: () => void
}

export function UploadFile({ onFileChange, onUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0]
      setFileName(file.name)
      onFileChange(file)
    }
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

