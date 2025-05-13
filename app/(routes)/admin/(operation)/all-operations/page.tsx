import getAllOperations from "@/app/api/actions/operation/getAllOperations";
import { AllOperationsTable } from "@/components/operation/AllOperationsForm";
import { Label } from "@/components/ui/label";
import React from "react";

async function AllOperationPage() {
  const allOperations = await getAllOperations();

  if (!allOperations.data) {
    return <></>;
  }
  return (
    <div className="flex flex-col items-start justify-start gap-4">
      <Label className="text-xl font-semibold">
        لیست عملیات‌های قابل برگشت
      </Label>
      <AllOperationsTable data={allOperations.data.operations} />
    </div>
  );
}

export default AllOperationPage;
