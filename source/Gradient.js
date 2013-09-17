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

//#ifdef DEBUG
jayus.debug.className = 'Gradient';
//#endif

jayus.Gradient = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	componentType: 'GRADIENT',

	/**
	An array of the positions of the color-stops.
	<br> Do not modify.
	@property {Array<Number>} stopPositions
	*/

	stopPositions: null,

	/**
	An array of the colors of the color-stops.
	<br> Do not modify.
	@property {Array} stopColors
	*/

	stopColors: null,

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

	componentDirtied: function Gradient_componentDirtied(componentType, component, type){
		this.reformNative = true;
		this.dirty(jayus.DIRTY.STYLE);
	},

	//@ From Gradient
	translate: function LinearGradient_translate(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('LinearGradient.translate', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
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

	addColorStop: function Gradient_addColorStop(position, color){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Gradient.addColorStop', arguments, 'position', jayus.TYPES.NUMBER, 'color', jayus.TYPES.DEFINED);
		//#endif
		this.stopPositions.push(position);
		this.stopColors.push(color);
		return this;
	},

	/**
	Returns the native canvas gradient object for this gradient.
	@method {CanvasGradient} getNative
	*/

	getNative: function Gradient_getNative(){
		// Reform if needed
		if(this.reformNative){
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

//#ifdef DEBUG
jayus.debug.className = 'LinearGradient';
//#endif

jayus.LinearGradient = jayus.Gradient.extend({

	//
	//  Properties
	//______________//

	/*
	The starting point.
	@property {Point} start
	*/

	start: null,

	/*
	The ending point.
	@property {Point} end
	*/

	end: null,

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

	init: overloadArgumentCount({

		2: function LinearGradient_init(start, end){
			//#ifdef DEBUG
			jayus.debug.matchArguments('LinearGradient.init', arguments, 'start', jayus.TYPES.POINT, 'end', jayus.TYPES.POINT);
			//#endif
			this.stopPositions = [];
			this.stopColors = [];
			this.start = start;
			this.start.attach(this);
			this.end = end;
			this.end.attach(this);
		},

		4: function LinearGradient_init(x1, y1, x2, y2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('LinearGradient.init', arguments, jayus.TYPES.NUMBER, 'x1', 'y1', 'x2', 'y2');
			//#endif
			this.init(new jayus.Point(x1, y1), new jayus.Point(x2, y2));
		}

	}),

	//@ From Gradient
	refresh: function LinearGradient_refresh(){
		var i, color;
		this.nativeGradient = jayus.getContext().createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
		for(i=0;i<this.stopPositions.length;i++){
			color = this.stopColors[i];
			if(color instanceof jayus.Color){
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

//#ifdef DEBUG
jayus.debug.className = 'RadialGradient';
//#endif

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

	init: overloadArgumentCount({

		2: function RadialGradient_init(start, end){
			//#ifdef DEBUG
			jayus.debug.matchArguments('RadialGradient.init', arguments, 'start', jayus.TYPES.CIRCLE, 'end', jayus.TYPES.CIRCLE);
			//#endif
			this.stopPositions = [];
			this.stopColors = [];
			this.start = start;
			this.start.attach(this);
			this.end = end;
			this.end.attach(this);
		},

		4: function RadialGradient_init(start, r1, end, r2){
			//#ifdef DEBUG
			jayus.debug.matchArguments('RadialGradient.init', arguments, 'start', jayus.TYPES.POINT, 'r1', jayus.TYPES.NUMBER, 'end', jayus.TYPES.POINT, 'r2', jayus.TYPES.NUMBER);
			//#endif
			this.init(new jayus.Circle(start, r1), new jayus.Circle(end, r2));
		},

		6: function RadialGradient_init(cx1, cy1, r1, cx2, cy2, r2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('RadialGradient.init', arguments, jayus.TYPES.NUMBER, 'cx1', 'cy1', 'r1', 'cx2', 'cy2', 'r2');
			//#endif
			this.init(new jayus.Circle(cx1, cy1, r1), new jayus.Circle(cx2, cy2, r2));
		}

	}),

	//@ From Gradient
	refresh: function RadialGradient_refresh(){
		var i, color;
		this.nativeGradient = jayus.getContext().createRadialGradient(this.start.x, this.start.y, this.start.radius, this.end.x, this.end.y, this.end.radius);
		for(i=0;i<this.stopPositions.length;i++){
			color = this.stopColors[i];
			if(color instanceof jayus.Color){
				color = color.toCSS();
			}
			this.nativeGradient.addColorStop(this.stopPositions[i], color);
		}
		return this;
	}

});