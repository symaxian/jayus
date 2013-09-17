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

//#ifdef DEBUG
jayus.debug.className = 'Sprite';
//#endif

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

	/**
	The current sprite index.
	<br> Do not modify.
	@property {Number} spriteIndexY
	*/

	spriteIndexY: null,

	//
	//  Methods
	//___________//

	/**
	Sets the spritesheet for this sprite.
	@method {Self} setSpriteSheet
	@param {SpriteSheet} sheet
	*/

	setSpriteSheet: function Sprite_setSpriteSheet(sheet){
		this.sheet = sheet;
		// this.setSize(sheet.spriteSize);
		return this;
	},

	/**
	Sets the index of the sprite represented by this sheet.
	<br> Requires that a sheet be set on this sprite or the source image.
	@method {Self} setSprite
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setSprite: function Sprite_setSprite(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Sprite.setSprite', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		// Get the descriptor
		if(this.sheet !== null || typeof this.image.sheet === 'object'){
			// Ensure its different from the current sprite
			if(this.spriteIndexX !== x || this.spriteIndexY !== y){
				var sheet = this.sheet || this.image.sheet;
				// Set the tile number
				this.spriteIndexX = x;
				this.spriteIndexY = y;
				// Set the section
				this.setSection(sheet.marginX+x*sheet.spriteWidth, sheet.marginY+y*sheet.spriteHeight, sheet.spriteWidth, sheet.spriteHeight);
				this.dirty(jayus.DIRTY.SIZE);
			}
		}
		//#ifdef DEBUG
		else{
			console.warn('Sprite.setSprite() - Image does not contain attached spritesheet');
		}
		//#endif
		return this;
	},

	/**
	Plays the specified named animation, according to the attached spritesheet.
	<br> Requires that a sheet be set on this sprite or the source image.
	@method {Self} playAnimation
	@param {String} name
	@param {Function} callback Optional, called when finished playing
	*/

	playAnimation: function Sprite_playAnimation(name, func){
		//#ifdef DEBUG
		jayus.debug.match('Sprite.playAnimation', name, 'name', jayus.TYPES.STRING);
		jayus.debug.matchOptional('Sprite.playAnimation', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		this.setAnimation(name, false);
		if(arguments.length > 1){
			this.animator.addHandler('finished', func);
		}
		return this;
	},

	/**
	Plays the specified named animation in an endless loop, according to the attached spritesheet.
	<br> Requires that a sheet be set on this sprite or the source image.
	@method {Self} loopAnimation
	@param {String} name
	*/

	loopAnimation: function Sprite_loopAnimation(name){
		//#ifdef DEBUG
		jayus.debug.match('Sprite.loopAnimation', name, 'name', jayus.TYPES.STRING);
		//#endif
		return this.setAnimation(name, true);
	},

	stopAnimation: function Sprite_stopAnimation(){
		if(this.animator !== null){
			this.animator.stop();
		}
	},

	/**
	Sets the playing animation for the sprite.
	<br> Requires that a sheet be set on this sprite or the source image.
	@method {Self} setAnimation
	@param {String} name
	@param {Boolean} looped
	*/

	setAnimation: function Sprite_setAnimation(name, looped){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Sprite.setAnimation', arguments, 'name', jayus.TYPES.STRING, 'looped', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.sheet !== null || typeof this.image.sheet === 'object'){
			var sheet = this.sheet || this.image.sheet;
			if(sheet.hasAnimation(name)){
				// Stop any previous animation
				if(this.animator !== null){
					this.animator.stop();
				}
				// Save the animation name
				this.animation = name;
				// Get the animation data
				var data = sheet.animations[name],
					sequence = data.sprites,
					sprite = this;

				// Set the flipping
				if(data.flipX || data.flipY){
					// Make sure to flip around the center
					this.setAnchor(this.width/2, this.height/2);
					if(data.flipX){
						this.setScale(-1, this.yScale);
					}
					else{
						this.setScale(1, this.yScale);
					}
					if(data.flipY){
						this.setScale(this.xScale, -1);
					}
					else{
						this.setScale(this.xScale, 1);
					}
				}
				else{
					this.setScale(1, 1);
				}

				// Create the animator
				this.animator = new jayus.Animator.Discrete(sequence.length, function(index){
					sprite.setSprite(sequence[index]);
				});
				// Set the duration, set the looping, and start it
				this.animator.setDuration(sheet.animations[name].duration).setLooped(looped).start();
			}
			//#ifdef DEBUG
			else{
				throw new Error('Sprite.setAnimation() - Spritesheet does not contain sprite/animation: '+name);
			}
			//#endif
		}
		//#ifdef DEBUG
		else{
			throw new Error('Sprite.setAnimation() - Image does not contain attached spritesheet');
		}
		//#endif
		return this;
	},

	playSequence: function Sprite_playSequence(names){
		var i, anim,
			seq = new jayus.AnimatorSequence(),
			sheet = this.sheet || this.image.sheet;
		for(i=0;i<names.length;i++){
			seq.add(new jayus.Sprite.SpriteSequence(this, sheet.animations[names[i]].sprites).setDuration(sheet.animations[names[i]].duration));
		}
		this.animator.stop();
		this.animator = seq;
		anim = this.animation;
		this.animation = names;
		seq.addHandler('finished', function(e){
			this.setAnimation(anim);
		},{ context: this });
		seq.start();
		return seq;
	}

});