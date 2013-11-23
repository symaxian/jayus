/**
Copyright © 2011 Jonathon Reesor
 *
This file is part of Jayus
 *
Jayus is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version
 *
Jayus is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details
 *
You should have received a copy of the GNU General Public License
along with Jayus.  If not, see <http://www.gnu.org/licenses/>
*/

/**
Defines the Circle entity.
@file Circle.js
*/

//
//  jayus.Circle()
//__________________//

/**
Standard Circle shape.
<br> Check the init method for construction options.
@class jayus.Circle
@extends jayus.Shape
*/

jayus.Circle = jayus.Shape.extend({

	//
	//  Properties
	//______________//

	shapeType: jayus.SHAPES.CIRCLE,

	componentType: 'CIRCLE',

	/**
	The x position of the center of the circle.
	<br> Default is 0.
	@property {Number} x
	*/

	x: 0,

	/**
	The y position of the center of the circle.
	<br> Default is 0.
	@property {Number} y
	*/

	y: 0,

	/**
	The radius of the circle.
	<br> Default is 1.
	@property {Number} radius
	*/

	radius: 1,

	/**
	How closely the toPolygon method approximates the circle.
	<br>
	The detail is number of faces on the resulting polygon from the toPolygon() method.
	<br> Default is 10.
	@property {Number} toPolygonDetail
	*/

	toPolygonDetail: 10,
	//#replace jayus.Circle.prototype.toPolygonDetail 10

	//
	//  Methods
	//___________//

	/**
	Initiates the circle with the default values.
	@constructor init
	@paramset Syntax 1
	@paramset Syntax 2
	@param {Object} properties
	@paramset Syntax 3
	@param {Point} center
	@param {Number} radius
	@paramset Syntax 4
	@param {Number} x
	@param {Number} y
	@param {Number} radius
	*/

	init: function Circle_init(x, y, radius) {
		if (arguments.length === 1) {
			this.initFromObject(x);
		}
		else if (arguments.length) {
			//#ifdef DEBUG
			if (arguments.length === 2) {
				jayus.debug.matchArguments('Circle.init', arguments, 'center', jayus.TYPES.POINT, 'radius', jayus.TYPES.POINT);
			}
			else if (arguments.length === 3) {
				jayus.debug.matchArgumentsAs('Circle.init', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'radius');
			}
			else {
				throw new TypeError('Circle.init() - Invalid number of parameters sent, 0, 2, or 3 required');
			}
			//#end
			if (arguments.length === 2) {
				radius = y;
				y = x.y;
				x = x.x;
			}
			this.x = x;
			this.y = y;
			this.radius = radius;
		}
	},

	pointChanged: function Circle_pointChanged() {},

	//@ From Parsable
	toObject: function Circle_toObject() {
		// Get object from parent
		var object = {
			type: 'Circle',
			x: this.x,
			y: this.y,
			radius: this.radius
		};
		if (this.toPolygonDetail !== jayus.Circle.prototype.toPolygonDetail) {
			object.toPolygonDetail = this.toPolygonDetail;
		}
		if (this.id !== jayus.Dependency.prototype.id) {
			object.id = this.id;
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function Circle_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Circle.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		jayus.Dependency.prototype.initFromObject.call(this, object);
		// Apply our own properties
		this.x = object.x;
		this.y = object.y;
		this.radius = object.radius;
		if (typeof object.toPolygonDetail === 'number') {
			this.toPolygonDetail = object.toPolygonDetail;
		}
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Center
		//__________//

	/**
	Returns the center of the circle.
	@method {Point} getCenter
	*/

	getCenter: function Circle_getCenter() {
		return new jayus.Point(this.x, this.y);
	},

	/**
	Sets the x coordinate of the center.
	<br> Can be animated.
	@method {Self} setX
	@param {Number} x
	*/

	setX: jayus.Point.prototype.setX,

	/**
	Sets the y coordinate of the center.
	<br> Can be animated.
	@method {Self} setY
	@param {Number} y
	*/

	setY: jayus.Point.prototype.setY,

	/**
	Sets the center of the circle.
	<br> Can be animated.
	@method {Self} setCenter
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setCenter: jayus.Point.prototype.set,

	//@ From Shape
	translate: function Circle_translate(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Circle.translate', x, y);
		//#end
		if (arguments.length === 1) {
			y = x.y;
			x = x.x;
		}
		return this.setCenter(this.x+x, this.y+y);
	},

	//@ From Shape
	alignToCanvas: function Circle_alignToCanvas() {
		// Can we do anything here?
		return this;
	},

		//
		//  Radius
		//__________//

	/**
	Returns the radius of the circle.
	@method {Number} getRadius
	*/

	getRadius: function Circle_getRadius() {
		return this.radius;
	},

	/**
	Sets the radius of the circle.
	<br> Can be animated.
	@method {Self} setRadius
	@param {Number} radius
	*/

	setRadius: function Circle_setRadius(radius) {
		//#ifdef DEBUG
		jayus.debug.match('Circle.setRadius', radius, 'radius', jayus.TYPES.NUMBER);
		//#end
		// Check if animated
		if (this.actionsToAnimate) {
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setRadius, this.radius, radius);
		}
		if (this.radius !== radius) {
			this.radius = radius;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

		//
		//  Intersection
		//________________//

	//@ From Shape
	intersectsAt: function Circle_intersectsAt(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Circle.intersectsAt', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#end
		return (this.x-x)*(this.x-x) + (this.y-y)*(this.y-y) <= this.radius*this.radius;
	},

	//@ From Shape
	getScope: function Circle_getScope() {
		return new jayus.Rectangle(this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2);
	},

		//
		//  Utilities
		//_____________//

	//@ From Shape
	clone: function Circle_clone() {
		return new jayus.Circle(this.x, this.y, this.radius);
	},

	//@ From Shape
	cloneOnto: function Circle_cloneOnto(ret) {
		ret.x = this.x;
		ret.y = this.y;
		ret.radius = this.radius;
		return ret;
	},

	//@ From Shape
	toPolygon: function Circle_toPolygon(detail) {
		if (!arguments.length) {
			detail = this.toPolygonDetail;
		}
		//#ifdef DEBUG
		else {
			jayus.debug.match('Circle.toPolygon', detail, 'detail', jayus.TYPES.NUMBER);
		}
		//#end
		return new jayus.Polygon.Regular(detail, this.radius);
	},

		//
		//  Rendering
		//_____________//

	//@ From Shape
	etchOntoContext:function Circle_etchOntoContext(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('Circle.etchOntoContext', ctx);
		//#end
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
	}

});
