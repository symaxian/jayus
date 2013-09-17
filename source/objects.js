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
	@method {Object} has
	@param {String} filepath
	*/

	has: function jayus_objects_has(filepath){
		return typeof this.objects[filepath] === 'object' && this.objects[filepath] !== null;
	},

	/**
	Returns the specified object.
	<br> Null is returned if the object is not loaded.
	@method {Object} get
	@param {String} filepath
	*/

	get: function jayus_objects_get(filepath){
		if(!this.has(filepath)){
			//#ifdef DEBUG
			console.warn('jayus.objects.get() - Object "'+filepath+'" not yet loaded');
			//#endif
			this.load(filepath);
		}
		return this.objects[filepath];
	},

	/**
	Loads and parses the specified JSON file.
	<br> The optional callback handler will be executed when the file is loaded, or immediately if it is already loaded.
	<br> The arguments sent to the handler are the filepath followed by the retrieved object and the XMLHttpRequest object.
	<br> An object will not be loaded twice.
	@method load
	@param {String} filepath
	@param {Function} handler Optional
	*/

	load: function jayus_objects_load(filepath, handler){
		//#ifdef DEBUG
		jayus.debug.match('jayus.objects.load', filepath, 'filepath', jayus.TYPES.STRING);
		jayus.debug.matchOptional('jayus.objects.load', handler, 'handler', jayus.TYPES.FUNCTION);
		//#endif
		if(!this.has(filepath)){
			// Create a request to fetch the file
			var req = new XMLHttpRequest();
			req.filepath = filepath;
			req.open('get', filepath, true);
			// Set the callback
			req.onload = function(){
				var object = JSON.parse(this.responseText);
				jayus.objects.objects[this.filepath] = object;
				// Call the callback
				if(typeof handler === 'function'){
					handler(this.filepath, object, this);
				}
				// Fire the loaded event on jayus and the surface
				jayus.fire('objectLoaded', {
					filepath: this.filepath,
					object: object,
					xhr: this
				});
				// Decrement the number of pending files and check to fire the event
				jayus.objects.pendingObjectCount--;
				if(!jayus.objects.pendingObjectCount){
					jayus.fire('objectsLoaded');
				}
			};
			// Init as null until loaded
			this.objects[filepath] = null;
			this.pendingObjectCount++;
			// Send the request
			req.send();
		}
		else if(arguments.length === 2){
			handler(filepath, this.objects[filepath]);
		}
	},

	/**
	Loads the specified objects.
	<br> The optional callback handler will be executed when all the objects have been loaded, or immediately if they have all already been loaded.
	@method loadAll
	@param {Array<String>} filepaths
	@param {Function} handler Optional
	*/

	loadAll: function jayus_objects_loadAll(filepaths, handler){
		var i, count, checkCount;
		if(arguments.length === 1){
			for(i=0;i<filepaths.length;i++){
				this.load(filepaths[i]);
			}
		}
		else if(arguments.length === 2){
			count = filepaths.length;
			checkCount = function(){
				count--;
				if(!count){
					handler();
				}
			};
			for(i=0;i<filepaths.length;i++){
				this.load(filepaths[i], checkCount);
			}
		}
	}

};