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
Defines the Sprite entity.
@file Sprite.js
*/

//
//  jayus.Sprite()
//__________________//

/**
An enhanced version of the Image entity that can be easily animated.
<br> Sprites are animated by attaching a SpriteSheet to either the source image or the Sprite entity that describes some animations.
<br> Then just call the playAnimation or loopAnimation methods with the animation name.
@class jayus.Sprite
@extends jayus.Image
*/

jayus.Sprite = jayus.Image.extend({

	//
	//  Properties
	//______________//

	/**
	The name of the current animation.
	<br> Do not modify.
	@property {String} animation
	*/

	animation: null,

	/**
	The animator executing the current animation.
	<br> Do not modify.
	@property {String} animation
	*/

	animator: null,

	/**
	The current sprite index.
	<br> Do not modify.
	@property {Number} spriteIndexX
	*/

	spriteIndexX: null,
	//#replace jayus.Sprite.prototype.spriteIndexX null

	/**
	The current sprite index.
	<br> Do not modify.
	@property {Number} spriteIndexY
	*/

	spriteIndexY: null,
	//#replace jayus.Sprite.prototype.spriteIndexY null

	sheet: null,

	//
	//  Methods
	//___________//

	toObject: function Sprite_toObject() {
		var object = jayus.Image.prototype.toObject.call(this);
		// Add our own properties
		object.type = 'Sprite';
		if(this.spriteIndexX !== jayus.Sprite.prototype.spriteIndexX || this.spriteIndexY !== jayus.Sprite.prototype.spriteIndexY) {
			object.spriteIndexX = this.spriteIndexX;
			object.spriteIndexY = this.spriteIndexY;
		}
		return object;
	},

	initFromObject: function Sprite_initFromObject(object) {
		jayus.Image.prototype.initFromObject.call(this, object);
		// Add our own properties
		// We cant just set the sprite indices, if we do then when calling setSprite() it will think we're just re-setting the same value
		// We have to call setSprite() with the new values
		if(typeof object.spriteIndexX !== 'undefined' || typeof object.spriteIndexY !== 'undefined') {
			this.setSprite(object.spriteIndexX, object.spriteIndexY);
		}
		//#ifdef DEBUG
		else if(typeof object.spriteIndexX !== typeof object.spriteIndexY) {
			console.warn('Sprite.initFromObject() - Properties spriteIndexX and spriteIndexY must both be present if one is');
		}
		//#end
		return this.dirty(jayus.DIRTY.ALL);
	},

	/**
	Sets the spritesheet for this sprite.
	<br> This overrides the usage of the spritesheet attached to the image.
	@method {Self} setSpriteSheet
	@param {SpriteSheet} sheet
	*/

	setSpriteSheet: function Sprite_setSpriteSheet(sheet) {
		// FIXME: Sprite.setSpriteSheet() - Does not refresh the sprite index, size, or anything
		this.sheet = sheet;
		return this;
	},

	/**
	Sets the sprite drawn, specified either by index or name.
	<br> Requires that a spritesheet be set on this sprite or the source image as the "sheet" property.
	<br> If you use the SpriteSheet class in the normal manner then jayus will set this property for you.
	@method {Self} setSprite
	@paramset 1 - A named sprite
	@param {String} name
	@paramset 2 - Column/row of sprite
	@param {Number} x
	@param {Number} y
	@paramset 3 - Column/row of sprite
	@param {Point} point
	@paramset 4 - Index of sprite
	@param {Number} index
	*/

	setSprite: function Sprite_setSprite(x, y) {
		//#ifdef DEBUG
		// Check the image
		if(this.sheet === null && this.image === null) {
			console.error('Sprite.setSprite() - Cannot set sprite, image "'+this.filepath+'" not found, it is likely not loaded yet');
			return this;
		}
		//#end
		// Get the sheet descriptor
		var sheet = this.sheet || this.image.sheet;
		//#ifdef DEBUG
		if(typeof sheet !== 'object') {
			console.error('Sprite.setSprite() - Cannot set sprite, image nor sprite contains a spritesheet as the "sheet" property');
			return this;
		}
		//#end
		if(arguments.length === 1) {

			// Check if a name was sent
			if(typeof x === 'string') {
				if(this.spriteIndexX !== x) {
					// Get the sprite date
					var data = sheet.namedSprites[x];
					//#ifdef DEBUG
					if(typeof data !== 'object') {
						console.error('Sprite.setSprite("'+x+'") - Named sprite not found in sprite sheet');
						return this;
					}
					//#end
					this.setSection(data.x, data.y, data.width, data.height);
					this.setRelativeAnchor(0.5, 0.5);
					this.setFlipping(data.flipX, data.flipY);
					this.spriteIndexX = x;
				}
				return this;
			}

			// Check if a single index was sent
			if(typeof x === 'number') {
				// TODO: Test!
				var width = Math.floor(this.width / (sheet.spriteWidth+sheet.marginX)),
					tileX = x%width,
					tileY = (x-tileX)/width;
				return this.setSprite(tileX, tileY);
			}

			// Assume it's a point
			//#ifdef DEBUG
			if(!(x instanceof jayus.Point)) {
				console.warn('Sprite.setSprite() - Requires string, number, Point, or two numbers');
			}
			//#end
			return this.setSprite(x.x, x.y);

		}

		// Ensure it's different from the current sprite
		if(this.spriteIndexX !== x || this.spriteIndexY !== y) {
			// Set the tile number
			this.spriteIndexX = x;
			this.spriteIndexY = y;
			// Set the section
			this.setSection(sheet.marginX+x*sheet.spriteWidth, sheet.marginY+y*sheet.spriteHeight, sheet.spriteWidth, sheet.spriteHeight);
			this.dirty(jayus.DIRTY.ALL);
		}

		return this;
	},

	/**
	Plays the specified named animation, according to the attached spritesheet.
	@method {Self} playAnimation
	@param {String} name
	@param {Function} callback Optional, called when finished playing
	*/

	playAnimation: function Sprite_playAnimation(name, func) {
		//#ifdef DEBUG
		jayus.debug.match('Sprite.playAnimation', name, 'name', jayus.TYPES.STRING);
		jayus.debug.matchOptional('Sprite.playAnimation', func, 'func', jayus.TYPES.FUNCTION);
		//#end
		this.setAnimation(name, false);
		if(arguments.length > 1) {
			this.animator.addHandler('finished', func);
		}
		return this;
	},

	/**
	Plays the specified named animation in an endless loop, according to the attached spritesheet.
	@method {Self} loopAnimation
	@param {String} name
	*/

	loopAnimation: function Sprite_loopAnimation(name) {
		//#ifdef DEBUG
		jayus.debug.match('Sprite.loopAnimation', name, 'name', jayus.TYPES.STRING);
		//#end
		return this.setAnimation(name, true);
	},

	/**
	Sets the playing animation for the sprite.
	<br> Does not set the animation if one with the same name is still running.
	@method {Self} setAnimation
	@param {String} name
	@param {Boolean} looped
	*/

	setAnimation: function Sprite_setAnimation(name, looped) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('Sprite.setAnimation', arguments, 'name', jayus.TYPES.STRING, 'looped', jayus.TYPES.BOOLEAN);
		//#end
		// Get the sheet descriptor
		var sheet = this.sheet || this.image.sheet;
		//#ifdef DEBUG
		if(typeof sheet !== 'object') {
			console.error('Sprite.setSprite() - Cannot set sprite, image nor sprite contains a spritesheet as the "sheet" property');
			return this;
		}
		if(!sheet.hasAnimation(name)) {
			console.error('Sprite.setAnimation() - Spritesheet does not contain sprite/animation: '+name);
		}
		//#end
		// Check if there is currently a running animator
		if(this.animator !== null && this.animator.running) {
			// If the same animation is currently running, return
			if(this.animation === name) {
				return this;
			}
			// Stop any previous animation
			this.animator.stop();
		}
		// Save the animation name
		this.animation = name;
		// Get the animation data
		var data = sheet.animations[name],
			sequence = data.sprites;
		// Make sure to flip around the center
		// ???: Is this needed, I think flipping centers it automatically
		this.setRelativeAnchor(0.5, 0.5);
		// Set the flipping
		this.setFlipping(data.flipX, data.flipY);
		// Create the animator
		this.animator = new jayus.Animator.Discrete(sequence.length, function(index) {
			this.sprite.setSprite(sequence[index]);
		});
		this.animator.sprite = this;
		// Set the duration, set the looping, and start it
		this.animator.setDuration(sheet.animations[name].duration).setLooped(looped).start();
		return this;
	},

	/**
	Stops the currently running animation.
	@method {Self} stopAnimation
	*/

	stopAnimation: function Sprite_stopAnimation() {
		if(this.animator !== null && this.animator.running) {
			this.animator.stop();
		}
	}

});