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

//#ifdef DEBUG
jayus.debug.className = 'SizePolicy';
//#endif

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

	/**
	When sharing space with siblings, the weight that this entity has.
	<br> Default is 1
	@property {Number} weight
	*/

	weight: 1,

	/**
	Whether or not to expand when additional space is available.
	<br> Default is true
	@property {Boolean} expand
	*/

	expand: true

});