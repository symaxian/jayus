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
//  jayus.Color()
//_________________//

/**
Represents a 32 bit RGBA color.
@class jayus.Color
@extends jayus.Dependency
*/

//#ifdef DEBUG
jayus.debug.className = 'Color';
//#endif

jayus.Color = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	componentType: 'COLOR',

	/**
	The red color component.
	<br> Range is 0-255.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} r
	*/

	r: 0,

	/**
	The green color component.
	<br> Range is 0-255.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} g
	*/

	g: 0,

	/**
	The blue color component.
	<br> Range is 0-255.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} b
	*/

	b: 0,

	/**
	The alpha component.
	<br> Range is 0-1.
	<br> Default is 1.
	<br> Do not modify.
	@property {Number} a
	*/

	a: 1,

	//
	//  Methods
	//___________//

	/**
	Initiates the color.
	<br> The default color is black.
	@constructor init
	@paramset Syntax 1
	@param {String} name
	@param {Number} alpha Optional
	@paramset Syntax 2
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@param {Number} a Optional
	*/

	init: function Color_init(){
		if(arguments.length){
			this.set.apply(this, arguments);
		}
	},

		//
		//  Color
		//_________//

	/**
	Sets the color.
	<br> Can be animated.
	@method {Self} set
	@paramset Syntax 1
	@param {String} name
	@param {Number} alpha Optional
	@paramset Syntax 2
	@param {Number} r
	@param {Number} g
	@param {Number} b
	@param {Number} a Optional
	*/

	set: function Color_set(r, g, b, a){
		switch(arguments.length){

			case 1:
				g = 1;

			case 2:
				//#ifdef DEBUG
				jayus.debug.matchArguments('Color.set', arguments, 'name', jayus.TYPES.STRING, 'alpha', jayus.TYPES.NUMBER);
				//#endif
				// Get the display name index
				var index = jayus.colors.displayNames.indexOf(r);
				// Else get the functional name index
				if(index < 0){
					index = jayus.colors.cssNames.indexOf(r);
				}
				// Set the color if the index is valid
				if(index+1){
					this.set(jayus.colors.redComponents[index], jayus.colors.greenComponents[index], jayus.colors.blueComponents[index], g);
				}
				return this;

			case 3:
				a = 1;

			case 4:
				//#ifdef DEBUG
				jayus.debug.matchArgumentsAs('Color.set', arguments, jayus.TYPES.NUMBER, 'r', 'g', 'b', 'a');
				//#endif
				// Check if animated
				if(this.actionsToAnimate){
					// Clear the animate flag and return the animator
					this.actionsToAnimate--;
					return new jayus.MethodAnimator(this, this.set, [this.r, this.g, this.b, this.a], [r, g, b, a]);
				}
				// Set the properties
				this.r = r;
				this.g = g;
				this.b = b;
				this.a = a;
				return this;

		}
		//#ifdef DEBUG
		throw new Error('Color.set() - Invalid number of arguments sent, 1, 2, 3, or 4 required');
		//#endif
	},

	/**
	Sets the red component.
	<br> Can be animated.
	@method {Self} setRed
	@param {Number} value
	*/

	setRed: function Color_setRed(value){
		//#ifdef DEBUG
		jayus.debug.match('Color.setRed', value, 'value', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setRed, this.r, value);
		}
		// Set the property
		if(this.r !== value){
			this.r = value;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the green component.
	<br> Can be animated.
	@method {Self} setGreen
	@param {Number} value
	*/

	setGreen: function Color_setGreen(value){
		//#ifdef DEBUG
		jayus.debug.match('Color.setGreen', value, 'value', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setGreen, this.g, value);
		}
		// Set the property
		if(this.g !== value){
			this.g = value;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the blue component.
	<br> Can be animated.
	@method {Self} setBlue
	@param {Number} value
	*/

	setBlue: function Color_setBlue(value){
		//#ifdef DEBUG
		jayus.debug.match('Color.setBlue', value, 'value', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setBlue, this.b, value);
		}
		// Set the property
		if(this.b !== value){
			this.b = value;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the alpha component.
	<br> Can be animated.
	@method {Self} setAlpha
	@param {Number} value
	*/

	setAlpha: function Color_setAlpha(value){
		//#ifdef DEBUG
		jayus.debug.match('Color.setAlpha', value, 'value', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setAlpha, this.a, value);
		}
		// Set the property
		if(this.a !== value){
			this.a = value;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

		//
		//  Misc
		//________//

	//#ifdef DEBUG
	toString: function Color_toString(){
		return '(Color:'+this.r+','+this.g+','+this.b+(this.a-1?(','+this.a):'')+')';
	},
	//#endif

	/**
	Returns the hexadecimal representation of the color.
	<br> The leading '#' is included.
	<br> Does not include the alpha component.
	@method {String} toHex
	*/

	toHex: function Color_toHex(){
		// Get the hex values
		var r = this.r.toString(16),
			g = this.g.toString(16),
			b = this.b.toString(16);
		// Return the color components in a string, ensuring that they're at least two characters wide
		return '#' + (r.length === 1 ? '0'+r : r) + (g.length === 1 ? '0'+g : g) + (b.length === 1 ? '0'+b : b);
	},

	/**
	Returns the CSS color string representation of the color.
	@method {String} toCSS
	*/

	toCSS: function Color_toCSS(){
		this.a = jayus.math.clamp(0, this.a, 1);
		if(this.a-1){
			return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
		}
		return 'rgb('+this.r+','+this.g+','+this.b+')';
	},

	/**
	Returns the human-readable name of the color.
	<br> Returns an empty string if the color is not a named color.
	@method {String} getName
	*/

	getName: function Color_getName(){
		var i,
			table = jayus.colorTable;
		for(i=0;i<table.count;i++){
			if(this.r === table.redComponents[i] && this.g === table.greenComponents[i] && this.b === table.blueComponents[i]){
				return table.displayNames[i];
			}
		}
		return '';
	}

});