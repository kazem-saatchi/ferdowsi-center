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
  role?: "ADMIN" | "USER" | "MANAGER" | "STAFF";
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

    const expireTime = 30 * 24 * 60 * 60; // 30 days
    const expireAt = Date.now() + expireTime * 1000;

    const session = await db.session.create({
      data: {
        idNumber: user.IdNumber,
        personId: user.id,
        expireAt: new Date(expireAt).toISOString(),
      },
    });

    // Store token in Cookie
    const cookieStore = cookies();
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
