import 'dotenv/config';
import { buildTriggerOneXDR, submitSignedXDR } from './soroban';
import { Server, Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

// Minimal demo keeper that triggers a single order id from env every N seconds.
// Real keeper should scan events or maintain a queue.

const INTERVAL_MS = Number(process.env.KEEPER_INTERVAL_MS || '10000');
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const ORDER_ID = process.env.KEEPER_ORDER_ID; // u64 as string
const SLIP_BPS = Number(process.env.SLIP_BPS || '100');
const DEADLINE_SECS = Number(process.env.KEEPER_DEADLINE_SECS || '300');
const ORACLE_TYPE = process.env.KEEPER_ORACLE_TYPE || 'other';
const ORACLE_VALUE = process.env.KEEPER_ORACLE_VALUE || 'XLMUSD';
const KEEPER_SECRET = process.env.KEEPER_SECRET || '';

if (!ORDER_ID) console.warn('KEEPER_ORDER_ID not set; keeper will be idle');
if (!KEEPER_SECRET) console.warn('KEEPER_SECRET not set; keeper cannot sign');

async function loop() {
  if (!ORDER_ID || !KEEPER_SECRET) return;
  try {
    const kp = Keypair.fromSecret(KEEPER_SECRET);
    const caller = kp.publicKey();
    const oracleTicker = ORACLE_TYPE === 'stellar' ? { type: 'stellar', address: ORACLE_VALUE } : { type: 'other', symbol: ORACLE_VALUE } as any;
    const xdr = await buildTriggerOneXDR({ caller, orderId: ORDER_ID, slipBps: SLIP_BPS, deadlineSecs: DEADLINE_SECS, oracleTicker });
    const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
    tx.sign(kp);
    const res = await submitSignedXDR(tx.toXDR());
    console.log('keeper submit:', res);
  } catch (e) {
    console.error('keeper error', e);
  }
}

setInterval(loop, INTERVAL_MS);
console.log('Keeper started. Interval(ms)=', INTERVAL_MS);



