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

//
//  jayus.Gradient()
//____________________//

/**
An abstract class representing a linear or radial gradient.
@class jayus.Gradient
*/

jayus.Gradient = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	/**
	An array of the positions of the color-stops.
	<br> Do not modify.
	@property {Array<Number>} stopPositions
	*/

	stopPositions: null,
	//@replace jayus.Gradient.prototype.stopPositions null

	/**
	An array of the colors of the color-stops.
	<br> Do not modify.
	@property {Array} stopColors
	*/

	stopColors: null,
	//@replace jayus.Gradient.prototype.stopColors null

	/**
	The native canvas version of this gradient.
	<br> Do not modify.
	@property {CanvasGradient} nativeGradient
	*/

	nativeGradient: null,

	/**
	Whether the native gradient object needs to be reformed.
	<br> Do not modify.
	@property {Boolean} reformNative
	*/

	reformNative: true,

	//
	//  Methods
	//___________//

	//@ From Parsable
	toObject: function Gradient_toObject() {
		var object = {
			type: 'Gradient'
		};
		// Apply our own properties
		if(this.stopPositions !== jayus.Gradient.prototype.stopPositions) {
			object.stopPositions = this.stopPositions;
		}
		if(this.stopColors !== jayus.Gradient.prototype.stopColors) {
			object.stopColors = this.stopColors.toObject();
		}
		// Apply the id
		if(this.id !== jayus.Dependency.prototype.id) {
			object.id = this.id;
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function Gradient_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Gradient.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		if(typeof object.stopPositions === 'object') {
			this.stopPositions = object.stopPositions;
		}
		if(typeof object.stopColors === 'object') {
			this.stopColors = object.stopColors;
		}
		// Set as dirty
		this.reformNative = true;
		return this.dirty(jayus.DIRTY.ALL);
	},

	componentDirtied: function Gradient_componentDirtied(component, type) {
		this.reformNative = true;
		this.dirty(jayus.DIRTY.STYLE);
	},

	/**
	Translates the gradient.
	<br> Note that because the start and end objects of the gradient are kept as references, this method just translates both of them.
	@method {Self} translate
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	translate: function Gradient_translate(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Gradient.translate', x, y);
		//#end
		if(arguments.length === 1) {
			return this.translate(x.x, x.y);
		}
		this.start.translate(x, y);
		this.end.translate(x, y);
		this.dirty(jayus.DIRTY.ALL);
		return this;
	},

	/**
	Adds a color-stop to the gradient.
	@method {Self} addColorStop
	@param {Number} position
	@param {String|jayus.Color} color
	*/

	addColorStop: function Gradient_addColorStop(position, color) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Gradient.addColorStop', arguments, 'position', jayus.TYPES.NUMBER, 'color', jayus.TYPES.DEFINED);
		//#end
		this.stopPositions.push(position);
		this.stopColors.push(color);
		return this;
	},

	/**
	Returns the native canvas gradient object for this gradient.
	@method {CanvasGradient} getNative
	*/

	getNative: function Gradient_getNative() {
		// Reform if needed
		if(this.reformNative) {
			this.refresh();
			this.reformNative = false;
		}
		return this.nativeGradient;
	}

});

//
//  jayus.LinearGradient()
//__________________________//

/**
Represents a standard linear gradient, for use as a brush style.
@class jayus.LinearGradient
@extends jayus.Gradient
*/

