"use client"

import { useState } from "react"
import { useCreateAnnualChargeReference } from "@/tanstack/mutation/chargeMutation"
import { Button } from "@/components/ui/button"
import NumericInput from "@/components/NumericInput"
import { Label } from "@/components/ui/label"
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
  PageFooter,
} from "@/components/layout/Page"
import { toast } from "sonner"
import { useConfirm } from "@/components/ConfirmDialog"
import { ShopAnnualChargeReferenceSchema } from "@/schema/chargeSchema"
import { labels } from "@/utils/label"

export default function GenerateShopAnnualChargeReferencePage() {
  const [formData, setFormData] = useState({
    storeMetric: "",
    officeMetric: "",
  })

  const createChargeReferenceMutation = useCreateAnnualChargeReference()

  const setField = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { confirm, dialog } = useConfirm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await confirm({
      title: "مرجع شارژ دوباره ساخته شود؟",
      description: "مرجع شارژ فعلی همه واحدها حذف و با این مقادیر جایگزین می‌شود.",
    })
    if (!ok) return
    try {
      const validatedData = ShopAnnualChargeReferenceSchema.parse({
        storeMetric: Number(formData.storeMetric),
        officeMetric: Number(formData.officeMetric),
      })

      const result = await createChargeReferenceMutation.mutateAsync(validatedData)

      // The mutation hook toasts the server's own success or error message.
      if (result.success) {
        setFormData({
          storeMetric: "",
          officeMetric: "",
        })
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
    <Page width="form">
      <div>
        <PageHeader>
          <PageTitle>{labels.generateShopsAnnualChargeReference}</PageTitle>
        </PageHeader>
        <form onSubmit={handleSubmit}>
          <PageBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeMetric">{labels.shopMetricValue}</Label>
              <NumericInput
                id="storeMetric"
                name="storeMetric"
                value={formData.storeMetric}
                onChange={(value) => setField("storeMetric", value)}
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeMetric">{labels.officeMetricValue}</Label>
              <NumericInput
                id="officeMetric"
                name="officeMetric"
                value={formData.officeMetric}
                onChange={(value) => setField("officeMetric", value)}
                allowDecimal
                required
              />
            </div>
          </PageBody>
          <PageFooter>
            <Button type="submit" className="w-full" disabled={createChargeReferenceMutation.isPending}>
              {createChargeReferenceMutation.isPending ? labels.generating : labels.generateChargeReference}
            </Button>
          </PageFooter>
        </form>
      </div>
      {dialog}
    </Page>
  )
}

