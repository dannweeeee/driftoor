"use client";

import { motion } from "framer-motion";

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
import { useConnection } from "@solana/wallet-adapter-react";
import { useDriftSpotUsdcPosition } from "@/hooks/spot/useDriftSpotUsdcPosition";
import { useDriftPerpsPosition } from "@/hooks/perps/useDriftPerpsPosition";
import { marketsAndAccounts } from "@/helpers/marketsAndAccounts";
import { useEffect } from "react";

export default function Dashboard() {
  const { connection } = useConnection();
  const { driftClient, driftUser, isSubscribed } = useDriftClient();
  const { spotPosition } = useDriftSpotUsdcPosition();
  const { position } = useDriftPerpsPosition();

  console.log("SPOT POSITION", spotPosition);
  console.log("POSITION", position);

  useEffect(() => {
    marketsAndAccounts.forEach((marketAndAccount) => {
      console.log("Market:", marketAndAccount.market);
      console.log("Account to use:", marketAndAccount.accountToUse);
    });
  }, []);

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
            <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
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
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Portfolio Balance
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-zinc-500"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Positions
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-zinc-500"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Orders
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-zinc-500"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">P&L</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-zinc-500"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[240px] flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
                      <p className="text-zinc-500">Chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription className="text-zinc-500">
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">User #{i}</p>
                            <p className="text-xs text-zinc-500">
                              2 minutes ago
                            </p>
                          </div>
                          <div className="text-sm font-medium">+$42.00</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
