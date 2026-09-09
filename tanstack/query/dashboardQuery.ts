import { useQuery } from "@tanstack/react-query";
import findAdminDashboard from "@/app/api/actions/reports/getAdminDashboard";

export function useGetAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => await findAdminDashboard(),
  });
}
