import { redirect } from "next/navigation";

async function Page() {
  redirect("/user/dashboard");
  // This line won't be reached
  return <div>page</div>;
}

export default Page;
