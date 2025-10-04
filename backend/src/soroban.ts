import 'dotenv/config';
import {
  Address,
  Contract,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  StrKey,
  scValToNative,
} from '@stellar/stellar-sdk';
import type { BuildTriggerOneRequest, OracleTicker, BuildTrailingCreateRequest } from './types';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.CONTRACT_ID || '';

const server = new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith('http://') });

function toI128(value: string | number | bigint) {
  const v = BigInt(value);
  return nativeToScVal(v, { type: 'i128' });
}

function toU64(value: string | number | bigint) {
  const v = BigInt(value);
  return nativeToScVal(v, { type: 'u64' });
}

export async function buildCreateSimpleTriggerXDR(params: {
  owner: string;
  sellAsset: string;
  buyAsset: string;
  amountToSell: string;
  triggerPrice: string;
}): Promise<string> {
  if (!CONTRACT_ID) throw new Error('CONTRACT_ID not configured');
  const { owner, sellAsset, buyAsset, amountToSell, triggerPrice } = params;

  const source = await server.getAccount(owner);
  const contract = new Contract(CONTRACT_ID);

  const op = contract.call(
    'create_simple_trigger',
    Address.fromString(owner).toScVal(),
    Address.fromString(sellAsset).toScVal(),
    Address.fromString(buyAsset).toScVal(),
    toI128(amountToSell),
    toI128(triggerPrice)
  );

  const tx = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function buildCancelOrderXDR(params: {
  owner: string;
  orderId: string;
}): Promise<string> {
  if (!CONTRACT_ID) throw new Error('CONTRACT_ID not configured');
  const { owner, orderId } = params;

  const source = await server.getAccount(owner);
  const contract = new Contract(CONTRACT_ID);

  const op = contract.call(
    'cancel_order',
    Address.fromString(owner).toScVal(),
    toU64(orderId)
  );

  const tx = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function submitSignedXDR(signedXDR: string) {
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const send = await server.sendTransaction(tx);

  if (send.errorResult) {
    return { status: 'FAILED', error: send.errorResult, hash: send.hash };
  }

  const maxTries = 20;
  for (let i = 0; i < maxTries; i++) {
    const res = await server.getTransaction(send.hash);
    if (res.status === SorobanRpc.GetTransactionStatus.SUCCESS) {
      return { status: 'SUCCESS', hash: send.hash, resultXdr: res.resultXdr?.toXDR('base64') };
    }
    if (res.status === SorobanRpc.GetTransactionStatus.FAILED) {
      return { status: 'FAILED', hash: send.hash, error: res.resultXdr?.toXDR('base64') };
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { status: 'PENDING', hash: send.hash };
}

export function getPublicConfig() {
  return {
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    contractId: CONTRACT_ID,
  };
}

function oracleTickerToScVal(t: OracleTicker) {
  // This mirrors Reflector.Asset enum in the contract client (reflector.rs):
  // enum Asset { Stellar(Address), Other(Symbol) }
  if (t.type === 'other') {
    return xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('Other'),
      nativeToScVal(t.symbol, { type: 'symbol' }),
    ]);
  }
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol('Stellar'),
    Address.fromString(t.address).toScVal(),
  ]);
}

export async function buildTriggerOneXDR(req: BuildTriggerOneRequest): Promise<string> {
  if (!CONTRACT_ID) throw new Error('CONTRACT_ID not configured');
  if (!StrKey.isValidEd25519PublicKey(req.caller)) throw new Error('caller must be a valid public key');
  if (req.slipBps < 0 || req.slipBps >= 10000) throw new Error('invalid slipBps');
  if (req.deadlineSecs < 0) throw new Error('invalid deadlineSecs');

  const source = await server.getAccount(req.caller);
  const contract = new Contract(CONTRACT_ID);

  const oracleArg = oracleTickerToScVal(req.oracleTicker);
  const op = contract.call(
    'trigger_one',
    oracleArg,
    toU64(req.orderId),
    nativeToScVal(req.slipBps, { type: 'u32' }),
    nativeToScVal(req.deadlineSecs, { type: 'u64' })
  );

  const tx = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function buildCreateTrailingXDR(req: BuildTrailingCreateRequest): Promise<string> {
  if (!CONTRACT_ID) throw new Error('CONTRACT_ID not configured');
  const source = await server.getAccount(req.owner);
  const contract = new Contract(CONTRACT_ID);
  const op = contract.call(
    'create_trailing_stop_loss',
    Address.fromString(req.owner).toScVal(),
    Address.fromString(req.sellAsset).toScVal(),
    Address.fromString(req.buyAsset).toScVal(),
    toI128(req.amountToSell),
    nativeToScVal(req.trailBps, { type: 'u32' }),
    oracleTickerToScVal(req.oracleTicker)
  );
  const tx = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();
  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}


