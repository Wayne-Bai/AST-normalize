var Class = require('std/Class'),
	UIComponent = require('std/ui/Component'),
	each = require('std/each'),
	invoke = require('std/invoke'),
	bind = require('std/bind'),
	map = require('std/map'),
	raphael = require('raphael')

module.exports = Class(UIComponent, function(supr) {
	
	this._init = function(slice) {
		supr(this, '_init')
		this._slice = slice
	}
	
	this._createContent = function() {
		this._status = this.append(this.dom({ 'class':'status' }))
		this._canvas = this.append(this.dom({ 'class':'canvas', style: {
			width:this._width,
			height:this._height,
			overflow:'hidden'
		}}))
		this._paper = raphael(this._canvas, this._width, this._height)
		this._slice
			.on('data', bind(this, '_clearAndRender'))
			.on('error', bind(this, '_handleSliceError'))
			.on('unauthorized', bind(this, '_handleSliceUnauthorized'))
			.on('loading', bind(this, '_onSliceLoading'))
	}

	this._clearAndRender = function(data) {
		this._paper.clear()
		this._render(data || this._data)
		this.style(this._canvas, { width:this.getWidth(), height:this.getHeight() })
	}

	this._onSliceLoading = function(isLoading) {
		if (isLoading) { this._setStatus('loading...') }
		else { this._setStatus('') }
	}

	this._setStatus = function(message) {
		if (message) {
			this._status.innerHTML = message
			this.show(this._status)
		} else {
			this.hide(this._status)
		}
	}

	this._handleSliceError = function(err) {
		this._setStatus('error: ' + err.stack)
	}
	
	this._handleSliceUnauthorized = function(err) {
		this._setStatus('Your session expired (probably because the server restarted). Please refresh the page')
	}
})
