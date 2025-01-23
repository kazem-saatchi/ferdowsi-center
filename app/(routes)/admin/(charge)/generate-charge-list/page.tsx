"use client"

import { useState } from "react"
import { useCreateChargeReference } from "@/tanstack/mutations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { ShopChargeReferenceSchema } from "@/schema/chargeSchema"
import { labels } from "@/utils/label"

export default function GenerateShopChargeReferencePage() {
  const [formData, setFormData] = useState({
    storeConst: "",
    storeMetric: "",
    officeConst: "",
    officeMetric: "",
  })

  const createChargeReferenceMutation = useCreateChargeReference()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = ShopChargeReferenceSchema.parse({
        storeConst: Number(formData.storeConst),
        storeMetric: Number(formData.storeMetric),
        officeConst: Number(formData.officeConst),
        officeMetric: Number(formData.officeMetric),
      })

      const result = await createChargeReferenceMutation.mutateAsync(validatedData)

      if (result.success) {
        toast.success(labels.successMessage)
        setFormData({
          storeConst: "",
          storeMetric: "",
          officeConst: "",
          officeMetric: "",
        })
      } else {
        toast.error(result.message || labels.errorMessage)
      }
    } catch (error) {
      console.error("Error generating shop charge reference:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(labels.generalErrorMessage)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.generateShopChargeReference}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.chargeReferenceDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeConst">{labels.shopConstantValue}</Label>
              <Input
                id="storeConst"
                name="storeConst"
                type="number"
                value={formData.storeConst}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeMetric">{labels.shopMetricValue}</Label>
              <Input
                id="storeMetric"
                name="storeMetric"
                type="number"
                value={formData.storeMetric}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeConst">{labels.officeConstantValue}</Label>
              <Input
                id="officeConst"
                name="officeConst"
                type="number"
                value={formData.officeConst}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeMetric">{labels.officeMetricValue}</Label>
              <Input
                id="officeMetric"
                name="officeMetric"
                type="number"
                value={formData.officeMetric}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={createChargeReferenceMutation.isPending}>
              {createChargeReferenceMutation.isPending ? labels.generating : labels.generateChargeReference}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

