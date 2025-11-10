import { appConfig } from "./config";
import type { Order, OracleTicker, SubmitResult } from "./types";

const API = appConfig.apiBaseUrl;

function nowIso(): string {
  return new Date().toISOString();
}

const mockOrders: Order[] = [
  {
    id: 1,
    owner: "G...USER",
    sellAsset: "XLM_SAC",
    buyAsset: "USDC_SAC",
    amountToSell: "10000000",
    orderType: "SIMPLE_TRIGGER",
    status: "Active",
    triggerPrice: "200000000",
    createdAt: nowIso()
  },
  {
    id: 2,
    owner: "G...USER",
    sellAsset: "XLM_SAC",
    buyAsset: "USDC_SAC",
    amountToSell: "5000000",
    orderType: "TRAILING_STOP_LOSS",
    status: "Executed",
    trailBps: 500,
    peakPrice: "260000000",
    createdAt: nowIso()
  }
];

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API}/orders`, { cache: "no-store" });
    if (!res.ok) throw new Error("orders api not available");
    return await res.json();
  } catch {
    return mockOrders;
  }
}

export async function fetchOrder(id: number): Promise<Order | null> {
  try {
    const res = await fetch(`${API}/orders/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("order api not available");
    return await res.json();
  } catch {
    return mockOrders.find(o => o.id === id) || null;
  }
}

export async function createSimpleTrigger(params: {
  owner: string;
  sellAsset: string;
  buyAsset: string;
  amountToSell: string;
  triggerPrice: string;
}): Promise<SubmitResult> {
  try {
    const build = await fetch(`${API}/tx/simple-trigger/build`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params)
    }).then(r => r.json());

    const submit = await fetch(`${API}/tx/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signedXDR: build.xdr })
    }).then(r => r.json());

    return submit;
  } catch {
    return { hash: "MOCK_HASH", result: { ok: true } };
  }
}

export async function createTrailingStopLoss(params: {
  owner: string;
  sellAsset: string;
  buyAsset: string;
  amountToSell: string;
  trailBps: number;
  oracleTicker: OracleTicker;
}): Promise<SubmitResult> {
  try {
    const build = await fetch(`${API}/tx/trailing/create/build`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params)
    }).then(r => r.json());

    const submit = await fetch(`${API}/tx/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signedXDR: build.xdr })
    }).then(r => r.json());

    return submit;
  } catch {
    return { hash: "MOCK_HASH", result: { ok: true } };
  }
}

export async function cancelOrder(params: { owner: string; orderId: number }): Promise<SubmitResult> {
  try {
    const build = await fetch(`${API}/tx/cancel/build`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params)
    }).then(r => r.json());

    const submit = await fetch(`${API}/tx/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signedXDR: build.xdr })
    }).then(r => r.json());
    return submit;
  } catch {
    return { hash: "MOCK_HASH", result: { ok: true } };
  }
}


