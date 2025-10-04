# Stellex Backend (Soroban helper)

Minimal Express server to build Soroban contract invocation transactions for the OrderBook and to submit signed XDRs.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install deps and run:

```bash
cd backend
npm install
npm run dev
```

## Endpoints

- POST `/tx/simple-trigger/build` → `{ xdr }`
- POST `/tx/cancel/build` → `{ xdr }`
- POST `/tx/submit` → `{ status, hash, ... }`
- GET `/config` → `{ rpcUrl, networkPassphrase, contractId }`
- GET `/health`


