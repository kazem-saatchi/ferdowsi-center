"use client";
import { COST_CATEGORY_OPTIONS, DEFAULT_COST_CATEGORY } from "@/utils/costCategory";
import { ZodError } from "zod";
import { toast } from "sonner";

import { useState } from "react";
import { useAddCost } from "@/tanstack/mutation/incomeCostMutation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { addCostSchema, type AddCostData } from "@/schema/cost-IncomeSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadImage from "@/components/upload-file/UploadImage";
import { labels } from "@/utils/label";

export default function AddCostPage() {
  // Extract the type of the `category` field
  type CategoryType = AddCostData["category"];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [amountPersian, setAmountPersian] = useState("");
  const [costDate, setCostDate] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType>(DEFAULT_COST_CATEGORY);
  const [billImageUrl, setBillImageUrl] = useState("");
  const [proprietor, setProprietor] = useState<boolean>(false);
  const [uploadPage, setUploadPage] = useState<boolean>(false);

  const addCostMutation = useAddCost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !costDate || !category) {
      toast.error(labels.selectRequiredFieldsCost);
      return;
    }
    try {
      const costData: AddCostData = {
        title,
        amount: Number.parseInt(amount, 10),
        date: costDate,
        description,
        category: category,
        billImage: billImageUrl,
        proprietor,
      };

      const validatedData = addCostSchema.parse(costData);
      const result = await addCostMutation.mutateAsync(validatedData);
      if (result.success) {
        // Reset form after successful submission
        setTitle("");
        setAmount("");
        setAmountPersian("");
        setCostDate(null);
        setDescription("");
        setCategory(DEFAULT_COST_CATEGORY);
        setBillImageUrl("");
        setProprietor(false);
        setUploadPage(false);
      }
    } catch (error) {
      // The mutation hook toasts server errors; a schema failure never
      // reaches it, so say so here.
      if (error instanceof ZodError) toast.error(labels.invalidFormData);
      console.error(labels.costAddedError, error);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);

    setAmountPersian(formattedPersianNumber);
    setAmount(formattedNumber);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addCost}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.costDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{labels.amountInRials}</Label>
              <Input
                id="amount"
                type="text"
                value={amountPersian}
                onChange={handleAmountChange}
                required
              />
            </div>
            <JalaliDayCalendar
              date={costDate}
              setDate={setCostDate}
              title={labels.costDate}
            />
            <div className="space-y-2">
              <Label htmlFor="description">{labels.description}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{labels.costCategory}</Label>
              <Select
                onValueChange={(value) => setCategory(value as CategoryType)}
                dir="rtl"
                value={category}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={labels.selectType} />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="proprietor">{labels.costFrom}</Label>
              <Switch
                id="proprietor"
                checked={proprietor}
                onCheckedChange={setProprietor}
              />
              <span className="text-sm">
                {proprietor ? labels.proprietorCharge : labels.monthlyCharge}
              </span>
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setUploadPage((prev) => !prev)}
            >
              {labels.uploadBillImage}
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
            <Button
              type="submit"
              className="w-full"
              disabled={addCostMutation.isPending}
            >
              {addCostMutation.isPending
                ? labels.addingCost
                : labels.addCostButton}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
