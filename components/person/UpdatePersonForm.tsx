"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import updatePersonInfo from "@/app/api/actions/person/updatePerson";

interface UpdatePersonFormProps {
  initialData: {
    IdNumber: string;
    firstName: string;
    lastName: string;
    phoneOne: string;
    phoneTwo: string | null;
    isActive: boolean;
  };
}

export function UpdatePersonForm({ initialData }: UpdatePersonFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updatePersonInfo(formData);
      if (result.message) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the person"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Person</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="IdNumber">ID Number</Label>
            <Input
              id="IdNumber"
              name="IdNumber"
              value={formData.IdNumber}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneOne">Primary Phone</Label>
            <Input
              id="phoneOne"
              name="phoneOne"
              value={formData.phoneOne}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneTwo">Secondary Phone</Label>
            <Input
              id="phoneTwo"
              name="phoneTwo"
              value={formData.phoneTwo || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: checked as boolean,
                }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Update Person
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
