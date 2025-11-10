"use client";

import { useMemo, useState } from "react";
import Input from "./Input";
import Select from "./Select";
import Card from "./Card";
import Button from "./Button";
import { createSimpleTrigger, createTrailingStopLoss } from "../lib/api";

type OrderUiType = "simple" | "trailing";

export default function OrderForm() {
  const [orderType, setOrderType] = useState<OrderUiType>("simple");
  const [owner, setOwner] = useState("");
  const [sellAsset, setSellAsset] = useState("");
  const [buyAsset, setBuyAsset] = useState("");
  const [amountToSell, setAmountToSell] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [trailBps, setTrailBps] = useState(500);
  const [tickerType, setTickerType] = useState<"stellar" | "other">("stellar");
  const [tickerValue, setTickerValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isSimple = orderType === "simple";
  const isValid = useMemo(() => {
    if (!owner || !sellAsset || !buyAsset || !amountToSell) return false;
    if (isSimple && !triggerPrice) return false;
    if (!isSimple && (!trailBps || !tickerValue)) return false;
    return true;
  }, [owner, sellAsset, buyAsset, amountToSell, triggerPrice, trailBps, tickerValue, isSimple]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setResult(null);
    try {
      if (isSimple) {
        const r = await createSimpleTrigger({
          owner, sellAsset, buyAsset, amountToSell, triggerPrice
        });
        setResult(JSON.stringify(r, null, 2));
      } else {
        const r = await createTrailingStopLoss({
          owner, sellAsset, buyAsset, amountToSell, trailBps,
          oracleTicker: tickerType === "stellar" ? { type: "stellar", address: tickerValue } : { type: "other", symbol: tickerValue }
        });
        setResult(JSON.stringify(r, null, 2));
      }
    } catch (err) {
      setResult(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card title="Order Type">
        <div className="grid sm:grid-cols-2 gap-3">
          <Select
            label="Choose type"
            value={orderType}
            onChange={e => setOrderType(e.target.value as OrderUiType)}
            options={[
              { label: "Simple Trigger", value: "simple" },
              { label: "Trailing Stop‑Loss", value: "trailing" }
            ]}
          />
          <Input
            label="Owner Address"
            placeholder="G... (Freighter)"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            help="Address that owns the order and receives output tokens."
          />
        </div>
      </Card>

      <Card title="Assets and Amounts">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Sell Asset SAC Address"
            placeholder="e.g., XLM SAC"
            value={sellAsset}
            onChange={e => setSellAsset(e.target.value)}
          />
          <Input
            label="Buy Asset SAC Address"
            placeholder="e.g., USDC SAC"
            value={buyAsset}
            onChange={e => setBuyAsset(e.target.value)}
          />
          <Input
            label="Amount To Sell (i128 string)"
            placeholder="10000000"
            value={amountToSell}
            onChange={e => setAmountToSell(e.target.value)}
          />
          {isSimple ? (
            <Input
              label="Trigger Price (scaled i128)"
              placeholder="price * 1e8"
              value={triggerPrice}
              onChange={e => setTriggerPrice(e.target.value)}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Trail Bps (1..9999)"
                type="number"
                min={1}
                max={9999}
                value={trailBps}
                onChange={e => setTrailBps(Number(e.target.value))}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Oracle Ticker Type"
                  value={tickerType}
                  onChange={e => setTickerType(e.target.value as "stellar" | "other")}
                  options={[
                    { label: "Reflector.Stellar(Address)", value: "stellar" },
                    { label: "Reflector.Other(Symbol)", value: "other" }
                  ]}
                />
                <Input
                  label="Oracle Ticker Value"
                  placeholder="Contract address or symbol"
                  value={tickerValue}
                  onChange={e => setTickerValue(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? "Submitting…" : "Submit Order"}
        </Button>
        <a className="btn btn-secondary" href="/">Back to Orders</a>
      </div>

      {result ? (
        <Card title="Result">
          <pre className="text-xs overflow-auto bg-gray-900 text-gray-100 rounded-lg p-3">
{result}
          </pre>
        </Card>
      ) : null}
    </form>
  );
}


