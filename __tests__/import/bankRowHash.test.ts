import {
  bankRowHash,
  bankRowIdentityTuple,
  BankRowIdentity,
} from "@/utils/bankRowHash";

// The real plaque-804 transaction that the import silently dropped.
const row: BankRowIdentity = {
  accountType: "PROPRIETOR",
  bankAccountNumber: "2504-306",
  bankReferenceId: "0",
  amount: 92_970_000,
  balance: 2_213_220_086,
  date: new Date("2026-07-26T00:00:00.000Z"),
  description:
    "انتقال از کارت 6274121176434066 به کارت 5029087001682627 متعلق به نويد صفري (شارژ مالکانه واحد 804)",
};

describe("bankRowHash", () => {
  it("is deterministic across calls", () => {
    expect(bankRowHash(row)).toBe(bankRowHash({ ...row }));
  });

  it("produces a 64-char hex sha256", () => {
    expect(bankRowHash(row)).toMatch(/^[0-9a-f]{64}$/);
  });

  describe("stability guarantees", () => {
    it("is unchanged when amount/balance widen from number to bigint", () => {
      // The Int -> BigInt migration must not orphan a single existing hash.
      // BigInt(...) rather than a literal: the project's tsc target predates
      // ES2020 bigint literals.
      const asBigint: BankRowIdentity = {
        ...row,
        amount: BigInt(92_970_000),
        balance: BigInt(2_213_220_086),
      };
      expect(bankRowHash(asBigint)).toBe(bankRowHash(row));
    });

    it("treats a Date and its yyyy-MM-dd string identically", () => {
      // The importer holds a string; the backfill reads a Date from Prisma.
      // If these diverged, every re-import would duplicate every row.
      expect(bankRowHash({ ...row, date: "2026-07-26" })).toBe(bankRowHash(row));
      expect(bankRowHash({ ...row, date: "2026-07-26T00:00:00.000Z" })).toBe(
        bankRowHash(row)
      );
    });

    it("ignores the time of day, keeping only the UTC calendar day", () => {
      expect(
        bankRowHash({ ...row, date: new Date("2026-07-26T12:37:00.000Z") })
      ).toBe(bankRowHash(row));
    });

    it("pins the field order of the identity tuple", () => {
      // Guards against a reorder, which would silently invalidate every
      // backfilled hash in the database.
      expect(bankRowIdentityTuple(row).split("|").slice(0, 6)).toEqual([
        "PROPRIETOR",
        "2504-306",
        "0",
        "92970000",
        "2213220086",
        "2026-07-26",
      ]);
    });

    it("pins the hash of a known row", () => {
      // A change here means the identity contract changed and every stored
      // hash needs re-backfilling. Never update this value casually.
      expect(bankRowHash(row)).toBe(
        "773f34f9a274960abd64c1e66a7d2ce92a21d754e8746558e5d99fb7de257255"
      );
    });
  });

  describe("discrimination", () => {
    const cases: Array<[string, Partial<BankRowIdentity>]> = [
      ["a different account type", { accountType: "BUSINESS" }],
      ["a different account number", { bankAccountNumber: "2504-101" }],
      ["a different سند", { bankReferenceId: "22491025" }],
      ["a different amount", { amount: 92_970_001 }],
      ["a different balance", { balance: 2_213_220_087 }],
      ["a different day", { date: new Date("2026-07-27T00:00:00.000Z") }],
      ["a different description", { description: row.description + " x" }],
    ];

    it.each(cases)("changes for %s", (_label, patch) => {
      expect(bankRowHash({ ...row, ...patch })).not.toBe(bankRowHash(row));
    });

    it("separates the two real rows that share amount and balance", () => {
      // 26 such pairs exist in production, differing only by سند. The identity
      // tuple must keep them apart or the backfill's unique index fails.
      const a: BankRowIdentity = {
        accountType: "PROPRIETOR",
        bankAccountNumber: "2504-306",
        bankReferenceId: "15758356",
        amount: 15_600,
        balance: 506_559_613,
        date: new Date("2025-04-17T00:00:00.000Z"),
        description: "برداشت از سپرده بابت انتقال از کارت روي شتاب_سند تراکنش کارت",
      };
      const b = { ...a, bankReferenceId: "15751439" };

      expect(bankRowHash(a)).not.toBe(bankRowHash(b));
    });
  });
});
