"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/app/api/actions/auth/logoutUser";

function LogoutButton() {
  const queryClient = useQueryClient();
  return (
    <Button
      variant="destructive"
      onClick={() => {
        queryClient.clear();
        logoutUser();
      }}
      className="w-full"
    >
      <LogOut className="h-4 w-4" />
      خروج
    </Button>
  );
}

export default LogoutButton;
