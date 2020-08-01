/**
 * Stellar default external currency list.
 *
 * These currencies are ranked by value of notes in circulation. Source:
 *
 * * http://goldnews.bullionvault.com/all_the_money_in_the_world_102720093
 *   (A better source is welcome. Note: The US dollar was moved to the top.)
 *
 * Important: STR must be the first entry in this list.
 *
 * @constant
 * @memberOf Data
 */
window.StellarDefaultCurrencyList =
[
    {value: 'STR', name: 'STR - Stellars', order: 4, maxDecimalPlaces: 0},
    {value: 'USD', name: 'USD - US Dollar', order: 3, maxDecimalPlaces: 2},
    {value: 'EUR', name: 'EUR - Euro', order: 2, maxDecimalPlaces: 2},
    {value: 'BTC', name: 'BTC - Bitcoin', order: 1, maxDecimalPlaces: 6},
    {value: 'JPY', name: 'JPY - Japanese Yen', order: 0, maxDecimalPlaces: 2},
    {value: 'CNY', name: 'CNY - Chinese Yuan', order: 0, maxDecimalPlaces: 2},
    {value: 'INR', name: 'INR - Indian Rupee', order: 0, maxDecimalPlaces: 2},
    {value: 'RUB', name: 'RUB - Russian Ruble', order: 0, maxDecimalPlaces: 2},
    {value: 'GBP', name: 'GBP - British Pound', order: 0, maxDecimalPlaces: 2},
    {value: 'CAD', name: 'CAD - Canadian Dollar', order: 0, maxDecimalPlaces: 2},
    {value: 'BRL', name: 'BRL - Brazilian Real', order: 0, maxDecimalPlaces: 2},
    {value: 'CHF', name: 'CHF - Swiss Franc', order: 0, maxDecimalPlaces: 2},
    {value: 'DKK', name: 'DKK - Danish Krone', order: 0, maxDecimalPlaces: 2},
    {value: 'NOK', name: 'NOK - Norwegian Krone', order: 0, maxDecimalPlaces: 2},
    {value: 'SEK', name: 'SEK - Swedish Krona', order: 0, maxDecimalPlaces: 2},
    {value: 'CZK', name: 'CZK - Czech Koruna', order: 0, maxDecimalPlaces: 2},
    {value: 'PLN', name: 'PLN - Polish Zloty', order: 0, maxDecimalPlaces: 2},
    {value: 'AUD', name: 'AUD - Australian Dollar', order: 0, maxDecimalPlaces: 2},
    {value: 'MXN', name: 'MXN - Mexican Peso', order: 0, maxDecimalPlaces: 2},
    {value: 'KRW', name: 'KRW - South Korean Won', order: 0, maxDecimalPlaces: 2},
    {value: 'TWD', name: 'TWD - New Taiwan Dollar', order: 0, maxDecimalPlaces: 2},
    {value: 'HKD', name: 'HKD - Hong Kong Dollar', order: 0, maxDecimalPlaces: 2}
];


window.StellarDefaultCurrencyMap = _.indexBy(StellarDefaultCurrencyList, 'value');
