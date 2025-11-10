/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import type { Order } from "../lib/types";
import { fetchOrders } from "../lib/api";
import Card from "./Card";
import Badge from "./Badge";

function statusColor(status: Order["status"]) {
  switch (status) {
    case "Active":
      return "green";
    case "Executed":
      return "blue";
    case "Cancelled":
      return "red";
    default:
      return "gray";
  }
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOrders();
        setOrders(data);
      } catch (e) {
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return <Card><div className="py-10 text-center text-sm text-gray-500">Loading orders…</div></Card>;
  }
  if (error) {
    return <Card><div className="py-10 text-center text-sm text-red-500">{error}</div></Card>;
  }
  if (!orders || orders.length === 0) {
    return <Card><div className="py-10 text-center text-sm text-gray-500">No orders yet.</div></Card>;
  }

  return (
    <div className="grid gap-4">
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <tr className="text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pair</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Params</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b last:border-0 border-gray-200 dark:border-gray-800">
                <td className="px-4 py-3">{o.id}</td>
                <td className="px-4 py-3">{o.orderType.replaceAll("_", " ")}</td>
                <td className="px-4 py-3"><Badge color={statusColor(o.status)}>{o.status}</Badge></td>
                <td className="px-4 py-3">{o.sellAsset} → {o.buyAsset}</td>
                <td className="px-4 py-3">{o.amountToSell}</td>
                <td className="px-4 py-3">
                  {o.orderType === "SIMPLE_TRIGGER" ? (
                    <span>trigger: <code className="text-xs">{o.triggerPrice}</code></span>
                  ) : (
                    <span>trail: <code className="text-xs">{o.trailBps} bps</code></span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a className="text-brand-600 hover:underline" href={`/orders/${o.id}`}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:hidden gap-4">
        {orders.map(o => (
          <Card key={o.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{o.id}</span>
                  <Badge color={statusColor(o.status)}>{o.status}</Badge>
                </div>
                <div className="text-xs text-gray-500">{o.orderType.replaceAll("_", " ")}</div>
                <div className="text-sm">{o.sellAsset} → {o.buyAsset}</div>
                <div className="text-xs text-gray-500">amount: {o.amountToSell}</div>
                <div className="text-xs text-gray-500">
                  {o.orderType === "SIMPLE_TRIGGER" ? (
                    <>trigger: <code>{o.triggerPrice}</code></>
                  ) : (
                    <>trail: <code>{o.trailBps} bps</code></>
                  )}
                </div>
              </div>
              <a className="text-brand-600 hover:underline text-sm" href={`/orders/${o.id}`}>View</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


