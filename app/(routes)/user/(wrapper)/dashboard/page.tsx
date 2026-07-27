"use client";

import UserGreeting from "@/components/user/UserGreeting";
import UserNavigationCard from "@/components/user/UserNavigationCard";
import UserQuickState from "@/components/user/UserQuickState";

export default function UserMainPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Greeting Section */}
      <UserGreeting />

      {/* Navigation Cards Grid */}
      <UserNavigationCard />

      {/* Quick Stats Section (optional) */}
      <UserQuickState />
    </div>
  );
}
