"use client";

import { useEffect, useState } from "react";
import type { Order } from "../lib/types";
import { cancelOrder, fetchOrder } from "../lib/api";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";

export default function OrderDetail({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const o = await fetchOrder(orderId);
        if (!o) throw new Error("Order not found");
        setOrder(o);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  async function onCancel() {
    if (!order) return;
    const result = await cancelOrder({ owner: order.owner, orderId: order.id });
    setTxResult(JSON.stringify(result, null, 2));
  }

  if (loading) return <Card><div className="py-10 text-center text-sm text-gray-500">Loading…</div></Card>;
  if (error) return <Card><div className="py-10 text-center text-sm text-red-500">{error}</div></Card>;
  if (!order) return null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <Badge color={order.status === "Active" ? "green" : order.status === "Executed" ? "blue" : "red"}>
          {order.status}
        </Badge>
      </div>
      <Card title="Overview">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Owner</div>
            <div className="font-mono">{order.owner}</div>
          </div>
          <div>
            <div className="text-gray-500">Pair</div>
            <div className="font-mono">{order.sellAsset} → {order.buyAsset}</div>
          </div>
          <div>
            <div className="text-gray-500">Amount To Sell</div>
            <div className="font-mono">{order.amountToSell}</div>
          </div>
          <div>
            <div className="text-gray-500">Type</div>
            <div>{order.orderType.replaceAll("_", " ")}</div>
          </div>
          <div>
            <div className="text-gray-500">Params</div>
            <div className="font-mono">
              {order.orderType === "SIMPLE_TRIGGER"
                ? `trigger=${order.triggerPrice}`
                : `trailBps=${order.trailBps} peak=${order.peakPrice}`}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Created</div>
            <div>{new Date(order.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </Card>
      {order.status === "Active" ? (
        <Card title="Actions">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel}>Cancel Order</Button>
            <a className="btn btn-primary" href="/">Back to Orders</a>
          </div>
          {txResult ? (
            <pre className="mt-4 text-xs overflow-auto bg-gray-900 text-gray-100 rounded-lg p-3">
{txResult}
            </pre>
          ) : null}
        </Card>
      ) : (
        <div>
          <a className="btn btn-secondary" href="/">Back to Orders</a>
        </div>
      )}
    </div>
  );
}


