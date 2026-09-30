import {
  bankRowHash,
  bankRowIdentityTuple,
  BankRowIdentity,
} from "@/utils/bankRowHash";

// The real plaque-804 transaction that the import silently dropped.
const row: BankRowIdentity = {
  accountType: "PROPRIETOR",
  bankAccountNumber: "2504-306",
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
      expect(bankRowIdentityTuple(row).split("|")).toEqual([
        "PROPRIETOR",
        "2504-306",
        "92970000",
        "2213220086",
        "2026-07-26",
        row.description,
      ]);
    });

    it("pins the hash of a known row", () => {
      // A change here means the identity contract changed and every stored
      // hash needs `backfill-row-hash.js --rehash`. Never update it casually.
      // Last changed 2026-09-30, when the سند was dropped from the tuple.
      expect(bankRowHash(row)).toBe(
        "94b80e70d2371eede375c97f333b11bfd286be8be9b60f6788f0f0fa649d0741"
      );
    });
  });

  describe("discrimination", () => {
    const cases: Array<[string, Partial<BankRowIdentity>]> = [
      ["a different account type", { accountType: "BUSINESS" }],
      ["a different account number", { bankAccountNumber: "2504-101" }],
      ["a different amount", { amount: 92_970_001 }],
      ["a different balance", { balance: 2_213_220_087 }],
      ["a different day", { date: new Date("2026-07-27T00:00:00.000Z") }],
      ["a different description", { description: row.description + " x" }],
    ];

    it.each(cases)("changes for %s", (_label, patch) => {
      expect(bankRowHash({ ...row, ...patch })).not.toBe(bankRowHash(row));
    });

    // The 2026-09-21 incident: the same statement line was imported with سند
    // "0" (old parser) and again with "23329190" (the real value). Both copies
    // had to hash the same for the unique index to absorb the second import.
    it("ignores the سند, so a re-read reference cannot duplicate a row", () => {
      // Plain objects, not literals: this is what the backfill passes — a
      // Prisma row that carries bankReferenceId whether or not it is hashed.
      const oldParser = { ...row, bankReferenceId: "0" };
      const newParser = { ...row, bankReferenceId: "23329190" };
      const absent = { ...row, bankReferenceId: "" };

      expect(bankRowHash(newParser)).toBe(bankRowHash(oldParser));
      expect(bankRowHash(absent)).toBe(bankRowHash(oldParser));
      expect(bankRowHash(oldParser)).toBe(bankRowHash(row));
    });

    it("still separates a transaction from its fee on the same transfer", () => {
      // A 150,000,000 transfer and its 60,000 fee share description style and
      // day but never amount or balance — the pairs seen on 2026-09-21.
      const transfer = { ...row, amount: 150_000_000, balance: 2_390_936_947 };
      const fee = { ...row, amount: 60_000, balance: 2_390_876_947 };
      expect(bankRowHash(transfer)).not.toBe(bankRowHash(fee));
    });
  });
});
