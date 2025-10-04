export type BuildSimpleTriggerRequest = {
  owner: string;
  sellAsset: string;
  buyAsset: string;
  amountToSell: string; // numeric string representing i128
  triggerPrice: string; // numeric string representing i128
};

export type BuildCancelOrderRequest = {
  owner: string;
  orderId: string; // numeric string representing u64
};

export type SubmitRequest = {
  signedXDR: string;
};

export type OracleTicker =
  | { type: 'other'; symbol: string }
  | { type: 'stellar'; address: string };

export type BuildTriggerOneRequest = {
  caller: string; // account that will submit the tx (public key)
  oracleTicker: OracleTicker;
  orderId: string; // u64
  slipBps: number; // 0..9999
  deadlineSecs: number; // >= 0
};

export type BuildTrailingCreateRequest = {
  owner: string;
  sellAsset: string;
  buyAsset: string;
  amountToSell: string; // i128 string
  trailBps: number; // 1..9999
  oracleTicker: OracleTicker;
};


