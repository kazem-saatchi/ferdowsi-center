"use client";

import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import ErrorComponent from "@/components/ErrorComponent";
import ShopBalanceTable from "@/components/balance/ShopBalanceTable";
import PersonsBalanceTable from "@/components/balance/PersonsBalanceTable";
import { labels } from "@/utils/label";
import { shopOptionLabel } from "@/utils/shopType";
import OwnerRenterBalanceTable from "@/components/balance/OwnerRenterBalanceTable";
import ShopBankCards from "@/components/shop/ShopBankCards";

export default function ShopBalancePage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const {
    data: shopsData,
    isLoading: isLoadingAllShops,
    isError: isErrorAllShops,
    error: errorAllShops,
    refetch: refetchAllShops,
  } = useFindAllShops();
  
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useGetShopBalance(selectedShopId);

  const {
    shopBalance,
    setShopBalance,
    personsBalance,
    setPersonsBalance,
    setShopsAll,
    shopsAll,
    setShopOwnerBalance,
    setShopRenterBalance,
    shopOwnerBalanceData,
    shopRenterBalanceData,
  } = useStore(
    useShallow((state) => ({
      shopBalance: state.shopBalance,
      setShopBalance: state.setShopBalance,
      personsBalance: state.personsBalance,
      setPersonsBalance: state.setPersonsBalance,
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
      shopOwnerBalanceData: state.shopOwnerBalanceData,
      shopRenterBalanceData: state.shopRenterBalanceData,
      setShopOwnerBalance: state.setShopOwnerBalance,
      setShopRenterBalance: state.setShopRenterBalance,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
  }, [shopsData, setShopsAll]);

  useEffect(() => {
    if (balanceData?.data?.shopBalance) {
      setShopBalance(balanceData.data.shopBalance);
    }
    if (balanceData?.data?.personsBalance) {
      setPersonsBalance(balanceData.data.personsBalance);
    }
    if (
      balanceData?.data?.ownerChargeList &&
      balanceData?.data?.ownerPaymentList &&
      balanceData.data.owner
    ) {
      setShopOwnerBalance({
        person: balanceData.data.owner,
        chargeList: balanceData?.data?.ownerChargeList,
        paymentList: balanceData?.data?.ownerPaymentList,
      });
    }
    if (
      balanceData?.data?.renterChargeList &&
      balanceData?.data?.renterPaymentList &&
      balanceData.data.renter
    ) {
      setShopRenterBalance({
        person: balanceData.data.renter,
        chargeList: balanceData?.data?.renterChargeList,
        paymentList: balanceData?.data?.renterPaymentList,
      });
    } else {
      setShopRenterBalance(null);
    }
  }, [balanceData, setShopBalance, setPersonsBalance]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: shopOptionLabel(shop),
    })) || [];

  const selectedShop = shopsAll?.find((shop) => shop.id === selectedShopId);

  if (isLoadingAllShops) {
    return <LoadingComponent text={labels.loadingShopsData} />;
  }

  if (isErrorAllShops) {
    return (
      <ErrorComponent
        error={errorAllShops}
        message={shopsData?.message || labels.somethingWentWrong}
        retry={refetchAllShops}
      />
    );
  }

  return (
    <Page className="space-y-6">
      <div>
        <PageHeader>
          <PageTitle>{labels.shopBalanceTitle}</PageTitle>
        </PageHeader>
        <PageBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">{labels.selectShop}</Label>
            <CustomSelect id="shop"
              options={shopOptions}
              value={selectedShopId}
              onChange={setSelectedShopId}
              label={labels.unit}
            />
          </div>
          {isLoading && selectedShopId !== "" ? (
            <LoadingComponent inline text={labels.loadingData} />
          ) : isError ? (
            <ErrorComponentSimple inline message={labels.errorOccurred} />
          ) : shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>{labels.noInformationFound}</p>
          )}
        </PageBody>
      </div>

      {shopOwnerBalanceData && (
        <div>
          <PageHeader>
            <PageTitle>{labels.relatedPersonsBalance}</PageTitle>
          </PageHeader>
          <PageBody>
            <OwnerRenterBalanceTable
              ownerData={shopOwnerBalanceData}
              renterData={
                shopRenterBalanceData ? shopRenterBalanceData : undefined
              }
            />
          </PageBody>
        </div>
      )}

      {selectedShop && !isLoading && !isError && (
        <div>
          <PageHeader>
            <PageTitle>{labels.shopBankCards}</PageTitle>
          </PageHeader>
          <PageBody>
            <ShopBankCards
              monthly={selectedShop.bankCardMonthly}
              yearly={selectedShop.bankCardYearly}
            />
          </PageBody>
        </div>
      )}

      {/* {personsBalance && personsBalance.length > 0 && (
        <div>
          <PageHeader>
            <PageTitle>{labels.relatedPersonsBalance}</PageTitle>
          </PageHeader>
          <PageBody>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </PageBody>
        </div>
      )} */}
    </Page>
  );
}
