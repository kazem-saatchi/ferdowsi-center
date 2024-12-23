import { ShopHistory } from "@prisma/client";

export function calculateFinancialResponsibility(
  activityPeriods: ShopHistory[],
  responsibilityPeriods: ShopHistory[],
  endDate: Date
) {
  const financialPeriods: ShopHistory[] = [];

  activityPeriods.forEach((activity) => {
    const activeStart = new Date(activity.startDate);
    const activeEnd = activity.endDate
      ? new Date(activity.endDate)
      : endDate;

    responsibilityPeriods.forEach((responsibility) => {
      const respStart = new Date(responsibility.startDate);
      const respEnd = responsibility.endDate
        ? new Date(responsibility.endDate)
        : endDate;

      // Check overlap
      const overlapStart = activeStart > respStart ? activeStart : respStart;
      const overlapEnd = activeEnd < respEnd ? activeEnd : respEnd;

      // if the responsibility change start date is in range of activity
      if(activeStart < respStart && respStart < activeEnd) {
        financialPeriods.push({
            id: activity.id,
            shopId: activity.shopId,
            personId: activity.personId, // come from activity
            personName: activity.personName, // come from activity
            type: activity.type,
            startDate: activeStart,
            endDate: respStart,
            isActive: activity.isActive,
            plaque: responsibility.plaque,
            createdAt: responsibility.createdAt,
            // duration: (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24), // days
          });
      }

      // if the responsibility change end date is in range of activity
      if(activeStart < respEnd && respEnd < activeEnd) {
        financialPeriods.push({
            id: activity.id,
            shopId: activity.shopId,
            personId: responsibility.personId, // come from new person
            personName: responsibility.personName, // come from new person
            type: responsibility.type,
            startDate: activeStart,
            endDate: respStart,
            isActive: activity.isActive,
            plaque: responsibility.plaque,
            createdAt: responsibility.createdAt,
            // duration: (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24), // days
          });
      } else {
        // if the responsibility change end date is not in range of activity
        financialPeriods.push({
            id: activity.id,
            shopId: activity.shopId,
            personId: responsibility.personId, // come from new person
            personName: responsibility.personName, // come from new person
            type: responsibility.type,
            startDate: activeStart,
            endDate: activeEnd,
            isActive: activity.isActive,
            plaque: responsibility.plaque,
            createdAt: responsibility.createdAt,
            // duration: (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24), // days
          });
      }

      if (overlapStart < overlapEnd) {
        financialPeriods.push({
          id: responsibility.id,
          shopId: activity.shopId,
          personId: responsibility.personId,
          personName: responsibility.personName,
          type: responsibility.type,
          startDate: overlapStart,
          endDate: overlapEnd,
          isActive: activity.isActive,
          plaque: responsibility.plaque,
          createdAt: responsibility.createdAt,
          // duration: (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24), // days
        });
      }
    });
  });

  return financialPeriods;
}
