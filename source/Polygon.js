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
Defines the Polygon entity.
@file Polygon.js
*/

//
//  jayus.Polygon()
//___________________//

/**
Represents a 2d polygon.
<br> Check the init method for construction options.
@class jayus.Polygon
@extends jayus.Shape
*/

jayus.Polygon = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	shapeType: 8,

	/**
	The x coordinates of the vertices.
	<br> Do not modify.
	@property {Array} xPoints
	*/

	xPoints: null,

	/**
	The y coordinates of the vertices.
	<br> Do not modify.
	@property {Array} yPoints
	*/

	yPoints: null,

	/*
	The left-most x coordinate.
	<br> Do not modify.
	@property {Number} x1
	*/

	x1: 0,

	/*
	The top-most y coordinate.
	<br> Do not modify.
	@property {Number} y1
	*/

	y1: 0,

	/*
	The right-most x coordinate.
	<br> Do not modify.
	@property {Number} x2
	*/

	x2: 0,

	/*
	The bottom-most y coordinate.
	<br> Do not modify.
	@property {Number} y2
	*/

	y2: 0,

	/*
	Whether or not to forcibly close the polygon when rendering.
	<br> Do not modify.
	@property {Boolean} closed
	*/

	closed: true,
	//#replace jayus.Polygon.prototype.closed true

	frame: null,

	frameDirty: true,

	//
	//  Methods
	//___________//

	/**
	Initializes the Polygon.
	<br> Arguments are optional, will initialize as an empty polygon if not given.
	@method init
	@paramset 1
	@param {Array<Point>} points
	@paramset 2
	@param {Array<Number>} xPoints
	@param {Array<Number>} yPoints
	*/

	init: function Polygon(xPoints, yPoints) {
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArray('Polygon', xPoints, 'xPoints', jayus.TYPES.NUMBER);
			jayus.debug.matchArray('Polygon', yPoints, 'yPoints', jayus.TYPES.NUMBER);
			//#end
			this.xPoints = xPoints;
			this.yPoints = yPoints;
		}
		else {
			this.xPoints = [];
			this.yPoints = [];
			if(arguments.length === 1) {
				//#ifdef DEBUG
				jayus.debug.matchArray('Polygon', xPoints, 'xPoints', jayus.TYPES.POINT);
				//#end
				for(var i=0;i<xPoints.length;i++) {
					this.xPoints[i] = xPoints[i].x;
					this.yPoints[i] = xPoints[i].y;
				}
			}
		}
	},

	toObject: function Polygon_toObject() {
		// Get object from parent
		var object = {
			type: 'Polygon',
			xPoints: this.xPoints,
			yPoints: this.yPoints
		};
		if(this.closed !== jayus.Polygon.prototype.closed) {
			object.closed = this.closed;
		}
		if(this.id !== jayus.Dependency.prototype.id) {
			object.id = this.id;
		}
		return object;
	},

	initFromObject: function Polygon_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Polygon.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		jayus.Dependency.prototype.initFromObject.call(this, object);
		// Apply our own properties
		this.xPoints = object.xPoints;
		this.yPoints = object.yPoints;
		if(typeof object.closed === 'boolean') {
			this.closed = object.closed;
		}
		// Set as dirty
		this.reformFrame();
		return this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Position
		//____________//

	//@ From Shape
	translate: function Polygon_translate(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Polygon.translate', x, y);
		//#end
		if(arguments.length === 1) {
			return this.translate(x.x, x.y);
		}
		if(x || y) {
			for(var i=0;i<this.xPoints.length;i++) {
				this.xPoints[i] += x;
				this.yPoints[i] += y;
			}
			this.frameDirty = true;
		}
		return this;
	},

	//@ From Shape
	alignToCanvas: function Polygon_alignToCanvas() {
		// Nothing to do here
		return this;
	},

	//@ From Shape
	paintedWith: function Polygon_paintedWith(brush) {
		return new jayus.PaintedShape(this, brush);
	},

		//
		//  Points
		//__________//

	/**
	Appends a point to the polygon.
	@method {Self} addPoint
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	addPoint: function Polygon_addPoint(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Polygon.addPoint', x, y);
		//#end
		if(arguments.length === 1) {
			return this.addPoint(x.x, x.y);
		}
		this.xPoints.push(x);
		this.yPoints.push(y);
		this.frameDirty = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Appends multiple points to the polygon.
	@method {Self} addPoints
	@paramset 1
	@param {Array<Point>} points
	@paramset 2
	@param {Array<Number>} xPoints
	@param {Array<Number>} yPoints
	*/

	addPoints: function Polygon_addPoints(xPoints, yPoints) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.matchArray('Polygon.addPoints', xPoints, 'xPoints', jayus.TYPES.POINT);
			//#end
			for(var i=0;i<xPoints.length;i++) {
				this.xPoints.push(xPoints[i].x);
				this.yPoints.push(xPoints[i].y);
			}
		}
		else if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArray('Polygon.addPoints', xPoints, 'xPoints', jayus.TYPES.NUMBER);
			jayus.debug.matchArray('Polygon.addPoints', yPoints, 'yPoints', jayus.TYPES.NUMBER);
			//#end
			this.xPoints = this.xPoints.concat(xPoints);
			this.yPoints = this.yPoints.concat(yPoints);
		}
		this.frameDirty = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Inserts a point into the polygon.
	@method {Self} insertPoint
	@paramset 1
	@param {Number} index
	@param {Point} point
	@paramset 2
	@param {Number} index
	@param {Number} x
	@param {Number} y
	*/

	insertPoint: function Polygon_insertPoint(index, x, y) {
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('Polygon.insertPoint', arguments, 'index', jayus.TYPES.NUMBER, 'point', jayus.TYPES.POINT);
			//#end
			return this.insertPoint(index, x.x, x.y);
		}
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Polygon.insertPoint', arguments, jayus.TYPES.NUMBER, 'index', 'x', 'y');
		//#end
		this.xPoints.splice(index, 0, x);
		this.yPoints.splice(index, 0, y);
		this.frameDirty = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Sets a point of the polygon.
	@method {Self} setPoint
	@paramset 1
	@param {Number} index
	@param {Point} point
	@paramset 2
	@param {Number} index
	@param {Number} x
	@param {Number} y
	*/

	setPoint: function Polygon_setPoint(index, x, y) {
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('Polygon.setPoint', arguments, 'index', jayus.TYPES.NUMBER, 'point', jayus.TYPES.POINT);
			//#end
			return this.setPoint(index, x.x, x.y);
		}
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Polygon.setPoint', arguments, jayus.TYPES.NUMBER, 'index', 'x', 'y');
		//#end
		this.xPoints[index] = x;
		this.yPoints[index] = y;
		this.frameDirty = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

		//
		//  Frame
		//_________//

	getLeft: function Shape_getLeft() {
		return this.getFrame().getLeft();
	},

	getTop: function Shape_getTop() {
		return this.getFrame().getTop();
	},

	getWidth: function Shape_getWidth() {
		return this.getFrame().getWidth();
	},

	getHeight: function Shape_getHeight() {
		return this.getFrame().getHeight();
	},

	getScope: function Polygon_getScope() {
		return this.getFrame();
	},

	getFrame: function Polygon_getFrame() {
		if(this.frameDirty) {
			this.reformFrame();
			this.frameDirty = false;
		}
		return this.frame;
	},

	reformFrame: function Polygon_reformFrame() {

		var i, x, y,
			x1 = null,
			x2 = null,
			y1 = null,
			y2 = null;

		for(i=0;i<this.xPoints.length;i++) {
			x = this.xPoints[i];
			y = this.yPoints[i];
			if(x1 === null || x < x1) {
				x1 = x;
			}
			if(x2 === null || x > x2) {
				x2 = x;
			}
			if(y1 === null || y < y1) {
				y1 = y;
			}
			if(y2 === null || y > y2) {
				y2 = y;
			}
		}

		if(this.frame === null) {
			this.frame = new jayus.Rectangle();
		}

		this.frame.setFrame(x1, y1, x2-x1, y2-y1);

	},

		//
		//  Intersection
		//________________//

	//@ From Shape
	intersectsAt: function Polygon_intersectsAt(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Polygon.intersectsAt', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#end
		// Get a context
		var ctx = jayus.getContext();
		ctx.save();
		this.etchOntoContext(ctx);
		var ret = ctx.isPointInPath(x, y);
		ctx.restore();
		return ret;
	},

		//
		//  Closed
		//__________//

	/**
	Sets the closed flag.
	@method {Self} setClosed
	@param {Boolean} on
	*/

	setClosed: function Polygon_setClosed(on) {
		//#ifdef DEBUG
		jayus.debug.match('Polygon.setClosed', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.closed !== on) {
			this.closed = on;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Utilities
		//_____________//

	//@ From Shape
	clone: function Polygon_clone() {
		return new jayus.Polygon(this.xPoints.slice(0), this.yPoints.slice(0));
	},

	//@ From Shape
	cloneOnto: function Polygon_cloneOnto(ret) {
		ret.xPoints = this.xPoints.slice(0);
		ret.yPoints = this.yPoints.slice(0);
		ret.frameDirty = true;
		return ret;
	},

	/**
	Transforms the polygon by the given matrix.
	@method {Self} transform
	@param {Matrix} matrix
	*/

	transform: function Polygon_transform(matrix) {
		//#ifdef DEBUG
		jayus.debug.match('Polygon.transform', matrix, 'matrix', jayus.TYPES.MATRIX);
		//#end
		var i,
			point = new jayus.Point();
		for(i=0;i<this.xPoints.length;i++) {
			matrix.transformPointOnto(this.xPoints[i], this.yPoints[i], point);
			this.xPoints[i] = point.x;
			this.yPoints[i] = point.y;
		}
		this.frameDirty = true;
		return this;
	},

	//@ From Shape
	getTransformed: function Polygon_getTransformed(matrix) {
		//#ifdef DEBUG
		jayus.debug.match('Polygon.getTransformed', matrix, 'matrix', jayus.TYPES.MATRIX);
		//#end
		return this.getTransformedOnto(matrix, new jayus.Polygon());
	},

	getTransformedOnto: function Polygon_getTransformedOnto(matrix, ret) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Polygon.getTransformedOnto', arguments, 'matrix', jayus.TYPES.MATRIX, 'ret', jayus.TYPES.POLYGON);
		//#end
		var i,
			point = new jayus.Point();
		// Clear the points of ret
		ret.xPoints = [];
		ret.yPoints = [];
		// Push the transformed points from self onto ret
		for(i=0;i<this.xPoints.length;i++) {
			matrix.transformPointOnto(this.xPoints[i], this.yPoints[i], point);
			ret.xPoints.push(point.x);
			ret.yPoints.push(point.y);
		}
		return ret;
	},

		//
		//  Rendering
		//_____________//

	//@ From Shape
	etchOntoContext: function Polygon_etchOntoContext(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('Polygon.etchOntoContext', ctx);
		//#end
		if(this.xPoints.length) {
			// Start a new path
			ctx.beginPath();
			// Move to the first point
			ctx.moveTo(this.xPoints[0], this.yPoints[0]);
			// Trace out the other points
			for(var i=0;i<this.xPoints.length;i++) {
				ctx.lineTo(this.xPoints[i], this.yPoints[i]);
			}
			// Trace back to the starting point
			if(this.closed) {
				ctx.closePath();
			}
		}
		return this;
	}

});

