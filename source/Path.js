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
Defines the Path entity.
@file Path.js
*/

//
//  jayus.Path()
//________________//

/**
Represents a path.
<br> Check the init method for construction options.
@class jayus.Path
@extends jayus.Shape
*/

//#ifdef DEBUG
jayus.debug.className = 'Path';
//#endif

jayus.Path = jayus.Shape.extend({

	//
	//  Properties
	//______________//

	shapeType: 16,

	/**
	An array of the path segments.
	<br> Each segment is represented by an array, containing the command name followed by its arguments.
	<br> Do not modify.
	@property {Array} segments
	*/

	segments: null,

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

	frame: null,

	frameDirty: true,

	//
	//  Methods
	//___________//

	/**
	Initiates the path.
	<br> An SVG path string may also be specified.
	@method init
	@param {String} pathString Optional
	*/

	init: function Path_init(pathString){
		this.segments = [];
		if(arguments.length){
			//#ifdef DEBUG
			jayus.debug.match('Path.init', pathString, 'pathString', jayus.TYPES.STRING);
			//#endif
			this.addSVS(pathString);
		}
	},

		//
		//  Position
		//____________//

	//@ From Shape
	translate: function Path_translate(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Path.translate', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		for(var i=0;i<this.segments.length;i++){
			this.moveSegment(i, x, y);
		}
		return this;
	},

	//@ From Shape
	alignToCanvas: function Path_alignToCanvas(){
		// TODO: Can anything be done here?
		return this;
	},

		//
		//  Frame
		//_________//

	getScope: function Path_getScope(){
		if(this.segments.length === 0){
			return null;
		}
		this.reformFrame();
		return new jayus.Rectangle(this.x1, this.y1, this.x2-this.x1, this.y2-this.y1);
	},

	reformFrame: function Path_reformFrame(){

		var i, x, y, point,
			x1 = null,
			x2 = null,
			y1 = null,
			y2 = null;

		for(i=0;i<this.segments.length;i++){

			// FIXME!

			point = this.getPoint(i);
			x = point.x;
			y = point.y;

			if(x1 === null || x < x1){
				x1 = x;
			}
			if(x2 === null || x > x2){
				x2 = x;
			}
			if(y1 === null || y < y1){
				y1 = y;
			}
			if(y2 === null || y > y2){
				y2 = y;
			}

		}

		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

	},

		//
		//  Intersection
		//________________//

	//@ From Shape
	intersectsAt: function Path_intersectsAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Path.intersectsAt', x, y);
		//#endif
		var ctx = jayus.getContext();
		ctx.save();
		this.etchOntoContext(ctx);
		var ret = ctx.isPointInPath(x, y);
		ctx.restore();
		return ret;
	},

		//
		//  Tracing
		//___________//

	/**
	Sets the current point on the path.
	@method {Self} moveTo
	@param {Number} x
	@param {Number} y
	*/

	moveTo: function Path_moveTo(x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.moveTo', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#endif
		return this.addSegment(['moveTo', x, y]);
	},

	/**
	Sets the current point on the path.
	<br> The new current point is positioned relative to the current point.
	@method {Self} moveBy
	@param {Number} x
	@param {Number} y
	*/

	moveBy: function Path_moveBy(x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.moveBy', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#endif
		var pos = this.getCurrentPoint();
		return this.moveTo(pos.x+x, pos.y+y);
	},

	/**
	Closes the path.
	@method {Self} closePath
	*/

	closePath: function Path_closePath(){
		return this.addSegment(['closePath']);
	},

	/**
	Adds a line to the path.
	<br> The line is traced from the current point to the given end point.
	@method {Self} lineTo
	@param {Number} x
	@param {Number} y
	*/

	lineTo: function Path_lineTo(x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.lineTo', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#endif
		return this.addSegment(['lineTo', x, y]);
	},

	/**
	Adds a line to the path.
	<br> The line is traced from the current point to the given end point.
	<br> The end point is positioned relative to the current point.
	@method {Self} lineBy
	@param {Number} x
	@param {Number} y
	*/

	lineBy: function Path_lineBy(x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.lineBy', arguments, jayus.TYPES.NUMBER, 'x', 'y');
		//#endif
		var pos = this.getCurrentPoint();
		return this.lineTo(pos.x+x, pos.y+y);
	},

	/**
	Adds a quadratic curve to the path.
	<br> The curve is defined by its control point and the end point.
	@method {Self} quadraticCurveTo
	@param {Number} cp1
	@param {Number} cp1
	@param {Number} x
	@param {Number} y
	*/

	quadraticCurveTo: function Path_quadraticCurveTo(cpx, cpy, x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.quadraticCurveTo', arguments, jayus.TYPES.NUMBER, 'cpx', 'cpy', 'x', 'y');
		//#endif
		return this.addSegment(['quadraticCurveTo', cpx, cpy, x, y]);
	},

	/**
	Adds a quadratic curve to the path.
	<br> The curve is defined by its control point and the end point.
	<br> The control and end points are positioned relative to the current point.
	@method {Self} quadraticCurveBy
	@param {Number} cp1
	@param {Number} cp1
	@param {Number} x
	@param {Number} y
	*/

	quadraticCurveBy: function Path_quadraticCurveBy(cpx, cpy, x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.quadraticCurveBy', arguments, jayus.TYPES.NUMBER, 'cpx', 'cpy', 'x', 'y');
		//#endif
		var pos = this.getCurrentPoint();
		return this.quadraticCurveTo(pos.x+cpx, pos.y+cpy, pos.x+x, pos.y+y);
	},

	/**
	Adds a bezier curve to the path.
	<br> The curve is defined by its two control points and the end point.
	@method {Self} bezierCurveTo
	@param {Number} cp1x
	@param {Number} cp1y
	@param {Number} cp2x
	@param {Number} cp2y
	@param {Number} x
	@param {Number} y
	*/

	bezierCurveTo: function Path_bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.bezierCurveTo', arguments, jayus.TYPES.NUMBER, 'cp1x', 'cp1y', 'cp2x', 'cp2y', 'x', 'y');
		//#endif
		return this.addSegment(['bezierCurveTo',cp1x, cp1y, cp2x, cp2y, x, y]);
	},

	/**
	Adds a bezier curve to the path.
	<br> The curve is defined by its two control points and the end point.
	<br> The control points and the end point are positioned relative to the current point.
	@method {Self} bezierCurveBy
	@param {Number} cp1x
	@param {Number} cp1y
	@param {Number} cp2x
	@param {Number} cp2y
	@param {Number} x
	@param {Number} y
	*/

	bezierCurveBy: function Path_bezierCurveBy(cp1x, cp1y, cp2x, cp2y, x, y){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.bezierCurveBy', arguments, jayus.TYPES.NUMBER, 'cp1x', 'cp1y', 'cp2x', 'cp2y', 'x', 'y');
		//#endif
		var pos = this.getCurrentPoint();
		return this.bezierCurveTo(pos.x+cp1x, pos.y+cp1y, pos.x+cp2x, pos.y+cp2y, pos.x+x, pos.y+y);
	},

	/**
	Adds an arc to the path.
	<br> The curve is defined by its two control points and the end point.
	@method {Self} arcTo
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	@param {Number} x
	@param {Number} y
	*/

	arcTo: function Path_arcTo(x1, y1, x2, y2, radius){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.arcTo', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2', 'radius');
		//#endif
		return this.addSegment(['arcTo', x1, y1, x2, y2, radius]);
	},

	/**
	Adds an arc to the path.
	<br> The curve is defined by its two control points and the end point.
	<br> The control points and the end point are positioned relative to the current point.
	<br> A line is drawn from the current point to the starting point of the arc if they are not equivalent.
	@method {Self} arcBy
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	@param {Number} x
	@param {Number} y
	*/

	arcBy: function Path_arcBy(x1, y1, x2, y2, radius){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.arcBy', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2', 'radius');
		//#endif
		var pos = this.getCurrentPoint();
		return this.arcTo(pos.x+x1, pos.y+y1, pos.x+x2, pos.y+y2, radius);
	},

	/**
	Adds an arc to the path.
	<br> The arc is defined by its center, radius, and start/end angle.
	<br> A line is drawn from the current point to the starting point of the arc if they are not equivalent.
	<br> Sets the current point as the ending point on the arc.
	@method {Self} arc
	@param {Number} x
	@param {Number} y
	@param {Number} radius
	@param {Number} startAngle
	@param {Number} endAngle
	@param {Boolean} anticlockwise
	*/

	arc: function Path_arc(x, y, radius, startAngle, endAngle, anticlockwise){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Path.arc', arguments,
			'x', jayus.TYPES.NUMBER,
			'y', jayus.TYPES.NUMBER,
			'radius', jayus.TYPES.NUMBER,
			'startAngle', jayus.TYPES.NUMBER,
			'endAngle', jayus.TYPES.NUMBER,
			'anticlockwise', jayus.TYPES.BOOLEAN
		);
		//#endif
		return this.addSegment(['arc', x, y, radius, startAngle, endAngle, anticlockwise]);
	},

	/**
	Adds a rectangle to the path.
	<br> The arc is defined by its origin and size.
	<br> A line is drawn from the current point to the origin of the rect if they are not equivalent.
	<br> Sets the current point as the origin of the rectangle.
	@method {Self} rect
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/

	rect: function Path_rect(x, y, width, height){
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('Path.rect', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
		//#endif
		return this.addSegment(['rect', x, y, width, height]);
	},

	/**
	UNIMPLEMENTED<br>
	Adds an ellipse to the path.
	@method {Self} ellipse
	@param {Number} x
	@param {Number} y
	@param {Number} radiusX
	@param {Number} radiusY
	@param {Number} rotation
	@param {Number} startAngle
	@param {Number} endAngle
	@param {Boolean} anticlockwise
	*/

	ellipse: function Path_ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Path.ellipse',arguments,
			'x', jayus.TYPES.NUMBER,
			'y', jayus.TYPES.NUMBER,
			'radiusX', jayus.TYPES.NUMBER,
			'radiusY', jayus.TYPES.NUMBER,
			'startAngle', jayus.TYPES.NUMBER,
			'endAngle', jayus.TYPES.NUMBER,
			'anticlockwise', jayus.TYPES.BOOLEAN
		);
		//#endif
		return this.addSegment(['ellipse', x, y, radiusX, radiusY, startAngle, endAngle, anticlockwise]);
	},

	/**
	Adds a horizontal line to the path.
	<br> The line is traced from the current point to the given end point.
	@method {Self} horizontalLineTo
	@param {Number} x
	*/

	horizontalLineTo: function Path_horizontalLineTo(x){
		//#ifdef DEBUG
		jayus.debug.match('Path.horizontalLineTo', x, 'x', jayus.TYPES.NUMBER);
		//#endif
		return this.lineTo(x, this.getCurrentPoint().y);
	},

	/**
	Adds a horizontal line to the path.
	<br> The line is traced from the current point to the given end point.
	<br> The end point is positioned relative to the current point.
	@method {Self} horizontalLineBy
	@param {Number} x
	*/

	horizontalLineBy: function Path_horizontalLineBy(x){
		//#ifdef DEBUG
		jayus.debug.match('Path.horizontalLineBy', x, 'x', jayus.TYPES.NUMBER);
		//#endif
		return this.lineBy(x, 0);
	},

	/**
	Adds a vertical line to the path.
	<br> The line is traced from the current point to the given end point.
	@method {Self} verticalLineTo
	@param {Number} y
	*/

	verticalLineTo: function Path_verticalLineTo(y){
		//#ifdef DEBUG
		jayus.debug.match('Path.verticalLineTo', y, 'y', jayus.TYPES.NUMBER);
		//#endif
		return this.lineTo(this.getCurrentPoint().x, y);
	},

	/**
	Adds a vertical line to the path.
	<br> The line is traced from the current point to the given end point.
	<br> The end point is positioned relative to the current point.
	@method {Self} verticalLineBy
	@param {Number} y
	*/

	verticalLineBy: function Path_verticalLineBy(y){
		//#ifdef DEBUG
		jayus.debug.match('Path.verticalLineBy', y, 'y', jayus.TYPES.NUMBER);
		//#endif
		return this.lineBy(0, y);
	},

	addSegment: function Path_addSegment(data){
		// Push the segment data
		this.segments.push(data);
		return this;
	},

		//
		//  End Points
		//______________//

	/**
	Returns the initial point of the first segment.
	@method {Point} getInitialPoint
	*/

	getInitialPoint: function Path_getInitialPoint(){
		return this.getPoint(0);
	},

	/**
	Returns the ending point of the last segment.
	@method {Point} getCurrentPoint
	*/

	getCurrentPoint: function Path_getCurrentPoint(){
		return this.getPoint(this.segments.length-1);
	},

	/**
	Returns the ending point of the given segment.
	@method {Point} getPoint
	@param {Number} index
	*/

	getPoint: function Path_getPoint(index){
		if(this.hasPointIndex(index)){
			var segment = this.segments[index];
			switch(segment[0]){

				case 'moveTo':
					return new jayus.Point(segment[1], segment[2]);

				case 'closePath':
					return this.getInitialPoint();

				case 'lineTo':
					return new jayus.Point(segment[1], segment[2]);

				case 'quadraticCurveTo':
					return new jayus.Point(segment[3], segment[4]);

				case 'bezierCurveTo':
					return new jayus.Point(segment[5], segment[6]);

				case 'arcTo':
					return jayus.getFinalArcToPoint(this, segment);

				case 'arc':
					var cx = segment[1],
						cy = segment[2],
						r = segment[3],
						startAngle = segment[4],
						endAngle = segment[5],
						anticlockwise = segment[6];
					// Move r units from the center towards endAngle
					return new jayus.Point(cx+r*Math.cos(endAngle), cy+r*Math.sin(endAngle));

				case 'rect':
					return this.getPoint(index-1);

				case 'ellipse':
					throw new Error('Path.getPoint() - Unimplemented for "ellipse"');

			}
		}
		else{
			throw new RangeError('Path.getPoint() - Invalid index sent: '+index);
		}
	},

	/**
	Adds the segments described by the given SVG pathstring to the path.
	<br> Some commands are not implemented yet.
	@method {Self} addSVG
	@param {String} path
	*/

	addSVG: function Path_addSVG(path){
		var i, segment,
			data = this.parsePathString(path);
		for(i=0;i<data.length;i++){
			segment = data[i];
			switch(segment[0]){

				case 'M':
					this.moveTo(segment[1], segment[2]);
					break;

				case 'm':
					this.moveBy(segment[1], segment[2]);
					break;

				case 'Z':
				case 'z':
					this.closePath();
					break;

				case 'L':
					this.lineTo(segment[1], segment[2]);
					break;

				case 'l':
					this.lineBy(segment[1], segment[2]);
					break;

				case 'H':
					this.horizontalLineTo(segment[1]);
					break;

				case 'h':
					this.horizontalLineBy(segment[1]);
					break;

				case 'V':
					this.verticalLineTo(segment[1]);
					break;

				case 'v':
					this.verticalLineBy(segment[1]);
					break;

				case 'C':
					this.bezierCurveTo(segment[1], segment[2], segment[3], segment[4], segment[5], segment[6]);
					break;

				case 'c':
					this.bezierCurveBy(segment[1], segment[2], segment[3], segment[4], segment[5], segment[6]);
					break;

				case 'S':
				case 's':
					throw new Error('Path.addSVG() - Unimplemented for S/s commands');

				case 'Q':
					this.quadraticCurveTo(segment[1], segment[2], segment[3], segment[4]);
					break;

				case 'q':
					this.quadraticCurveBy(segment[1], segment[2], segment[3], segment[4]);
					break;

				case 'T':
				case 't':
					throw new Error('Path.addSVG() - Unimplemented for T/t commands');

				case 'A':
				case 'a':
					throw new Error('Path.addSVG() - Unimplemented for A/a commands');

				case 'R':
				case 'r':
					throw new Error('Path.addSVG() - Unimplemented for R/r commands');

			}
		}
	},

	parsePathString: function Path_parsePathString(path){
		path = path.replace(/ /g,',').replace(/-/g,',-');
		path = path.replace(/[MmZzLlHhVvCcSsQqTtAaRr]/g, function(match){
			return ','+match+',';
		});
		path = path.split(',');
		var i, item,
			paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
			segment,
			data = [],
			paramsNeeded = 0;
		for(i=0;i<path.length;i++){
			item = path[i];
			if(item !== ''){
				if(paramsNeeded === 0){
					if(paramCounts.hasOwnProperty(item.toLowerCase())){
						segment = [item];
						paramsNeeded = paramCounts[item.toLowerCase()];
						data.push(segment);
					}
					else{
						return 'ERROR: expected command, got: '+item;
					}
				}
				else{
					var param = parseFloat(item);
					if(!isNaN(param)){
						segment.push(param);
						paramsNeeded--;
					}
					else{
						return 'ERROR: expected parameter, got: '+item;
					}
				}
			}
		}
		return data;
	},

		//
		//  Index Checking
		//__________________//

	/**
	Returns the number of segments in the path.
	@method {Number} getSegmentCount
	*/

	getSegmentCount: function Path_getSegmentCount(){
		return this.segments.length;
	},

	/**
	Returns whether the specified point index is valid.
	@method {Boolean} hasPointIndex
	*/

	hasPointIndex: function Path_hasPointIndex(index){
		//#ifdef DEBUG
		jayus.debug.match('Path.hasPointIndex', index, 'index', jayus.TYPES.NUMBER);
		//#endif
		return 0 <= index && index < this.segments.length;
	},

		//
		//  Closure
		//___________//

	/**
	Returns whether the path is closed.
	<br> A path is deemed to be closed if its beginning and end points are equivalent.
	@method {Boolean} isClosed
	*/

	isClosed: function Path_isClosed(){
		return this.getInitialPoint().equals(this.getCurrentPoint());
	},

		//
		//  Utilities
		//_____________//

	//#ifdef DEBUG
	toString: function Path_toString(){
		// Create a new string to pickle into
		var i, str = '(Path:[';
		// Loop through and add the items
		for(i=0;i<this.getSegmentCount();i++){
			str += jayus.debug.toString(this.segments[i]);
		}
		// Return the closed string
		return str+'])';
	},
	//#endif

	//@ From Shape
	clone: function Path_clone(){
		var i, j, segment,
			newSegment,
			newSegments = [];
		for(i=0;i<this.segments.length;i++){
			segment = this.segments[i];
			newSegment = [];
			for(j=0;j<segment.length;j++){
				newSegment.push(segment[j]);
			}
			newSegments.push(newSegment);
		}
		var path = new jayus.Path();
		path.segments = newSegments;
		return path;
	},

	//@ From Shape
	getTransformed: function Path_getTransformed(matrix){
		var i, segment,
			newSegment, temp,
			newSegments = [];
		for(i=0;i<this.segments.length;i++){
			segment = this.segments[i];
			newSegment = [segment[0]];
			newSegments.push(newSegment);
			switch(segment[0]){

				case 'moveTo':
					temp = matrix.transformPoint(segment[1], segment[2]);
					newSegment[1] = temp.x;
					newSegment[2] = temp.y;
					break;

				case 'closePath':
					break;

				case 'lineTo':
					temp = matrix.transformPoint(segment[1], segment[2]);
					newSegment[1] = temp.x;
					newSegment[2] = temp.y;
					break;

				case 'quadraticCurveTo':
					temp = matrix.transformPoint(segment[1], segment[2]);
					newSegment[1] = temp.x;
					newSegment[2] = temp.y;
					temp = matrix.transformPoint(segment[3], segment[4]);
					newSegment[3] = temp.x;
					newSegment[4] = temp.y;
					break;

				case 'bezierCurveTo':
					temp = matrix.transformPoint(segment[1], segment[2]);
					newSegment[1] = temp.x;
					newSegment[2] = temp.y;
					temp = matrix.transformPoint(segment[3], segment[4]);
					newSegment[3] = temp.x;
					newSegment[4] = temp.y;
					temp = matrix.transformPoint(segment[5], segment[6]);
					newSegment[5] = temp.x;
					newSegment[6] = temp.y;
					break;

				case 'arcTo':
				case 'arc':
				case 'rect':
				case 'ellipse':
					throw new Error('Path.getTransformed() - Unimplemented for command '+segment[0]);

			}
		}
	},

		//
		//  Rendering
		//_____________//

	//@ From Shape
	etchOntoContext: function Path_etchOntoContext(ctx){
		//Clear the path
		ctx.beginPath();
		// Keep vars for the current position
		var i, segment,
			point = this.getPoint(0),
			x = point.x,
			y = point.y;
		//Loop through the segments
		for(i=0;i<this.segments.length;i++){
			segment = this.segments[i];
			// Switch on the segment types
			switch(segment[0]){

				// moveTo
				case 'moveTo':
					x = segment[1];
					y = segment[2];
					ctx.moveTo(x, y);
					break;

				// closePath
				case 'closePath':
					ctx.closePath();
					break;

				// lineTo
				case 'lineTo':
					x = segment[1];
					y = segment[2];
					ctx.lineTo(x, y);
					break;

				// bezierCurveTo
				case 'bezierCurveTo':
					x = segment[5];
					y = segment[6];
					ctx.bezierCurveTo(
						segment[1], segment[2],			// control point 1
						segment[3], segment[4],			// control point 2
						x, y							// end point
					);
					break;

				// quadraticCurveTo
				case 'quadraticCurveTo':
					x = segment[3];
					y = segment[4];
					ctx.quadraticCurveTo(
						segment[1], segment[2],			// control point
						x, y							// end point
					);
					break;

				// arcTo
				case 'arcTo':
					ctx.arcTo(
						segment[1], segment[2],			// control point 1
						segment[3], segment[4],			// control point 2
						segment[5]						// radius
					);
					point = this.getPoint(i);
					x = point.x;
					y = point.y;
					break;

				// arc
				case 'arc':
					ctx.arc(
						segment[1], segment[2],			// center point
						segment[3],						// radius
						segment[4],	segment[5],			// start/end angle
						segment[6]						// anticlockwise
					);
					point = this.getPoint(i);
					x = point.x;
					y = point.y;
					break;

				// rect
				case 'rect':
					x = segment[1];
					y = segment[2];
					ctx.rect(
						x, y,							// origin
						segment[3], segment[4]			// width/height
					);
					break;

				case 'ellipse':
					throw new Error('Path.etchOntoContext() - Unimplemented for command ellipse');

			}
		}
		return this;
	}

});

