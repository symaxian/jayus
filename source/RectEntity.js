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

//#ifdef DEBUG
jayus.debug.className = 'RectEntity';
//#endif

jayus.RectEntity = jayus.Entity.extend({

	//
	//  Properties
	//______________//

		// Meta

	shapeType: jayus.SHAPES.RECTANGLE,

	isRect: true,

		// Origin

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

		// Size

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

		// Background

	/**
	The background brush for the entity.
	@property {Brush} bg
	*/

	bg: null,

	/**
	Whether a background brush as been set.
	@property {Boolean} hasBg
	*/

	hasBg: false,

	alignBg: false,

		// Bounds

	/**
	The shape used as the bounds for the scene.
	<br> If null then the frame will be used.
	<br> Default is null.
	@property {Shape} bounds
	*/

	bounds: null,

	boundsClone: null,

		// Box2D

	/**
	The Box2D body attached to this entity.
	<br> Default is null.
	@property {Box2D.Body} body
	*/

	body: null,

	//
	//  Methods
	//___________//

		//
		//  Origin
		//__________//

	/**
	Sets the x coordinate.
	@method {Self} setX
	@param {Number} x
	*/

	setX: jayus.Rectangle.prototype.setX,

	/**
	Sets the y coordinate.
	@method {Self} setY
	@param {Number} y
	*/

	setY: jayus.Rectangle.prototype.setY,

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

	getPosAt: function RectEntity_getPosAt(anchorX, anchorY){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('RectEntity.getPosAt', anchorX, anchorY);
		//#endif
		if(arguments.length === 1){
			anchorY = anchorX.y;
			anchorX = anchorX.x;
		}
		return this.localToParent(anchorX*this.width, anchorY*this.height);
	},

	/**
	Sets the position of the entity at the specified anchor point.
	<br> This method is animatable.
	@method {Self} setPosAt
	@paramset Syntax 1
	@param {Number} anchorX
	@param {Number} anchorY
	@param {Point} position
	@paramset Syntax 2
	@param {Number} anchorX
	@param {Number} anchorY
	@param {Number} x
	@param {Number} y
	*/

	setPosAt: function RectEntity_setPosAt(anchorX, anchorY, x, y){
		if(arguments.length === 3){
			y = x.y;
			x = x.x;
		}
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('RectEntity.setPosAt', [anchorX, anchorY, x, y], jayus.TYPES.NUMBER, 'anchorX', 'anchorY', 'x', 'y');
		//#endif
		// Get the current un-transformed position
		// Move the entity by the difference
		return this.translate(x-(this.x+anchorX*this.width), y-(this.y+anchorY*this.height));
	},

	setRelativeAnchor: function Entity_setRelativeAnchor(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('RectEntity.setRelativeAnchor', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.setAnchor(this.width*x, this.height*y);
	},

		//
		//  Box2D
		//_________//

	/**
	Attaches a Box2D body to this Entity.
	@method {Self} setBody
	@param {Box2D.Body} body
	*/

	setBody: function RectEntity_setBody(body){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBody', body, 'body', jayus.TYPES.OBJECT);
		//#endif
		if(this.body !== null){
			delete this.body.entity;
		}
		else{
			jayus.box2d.physicalEntities.push(this);
			this.setAnchor(this.width/2, this.height/2);
		}
		this.body = body
		this.body.entity = this;
		return this;
	},

	/**
	Removes the Box2D body on this Entity.
	@method {Self} removeBody
	*/

	removeBody: function RectEntity_removeBody(){
		if(this.body !== null){
			delete this.body.entity;
			this.body = null;
			jayus.box2d.physicalEntities.splice(jayus.box2d.physicalEntities.indexOf(this));
		}
		return this;
	},

	/**
	Updates the entity's position and angle from its Box2D body.
	<br> Called automatically by jayus.
	@method updateFromBody
	*/

	updateFromBody: function RectEntity_updateFromBody(){
		var awake = this.body.IsAwake();
		if(awake){
			var pos = this.body.GetPosition();
			this.setPosAt(0.5, 0.5, pos.x, pos.y);
			this.angle = this.body.GetAngle();
			this.matrixDirty = true;
		}
	},

		//
		//  Size
		//________//

	changeSize: function RectEntity_changeSize(width, height){
		if(width !== this.width || height !== this.height){
			if(typeof this.formContents === 'function'){
				this.formContents(width, height);
			}
			this.width = width;
			this.height = height;
			this.fire('resized');
			this.dirty(jayus.DIRTY.SIZE);
		}
	},

	/**
	Sets the width of the entity.
	<br> Throws an error if not possible.
	@method {Self} setWidth
	@param {Number} width
	*/

	setWidth: function RectEntity_setWidth(width){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setWidth', width, 'width', jayus.TYPES.NUMBER);
		//#endif
		if(this.hasFlexibleWidth()){
			if(width !== this.width){
				this.changeSize(width, this.height);
			}
			return this;
		}
		throw new Error('RectEntity.setWidth() - Entity width is not flexible');
	},

	/**
	Sets the height of the entity.
	<br> Throws an error if not possible.
	@method {Self} setHeight
	@param {Number} height
	*/

	setHeight: function RectEntity_setHeight(height){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setHeight', height, 'height', jayus.TYPES.NUMBER);
		//#endif
		if(this.hasFlexibleHeight()){
			if(height !== this.height){
				this.changeSize(this.width, height);
			}
			return this;
		}
		throw new Error('RectEntity.setHeight() - Entity height is not flexible');
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

	setSize: function RectEntity_setSize(width, height){
		//#ifdef DEBUG
		jayus.debug.matchSize('RectEntity.setSize', width, height);
		//#endif
		if(arguments.length === 1){
			height = width.height;
			width = width.width;
		}
		if(this.hasFlexibleWidth() && this.hasFlexibleHeight()){
			this.changeSize(width, height);
			return this;
		}
		throw new Error('RectEntity.setSize() - Entity size is not flexible');
	},


	setSizeFromParent: function(width, height){
		this.frozen--;
		this.setSize(width, height);
		this.frozen++;
	},

	intersectsAt: function RectEntity_intersectsAt(x, y){
		return this.getBounds().intersectsAt(x, y);
		if(this.bounds !== null){
			return this.boundsClone.intersectsAt(x, y);
		}
		if(this.isTransformed){
			return this.getFrame().intersectsAt(x, y);
		}
		return this.x <= x && x <= this.x+this.width && this.y <= y && y <= this.y+this.height;
	},

	getUnFrame: function RectEntity_getUnFrame(){
		return new jayus.Rectangle(this.x, this.y, this.width, this.height);
	},

	/**
	Returns the entity's frame.
	@method {Polygon} getFrame
	*/

	getFrame: function RectEntity_getFrame(){
		if(this.isTransformed){
			return new jayus.Polygon.Rectangle(0, 0, this.width, this.height).transform(this.getMatrix());
		}
		return new jayus.Rectangle(this.x, this.y, this.width, this.height);
	},

	getScope: function RectEntity_getScope(){
		return this.getFrame().getScope();
	},

		//
		//  Bounds
		//__________//

	/**
	Returns the bounding shape used for collision detection with other entities.
	@method {Shape} getBounds
	*/

	getBounds: function RectEntity_getBounds(){
		// FIXME: RectEntity.getBounds() - Dont get scope of frame, just return frame
		if(this.bounds !== null){
			this.bounds.cloneOnto(this.boundsClone);
			return this.boundsClone.translate(this.x, this.y);
		}
		return this.getFrame().getScope();
	},

	/**
	Sets the bounds used for collision detection with other entities.
	@method {Self} setBounds
	@param {Shape} bounds
	*/

	setBounds: function RectEntity_setBounds(shape){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBounds', shape, 'shape', jayus.TYPES.SHAPE);
		//#endif
		// Detach the old bounds
		if(this.bounds !== null){
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

	clearBounds: function RectEntity_clearBounds(){
		if(this.bounds !== null){
			this.bounds.detach(this);
			this.bounds = null;
			this.boundsClone = null;
			this.shapeType = jayus.SHAPES.RECTANGLE;
		}
		return this;
	},

	componentDirtied: function RectEntity_componentDirtied(componentType, component, type){
		if(component === this.bounds){
			this.bounds.cloneOnto(this.boundsClone);
		}
	},

		//
		//  Background
		//______________//

	/**
	Sets the background brush.
	<br> Sets the entity as dirty.
	@method {Self} setBg
	@param {Brush} brush
	*/

	setBg: function RectEntity_setBg(brush){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBg', brush, 'brush', jayus.TYPES.OBJECT);
		//#endif
		// Detach self from the old bg
		if(this.hasBg){
			this.bg.detach(this);
		}
		// Create the brush object if not given
		if(!(brush instanceof jayus.Brush)){
			brush = new jayus.Brush(brush);
		}
		// Set and attach self to the new bg
		this.bg = brush;
		this.bg.attach(this);
		this.hasBg = true;
		return this.dirty(jayus.DIRTY.BACKGROUND);
	},

	/**
	Removes the background brush.
	@method {Self} clearBg
	*/

	clearBg: function RectEntity_clearBg(){
		if(this.hasBg){
			this.bg.detach(this);
			this.bg = null;
			this.hasBg = false;
			this.dirty(jayus.DIRTY.BACKGROUND);
		}
		return this;
	},

		//
		//  Buffering
		//_____________//

	buffered: false,

	bufferBg: true,

	canvas: null,

	context: null,

	/**
	Sets whether the entity is buffered or not.
	<br> Calling this method has no effect on the Display class, it is always considered buffered.
	@method {Self} setBuffering
	@param {Boolean} on
	*/

	setBuffering: function RectEntity_setBuffering(on){
		//#ifdef DEBUG
		jayus.debug.match('RectEntity.setBuffering', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		// Was disabled, must create the buffer to enable it now
		if(!this.buffered && on){
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			this.refreshBuffer();
		}
		// Was enabled, we can delete the canvas and context now that it's disabled
		else if(this.buffered && !on){
			this.canvas = null;
			this.context = null;
		}
		this.buffered = on;
		return this;
	},

	//@ Internal
	refreshBuffer: function RectEntity_refreshBuffer(){
		if(this.buffered){
			// Some vars
			var canvas = this.canvas;
			// Resize the canvas if needed
			if(this.width !== canvas.width || this.height !== canvas.height){
				canvas.width = this.width;
				canvas.height = this.height;
			}
			// Fully refresh the buffer
			this.fullyRefreshBuffer();
		}
	},

	//@ Internal
	fullyRefreshBuffer: function RectEntity_fullyRefreshBuffer(){
		if(this.buffered){
			// Some vars
			var ctx = this.context;
			// Clear the buffer
			ctx.clearRect(0, 0, this.width, this.height);
			// Save the context
			ctx.save();
			// Apply transforms 
			// this.applyTransforms(ctx);
			// Paint the bg
			if(this.bufferBg && this.hasBg){
				this.bg.paintRect(ctx, 0, 0, this.width, this.height);
			}
			// Paint the contents
			this.paintContents(ctx);
			// Restore the context
			ctx.restore();
			//#ifdef DEBUG
			if(this.showDamage){
				this.paintDamage(this);
			}
			//#endif
		}
	},

		//
		//  Rendering
		//_____________//

	keepAligned: false,

	//@ From Entity
	applyTransforms: function RectEntity_applyTransforms(ctx){
		// Check if transformed
		if(this.xScale !== 1 || this.yScale !== 1 || this.angle){
			// Check if an anchor is specified
			if(this.xAnchor || this.yAnchor){
				// Use anchor
				if(this.keepAligned){
					ctx.translate(Math.round(this.x)+this.xAnchor, Math.round(this.y)+this.yAnchor);
				}
				else{
					ctx.translate(this.x+this.xAnchor, this.y+this.yAnchor);
				}
				if(this.xScale !== 1 || this.yScale !== 1){
					ctx.scale(this.xScale, this.yScale);
				}
				if(this.angle !== 0){
					ctx.rotate(this.angle);
				}
				ctx.translate(-this.xAnchor, -this.yAnchor);
			}
			else{
				// No anchor
				if(this.keepAligned){
					ctx.translate(Math.round(this.x), Math.round(this.y));
				}
				else{
					ctx.translate(this.x, this.y);
				}
				if(this.xScale !== 1 || this.yScale !== 1){
					ctx.scale(this.xScale, this.yScale);
				}
				if(this.angle !== 0){
					ctx.rotate(this.angle);
				}
			}
		}
		else{
			// No transformation so anchor not useful, ignore it
			// Translate to origin
			if(this.x || this.y){
				if(this.keepAligned){
					ctx.translate(Math.round(this.x), Math.round(this.y));
				}
				else{
					ctx.translate(this.x, this.y);
				}
			}
		}
		return this;
	},

	//@ From Entity
	drawOntoContext: function RectEntity_drawOntoContext(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('RectEntity.drawOntoContext', ctx);
		//#endif
		// Save the context
		ctx.save();
		// Apply alpha
		if(this.alpha !== 1){
			ctx.globalAlpha *= this.alpha;
		}
		// Apply transforms
		this.applyTransforms(ctx);
		if(this.buffered){
			// Refresh the buffer
			if(this.dirtied){
				this.refreshBuffer();
			}
			// Paint the bg if not buffered
			if(!this.bufferBg && this.hasBg){
				if(this.alignBg){
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else{
					this.bg.paintRect(ctx, 0, 0, this.width, this.height);
				}
			}
			// Draw the buffer
			ctx.drawImage(this.canvas, 0, 0);
		}
		else{
			// Paint the bg
			if(this.hasBg){
				if(this.alignBg){
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else{
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
		if(this.debugRenderer !== null){
			this.debugRenderer(ctx);
		}
		//#endif
		return this;
	}

});