import React from 'react'
import { useFindPersonFromSession } from '@/tanstack/query/personQuery';

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
    <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}{" "}
          {session?.person?.lastName
            ? `,${session.person.firstName} ${session.person.lastName}`
            : ""}
          
        </h1>
        <p className="text-muted-foreground">
          به اپلیکیشن مجتع فردوسی خوش آمدید
        </p>
      </div>
  )
}

export default UserGreeting