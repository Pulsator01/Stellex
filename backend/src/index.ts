import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { buildCancelOrderXDR, buildCreateSimpleTriggerXDR, buildCreateTrailingXDR, buildTriggerOneXDR, getPublicConfig, submitSignedXDR } from './soroban';
import { BuildCancelOrderRequest, BuildSimpleTriggerRequest, SubmitRequest, BuildTriggerOneRequest, BuildTrailingCreateRequest } from './types';

const app = express();
app.use(express.json({ limit: '1mb' }));

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/config', (_req, res) => {
  res.json(getPublicConfig());
});

app.post('/tx/simple-trigger/build', async (req, res) => {
  try {
    const body = req.body as BuildSimpleTriggerRequest;
    const xdr = await buildCreateSimpleTriggerXDR({
      owner: body.owner,
      sellAsset: body.sellAsset,
      buyAsset: body.buyAsset,
      amountToSell: body.amountToSell,
      triggerPrice: body.triggerPrice,
    });
    res.json({ xdr });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

app.post('/tx/cancel/build', async (req, res) => {
  try {
    const body = req.body as BuildCancelOrderRequest;
    const xdr = await buildCancelOrderXDR({ owner: body.owner, orderId: body.orderId });
    res.json({ xdr });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

app.post('/tx/submit', async (req, res) => {
  try {
    const body = req.body as SubmitRequest;
    const result = await submitSignedXDR(body.signedXDR);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

app.post('/tx/trigger-one/build', async (req, res) => {
  try {
    const body = req.body as BuildTriggerOneRequest;
    const xdr = await buildTriggerOneXDR(body);
    res.json({ xdr });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

app.post('/tx/trailing/create/build', async (req, res) => {
  try {
    const body = req.body as BuildTrailingCreateRequest;
    const xdr = await buildCreateTrailingXDR(body);
    res.json({ xdr });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


