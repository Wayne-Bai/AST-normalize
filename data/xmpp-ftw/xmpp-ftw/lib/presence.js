/* @flow */
'use strict';

var builder = require('ltx')
  , Base    = require('./base')

var Presence = function() {}

Presence.prototype = new Base()

Presence.prototype.NS_ENTITY_CAPABILITIES = 'http://jabber.org/protocol/caps'

Presence.prototype.current = 'online';

Presence.prototype._events = {
    'xmpp.presence': 'sendPresence',
    'xmpp.presence.subscribe': 'subscribe',
    'xmpp.presence.subscribed': 'setSubscribed',
    'xmpp.presence.unsubscribe': 'setUnsubscribe',
    'xmpp.presence.unsubscribed': 'setUnsubscribed',
    'xmpp.presence.get': 'get',
    'xmpp.presence.offline': 'setOffline',
    'disconnect': 'setDisconnect'
}

Presence.prototype.subscribe = function(data) {
    this.subscription(data, 'subscribe')
}

Presence.prototype.setSubscribed = function(data) {
    this.subscription(data, 'subscribed')
}

Presence.prototype.setUnsubscribe = function(data) {
    this.subscription(data, 'unsubscribe')
}

Presence.prototype.setUnsubscribed = function(data) {
    this.subscription(data, 'unsubscribed')
}

Presence.prototype.setOffline = function() {
    this.sendPresence({ type: 'unavailable' })
}

Presence.prototype.setDisconnect  = function() {
    if (this.current !== 'unavailable')
        this.sendPresence({ type: 'unavailable' })
}

Presence.prototype.handles = function(stanza) {
    return stanza.is('presence')
}

Presence.prototype.handle = function(stanza) {
    if (stanza.attrs.type === 'subscribe') return this.handleSubscription(stanza)
    if (stanza.attrs.type === 'error') return this.handleError(stanza)
    var presence = { from: this._getJid(stanza.attrs.from) }
    if ('unavailable' === stanza.attrs.type) {
        presence.show = 'offline'
    } else {
        var show, status, priority
        if (!!(show = stanza.getChild('show')))
            presence.show = show.getText()
        if (!!(status = stanza.getChild('status')))
            presence.status = status.getText()
        if (!!(priority = stanza.getChild('priority')))
            presence.priority = priority.getText()
    }
    var capabilities
    if (!!(capabilities = stanza.getChild('c', this.NS_ENTITY_CAPABILITIES))) {
        presence.client = {
            node: capabilities.attrs.node,
            ver: capabilities.attrs.ver,
            hash: capabilities.attrs.hash
        }
    }
    this.socket.send('xmpp.presence', presence)
    return true
}

Presence.prototype.sendPresence = function(data) {
    if (!data) {
        data = {}
    }
    var stanza = new builder.Element('presence')
    if (data.to) stanza.attr('to', data.to)
    if (data.type && data.type === 'unavailable') stanza.attr('type', data.type)
    if (data.status) stanza.c('status').t(data.status).up()
    if (data.priority) stanza.c('priority').t(data.priority).up()
    if (data.show) stanza.c('show').t(data.show).up()
    if (false === this._addCapabilities(data, stanza)) return
    this.client.send(stanza)
}

Presence.prototype._addCapabilities = function(data, stanza) {
    if (typeof data.client === 'undefined') return true
    if (typeof data.client !== 'object')
        return this._clientError('\'client\' key must be an object', data)
    if (!data.client.node)
        return this._clientError('Missing \'node\' key', data)
    if (!data.client.ver)
        return this._clientError('Missing \'ver\' key', data)
    if (!data.client.hash)
        return this._clientError('Missing \'hash\' key', data)
    stanza.c('c', {
        xmlns: this.NS_ENTITY_CAPABILITIES,
        ver: data.client.ver,
        node: data.client.node,
        hash: data.client.hash
    })
    return true
}

Presence.prototype.handleSubscription = function(stanza) {
    var request = { from: this._getJid(stanza.attrs.from ) }
    if (stanza.getChild('nick')) request.nick = stanza.getChild('nick').getText()
    this.socket.send('xmpp.presence.subscribe', request)
}

Presence.prototype.handleError = function(stanza) {
    var description = stanza.getChild('error').children[0].getName()
    var attributes = { error: description }
    if (stanza.attrs.from)
        attributes.from = this._getJid(stanza.attrs.from)
    this.socket.send('xmpp.presence.error', attributes)
}

Presence.prototype.subscription = function(data, type) {
    if (!data.to) return this._clientError('Missing \'to\' key', data)
    var stanza = new builder.Element(
        'presence',
        { to: data.to, type: type, from: this.manager.jid }
    )
    this.client.send(stanza)
}

Presence.prototype.get = function(data) {
    if (!data.to) return this._clientError('Missing \'to\' key', data)
    var stanza = new builder.Element(
        'presence', { to: data.to, from: this.manager.jid }
    )
    this.client.send(stanza)
}

module.exports = Presence
