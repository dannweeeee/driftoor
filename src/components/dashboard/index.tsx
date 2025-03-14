"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubaccountSwitcher from "@/components/dashboard/subaccount-switcher";
import { useDriftClient } from "@/contexts/drift-client-context";
import { useDriftSpotPosition } from "@/hooks/spot/useDriftSpotPosition";
import { useDriftPerpsPosition } from "@/hooks/perps/useDriftPerpsPosition";
import { useDriftSubaccounts } from "@/hooks/useDriftSubaccounts";
import { formatPublicKey } from "@/helpers/formatPublicKey";
import BalanceCard from "@/components/dashboard/balance-card";
import PositionsTable from "@/components/dashboard/positions-table";
import OrdersTable from "@/components/dashboard/orders-table";

export default function Dashboard() {
  const { connection } = useConnection();
  const { driftClient, driftUser, isSubscribed } = useDriftClient();
  const { spotPosition } = useDriftSpotPosition();
  const { position } = useDriftPerpsPosition();
  const { subaccounts, activeSubaccountIndex } = useDriftSubaccounts({
    connection,
    driftClient,
  });

  const [totalBalance, setTotalBalance] = useState<number>(0);

  // Calculate total balance from spot position and perp positions
  useEffect(() => {
    let balance = 0;

    if (spotPosition?.tokenAmount) {
      balance += spotPosition.tokenAmount;
    }

    if (position?.positionSizeUsd) {
      balance += position.positionSizeUsd;
    }

    setTotalBalance(balance);
  }, [spotPosition, position]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="flex flex-col md:flex bg-white/50 rounded-3xl shadow-sm">
        <div className="flex-1 space-y-6 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
              {driftUser && driftUser.userAccountPublicKey && (
                <p className="text-sm text-zinc-500">
                  {formatPublicKey(driftUser.userAccountPublicKey)}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <SubaccountSwitcher />
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-zinc-100 dark:bg-zinc-900">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <BalanceCard
                  title="Portfolio Balance"
                  value={totalBalance}
                  icon="dollar"
                  valueType="usdc"
                />

                <BalanceCard
                  title="USDC Balance"
                  value={spotPosition?.tokenAmount || 0}
                  icon="wallet"
                  valueType="usdc"
                />

                <BalanceCard
                  title="Perp Position Value"
                  value={position?.positionSizeUsd || 0}
                  icon="chart"
                  valueType="perp"
                />

                <BalanceCard
                  title="P&L"
                  value={position?.pnl || 0}
                  icon="trending"
                  showPlusMinus={true}
                  valueType="perp"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-1">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Subaccounts Overview</CardTitle>
                    <CardDescription>
                      You have {subaccounts.length} subaccount
                      {subaccounts.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Subaccount</th>
                            <th className="text-left py-3 px-4">Account ID</th>
                            <th className="text-right py-3 px-4">
                              USDC Balance
                            </th>
                            <th className="text-right py-3 px-4">Positions</th>
                            <th className="text-right py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subaccounts.map((subaccount) => (
                            <tr
                              key={subaccount.index}
                              className={`border-b hover:bg-zinc-50 ${
                                subaccount.index === activeSubaccountIndex
                                  ? "bg-zinc-50"
                                  : ""
                              }`}
                            >
                              <td className="py-3 px-4">
                                Subaccount {subaccount.index}
                              </td>
                              <td className="py-3 px-4">
                                {subaccount.publicKey}
                              </td>
                              <td className="text-right py-3 px-4">
                                {subaccount.index === activeSubaccountIndex &&
                                spotPosition
                                  ? `$${(
                                      spotPosition.tokenAmount / 1000000
                                    ).toFixed(4)}`
                                  : "-"}
                              </td>
                              <td className="text-right py-3 px-4">
                                {subaccount.index === activeSubaccountIndex &&
                                position?.positionSizeSol
                                  ? `${position.positionSizeSol} SOL`
                                  : "-"}
                              </td>
                              <td className="text-right py-3 px-4">
                                {subaccount.index === activeSubaccountIndex ? (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                                    Inactive
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-6">
              <PositionsTable position={position} />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <OrdersTable driftUser={driftUser} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
