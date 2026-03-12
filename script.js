const signalBadge = document.getElementById('signalBadge');
const confidenceText = document.getElementById('confidenceText');
const rationaleText = document.getElementById('rationaleText');
const featureList = document.getElementById('featureList');
const alertList = document.getElementById('alertList');
const entryValue = document.getElementById('entryValue');
const stopValue = document.getElementById('stopValue');
const targetValue = document.getElementById('targetValue');

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const jitter = () => (Math.random() * 2 - 1) * 0.25;

let basePrice = 43150;
const featureState = {
  orderFlow: 0,
  orderBook: 0,
  liquidityHeatmap: 0,
  bigOrderClusters: 0,
  regimeRisk: 0
};

const weights = {
  orderFlow: 0.3,
  orderBook: 0.2,
  liquidityHeatmap: 0.2,
  bigOrderClusters: 0.2,
  regimeRisk: 0.1
};

const featureLabel = {
  orderFlow: 'Order Flow',
  orderBook: 'Order Book',
  liquidityHeatmap: 'Liquidity Heatmap',
  bigOrderClusters: 'Big Order Clusters',
  regimeRisk: 'Regime & Risk'
};

function scoreSignal() {
  Object.keys(featureState).forEach((key) => {
    featureState[key] = clamp(featureState[key] * 0.65 + jitter(), -1, 1);
  });

  const score = Object.entries(weights).reduce((acc, [key, w]) => acc + featureState[key] * w, 0);
  const confidence = clamp(0.45 + Math.abs(score) * 0.75, 0, 0.98);

  let signal = 'WAIT';
  if (score >= 0.65 && confidence >= 0.72) signal = 'BUY';
  if (score <= -0.65 && confidence >= 0.72) signal = 'SELL';

  return { score, confidence, signal };
}

function renderFeatures() {
  featureList.innerHTML = Object.entries(featureState)
    .map(([k, v]) => `<li>${featureLabel[k]}: <strong>${v.toFixed(2)}</strong></li>`)
    .join('');
}

function pushAlert(signal, confidence, score) {
  const now = new Date().toLocaleTimeString();
  const text = `${now} | ${signal} | conf ${(confidence * 100).toFixed(0)}% | score ${score.toFixed(2)}`;
  const li = document.createElement('li');
  li.textContent = text;
  alertList.prepend(li);

  while (alertList.children.length > 6) {
    alertList.removeChild(alertList.lastChild);
  }
}

function renderDecision() {
  const { score, confidence, signal } = scoreSignal();
  basePrice += score * 3.2 + jitter() * 9;

  signalBadge.classList.remove('buy', 'sell', 'wait');
  signalBadge.textContent = signal;

  if (signal === 'BUY') signalBadge.classList.add('buy');
  else if (signal === 'SELL') signalBadge.classList.add('sell');
  else signalBadge.classList.add('wait');

  confidenceText.textContent = `Confidence: ${(confidence * 100).toFixed(0)}%`;
  rationaleText.textContent = `Composite score ${score.toFixed(2)} from order flow/book/liquidity/cluster alignment.`;

  const entry = basePrice;
  const riskDistance = 18 + Math.abs(score) * 25;

  if (signal === 'BUY') {
    entryValue.textContent = `Entry: ${entry.toFixed(1)}`;
    stopValue.textContent = `Stop: ${(entry - riskDistance).toFixed(1)}`;
    targetValue.textContent = `Target: ${(entry + riskDistance * 1.9).toFixed(1)}`;
    pushAlert(signal, confidence, score);
  } else if (signal === 'SELL') {
    entryValue.textContent = `Entry: ${entry.toFixed(1)}`;
    stopValue.textContent = `Stop: ${(entry + riskDistance).toFixed(1)}`;
    targetValue.textContent = `Target: ${(entry - riskDistance * 1.9).toFixed(1)}`;
    pushAlert(signal, confidence, score);
  } else {
    entryValue.textContent = 'Entry: Waiting';
    stopValue.textContent = 'Stop: -';
    targetValue.textContent = 'Target: -';
  }

  renderFeatures();
}

for (let i = 0; i < 2; i += 1) renderDecision();
setInterval(renderDecision, 1600);