/**
Constructs a Polygon representing a line segment.
@function jayus.Polygon.Line
@paramset 1
@param {Vec2} start
@param {Vec2} end
@paramset 2
@param {Number} x
@param {Number} y
@param {Number} width
@param {Number} height
*/

jayus.Polygon.Line = function Polygon_Line(x1, y1, x2, y2) {
	if(arguments.length === 2) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Polygon.Line()', arguments, 'start', jayus.TYPES.POINT, 'end', jayus.TYPES.POINT);
		//#end
		return jayus.Polygon.Line(x1.x, x1.y, y1.x, y1.y);
	}
	//#ifdef DEBUG
	jayus.debug.matchArgumentsAs('Polygon.Line', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2');
	//#end
	return new jayus.Polygon([x1, x2], [y1, y2]);
};

jayus.Polygon.LineOnto = function Polygon_LineOnto(x1, y1, x2, y2, ret) {
	//#ifdef DEBUG
	jayus.debug.matchArgumentsAs('Polygon.LineOnto', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2');
	jayus.debug.match('Polygon.LineOnto', ret, 'ret', jayus.TYPES.POLYGON);
	//#end
	ret.xPoints = [x1, x2];
	ret.yPoints = [y1, y2];
	ret.frameDirty = true;
	return ret;
};

/**
Constructs a Polygon representing an axis-aligned rectangle.
@function jayus.Polygon.Rectangle
@paramset 1
@param {Vec2} origin
@param {Number} width
@param {Number} height
@paramset 2
@param {Number} x
@param {Number} y
@param {Number} width
@param {Number} height
*/

jayus.Polygon.Rectangle = function Polygon_Rectangle(x, y, width, height) {
	// Expand the arguments
	if(arguments.length === 3) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Polygon.Rectangle', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
		//#end
		return jayus.Polygon.Rectangle(x.x, x.y, y, width);
	}
	//#ifdef DEBUG
	jayus.debug.matchArgumentsAs('Polygon.Rectangle', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
	//#end
	// Construct the polygon
	return new jayus.Polygon(
		[x, x+width, x+width, x],
		[y, y, y+height, y+height]
	);
};

/**
Constructs a regular Polygon.
@function jayus.Polygon.Regular
@param {Number} count
@param {Number} radius
*/

jayus.Polygon.Regular = function Polygon_Regular(count, radius) {
	//#ifdef DEBUG
	jayus.debug.matchArgumentsAs('Polygon.Regular', arguments, jayus.TYPES.NUMBER, 'count', 'radius');
	//#end
	var i,
		poly = new jayus.Polygon(),
		angle = 0,
		step = Math.PI*2/count;
	for(i=0;i<count;i++) {
		poly.addPoint(radius*Math.cos(angle), radius*Math.sin(angle));
		angle += step;
	}
	return poly;
};

/**
Constructs a Polygon representing a star.
@function jayus.Polygon.Star
@param {Number} count
@param {Number} innerRadius
@param {Number} outerRadius
*/

jayus.Polygon.Star = function Polygon_Star(count, innerRadius, outerRadius) {
	//#ifdef DEBUG
	jayus.debug.matchArgumentsAs('Polygon.Star', arguments, jayus.TYPES.NUMBER, 'count', 'innerRadius', 'outerRadius');
	//#end
	var i,
		poly = new jayus.Polygon(),
		angle = 0,
		step = Math.PI/count,
		atInner = true,
		radius = innerRadius;
	for(i=0;i<count*2;i++) {
		poly.addPoint(radius*Math.cos(angle), radius*Math.sin(angle));
		radius += atInner ? outerRadius : innerRadius;
		atInner = !atInner;
		angle += step;
	}
	return poly;
};