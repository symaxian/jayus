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
Defines the abstract RectEntity class.
@file Entity.Rect.js
*/

//
//  jayus.RectEntity()
//______________________//

/*

Abstract functions:

	Required for basic functionality
		getBaseWidth()
		getBaseHeight()
		getBounds()
		drawOntoContext()

	Sizing modes:
		FREE		Size is as stated, can be changed by parent
		FIXED		Size is as stated, cannot be changed by parent
		DERIVED		Size is derived from internal components, cannot be changed by parent

*/

/**
The base class for an entity that is enclosed in a rectangular frame.
@class jayus.RectEntity
@extends jayus.Entity
*/

jayus.RectEntity = jayus.Entity.extend({

	//
	//  Properties
	//______________//

		// Meta

	shapeType: jayus.SHAPES.RECTANGLE,

	//#ifdef DEBUG

	hasFlexibleWidth: true,

	hasFlexibleHeight: true,

	//#end

	properties: [
		'x',
		'y',
		'width',
		'height',
		'roundX',
		'roundY',
		'alignBg'
	],

	//
	//  Methods
	//___________//

	updateCursor: function RectEntity_updateCursor(x, y) {
		var pos = new jayus.Point(x, y);
		// Convert the point from parent to local coordinate space
		// If we are transformed, use the matrix, otherwise just to the translation manually
		if(this.isTransformed) {
			this.getMatrix().inverseTransformPointOnto(x, y, pos);
		}
		else {
			pos.x -= this.x;
			pos.y -= this.y;
		}
		// Set the local position
		this.cursorX = pos.x;
		this.cursorY = pos.y;
		// Check if it intersects
		var intersects = this.cursorHitTest(pos.x, pos.y);
		// Check if child previously had the cursor
		if(this.underCursor) {
			// Check if the child currently has the cursor
			if(!intersects) {
				// Clear the cursor flag and fire the cursorOut event
				this.underCursor = false;
				this.fire('cursorOut', pos);
				// If this is a parent, clear the cursor flags from every child
				if(this.isParent) {
					this.removeCursorFromChildren();
				}
			}
			// If the child still has the cursor and is a parent, update its children
			else if(this.isParent && this.propagateCursor) {
				this.updateCursorOnChildren(pos.x, pos.y);
			}
		}
		// Else check if the child just got the cursor
		else if(intersects) {
			// If so set the cursor flag to true and fire the cursorOver event
			this.underCursor = true;
			this.fire('cursorOver', pos);
			// Update every sub-child if it's a parent
			if(this.isParent && this.propagateCursor) {
				this.updateCursorOnChildren(pos.x, pos.y);
			}
		}
	},

	cursorHitTest: function RectEntity_cursorHitTest(x, y) {
		return 0 <= x && 0 <= y && x <= this.width && y <= this.height;
	},

	toObject: function RectEntity_toObject() {
		var object = jayus.Entity.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'RectEntity';
		var i, key, val, valType;
		for(i=0;i<jayus.RectEntity.prototype.properties.length;i++) {
			key = jayus.RectEntity.prototype.properties[i];
			val = this[key];
			valType = typeof val;
			if(val !== jayus.RectEntity.prototype[key]) {
				if(valType === 'object') {
					val = val.toObject();
				}
				object[key] = val;
			}
		}
		if(this.bg !== jayus.RectEntity.prototype.bg) {
			object.bg = this.bg.toObject();
		}
		if(this.bounds !== jayus.RectEntity.prototype.bounds) {
			object.bounds = this.bounds.toObject();
		}
		return object;
	},

	initFromObject: function RectEntity_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		// Apply parent properties
		jayus.Entity.prototype.initFromObject.call(this, object);
		// Apply our own properties
		this.ignoreDirty++;
		var i, key, val, valType;
		for(i=0;i<jayus.RectEntity.prototype.properties.length;i++) {
			key = jayus.RectEntity.prototype.properties[i];
			val = object[key];
			if(typeof val !== 'undefined') {
				this[key] = val;
			}
		}
		if(typeof object.bounds === 'object') {
			this.bounds = jayus.parse(object.bounds);
		}
		if(typeof object.negateBlur === 'boolean') {
			this.negateBlur = object.negateBlur;
		}
		if(typeof object.buffering === 'boolean') {
			this.setBuffering(object.buffering);
		}
		if(typeof object.bg === 'object') {
			this.setBg(object.bg);
		}
		if(typeof object.widthPolicy === 'object') {
			this.widthPolicy = jayus.parse(object.widthPolicy);
		}
		if(typeof object.heightPolicy === 'object') {
			this.heightPolicy = jayus.parse(object.heightPolicy);
		}
		this.ignoreDirty--;
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Origin
		//__________//

	/**
	The x position of the Entity.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} x
	*/

	x: 0,

	/**
	The y position of the Entity.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} y
	*/

	y: 0,

	/**
	Sets the x coordinate.
	@method {Self} setX
	@param {Number} x
	*/

	setX: function Entity_setX(x) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setX', x, 'x', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setX, this.x, x);
		}
		if(this.x !== x) {
			this.x = x;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	/**
	Sets the y coordinate.
	@method {Self} setY
	@param {Number} y
	*/

	setY: function Entity_setY(y) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setY', y, 'y', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setY, this.y, y);
		}
		if(this.y !== y) {
			this.y = y;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	/**
	Returns the origin for the entity.
	@method {Point} getOrigin
	*/

	getOrigin: jayus.Rectangle.prototype.getOrigin,

	/**
	Sets the entity's origin.
	@method {Self} setOrigin
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setOrigin: jayus.Rectangle.prototype.setOrigin,

	/**
	Translates the entity.
	<br> This method is animatable.
	@method {Self} translate
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	translate: jayus.Rectangle.prototype.translate,

		//
		//  Frame
		//_________//

	/**
	Returns the x coordinate of the left side of the entity.
	@method {Number} getLeft
	*/

	getLeft: jayus.Rectangle.prototype.getLeft,

	/**
	Returns the x coordinate of the right side of the entity.
	@method {Number} getRight
	*/

	getRight: jayus.Rectangle.prototype.getRight,

	/**
	Returns the y coordinate of the top of the entity.
	@method {Number} getTop
	*/

	getTop: jayus.Rectangle.prototype.getTop,

	/**
	Returns the y coordinate of the bottom of the entity.
	@method {Number} getBottom
	*/

	getBottom: jayus.Rectangle.prototype.getBottom,

	/**
	Sets the x coordinate of the left side of the entity.
	@method {Self} setLeft
	@param {Number} left
	*/

	setLeft: jayus.Rectangle.prototype.setLeft,

	/**
	Sets the x coordinate of the right side of the entity.
	@method {Self} setRight
	@param {Number} right
	*/

	setRight: jayus.Rectangle.prototype.setRight,

	/**
	Sets the y coordinate of the top side of the entity.
	@method {Self} setTop
	@param {Number} top
	*/

	setTop: jayus.Rectangle.prototype.setTop,

	/**
	Sets the y coordinate of the bottom side of the entity.
	@method {Self} setBottom
	@param {Number} bottom
	*/

	setBottom: jayus.Rectangle.prototype.setBottom,

		//
		//  Position
		//____________//

	/**
	Returns the position of the entity at the specified anchor point.
	@method {Point} getPosAt
	@param {Number} anchorX
	@param {Number} anchorY
	*/

	getPosAt: function RectEntity_getPosAt(anchorX, anchorY) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('RectEntity.getPosAt', anchorX, anchorY);
		//#end
		if(arguments.length === 1) {
			return this.getPosAt(anchorX.x, anchorX.y);
		}
		return this.localToParent(anchorX*this.width, anchorY*this.height);
	},

	/**
	Sets the position of the entity at the specified anchor point.
	<br> This method is animatable.
	@method {Self} setPosAt
	@paramset Syntax 1
	@param {Point} position
	@param {Number} anchorX
	@param {Number} anchorY
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	@param {Number} anchorX
	@param {Number} anchorY
	*/

	setPosAt: function RectEntity_setPosAt(x, y, anchorX, anchorY) {
		if(arguments.length === 3) {
			return this.setPosAt(x.x, x.y, y, anchorX);
		}
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('RectEntity.setPosAt', arguments, jayus.TYPES.NUMBER, 'x', 'y',  'anchorX', 'anchorY');
		//#end
		// Get the current un-transformed position
		// Move the entity by the difference
		return this.translate(x-(this.x+anchorX*this.width), y-(this.y+anchorY*this.height));
	},

	/**
	Sets the transformation anchor point relative to the current size of the entity.
	<br> A shortcut for:
	@method {Self} setRelativeAnchor
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	setRelativeAnchor: function Entity_setRelativeAnchor(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('RectEntity.setRelativeAnchor', x, y);
		//#end
		if(arguments.length === 1) {
			return this.setAnchor(this.width*x.x, this.height*x.y);
		}
		return this.setAnchor(this.width*x, this.height*y);
	},

		//
		//  Pixel Alignment
		//___________________//

	/**
	Whether to attempt to keep the Entity horizontally aligned to the pixel-grid.
	<br> This will keep images/shapes from being rendered at fractions of a pixel.
	<br> This property applies to the translation of the entity(and thus its children).
	<br> This may not force alignment on the background or any child entities.
	<br> Default is false.
	@property {Boolean} roundX
	*/

	roundX: false,

	/**
	Whether to attempt to keep the Entity vertically aligned to the pixel-grid.
	<br> This will keep images/shapes from being rendered at fractions of a pixel.
	<br> This property applies to the translation of the entity(and thus its children).
	<br> This may not force alignment on the background or any child entities.
	<br> Default is false.
	@property {Boolean} roundY
	*/

	roundY: false,

	/**
	Sets the horizontal and vertical rounding flags on the Entity.
	@method {Self} setRounding
	@paramset 1
	@param {Boolean} enabled
	@paramset 2
	@param {Boolean} x
	@param {Boolean} y
	*/

	setRounding: function RectEntity_setRounding(x, y) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.match('RectEntity.setRounding', x, 'x', jayus.TYPES.BOOLEAN);
			//#end
			this.roundX = x;
			this.roundY = y;
		}
		else {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('RectEntity.setRounding', arguments, jayus.TYPES.BOOLEAN, 'x', 'y');
			//#end
			if(this.roundX !== x || this.roundY !== y) {
				this.roundX = x;
				this.roundY = y;
				this.dirty(jayus.DIRTY.ALL);
			}
		}
		return this;
	},

		//
		//  Box2D
		//_________//

	/**
	The Box2D body attached to this entity.
	<br> Default is null.
	@property {Box2D.Body} body
	*/

	body: null,

	/**
	Attaches a Box2D body to this Entity.
	@method {Self} setBody
	@param {Box2D.Body} body
	*/

	setBody: function RectEntity_setBody(body) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBody', body, 'body', jayus.TYPES.OBJECT);
		//#end
		if(this.body !== null) {
			delete this.body.entity;
		}
		else {
			jayus.box2d.physicalEntities.push(this);
			this.setAnchor(this.width/2, this.height/2);
		}
		this.body = body;
		this.body.entity = this;
		return this;
	},

	/**
	Removes the Box2D body on this Entity.
	@method {Self} removeBody
	*/

	removeBody: function RectEntity_removeBody() {
		if(this.body !== null) {
			delete this.body.entity;
			this.body = null;
			jayus.box2d.physicalEntities.splice(jayus.box2d.physicalEntities.indexOf(this), 1);
		}
		return this;
	},

	/**
	Updates the entity's position and angle from its Box2D body.
	<br> Called automatically by jayus.
	@method updateFromBody
	*/

	updateFromBody: function RectEntity_updateFromBody() {
		if(this.body !== null && this.body.IsAwake()) {
			var pos = this.body.GetPosition();
			this.setPosAt(pos.x, pos.y, 0.5, 0.5);
			this.angle = this.body.GetAngle();
			this.isTransformed = true;
			this.matrixDirty = true;
		}
	},

		//
		//  Size
		//________//

	/**
	The width of the Entity.
	<br> Do not modify.
	@property {Number} width
	*/

	width: 0,

	/**
	The height of the Entity.
	<br> Do not modify.
	@property {Number} height
	*/

	height: 0,

	/**
	Sets the width of the entity.
	<br> Throws an error if not possible.
	@method {Self} setWidth
	@param {Number} width
	*/

	setWidth: function RectEntity_setWidth(width) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setWidth', width, 'width', jayus.TYPES.NUMBER);
		if(!this.hasFlexibleWidth) {
			throw new Error('RectEntity.setWidth() - Entity width is not flexible');
		}
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setWidth, this.width, width);
		}
		if(width !== this.width) {
			this.changeSize(width, this.height);
		}
		return this;
	},

	/**
	Sets the height of the entity.
	<br> Throws an error if not possible.
	@method {Self} setHeight
	@param {Number} height
	*/

	setHeight: function RectEntity_setHeight(height) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setHeight', height, 'height', jayus.TYPES.NUMBER);
		if(!this.hasFlexibleHeight) {
			throw new Error('RectEntity.setHeight() - Entity height is not flexible');
		}
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setHeight, this.height, height);
		}
		if(height !== this.height) {
			this.changeSize(this.width, height);
		}
		return this;
	},

	/**
	Sets the size of the entity.
	<br> Throws an error if the entity has a derived width or height.
	@method {Self} setSize
	@paramset 1
	@param {Size} size
	@paramset 2
	@param {Number} width
	@param {Number} height
	*/

	setSize: function RectEntity_setSize(width, height) {
		//#ifdef DEBUG
		jayus.debug.matchSize('RectEntity.setSize', width, height);
		if(!this.hasFlexibleWidth || !this.hasFlexibleHeight) {
			throw new Error('RectEntity.setSize() - Entity size is not flexible');
		}
		//#end
		if(arguments.length === 1) {
			return this.setSize(width.width, width.height);
		}
		if(this.width !== width || this.height !== height) {
			this.changeSize(width, height);
		}
		return this;
	},

	changeSize: function RectEntity_changeSize(width, height) {
		this.width = width;
		this.height = height;
		this.dirty(jayus.DIRTY.SIZE);
	},

	intersectsAt: function RectEntity_intersectsAt(x, y) {
		return this.getBounds().intersectsAt(x, y);
		// if(this.bounds !== null) {
		// 	return this.boundsClone.intersectsAt(x, y);
		// }
		// if(this.isTransformed) {
		// 	return this.getFrame().intersectsAt(x, y);
		// }
		// return this.x <= x && x <= this.x+this.width && this.y <= y && y <= this.y+this.height;
	},

	getUnFrame: function RectEntity_getUnFrame() {
		return new jayus.Rectangle(this.x, this.y, this.width, this.height);
	},

	/**
	Returns the entity's frame.
	@method {Polygon} getFrame
	*/

	getFrame: function RectEntity_getFrame() {
		if(this.isTransformed) {
			return new jayus.Polygon.Rectangle(0, 0, this.width, this.height).transform(this.getMatrix());
		}
		return new jayus.Rectangle(this.x, this.y, this.width, this.height);
	},

	getScope: function RectEntity_getScope() {
		return this.getFrame().getScope();
	},

		//
		//  Bounds
		//__________//

	/**
	The shape used as the bounds for the scene.
	<br> If null then the frame will be used.
	<br> Default is null.
	@property {Shape} bounds
	*/

	bounds: null,
	//#replace jayus.RectEntity.prototype.bounds null

	boundsClone: null,

	/**
	Returns the bounding shape used for collision detection with other entities.
	@method {Shape} getBounds
	*/

	getBounds: function RectEntity_getBounds() {
		// FIXME: RectEntity.getBounds() - Dont get scope of frame, just return frame
		if(this.bounds !== null) {
			this.bounds.cloneOnto(this.boundsClone);
			return this.boundsClone.translate(this.x, this.y);
		}
		return this.getFrame().getScope();
	},

	/**
	Sets the bounds used for collision detection with other entities.
	@method {Self} setBounds
	@param {String|Object|Shape} bounds
	*/

	setBounds: function RectEntity_setBounds(shape) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBounds', shape, 'shape', jayus.TYPES.DEFINED);
		//#end
		// Elaborate if needed
		if(shape.shapeType !== 'number') {
			shape = jayus.parse(shape);
		}
		// Detach the old bounds
		if(this.bounds !== null) {
			this.bounds.detach(this);
		}
		// Set the new bounds
		this.bounds = shape;
		this.bounds.attach(this);
		this.boundsClone = this.bounds.clone();
		this.shapeType = jayus.SHAPES.CUSTOM;
		return this;
	},

	/**
	Clears the bounds, reverting back to the frame.
	@method {Self} clearBounds
	*/

	clearBounds: function RectEntity_clearBounds() {
		if(this.bounds !== null) {
			this.bounds.detach(this);
			this.bounds = null;
			this.boundsClone = null;
			this.shapeType = jayus.SHAPES.RECTANGLE;
		}
		return this;
	},

	componentDirtied: function RectEntity_componentDirtied(component, type) {
		if(component === this.bounds) {
			this.bounds.cloneOnto(this.boundsClone);
		}
	},

		//
		//  Background
		//______________//

	/**
	The background brush for the entity.
	@property {Brush} bg
	*/

	bg: null,
	//#replace jayus.RectEntity.prototype.bg null

	/**
	Whether to keep the background aligned to the pixel-grid or not.
	<br> Enabling this option will usually keep the background from being drawn blurry.
	<br> Default is true.
	@property {Shape} bounds
	*/

	alignBg: true,

	/**
	Sets the background brush.
	<br> Sets the entity as dirty.
	@method {Self} setBg
	@param {String|Object|Brush} brush
	*/

	setBg: function RectEntity_setBg(brush) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBg', brush, 'brush', jayus.TYPES.DEFINED);
		//#end
		// Elaborate if needed
		if(!(brush instanceof jayus.Brush)) {
			brush = new jayus.Brush(brush);
		}
		// Detach self from the old bg
		if(this.bg !== null) {
			this.bg.detach(this);
		}
		// Set and attach self to the new bg
		this.bg = brush;
		this.bg.attach(this);
		return this.dirty(jayus.DIRTY.BACKGROUND);
	},

	/**
	Removes the background brush.
	@method {Self} clearBg
	*/

	clearBg: function RectEntity_clearBg() {
		if(this.bg !== null) {
			this.bg.detach(this);
			this.bg = null;
			this.dirty(jayus.DIRTY.BACKGROUND);
		}
		return this;
	},

		//
		//  Buffering
		//_____________//

	/**
	Whether the contents of the entity are buffered as an image or not.
	<br> Enabling buffering can 
	<br> Do not modify.
	@property {CanvasRenderingContext2D} context
	*/

	buffered: false,

	bufferBg: true,

	/**
	When buffered, the canvas element that serves as the buffer.
	<br> Do not modify.
	@property {HTMLCanvasElement} canvas
	*/

	canvas: null,

	/**
	When buffered, the context for the canvas buffer.
	<br> Do not modify.
	@property {CanvasRenderingContext2D} context
	*/

	context: null,

	/**
	Enables manually rendering the buffer of the entity to negate the blurring effect when scaled up.
	<br> If enabled, the buffer for the entity will be drawn pixel-by-pixel.
	<br> This serves to negate the blurring effect that occurs when drawing a scaled-up entity.
	<br> This alternate rendering method is MUCH slower as each pixel is drawn individually.
	<br> Default is false.
	@property {Boolean} negateBlur
	*/

	negateBlur: false,

	/**
	Sets whether the entity is buffered or not.
	<br> Calling this method has no effect on the Display class, it is always considered buffered.
	@method {Self} setBuffering
	@param {Boolean} on
	*/

	setBuffering: function RectEntity_setBuffering(on) {
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBuffering', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		// Was disabled, must create the buffer to enable it now
		if(!this.buffered && on) {
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			this.refreshBuffer();
		}
		// Was enabled, we can delete the canvas and context now that it's disabled
		else if(this.buffered && !on) {
			this.canvas = null;
			this.context = null;
		}
		this.buffered = on;
		return this;
	},

	//@ Internal
	refreshBuffer: function RectEntity_refreshBuffer() {
		if(this.buffered) {
			// Some vars
			var canvas = this.canvas;
			// Resize the canvas if needed
			if(this.width !== canvas.width || this.height !== canvas.height) {
				canvas.width = this.width;
				canvas.height = this.height;
			}
			// Fully refresh the buffer
			this.fullyRefreshBuffer();
		}
	},

	//@ Internal
	fullyRefreshBuffer: function RectEntity_fullyRefreshBuffer() {
		if(this.buffered) {
			// Some vars
			var ctx = this.context;
			// Clear the buffer
			ctx.clearRect(0, 0, this.width, this.height);
			// Save the context
			ctx.save();
			// Paint the bg
			if(this.bufferBg && this.bg !== null) {
				this.bg.paintRect(ctx, 0, 0, this.width, this.height);
			}
			// Paint the contents
			this.paintContents(ctx);
			// Restore the context
			ctx.restore();
		}
	},

		//
		//  Rendering
		//_____________//

	//@ From Entity
	applyTransforms: function RectEntity_applyTransforms(ctx) {
		// Cache the origin
		var x = this.x,
			y = this.y;
		// Align if needed
		if(this.roundX) {
			x = Math.round(x);
		}
		if(this.roundY) {
			y = Math.round(y);
		}
		// Check if transformed
		if(this.isTransformed) {
			// Cache the scales
			var xScale = this.xScale,
				yScale = this.yScale;
			// Check if an anchor is specified
			if(this.xAnchor || this.yAnchor) {
				x += this.xAnchor;
				y += this.yAnchor;
			}
			// Translate
			ctx.translate(x, y);
			// Scale
			ctx.scale(xScale, yScale);
			// Rotate
			ctx.rotate(this.angle);
			// Translate back if needed
			if(this.xAnchor || this.yAnchor) {
				ctx.translate(-this.xAnchor, -this.yAnchor);
			}
			// Check to flip
			if(this.flipX || this.flipY) {
				// Translate to the center
				ctx.translate(this.width/2, this.height/2);
				// Flip
				ctx.scale(this.flipX ? -1:1, this.flipY ? -1:1);
				// Translate back to the origin
				ctx.translate(-this.width/2, -this.height/2);
			}
		}
		else {
			// No transformation so anchor not used, ignore it
			// Translate to origin
			if(x || y) {
				ctx.translate(x, y);
			}
		}
		return this;
	},

	//@ From Entity
	drawOntoContext: function RectEntity_drawOntoContext(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('RectEntity.drawOntoContext', ctx);
		if(this.id) {
			jayus.chart.begin('Draw: '+this.id);
		}
		//#end
		// Save the context
		ctx.save();
		// Apply alpha
		if(this.alpha !== 1) {
			ctx.globalAlpha *= this.alpha;
		}
		// Apply transforms
		this.applyTransforms(ctx);
		if(this.buffered) {
			// Refresh the buffer
			if(this.dirtied) {
				this.refreshBuffer();
			}
			// Paint the bg if not buffered
			if(!this.bufferBg && this.bg !== null) {
				// Check to align the bg, only if the lineWidth is an odd number
				if(this.alignBg && this.bg.lineWidth%2) {
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else {
					this.bg.paintRect(ctx, 0, 0, this.width, this.height);
				}
			}
			// Draw the buffer
			if(this.negateBlur) {
				// Use the routine in jayus
				jayus.manuallyDrawImage(this.context, ctx, this.width, this.height);
			}
			else {
				// Just draw the image
				ctx.drawImage(this.canvas, 0, 0);
			}
		}
		else {
			// Paint the bg
			if(this.bg !== null) {
				// Check to align the bg, only if the lineWidth is an odd number
				if(this.alignBg && this.bg.lineWidth%2) {
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else {
					this.bg.paintRect(ctx, 0, 0, this.width, this.height);
				}
			}
			// Paint the contents
			this.paintContents(ctx);
		}
		this.dirtied = false;
		// Restore the context
		ctx.restore();
		//#ifdef DEBUG
		if(this.debugRenderer !== null) {
			this.debugRenderer(ctx);
		}
		if(this.id) {
			jayus.chart.end();
		}
		//#end
		return this;
	}

	// Below was an attempt at testing the more specific drawImage() method, it actually turned out out to be slower, at least in Chromium
	// drawWithinContextBAD: function RectEntity_drawWithinContextBAD(ctx, width, height) {
	// 	//#ifdef DEBUG
	// 	jayus.debug.matchContext('RectEntity.drawWithinContext', ctx);
	// 	//#end
	// 	// Save the context
	// 	ctx.save();
	// 	// Apply alpha
	// 	if(this.alpha !== 1) {
	// 		ctx.globalAlpha *= this.alpha;
	// 	}
	// 	// Apply transforms
	// 	this.applyTransforms(ctx);
	// 	if(this.buffered) {
	// 		// Refresh the buffer
	// 		if(this.dirtied) {
	// 			this.refreshBuffer();
	// 		}
	// 		// Paint the bg if not buffered
	// 		if(!this.bufferBg && this.bg !== null) {
	// 			if(this.alignBg) {
	// 				this.bg.paintRect(
	// 					ctx,
	// 					0.5,
	// 					0.5,
	// 					Math.round(this.width),
	// 					Math.round(this.height)
	// 				);
	// 			}
	// 			else {
	// 				this.bg.paintRect(ctx, 0, 0, this.width, this.height);
	// 			}
	// 		}
	// 		// Draw the buffer
	// 		ctx.drawImage(this.canvas, -g.world.x, -g.world.y, width, height, -g.world.x, -g.world.y, width, height);
	// 	}
	// 	else {
	// 		// Paint the bg
	// 		if(this.bg !== null) {
	// 			if(this.alignBg) {
	// 				this.bg.paintRect(
	// 					ctx,
	// 					0.5,
	// 					0.5,
	// 					Math.round(this.width),
	// 					Math.round(this.height)
	// 				);
	// 			}
	// 			else {
	// 				this.bg.paintRect(ctx, 0, 0, this.width, this.height);
	// 			}
	// 		}
	// 		// Paint the contents
	// 		this.paintContents(ctx);
	// 	}
	// 	this.dirtied = false;
	// 	// Restore the context
	// 	ctx.restore();
	// 	//#ifdef DEBUG
	// 	if(this.debugRenderer !== null) {
	// 		this.debugRenderer(ctx);
	// 	}
	// 	//#end
	// 	return this;
	// }

});