"use client";

import { useState, useEffect } from "react";
import { useFindAllPersons } from "@/tanstack/queries";
import { useUpatePersonRole } from "@/tanstack/mutations";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CustomSelect } from "@/components/CustomSelect";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePersonRoleSchema } from "@/schema/userSchemas";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function UpdatePersonRolePage() {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const updatePersonRoleMutation = useUpatePersonRole();

  const { setPersonsAll, personsAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [personsData, setPersonsAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !selectedRole) {
      toast.error("لطفاً یک شخص و نقش را انتخاب کنید");
      return;
    }
    try {
      const validatedData = updatePersonRoleSchema.parse({
        userId: selectedPersonId,
        role: selectedRole,
      });
      const result = await updatePersonRoleMutation.mutateAsync(validatedData);
      if (result.success) {
      } else {
      }
    } catch (error) {
      console.error("Error updating person role:", error);
      toast.error("خطا در به‌روزرسانی نقش شخص");
    }
  };

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  const selectedPerson = personsAll?.find(
    (person) => person.id === selectedPersonId
  );

  const roleOptions = [
    { value: "ADMIN", label: "مدیر ارشد" },
    { value: "MANAGER", label: "هیئت مدیره" },
    { value: "STAFF", label: "کارمند" },
    { value: "USER", label: "کاربر عادی" },
  ];

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>به‌روزرسانی نقش شخص</CardTitle>
        </CardHeader>

        <Separator className="mt-2 mb-4" />

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="person" className="text-sm font-medium">
                انتخاب شخص
              </label>
              <CustomSelect
                options={personOptions}
                value={selectedPersonId}
                onChange={setSelectedPersonId}
                label="شخص"
              />
            </div>
            {selectedPerson && (
              <div className="flex flex-row items-center justify-start gap-3 h-10">
                <Label className="">نقش فعلی</Label>
                <span className="font-bold border rounded-md p-2">
                  {roleOptions.find(
                    (role) => role.value === selectedPerson.role
                  )?.label || selectedPerson.role}
                </span>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                نقش جدید
              </label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                dir="rtl"
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نقش جدید" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                updatePersonRoleMutation.isPending ||
                !selectedPersonId ||
                !selectedRole
              }
            >
              {updatePersonRoleMutation.isPending
                ? "در حال به‌روزرسانی..."
                : "به‌روزرسانی نقش"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
