import getAllOperations from "@/app/api/actions/operation/getAllOperations";
import { AllOperationsTable } from "@/components/operation/AllOperationsForm";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import { Label } from "@/components/ui/label";
import { labels } from "@/utils/label";
import React from "react";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";

async function AllOperationPage() {
  const allOperations = await getAllOperations();

  if (!allOperations.data) {
    return <ErrorComponentSimple message={allOperations.message} />;
  }
  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.operationsTitle}</PageTitle>
      </PageHeader>
      <PageBody className="space-y-4">
        <AllOperationsTable data={allOperations.data.operations} />
      </PageBody>
    </Page>
  );
}

export default AllOperationPage;
