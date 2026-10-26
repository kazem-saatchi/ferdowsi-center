import getAllOperations from "@/app/api/actions/operation/getAllOperations";
import { AllOperationsTable } from "@/components/operation/AllOperationsForm";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import { Label } from "@/components/ui/label";
import { labels } from "@/utils/label";
import React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function AllOperationPage() {
  const allOperations = await getAllOperations();

  if (!allOperations.data) {
    return <ErrorComponentSimple message={allOperations.message} />;
  }
  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{labels.operationsTitle}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        <AllOperationsTable data={allOperations.data.operations} />
      </CardContent>
    </div>
  );
}

export default AllOperationPage;
