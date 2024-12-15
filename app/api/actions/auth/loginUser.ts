"use server";

import { db } from "@/lib/db";
import { comparePassword } from "@/utils/hashPassword";
import { cookies } from "next/headers";

interface LoginData {
  IdNumber: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  role?: "ADMIN" | "USER";
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    // Find the user by IdNumber
    const user = await db.person.findUnique({
      where: { IdNumber: data.IdNumber },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid password" };
    }

    const session = await db.session.create({
      data: { idNumber: user.IdNumber, personId: user.id },
    });

    if (session) {
    }

    // Store token in Cookie
    const cookieStore = cookies();
    const expireTime = 30 * 24 * 60 * 60; // 30 days
    cookieStore.set("token", session.id, {
      httpOnly: true,
      maxAge: expireTime,
    });

    return { success: true, message: "Login successful", role: user.role };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login" };
  }
}
