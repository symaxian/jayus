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
Defines the base Entity class.
@file Entity.js
*/

//
//  jayus.Entity()
//__________________//

/*

Abstract methods:

	TODO: Entity abstract method list

Entity
	Layer
	PaintedShape
	FramedEntity
		Text
		Grid
		Surface
		Scene
			BufferedScene
				Display

How to have a transformation matrix as well as static properties such a scale and rotation around an anchor?

*/

/**
The base class for any drawable object.
@class jayus.Entity
@extends jayus.Dependency
@extends jayus.Responder
@extends jayus.Animatable
*/

//#ifdef DEBUG
jayus.debug.className = 'Entity';
//#endif

jayus.applyObject(jayus.Dependency.prototype, jayus.Responder.prototype);

jayus.Entity = jayus.Responder.extend({

	//
	//  Properties
	//______________//

		// Meta

	componentType: 'ENTITY',

	shapeType: jayus.SHAPES.CUSTOM,

	/**
	Denotes this object as an entity.
	<br> Do not modify.
	@property {Boolean} isEntity
	*/

	isEntity: true,

	/**
	Denotes this object as a rect-like entity.
	<br> Do not modify.
	@property {Boolean} isRect
	*/

	isRect: false,

	/**
	Whether the Entity is a parent.
	<br> Do not modify.
	@property {Boolean} isParent
	*/

	isParent: false,

	/**
	The entity's id.
	<br> Default is ''.
	@property {String} id
	*/

	id: '',

	/**
	Whether or not the entity is visible.
	<br> Technically this is more like whether or not the entity will be drawn by its parent.
	<br> Default is true.
	<br> Do not modify, use {@link jayus.Entity.setVisible Entity.setVisible()}.
	@property {Boolean} visible
	*/

	visible: true,

	/**
	The opacity of the entity.
	<br> Default is 1.
	<br> Do not modify, use {@link jayus.Entity.setAlpha Entity.setAlpha()}.
	@property {Boolean} visible
	*/

	alpha: 1,

	/**
	A flag determining whether or not the entity has changed since it was last drawn onto the screen.
	<br> Do not modify.
	@property {Boolean} dirtied
	*/

	dirtied: true,

	/**
	The number of functions in the callstack that have "locked" this entity from reforming itself after being displaced.
	<br> Used internally to avoid unnecessary displacements, and endless loops.
	@property {Number} frozen
	*/

	frozen: 0,

		// Parent

	/**
	Whether or not the entity has a parent.
	<br> Do not modify.
	@property {Boolean} hasParent
	*/

	hasParent: false,

	/**
	The entity's parent.
	<br> null if the Entity does not have a parent.
	<br> The parent is responsible for updating/rendering the child.
	<br> Each entity can only have one parent.
	<br> Do not modify.
	@property {Entity} parent
	*/

	parent: null,

		//
		//  Transforms
		//______________//

	angle: 0,

	xScale: 1,

	yScale: 1,

	xAnchor: 0,

	yAnchor: 0,

		//
		//  Events
		//__________//

	/**
	Whether or not this entity will be kept aware of cursor events.
	<br> If false then the underCursor and hasCursor flags will not be updated and no cursor events will be fired.
	<br> Default is true.
	@property {Boolean} trackCursor
	*/

	trackCursor: true,

	/**
	Whether or not the entity can accept the cursor, firing the cursorEnter event and becoming the cursor focus.
	<br> If an entity does not accept the cursor, it cannot be given the cursorEnter and cursorLeave events.
	<br> Default is true.
	@property {Boolean} canAcceptCursor
	*/

	canAcceptCursor: false,

	/**
	Whether or not the entity can release the cursor.
	<br> Until an entity releases the cursor, no other entity can become the cursor focus.
	<br> This is primarily used to prevent the cursor focusing on a "closer" entity than the one currently being dragged.
	<br> Default is true.
	@property {Boolean} canReleaseCursor
	*/

	canReleaseCursor: true,

	/**
	Whether or not the cursor is over the entity.
	<br> This property corresponds to the cursorOver and cursorOut events.
	<br> Do not modify.
	@property {Boolean} underCursor
	*/

	underCursor: false,

	/**
	Whether or not the entity has the cursor focus.
	<br> This property corresponds to the cursorEnter and cursorLeave events.
	<br> Do not modify.
	@property {Boolean} hasCursor
	*/

	hasCursor: false,

	/**
	Whether the object can be moved by dragging it with the cursor.
	<br> Default is false.
	<br> Do not modify.
	@property {Boolean} draggable
	*/

	draggable: false,

	/**
	The mouse button used to drag the entity.
	<br> Applies only when draggable is set to true.
	<br> Can be 'left', 'middle', or 'right'.
	<br> Default is 'left'.
	<br> Do not modify.
	@property {Boolean} dragButton
	*/

	dragButton: 'left',

	/**
	Whether the object is currently being dragged.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	dragging: false,

	enableDragEvents: true,

	leftDragging: false,

	middleDragging: false,

	rightDragging: false,

	//#ifdef DEBUG

	debugRenderer: null,

	exposingAll: false,

	expose: function Entity_expose(){
		this.debugRenderer = jayus.debug.defaultDebugRenderer;
		this.dirty(jayus.DIRTY.ALL);
	},

	unexpose: function Entity_unexpose(){
		this.debugRenderer = null;
		this.dirty(jayus.DIRTY.ALL);
	},

	exposeAll: function Entity_exposeAll(){
		this.debugRenderer = jayus.debug.defaultDebugRenderer;
		this.exposingAll = true;
		if(this.isParent){
			this.forEachChild(function(){
				this.exposeAll();
			});
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	unexposeAll: function Entity_exposeAll(){
		this.debugRenderer = null;
		this.exposingAll = false;
		if(this.isParent){
			this.forEachChild(function(){
				this.unexposeAll();
			});
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	//#endif

		//
		//  Transforms
		//______________//

	/**
	Whether the entity has an attached transforms object.
	@property {Boolean} isTransformed
	*/

	isTransformed: false,

	transforms: null,

	//
	//  Methods
	//___________//

	/**
	Initiates the Entity.
	@constructor init
	*/

	init: function Entity_init(){
		if(this.enableDragEvents){
			this.handle({

				leftPress: function(e){
					this.leftDragging = true;
					return this.fire('leftDragStart', e);
				},

				leftRelease: function(e){
					if(this.leftDragging){
						this.leftDragging = false;
						return this.fire('leftDragEnd', e);
					}
				},

				middlePress: function(e){
					this.middleDragging = true;
					return this.fire('middleDragStart', e);
				},

				middleRelease: function(e){
					if(this.middleDragging){
						this.middleDragging = false;
						return this.fire('middleDragEnd', e);
					}
				},

				rightPress: function(e){
					this.rightDragging = true;
					return this.fire('rightDragStart', e);
				},

				rightRelease: function(e){
					if(this.rightDragging){
						this.rightDragging = false;
						return this.fire('rightDragEnd', e);
					}
				},

				cursorMove: function(e){
					var ret = false;
					if(this.leftDragging){
						ret = this.fire('leftDrag',e) || ret;
					}
					if(this.middleDragging){
						ret = this.fire('middleDrag',e) || ret;
					}
					if(this.rightDragging){
						ret = this.fire('rightDrag',e) || ret;
					}
					return ret;
				},

				cursorOut: function(){
					if(this.leftDragging){
						this.fire('leftDragEnd');
					}
					if(this.middleDragging){
						this.fire('middleDragEnd');
					}
					if(this.rightDragging){
						this.fire('rightDragEnd');
					}
					this.leftDragging = this.middleDragging = this.rightDragging = false;
				}

			});
		}
	},

		//
		//  Id
		//______//

	/**
	Sets the entity's id.
	<br> Using strings(or numbers) for id's is recommended.
	@method {Self} setId
	@param {*} id
	*/

	setId: function Entity_setId(id){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setId', id, 'id', jayus.TYPES.DEFINED);
		//#endif
		this.id = id;
		return this;
	},

		//
		//  Dirty
		//_________//

	//@ From Dependency
	dirty: function Entity_dirty(type){
		if(typeof type !== 'number'){
			throw new Error('Entity.dirty() - No type specified');
		}
		if(!this.frozen){

			if(type & jayus.DIRTY.POSITION){
				this.matrixDirty = true;
				// Fire the event
				this.fire('moved');
			}

			this.dirtied = true;

			this.informDependents(type);

		}
		return this;
	},

		//
		//  Parent
		//__________//

	/**
	Returns the absolute parent of the entity.
	<br> Returns itself if the entity has no parent.
	@method {Entity} getAbsoluteParent
	*/

	getAbsoluteParent: function Entity_getAbsoluteParent(){
		return this.hasParent ? this.parent.getAbsoluteParent() : this;
	},

	//@ Internal
	setParent: function Entity_setParent(parent){
		//#ifdef DEBUG
		if(this.hasParent){
			throw new Error('Entity.setParent() - Entity already has a parent');
		}
		if(parent.exposingAll){
			this.expose();
		}
		//#endif
		this.hasParent = true;
		this.parent = parent;
		this.attach(parent);
		this.fire('added');
	},

	//@ Internal
	removeParent: function Entity_removeParent(){
		this.hasParent = false;
		this.parent = null;
		this.underCursor = false;
		this.detach(parent);
		this.fire('removed');
	},

		//
		//  Visibility
		//______________//

	/**
	Sets the visible flag.
	<br> Sets the entity as dirty.
	<br> In the display class this method sets the display as hidden.
	@method {Self} setVisible
	@param {Boolean} on
	*/

	setVisible: function Entity_setVisible(on){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setVisible', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.visible !== on){
			this.visible = on;
			this.dirty(jayus.DIRTY.VISIBILITY);
		}
		return this;
	},

	/**
	Sets the object as visible.
	<br> An alias for setVisible(true).
	<br> Sets the entity as dirty.
	@method {Self} show
	*/

	show: function Entity_show(){
		return this.setVisible(true);
	},

	/**
	Sets the object as hidden.
	<br> An alias for setVisible(false).
	<br> Sets the entity as dirty.
	@method {Self} hide
	*/

	hide: function Entity_hide(){
		return this.setVisible(false);
	},

		//
		//  Alpha
		//_________//

	/**
	Sets the entity's opacity.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	<br> In the display class this method sets the opacity of the canvas.
	@method {Self} setAlpha
	@param {Number} alpha
	*/

	setAlpha: function Entity_setAlpha(alpha){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setAlpha', alpha, 'alpha', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setAlpha, this.alpha, alpha);
		}
		// Set the alpha
		if(this.alpha !== alpha){
			this.alpha = alpha;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Cursor
		//__________//

	updateCursor: function Entity_updateCursor(x, y){
		// this.localX = x;
		// this.localY = y;
		// Check if child previously had the cursor
		if(this.underCursor){
			// Check if the child currently has the cursor
			if(!this.intersectsAt(x, y)){
				// Clear the cursor flag and fire the cursorOut event
				this.underCursor = false;
				this.fire('cursorOut');
				// If this is a parent, clear the cursor flags from every child
				if(this.isParent){
					this.removeCursorFromChildren();
				}
			}
			// If the child still has the cursor and is a parent, update its children
			else if(this.isParent){
				this.updateCursorOnChildren(x, y);
			}
		}
		// Else check if the child just got the cursor
		else if(this.intersectsAt(x, y)){
			// If so set the cursor flag to true and fire the cursorOver event
			this.underCursor = true;
			this.fire('cursorOver');
			// Update every sub-child if it's a parent
			if(this.isParent){
				this.updateCursorOnChildren(x, y);
			}
		}
	},

	removeCursor: function Entity_removeCursor(){
		// Check if the child has the cursor
		if(this.underCursor){
			// Clear the cursor flag and fire the cursorOut event
			this.underCursor = false;
			this.fire('cursorOut');
			// If its a parent, call the removeCursorFromChildren() method
			if(this.isParent){
				this.removeCursorFromChildren();
			}
		}
	},

	//
	//  Dragging
	//____________//

	setDragButton: function Entity_setDragButton(button){
		if(this.dragButton !== button){
			this.dragButton = button;
			if(this.draggable){
				this.setDraggable(false);
				this.setDraggable(true);
			}
		}
		return this;
	},

	/**
	Sets the draggable flag on the entity.
	@method {Self} setDraggable
	@param {Boolean} on
	*/

	setDraggable: function Entity_setDraggable(on){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setDraggable', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(!this.draggable && on){
			this.addHandler(this.dragButton+'Press', function(e){
				// The left mouse button was pressed, start dragging
				this.dragging = true;
				this.canReleaseCursor = false;

				// Set the move cursor
				// this.display.setCursor('move');
				this.fire('dragStart');

				// Clear the dragging flag if the button is released
				jayus.interceptNextEvent(this.dragButton+'Release', function(e){
					this.dragging = false;
					this.canReleaseCursor = true;
					this.display.updateCursor(this.display.cursor.x, this.display.cursor.y);
					// this.fire('dragEnd');
					// this.display.resetCursor();
				},{ context: this });

				this.display = e.display;
				var that = this;

				var dragHandler = function(e){
					if(that.dragging){
						that.translate(e.deltaX, e.deltaY);
					}
					else{
						that.display.removeHandler('cursorMove', 'dragHandler');
					}
					return true;
				};

				e.display.addHandler('cursorMove', dragHandler, { id: 'dragHandler' });

				// return true;

			});
			// var that = this;
			// this.addHandler('cursorLeave', function(){
			// 	return that.dragging;
			// });
			this.draggable = true;
		}
		else if(this.draggable && !on){
			// FIXME: Entity.setDraggable(false)
		}
		return this;
	},

		//
		//  Transforms
		//______________//

	/*
	A cached matrix for use as the Entities transformation matrix.
	@property {Matrix} matrix
	*/

	matrix: null,

	/*
	Whether or not the cached matrix needs to be reformed.
	@property {Matrix} matrix
	*/

	matrixDirty: true,

	/**
	Returns a new matrix with the entities transforms applied.
	<br> Uses Entity.applyTransforms().
	@method {Matrix} getMatrix
	*/

	getMatrix: function Entity_getMatrix(){
		if(this.matrixDirty){
			if(this.matrix === null){
				this.matrix = new jayus.Matrix();
			}
			else{
				this.matrix.identity();
			}
			this.applyTransforms(this.matrix);
			this.matrixDirty = false;
		}
		return this.matrix;
	},

	/**
	Applies the entities transforms to the given context or matrix.
	@method {Self} applyTransforms
	@param {CanvasRenderingContext2D|Matrix} ctx
	*/

	// applyTransforms2: function Entity_applyTransforms(ctx){
	// 	// ctx.translate(this.x, this.y);
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

	applyTransforms: function Entity_applyTransforms(ctx){
		// Check if transformed
		if(this.isTransformed){
			// Check if an anchor is specified
			if(this.xAnchor || this.yAnchor){
				// Use anchor
				ctx.translate(this.xAnchor, this.yAnchor);
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
				if(this.xScale !== 1 || this.yScale !== 1){
					ctx.scale(this.xScale, this.yScale);
				}
				if(this.angle !== 0){
					ctx.rotate(this.angle);
				}
			}
		}
		return this;
	},

		//
		//  Angle
		//_________//

	/**
	Sets the entity's angle.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setAngle
	@param {Number} angle
	*/

	setAngle: function Entity_setAngle(angle){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setAngle', angle, 'angle', jayus.TYPES.NUMBER);
		//#endif
		// Check to animate
		if(this.actionsToAnimate){
			this.actionsToAnimate--;
			return jayus.MethodAnimator(this, this.setAngle, this.angle, angle);
		}
		// Set the angle
		if(this.angle !== angle){
			this.angle = angle;
			this.isTransformed = true;
			this.matrixDirty = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Rotates the entity by the specified amount.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} rotate
	@param {Number} angle
	*/

	rotate: function Entity_rotate(angle){
		//#ifdef DEBUG
		jayus.debug.match('Entity.rotate', angle, 'angle', jayus.TYPES.NUMBER);
		//#endif
		return this.setAngle(this.angle+angle);
	},

		//
		//  Scale
		//_________//

	/**
	Sets the scale of the entity.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setScale
	@paramset Syntax 1
	@param {Number} scale
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	setScale: function Entity_setScale(x, y){
		//#ifdef DEBUG
		// jayus.debug.matchCoordinate('Entity.setScale', x, y);
		//#endif
		if(arguments.length === 1){
			y = x;
		}
		// Check if animated
		if(this.actionsToAnimate){
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setScale, [this.xScale, this.yScale], [x, y]);
		}
		// Set the scale
		if(this.xScale !== x || this.yScale !== y){
			this.xScale = x;
			this.yScale = y;
			this.isTransformed = true;
			this.matrixDirty = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Scales the entity by the given amount.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} scale
	@paramset Syntax 1
	@param {Number} scale
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	scale: function Entity_scale(x, y){
		if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Entity.scale', x, 'scale', jayus.TYPES.NUMBER);
			//#endif
			y = x;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Entity.scale', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		}
		//#endif
		return this.setScale(this.xScale*x, this.yScale*y);
	},

	/**
	Sets the transformation anchor point.
	@method {Self} setAnchor
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	setAnchor: function Entity_setAnchor(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.setAnchor', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		if(this.xAnchor !== x || this.yAnchor !== y){
			this.xAnchor = x;
			this.yAnchor = y;
			this.matrixDirty = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

		//
		//  Coordinate Spaces
		//_____________________//

	/**
	Converts the given point from absolute to local coordinate space.
	@method {Point} screenToLocal
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	screenToLocal: function Entity_screenToLocal(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.screenToLocal', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		if(this.hasParent){
			var pos = this.parent.screenToLocal(x, y);
			return this.parentToLocal(pos);
		}
		return new jayus.Point(x, y);
	},

	/**
	Converts the given point from parent to local coordinate space.
	@method {Point} parentToLocal
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	parentToLocal: function Entity_parentToLocal(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.parentToLocal', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		if(this.hasParent){
			x -= this.x;
			y -= this.y;
			x /= this.xScale;
			y /= this.yScale;
			if(this.angle !== 0){
				var x2 = x,
					y2 = y,
					cos = Math.cos(this.angle),
					sin = Math.sin(this.angle);
				x = cos*x2 - sin*y2;
				y = cos*y2 + sin*x2;
			}
		}
		return new jayus.Point(x, y);
	},

	/**
	Converts the given point from local to absolute coordinate space.
	@method {Point} localToScreen
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	localToScreen: function Entity_localToScreen(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.localToScreen', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		if(this.hasParent){
			return this.parent.localToScreen(this.localToParent(x, y));
		}
		return new jayus.Point(x, y);
	},

	localToScreenOnto: function Entity_localToScreenOnto(x, y, ret){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.localToScreenOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#endif
		if(this.hasParent){
			this.localToParentOnto(x, y, ret);
			this.parent.localToScreenOnto(ret.x, ret.y, ret);
		}
		else{
			ret.x = x;
			ret.y = y;
		}
		return ret;
	},

	/**
	Converts the given point from local to parent coordinate space.
	@method {Point} localToParent
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	localToParent: function Entity_localToParent(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.localToParent', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		var ret = new jayus.Point();
		this.localToParentOnto(x, y, ret);
		return ret;
	},

	localToParentOnto: function Entity_localToParentOnto(x, y, ret){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.localToParentOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#endif
		// FIXME: Entity.localToParentOnto() - Originally didnt take transforms into account without a parent, hotfixed, might still be broken
		// if(this.hasParent){
			if(this.angle !== 0){
				var x2 = x,
					y2 = y,
					cos = Math.cos(this.angle),
					sin = Math.sin(this.angle);
				x = cos*x2 - sin*y2;
				y = cos*y2 + sin*x2;
			}
			x *= this.xScale;
			y *= this.yScale;
			x += this.x;
			y += this.y;
		// }
		ret.x = x;
		ret.y = y;
		return ret;
	},

	localToParentOntoORIGINAL: function Entity_localToParentOntoORIGINAL(x, y, ret){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.localToParentOntoORIGINAL', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#endif
		if(this.hasParent){
			if(this.angle !== 0){
				var x2 = x,
					y2 = y,
					cos = Math.cos(this.angle),
					sin = Math.sin(this.angle);
				x = cos*x2 - sin*y2;
				y = cos*y2 + sin*x2;
			}
			x *= this.xScale;
			y *= this.yScale;
			x += this.x;
			y += this.y;
		}
		ret.x = x;
		ret.y = y;
		return ret;
	},

		//
		//  Animation
		//_____________//

	running: false,

	xVelocity: 0,

	yVelocity: 0,

	setVelocity: function Entity_setVelocity(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.setVelocity', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		this.xVelocity = x;
		this.yVelocity = y;
		if(!this.running){
			jayus.animators.push(this);
			this.running = true;
		}
	},

	clearVelocity: function Entity_clearVelocity(){
		this.velocity = null;
		jayus.animators.splice(jayus.animators.indexOf(this), 1);
		this.running = false;
	},

	/**
	Ticks the point.
	<br> Updates the entity's position from its velocity.
	<br> Used only by jayus.step.
	@method tick
	@param {Number} time Current epoch time
	@param {Number} elapsed Seconds elapsed since last frame
	*/

	tick: function Entity_tick(now, elapsed){
		this.translate(this.xVelocity*elapsed, this.yVelocity*elapsed);
	},

		//
		//  Intersection
		//________________//

	/**
	Returns whether the entity intersects the given point.
	@method {Boolean} intersectsAt
	@param {Number} x
	@param {Number} y
	*/

	/**
	Returns whether the entity intersects the given entity.
	<br> Bounds are used to test for intersection.
	<br> If the sent entity gives an array of bounding paths then the intersection of any of them will return true.
	<br> Shorthand for using jayus.intersectTest().
	@method {Boolean} intersects
	@param {Object} object
	*/

	intersects: function Entity_intersects(object){
		return jayus.intersectTest(this, object);
	},

	/**
	Returns the number of entities in the sent array that intersect this one.
	<br> If you plan on performing any actions with the intersecting entities, it is much more efficient to use intersectsWhat() and check the length of the returned array.
	@method {Number} intersectCount
	@param {Array} entities
	*/

	intersectCount: function Entity_intersectCount(entities){
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectCount', entities, 'entities', jayus.TYPES.ENTITY);
		if(!entities.length){
			throw new RangeError('Entity.intersectCount() - Invalid entities'+jayus.debug.toString(entities)+' sent, length of at least 1 required');
		}
		//#endif
		var i, count = 0;
		// Loop through the entities
		for(i=0;i<entities.length;i++){
			// Check if it intersects
			if(jayus.intersectTest(this, entities[i])){
				count++;
			}
		}
		return count;
	},

	/**
	Returns true if any entity in the sent array intersects this one.
	<br> Returns false with an empty array.
	<br> Be wary of including the entity your checking against the array in the array, as any entity will always intersect itself.
	@method {Boolean} intersectsAny
	@paramset 1
	@param {Array} entities
	@paramset 2
	@param {List} entities
	*/

	intersectsAny: function Entity_intersectsAny(entities){
		if(entities instanceof jayus.List){
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsAny', entities, 'entities', jayus.TYPES.ENTITY);
		//#endif
		// Loop through the entity
		for(var i=0;i<entities.length;i++){
			// Return true if the entity intersects
			if(jayus.intersectTest(this, entities[i])){
				return true;
			}
		}
		// No entities intersected this one, return false;
		return false;
	},

	/**
	Returns true if every entity in the sent array intersects this one.
	<br> Returns true with an empty array.
	@method {Boolean} intersectsAll
	@paramset 1
	@param {Array} entities
	@paramset 2
	@param {List} entities
	*/

	intersectsAll: function Entity_intersectsAll(entities){
		if(entities instanceof jayus.List){
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsAll', entities, 'entities', jayus.TYPES.ENTITY);
		if(!entities.length){
			throw new RangeError('Entity.intersectsAll() - Invalid entities'+jayus.debug.toString(entities)+' sent, length of at least 1 required');
		}
		//#endif
		// Loop through the entities
		for(var i=0;i<entities.length;i++){
			// Return false if the entity does not intersect
			if(!jayus.intersectTest(this, entities[i])){
				return false;
			}
		}
		// All entities intersected this one, return true;
		return true;
	},

	/**
	Returns the entites of the sent entities that intersect this one.
	<br> Bounds are used to test for intersection.
	@method {Array} intersectsWhich
	@paramset 1
	@param {Array} entities
	@paramset 2
	@param {List} entities
	*/

	intersectsWhich: function Entity_intersectsWhich(entities){
		if(entities instanceof jayus.List){
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsWhich', entities, 'entities', jayus.TYPES.ENTITY);
		//#endif
		var i, ret = [];
		// Loop through the entities
		for(i=0;i<entities.length;i++){
			// Add the index if it intersects
			if(jayus.intersectTest(this, entities[i])){
				ret.push(entities[i]);
			}
		}
		return ret;
	},

		//
		//  Rendering
		//_____________//

	/**
	Draws the entity onto a new Surface and returns it.
	<br> Does not respect the visible flag.
	<br> The returned surface has a size equal to the entity's scope.
	@method {Surface} rasterize
	*/

	rasterize: function Entity_rasterize(){
		var scope = this.getScope(),
			surface = new jayus.Surface(scope.width, scope.height),
			x = this.x,
			y = this.y;
		this.x = 0;
		this.y = 0;
		this.drawOnto(surface);
		this.x = x;
		this.y = y;
		return surface;
	},

	/**
	Draws the entity onto the sent Surface.
	<br> Does not respect the visible flag.
	@method {Self} drawOnto
	*/

	drawOnto: function Entity_drawOnto(surface){
		var ctx = surface.context;
		ctx.save();
		this.drawOntoContext(ctx, 0, 0);
		ctx.restore();
		return this;
	}

	/**
	Draws the entity onto the sent canvas context.
	<br> Does not respect the visible flag.
	@method {Self} drawOntoContext
	@param {CanvasRenderingContext2D} ctx
	*///@ Abstract Function

});

jayus.applyObject(jayus.Animatable.prototype, jayus.Entity.prototype);