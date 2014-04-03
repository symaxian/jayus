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

(function() {
'use strict';

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

jayus.applyObject(jayus.Dependency.prototype, jayus.Responder.prototype);

jayus.Entity = jayus.Responder.extend({

	//
	//  Properties
	//______________//

		// Meta

	shapeType: jayus.SHAPES.CUSTOM,

	/**
	Whether the Entity is a parent.
	<br> Do not modify.
	@property {Boolean} isParent
	*/

	isParent: false,

	/**
	Whether or not the entity is included in its parent's organization system, if applicable.
	<br> Default is true.
	<br> Do not modify, use {@link jayus.Entity.setIncluded Entity.setIncluded()}.
	@property {Boolean} included
	*/

	included: true,

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

		//
		//  Etc
		//_______//

	/*
	Whether the entity has a scale or angle specified.
	<br> Do not modify.
	@property {private Boolean} isTransformed
	*/

	isTransformed: false,

	/*
	The number of subsequent actions to animate.
	<br> Do not modify.
	@property {private Number} actionsToAnimate
	*/

	actionsToAnimate: 0,

	/**
	Whether to enable support for the drag events.
	<br> This feature is separate from enabling the entity to be dragged by the cursor.
	<br> This property must be set to true before the entity is created, so change the value on the prototype.
	<br> The events are "<button>DragStart", "<button>Drag", and "<button>DragEnd", where button is "left", "middle", or "right".
	<br> These events are experimental, and enabling them requires that the entity track the cursor.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	enableDragEvents: false,

	/**
	Whether the entity is currently being dragged by the left mouse button.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	leftDragging: false,

	/**
	Whether the entity is currently being dragged by the middle mouse button.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	middleDragging: false,

	/**
	Whether the entity is currently being dragged by the right mouse button.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	rightDragging: false,

	properties: [
		'visible',
		'included',
		'alpha',
		// 'dirtied',
		// 'frozen',
		// 'parent',
		'angle',
		'xAnchor',
		'yAnchor',
		'trackCursor',
		'canAcceptCursor',
		'canReleaseCursor',
		// 'underCursor',
		// 'hasCursor',
		// 'dragging',
		'enableDragEvents'
		// 'leftDragging',
		// 'middleDragging',
		// 'rightDragging',
		// 'debugRenderer',
		// 'exposingAll',
		// 'isTransformed',
		// 'actionsToAnimate',
		// 'matrix',
		// 'matrixDirty'
	],

	//#ifdef DEBUG

	debugRenderer: null,

	exposingAll: false,

	expose: function Entity_expose() {
		this.debugRenderer = jayus.debug.defaultDebugRenderer;
		this.dirty(jayus.DIRTY.ALL);
	},

	unexpose: function Entity_unexpose() {
		this.debugRenderer = null;
		this.dirty(jayus.DIRTY.ALL);
	},

	toggleExposed: function Entity_toggleExposed() {
		if(this.debugRenderer !== null) {
			this.unexpose();
		}
		else {
			this.expose();
		}
	},

	exposeAll: function Entity_exposeAll() {
		this.debugRenderer = jayus.debug.defaultDebugRenderer;
		this.exposingAll = true;
		if(this.isParent) {
			this.forEachChild(function() {
				this.exposeAll();
			});
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	unexposeAll: function Entity_exposeAll() {
		this.debugRenderer = null;
		this.exposingAll = false;
		if(this.isParent) {
			this.forEachChild(function() {
				this.unexposeAll();
			});
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	//#end

	//
	//  Methods
	//___________//

	/**
	Sets the next action performed on the entity to be animated.
	<br> Only applies to animatable methods.
	<br> When a function is set to be animated, instead of performing the action the method will return an animator that will perform that action when started.
	@method {Self} animate
	*/

	animate: function Animatable_animate() {
		this.actionsToAnimate++;
		return this;
	},

	/**
	Initiates the Entity.
	@constructor Entity
	*/

	init: function Entity() {
		//#ifdef DEBUG
		// this.addHandler('cursorOver', function(e) {
		// 	this.expose();
		// });
		// this.addHandler('cursorOut', function(e) {
		// 	this.unexpose();
		// });
		//#end
		if(this.enableDragEvents) {
			this.handle({

				leftPress: function Entity_startLeftDrag(e) {
					this.leftDragging = true;
					return this.fire('leftDragStart', e);
				},

				leftRelease: function Entity_endLeftDrag(e) {
					if(this.leftDragging) {
						this.leftDragging = false;
						return this.fire('leftDragEnd', e);
					}
				},

				middlePress: function Entity_startMiddleDrag(e) {
					this.middleDragging = true;
					return this.fire('middleDragStart', e);
				},

				middleRelease: function Entity_endMiddleDrag(e) {
					if(this.middleDragging) {
						this.middleDragging = false;
						return this.fire('middleDragEnd', e);
					}
				},

				rightPress: function Entity_startRightDrag(e) {
					this.rightDragging = true;
					return this.fire('rightDragStart', e);
				},

				rightRelease: function Entity_endRightDrag(e) {
					if(this.rightDragging) {
						this.rightDragging = false;
						return this.fire('rightDragEnd', e);
					}
				},

				cursorMove: function Entity_handleDragging(e) {
					var ret = false;
					if(this.leftDragging) {
						ret = this.fire('leftDrag',e) || ret;
					}
					if(this.middleDragging) {
						ret = this.fire('middleDrag',e) || ret;
					}
					if(this.rightDragging) {
						ret = this.fire('rightDrag',e) || ret;
					}
					return ret;
				},

				cursorOut: function Entity_endDragging() {
					if(this.leftDragging) {
						this.fire('leftDragEnd');
					}
					if(this.middleDragging) {
						this.fire('middleDragEnd');
					}
					if(this.rightDragging) {
						this.fire('rightDragEnd');
					}
					this.leftDragging = this.middleDragging = this.rightDragging = false;
				}

			});
		}
	},

	toObject: function Entity_toObject() {
		var object = {
			type: 'Entity'
		};
		if(this.id !== jayus.Dependency.prototype.id) {
			object.id = this.id;
		}
		// Add our own properties
		var i, key, val, valType;
		for(i=0;i<jayus.Entity.prototype.properties.length;i++) {
			key = jayus.Entity.prototype.properties[i];
			val = this[key];
			valType = typeof val;
			if(val !== jayus.Entity.prototype[key]) {
				if(valType === 'object') {
					val = val.toObject();
				}
				object[key] = val;
			}
		}
		return object;
	},

	initFromObject: function Entity_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		// Apply parent properties
		jayus.Dependency.prototype.initFromObject.call(this, object);
		// Apply our own properties
		this.frozen++;
		var i, key, val, valType;
		for(i=0;i<jayus.Entity.prototype.properties.length;i++) {
			key = jayus.Entity.prototype.properties[i];
			val = object[key];
			valType = typeof val;
			if(val !== undefined) {
				if(valType === 'object') {
					val = jayus.parse(val);
				}
				// this['set'+key[0].toUpperCase()+key.slice(1)](val);
				this[key] = val;
			}
		}
		if(typeof object.tooltip === 'string') {
			this.setTooltip(object.tooltip);
		}
		// Scale
		if(typeof object.xScale === 'number') {
			this.setXScale(object.xScale);
		}
		if(typeof object.yScale === 'number') {
			this.setYScale(object.yScale);
		}
		if(typeof object.scale === 'number') {
			this.setScale(object.scale);
		}
		// Velocity
		if(typeof object.xVelocity === 'number') {
			this.setXVelocity(object.xVelocity);
		}
		if(typeof object.yVelocity === 'number') {
			this.setYVelocity(object.yVelocity);
		}
		// Draggin
		if(typeof object.dragButton === 'string') {
			this.setDragButton(object.dragButton);
		}
		// Set the parent BEFORE the constraints, else parent-dependant constraints will complain
		if(typeof object.parent === 'object') {
			this.setParent(object.parent);
		}
		if(typeof object.constraints === 'object') {
			this.setConstraints(object.constraints);
		}
		this.frozen--;
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	//@ From Dependency
	// Overridden so we can set our new id as a property on our parent
	setId: function Entity_setId(id) {
		jayus.Dependency.prototype.setId.call(this, id);
		if(jayus.declareChildrenAsProperties && this.parent !== null && id) {
			//#ifdef DEBUG
			if(typeof this.parent[id] !== 'undefined') {
				console.error('Entity.setParent() - Collision between child id("'+id+'") and parent property('+this.parent[id]+')');
				return;
			}
			//#end
			this.parent[id] = this;
		}
	},

	//@ From Responder
	// Overridden so we can check for cursor event handlers being added and update the trackCursor flag
	addHandler: function Entity_addHandler(event) {
		// Call the parent method
		jayus.Responder.prototype.addHandler.apply(this, arguments);
		// Setup the Click event fire'er from the Release events
		if(event === 'leftClick') {
			this.addHandler('leftRelease', function(e) {
				if(jayus.entityPressedOn === this) {
					this.fire('leftClick', e);
				}
			});
		}
		else if(event === 'middleClick') {
			this.addHandler('middleRelease', function(e) {
				if(jayus.entityPressedOn === this) {
					this.fire('middleClick', e);
				}
			});
		}
		else if(event === 'rightClick') {
			this.addHandler('rightRelease', function(e) {
				if(jayus.entityPressedOn === this) {
					this.fire('rightClick', e);
				}
			});
		}
		// Set the cursor tracking flag, we use else-if here because in the above conditionals, setting the Release handler would have set this flag
		else if(!this.trackCursor) {
			if(event.indexOf('cursor') === 0 || event.indexOf('Press') >= 0 || event.indexOf('Release') >= 0) {
				this.trackCursor = true;
				if(this.parent !== null) {
					this.parent.childCursorTrackingChanged(this, true);
				}
			}
		}
	},

		//
		//  Dirty
		//_________//

	/*
	A flag determining whether or not the entity has changed since it was last drawn onto the screen.
	<br> Do not modify.
	@property {private Boolean} dirtied
	*/

	dirtied: true,

	/*
	The number of functions in the callstack that have "locked" this entity from reforming itself after being displaced.
	<br> Used internally to avoid unnecessary displacements, and endless loops.
	@property {private Number} frozen
	*/

	frozen: 0,

	pendingDirty: 0,

	ignoreDirty: 0,

	freeze: function Entity_freeze() {
		this.frozen++;
		return this;
	},

	unfreeze: function Entity_unfreeze() {
		this.frozen--;
		if(!this.frozen) {
			this.thaw();
		}
		return this;
	},

	thaw: function Entity_thaw() {
		// this.dirty(this.pendingDirty);

			jayus.dirtyCount++;
			this.fire('dirty', this.pendingDirty);
			this.dirtied = true;
			this.informDependents(this.pendingDirty);
			if(this.constraints !== null) {
				this.constrain();
			}

		this.pendingDirty = 0;
		return this;
	},

	//@ From Dependency
	dirty: function Entity_dirty(type) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.dirty', type, 'type', jayus.TYPES.NUMBER);
		//#end
		if(!this.ignoreDirty) {
			if(this.frozen) {
				this.pendingDirty |= type;
				// if(!this.pendingDirty) {
					// jayus.pendingDirtyTargets.push(this);
				// }
			}
			else {
				jayus.dirtyCount++;
				if(this.constraints !== null) {
					this.constrain();
				}
				if(this.isTransformed && (type & jayus.DIRTY.TRANSFORMS+jayus.DIRTY.POSITION)) {
					this.matrixDirty = true;
				}
				this.fire('dirty', type);
				this.dirtied = true;
				this.informDependents(type);
				// If we're under a display, and we've changed our frame or transforms, refresh the cursor state
				// TODO: Change cursor refreshing from starting at display to starting at immediate parent
				if(this.parentDisplay !== null && type & jayus.DIRTY.FRAME+jayus.DIRTY.TRANSFORMS) {
					this.parentDisplay.startCursorUpdate();
				}
			}
		}
		return this;
	},

		//
		//  Parent
		//__________//

	/**
	The entity's parent.
	<br> null if the Entity does not have a parent.
	<br> The parent is responsible for updating/rendering the child.
	<br> Each entity can only have one parent.
	<br> Do not modify.
	@property {Entity} parent
	*/

	parent: null,

	/**
	The entity's parent display.
	<br> Do not modify.
	@property {Display} parentDisplay
	*/

	parentDisplay: null,

	/**
	Returns the absolute parent of the entity.
	<br> Returns itself if the entity has no parent.
	@method {Entity} getAbsoluteParent
	*/

	getAbsoluteParent: function Entity_getAbsoluteParent() {
		return (this.parent !== null) ? this.parent.getAbsoluteParent() : this;
	},

	//@ Internal
	setParent: function Entity_setParent(parent) {
		if(this.parent !== parent) {
			//#ifdef DEBUG
			if(this.parent !== null) {
				throw new Error('Entity.setParent() - Entity already has a parent');
			}
			if(parent.exposingAll) {
				this.expose();
			}
			//#end
			this.parent = parent;
			this.parentDisplay = parent.parentDisplay;
			this.attach(parent);
			// Set the entity as a property of the parent if it has an id
			if(jayus.declareChildrenAsProperties && this.id) {
				if(typeof parent[this.id] !== 'undefined') {
					console.error('Entity.setParent() - Collision between child id("'+this.id+'") and parent property('+parent[this.id]+')');
				}
				else {
					parent[this.id] = this;
				}
			}
			if(this.trackCursor) {
				parent.childCursorTrackingChanged(this, true);
			}
			if(this.constraintsNeedParent) {
				this.parentConstrainerOptions = {};
				var that = this;
				this.parent.addHandler('dirty', function(type) {
					that.constrain();
				}, this.parentConstrainerOptions);
			}
			this.fire('added');
		}
	},

	//@ Internal
	removeParent: function Entity_removeParent() {
		if(this.constraints !== null && this.constraints.needsParent) {
			this.parentConstrainerOptions.remove = true;
			this.parentConstrainerOptions = null;
		}
		// Remove ourselves as a property on our parent
		if(jayus.declareChildrenAsProperties && this.id) {
			delete this.parent[this.id];
		}
		this.detach(this.parent);
		this.parent = null;
		this.underCursor = false;
		this.fire('removed');
	},

		//
		//  Included
		//____________//

	/**
	Sets the included flag.
	<br> Sets the entity as dirty.
	<br> Ensures that the entity is treated as not being there, for sizing purposes.
	@method {Self} setIncluded
	@param {Boolean} on
	*/

	setIncluded: function Entity_setIncluded(on) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setIncluded', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.included !== on) {
			this.included = on;
			this.dirty(jayus.DIRTY.ALL);
		}
		return this;
	},

	/**
	Sets the object as included.
	<br> An alias for setIncluded(true).
	<br> Sets the entity as dirty.
	@method {Self} include
	*/

	include: function Entity_include() {
		return this.setIncluded(true);
	},

	/**
	Sets the object as excluded.
	<br> An alias for setIncluded(false).
	<br> Sets the entity as dirty.
	@method {Self} exclude
	*/

	exclude: function Entity_exclude() {
		return this.setIncluded(false);
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

	setVisible: function Entity_setVisible(on) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setVisible', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.visible !== on) {
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

	show: function Entity_show() {
		return this.setVisible(true);
	},

	/**
	Sets the object as hidden.
	<br> An alias for setVisible(false).
	<br> Sets the entity as dirty.
	@method {Self} hide
	*/

	hide: function Entity_hide() {
		return this.setVisible(false);
	},

		//
		//  Constraints
		//_______________//

	/*
	The constraint formulas.
	<br> Do not modify.
	@property {Object} constraints
	*/

	constraints: null,

	/*
	The defined flags for constraints.
	<br> Do not modify.
	@property {Object} hasConstraint
	*/

	hasConstraint: null,

	/*
	Whether any of the constraints depend on the parent.
	<br> Do not modify.
	@property {Boolean} constraintsNeedParent
	*/

	constraintsNeedParent: false,

	/*
	The handler options object for the handler on the parent that will reconstrain the child.
	<br> Do not modify.
	@property {Object} parentConstrainerOptions
	*/

	parentConstrainerOptions: null,

	/**
	Constrains the specified property with the given formula.
	<br> Properties supported are: x, y, width, height
	@method {Self} setConstraint
	@param {String} property
	@param {String} formula
	*/

	setConstraint: function Entity_setConstraint(key, formula) {
		if(typeof this.constraints !== 'object') {
			var data = {};
			data[key] = formula;
			this.setConstraints(data);
		}
		else {
			this.constraints[key] = formula;
			this.hasConstraint[key] = true;
			this.constrain();
		}
		return this;
	},

	/**
	Clears the constraint on the specified property.
	@method {Self} setConstraint
	@param {String} property
	*/

	clearConstraint: function Entity_clearConstraint(key) {
		if(typeof this.constraints === 'object') {
			delete this.constraints[key];
			this.hasConstraint[key] = false;
		}
		return this;
	},

	/**
	Sets the constrained properties.
	@method {Self} setConstraints
	@param {Object} constraints
	*/

	setConstraints: function Entity_setConstraints(data) {
		var key,
			formula,
			fromParent = false;
		// Clear the defined flags
		this.hasConstraint = {
			x: false,
			y: false,
			width: false,
			height: false
		};
		// Find out if any of the constraints depend on the parent
		for(key in data) {
			formula = data[key];
			this.hasConstraint[key] = true;
			if(formula.indexOf('parent') !== -1) {
				fromParent = true;
			}
		}
		if(fromParent && this.parent !== null) {
			var that = this;
			this.parent.addHandler('dirty', function() {
				that.constrain();
			});
		}
		this.constraints = data;
		this.constraintsNeedParent = fromParent;
		this.constrain();
		return this;
	},

	constrain: function Entity_constrain() {
		// Just ignore it if we have no parent and it requires one
		if(this.constraints !== null && (!this.constraintsNeedParent || this.parent !== null)) {
			var hasData = this.hasConstraint,
				data = this.constraints;
			if(hasData.x) {
				this.setX(jayus.executeFormula(this, data.x));
			}
			if(hasData.y) {
				this.setY(jayus.executeFormula(this, data.y));
			}
			if(hasData.width) {
				this.setWidth(jayus.executeFormula(this, data.width));
			}
			if(hasData.height) {
				this.setHeight(jayus.executeFormula(this, data.height));
			}
		}
		return this;
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

	setAlpha: function Entity_setAlpha(alpha) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setAlpha', alpha, 'alpha', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setAlpha, this.alpha, alpha);
		}
		// Set the alpha
		if(this.alpha !== alpha) {
			this.alpha = alpha;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Cursor
		//__________//

	/*
	Whether or not this entity will be kept aware of cursor events.
	<br> If false then the underCursor and hasCursor flags will not be updated and no cursor events will be fired.
	<br> Default is true.
	<br> Do not modify.
	@property {Boolean} trackCursor
	*/

	trackCursor: false,

	/**
	Whether or not the entity can accept the cursor, firing the cursorEnter event and becoming the cursor focus.
	<br> If an entity does not accept the cursor, it cannot be given the cursorEnter and cursorLeave events.
	<br> Default is true.
	@property {Boolean} canAcceptCursor
	*/

	canAcceptCursor: true,

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
	The cursor's local x position within the entity.
	<br> Do not modify.
	@property {Number} cursorX
	*/

	cursorX: 0,

	/**
	The cursor's local y position within the entity.
	<br> Do not modify.
	@property {Number} cursorY
	*/

	cursorY: 0,

	tooltip: 'Hi!',

	setTooltip: function Entity_setTooltip(text) {
		this.trackCursor = true;
		if(this.parent !== null) {
			this.parent.childCursorTrackingChanged(this, true);
		}
		this.canAcceptCursor = true;
		this.tooltip = text;
	},

	/*
	Updates the entity's cursor status.
	@method {Self} updateCursor
	@param {Number} x
	@param {Number} y
	*/

	updateCursor: function Entity_updateCursor(x, y) {
		var pos = new jayus.Point(x, y);
		// Convert the point from parent to local coordinate space
		// If we are transformed, use the matrix, otherwise just to the translation manually
		if(this.isTransformed) {
			this.getMatrix().inverseTransformPointOnto(x, y, pos);
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

	cursorHitTest: function Entity_cursorHitTest(x, y) {
		return true;
	},

	/*
	Clears the underCursor status from the entity, and its children if applicable.
	@method {Self} removeCursor
	*/

	removeCursor: function Entity_removeCursor() {
		// Clear the cursor flag and fire the cursorOut event
		this.underCursor = false;
		this.fire('cursorOut', null);
		// If its a parent, call the removeCursorFromChildren() method
		if(this.isParent) {
			this.removeCursorFromChildren();
		}
	},

	//
	//  Dragging
	//____________//

	/**
	The mouse button that can be pressed to drag the entity.
	<br> Can be 'left', 'middle', 'right', or null.
	<br> Default is null, so the entity is not draggable.
	<br> Do not modify.
	@property {Boolean} dragButton
	*/

	dragButton: null,

	/**
	Whether the entity is currently being dragged.
	<br> Do not modify.
	@property {Boolean} dragging
	*/

	dragging: false,

	dragStarterOptions: null,

	dragEnderOptions: null,

	dragHandlerOptions: null,

	/**
	Sets the mouse button used to drag the entity, or null to disable it.
	@method {Self} setDragButton
	@param {String} button
	*/

	setDragButton: function Entity_setDragButton(button) {
		//#ifdef DEBUG
		if(button !== null && button !== 'left' && button !== 'middle' && button !== 'right') {
			throw 'Entity.setDragButton() - Error: button('+button+') must be null, "left", "middle", or "right"';
		}
		//#end
		if(this.dragButton === null && typeof button === 'string') {

			// Create the options objects
			// A reference of these is kept locally so we can set the remove flag at any time
			this.dragStarterOptions = {};
			this.dragHandlerOptions = {};
			this.dragEnderOptions = {};

			this.addHandler(button+'Press', function(e) {

				// The button was pressed, start dragging
				this.dragging = false;

				// Reset the handler and ender options
				this.dragHandlerOptions.remove = false;
				this.dragEnderOptions.remove = false;

				var that = this;
				var dragHandler = function(e) {
					that.canReleaseCursor = false;
					if(!that.dragging) {
						// Set the move cursor
						that.parentDisplay.setCursor('move');
						// Fire the dragStart event
						that.fire('dragStart');
						that.dragging = true;
					}
					if(!that.fire('dragged', e)) {
						that.translate(e.deltaX, e.deltaY);
					}
					return true;
				};

				this.parentDisplay.addHandler('cursorMove', dragHandler, this.dragHandlerOptions);

				// End the dragging if the button is released
				jayus.addHandler(button+'Release', function(e, options) {
					if(that.dragging) {
						that.canReleaseCursor = true;
						that.parentDisplay.updateCursor(that.parentDisplay.cursor.x, that.parentDisplay.cursor.y);
						that.fire('dragEnd');
						that.parentDisplay.resetCursor();
					}
					that.dragHandlerOptions.remove = true;
					options.remove = true;
					if(that.dragging) {
						that.dragging = false;
						return true;
					}
				}, this.dragEnderOptions);

				// return true;

			}, this.dragStarterOptions);

		}
		else if(typeof this.dragButton === 'string' && button === null) {

			this.dragStarterOptions.remove = true;
			this.dragStarterOptions = null;
			this.dragHandlerOptions.remove = true;
			this.dragHandlerOptions = null;
			this.dragEnderOptions.remove = true;
			this.dragEnderOptions = null;

		}
		else if(typeof this.dragButton === 'string' && typeof button === 'string' && this.dragButton !== button) {
			// Different button requested
			this.setDragButton(null);
			this.setDragButton(button);
		}
		this.dragButton = button;
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

	getMatrix: function Entity_getMatrix() {
		if(this.matrixDirty) {
			if(this.matrix === null) {
				this.matrix = new jayus.Matrix();
			}
			else {
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

	applyTransforms: function Entity_applyTransforms(ctx) {
		// Check if transformed
		if(this.isTransformed) {
			// Cache the scales
			var xScale = this.xScale,
				yScale = this.yScale;
			// Check to flip
			if(this.flipX) {
				xScale *= -1;
			}
			if(this.flipY) {
				yScale *= -1;
			}
			// Check if an anchor is specified
			if(this.xAnchor || this.yAnchor) {
				// Translate
				ctx.translate(this.xAnchor, this.yAnchor);
			}
			// Scale
			ctx.scale(xScale, yScale);
			// Rotate
			ctx.rotate(this.angle);
			// Translate back if needed
			if(this.xAnchor || this.yAnchor) {
				ctx.translate(-this.xAnchor, -this.yAnchor);
			}
		}
		return this;
	},

		//
		//  Angle
		//_________//

	/**
	The entity's rotation, in radians.
	<br> Do not modify.
	@property {Number} angle
	*/

	angle: 0,

	/**
	Sets the entity's angle.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setAngle
	@param {Number} angle
	*/

	setAngle: function Entity_setAngle(angle) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setAngle', angle, 'angle', jayus.TYPES.NUMBER);
		//#end
		// Check to animate
		if(this.actionsToAnimate) {
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setAngle, this.angle, angle);
		}
		// Set the angle
		if(this.angle !== angle) {
			this.angle = angle;
			this.isTransformed = true;
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

	rotate: function Entity_rotate(angle) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.rotate', angle, 'angle', jayus.TYPES.NUMBER);
		//#end
		return this.setAngle(this.angle+angle);
	},

		//
		//  Scale
		//_________//

	/**
	The horizontal scale of the entity.
	<br> Do not modify.
	@property {Number} xScale
	*/

	xScale: 1,

	/**
	The vertical scale of the entity.
	<br> Do not modify.
	@property {Number} yScale
	*/

	yScale: 1,

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

	setScale: function Entity_setScale(x, y) {
		//#ifdef DEBUG
		// jayus.debug.matchCoordinate('Entity.setScale', x, y);
		//#end
		if(arguments.length === 1) {
			y = x;
		}
		// Check if animated
		if(this.actionsToAnimate) {
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setScale, [this.xScale, this.yScale], [x, y]);
		}
		// Set the scale
		if(this.xScale !== x || this.yScale !== y) {
			this.xScale = x;
			this.yScale = y;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Sets the scale of the entity, keeping the specified point fixed.
	<br> Useful for scaling over the mouse cursor: this.setScaleAround(scale, this.cursorX, this.cursorY)
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setScale
	@paramset Syntax 1
	@param {Number} scale
	@param {Number} xAnchor
	@param {Number} yAnchor
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	@param {Number} xAnchor
	@param {Number} yAnchor
	*/

	setScaleAround: function Entity_setScaleAround(x, y, xAnchor, yAnchor) {
		if(arguments.length === 3) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('Entity.setScaleAround', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'xAnchor', jayus.TYPES.NUMBER);
			//#end
			return this.setScaleAround(x, x, y, xAnchor);
		}
		//#ifdef DEBUG
		else {
			jayus.debug.matchArgumentsAs('Entity.scale', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'xAnchor', 'yAnchor');
		}
		//#end
		// Get the initial position
		var pos = this.localToParent(xAnchor, yAnchor);
		// Set the scale
		this.setScale(x, y);
		// Get the new position, translate by the difference
		var pos2 = this.localToParent(xAnchor, yAnchor);
		this.translate(pos.x-pos2.x, pos.y-pos2.y);
		return this.dirty(jayus.DIRTY.ALL);
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

	scale: function Entity_scale(x, y) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.match('Entity.scale', x, 'scale', jayus.TYPES.NUMBER);
			//#end
			y = x;
		}
		//#ifdef DEBUG
		else {
			jayus.debug.matchArgumentsAs('Entity.scale', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		}
		//#end
		return this.setScale(this.xScale*x, this.yScale*y);
	},

	/**
	Sets the horizontal scale of the entity.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setXScale
	@param {Number} scale
	*/

	setXScale: function Entity_setXScale(scale) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.scale', scale, 'scale', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setXScale, this.xScale, scale);
		}
		// Set the scale
		if(this.xScale !== scale) {
			this.xScale = scale;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Sets the vertical scale of the entity.
	<br> Can be animated.
	<br> Sets the entity as dirty.
	@method {Self} setYScale
	@param {Number} scale
	*/

	setYScale: function Entity_setYScale(scale) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.scale', scale, 'scale', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if(this.actionsToAnimate) {
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setYScale, this.yScale, scale);
		}
		// Set the scale
		if(this.yScale !== scale) {
			this.yScale = scale;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

		//
		//  Flipping
		//____________//

	/**
	Whether the entity is horizontally flipped.
	<br> Do not modify.
	@property {Number} flipX
	*/

	flipX: false,

	/**
	Whether the entity is vertically flipped.
	<br> Do not modify.
	@property {Number} flipY
	*/

	flipY: false,

	/**
	Sets the horizontal flipping of the entity.
	<br> Sets the entity as dirty.
	@method {Self} setFlipX
	@param {Boolean} on
	*/

	setFlipX: function Entity_setFlipX(on) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setFlipX', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.flipX !== on) {
			this.flipX = on;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Sets the horizontal flipping of the entity.
	<br> Sets the entity as dirty.
	@method {Self} setFlipY
	@param {Boolean} on
	*/

	setFlipY: function Entity_setFlipY(on) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setFlipY', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.flipX !== on) {
			this.flipY = on;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

	/**
	Sets the horizontal and vertical flipping of the entity.
	<br> Sets the entity as dirty.
	@method {Self} setFlipping
	@param {Boolean} on
	*/

	setFlipping: function Entity_setFlipping(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.setFlipping', arguments, 'x', jayus.TYPES.BOOLEAN, 'y', jayus.TYPES.BOOLEAN);
		//#end
		if(this.flipX !== x || this.flipY !== y) {
			this.flipX = x;
			this.flipY = y;
			this.isTransformed = true;
			this.dirty(jayus.DIRTY.TRANSFORMS);
		}
		return this;
	},

		//
		//  Anchor
		//__________//

	/**
	The x position of the transforms anchor.
	<br> Do not modify.
	@property {Number} xAnchor
	*/

	xAnchor: 0,

	/**
	The y position of the transforms anchor.
	<br> Do not modify.
	@property {Number} yAnchor
	*/

	yAnchor: 0,

	/**
	Sets the transformation anchor point.
	@method {Self} setAnchor
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	setAnchor: function Entity_setAnchor(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.setAnchor', x, y);
		//#end
		if(arguments.length === 1) {
			return this.setAnchor(x.x, x.y);
		}
		if(this.xAnchor !== x || this.yAnchor !== y) {
			this.xAnchor = x;
			this.yAnchor = y;
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

	screenToLocal: function Entity_screenToLocal(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.screenToLocal', x, y);
		//#end
		if(arguments.length === 1) {
			return this.screenToLocal(x.x, x.y);
		}
		if(this.parent !== null) {
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

	parentToLocal: function Entity_parentToLocal(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.parentToLocal', x, y);
		//#end
		if(arguments.length === 1) {
			return this.parentToLocal(x.x, x.y);
		}
		// Convert the point from parent to local coordinate space
		// If we are transformed, use the matrix, otherwise just to the translation manually
		var pos = new jayus.Point(x, y);
		if(this.isTransformed) {
			this.getMatrix().inverseTransformPointOnto(x, y, pos);
		}
		else {
			pos.x -= this.x;
			pos.y -= this.y;
		}
		return pos;
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

	localToScreen: function Entity_localToScreen(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.localToScreen', x, y);
		//#end
		if(arguments.length === 1) {
			return this.localToScreen(x.x, x.y);
		}
		if(this.parent !== null) {
			return this.parent.localToScreen(this.localToParent(x, y));
		}
		return new jayus.Point(x, y);
	},

	localToScreenOnto: function Entity_localToScreenOnto(x, y, ret) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.localToScreenOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#end
		if(this.parent !== null) {
			this.localToParentOnto(x, y, ret);
			this.parent.localToScreenOnto(ret.x, ret.y, ret);
		}
		else {
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

	localToParent: function Entity_localToParent(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.localToParent', x, y);
		//#end
		if(arguments.length === 1) {
			return this.localToParent(x.x, x.y);
		}
		return this.localToParentOnto(x, y, new jayus.Point());
	},

	localToParentOnto: function Entity_localToParentOnto(x, y, ret) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Entity.localToParentOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y', jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#end
		// Convert the point from parent to local coordinate space
		// If we are transformed, use the matrix, otherwise just to the translation manually
		if(this.isTransformed) {
			return this.getMatrix().transformPointOnto(x, y, ret);
		}
		ret.x = x + this.x;
		ret.y = y + this.y;
		return ret;
	},

		//
		//  Animation
		//_____________//

	/*
	Whether the entity is in the animator list.
	<br> Do not modify.
	@property {Boolean} running
	*/

	running: false,

	/*
	The x velocity of the entity.
	<br> Do not modify.
	@property {Number} xVelocity
	*/

	xVelocity: 0,

	/*
	The y velocity of the entity.
	<br> Do not modify.
	@property {Number} yVelocity
	*/

	yVelocity: 0,

	/**
	Sets the x velocity of the entity.
	@method {Self} setXVelocity
	@param {Number} x
	*/

	setXVelocity: function Entity_setXVelocity(vel) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setXVelocity', vel, 'vel', jayus.TYPES.NUMBER);
		//#end
		// Set the velocity
		this.xVelocity = vel;
		// Add self to the list of animators if not already
		if(!this.running) {
			jayus.animators.push(this);
			this.running = true;
		}
		return this;
	},

	/**
	Sets the y velocity of the entity.
	@method {Self} setYVelocity
	@param {Number} y
	*/

	setYVelocity: function Entity_setYVelocity(vel) {
		//#ifdef DEBUG
		jayus.debug.match('Entity.setYVelocity', vel, 'vel', jayus.TYPES.NUMBER);
		//#end
		// Set the velocity
		this.yVelocity = vel;
		// Add self to the list of animators if not already
		if(!this.running) {
			jayus.animators.push(this);
			this.running = true;
		}
		return this;
	},

	/**
	Sets the velocity of the entity.
	@method {Self} setVelocity
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	setVelocity: function Entity_setVelocity(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Entity.setVelocity', x, y);
		//#end
		if(arguments.length === 1) {
			return this.setVelocity(x.x, x.y);
		}
		// Set the velocity
		this.xVelocity = x;
		this.yVelocity = y;
		// Add self to the list of animators if not already
		if(!this.running) {
			jayus.animators.push(this);
			this.running = true;
		}
		return this;
	},

	/**
	Clears the entity's velocity.
	@method {Self} clearVelocity
	*/

	clearVelocity: function Entity_clearVelocity() {
		if(this.running) {
			this.xVelocity = 0;
			this.yVelocity = 0;
			jayus.animators.splice(jayus.animators.indexOf(this), 1);
			this.running = false;
		}
		return this;
	},

	/*
	Ticks the entity.
	<br> Used to updates the entity's position from its velocity.
	@method tick
	@param {Number} time Current epoch time
	@param {Number} elapsed Seconds elapsed since last frame
	*/

	tick: function Entity_tick(now, elapsed) {
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

	intersects: function Entity_intersects(object) {
		return jayus.intersectTest(this, object);
	},

	/**
	Returns the number of entities in the sent array that intersect this one.
	<br> If you plan on performing any actions with the intersecting entities, it is much more efficient to use intersectsWhat() and check the length of the returned array.
	@method {Number} intersectCount
	@param {Array} entities
	*/

	intersectCount: function Entity_intersectCount(entities) {
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectCount', entities, 'entities', jayus.TYPES.ENTITY);
		if(!entities.length) {
			throw new RangeError('Entity.intersectCount() - Invalid entities'+jayus.debug.toString(entities)+' sent, length of at least 1 required');
		}
		//#end
		var i, count = 0;
		// Loop through the entities
		for(i=entities.length-1;i>=0;i--) {
			// Check if it intersects
			if(jayus.intersectTest(this, entities[i])) {
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
	@param {Array|List} entities
	*/

	intersectsAny: function Entity_intersectsAny(entities) {
		if(entities instanceof jayus.List) {
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsAny', entities, 'entities', jayus.TYPES.ENTITY);
		//#end
		// Loop through the entity
		for(var i=0;i<entities.length;i++) {
			// Return true if the entity intersects
			if(jayus.intersectTest(this, entities[i])) {
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
	@param {Array|List} entities
	*/

	intersectsAll: function Entity_intersectsAll(entities) {
		if(entities instanceof jayus.List) {
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsAll', entities, 'entities', jayus.TYPES.ENTITY);
		if(!entities.length) {
			throw new RangeError('Entity.intersectsAll() - Invalid entities'+jayus.debug.toString(entities)+' sent, length of at least 1 required');
		}
		//#end
		// Loop through the entities
		for(var i=0;i<entities.length;i++) {
			// Return false if the entity does not intersect
			if(!jayus.intersectTest(this, entities[i])) {
				return false;
			}
		}
		// All entities intersected this one, return true;
		return true;
	},

	/**
	Returns the entities out of the sent entities that intersect this one.
	<br> Bounds are used to test for intersection.
	@method {Array} intersectsWhich
	@param {Array|List} entities
	*/

	intersectsWhich: function Entity_intersectsWhich(entities) {
		if(entities instanceof jayus.List) {
			entities = entities.items;
		}
		//#ifdef DEBUG
		jayus.debug.matchArray('Entity.intersectsWhich', entities, 'entities', jayus.TYPES.ENTITY);
		//#end
		var i, ret = [];
		// Loop through the entities
		for(i=0;i<entities.length;i++) {
			// Add the index if it intersects
			if(jayus.intersectTest(this, entities[i])) {
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

	rasterize: function Entity_rasterize() {
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

	drawOnto: function Entity_drawOnto(surface) {
		var ctx = surface.context;
		ctx.save();
		this.drawOntoContext(ctx, 0, 0);
		ctx.restore();
		surface.dirty(jayus.DIRTY.CONTENT);
		return this;
	}

	/**
	Draws the entity onto the sent canvas context.
	<br> Does not respect the visible flag.
	@method {Self} drawOntoContext
	@param {CanvasRenderingContext2D} ctx
	*///@ Abstract Function

});

})();