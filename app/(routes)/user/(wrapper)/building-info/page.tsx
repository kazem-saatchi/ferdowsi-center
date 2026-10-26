import { redirect } from "next/navigation";

/** The bank report is the only building report so far, so this goes straight
 *  to it instead of showing a hub with one card. */
export default function BuildingInfoPage() {
  redirect("/user/building-info/bank-report");
}
