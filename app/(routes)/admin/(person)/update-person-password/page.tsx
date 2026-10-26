"use client";
import { labels } from "@/utils/label";
import { toPersianDigits } from "@/utils/formatNumber";

import { useState, useEffect } from "react";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useUpatePersonRole, useUpdatePassword } from "@/tanstack/mutation/personMutation";
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
import { useConfirm } from "@/components/ConfirmDialog";
import { updatePersonRoleSchema } from "@/schema/personSchema";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function UpdatePersonRolePage() {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !newPassword) {
      toast.error("لطفاً شخص و رمز عبور جدید را وارد کنید");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("رمز عبور حداقل ۸ کاراکتر باید باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(labels.passwordsDoNotMatch);
      return;
    }

    const person = personsAll?.find((p) => p.id === selectedPersonId);
    const ok = await confirm({
      title: "رمز عبور این شخص تغییر کند؟",
      description: `${person?.firstName ?? ""} ${person?.lastName ?? ""} — رمز عبور فعلی دیگر کار نمی‌کند.`,
    });
    if (!ok) return;
    try {
      const result = await updatePasswordMutation.mutateAsync({
        currentPassword: newPassword,
        password: newPassword,
        userId: selectedPersonId,
      });
      // The mutation hook toasts the server's own success or error message.
      if (result.success) {
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error updating person password:", error);
      toast.error("خطا در به‌روزرسانی رمز عبور ");
    }
  };

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${toPersianDigits(person.IdNumber)})`,
    })) || [];

  const selectedPerson = personsAll?.find(
    (person) => person.id === selectedPersonId
  );

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>تغییر رمز عبور شخص</CardTitle>
        </CardHeader>

        <Separator className="mt-2 mb-4" />

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="person" className="text-sm font-medium">
                انتخاب شخص
              </label>
              <CustomSelect id="person"
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
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                {labels.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={
                  confirmPassword !== "" && confirmPassword !== newPassword
                }
              />
              {confirmPassword !== "" && confirmPassword !== newPassword && (
                <p className="text-sm text-destructive">
                  {labels.passwordsDoNotMatch}
                </p>
              )}
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
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
            >
              {updatePasswordMutation.isPending
                ? " در حال ثبت "
                : "به‌روزرسانی رمز عبور"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      {dialog}
    </div>
  );
}
