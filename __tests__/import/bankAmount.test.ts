import {
  INT4_MAX,
  toInt4Amount,
  bankAmountToNumber,
  serializeBankTransaction,
} from "@/utils/bankAmount";
import type { BankTransaction } from "@prisma/client";

describe("toInt4Amount", () => {
  it("passes through values that fit an Int column", () => {
    expect(toInt4Amount(BigInt(92_970_000), "test")).toBe(92_970_000);
    expect(toInt4Amount(BigInt(INT4_MAX), "test")).toBe(INT4_MAX);
    expect(toInt4Amount(0, "test")).toBe(0);
  });

  it("accepts a number as well as a bigint", () => {
    expect(toInt4Amount(150_000_000, "test")).toBe(150_000_000);
  });

  it("accepts the largest payment the building expects", () => {
    // Payment/Charge.amount are still Int. 990,000,000 rial is the upper bound
    // we plan for; it fits INT4 (2,147,483,647) with room to spare, so no
    // schema change is needed to register a transfer of this size.
    expect(toInt4Amount(BigInt(990_000_000), "مبلغ پرداخت")).toBe(990_000_000);
    expect(990_000_000).toBeLessThan(INT4_MAX);
  });

  it("throws on the value that silently broke the import", () => {
    // 2,213,220,086 — the balance of the dropped plaque-804 transaction.
    expect(() => toInt4Amount(BigInt(2_213_220_086), "مبلغ پرداخت")).toThrow(
      /بزرگ‌تر از حد مجاز/
    );
  });

  it("names the context so the message is actionable", () => {
    expect(() => toInt4Amount(BigInt(INT4_MAX) + BigInt(1), "مبلغ برگشتی")).toThrow(
      /مبلغ برگشتی/
    );
  });

  it("rejects one past the ceiling in both directions", () => {
    expect(() => toInt4Amount(BigInt(INT4_MAX) + BigInt(1), "x")).toThrow();
    expect(() => toInt4Amount(-BigInt(INT4_MAX) - BigInt(1), "x")).toThrow();
    expect(toInt4Amount(-BigInt(INT4_MAX), "x")).toBe(-INT4_MAX);
  });
});

describe("bankAmountToNumber", () => {
  it("widens a bigint to a number", () => {
    expect(bankAmountToNumber(BigInt(2_213_220_086))).toBe(2_213_220_086);
  });

  it("is a no-op for numbers", () => {
    expect(bankAmountToNumber(2_213_220_086)).toBe(2_213_220_086);
  });

  it("accepts values far above the INT4 ceiling", () => {
    // The whole point: rial balances beyond INT4 are ordinary here.
    expect(bankAmountToNumber(BigInt("9007199254740991"))).toBe(9_007_199_254_740_991);
  });

  it("refuses to lose precision past MAX_SAFE_INTEGER", () => {
    expect(() => bankAmountToNumber(BigInt("9007199254740992"))).toThrow(
      /محدوده امن/
    );
  });
});

describe("serializeBankTransaction", () => {
  const row = {
    id: "tx-1",
    recieverAccount: "5029087001682627",
    senderAccount: "6274121176434066",
    amount: BigInt(92_970_000),
    balance: BigInt(2_213_220_086),
    type: "INCOME",
    category: null,
    description: "شارژ مالکانه واحد 804",
    date: new Date("2026-07-26T00:00:00.000Z"),
    createdAt: new Date("2026-07-26T00:00:00.000Z"),
    bankAccountNumber: "2504-306",
    accountType: "PROPRIETOR",
    bankReferenceId: "0",
    bankRecieptId: "16762164440",
    chequeNumber: null,
    branch: 1002,
    registered: false,
    referenceId: null,
    referenceType: null,
    registerAble: true,
    rowHash: "abc123",
  } as unknown as BankTransaction;

  it("converts amount and balance to numbers", () => {
    const out = serializeBankTransaction(row);
    expect(out.amount).toBe(92_970_000);
    expect(out.balance).toBe(2_213_220_086);
    expect(typeof out.amount).toBe("number");
    expect(typeof out.balance).toBe("number");
  });

  it("leaves every other field untouched", () => {
    const out = serializeBankTransaction(row);
    expect(out.id).toBe("tx-1");
    expect(out.description).toBe("شارژ مالکانه واحد 804");
    expect(out.bankRecieptId).toBe("16762164440");
    expect(out.date).toBe(row.date);
    expect(out.rowHash).toBe("abc123");
  });

  it("produces an object that JSON can serialize", () => {
    // A raw row would throw here — which is exactly what would happen when a
    // server action tried to return it to the client.
    expect(() => JSON.stringify(row)).toThrow(TypeError);
    expect(() => JSON.stringify(serializeBankTransaction(row))).not.toThrow();
  });
});
