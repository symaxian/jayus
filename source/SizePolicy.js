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
Defines the SizePolicy class.
@file SizePolicy.js
*/

//
//  jayus.SizePolicy()
//______________________//

/**
Used to describe a Rect entity's minimum and preferred size.
<br> Using this class is never required, but can be very helpful when using container entities.
@class jayus.SizePolicy
*/

jayus.SizePolicy = jayus.createClass({

	//
	//  Properties
	//______________//

	/**
	The preferred size of the dimension.
	<br> Default is 0
	@property {Number} size
	*/

	size: 0,
	//#replace jayus.SizePolicy.prototype.size 0

	/**
	When sharing space with siblings, the weight that this entity has.
	<br> Default is 1
	@property {Number} weight
	*/

	weight: 1,
	//#replace jayus.SizePolicy.prototype.weight 1

	/**
	Whether or not to expand when additional space is available.
	<br> Default is true
	@property {Boolean} expand
	*/

	expand: true,
	//#replace jayus.SizePolicy.prototype.expand true

	init: function SizePolicy_init(object) {
		if (arguments.length) {
			this.initFromObject(object);
		}
	},

	toObject: function SizePolicy_toObject() {
		// Add our own properties
		object.type = 'SizePolicy';
		if (this.size !== jayus.SizePolicy.prototype.size) {
			object.size = this.size;
		}
		if (this.weight !== jayus.SizePolicy.prototype.weight) {
			object.weight = this.weight;
		}
		if (this.expand !== jayus.SizePolicy.prototype.expand) {
			object.expand = this.expand;
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function SizePolicy_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('SizePolicy.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		// Apply our own properties
		if (typeof object.size === 'number') {
			this.size = object.size;
		}
		if (typeof object.weight === 'number') {
			this.weight = object.weight;
		}
		if (typeof object.expand === 'boolean') {
			this.expand = object.expand;
		}
		return this;
	}

});