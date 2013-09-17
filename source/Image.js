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

//#ifdef DEBUG
jayus.debug.className = 'Image';
//#endif

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
	Denotes that this image represents a sub-section of the source image.
	<br> Do not modify.
	@property {Boolean} hasSection
	*/

	hasSection: false,

	/**
	The rectanglular region of the source image that this image represents.
	<br> Default is null, use Image.setSection(new jayus.Rectangle()) to initialize it.
	<br> Do not replace, use Image.setSection().
	@property {Rectangle} section
	*/

	section: null,

	/**
	Whether to keep the image from being anti-aliased by canvas.
	<br> Default is false.
	@property {Boolean} keepAligned
	*/

	keepAligned: false,

	/**
	Whether the image is loaded or not.
	@property {Boolean} loaded
	*/

	loaded: false,

	//
	//  Methods
	//___________//

	/**
	Initiates the image.
	@constructor init
	@paramset Syntax 1 - A file
	@param {String} filepath
	@paramset Syntax 2 - A Surface
	@param {Surface} image
	*/

	init: function Image_init(image){
		jayus.Entity.prototype.init.apply(this);
		// Check the argument type
		if(typeof image === 'string'){
			var filepath = image;
			// Check if loaded
			if(jayus.images.isLoaded(filepath)){
				// Set image
				this.loaded = true;
				this.image = jayus.images.images[filepath];
				this.width = this.image.width;
				this.height = this.image.height;
			}
			else{
				// Load the file
				var that = this;
				jayus.addHandler('imageLoaded', function(data){
					if(data.filepath === filepath){
						that.loaded = true;
						that.image = data.image;
						if(!that.hasSection){
							that.changeSize(data.image.width, data.image.height);
						}
					}
				});
				jayus.images.load(filepath);
			}
		}
		else{
			// Set the image and size
			this.loaded = true;
			this.image = image;
			this.width = this.image.width;
			this.height = this.image.height;
		}
	},

	hasFlexibleWidth: function Image_hasFlexibleWidth(){
		return false;
	},

	hasFlexibleHeight: function Image_hasFlexibleHeight(){
		return false;
	},

		//
		//  Source
		//___________//

	/**
	Sets the source image.
	@method {Self} setSource
	@paramset Syntax 1 - A file
	@param {String} filepath
	@paramset Syntax 2 - A Surface
	@param {Surface} image
	*/

	setSource: function Image_setSource(image){
		// Check the argument type
		if(typeof image === 'string'){
			var filepath = image;
			// Check if loaded
			if(jayus.images.isLoaded(filepath)){
				// Set image
				this.loaded = true;
				this.image = jayus.images.images[filepath];
				this.changeSize(this.image.width, this.image.height);
			}
			else{
				// Load the file
				var that = this;
				jayus.images.load(filepath, function(source, image){
					that.loaded = true;
					that.image = jayus.images.images[filepath];
					that.changeSize(image.width, image.height);
				});
			}
		}
		else{
			// Set the image and size
			this.loaded = true;
			this.image = image;
			this.changeSize(this.image.width, this.image.height);
		}
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

	setSection: function Image_setSection(x, y, width, height){
		if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Image.setSection()', x, 'section', jayus.TYPES.RECTANGLE);
			//#endif
			height = x.height;
			width = x.width;
			y = x.y;
			x = x.x;
		}
		else if(arguments.length === 3){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Image.setSection()', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			//#endif
			height = width;
			width = y;
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Image.setSection()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		}
		//#endif
		this.hasSection = true;
		if(this.width !== width || this.height !== height){
			this.sectionY = y;
			this.sectionX = x;
			this.changeSize(width, height);
		}
		else if(this.sectionX !== x || this.sectionY !== y){
			this.sectionY = y;
			this.sectionX = x;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},





	/**
	Removes the source section rectangle from the image.
	@method {Self} clearSection
	*/

	clearSection: function Image_clearSection(){
		if(this.hasSection){
			this.hasSection = false;
			this.changeSize(this.image.width, this.image.height);
		}
		return this;
	},

		//
		//  Utilities
		//_____________//

	//@ From Entity
	//#ifdef DEBUG
	toString: function Image_toString(){
		return '(Image:'+this.image+')';
	},
	//#endif

	/**
	Returns a CanvasPattern representing the image.
	<br> The repetition string is optional and may be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.
	<br> The default repetition mode is 'repeat'.
	@method {CanvasPattern} toPattern
	@param {String} repetition Optional
	*/

	toPattern: function Image_toPattern(repetition){
		if(!arguments.length){
			repetition = 'repeat';
		}
		//#ifdef DEBUG
		jayus.debug.match('Image.toPattern', repetition, 'repetition', jayus.TYPES.STRING);
		if(['repeat','repeat-x','repeat-y','no-repeat'].indexOf(repetition) === -1){
			throw new Error('Image.toPattern() - Invalid repetition'+jayus.debug.toString(repetition)+' sent, "repeat", "repeat-x", "repeat-y", or "no-repeat" required');
		}
		//#endif
		return this.rasterize().toPattern(repetition);
	},

		//
		//  Rendering
		//_____________//

	//@ From Entity
	// applyTransforms: function Image_applyTransforms(ctx){
	// 	if(this.keepAligned){
	// 		ctx.translate(Math.round(this.x), Math.round(this.y));
	// 	}
	// 	else{
	// 		ctx.translate(this.x, this.y);
	// 	}
	// 	if(this.isTransformed){
	// 		if(this.xAnchor || this.yAnchor){
	// 			ctx.translate(this.xAnchor, this.yAnchor);
	// 		}
	// 		ctx.scale(this.xScale, this.yScale);
	// 		if(this.angle !== 0){
	// 			ctx.rotate(this.angle);
	// 		}
	// 		if(this.xAnchor || this.yAnchor){
	// 			ctx.translate(-this.xAnchor, -this.yAnchor);
	// 		}
	// 	}
	// 	return this;
	// },

	//@ From Entity
	paintContents: function Image_paintContents(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('Image.paintContents', ctx);
		if(!this.loaded){
			console.warn('Image.paintContents() - Image not yet loaded');
			return;
		}
		//#endif
		// Get the image
		var image = this.image;
		if(image instanceof jayus.Surface){
			image = image.canvas;
		}
		// Check if there's a source rect
		if(this.hasSection){
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
		else{
			ctx.drawImage(image, 0, 0);
		}
		return this;
	}

});