/**
Returns a path comprised of the specified circle.
@function {Path} jayus.Path.Circle
@paramset 1
@param {Point} center
@param {Number} radius
@paramset 2
@param {Number} x
@param {Number} y
@param {Number} radius
*/

jayus.Path.Circle = function Path_Circle(x, y, radius){
	if(arguments.length === 2){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Path.Circle()', arguments, 'center', jayus.TYPES.POINT, 'radius', jayus.TYPES.NUMBER);
		//#endif
		radius = x;
		y = x.y;
		x = x.x;
	}
	//#ifdef DEBUG
	else{
		jayus.debug.matchArgumentsAs('Path.Circle()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'radius');
	}
	//#endif
	return new jayus.Path().arc(x, y, radius, 0, Math.PI*2, false);
};

/**
Returns a path comprised of the specified rectangle.
@function {Path} jayus.Path.Rectangle
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

jayus.Path.Rectangle = function Path_Rectangle(x, y, width, height){
	if(arguments.length === 3){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Path.Rectangle()', arguments, 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
		//#endif
		height = width;
		width = y;
		y = x.y;
		x = x.x;
	}
	//#ifdef DEBUG
	else{
		jayus.debug.matchArgumentsAs('Path.Rectangle()', arguments, jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
	}
	//#endif
	return new jayus.Path().rect(x, y, width, height);
};

jayus.getFinalArcToPoint = function jayus_getFinalArcToPoint(path, segment){
	var p0 = path.getPoint(segment-1);
	var x0 = p0.x,
		y0 = p0.y,
		x1 = segment[1],
		y1 = segment[2],
		x2 = segment[3],
		y2 = segment[4],
		r = segment[5];
	// Get the angles(absolute) for the two lines
	var angle1 = Math.atan2(y0-y1, x0-x1),
		angle2 = Math.atan2(y1-y2, x1-x2);
	// Get the smaller angle between the 2 angles
	var abs = Math.abs(angle1-angle2);
	var angleDiff = Math.min((Math.PI*2)-abs,abs);
	// Divide the arc angle by 2 to find the circle center
	var u = angleDiff/2;
	var z = r/Math.tan(u);		// Distance from p1 to tangent point of circle on line p1->p0
	// Move z units from p1 to p2 to get the final point
	var x = x1+z*Math.cos(angle2);
	var y = y1+z*Math.sin(angle2);
	return new jayus.Point(x, y);
};

// FIXME: jayus.getPathScope(): This is so broken its not funny

jayus.getPathScope = function jayus_getPathScope(path){

	var i, segment,
		scope = new jayus.Rectangle();

	for(i=0;i<path.segments.length;i++){

		segment = path.segments[i];

		switch(segment[0]){

			// Canvas Path Commands

			// moveTo
			case 'moveTo':
				scope.includeAt(segment[1], segment[2]);
				break;

			// closePath
			case 'closePath':
				break;

			// lineTo
			case 'lineTo':
				scope.includeAt(segment[1], segment[2]);
				break;

			// bezierCurveTo
			case 'bezierCurveTo':
				// FIXME:  Bezier curve scope
				scope.includeAt(segment[1], segment[2]);
				scope.includeAt(segment[3], segment[4]);
				scope.includeAt(segment[5], segment[6]);
				break;

			// quadraticCurveTo
			case 'quadraticCurveTo':
				// FIXME:  Quadratic curve scope
				scope.includeAt(segment[1], segment[2]);
				scope.includeAt(segment[3], segment[4]);
				break;

			// arcTo
			case 'arcTo':
				// FIME: arcTo scope
				break;

			// arc
			case 'arc':
				// FIME: arc scope
				break;

			// rect
			case 'rect':
				var x = segment[1],
					y = segment[2],
					w = segment[3],
					h = segment[4];
				scope.setLeft(Math.max(scope.getLeft(), x));
				scope.setRight(Math.max(scope.getRight(), x+w));
				scope.setTop(Math.max(scope.getTop(), y));
				scope.setBottom(Math.max(scope.getBottom(), y+h));
				break;

			// ellipse
			case 'ellipse':
				// FIXME: ellipse scope
				break;

		}

	}

};