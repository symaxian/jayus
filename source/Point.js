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
Defines the Point class.
@file Point.js
*/

//
//  jayus.Point()
//_________________//

/**
Represents a point in two dimensional space.
<br> Check the init method for construction options.
@class jayus.Point
*/

//#ifdef DEBUG
jayus.debug.className = 'Point';
//#end

jayus.Point = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	componentType: 'POINT',

	/**
	The x coordinate.
	<br> Do not modify.
	@property {Number} x
	*/

	x: 0,

	/**
	The y coordinate.
	<br> Do not modify.
	@property {Number} y
	*/

	y: 0,

	//
	//  Methods
	//___________//

	/**
	Initates the Point object.
	@constructor init
	@param {Number} x Optional, default is 0
	@param {Number} y Optional, default is 0
	*/

	init: function Point_init(x, y) {
		if (arguments.length === 1) {
			this.initFromObject(x);
		}
		else if (arguments.length) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Point.init', arguments, jayus.TYPES.NUMBER, 'x', 'y');
			//#end
			this.x = x;
			this.y = y;
		}
	},

	//@ From Parsable
	initFromObject: function Point_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Point.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		// Apply parent properties
		jayus.Dependency.prototype.initFromObject.call(this, object);
		// Apply our own properties
		this.x = object.x;
		this.y = object.y;
		// Set as dirty
		this.dirty(jayus.DIRTY.ALL);
	},

	//@ From Parsable
	addToResult: function Point_addToResult(result) {
		if (jayus.isObjectInResult(result, this)) {
			return;
		}
		// Get object from parent
		var object = jayus.Dependency.prototype.addToResult.call(this);
		// Add our own properties
		object.__type__ = 'Point';
		object.x = this.x;
		object.y = this.y;
		return object;
	},

		//
		//  Operations
		//______________//

	/**
	Sets the x coordinate.
	<br> Can be animated.
	@method {Self} setX
	@param {Number} x
	*/

	setX: function Point_setX(x) {
		//#ifdef DEBUG
		jayus.debug.match('Point.setX', x, 'x', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if (this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setX, this.x, x);
		}
		if (this.x !== x) {
			this.x = x;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	/**
	Sets the y coordinate.
	<br> Can be animated.
	@method {Self} setY
	@param {Number} y
	*/

	setY: function Point_setY(y) {
		//#ifdef DEBUG
		jayus.debug.match('Point.setY', y, 'y', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if (this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setY, this.y, y);
		}
		if (this.y !== y) {
			this.y = y;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	/**
	Sets the x and y coordinates.
	<br> Can be animated.
	@method {Self} set
	@param {Number} x
	@param {Number} y
	*/

	set: function Point_set(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Point.set', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#end
		// Check if animated
		if (this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.set, [this.x, this.y], [x, y]);
		}
		// Check if different
		if (this.x !== x || this.y !== y) {
			this.x = x;
			this.y = y;
			this.dirty(jayus.DIRTY.POSITION);
		}
		return this;
	},

	/**
	Translates the point.
	<br> This method is animatable.
	@method {Self} translate
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	translate: function Point_translate(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Point.translate', x, y);
		//#end
		if (arguments.length === 1) {
			y = x.y;
			x = x.x;
		}
		return this.set(this.x+x, this.y+y);
	},

		//
		//  Utilities
		//_____________//

	//#ifdef DEBUG
	toString: function Point_toString() {
		return '(Point:'+this.x+','+this.y+')';
	},
	//#end

	/**
	Returns a clone of this point.
	@method {Point} clone
	*/

	clone: function Point_clone() {
		return new jayus.Point(this.x, this.y);
	},

	/**
	Clones this point onto the sent one.
	<br> Does not dirty the sent point.
	@method {Point} cloneOnto
	@param {Point} ret
	*/

	cloneOnto: function Point_cloneOnto(ret) {
		ret.x = this.x;
		ret.y = this.y;
		return ret;
	},

	/**
	Compares against another point for equality.
	@method {Boolean} equals
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	equals: function Point_equals(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Point.equals', x, y);
		//#end
		if (arguments.length === 1) {
			y = x.y;
			x = x.x;
		}
		return this.x === x && this.y === y;
	}

});