jayus.LinearGradient = jayus.Gradient.extend({

	//
	//  Properties
	//______________//

	/*
	The starting point.
	@property {Point} start
	*/

	start: null,
	//#replace jayus.LinearGradient.prototype.start null

	/*
	The ending point.
	@property {Point} end
	*/

	end: null,
	//#replace jayus.LinearGradient.prototype.end null

	//
	//  Methods
	//___________//

	/**
	Initializes the linear gradient.
	@method init
	@paramset 1
	@param {Point} start
	@param {Point} end
	@paramset 2
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	*/

	init: function LinearGradient(x1, y1, x2, y2) {
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('LinearGradient', arguments, 'start', jayus.TYPES.POINT, 'end', jayus.TYPES.POINT);
			//#end
			this.stopPositions = [];
			this.stopColors = [];
			this.start = x1;
			this.start.attach(this);
			this.end = y1;
			this.end.attach(this);
		}
		else if(arguments.length === 4) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('LinearGradient', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2');
			//#end
			this.init(new jayus.Point(x1, y1), new jayus.Point(x2, y2));
		}
	},

	//@ From Parsable
	toObject: function LinearGradient_toObject() {
		var object = jayus.Gradient.prototype.toObject.apply(this);
		// Apply our own properties
		object.type = 'LinearGradient';
		if(this.start !== jayus.LinearGradient.prototype.start) {
			object.start = this.start.toObject();
		}
		if(this.end !== jayus.LinearGradient.prototype.end) {
			object.end = this.end.toObject();
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function LinearGradient_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('LinearGradient.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		jayus.Gradient.prototype.initFromObject.call(this, object);
		if(typeof object.start === 'object') {
			this.start = new jayus.Point().initFromObject(object.start);
		}
		if(typeof object.end === 'object') {
			this.end = new jayus.Point().initFromObject(object.end);
		}
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	//@ From Gradient
	refresh: function LinearGradient_refresh() {
		var i, color;
		this.nativeGradient = jayus.getContext().createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
		for(i=this.stopPositions.length-1;i>=0;i--) {
			color = this.stopColors[i];
			if(color instanceof jayus.Color) {
				color = color.toCSS();
			}
			this.nativeGradient.addColorStop(this.stopPositions[i], color);
		}
		return this;
	}

});

//
//  jayus.RadialGradient()
//__________________________//

/**
Represents a radial gradient, for use as a brush style.
@class jayus.RadialGradient
@extends jayus.Gradient
*/

jayus.RadialGradient = jayus.Gradient.extend({

	//
	//  Properties
	//______________//

	/*
	The starting circle.
	@property {Circle} start
	*/

	start: null,

	/*
	The ending circle.
	@property {Circle} end
	*/

	end: null,

	//
	//  Methods
	//___________//

	/**
	Initializes the radial gradient.
	@method init
	@paramset 1
	@param {Circle} start
	@param {Circle} end
	@paramset 2
	@param {Circle} start
	@param {Number} r1
	@param {Circle} end
	@param {Number} r2
	@paramset 3
	@param {Number} cx1
	@param {Number} cy1
	@param {Number} r1
	@param {Number} cx2
	@param {Number} cy2
	@param {Number} r2
	*/

	init: function RadialGradient(cx1, cy1, r1, cx2, cy2, r2) {
		this.stopPositions = [];
		this.stopColors = [];
		var start, end;
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('RadialGradient', [cx1, cy1], 'cx1', jayus.TYPES.CIRCLE, 'cx2', jayus.TYPES.CIRCLE);
			//#end
			start = cx1;
			end = cy1;
		}
		else if(arguments.length === 4) {
			//#ifdef DEBUG
			jayus.debug.matchArguments('RadialGradient', [cx1, cy1, r1, cx2], 'cx1', jayus.TYPES.POINT, 'cy1', jayus.TYPES.NUMBER, 'r1', jayus.TYPES.POINT, 'cx2', jayus.TYPES.NUMBER);
			//#end
			start = new jayus.Circle(cx1, cy1);
			end = new jayus.Circle(r1, cx2);
		}
		else {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('RadialGradient', arguments, jayus.TYPES.NUMBER, 'cx1', 'cy1', 'r1', 'cx2', 'cy2', 'r2');
			//#end
			start = new jayus.Circle(cx1, cy1, r1);
			end = new jayus.Circle(cx2, cy2, r2);
		}
		start.attach(this);
		this.start = start;
		end.attach(this);
		this.end = end;
	},

	//@ From Parsable
	toObject: function RadialGradient_toObject() {
		var object = jayus.Gradient.prototype.toObject.apply(this);
		// Apply our own properties
		object.type = 'RadialGradient';
		if(this.start !== jayus.RadialGradient.prototype.start) {
			object.start = this.start.toObject();
		}
		if(this.end !== jayus.RadialGradient.prototype.end) {
			object.end = this.end.toObject();
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function RadialGradient_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('RadialGradient.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		jayus.Gradient.prototype.initFromObject.call(this, object);
		if(typeof object.start === 'object') {
			this.start = new jayus.Circle(object.start);
		}
		if(typeof object.end === 'object') {
			this.end = new jayus.Circle(object.end);
		}
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	//@ From Gradient
	refresh: function RadialGradient_refresh() {
		var i, color;
		this.nativeGradient = jayus.getContext().createRadialGradient(this.start.x, this.start.y, this.start.radius, this.end.x, this.end.y, this.end.radius);
		for(i=this.stopPositions.length-1;i>=0;i--) {
			color = this.stopColors[i];
			if(color instanceof jayus.Color) {
				color = color.toCSS();
			}
			this.nativeGradient.addColorStop(this.stopPositions[i], color);
		}
		return this;
	}

});