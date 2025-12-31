import { db } from "@/lib/db";

async function fixHistory() {
  const history = await db.shopHistory.findMany({
    where: {
      endDate: { not: null },
      isActive: true,
    },
  });

  console.log(`Found ${history.length} history to fix`);

  for (const h of history) {
    await db.shopHistory.update({
      where: { id: h.id },
      data: { isActive: false },
    });
    console.log(`History ${h.id} updated`);
  }
}

fixHistory();
