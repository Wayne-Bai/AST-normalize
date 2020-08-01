define(["../walletmanager", "./abstractwallet"], function (WalletManager, AbstractWallet) {
  var MiniWallet = function (data) {
    AbstractWallet.apply(this, arguments);

    this.type = 'mini';

    this.wallet = new Bitcoin.Wallet();

    if (data) {
      if (data.keys) {
        var keys = data.keys.split(',');
        var pubs = data.pubs ? data.pubs.split(',') : [];

        if (Array.isArray(pubs) && pubs.length == keys.length) {
          this.wallet.addKeys(keys, pubs);
        } else {
          this.wallet.addKeys(keys);
        }
      }
    }

    // We want to have a minimum of one address
    if (this.wallet.getLength() == 0) {
      this.wallet.generateAddress();
    }
  };

  MiniWallet.humanName = "Mini Wallet";
  MiniWallet.humanDesc = "Very simple wallet where your keys are stored locally in your browser";

  MiniWallet.prototype.serialize = function () {
    var data = AbstractWallet.prototype.serialize.apply(this, arguments);
    data.type = 'mini';
    data.keys = this.wallet.getKeys().join(',');
    data.pubs = this.wallet.getPubKeys().join(',');

    return data;
  };

  WalletManager.reg('mini', MiniWallet);

  return MiniWallet;
});
