var winston = require('winston');
var moment  = require('moment');
var ripple  = require('ripple-lib');
var async   = require('async');
var issuerCapitalization = require('../../routes/issuerCapitalization');
var utils   = require('../utils');

//all currencies we are going to check
var currencies = [
  {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},  //Bitstamp USD
  {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}, //Snapswap USD
  {currency: 'BTC', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},  //Bitstamp BTC
  {currency: 'BTC', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}, //Snapswap BTC
  {currency: 'BTC', issuer: 'rJHygWcTLVpSXkowott6kzgZU6viQSVYM1'}, //Justcoin BTC
  {currency: 'EUR', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}, //Snapswap EUR
  {currency: 'CNY', issuer: 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK'}, //RippleCN CNY
  {currency: 'CNY', issuer: 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA'}, //RippleChina CNY
  {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'}, //RippleFox CNY
  {currency: 'JPY', issuer: 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6'}, //RippleTradeJapan JPY
  {currency: 'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'}, //TokyoJPY JPY
  {currency: 'JPY', issuer: 'rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg'}, //Ripple Market JPY
  {currency: 'XAU', issuer: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH'}, //Ripple Singapore XAU
  {currency: 'XAU', issuer: 'rrh7rf1gV2pXAoqA8oYbpHd8TKv5ZQeo67'}, //GBI XAU
  {currency: 'KRW', issuer: 'rUkMKjQitpgAM5WTGk79xpjT38DEJY283d'}, //Pax Moneta KRW
];

var conversionPairs = [];
currencies.forEach(function(currency) {

  if (currency.currency == 'XRP') {
    return;
  }

  conversionPairs.push({
    base    : {currency: 'XRP'},
    counter : currency
  });
});


function totalNetworkValue (params, callback) {

  var rowkey;

  if (!params) params = {};

  rowkey = 'network_value';

  if (!params.time) {
    params.time = moment.utc();
    rowkey   += '|live';

  } else {
    params.time = moment.utc(params.time).startOf('hour');
    rowkey += '|' + utils.formatTime(params.time);
  }

  //prepare results to send back
  var response = {
    time         : params.time.format(),
    exchange     : {currency:'XRP'},
    exchangeRate : 1,
    total        : 0
  };

  //call issuerCapitalization for
  //each of the currencies
  issuerCapitalization({
      currencies : currencies,
      startTime  : moment.utc(0),
      endTime    : params.time,

  }, function(err, data) {

    if (err) return callback(err);

    getExchangeRates(params.time, function(error, rates) {
      if (error) return callback(error);

      rates.forEach(function(pair, i){
        data[i].rate            = pair.rate;
        data[i].convertedAmount = pair.rate ? data[i].amount / pair.rate : 0;
      });

      //include XRP balance
      getXRPbalance(params.time, function(error, balance){
        if (error) return callback(error);

        data.push({
          currency : "XRP",
          rate     : 1,
          amount   : balance,
          convertedAmount : balance,
        });

        data.forEach(function(currency, index) {
          response.total += currency.convertedAmount;
        });

        response.components = data;

        //cache XRP normalized version
        cacheResponse (rowkey, response);
        callback (null, response);
      });
    });
  });

  /*
   * get exchange rates for the listed currencies
   *
   */

  function getExchangeRates (time, callback) {

    // Mimic calling offersExercised for each asset pair
    async.map(conversionPairs, function(assetPair, asyncCallbackPair){

      hbase.getExchanges( {
        base       : assetPair.base,
        counter    : assetPair.counter,
        start      : moment.utc(time).subtract(1, 'day'),
        end        : time,
        interval   : '1day',
        descending : false
      }, function(err, resp) {

        if (err) {
          asyncCallbackPair(err);
          return;
        }

        if (resp.length) {
          resp = resp[0];
        }

        assetPair.rate =  resp ? resp.vwap : 0;
        asyncCallbackPair(null, assetPair);
      });

    }, function(error, results){
      if (error) return callback(error);
      return callback(null, results);
    });
  }

  /**
  *  getLatestLedgerSaved gets the ledger with the highest
  *  index saved in CouchDB
  */
  function getXRPbalance(time, callback) {
    hbase.getLedger({closeTime: time || moment.utc()}, function (err, ledger) {

      if (err) {
        callback('Hbase - ' + err);
        return;
      }

      if (!ledger) {
        callback('no ledgers saved');
        return;
      }

      callback(null, Number(ledger.totalCoins) / 1000000.0);
    });
  }

  function cacheResponse (rowkey, response) {
    var table = 'agg_metrics';
    hbase.putRow(table, rowkey, response);
    console.log('cacheing metric:', rowkey);
  }
}


module.exports = totalNetworkValue;
