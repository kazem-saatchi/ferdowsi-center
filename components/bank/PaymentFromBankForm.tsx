"use client";

import { useStore } from "@/store/store";
import { useFindAllPersons, useFindAllShops } from "@/tanstack/queries";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "../LoadingComponent";
import ErrorComponentSimple from "../ErrorComponentSimple";
import { labels } from "@/utils/label";
import { Card, CardHeader, CardTitle } from "../ui/card";
import AddPaymentForm from "../payment/AddPaymentForm";

interface PaymentFromBankProps {
  bankTransactionId: string;
  description: string;
  amount: number;
}

function PaymentFromBankForm() {
  // Queries To Fetch All Shops and users
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

  // State For Shops and Persons
  const { setShopsAll, setPersonsAll } = useStore(
    useShallow((state) => ({
      setShopsAll: state.setshopsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  // UseEffect To Assign Shops and Persons
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

export default PaymentFromBankForm;
