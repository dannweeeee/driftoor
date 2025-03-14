"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@drift-labs/sdk";
import { useEffect, useState } from "react";
import { formatPublicKey } from "@/helpers/formatPublicKey";

interface Order {
  orderId: number;
  marketName: string;
  side: string;
  size: string;
  price: string;
  type: string;
  status: string;
}

interface OrdersTableProps {
  driftUser: User | null;
}

export default function OrdersTable({ driftUser }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!driftUser) return;

      setIsLoading(true);
      try {
        const openOrders = driftUser.getOpenOrders();

        if (openOrders.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const formattedOrders = openOrders.map((order) => {
          const marketName = order.marketType === 0 ? "SOL-PERP" : "Unknown";
          const side = order.direction === 0 ? "Long" : "Short";
          const size = (Number(order.baseAssetAmount) / 1e9).toFixed(3);
          const price = (Number(order.price) / 1e6).toFixed(2);
          const type = order.orderType === 0 ? "Market" : "Limit";
          const status = "Open";

          return {
            orderId: Number(order.orderId),
            marketName,
            side,
            size,
            price,
            type,
            status,
          };
        });

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [driftUser]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-zinc-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-zinc-500">No open orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Market</th>
                  <th className="text-left py-3 px-4">Side</th>
                  <th className="text-right py-3 px-4">Size</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Type</th>
                  <th className="text-right py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b">
                    <td className="py-4 px-4">{order.orderId}</td>
                    <td className="py-4 px-4">{order.marketName}</td>
                    <td className="py-4 px-4">
                      <span
                        className={
                          order.side === "Long"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {order.side}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">{order.size}</td>
                    <td className="text-right py-4 px-4">${order.price}</td>
                    <td className="text-right py-4 px-4">{order.type}</td>
                    <td className="text-right py-4 px-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
