"use client";

import UserGreeting from "@/components/user/UserGreeting";
import UserNavigationCard from "@/components/user/UserNavigationCard";
import UserQuickState from "@/components/user/UserQuickState";

export default function UserMainPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Greeting Section */}
      <UserGreeting />

      {/* Navigation Cards Grid */}
      <UserNavigationCard />

      {/* Quick Stats Section (optional) */}
      <UserQuickState />
    </div>
  );
}
