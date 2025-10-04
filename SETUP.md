# Stellex Setup Guide

## ✅ Contract Successfully Deployed!

**CONTRACT_ID**: `CBGELODBFEL7VOM44HMG6WCCPCPF4EV5DJR2IYSYC5ZX3FTLOKBBFSIH`

View on Stellar Expert: https://stellar.expert/explorer/testnet/contract/CBGELODBFEL7VOM44HMG6WCCPCPF4EV5DJR2IYSYC5ZX3FTLOKBBFSIH

---

## Network Configuration

Use these values in your `backend/.env` file:

```env
PORT=8787
RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
CONTRACT_ID=CBGELODBFEL7VOM44HMG6WCCPCPF4EV5DJR2IYSYC5ZX3FTLOKBBFSIH
ORACLE_ID=<GET_FROM_REFLECTOR_DOCS>
ROUTER_ID=<GET_FROM_SOROSWAP_DOCS>
SLIP_BPS=100
PRICE_SCALE=100000000
CORS_ORIGIN=http://localhost:5500

# Optional - for keeper
KEEPER_SECRET=<YOUR_SECRET_KEY>
KEEPER_INTERVAL_MS=10000
KEEPER_ORDER_ID=
KEEPER_ORACLE_TYPE=other
KEEPER_ORACLE_VALUE=XLMUSD
KEEPER_DEADLINE_SECS=300
```

---

## Required Setup Steps

### 1. Get External Contract Addresses

You need to find and add these testnet contract addresses:

**Reflector Oracle (ORACLE_ID)**:
- Check: https://reflector.stellar.expert/
- Or Reflector GitHub/docs for testnet deployments

**Soroswap Router (ROUTER_ID)**:
- Check: https://docs.soroswap.finance/
- Or Soroswap GitHub for testnet router address

**Asset Contract Addresses** (for SAC):

Get native XLM SAC address:
```bash
stellar contract id asset --asset native --network testnet
```

For testnet USDC or other assets:
```bash
stellar contract id asset --asset CODE:ISSUER_ADDRESS --network testnet
```

### 2. Initialize Your Contract

Once you have the Oracle and Router addresses, initialize the contract:

```bash
stellar contract invoke \
  --id CBGELODBFEL7VOM44HMG6WCCPCPF4EV5DJR2IYSYC5ZX3FTLOKBBFSIH \
  --source deployer \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address deployer) \
  --oracle_address <ORACLE_CONTRACT_ID> \
  --dex_router_address <ROUTER_CONTRACT_ID>
```

### 3. Configure Backend

Edit `backend/.env`:
```bash
cd backend
cp .env.example .env
# Edit .env with the values above
```

### 4. Start Services

**Terminal 1 - Backend API:**
```bash
cd backend
npm install  # if not already done
npm run dev
```

Backend will run on: http://localhost:8787

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # if not already done
npm run serve
```

Frontend will run on: http://localhost:5500

**Terminal 3 - Keeper (Optional):**
```bash
cd backend
npm run keeper
```

### 5. Use the Frontend

1. Open browser to: http://localhost:5500
2. Install Freighter wallet extension if needed: https://www.freighter.app/
3. Switch Freighter to **TESTNET** mode
4. Click "Connect Freighter"
5. Use the UI to:
   - Create Simple Trigger orders
   - Create Trailing Stop-Loss orders
   - Cancel orders
   - Manually trigger orders (for testing)

---

## Important Notes

### Before Creating Orders

1. **Ensure Soroswap has liquidity** for your trading pair on testnet
2. **Get correct SAC addresses** for both sell and buy assets
3. **Fund your wallet** with testnet XLM and the tokens you want to trade

### Testing Flow

1. Create a simple trigger order with a test amount
2. Check the transaction on Stellar Expert
3. Try canceling an order
4. Create a trailing stop-loss order
5. Monitor keeper logs if running

### Troubleshooting

**"Contract not initialized" error:**
- Run the initialization command above

**"Insufficient funds" error:**
- Fund your wallet: `stellar keys address deployer --fund`

**Swap fails:**
- Verify Soroswap has liquidity for your pair
- Check `amount_out_min` isn't too high (reduce `SLIP_BPS`)

**Frontend can't connect:**
- Verify backend is running on port 8787
- Check CORS_ORIGIN in backend/.env

---

## Deployed Account Info

**Deployer Public Key**: `GDI75MZ53K7JRUNJ2Q2IRBHZ4BMIMPYMNCP7WMNEO2SD36TIKOW4ZOXY`

To view your deployer address:
```bash
stellar keys address deployer
```

To fund the deployer again:
```bash
curl "https://friendbot.stellar.org/?addr=GDI75MZ53K7JRUNJ2Q2IRBHZ4BMIMPYMNCP7WMNEO2SD36TIKOW4ZOXY"
```

---

## Contract Functions

Your deployed contract has these functions:
- `initialize` - Initialize contract with admin, oracle, and router
- `create_simple_trigger` - Create a simple trigger order
- `create_trailing_stop_loss` - Create a trailing stop-loss order
- `cancel_order` - Cancel an active order
- `trigger_one` - Trigger an order (public, callable by anyone)
- `get_order` - Get order details by ID

---

## Next Steps

1. Get Reflector Oracle and Soroswap Router testnet addresses
2. Initialize your contract
3. Start backend and frontend
4. Test creating and canceling orders
5. Monitor with keeper for automatic execution

**Need Help?**
- Stellar Discord: https://discord.gg/stellar
- Soroban Docs: https://soroban.stellar.org/
- Stellar Expert: https://stellar.expert/explorer/testnet

