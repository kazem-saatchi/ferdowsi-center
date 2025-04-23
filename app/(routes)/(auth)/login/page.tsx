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
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loginUser } from "../../../api/actions/auth/loginUser";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    IdNumber: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogin(true);
    try {
      const result = await loginUser(formData);
      if (result.success) {
        toast.success(result.message);
        if (result.role === "ADMIN") {
          router.push("/admin/"); // Redirect to dashboard or home page
        } else {
          router.push("/user/dashboard");
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>فرم ورود به حساب کاربری</CardTitle>
          <CardDescription>
            لطفا کد ملی و رمز عبور خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLogin}>
              {isLogin ? "در حال ورود" : "ورود"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
