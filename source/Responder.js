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

//#ifdef DEBUG
jayus.debug.className = 'Responder';
//#endif

// TODO: jayus.Responder() - A few tweaks could improve memory usage, dont create arrays for a single handler, and dont create an options object for the default options

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

	handle: function Responder_handle(handlers){
		//#ifdef DEBUG
		jayus.debug.match('Entity.handle', handlers, 'handlers', jayus.TYPES.OBJECT);
		//#endif
		for(var event in handlers){
			if(handlers.hasOwnProperty(event)){
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

	addHandler: function Responder_addHandler(event, handler, options){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Responder.addHandler', arguments, 'event', jayus.TYPES.STRING, 'handler', jayus.TYPES.FUNCTION);
		jayus.debug.matchOptional('Responder.addHandler', options, 'options', jayus.TYPES.OBJECT);
		//#endif
		// Initialize the objects if needed
		if(!this.hasHandlers){
			this.hasHandlers = true;
			this.isHandler = {
				frame: false
			};
			this.handlers = {};
		}
		if(arguments.length === 2){
			options = {};
		}
		// Set the handler
		options.handler = handler;
		options.hasContext = typeof options.context === 'object';
		options.interceptor = !!options.interceptor;
		// Check if already a handler
		if(this.isHandler[event]){
			// Add the handler
			this.handlers[event].push(options);
		}
		else{
			// Create the handler array and set the flag
			this.handlers[event] = [options];
			this.isHandler[event] = true;
		}
		return this;
	},

	/**
	Attaches a transient callback function to an event.
	<br> A transient handler will only be called once in response to the event it's attached to, after which it is deleted.
	@method {Self} interceptNextEvent
	@param {String} event
	@param {Function} handler
	@param {Object} options Optional
	@... {String} id The handler id, for easy removal
	@... {Object} context The context the handler is executed in
	*/

	interceptNextEvent: function Responder_interceptNextEvent(event, handler, options){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Responder.addHandler', arguments, 'event', jayus.TYPES.STRING, 'handler', jayus.TYPES.FUNCTION);
		jayus.debug.matchOptional('Responder.addHandler', options, 'options', jayus.TYPES.OBJECT);
		//#endif
		if(arguments.length === 2){
			options = {};
		}
		options.interceptor = true;
		return this.addHandler(event, handler, options);
	},

	/**
	Removes an event handler.
	<br> Requires that either the id or actual function be given.
	@method {Self} removeHandler
	@paramset Syntax 1
	@param {String} event
	@param {Function} handler
	@paramset Syntax 2
	@param {String} event
	@param {String} id
	*/

	removeHandler: function Responder_removeHandler(event, handler){
		//#ifdef DEBUG
		jayus.debug.match('Responder.removeHandler', event, 'event', jayus.TYPES.STRING);
		if(!jayus.debug.is(jayus.TYPES.FUNCTION, handler) && !jayus.debug.is(jayus.TYPES.STRING, handler)){
			throw new TypeError('Responder.removeHandler() - Invalid handler'+jayus.debug.toString(handler)+' sent, Function or String required.');
		}
		//#endif
		if(this.isHandler[event]){
			// Check for a function, else assume its the id(string)
			if(handler instanceof Function){
				this.handlers[event].splice(this.handlers[event].indexOf(handler), 1);
			}
			else{
				// Search for the handler with the given id
				var i, id = handler;
				for(i=0;i<this.handlers[event].length;i++){
					handler = this.handlers[event][i];
					if(handler.id === id){
						this.handlers[event].splice(i, 1);
					}
				}
			}
			// Remove the array and clear the isHandler flag if there are no remaining event handlers
			if(!this.handlers[event].length){
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

	removeHandlers: function Entity_removeHandlers(event){
		//#ifdef DEBUG
		jayus.debug.match('Entity.removeHandlers', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Remove the handler
		if(this.isHandler[event]){
			this.handlers[event] = [];
			this.isHandler[event] = false;
		}
		return this;
	},

	/**
	Removes all event handlers.
	@method {Self} removeAllHandlers
	*/

	removeAllHandlers: function Entity_removeAllHandlers(){
		this.hasHandlers = false;
		if(typeof this.addDefaultHandlers === 'function'){
			this.addDefaultHandlers();
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
	@param {Object} data Optional
	*/

	fire: function Responder_fire(event, data){
		//#ifdef DEBUG
		jayus.debug.match('Responder.fire', event, 'event', jayus.TYPES.STRING);
		jayus.debug.matchOptional('Responder.fire', data, 'data', jayus.TYPES.OBJECT);
		//#endif
		var i, opts, result;
		if(this.hasHandlers && this.isHandler[event]){
			// Loop through the responders for the event
			for(i=0;i<this.handlers[event].length;i++){
				// Get the event handler
				opts = this.handlers[event][i];
				// Call the handler and store the result as a boolean
				result = !!opts.handler.call(opts.hasContext ? opts.context : this, data);
				// Remove the event handler if interceptor, return if it was the only handler
				if(opts.interceptor){
					this.removeHandler(event, opts.handler);
					// Check to exit the loop early
					if(!this.isHandler[event]){
						// Return true if accepted, else false
						return result;
					}
				}
				// Return true if accepted
				if(result){
					return true;
				}
			}
		}
		return false;
	}

});