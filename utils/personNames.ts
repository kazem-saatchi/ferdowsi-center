import { db } from "@/lib/db";

/**
 * Charge.personName / Payment.personName / ShopHistory.personName are
 * denormalized copies of the person's name, written when the row is created.
 * They keep list and export queries free of joins — worth it on the free tier —
 * but they go stale the moment a person is renamed.
 *
 * updatePerson cascades a rename into those columns, so they stay correct on
 * their own. On top of that, read paths that already fetch a bounded set of
 * rows (one shop, one person) can resolve the current name for the price of a
 * single extra query, which makes them immune to any copy that drifts.
 */

/** Current `firstName lastName` per person id, in one query. */
export async function getPersonNameMap(
  personIds: string[]
): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(personIds));

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const persons = await db.person.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, firstName: true, lastName: true },
  });

  return new Map(
    persons.map((person) => [
      person.id,
      `${person.firstName} ${person.lastName}`,
    ])
  );
}

/**
 * Swaps the stored `personName` copy for the person's current name. Falls back
 * to the stored copy when the person row is gone, so a deleted person still
 * shows the name the charge was booked under.
 */
export function withCurrentPersonNames<
  T extends { personId: string; personName: string }
>(rows: T[], names: Map<string, string>): T[] {
  return rows.map((row) => ({
    ...row,
    personName: names.get(row.personId) ?? row.personName,
  }));
}
