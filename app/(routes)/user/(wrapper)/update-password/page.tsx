"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/store";
import { useUpdatePassword } from "@/tanstack/mutation/personMutation";
import { labels } from "@/utils/label";
import { AlertCircle } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

function UpdatePasswordPage() {
  const { userInfo } = useStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
    }))
  );

  const updatePasswordMutation = useUpdatePassword();

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Check for Persian/Arabic characters
    const persianRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    if (persianRegex.test(formData.newPassword)) {
      setError("رمز عبور نمی‌تواند شامل حروف فارسی/عربی باشد");
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError("رمز عبور جدید باید حداقل ۸ کاراکتر باشد");
      return false;
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      setError("رمز عبور جدید باید شامل حداقل یک عدد باشد");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("رمزهای عبور وارد شده یکسان نیستند");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm() || !userInfo) {
      setIsLoading(false);
      return;
    }

    updatePasswordMutation.mutate(
      {
        userId: userInfo?.IdNumber,
        password: formData.newPassword,
        currentPassword: formData.currentPassword,
      },
      {
        onSuccess: () => {
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold">{labels.updatePassword}</h1>

      <CardContent className="border rounded-lg px-4 py-5 sm:px-6 sm:py-6">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{labels.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder={labels.currentPasswordDescription}
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{labels.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={labels.newPasswordDescription}
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="h-11 text-base"
            />
            <div className="text-sm text-muted-foreground mt-1 p-2">
              <Label>رمز عبور باید:</Label>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>حداقل ۸ کاراکتر باشد</li>
                <li>شامل حداقل یک عدد باشد</li>
                <li>فقط شامل حروف لاتین باشد (بدون حروف فارسی/عربی)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{labels.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={labels.confrimPasswordDescription}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-11 text-base"
            />
          </div>

          <div className="flex justify-stretch sm:justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-11"
            >
              {isLoading ? labels.updatingPassword : labels.updatePassword}
            </Button>
          </div>
        </form>
      </CardContent>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default UpdatePasswordPage;
