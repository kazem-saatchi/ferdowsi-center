"use client";

import UserGreeting from "@/components/user/UserGreeting";
import UserNavigationCard from "@/components/user/UserNavigationCard";
import UserQuickState from "@/components/user/UserQuickState";

export default function UserMainPage() {
  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      <UserGreeting />

      {/* Balance and units first: the cards below only repeat the sidebar. */}
      <UserQuickState />

      <UserNavigationCard />
    </div>
  );
}
