const signalBadge = document.getElementById('signalBadge');

const demoSignals = [
  { label: 'BUY', className: 'signal-buy' },
  { label: 'SELL', className: 'signal-sell' },
  { label: 'WAIT', className: 'signal-wait' }
];

let i = 0;

const renderSignal = () => {
  const signal = demoSignals[i];
  signalBadge.classList.remove('signal-buy', 'signal-sell', 'signal-wait');
  signalBadge.classList.add(signal.className);
  signalBadge.textContent = `Live Example Signal: ${signal.label}`;
  i = (i + 1) % demoSignals.length;
};

renderSignal();
setInterval(renderSignal, 3500);
