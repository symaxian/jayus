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
Defines the jayus.images module.
@file images.js
*/

/*

	Sources:
		HTMLImage, HTMLCanvas, HTMLVideo
		Do we need to worry about jayus objects?

*/


//
//  jayus.images
//________________//

/**
The images module, used for preloading image files.
@namespace jayus.images
*/

jayus.images = {

	//
	//  Properties
	//______________//

	/**
	The loaded images.
	<br> Do not modify.
	@property {Object} images
	*/

	images: {},

	/**
	The number of images that have not finished loading.
	<br> Do not modify.
	@property {Number} pendingImageCount
	*/

	pendingImageCount: 0,

	//
	//  Methods
	//___________//

	//#ifdef DEBUG

	checkFilepath: function jayus_images_checkFilepath(filepath) {
		jayus.debug.match('jayus.images.checkFilepath', filepath, 'filepath', jayus.TYPES.STRING);
		if(filepath.indexOf('../') !== -1) {
			console.warn('jayus.images.checkFilepath() - Filepath "'+filepath+'" contains "./" or "../", avoid using these');
		}
	},

	//#end

	/**
	Returns whether the specified image is loaded or not.
	<br> If an array is sent, returns true iff every image is loaded.
	@method {Boolean} isLoaded
	@param {String|Array<String>} filepath
	*/

	isLoaded: function jayus_images_isLoaded(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.images.isLoaded', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			for(var i=0;i<filepath.length;i++) {
				if(!this.isLoaded(filepath[i])) {
					return false;
				}
			}
			return true;
		}
		//#ifdef DEBUG
		jayus.debug.match('jayus.images.isLoaded', filepath, 'filepath', jayus.TYPES.STRING);
		this.checkFilepath(filepath);
		//#end
		return typeof this.images[filepath] === 'object' && (this.images[filepath].loaded || this.images[filepath].tagName === 'CANVAS');
	},

	/**
	Returns the specified image.
	<br> The image will still be returned if it is not yet loaded.
	@method {Image} get
	@param {String|Array<String>} filepath
	*/

	get: function jayus_images_get(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.images.get', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			var images = [];
			for(var i=0;i<filepath.length;i++) {
				images[i] = this.get(filepath[i]);
			}
			return images;
		}
		//#ifdef DEBUG
		jayus.debug.match('jayus.images.get', filepath, 'filepath', jayus.TYPES.STRING);
		this.checkFilepath(filepath);
		//#end
		if(!this.isLoaded(filepath)) {
			//#ifdef DEBUG
			console.warn('jayus.images.get() - Image "'+filepath+'" not yet loaded');
			//#end
		}
		return this.images[filepath];
	},

	/**
	Defines an image from a section of another.
	@method {Self} setSubimage
	@param {String} sourceImage
	@param {String} image
	@param {Number} sourceX
	@param {Number} sourceY
	@param {Number} sourceWidth
	@param {Number} sourceHeight
	*/

	setSubimage: function jayus_images_setSubimage(sourceImage, image, sourceX, sourceY, sourceWidth, sourceHeight) {
		var source = this.get(sourceImage);
		var canvas = document.createElement('canvas');
		canvas.width = sourceWidth;
		canvas.height = sourceHeight;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(
			source,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			sourceWidth,
			sourceHeight
		);
		this.images[image] = canvas;
		jayus.fire('imageLoaded', {
			filepath: sourceImage,
			image: canvas
		});
		return this;
	},

	/**
	Runs the callback handler when the image is loaded.
	<br> Attaches a handler for the 'loaded' event, or the image is already loaded it calls the function immediately.
	<br> The context for the handler is the global scope.
	@method {Self} whenLoaded
	@param {String|Array<String>} filepath
	@param {Function} handler
	*/

	whenLoaded: function jayus_images_whenLoaded(filepath, handler) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.matchArguments('jayus.images.whenLoaded', arguments, 'filepaths', jayus.TYPES.ARRAY, 'handler', jayus.TYPES.FUNCTION);
			//#end
			if(this.isLoaded(filepath)) {
				handler();
			}
			else {
				jayus.addHandler('imageLoaded', function(data, options) {
					// Use the cheap and slow way to check
					if(jayus.images.isLoaded(filepath)) {
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
			jayus.debug.matchArguments('jayus.images.whenLoaded', arguments, 'filepath', jayus.TYPES.STRING, 'handler', jayus.TYPES.FUNCTION);
			//#end
			if(this.isLoaded(filepath)) {
				handler({
					filepath: filepath,
					image: this.get(filepath)
				});
			}
			else {
				jayus.addHandler('imageLoaded', function(data, options) {
					if(data.filepath === filepath) {
						// Call the handler and remove this handler
						handler(data);
						options.remove = true;
					}
				});
				this.load(filepath);
			}
		}
		return this;
	},

	/**
	Begins loading the specified image[s].
	<br> If you want to perform an action after the image is loaded you should use the jayus.images.whenLoaded() method.
	<br> An image will not be loaded twice.
	@method load
	@paramset Syntax 1
	@param {String} filepath
	@paramset Syntax 2
	@param {Array} filepaths
	*/

	load: function jayus_images_load(filepath) {
		// Check if array
		if(typeof filepath === 'object') {
			//#ifdef DEBUG
			jayus.debug.match('jayus.images.load', filepath, 'filepaths', jayus.TYPES.ARRAY);
			//#end
			for(var i=0;i<filepath.length;i++) {
				this.load(filepath[i]);
			}
		}
		else {
			//#ifdef DEBUG
			jayus.debug.match('jayus.images.load', filepath, 'filepath', jayus.TYPES.STRING);
			//#end
			// Check if not loading/loaded
			if(typeof this.images[filepath] !== 'object') {
				// Create and save a new image
				var image = new Image();
				image.isSheet = false;
				image.loaded = false;
				this.images[filepath] = image;
				// Set the onload handler to fire some events
				image.onload = function image_onload() {
					this.loaded = true;
					// Fire the image loaded event on jayus and the surface
					jayus.fire('imageLoaded', {
						filepath: filepath,
						image: this
					});
					// Decrement the number of pending files and check to fire the event
					jayus.images.pendingImageCount--;
					if(!jayus.images.pendingImageCount) {
						jayus.fire('imagesLoaded');
					}
				};
				// Increment the pending image count
				this.pendingImageCount++;
				// Set the image source
				image.src = filepath;
			}
		}
	}

};
