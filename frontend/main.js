const BACKEND = localStorage.getItem('stellex_backend') || 'http://localhost:8787';

const els = {
  account: document.getElementById('account'),
  connectBtn: document.getElementById('connectBtn'),
  config: document.getElementById('config'),
  sellAsset: document.getElementById('sellAsset'),
  buyAsset: document.getElementById('buyAsset'),
  amountToSell: document.getElementById('amountToSell'),
  triggerPrice: document.getElementById('triggerPrice'),
  createBtn: document.getElementById('createBtn'),
  createLog: document.getElementById('createLog'),
  trailSellAsset: document.getElementById('trailSellAsset'),
  trailBuyAsset: document.getElementById('trailBuyAsset'),
  trailAmount: document.getElementById('trailAmount'),
  trailBps: document.getElementById('trailBps'),
  trailTickerType: document.getElementById('trailTickerType'),
  trailTickerValue: document.getElementById('trailTickerValue'),
  trailCreateBtn: document.getElementById('trailCreateBtn'),
  trailLog: document.getElementById('trailLog'),
  orderId: document.getElementById('orderId'),
  cancelBtn: document.getElementById('cancelBtn'),
  cancelLog: document.getElementById('cancelLog'),
  tOrderId: document.getElementById('tOrderId'),
  tSlipBps: document.getElementById('tSlipBps'),
  tDeadline: document.getElementById('tDeadline'),
  tTickerType: document.getElementById('tTickerType'),
  tTickerValue: document.getElementById('tTickerValue'),
  triggerBtn: document.getElementById('triggerBtn'),
  triggerLog: document.getElementById('triggerLog'),
};

let pubkey = null;

async function loadConfig() {
  const res = await fetch(`${BACKEND}/config`);
  const json = await res.json();
  els.config.textContent = JSON.stringify(json, null, 2);
}

async function connectFreighter() {
  const has = await window.freighterApi?.isConnected();
  if (!has) {
    alert('Install Freighter extension');
    return;
  }
  pubkey = await window.freighterApi.getPublicKey();
  els.account.textContent = pubkey;
}

async function buildAndSign(endpoint, body) {
  const res = await fetch(`${BACKEND}${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Build failed');

  const { xdr } = json;
  const signed = await window.freighterApi.signTransaction(xdr, {
    network: 'TESTNET',
    networkPassphrase: (await (await fetch(`${BACKEND}/config`)).json()).networkPassphrase,
  });

  const submitRes = await fetch(`${BACKEND}/tx/submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ signedXDR: signed }) });
  return await submitRes.json();
}

els.connectBtn.addEventListener('click', connectFreighter);

els.createBtn.addEventListener('click', async () => {
  try {
    if (!pubkey) await connectFreighter();
    const result = await buildAndSign('/tx/simple-trigger/build', {
      owner: pubkey,
      sellAsset: els.sellAsset.value.trim(),
      buyAsset: els.buyAsset.value.trim(),
      amountToSell: els.amountToSell.value.trim(),
      triggerPrice: els.triggerPrice.value.trim(),
    });
    els.createLog.textContent = JSON.stringify(result, null, 2);
  } catch (e) {
    els.createLog.textContent = String(e);
  }
});

els.cancelBtn.addEventListener('click', async () => {
  try {
    if (!pubkey) await connectFreighter();
    const result = await buildAndSign('/tx/cancel/build', {
      owner: pubkey,
      orderId: els.orderId.value.trim(),
    });
    els.cancelLog.textContent = JSON.stringify(result, null, 2);
  } catch (e) {
    els.cancelLog.textContent = String(e);
  }
});

els.trailCreateBtn?.addEventListener('click', async () => {
  try {
    if (!pubkey) await connectFreighter();
    const type = els.trailTickerType.value;
    const val = els.trailTickerValue.value.trim();
    const oracleTicker = type === 'stellar' ? { type: 'stellar', address: val } : { type: 'other', symbol: val };
    const result = await buildAndSign('/tx/trailing/create/build', {
      owner: pubkey,
      sellAsset: els.trailSellAsset.value.trim(),
      buyAsset: els.trailBuyAsset.value.trim(),
      amountToSell: els.trailAmount.value.trim(),
      trailBps: Number(els.trailBps.value || '500'),
      oracleTicker,
    });
    els.trailLog.textContent = JSON.stringify(result, null, 2);
  } catch (e) {
    els.trailLog.textContent = String(e);
  }
});

els.triggerBtn?.addEventListener('click', async () => {
  try {
    if (!pubkey) await connectFreighter();
    const type = els.tTickerType.value;
    const val = els.tTickerValue.value.trim();
    const oracleTicker = type === 'stellar' ? { type: 'stellar', address: val } : { type: 'other', symbol: val };
    const result = await buildAndSign('/tx/trigger-one/build', {
      caller: pubkey,
      oracleTicker,
      orderId: els.tOrderId.value.trim(),
      slipBps: Number(els.tSlipBps.value || '100'),
      deadlineSecs: Number(els.tDeadline.value || '300'),
    });
    els.triggerLog.textContent = JSON.stringify(result, null, 2);
  } catch (e) {
    els.triggerLog.textContent = String(e);
  }
});

loadConfig();


