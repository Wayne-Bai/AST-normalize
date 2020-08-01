/**
 * @class
 * One-to-one Chatting
 *
 * @extends XC.Base
 * @extends XC.Mixin.Discoverable
 * @extends XC.Mixin.HandlerRegistration
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 4</a>
 */
XC.Service.Chat = XC.Base.extend(XC.Mixin.Discoverable,
                                 XC.Mixin.HandlerRegistration,
  /** @lends XC.Service.Chat# */{

  /**
   * Register for incoming stanzas
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'message',
        type: 'chat'
      }, this._handleMessages, this);
    }

    return this;
  }.around(),

  /**
   * Call this.registerHandler with "onMessage" to register for incoming
   * messages of type 'chat'.
   * @name XC.Service.Chat#onMessage
   * @event
   * @param {XC.MessageStanza} message A message sent to this resource.
   */

  /**
   * Handles out-of-band messages (All incoming messages)
   * from another entity.
   *
   * @param {Element} packet The incoming XML stanza.
   */
  _handleMessages: function (packet) {
    var msg = this.connection.MessageStanza.extend({
      packet: packet
    });

    this.fireHandler('onMessage', msg);
  }
});
