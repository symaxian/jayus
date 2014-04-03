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
Defines the Layer entity.
@file Layer.js
*/

//
//  jayus.Layer()
//_________________//

/**
A entity for manipulating and rendering child entities within a fixed area.
@class jayus.Layer
@extends jayus.Entity
@extends jayus.Group
*/

jayus.Layer = jayus.Entity.extend({

	//
	//  Properties
	//______________//

	x: 0,

	y: 0,

	childrenAdded: null,

	scope: null,

	scopeDirty: true,

	canAcceptCursor: false,

	//
	//  Methods
	//___________//

	componentDirtied: function Layer_componentDirtied(component, type) {
		if(component instanceof jayus.Entity) {
			if(type & jayus.DIRTY.SCOPE) {
				component.scopeChanged = true;
			}
			this.scopeDirty = true;
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemAdded: function Layer_listItemAdded(list, item) {
		this.childrenAdded.push(item);
		item.prevScope = item.getScope();
		item.setParent(this);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsAdded: function Layer_listItemsAdded(list, items) {
		var i, item;
		for(i=0;i<items.length;i++) {
			item = items[i];
			this.childrenAdded.push(item);
			item.prevScope = item.getScope();
			item.setParent(this);
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemRemoved: function Layer_listItemRemoved(list, item) {
		item.removeParent();
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsRemoved: function Layer_listItemsRemoved(list, items) {
		for(var i=0;i<items.length;i++) {
			items[i].removeParent();
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Initiates the layer.
	@constructor Layer
	@param {Number} width Optional
	@param {Number} height Optional
	*/

	init: function Layer(width, height) {
		jayus.Entity.prototype.init.apply(this);
		this.children = new jayus.List(this);
		this.items = this.children.items;
		this.scope = new jayus.Rectangle();
		this.childrenAdded = [];
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#end
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Layer', arguments, jayus.TYPES.NUMBER, 'width', 'height');
			//#end
			this.width = width;
			this.height = height;
		}
	},

	toObject: function Layer_toObject() {
		var object = jayus.Entity.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'Layer';
		var i, key, val, valType;
		for(i=0;i<jayus.Layer.prototype.properties.length;i++) {
			key = jayus.Layer.prototype.properties[i];
			val = this[key];
			valType = typeof val;
			if(val !== jayus.Layer.prototype[key]) {
				if(valType === 'object') {
					val = val.toObject();
				}
				object[key] = val;
			}
		}
		return object;
	},

	cursorHitTest: function Layer_cursorHitTest(x, y) {
		return true;
	},

	getScope: function Layer_getScope() {
		var i, scope, x1, y1, x2, y2;
		if(this.scopeDirty) {
			if(this.items.length) {
				x1 = Infinity;
				y1 = Infinity;
				x2 = -Infinity;
				y2 = -Infinity;
				for(i=this.items.length-1;i>=0;i--) {
					scope = this.items[i].getScope();
					if(scope.x < x1) {
						x1 = scope.x;
					}
					if(scope.x+scope.width > x2) {
						x2 = scope.x+scope.width;
					}
					if(scope.y < y1) {
						y1 = scope.y;
					}
					if(scope.y+scope.height > y2) {
						y2 = scope.y+scope.height;
					}
				}
				this.scope.setFrame(x1, y1, x2-x1, y2-y1);
			}
			else {
				this.scope.setFrame(0, 0, 0, 0);
			}
		}
		return this.scope;
	},

		//
		//  Origin
		//__________//

	/**
	Sets the x coordinate.
	@method {Self} setX
	@param {Number} x
	*/

	setX: jayus.RectEntity.prototype.setX,

	/**
	Sets the y coordinate.
	@method {Self} setY
	@param {Number} y
	*/

	setY: jayus.RectEntity.prototype.setY,


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

	// translate: function Layer_translate(x, y) {
	// 	// Draw the children onto the context
	// 	var i, item;
	// 	for(i=0;i<this.items.length;i++) {
	// 		item = this.items[i];
	// 		item.translate(x, y);
	// 	}
	// },

	intersectsAt: function Layer_intersectsAt(x, y) {
		// Just resort to true, after all our definition of a layer requires that it be technically infinite
		return true;
		// for(var i=0;i<this.items;i++) {
		// 	this.items[i].intersectsAt(x, y);
		// }
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

	setRounding: jayus.RectEntity.prototype.setRounding,

		//
		//  Rendering
		//_____________//

	//@ From Entity
	applyTransforms: function Layer_applyTransforms(ctx) {
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
			// Check to flip
			if(this.flipX) {
				xScale *= -1;
			}
			if(this.flipY) {
				yScale *= -1;
			}
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
	drawOntoContext: function Layer_drawOntoContext(ctx) {
		// Save the context
		ctx.save();
		// Apply alpha
		if(this.alpha !== 1) {
			ctx.globalAlpha *= this.alpha;
		}
		// Apply transforms
		this.applyTransforms(ctx);
		// Draw the children onto the context
		var i, item;
		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			if(item.visible) {
				item.drawOntoContext(ctx);
			}
		}
		// Restore the context
		ctx.restore();
	}

});

jayus.applyObject(jayus.Group, jayus.Layer.prototype);