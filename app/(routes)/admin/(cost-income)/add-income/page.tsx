"use client"

import { useState } from "react"
import { useAddIncome } from "@/tanstack/mutations"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar"
import { addIncomeSchema, type AddIncomeData } from "@/schema/cost-IncomeSchema"
import { formatNumberFromString } from "@/utils/formatNumber"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import UploadImage from "@/components/upload-file/UploadImage"
import { labels } from "@/utils/label"

export default function AddIncomePage() {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [amountPersian, setAmountPersian] = useState("")
  const [incomeDate, setIncomeDate] = useState<Date | null>(null)
  const [description, setDescription] = useState("")
  const [billImageUrl, setBillImageUrl] = useState("")
  const [proprietor, setProprietor] = useState<boolean>(false)
  const [name, setName] = useState("")
  const [uploadPage, setUploadPage] = useState<boolean>(false)

  const addIncomeMutation = useAddIncome()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount || !incomeDate || !name) {
      console.error(labels.selectRequiredFieldsIncome)
      return
    }
    try {
      const incomeData: AddIncomeData = {
        title,
        amount: Number.parseInt(amount, 10),
        date: incomeDate,
        description,
        billImage: billImageUrl,
        proprietor,
        name,
      }

      const validatedData = addIncomeSchema.parse(incomeData)
      const result = await addIncomeMutation.mutateAsync(validatedData)
      if (result.success) {
        // Reset form after successful submission
        setTitle("")
        setAmount("")
        setAmountPersian("")
        setIncomeDate(null)
        setDescription("")
        setBillImageUrl("")
        setProprietor(false)
        setName("")
        setUploadPage(false)
      }
    } catch (error) {
      console.error(labels.incomeAddedError, error)
    }
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const { formattedPersianNumber, formattedNumber } = formatNumberFromString(value)

    setAmountPersian(formattedPersianNumber)
    setAmount(formattedNumber)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addIncome}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.incomeDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{labels.amountInRials}</Label>
              <Input id="amount" type="text" value={amountPersian} onChange={handleAmountChange} required />
            </div>
            <JalaliDayCalendar date={incomeDate} setDate={setIncomeDate} title={labels.incomeDate} />
            <div className="space-y-2">
              <Label htmlFor="description">{labels.description}</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{labels.name}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="proprietor" checked={proprietor} onCheckedChange={setProprietor} />
              <Label htmlFor="proprietor">{labels.proprietorIncome}</Label>
            </div>
            <Button variant="secondary" type="button" onClick={() => setUploadPage((prev) => !prev)}>
              {labels.uploadBillImage}
            </Button>
            {uploadPage && (
              <UploadImage
                fileName={title}
                setUploadPage={setUploadPage}
                setImageUrl={setBillImageUrl}
                folderName="income-image"
              />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={addIncomeMutation.isPending}>
              {addIncomeMutation.isPending ? labels.addingIncome : labels.addIncomeButton}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

