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
Defines the Surface class.
@file Surface.js
*/

//
//  jayus.Surface()
//___________________//

/**
An Entity that represents an editable image.
<br> The Surface class acts as a wrapper for a hidden canvas element.
@class jayus.Surface
*/

//#ifdef DEBUG
jayus.debug.className = 'Surface';
//#endif

jayus.Surface = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	width: 300,

	height: 150,

	/**
	The underlying canvas that the surface represents.
	<br> Do not modify.
	@property {HTMLCanvasElement} canvas
	*/

	canvas: null,

	/**
	The context for the canvas.
	<br> Do not modify.
	@property {CanvasRenderingContext2D} context
	*/

	context: null,

	/*
	Enables manually rendering the surface to negate the blurring effect when scaled up.
	<br> If enabled, the alternate rendering method will negate blurring that occurs when drawing a scaled surface.
	<br> This alternate method is much slower as each pixel is drawn individually.
	<br> Default is false.
	@property {Boolean} negateBlur
	*/

	negateBlur: false,

	//
	//  Methods
	//___________//

	/**
	Initiates the surface.
	<br> Default size is 300x150.
	@constructor init
	@param {Number} width Optional
	@param {Number} height Optional
	*/

	init: function Surface_init(width, height){
		jayus.Entity.prototype.init.apply(this);
		// Check the arguments
		if(arguments.length === 2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Surface.init', arguments, jayus.TYPES.NUMBER, 'width', 'height');
			//#endif
			this.width = width;
			this.height = height;
		}
		// Create the canvas
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d');
	},

		//
		//  Size
		//________//

	hasFlexibleWidth: function Surface_hasFlexibleWidth(){
		return true;
	},

	hasFlexibleHeight: function Surface_hasFlexibleHeight(){
		return true;
	},

	formContents: function Display_formContents(width, height){
		this.canvas.width = width;
		this.canvas.height = height;
	},

			//
			//  Filling
			//___________//

	/**
	Clears the surface.
	<br> Fills the surface with transparent black.
	@method {Self} clear
	*/

	clear: function Surface_clear(){
		this.context.clearRect(0, 0, this.width, this.height);
		return this;
	},

	/**
	Fills the surface with the specified color.
	<br> No blending is used, color values replace the existing color values.
	@method {Self} fill
	@paramset Syntax 1
	@param {Color} color
	@paramset Syntax 2
	@param {Color} color
	@param {Number} alpha
	@paramset Syntax 3
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@paramset Syntax 4
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@param {Number} a
	*/

	fill: overloadArgumentCount({

		1: function Surface_fill(color){
			return this.fill(color.r, color.g, color.b, color.a);
		},

		2: function Surface_fill(color, alpha){
			return this.fill(color.r, color.g, color.b, color.a*alpha);
		},

		3: function Surface_fill(r, g, b){
			return this.fill(r, g, b, 1);
		},

		4: function Surface_fill(r, g, b, a){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Surface.fill', arguments, jayus.TYPES.NUMBER, 'r', 'g', 'b', 'a');
			//#endif
			// Save the context
			var ctx = this.context;
			ctx.save();
			// Apply the color and composition operation
			ctx.fillStyle = 'rgba('+r+','+g+','+b+','+a+')';
			ctx.globalCompositeOperation = 'copy';
			// Draw the rect
			ctx.fillRect(0, 0, this.width, this.height);
			// Restore the context
			ctx.restore();
			return this;
		}

	}),

		//
		//  Buffer
		//__________//

	/**
	Returns an ImageData object containing pixel data from the surface.
	@method {ImageData} getBuffer
	@paramset Syntax 1 - Entire surface
	@paramset Syntax 2 - Specified region
	@param {Rectangle} rect
	@paramset Syntax 3 - Specified region
	@param {Point} origin
	@param {Number} width
	@param {Number} height
	@paramset Syntax 4 - Specified region
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/

	getBuffer: function Surface_getBuffer(x, y, width, height){
		if(arguments.length === 0){
			height = this.height;
			width = this.width;
			y = 0;
			x = 0;
		}
		else if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Surface.getBuffer()', x, 'section', jayus.TYPES.RECTANGLE);
			//#endif
			height = x.height;
			width = x.width;
			y = x.y;
			x = x.x;
		}
		else if(arguments.length === 3){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Surface.getBuffer()', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			//#endif
			height = width;
			width = y;
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Surface.getBuffer()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		}
		//#endif
		// Get and return the buffer
		return this.context.getImageData(x, y, width, height);
	},




	/**
	Places the image from an ImageData object onto the surface.
	@method {Self} putBuffer
	@paramset Syntax 1 - At (0, 0)
	@param {ImageData} buffer
	@paramset Syntax 2
	@param {Point} position
	@param {ImageData} buffer
	@paramset Syntax 3
	@param {Number} x
	@param {Number} y
	@param {ImageData} buffer
	*/

	putBuffer: function Surface_putBuffer(x, y, buffer){
		// Expand the arguments
		if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Surface.putBuffer', x, 'buffer', jayus.TYPES.BUFFER);
			//#endif
			buffer = x;
			y = 0;
			x = 0;
		}
		else if(arguments.length === 2){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Surface.putBuffer', arguments, 'position', jayus.TYPES.POINT, 'buffer', jayus.TYPES.BUFFER);
			//#endif
			buffer = y;
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArguments('Surface.putBuffer', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'buffer', jayus.TYPES.BUFFER);
		}
		//#endif
		// Put the buffer onto the canvas
		this.context.putImageData(buffer, x, y);
		// Mark the surface as dirty
		return this.dirty(jayus.DIRTY.CONTENT);
	},

		//
		//  Pixels
		//__________//

	/**
	Returns the color at a specific pixel.
	<br> If you need to obtain the color values at several pixels, using getBuffer() is much more efficient.
	@method {Color} getPixel
	@paramset Syntax 1
	@param {Point} pixel
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getPixel: function Surface_getPixel(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Surface.getPixel', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		// Get the pixel data
		var data = this.getBuffer(x, y, 1, 1).data;
		// Return a color from the 4 components
		return new jayus.Color(data[0], data[1], data[2], data[3]/255);
	},

	/**
	Sets the color of a pixel.
	@method {Self} setPixel
	@paramset Syntax 1
	@param {Point} pixel
	@param {Color} color
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	@param {Color} color
	@paramset Syntax 3
	@param {Point} pixel
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@paramset Syntax 4
	@param {Number} x
	@param {Number} y
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@paramset Syntax 5
	@param {Number} x
	@param {Number} y
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@param {Number} a
	*/

	setPixel: overloadArgumentCount({

		2: function Surface_setPixel(pixel, color){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Surface.setPixel', arguments, 'pixel', jayus.TYPES.POINT, 'color', jayus.TYPES.COLOR);
			//#endif
			return this.setPixel(pixel.x, pixel.y, color.r, color.g, color.b, color.a);
		},

		3: function Surface_setPixel(x, y, color){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Surface.setPixel', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'color', jayus.TYPES.COLOR);
			//#endif
			return this.setPixel(x, y, color.r, color.g, color.b, color.a);
		},

		4: function Surface_setPixel(pixel, r, g, b){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Surface.setPixel', arguments, 'pixel', jayus.TYPES.POINT, 'r', jayus.TYPES.NUMBER, 'g', jayus.TYPES.NUMBER, 'b', jayus.TYPES.NUMBER);
			//#endif
			return this.setPixel(pixel.x, pixel.y, r, g, b, 1);
		},

		5: function Surface_setPixel(x, y, r, g, b){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Surface.setPixel', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'r', 'g', 'b');
			//#endif
			return this.setPixel(x, y, r, g, b, 1);
		},

		6: function Surface_setPixel(x, y, r, g, b, a){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Surface.setPixel', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'r', 'g', 'b', 'a');
			//#endif
			// Create a buffer of size (1,1)
			var buffer = this.context.createImageData(1, 1),
				data = buffer.data;
			// Put the color components into the buffer
			data[0] = r;
			data[1] = g;
			data[2] = b;
			data[3] = a*255;
			// Put the buffer back onto the surface
			return this.putBuffer(x, y, buffer);
		}

	}),

	// setPixel2: function Surface_setPixel(x, y, r, g, b, a){
	// 	switch(arguments.length){

	// 		case 2:
	// 			//#ifdef DEBUG
	// 			jayus.debug.matchArguments('Surface.setPixel', arguments, 'pixel', jayus.TYPES.POINT, 'color', jayus.TYPES.COLOR);
	// 			//#endif
	// 			return this.setPixel(x.x, x.y, y.r, y.g, y.b, r.a);

	// 		case 3:
	// 			//#ifdef DEBUG
	// 			jayus.debug.matchArguments('Surface.setPixel', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'color', jayus.TYPES.COLOR);
	// 			//#endif
	// 			return this.setPixel(x, y, r.r, r.g, r.b, r.a);

	// 		case 4:
	// 			//#ifdef DEBUG
	// 			jayus.debug.matchArguments('Surface.setPixel', arguments, 'pixel', jayus.TYPES.POINT, 'r', jayus.TYPES.NUMBER, 'g', jayus.TYPES.NUMBER, 'b', jayus.TYPES.NUMBER);
	// 			//#endif
	// 			return this.setPixel(x.x, x.y, y, r, g, 1);

	// 		case 5:
	// 			//#ifdef DEBUG
	// 			jayus.debug.matchArgumentsAs('Surface.setPixel', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'r', 'g', 'b');
	// 			//#endif
	// 			a = 1;

	// 		case 6:
	// 			//#ifdef DEBUG
	// 			jayus.debug.matchArgumentsAs('Surface.setPixel', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'r', 'g', 'b', 'a');
	// 			//#endif
	// 			// Create a buffer of size (1,1)
	// 			var buffer = this.context.createImageData(1, 1),
	// 				data = buffer.data;
	// 			// Put the color components into the buffer
	// 			data[0] = r;
	// 			data[1] = g;
	// 			data[2] = b;
	// 			data[3] = a*255;
	// 			// Put the buffer back onto the surface
	// 			return this.putBuffer(x, y, buffer);

	// 	}
	// },

	/**
	Returns the region that the specified pixel encompasses.
	<br> Includes scaling.
	@method {Rectangle} getPixelFrame
	@paramset Syntax 1
	@param {Point} pixel
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getPixelFrame: function Surface_getPixelFrame(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Surface.getPixelFrame', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		// FIXME: Surface.getPixelFrame() - Account for transformation
		// Do some primitive math
		return new jayus.Rectangle(this.x+x*this.xScale, this.y+y*this.yScale, this.xScale, this.yScale);
	},

	/**
	Returns the pixel on the surface at the given point.
	<br> Returns null if the specified point is invalid.
	<br> Includes scaling.
	@method {Point} getPixelAt
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getPixelAt: function Surface_getPixelAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Surface.getPixelAt', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		// Check that the point intersects the surface
		if(this.intersectsAt(x, y)){
			// A pair of fixes that keep non-existant pixels from being selected
			if(x === this.getRight()){
				x--;
			}
			if(y === this.getBottom()){
				y--;
			}
			return new jayus.Point(Math.floor((x-this.getLeft())/this.xScale), Math.floor((y-this.getTop())/this.yScale));
		}
		return null;
	},

		//
		//  Image Manipulation
		//______________________//

	/**
	Blurs the image on the surface.
	<br> Performs a gaussian blur with the specified intensity.
	<br> Blurs the alpha value as well.
	@method {Self} blurImage
	@param {Number} intensity
	*/

	blurImage: function Surface_blurImage(intensity){
		//#ifdef DEBUG
		jayus.debug.match('Surface.blurImage', intensity, 'intensity', jayus.TYPES.NUMBER);
		//#endif
		// Cache some vars
		var data = this.getBuffer().data,
			w = this.width,
			h = this.height,
			newBuffer = this.context.createImageData(w, h),
			newData = newBuffer.data,
			x, y, sx, sy, r, b, g, a, c, z, i = 0;
		// Loop through the pixels in the buffer
		for(y=0;y<h;y++){
			for(x=0;x<w;x++){
				r = g = b = a = c = 0;
				// Loop through the area to take the average pixel values from
				// Checking that the row/column exists with each iteration
				for(sy=y-intensity;sy<y+1+intensity;sy++){
					if(sy >= 0 && sy < h){
						for(sx=x-intensity;sx<x+1+intensity;sx++){
							if(sx >= 0 && sx < w){
								// Add the pixel components to the totals and increment the pixel count
								z = (sy*w+sx)*4;
								r += data[z];
								g += data[z+1];
								b += data[z+2];
								a += data[z+3];
								c++;
							}
						}
					}
				}
				// Set the average of the pixel component values into the new buffer
				newData[i] = r/c;
				newData[i+1] = g/c;
				newData[i+2] = b/c;
				newData[i+3] = a/c;
				i += 4;
			}
		}
		// Put the buffer back and set as dirty
		return this.putBuffer(newBuffer).dirty();
	},

		//
		//  Utilities
		//_____________//

	/**
	Export the surface to a png image and open it in a new tab, browser permitting.
	<br> Note that exporting a virtual surface takes longer, as the virtual region must be copied then exported.
	@method {Self} exportPNG
	*/

	exportPNG: function Surface_exportPNG(){
		// Open a new tab with the canvas pixel data in a data url
		window.open(this.canvas.toDataURL('image/png'), '_blank');
		return this;
	},

	//#ifdef DEBUG
	toString: function Surface_toString(){
		return '(Surface:'+this.width+','+this.height+')';
	},
	//#endif

	/**
	Returns a CanvasPattern representing the image on the surface.
	<br> The repetition string is optional and may be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.
	<br> The default repptition mode is 'repeat'.
	@method {CanvasPattern} toPattern
	@param {String} repetition Optional
	*/

	toPattern: function Surface_toPattern(repetition){
		if(!arguments.length){
			repetition = 'repeat';
		}
		//#ifdef DEBUG
		else{
			jayus.debug.match('Surface.toPattern', repetition, 'repetition', jayus.TYPES.STRING);
			if(['repeat','repeat-x','repeat-y','no-repeat'].indexOf(repetition) === -1){
				throw new Error('Surface.toPattern() - Invalid repetition'+jayus.debug.toString(repetition)+' sent, "repeat", "repeat-x", "repeat-y", or "no-repeat" required');
			}
		}
		//#endif
		return this.context.createPattern(this.canvas, repetition);
	},

		//
		//  Rendering
		//_____________//

	//@ From RectEntity
	paintContents: function Surface_paintContents(ctx){
		if(this.negateBlur){
			// Draw each pixel individually, needed to counteract the antialiasing on canvas when scaled
			var data = this.getBuffer().data,
				x, y, pos;
			for(y=0;y<this.height;y++){
				for(x=0;x<this.width;x++){
					// Set the pixel color
					pos = 4*(x+this.width*y);
					ctx.fillStyle = 'rgba('+data[pos]+','+data[pos+1]+','+data[pos+2]+','+data[pos+3]/255+')';
					// Draw the pixel
					ctx.fillRect(this.x+x, this.y+y, 1, 1);
				}
			}
		}
		else{
			// Just draw the image
			ctx.drawImage(this.canvas, 0, 0);
		}
	}

});
