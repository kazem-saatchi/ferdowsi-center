"use client";

import { useEffect } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useFindAllPersons } from "@/tanstack/query/personQuery";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

import { labels } from "@/utils/label";
import AddPaymentForm from "@/components/payment/AddPaymentForm";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";

export default function AddPaymentPage() {
  const {
    data: shopsData,
    isLoading: isLoadingShops,
    isError: isErrorShops,
  } = useFindAllShops();
  const {
    data: personsData,
    isLoading: isLoadingPersons,
    isError: isErrorPersons,
  } = useFindAllPersons();

  const { setShopsAll,  setPersonsAll } = useStore(
    useShallow((state) => ({
      setShopsAll: state.setshopsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [shopsData, personsData, setShopsAll, setPersonsAll]);

  if (isLoadingShops || isLoadingPersons) {
    return <LoadingComponent text={labels.gettingData} />;
  }

  if (isErrorPersons || isErrorShops) {
    return <ErrorComponentSimple message={labels.errorOccurred} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addPayment}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.paymentDetails}</CardTitle>
        </CardHeader>
        <AddPaymentForm />
      </Card>
    </div>
  );
}
