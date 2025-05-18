"use client";

import { useState, useEffect } from "react";
import { useFindAllPersons } from "@/tanstack/queries";
import { useUpatePersonRole, useUpdatePassword } from "@/tanstack/mutations";
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
import { Input } from "@/components/ui/input";

export default function UpdatePersonRolePage() {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [newPassword, setNewPassword] = useState<string>("");

  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const updatePasswordMutation = useUpdatePassword();

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
    if (!selectedPersonId || !newPassword) {
      toast.error("لطفاً یک شخص و نقش را انتخاب کنید");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("رمز عبور حداقل 8 کاراکتر باید باشد");
      return;
    }

    try {
      const result = await updatePasswordMutation.mutateAsync({
        currentPassword: newPassword,
        password: newPassword,
        userId: selectedPersonId,
      });
      if (result.success) {
      } else {
      }
    } catch (error) {
      console.error("Error updating person password:", error);
      toast.error("خطا در به‌روزرسانی رمز عبور ");
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

            <Separator />
            {selectedPersonId !== "" && (
              <div className="flex flex-row items-center justify-start gap-3">
                <Label className="semi-bold text-lg">نام کاربر:</Label>
                <span>{`${selectedPerson?.firstName} ${selectedPerson?.lastName}`}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                رمز عبور جدید
              </Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                updatePasswordMutation.isPending ||
                !selectedPersonId ||
                !newPassword ||
                newPassword.length < 8
              }
            >
              {updatePasswordMutation.isPending
                ? " در حال ثبت "
                : "به‌روزرسانی رمز عبور"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
