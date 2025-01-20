'use client'
import createAdmin from "@/app/api/actions/user/generateAdminUser";
import { useEffect } from "react";

function AdminInitPage() {
  useEffect(() => {
    createAdmin();
  }, []);
  return <div>AdminInitPage</div>;
}

export default AdminInitPage;
