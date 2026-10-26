"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/app/api/actions/auth/logoutUser";
import { labels } from "@/utils/label";

function LogoutButton() {
  const queryClient = useQueryClient();
  return (
    <Button
      variant="outline"
      onClick={() => {
        queryClient.clear();
        logoutUser();
      }}
      className="w-full"
    >
      <LogOut className="h-4 w-4 text-destructive" />
      {labels.logout}
    </Button>
  );
}

export default LogoutButton;
