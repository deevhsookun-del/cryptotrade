const Portfolio = require("../models/Portfolio");

async function getOrCreatePortfolio(userId) {
  let portfolio = await Portfolio.findOne({ userId });

  if (!portfolio) {
    portfolio = await Portfolio.create({
      userId,
      cashUSD: 10000,
      holdings: [],
      trades: [],
    });
  }

  return portfolio;
}

function snapshotPortfolio(portfolio, markets) {
  let holdingsValue = 0;

  const holdings = portfolio.holdings.map(h => {
    const m = markets.find(x => x.symbol === h.symbol);
    const price = m ? m.price : 0;
    const value = h.qty * price;
    const pnl = (price - h.avgBuy) * h.qty;

    holdingsValue += value;

    return {
      symbol: h.symbol,
      name: m?.name || h.symbol,
      qty: h.qty,
      avgBuy: h.avgBuy,
      price,
      value,
      pnl,
    };
  });

  return {
    cashUSD: portfolio.cashUSD,
    holdingsValue,
    totalUSD: portfolio.cashUSD + holdingsValue,
    holdings,
    trades: portfolio.trades,
  };
}

module.exports = {
  getOrCreatePortfolio,
  snapshotPortfolio,
};
