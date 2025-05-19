import { db } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await verifyToken();
  if (auth.person?.role !== "ADMIN") {
    return NextResponse.json({ error: "Who Are You" }, { status: 400 });
  }

  const bankTs = await db.bankTransaction.findMany({
    where: { registered: true },
  });

  let counter = 0;

  for (const ts of bankTs) {
    try {
      await db.bankTransaction.update({
        where: { id: ts.id },
        data: {
          category: ts.accountType === "PROPRIETOR" ? "YEARLY" : "MONTHLY",
        },
      });

      counter++;
    } catch (error) {}
  }

  return NextResponse.json(
    {
      message: `successfully updated ${counter} row of Bank Transactions`,
    },
    { status: 200 }
  );
}
