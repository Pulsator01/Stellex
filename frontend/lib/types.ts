export type Address = string;

export type OrderType = "SIMPLE_TRIGGER" | "TRAILING_STOP_LOSS";
export type OrderStatus = "Active" | "Executed" | "Cancelled";

export type OracleTicker =
  | { type: "stellar"; address: string }
  | { type: "other"; symbol: string };

export interface Order {
  id: number;
  owner: Address;
  sellAsset: Address;
  buyAsset: Address;
  amountToSell: string; // i128 as string
  orderType: OrderType;
  status: OrderStatus;
  triggerPrice?: string; // i128 scaled
  trailBps?: number;
  peakPrice?: string;
  createdAt: string;
}

export interface BuildResult {
  xdr: string;
}

export interface SubmitResult {
  hash: string;
  result: unknown;
}


