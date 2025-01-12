"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddPerson } from "@/tanstack/mutations";

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Person</h2>
        <div className="mb-4">
          <Label htmlFor="IdNumber">ID Number</Label>
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
          <Label htmlFor="firstName">First Name</Label>
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
          <Label htmlFor="lastName">Last Name</Label>
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
          <Label htmlFor="phoneOne">Primary Phone</Label>
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
          <Label htmlFor="phoneTwo">Secondary Phone (Optional)</Label>
          <Input
            type="tel"
            id="phoneTwo"
            name="phoneTwo"
            value={formData.phoneTwo}
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
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
          {isLoading ? "Adding..." : "Add Person"}
        </Button>
      </form>
    </div>
  );
}
