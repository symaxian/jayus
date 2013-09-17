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

	/**
	Returns whether the specified image has been requested.
	<br> Note that this does not mean that the image is loaded, only that the image object is available and that is has been requested.
	@method {Image} has
	@param {String} filepath
	*/

	has: function jayus_images_has(filepath){
		return typeof this.images[filepath] === 'object';
	},

	/**
	Returns whether the specified image is loaded or not.
	@method {Boolean} isLoaded
	@param {String} filepath
	*/

	isLoaded: function jayus_images_isLoaded(filepath){
		return typeof this.images[filepath] === 'object' && (this.images[filepath].loaded || this.images[filepath].tagName === 'CANVAS');
	},

	/**
	Returns the specified image.
	<br> The image will still be returned if it is not yet loaded.
	@method {Image} get
	@param {String} filepath
	*/

	get: function jayus_images_get(filepath){
		if(!this.has(filepath)){
			//#ifdef DEBUG
			console.warn('jayus.images.get() - Image "'+filepath+'" not yet loaded');
			//#endif
			this.load(filepath);
		}
		return this.images[filepath];
	},

	setSubimage: function jayus_images_setSubimage(sourceImage, image, sourceX, sourceY, sourceWidth, sourceHeight){
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
		return this;
	},

	/**
	Loads the specified image.
	<br> An image will not be loaded twice.
	<br> The optional callback handler will be executed when the image is loaded, or immediately if it is already loaded.
	@method load
	@param {String} filepath
	@param {Function} handler Optional
	*/

	load: function jayus_images_load(filepath, handler){
		// Check if not loaded
		if(!this.has(filepath)){
			//#ifdef DEBUG
			if(!jayus.debug.is(jayus.TYPES.STRING, filepath)){
				throw new TypeError('jayus.images.load() - Invalid filepath'+jayus.debug.toString(filepath)+' sent as argument '+i+', String required');
			}
			//#endif
			// Create and save a new image
			var image = new Image();
			image.isSheet = false;
			image.loaded = false;
			this.images[filepath] = image;
			// Set the onload handler to fire some events
			image.onload = function image_onload(){
				this.loaded = true;
				// Fire the image loaded event on jayus and the surface
				jayus.fire('imageLoaded', {
					filepath: filepath,
					image: this
				});
				// Decrement the number of pending files and check to fire the event
				jayus.images.pendingImageCount--;
				if(!jayus.images.pendingImageCount){
					jayus.fire('imagesLoaded');
				}
				// Call the callback
				if(typeof handler === 'function'){
					handler(filepath, this);
				}
			};
			// Increment the pending image count
			this.pendingImageCount++;
			// Set the image source
			image.src = filepath;
		}
	},

	/**
	Loads the specified images.
	<br> The optional callback handler will be executed when all the images have been loaded, or immediately if they have all already been loaded.
	@method loadAll
	@param {Array<String>} filepaths
	@param {Function} handler Optional
	*/

	loadAll: function jayus_images_loadAll(filepaths, handler){
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
