 /**
 * Copyright © 2011 Jonathon Reesor
 *
 * This file is part of Jayus.
 *
 * Jayus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jayus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jayus.  If not, see <http://www.gnu.org/licenses/>.
 **/

/**
Defines the base Responder class.
@file Responder.js
*/

//
//  jayus.Responder()
//_____________________//

/**
The base class for an object that uses the jayus event system.
@class jayus.Responder
*/

// TODO: jayus.Responder() - A few tweaks could improve memory usage, dont create arrays for a single handler

jayus.Responder = jayus.createClass({

		// Events

	/**
	Whether or not the Responder has any handlers for any event.
	<br> Until true the isHandler and handlers properties are not initialized.
	@property {Boolean} hasHandlers
	*/

	hasHandlers: false,

	/**
	An object treated as a set of booleans denoting whether or not the responder has a handler to an event.
	<br> The event name indexes the boolean value(or undefined).
	<br> Do not modify.
	<br> This object is initalized lazily, it is null until required to be otherwise.
	@property {null|Object} isHandler
	*/

	isHandler: null,
	// A true/false value will not exist for every event, luckily undefined is interpreted as false

	/**
	An object holding event handlers.
	<br> The event name indexes an array objects that hold the callback functions and relevant settings.
	<br> Do not modify.
	<br> This object is initalized lazily, it is null until required to be otherwise.
	@property {null|Object} handlers
	*/

	handlers: null,

	//
	//  Methods
	//___________//

		//
		//  Handlers
		//____________//

	/**
	Adds the given handlers to the responder.
	@method {Self} handle
	@param {Object} handlers
	*/

	handle: function Responder_handle(handlers) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.handle', handlers, 'handlers', jayus.TYPES.OBJECT);
		//#end
		for(var event in handlers) {
			if(handlers.hasOwnProperty(event)) {
				this.addHandler(event, handlers[event]);
			}
		}
		return this;
	},

	/**
	Attaches a callback function to an event.
	<br> Any number of handlers may be attached to an event, when the event is fired they are called in the order they were attached.
	@method {Self} addHandler
	@param {String} event
	@param {Function} handler
	@param {Object} options Optional
	@... {String} id The handler id, for easy removal
	@... {Object} context The context the handler is executed in
	*/

	addHandler: function Responder_addHandler(event, handler, options) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Responder.addHandler', arguments, 'event', jayus.TYPES.STRING, 'handler', jayus.TYPES.FUNCTION);
		jayus.debug.matchOptional('Responder.addHandler', options, 'options', jayus.TYPES.OBJECT);
		//#end
		// Initialize the objects if needed
		if(!this.hasHandlers) {
			this.hasHandlers = true;
			this.isHandler = {
				frame: false
			};
			this.handlers = {};
		}
		// Create the options object, which serves as a descriptor for the handler
		if(typeof options !== 'object') {
			options = {};
		}
		options.handler = handler;
		options.hasContext = typeof options.context === 'object';
		options.enabled = true;
		options.remove = false;
		// Check if already a handler
		if(this.isHandler[event]) {
			// Add the handler
			this.handlers[event].push(options);
		}
		else {
			// Create the handler array and set the flag
			this.handlers[event] = [options];
			this.isHandler[event] = true;
		}
		return this;
	},

	/**
	Removes an event handler.
	<br> Requires that either the id or actual function be given.
	@method {Self} removeHandler
	@param {String} event
	@param {Function|String} handler
	*/

	removeHandler: function Responder_removeHandler(event, handler) {
		//#ifdef DEBUG
		jayus.debug.match('Responder.removeHandler', event, 'event', jayus.TYPES.STRING);
		if(!jayus.debug.is(jayus.TYPES.FUNCTION, handler) && !jayus.debug.is(jayus.TYPES.STRING, handler)) {
			throw new TypeError('Responder.removeHandler() - Invalid handler'+jayus.debug.toString(handler)+' sent, Function or String required.');
		}
		//#end
		if(this.isHandler[event]) {
			var i, options,
				handlers = this.handlers[event];
			// Check if the options object was sent
			if(typeof handler === 'object') {
				handlers.splice(handlers.indexOf(handler), 1);
			}
			// Check for a function, else assume its the id(string)
			else if(handler instanceof Function) {
				// Search for the handler with the given id
				for(i=0;i<handlers.length;i++) {
					options = handlers[i];
					if(options.handler === handler) {
						handlers.splice(i, 1);
					}
				}
			}
			else {
				// Search for the handler with the given id
				for(i=0;i<handlers.length;i++) {
					options = handlers[i];
					if(options.id === handler) {
						handlers.splice(i, 1);
					}
				}
			}
			// Remove the array and clear the isHandler flag if there are no remaining event handlers
			if(!handlers.length) {
				delete this.handlers[event];
				this.isHandler[event] = false;
			}
		}
		return this;
	},

	/**
	Removes all event handlers for a given event.
	@method {Self} removeHandlers
	@param {String} event
	*/

	removeHandlers: function Entity_removeHandlers(event) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.removeHandlers', event, 'event', jayus.TYPES.STRING);
		//#end
		// Remove the handler
		if(this.isHandler[event]) {
			delete this.handlers[event];
			this.isHandler[event] = false;
		}
		return this;
	},

	/**
	Removes all event handlers.
	@method {Self} removeAllHandlers
	*/

	removeAllHandlers: function Entity_removeAllHandlers() {
		this.hasHandlers = false;
		this.isHandler = null;
		this.handlers = null;
		if(typeof this.events === 'object' && this.events !== null) {
			this.handle(this.events);
		}
		return this;
	},

		//
		//  Firing
		//__________//

	/**
	Fires the given event on the responder.
	<br> The data parameter is optional, it is an object used to hold event data.
	<br> Returns true if accepted.
	@method {Boolean} fire
	@param {String} event
	@param {*} data Optional
	*/

	/*
		Possibilities for passing data from handler to caller:
			Possible data:
				Whether the event was accepted or not
				Whether to remove the event handler or not
			Methods:
				Return true/false
				Set flag in opts object
				Return object with data
					- Requires extra objects be made and trashes
				Return a bitset
					- Can be messy for the user to deal with
	*/

	fire: function Responder_fire(event, data) {
		//#ifdef DEBUG
		jayus.debug.match('Responder.fire', event, 'event', jayus.TYPES.STRING);
		jayus.debug.matchOptional('Responder.fire', data, 'data', jayus.TYPES.DEFINED);
		//#end
		var i,
			opts,
			result,
			handlers;
		if(this.hasHandlers && this.isHandler[event]) {
			// Copy the handler array, so that any manipulation of it will not affect the fire loop
			handlers = this.handlers[event].slice(0);
			// Loop through the responders for the event
			for(i=0;i<handlers.length;i++) {
				// Get the event handler data
				opts = handlers[i];
				// Check to remove
				if(opts.remove) {
					// Remove the handler
					this.removeHandler(event, opts.handler);
				}
				else if(opts.enabled) {
					// Call the handler
					// If a truthy value is returned, the event was accepted/cancelled, return true
					if(opts.handler.call(opts.hasContext ? opts.context : this, data, opts)) {
						return true;
					}
				}
			}
		}
		return false;
	}

});