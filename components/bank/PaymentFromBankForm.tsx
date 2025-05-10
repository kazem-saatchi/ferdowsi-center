"use client";

import { useStore } from "@/store/store";
import { useFindAllPersons, useFindAllShops } from "@/tanstack/queries";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "../LoadingComponent";
import ErrorComponentSimple from "../ErrorComponentSimple";
import { labels } from "@/utils/label";
import { Card, CardHeader, CardTitle } from "../ui/card";
import AddPaymentBankForm from "../payment/AddPaymentBankForm";

interface PaymentFromBankProps {
  bankTransactionId: string;
  description: string;
  amount: number;
  date: Date;
  cancelFn: Dispatch<SetStateAction<string | null>>;
}

function PaymentFromBankForm({
  amount,
  bankTransactionId,
  description,
  date,
  cancelFn,
}: PaymentFromBankProps) {
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
    <div className="max-w-3xl mx-auto">
      <div>
        <CardHeader>
          <CardTitle>{labels.manualAddPayment}</CardTitle>
        </CardHeader>
        <AddPaymentBankForm
          amount={amount}
          bankTransactionId={bankTransactionId}
          description={description}
          date={date}
          cancelFn={cancelFn}
        />
      </div>
    </div>
  );
}

export default PaymentFromBankForm;
