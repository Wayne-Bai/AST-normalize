'use strict';

var Sequelize  = require('sequelize'),
    db         = require('../models'),
    cachedExchangePriceData = {},
    cachedTickerPrice = [];

cachedTickerPrice.timestamp = Date.now();

exports.getAll = function(req, res) {
  db.ExchangePrice.findAll(
    {where: ['timestamp > ?', Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 7)/1000)]} // within one week
  )
  .success(function(tickerPrice) {
    res.send(200, tickerPrice);
  });
};

exports.getExchangePrices = function(req, res) {
  if(req.params.exchange) {
    var cachedExchangePrices = cachedExchangePriceData[req.params.exchange];

    // Serve up cached data if available & within 15 mins recent
    if(cachedExchangePrices !== undefined && Date.now() - cachedExchangePrices.timestamp < 1000 * 60 * 15) { // within 15 mins
      res.send(200, cachedExchangePrices);
    } else {
      db.ExchangePrice.findAll(
        { where: Sequelize.and(
          {site: req.params.exchange},
          ['timestamp > ?', Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 7)/1000)] // within one week
        )}
      )
      .success(function(exchangePrices) {
        cachedExchangePrices = exchangePrices;
        cachedExchangePrices.timestamp = Date.now();

        res.send(200, exchangePrices);
      })
      .error(function(err) {
        res.send(400, {error: err});
      });
    }
  } else {
    console.error('No exchange parameter passed.');
    res.send(400);
  }
};

exports.getTicker = function(req, res) {
  var elapsedTime = Date.now() - cachedTickerPrice.timestamp;

  // Serve up cached data if available & within 1 min recent
  if(cachedTickerPrice.length !== 0 && elapsedTime < 1000 * 60) { // within 1 min
    res.send(cachedTickerPrice);
  } else {
    db.ExchangePrice.find(
      {where: {site: 3}, // BTCChina
      attributes: ['value', 'currency'],
      order: 'timestamp DESC',
      limit: 1})
    .success(function(tickerPrice) {
      cachedTickerPrice = tickerPrice;
      cachedTickerPrice.timestamp = Date.now();

      res.send(200, tickerPrice);
    });
  }

};