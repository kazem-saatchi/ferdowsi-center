import { redirect } from "next/navigation";

// The person search now lives on the all-persons list; keep old links working.
export default function SearchPersonsPage() {
  redirect("/admin/all-persons");
}
