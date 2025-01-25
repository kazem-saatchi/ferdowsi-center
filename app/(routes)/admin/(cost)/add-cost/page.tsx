"use client"

import { useState } from "react"
import { useAddCost } from "@/tanstack/mutations"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { CustomSelect } from "@/components/CustomSelect"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar"
import { addCostSchema, type AddCostData } from "@/schema/costSchema"
import { formatNumberFromString } from "@/utils/formatNumber"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UploadImage from "@/components/upload-file/UploadImage"
import { labels } from "@/utils/label"

export default function AddCostPage() {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [amountPersian, setAmountPersian] = useState("")
  const [costDate, setCostDate] = useState<Date | null>(null)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("")
  const [billImageUrl, setBillImageUrl] = useState("")
  const [proprietor, setProprietor] = useState<boolean>(false)
  const [uploadPage, setUploadPage] = useState<boolean>(false)

  const addCostMutation = useAddCost()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount || !costDate || !category) {
      // Note: We're not using toast here as per the user's request
      console.error(labels.fillRequiredFields)
      return
    }
    try {
      const costData: AddCostData = {
        title,
        amount: Number.parseInt(amount, 10),
        date: costDate,
        description,
        category: category as any, // This needs to be properly typed based on the schema
        billImage: billImageUrl,
        proprietor,
      }

      const validatedData = addCostSchema.parse(costData)
      await addCostMutation.mutateAsync(validatedData)

      // Reset form after successful submission
      setTitle("")
      setAmount("")
      setAmountPersian("")
      setCostDate(null)
      setDescription("")
      setCategory("")
      setBillImageUrl("")
      setProprietor(false)
      setUploadPage(false)
    } catch (error) {
      console.error("Error adding cost:", error)
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
      <h1 className="text-3xl font-bold mb-8">{labels.addChargeByAmount}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.chargeDetails}</CardTitle>
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
            <JalaliDayCalendar date={costDate} setDate={setCostDate} title={labels.chargeDate} />
            <div className="space-y-2">
              <Label htmlFor="description">{labels.description}</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{labels.type}</Label>
              <Select onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={labels.selectType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRICITY">{labels.electricity}</SelectItem>
                  <SelectItem value="WATER">{labels.water}</SelectItem>
                  <SelectItem value="GAS">{labels.gas}</SelectItem>
                  <SelectItem value="ELEVATOR">{labels.elevator}</SelectItem>
                  <SelectItem value="ESCALATOR">{labels.escalator}</SelectItem>
                  <SelectItem value="CHILLER">{labels.chiller}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="proprietor">{labels.chargeType}</Label>
              <Button
                id="proprietor"
                variant={proprietor ? "destructive" : "outline"}
                type="button"
                onClick={() => setProprietor((prev) => !prev)}
              >
                {proprietor ? labels.proprietorCharge : labels.monthlyCharge}
              </Button>
            </div>
            <Button variant="secondary" type="button" onClick={() => setUploadPage((prev) => !prev)}>
              {labels.uploadReceiptImage}
            </Button>
            {uploadPage && (
              <UploadImage
                fileName={title}
                setUploadPage={setUploadPage}
                setImageUrl={setBillImageUrl}
                folderName="cost-image"
              />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={addCostMutation.isPending}>
              {addCostMutation.isPending ? labels.addingCharge : labels.addCharge}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

