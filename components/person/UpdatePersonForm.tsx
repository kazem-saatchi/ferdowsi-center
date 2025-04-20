"use client";

import { useState } from "react";
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

import { labels } from "@/utils/label";
import { useUpatePerson } from "@/tanstack/mutations";

interface UpdatePersonFormProps {
  initialData: {
    id: string;
    IdNumber: string;
    firstName: string;
    lastName: string;
    phoneOne: string;
    phoneTwo: string | null;
    isActive: boolean;
  };
}

export function UpdatePersonForm({ initialData }: UpdatePersonFormProps) {
  const updatePersonMutation = useUpatePerson();
  const [formData, setFormData] = useState(initialData);
  const [updating, setUpdating] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setUpdating(true);
    e.preventDefault();

    updatePersonMutation.mutate(formData, {
      onSettled: () => {
        setUpdating(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.updatePerson}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="IdNumber">{labels.nationalId}</Label>
            <Input
              id="IdNumber"
              name="IdNumber"
              value={formData.IdNumber}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">{labels.name}</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{labels.lastName}</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneOne">{labels.mobile}</Label>
            <Input
              id="phoneOne"
              name="phoneOne"
              value={formData.phoneOne}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneTwo">{labels.secondMobile}</Label>
            <Input
              id="phoneTwo"
              name="phoneTwo"
              value={formData.phoneTwo || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2 space-x-2">
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
            <Label htmlFor="isActive">{labels.active}</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={updating}>
            {updating ? labels.updatingInfo : labels.updateInfo}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
