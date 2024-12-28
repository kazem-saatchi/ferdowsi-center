'use client'

import { useState } from 'react'
import { useCreateChargeReference } from '@/tanstack/mutations'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from 'sonner'
import { ShopChargeReferenceSchema } from '@/schema/chargeSchema'

export default function GenerateShopChargeReferencePage() {
  const [formData, setFormData] = useState({
    constValue: '',
    metericValue: '',
  })

  const createChargeReferenceMutation = useCreateChargeReference()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = ShopChargeReferenceSchema.parse({
        constValue: Number(formData.constValue),
        metericValue: Number(formData.metericValue),
      })

      const result = await createChargeReferenceMutation.mutateAsync(validatedData)
      
      if (result.success) {
        toast.success("Shop charge reference generated successfully")
        // Reset form after successful submission
        setFormData({
          constValue: '',
          metericValue: '',
        })
      } else {
        toast.error(result.message || "Failed to generate shop charge reference")
      }
    } catch (error) {
      console.error('Error generating shop charge reference:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An error occurred while generating shop charge reference")
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Generate Shop Charge Reference</h1>
      <Card>
        <CardHeader>
          <CardTitle>Charge Reference Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="constValue">Constant Value</Label>
              <Input 
                id="constValue" 
                name="constValue" 
                type="number"
                value={formData.constValue} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metericValue">Metric Value</Label>
              <Input 
                id="metericValue" 
                name="metericValue" 
                type="number"
                value={formData.metericValue} 
                onChange={handleChange} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={createChargeReferenceMutation.isPending}
            >
              {createChargeReferenceMutation.isPending ? 'Generating...' : 'Generate Charge Reference'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

