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
 */

/**
Defines the jayus.objects module.
@file objects.js
*/

//
//  jayus.objects
//_________________//

/**
The objects module, used for preloading JSON files.
@namespace jayus.objects
*/

jayus.objects = {

	//
	//  Properties
	//______________//

	/**
	The loaded objects.
	<br> Do not modify.
	@property {Object} objects
	*/

	objects: {},

	/**
	The number of objects that have not finished loading.
	<br> Do not modify.
	@property {Number} pendingObjectCount
	*/

	pendingObjectCount: 0,

	//
	//  Methods
	//___________//

	/**
	Returns whether the specified object is loaded.
	@method {Object} isLoaded
	@param {String|Array<String>} filepath
	*/

	isLoaded: function jayus_objects_isLoaded(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.objects.isLoaded', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			for(var i=0;i<filepath.length;i++) {
				if(!this.isLoaded(filepath[i])) {
					return false;
				}
			}
			return true;
		}
		//#ifdef DEBUG
		jayus.debug.match('jayus.objects.isLoaded', filepath, 'filepath', jayus.TYPES.STRING);
		//#end
		return typeof this.objects[filepath] === 'object' && this.objects[filepath] !== null;
	},

	/**
	Returns the specified object.
	<br> Null is returned if the object is not loaded.
	@method {Object} get
	@param {String|Array<String>} filepath
	*/

	get: function jayus_objects_get(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.objects.get', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			var objects = [];
			for(var i=0;i<filepath.length;i++) {
				objects[i] = this.get(filepath[i]);
			}
			return objects;
		}
		//#ifdef DEBUG
		jayus.debug.match('jayus.objects.get', filepath, 'filepath', jayus.TYPES.STRING);
		//#end
		if(!this.isLoaded(filepath)) {
			//#ifdef DEBUG
			console.error('jayus.objects.get() - Object "'+filepath+'" not yet loaded');
			//#end
		}
		return this.objects[filepath];
	},

	/**
	Runs the callback handler when the object is loaded.
	<br> Attaches a handler for the 'loaded' event, or the object is already loaded it calls the function immediately.
	<br> The context for the handler is the global scope.
	@method {Self} whenLoaded
	@param {String|Array<String>} filepath
	@param {Function} handler
	*/

	whenLoaded: function jayus_objects_whenLoaded(filepath, handler) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.matchArguments('jayus.objects.whenLoaded', arguments, 'filepaths', jayus.TYPES.ARRAY, 'handler', jayus.TYPES.FUNCTION);
			//#end
			if(this.isLoaded(filepath)) {
				handler();
			}
			else {
				jayus.addHandler('objectLoaded', function(data, options) {
					// Use the cheap and slow way to check
					if(jayus.objects.isLoaded(filepath)) {
						// Call the handler and remove this handler
						handler();
						options.remove = true;
					}
				});
				this.load(filepath);
			}
		}
		else {
			//#ifdef DEBUG
			jayus.debug.matchArguments('jayus.objects.whenLoaded', arguments, 'filepath', jayus.TYPES.STRING, 'handler', jayus.TYPES.FUNCTION);
			//#end
			if(this.isLoaded(filepath)) {
				handler({
					filepath: filepath,
					object: this.get(filepath)
				});
			}
			else {
				jayus.addHandler('objectLoaded', function(data, options) {
					if(data.filepath === filepath) {
						handler(data, options);
						options.remove = true;
					}
				});
				this.load(filepath);
			}
		}
		return this;
	},

	/**
	Loads and parses the specified JSON file.
	<br> The optional callback handler will be executed when the file is loaded, or immediately if it is already loaded.
	<br> The arguments sent to the handler are the filepath followed by the retrieved object and the XMLHttpRequest object.
	<br> An object will not be loaded twice.
	@method load
	@param {String|Array<String>} filepath
	*/

	load: function jayus_objects_load(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.objects.load', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			for(var i=0;i<filepath.length;i++) {
				this.load(filepath[i]);
			}
		}
		else {
			//#ifdef DEBUG
			jayus.debug.match('jayus.objects.load', filepath, 'filepath', jayus.TYPES.STRING);
			//#end
			// Check if not loading/loaded
			if(typeof this.objects[filepath] !== 'object') {
				// Create a request to fetch the file
				var req = new XMLHttpRequest();
				req.filepath = filepath;
				req.open('get', filepath, true);
				// Set the callback
				req.onload = function() {
					var object = JSON.parse(this.responseText);
					jayus.objects.objects[this.filepath] = object;
					// Fire the loaded event on jayus and the surface
					jayus.fire('objectLoaded', {
						filepath: this.filepath,
						object: object,
						xhr: this
					});
					// Decrement the number of pending files and check to fire the event
					jayus.objects.pendingObjectCount--;
					if(!jayus.objects.pendingObjectCount) {
						jayus.fire('objectsLoaded');
					}
				};
				// Init as null until loaded
				this.objects[filepath] = null;
				this.pendingObjectCount++;
				// Send the request
				req.send();
			}
		}
	}

};