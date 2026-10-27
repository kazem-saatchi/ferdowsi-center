"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddPerson } from "@/tanstack/mutation/personMutation";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";

export default function AddPersonPage() {
  //Tanstack Mutation
  const mutationAddPerson = useAddPerson();

  // Loading and FormData State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    IdNumber: "",
    firstName: "",
    lastName: "",
    phoneOne: "",
    phoneTwo: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    mutationAddPerson.mutate(formData, {
      onSuccess: () => {
        setFormData({
          IdNumber: "",
          firstName: "",
          lastName: "",
          phoneOne: "",
          phoneTwo: "",
          password: "",
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <Page width="form">
      <div>
        <PageHeader>
          <PageTitle>ثبت شخص جدید</PageTitle>
        </PageHeader>
        <PageBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="IdNumber">کد ملی</Label>
              <Input
                type="text"
                id="IdNumber"
                name="IdNumber"
                value={formData.IdNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="firstName">نام</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="lastName">فامیلی</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phoneOne">شماره موبایل</Label>
              <Input
                type="tel"
                id="phoneOne"
                name="phoneOne"
                value={formData.phoneOne}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phoneTwo">شماره دوم (اختیاری)</Label>
              <Input
                type="tel"
                id="phoneTwo"
                name="phoneTwo"
                value={formData.phoneTwo}
                onChange={handleChange}
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="password">رمز عبور (حداقل 8 حرف)</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "در حال ثبت..." : "ثبت شخص جدید"}
            </Button>
          </form>
        </PageBody>
      </div>
    </Page>
  );
}
