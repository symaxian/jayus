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
Defines the SpriteSheet class.
@file SpriteSheet.js
*/

//
//  jayus.SpriteSheet()
//_______________________//

/**
An entity that describes a number of sprites and animations for an image.
@class jayus.SpriteSheet
*/

jayus.SpriteSheet = jayus.Dependency.extend({

	/**
	The width of each sprite.
	<br> Default is 32.
	@property {Number} spriteWidth
	*/

	spriteWidth: 32,

	/**
	The height of each sprite.
	<br> Default is 32.
	@property {Number} spriteHeight
	*/

	spriteHeight: 32,

	/**
	The horizontal spacing between each sprite.
	<br> Default is 0.
	@property {Number} spacingX
	*/

	spacingX: 0,

	/**
	The vertical spacing between each sprite.
	<br> Default is 0.
	@property {Number} spacingY
	*/

	spacingY: 0,

	/**
	The initial vertical space before the sprites begin.
	<br> Default is 0.
	@property {Number} marginX
	*/

	marginX: 0,

	/**
	The initial horizontal space before the sprites begin.
	<br> Default is 0.
	@property {Number} marginY
	*/

	marginY: 0,

	/**
	An object of data for defined animations.
	@property {Object} animations
	*/

	animations: null,

	/**
	An object of data for the named sprites, indexed by their name.
	<br> It is generally safe to modify this object directly.
	@property {Object} namedSprites
	*/

	namedSprites: null,

	/**
	Initiates the sprite sheet.
	@constructor SpriteSheet
	@param {String} filepath Optional
	*/

	init: function SpriteSheet(filepath) {
		this.animations = {};
		this.namedSprites = {};
		if(arguments.length) {
			//#ifdef DEBUG
			jayus.debug.match('SpriteSheet', filepath, 'filepath', jayus.TYPES.STRING);
			//#end
			var sheet = this;
			jayus.images.whenLoaded(filepath, function(data) {
				data.image.sheet = sheet;
			});
			// if(jayus.images.isLoaded(filepath)) {
			// 	jayus.images.images[filepath].sheet = this;
			// }
			// else {
			// 	var sheet = this;
			// 	jayus.addHandler('imageLoaded', function(data, options) {
			// 		if(data.filepath === filepath) {
			// 			jayus.images.images[filepath].sheet = sheet;
			// 			options.remove = true;
			// 		}
			// 	});
			// }
		}
	},

		//
		//  Named Sprites
		//_________________//

	/**
	Defines a named sprite.
	@method {Self} nameSprite
	@param {String} name
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/

	nameSprite: function SpriteSheet_nameSprite(name, x, y, width, height) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('SpriteSheet.nameSprite', arguments,
			'name', jayus.TYPES.STRING,
			'x', jayus.TYPES.NUMBER,
			'y', jayus.TYPES.NUMBER,
			'width', jayus.TYPES.NUMBER,
			'height', jayus.TYPES.NUMBER);
		//#end
		this.namedSprites[name] = {
			x: x,
			y: y,
			width: width,
			height: height,
			flipX: false,
			flipY: false
		};
		return this;
	},

	/**
	Sets the horizontal and vertical flipping properties of a named sprite.
	@method {Self} setSpriteFlipping
	@param {String} name
	@param {Boolean} flipX
	@param {Boolean} flipY
	*/

	setSpriteFlipping: function SpriteSheet_setSpriteFlipping(name, flipX, flipY) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('SpriteSheet.setSpriteFlipping', arguments, 'name', jayus.TYPES.STRING, 'flipX', jayus.TYPES.BOOLEAN, 'flipY', jayus.TYPES.BOOLEAN);
		if(typeof this.namedSprites[name] !== 'object') {
			throw new Error('SpriteSheet.setSpriteFlipping() - Unknown sprite name: '+name);
		}
		//#end
		var data = this.namedSprites[name];
		data.flipX = flipX;
		data.flipY = flipY;
		return this;
	},

		//
		//  General Properties
		//______________________//

	/**
	Sets the spriteSize property.
	@method {Self} setSpriteSize
	@paramset 1
	@param {Rectangle|Entity} size
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setSpriteSize: function SpriteSheet_setSpriteSize(width, height) {
		//#ifdef DEBUG
		jayus.debug.matchSize('SpriteSheet.setSpriteSize', width, height);
		//#end
		if(arguments.length === 1) {
			height = width.height;
			width = width.width;
		}
		if(this.spriteWidth !== width || this.spriteHeight !== height) {
			this.spriteWidth = width;
			this.spriteHeight = height;
			this.dirty(jayus.DIRTY.SIZE);
		}
		return this;
	},

	/**
	Sets the spacing property.
	@method {Self} setSpacing
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setSpacing: function SpriteSheet_setSpacing(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('SpriteSheet.setSpacing', x, y);
		//#end
		if(arguments.length === 1) {
			return this.setSpacing(x.x, x.y);
		}
		this.spacingX = x;
		this.spacingY = y;
		return this;
	},

	/**
	Sets the margin property.
	@method {Self} setMargin
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setMargin: function SpriteSheet_setMargin(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('SpriteSheet.setMargin', x, y);
		//#end
		if(arguments.length === 1) {
			return this.setMargin(x.x, x.y);
		}
		this.marginX = x;
		this.marginY = y;
		return this;
	},

		//
		//  Animation
		//_____________//

	/**
	Reteurns whether the spritesheet has the given animation.
	@method {Boolean} hasAnimation
	@param {String} name
	*/

	hasAnimation: function SpriteSheet_hasAnimation(name) {
		return typeof this.animations[name] === 'object';
	},

	/**
	Defines an animation for the spritesheet.
	<br> The animation must be give a name and must be composed of sprites within this spritesheet.
	<br> Default duration is 1000 milliseconds.
	@method {Self} addAnimation
	@param {String} name
	@param {Array} sprites
	@param {Number} duration Optional
	*/

	addAnimation: function SpriteSheet_addAnimation(name, sprites, duration) {
		if(arguments.length === 2) {
			duration = 1000;
			//#ifdef DEBUG
			jayus.debug.matchArguments('SpriteSheet.addAnimation', arguments, 'name', jayus.TYPES.STRING, 'sprites', jayus.TYPES.ARRAY);
			//#end
		}
		//#ifdef DEBUG
		else {
			jayus.debug.matchArguments('SpriteSheet.addAnimation', arguments, 'name', jayus.TYPES.STRING, 'sprites', jayus.TYPES.ARRAY, 'duration', jayus.TYPES.NUMBER);
		}
		//#end
		this.animations[name] = {
			sprites: sprites,
			duration: duration,
			flipX: false,
			flipY: false
		};
		return this;
	},

	add: function SpriteSheet_add(animations) {
		for(var key in animations) {
			if(animations.hasOwnProperty(key)) {
				var animation = animations[key];
				if(typeof animation.flipX === 'undefined') {
					animation.flipX = false;
				}
				if(typeof animation.flipY === 'undefined') {
					animation.flipY = false;
				}
				if(typeof animation.duration === 'undefined') {
					animation.duration = 1000;
				}
				this.animations[key] = animation;
			}
		}
		return this;
	},

	/**
	Sets the duration of a named animation.
	@method {Self} setAnimationDuration
	@param {String} animation
	@param {Number} duration
	*/

	setAnimationDuration: function SpriteSheet_setAnimationDuration(animation, duration) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('SpriteSheet.setAnimationDuration', arguments, 'animation', jayus.TYPES.STRING, 'duration', jayus.TYPES.NUMBER);
		if(!this.hasAnimation(animation)) {
			throw new Error('SpriteSheet.setAnimationDuration() - Invalid animation'+jayus.debug.toString(animation)+' sent, unknown animation');
		}
		//#end
		this.animations[animation].duration = duration;
		return this;
	},

	/**
	Sets the flipped properties of an animation.
	@method {Self} setAnimationFlipping
	@param {String} animation
	@param {Boolean} flipX
	@param {Boolean} flipY
	*/

	setAnimationFlipping: function SpriteSheet_setAnimationFlipping(animation, flipX, flipY) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('SpriteSheet.setAnimationFlipping', arguments, 'animation', jayus.TYPES.STRING, 'flipX', jayus.TYPES.BOOLEAN, 'flipY', jayus.TYPES.BOOLEAN);
		if(!this.hasAnimation(animation)) {
			throw new Error('SpriteSheet.setAnimationFlipping() - Invalid animation'+jayus.debug.toString(animation)+' sent, unknown animation');
		}
		//#end
		this.animations[animation].flipX = flipX;
		this.animations[animation].flipY = flipY;
		return this;
	}

});