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
Defines the Rectangle class.
@file Rectangle.js
*/

//
//  jayus.Rectangle()
//_____________________//

/**
Represents an axis-aligned rectangle.
<br> Check the init method for construction options.
@class jayus.Rectangle
*/

//#ifdef DEBUG
jayus.debug.className = 'Rectangle';
//#endif

jayus.Rectangle = jayus.Shape.extend({

	//
	//  Properties
	//______________//

	componentType: 'RECTANGLE',

	shapeType: jayus.SHAPES.RECTANGLE,

	/**
	The x position of the rectangle.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} x
	*/

	x: 0,

	/**
	The y position of the rectangle.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} y
	*/

	y: 0,

	/**
	The width of the rectangle.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} width
	*/

	width: 0,

	/**
	The height of the rectangle.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} height
	*/

	height: 0,

	/**
	Whether to draw the rectangle to be aligned with the pixel grid of canvas.
	<br> Under ideal conditions(drawing a simple non-transformed rectangle) this property should turn blurry rectangles into pixel-sharp ones.
	<br> Default is true.
	<br> Do not modify.
	@property {Boolean} keepAligned
	*/

	keepAligned: true,

	//
	//  Methods
	//___________//

	/**
	Initiates the rectangle.
	<br> Note that while the rectangle can be initiated directly from an origin and size, the rectangle will copy rather than rely on the given instances.
	@constructor init
	@paramset 1
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

	init: function Rectangle_init(x, y, width, height){
		if(arguments.length){
			//#ifdef DEBUG
			jayus.debug.matchRectangle('Rectangle.init', x, y, width, height);
			//#endif
			// Expand the arguments
			if(arguments.length === 2){
				height = y.height;
				width = y.width;
				y = x.y;
				x = x.x;
			}
			else if(arguments.length === 3){
				height = width;
				width = height;
				y = x.y;
				x = x.x;
			}
			// Set the rect
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	},

		//
		//  Origin
		//__________//

	/**
	Returns the origin of the rectangle.
	@method {Point} getOrigin
	*/

	getOrigin: function Rectangle_getOrigin(){
		return new jayus.Point(this.x, this.y);
	},

	getOriginOnto: function Rectangle_getOriginOnto(ret){
		ret.x = this.x;
		ret.y = this.y;
		return ret;
	},

	/**
	Sets the x coordinate of the origin.
	<br> Can be animated.
	@method {Self} setX
	@param {Number} x
	*/

	setX: jayus.Point.prototype.setX,

	/**
	Sets the y coordinate of the origin.
	<br> Can be animated.
	@method {Self} setY
	@param {Number} y
	*/

	setY: jayus.Point.prototype.setY,

	/**
	Sets the origin of the rectangle.
	<br> Can be animated.
	@method {Self} setOrigin
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setOrigin: function Rectangle_setOrigin(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Rectangle.set', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setOrigin, [this.x, this.y], [x, y]);
		}
		// Check if different
		if(this.x !== x || this.y !== y){
			this.x = x;
			this.y = y;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	//@ From Shape
	translate: function Rectangle_translate(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Rectangle.translate', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.setOrigin(this.x+x, this.y+y);
	},

		//
		//  Size
		//________//

	/**
	Sets the width.
	<br> Can be animated.
	@method {Self} setWidth
	@param {Number} width
	*/

	setWidth: function Rectangle_setWidth(width){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setWidth', width, 'width', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setWidth, this.width, width);
		}
		if(this.width !== width){
			this.width = width;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

	/**
	Sets the height.
	<br> Can be animated.
	@method {Self} setHeight
	@param {Number} height
	*/

	setHeight: function Rectangle_setHeight(height){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setHeight', height, 'height', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setHeight, this.height, height);
		}
		if(this.height !== height){
			this.height = height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

	/**
	Sets the size of the rectangle.
	<br> Can be animated.
	@method {Self} setSize
	@paramset 1
	@param {Point} size
	@paramset 2
	@param {Number} width
	@param {Number} height
	*/

	setSize: function Rectangle_setSize(width, height){
		//#ifdef DEBUG
		jayus.debug.matchSize('Rectangle.setSize', width, height);
		//#endif
		if(arguments.length === 1){
			height = width.height;
			width = width.width;
		}
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setSize, [this.width, this.height], [width, height]);
		}
		if(this.width !== width || this.height !== height){
			this.width = width;
			this.height = height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

	/**
	Expands the size of the rectangle.
	<br> Can be animated.
	@method {Self} expand
	@param {Number} width
	@param {Number} height
	*/

	expand: function Rectangle_expand(width, height){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Rectangle.expand', arguments, jayus.TYPES.NUMBER, 'width', 'height');
		//#endif
		return this.setSize(this.width+width, this.height+height);
	},

		//
		//  Frame
		//_________//

	/**
	Returns the x coordinate of the left side of the rectangle.
	@method {Number} getLeft
	*/

	getLeft: function Rectangle_getLeft(){
		return this.x;
	},

	/**
	Returns the x coordinate of the right side of the rectangle.
	@method {Number} getRight
	*/

	getRight: function Rectangle_getRight(){
		return this.x+this.width;
	},

	/**
	Returns the y coordinate of the top of the rectangle.
	@method {Number} getTop
	*/

	getTop: function Rectangle_getTop(){
		return this.y;
	},

	/**
	Returns the y coordinate of the bottom of the rectangle.
	@method {Number} getBottom
	*/

	getBottom: function Rectangle_getBottom(){
		return this.y+this.height;
	},

	/**
	Sets the x coordinate of the left side of the rectangle.
	<br> Can be animated.
	@method {Self} setLeft
	@param {Number} left
	*/

	setLeft: function Rectangle_setLeft(left){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setLeft', left, 'left', jayus.TYPES.NUMBER);
		//#endif
		return this.setFrame(left, this.y, this.x+this.width-left, this.height);
	},

	/**
	Sets the x coordinate of the right side of the rectangle.
	<br> Can be animated.
	@method {Self} setRight
	@param {Number} right
	*/

	setRight: function Rectangle_setRight(right){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setRight', right, 'right', jayus.TYPES.NUMBER);
		//#endif
		return this.setWidth(this.width+right-this.x);
	},

	/**
	Sets the y coordinate of the top of the rectangle.
	<br> Can be animated.
	@method {Self} setTop
	@param {Number} top
	*/

	setTop: function Rectangle_setTop(top){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setTop', top, 'top', jayus.TYPES.NUMBER);
		//#endif
		return this.setFrame(this.x, top, this.width, this.y+this.height-top);
	},

	/**
	Sets the y coordinate of the bottom of the rectangle.
	<br> Can be animated.
	@method {Self} setBottom
	@param {Number} bottom
	*/

	setBottom: function Rectangle_setBottom(bottom){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.setBottom', bottom, 'bottom', jayus.TYPES.NUMBER);
		//#endif
		return this.setHeight(this.height+bottom-this.y);
	},

	/**
	Sets the rectangle.
	<br> Can be animated.
	@method {Self} setFrame
	@paramset 1
	@param {Point} origin
	@param {Number} width
	@param {Number} height
	@paramset 2
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/


	setFrame: function Rectangle_setFrame(x, y, width, height){
		// Expand the arguments
		if(arguments.length === 3){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Rectangle.setFrame', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			//#endif
			height = width;
			width = y;
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Rectangle.setFrame', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		}
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setFrame, [this.x, this.y, this.width, this.height], [x, y, width, height]);
		}
		this.frozen++;
		this.setOrigin(x, y).setSize(width, height);
		this.frozen--;
		this.dirty(jayus.DIRTY.FRAME);
		return this;
	},

	/**
	Expands the rectangle to include the given point.
	<br> Can be animated.
	@method {Self} includePoint
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	includePoint: function Rectangle_includePoint(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Rectangle.includePoint', x, y);
		//#endif
		// Expand the arguments
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		var x1 = Math.min(this.x, x),
			y1 = Math.min(this.y, y),
			x2 = Math.max(this.x+this.width, x),
			y2 = Math.max(this.y+this.height, y);
		return this.setFrame(x1, y1, x2-x1, y2-y1);
	},

	/**
	Expands the rectangle to include the given rectangle.
	<br> Can be animated.
	@method {Self} includeRectangle
	@param {Rectangle} rect
	*/

	includeRectangle: function Rectangle_includeRectangle(x, y, width, height){
		if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Rectangle.includeRectangle()', x, 'section', jayus.TYPES.RECTANGLE);
			//#endif
			height = x.height;
			width = x.width;
			y = x.y;
			x = x.x;
		}
		else if(arguments.length === 3){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Rectangle.includeRectangle()', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			//#endif
			height = width;
			width = y;
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Rectangle.includeRectangle()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		}
		//#endif
		var x1 = Math.min(this.x, x),
			y1 = Math.min(this.y, y),
			x2 = Math.max(this.x+this.width, x+width),
			y2 = Math.max(this.y+this.height, y+height);
		return this.setFrame(x1, y1, x2-x1, y2-y1);
	},

	//@ From Shape
	alignToCanvas: function Rectangle_alignToCanvas(){
		return this.setFrame(
			Math.floor(this.x)+0.5,
			Math.floor(this.y)+0.5,
			Math.round(this.width),
			Math.round(this.height)
		);
	},

		//
		//  Intersection
		//________________//

	//@ From Shape
	intersectsAt: function Rectangle_intersectsAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Rectangle.intersectsAt', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#endif
		return this.x <= x && x <= this.x+this.width && this.y <= y && y <= this.y+this.height;
	},

		//
		//  Utilities
		//_____________//

	//#ifdef DEBUG
	toString: function Rectangle_toString(){
		return '( Rectangle: '+this.x+', '+this.y+', '+this.width+', '+this.height+' )';
	},
	//#endif

	//@ From Shape
	getScope: function Rectangle_getScope(){
		return this.clone();
	},

	//@ From Shape
	getTransformed: function Rectangle_getTransformed(matrix){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.getTransformed', matrix, 'matrix', jayus.TYPES.MATRIX);
		//#endif
		return this.toPolygon().getTransformed(matrix);
	},

	//@ From Shape
	clone: function Rectangle_clone(){
		return this.cloneOnto(new jayus.Rectangle());
		// return new jayus.Rectangle(this.x, this.y, this.width, this.height);
	},

	//@ From Shape
	cloneOnto: function Rectangle_cloneOnto(ret){
		//#ifdef DEBUG
		jayus.debug.match('Rectangle.cloneOnto', ret, 'ret', jayus.TYPES.RECTANGLE);
		//#endif
		ret.x = this.x;
		ret.y = this.y;
		ret.width = this.width;
		ret.height = this.height;
		return ret;
	},

	/**
	Returns a polygon representing the rectangle.
	@method {Polygon} toPolygon
	*/

	toPolygon: function Rectangle_toPolygon(){
		return new jayus.Polygon.Rectangle(this.x, this.y, this.width, this.height);
	},

	//@ From Shape
	etchOntoContext: function Rectangle_etchOntoContext(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('Rectangle.etchOntoContext', ctx);
		//#endif
		// Start a new path and draw the rect
		ctx.beginPath();
		if(this.keepAligned){
			// Draw aligned
			ctx.rect(
				Math.round(this.x)+0.5,
				Math.round(this.y)+0.5,
				Math.round(this.width),
				Math.round(this.height)
			);
		}
		else{
			// Draw exact
			ctx.rect(this.x, this.y, this.width, this.height);
		}
		return this;
	}

});