define(function () {
  var AbstractWallet = function (data) {
    if (!data) return;

    this.name = data.name || "Unnamed Wallet";
  };

  AbstractWallet.prototype.serialize = function () {
    var data = {};
    data.name = this.name;
    return data;
  };

  return AbstractWallet;
});
