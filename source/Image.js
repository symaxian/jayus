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
Defines the Image entity.
@file Image.js
*/

//
//  jayus.Image()
//_________________//

/**
An entity that represents a single image.
<br> Can represent an image file or a {@link Surface}.
<br> Can also represent a sub-section of an image or surface, such as when representing a single sprite from a sprite sheet.
@class jayus.Image
@extends jayus.RectEntity
*/

jayus.Image = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	The source image.
	<br> Do not modify.
	@property {Object} image
	*/

	image: null,

	/**
	The filepath for the image, if specified.
	<br> Do not modify.
	@property {String} filepath
	*/

	filepath: null,

	/**
	Denotes that this image represents a sub-section of the source image.
	<br> Do not modify.
	@property {Boolean} hasSection
	*/

	hasSection: false,

	/**
	The X coordinate of the section of the full image that this one represents.
	<br> Do not modify.
	@property {Number} sectionX
	*/

	sectionX: 0,

	/**
	The X coordinate of the section of the full image that this one represents.
	<br> Do not modify.
	@property {Number} sectionY
	*/

	sectionY: 0,

	/**
	Whether the image is loaded or not.
	<br> Do not modify.
	@property {Boolean} loaded
	*/

	loaded: false,

	/**
	Whether the entity is awaiting on its image file to be loaded.
	<br> Do not modify.
	@property {Boolean} pendingLoad
	*/

	pendingLoad: false,

	roundX: true,

	roundY: true,

	//#ifdef DEBUG

	// hasFlexibleWidth: false,

	// hasFlexibleHeight: false,

	//#end

	//
	//  Methods
	//___________//

	/**
	Initiates the image.
	@constructor Image
	@paramset Syntax 1 - A file
	@param {String} filepath
	@paramset Syntax 2 - A Surface
	@param {Surface} image
	*/

	init: function Image(image, loadHandler) {
		jayus.Entity.prototype.init.apply(this);
		if(arguments.length !== 0) {
			if(arguments.length === 2) {
				this.addHandler('loaded', loadHandler);
			}
			this.setSource(image);
		}
	},

	toObject: function Image_toObject() {
		var object = jayus.RectEntity.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'Image';
		if(this.section !== null) {
			object.section = this.section.toObject();
		}
		// Special handling for the image
		if(this.image instanceof HTMLImageElement) {
			object.image = this.filepath;
		}
		else if(this.image instanceof jayus.Surface) {
			object.image = this.image.toObject();
		}
		// Remove width/height, it is derived from the image
		delete object.width;
		delete object.height;
		return object;
	},

	initFromObject: function Image_initFromObject(object) {
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		// Apply our properties
		this.hasSection = typeof object.section === 'object';
		if(this.hasSection) {
			this.section = new jayus.Rectangle(object.section);
		}
		// Special handling for the image
		if(typeof object.image === 'string') {
			this.setSource(object.image);
		}
		else if(typeof object.image === 'object') {
			this.setSource(new jayus.Surface(object.image));
		}
		return this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Source
		//___________//

	/**
	Sets the source image.
	<br> Fires the loaded event either immediately or whenever the image is loaded.
	@method {Self} setSource
	@paramset Syntax 1 - A file
	@param {String} filepath
	@paramset Syntax 2 - A Surface
	@param {Surface} image
	*/

	setSource: function Image_setSource(image) {
		//#ifdef DEBUG
		if(this.pendingLoad) {
			console.warn('Image.setSource() - Called while still waiting for image "'+filepath+'" to be loaded');
			return this;
		}
		//#end
		// Check the argument type
		if(typeof image === 'string') {
			if(this.filepath === image) {
				console.debug('Image.setSource() - Called twice with same filepath: '+image);
				return this;
			}
			var filepath = image;
			this.filepath = filepath;
			// Check if not loaded
			if(!jayus.images.isLoaded(filepath)) {
				// Set the flags
				this.loaded = false;
				this.pendingLoad = true;
				// Load the file
				var that = this;
				jayus.images.whenLoaded(filepath, function(data) {
					// Clear the flags
					that.pendingLoad = false;
					// Set the image data
					that.setSource(data.image);
				});
				return this;
			}
			// Get the image
			image = jayus.images.get(filepath);
		}
		//#ifdef DEBUG
		if(this.image === image) {
			console.debug('Image.setSource() - Called twice with same image: '+image);
			return this;
		}
		//#end
		// Set the image and size
		this.image = image;
		if(!this.hasSection) {
			this.width = this.image.width;
			this.height = this.image.height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		this.loaded = true;
		this.fire('loaded');
		return this;
	},

	/**
	Runs the callback handler once the image is loaded.
	<br> Attaches a handler for the 'loaded' event, or the image is already loaded it calls the function immediately.
	<br> The context for the handler is this entity.
	@method {Self} whenLoaded
	@param {Function} handler
	*/

	whenLoaded: function Image_whenLoaded(handler) {
		//#ifdef DEBUG
		jayus.debug.match('Image.whenLoaded', handler, 'handler', jayus.TYPES.FUNCTION);
		//#end
		if(this.loaded) {
			handler.apply(this);
		}
		else {
			this.addHandler('loaded', function(data, options) {
				handler.apply(this);
				options.remove = true;
			});
		}
		return this;
	},

		//
		//  Section
		//___________//

	/**
	Sets the source rectangle to use from the source image.
	@method {Self} setSection
	@paramset 1
	@param {Rectangle} section
	@paramset 2
	@param {Point} origin
	@param {Number} width
	@param {Number} height
	@paramset 3
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/

	setSection: function Image_setSection(x, y, width, height) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.match('Image.setSection()', x, 'section', jayus.TYPES.RECTANGLE);
			//#end
			return this.setSection(x.x, x.y, x.width, x.height);
		}
		else if(arguments.length === 3) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('Image.setSection()', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			//#end
			return this.setSection(x.x, x.y, y, width);
		}
		//#ifdef DEBUG
		else {
			jayus.debug.matchArgumentsAs('Image.setSection()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		}
		//#end
		this.hasSection = true;
		if(this.width !== width || this.height !== height) {
			this.sectionX = x;
			this.sectionY = y;
			this.width = width;
			this.height = height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		else if(this.sectionX !== x || this.sectionY !== y) {
			this.sectionX = x;
			this.sectionY = y;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

	/**
	Removes the source section rectangle from the image.
	@method {Self} clearSection
	*/

	clearSection: function Image_clearSection() {
		//#ifdef DEBUG
		if(!this.loaded) {
			console.warn('Image.clearSection() - Image not yet loaded, cannot clear section');
			return;
		}
		//#end
		if(this.hasSection) {
			this.hasSection = false;
			this.width = this.image.width;
			this.height = this.image.height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

		//
		//  Utilities
		//_____________//

	/**
	Returns a CanvasPattern representing the image.
	<br> The repetition string is optional and may be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.
	<br> The default repetition mode is 'repeat'.
	@method {CanvasPattern} toPattern
	@param {String} repetition Optional
	*/

	toPattern: function Image_toPattern(repetition) {
		if(!arguments.length) {
			repetition = 'repeat';
		}
		//#ifdef DEBUG
		jayus.debug.match('Image.toPattern', repetition, 'repetition', jayus.TYPES.STRING);
		if(['repeat','repeat-x','repeat-y','no-repeat'].indexOf(repetition) === -1) {
			throw new Error('Image.toPattern() - Invalid repetition'+jayus.debug.toString(repetition)+' sent, "repeat", "repeat-x", "repeat-y", or "no-repeat" required');
		}
		//#end
		return this.rasterize().toPattern(repetition);
	},

		//
		//  Rendering
		//_____________//

	//@ From Entity
	paintContents: function Image_paintContents(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('Image.paintContents', ctx);
		if(!this.loaded) {
			console.error('Image.paintContents() - Image '+this.filepath+' not yet loaded, cannot paint');
			return;
		}
		//#end
		// Get the image
		var image = this.image;
		if(image instanceof jayus.Surface) {
			image = image.canvas;
		}
		// Check if there's a source rect
		if(this.hasSection) {
			ctx.drawImage(
				image,
				this.sectionX,
				this.sectionY,
				this.width,
				this.height,
				0,
				0,
				this.width,
				this.height
			);
		}
		else {
			ctx.drawImage(image, 0, 0);
		}
		return this;
	}

});