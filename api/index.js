const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.end(`
  ETH currency exchange rates: <a href="/api/eth">ETH here</a>
  `);
});

app.get("/api/:currency", async (req, res) => {
  const response = await fetch(
    `https://api.coinbase.com/v2/exchange-rates?currency=${req.params.currency}`
  );
  let json = await response.json();

  if (req.query.to && !Array.isArray(req.query.to)) {
    if (req.query.amount) {
      const rate = json.data.rates[req.query.to.toUpperCase()];
      if (!rate) {
        return res.json({
          message: "invalid pair!",
        });
      }
      const price = (Number(req.query.amount) || 0) / rate;
      return res.json({
        currency: json.data.currency,
        [req.query.to.toUpperCase()]: {
          rate: rate,
          price: price,
          amount: price * rate,
        },
        explainMessage: `Get ${price} ${json.data.currency} from ${
          price * rate
        } ${req.query.to.toUpperCase()}`,
      });
    } else {
      return res.json({
        currency: json.data.currency,
        [req.query.to.toUpperCase()]: {
          rate: json.data.rates[req.query.to.toUpperCase()],
        },
      });
    }
  } else {
    return res.json(json.data);
  }
});

module.exports = app;
