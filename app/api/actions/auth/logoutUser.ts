"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function logoutUser() {
  try {
    // Delete token in Cookie
    const cookieStore = cookies();
    cookieStore.delete("token");

    revalidatePath("/");

    return { success: true, message: "با موفقیت خارج شدید" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: "خطا در خروج از حساب" };
    }
  }
}
