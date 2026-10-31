"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { adminWritePaths } from "@/components/admin-side-panel/panels/menuData";
import { labels } from "@/utils/label";

// Whether the signed-in user may change data, decided once by the admin layout
// from `canWrite(role)`. Only hides controls — every write action checks the
// role again on the server (`adminWriteAction`).
//
// Defaults to false, so a write control rendered outside the admin layout
// stays hidden rather than showing up for a regular user.
const WriteAccessContext = createContext(false);

export function WriteAccessProvider({
  canWrite,
  children,
}: {
  canWrite: boolean;
  children: React.ReactNode;
}) {
  return (
    <WriteAccessContext.Provider value={canWrite}>
      {children}
    </WriteAccessContext.Provider>
  );
}

export function useCanWrite(): boolean {
  return useContext(WriteAccessContext);
}

/** Renders its children only for a user who may change data. */
export function WriteOnly({ children }: { children: React.ReactNode }) {
  return useCanWrite() ? <>{children}</> : null;
}

function isWritePath(pathname: string): boolean {
  return adminWritePaths.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
}

/** Stands in for a write page (add person, import, …) when a read-only role
 *  opens it by URL. The sidebar already hides those links. */
export function AdminWriteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const canWrite = useCanWrite();
  if (!canWrite && isWritePath(pathname)) {
    return <EmptyState message={labels.readOnlyAccess} />;
  }
  return <>{children}</>;
}
