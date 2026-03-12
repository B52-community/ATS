# ATS - Advanced Trading Signal Engine (Web Blueprint + Prototype)

This project contains a web-based design and prototype console for an advanced trading signal engine.

## What it demonstrates

- A concrete architecture for generating **BUY / SELL / WAIT** signals.
- Signal inputs from:
  - Order flow analysis
  - Order book intelligence
  - Liquidity heatmaps
  - Big-order cluster tracking
  - Regime/risk filtering
- A front-end live prototype that simulates streaming features, confidence scores, and alerts.

## Run locally

```bash
python3 -m http.server 4173
```

Open: `http://localhost:4173`

## Notes

- The current implementation is a prototype UI and scoring simulation for planning/design.
- Production deployment should use real market feeds, strict backtesting, and risk governance.
