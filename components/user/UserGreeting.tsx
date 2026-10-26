import React from 'react'
import { useFindPersonFromSession } from '@/tanstack/query/personQuery';
import { CardDescription, CardTitle } from '@/components/ui/card';

function UserGreeting() {
    const { data: session } = useFindPersonFromSession();
  
    // Get current time for greeting
    const currentHour = new Date().getHours();
    let greeting = "خوش آمدید";
  
    if (currentHour < 12) {
      greeting = "صبح بخیر";
    } else if (currentHour < 18) {
      greeting = "وقت بخیر";
    } else {
      greeting = "عصر بخیر";
    }
  return (
    // Styled like every other page title.
    <div className="space-y-1.5">
      <CardTitle className="break-words">
        {greeting}
        {session?.person?.lastName
          ? `، ${session.person.firstName} ${session.person.lastName}`
          : ""}
      </CardTitle>
      <CardDescription>به اپلیکیشن مجتمع فردوسی خوش آمدید</CardDescription>
    </div>
  );
}

export default UserGreeting