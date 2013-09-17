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
Defines the base jayus.Shape class.
@file Shape.js
*/

//
//  jayus.Shape()
//_________________//

/**
An abstract class that represents a geometric shape.
<br> Note that a Shape is not an Entity, it must be placed within a PaintedShape entity to be drawn.
@class jayus.Shape
*/

//#ifdef DEBUG
jayus.debug.className = 'Shape';
//#endif

jayus.Shape = jayus.Dependency.extend({

	//
	//  Methods
	//___________//

	/**
	Translates the shape.
	@method {Self} translate
	@paramset Syntax 1
	@param {Point} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	/**
	Attempts to align the shape to best render itself onto a canvas element.
	<br> Attempts to prevent the antialiasing performed by the browser.
	@method {Self} alignToCanvas
	*/

	/**
	Returns a clone of the shape.
	@method {Shape} clone
	*/

	/**
	Clones the shape onto the given shape(of the same type).
	@method {Shape} cloneOnto
	@param {Shape} ret
	*/

	/**
	Returns a clone of the shape transformed by the given matrix.
	@method {Shape} getTransformed
	@param {Matrix} matrix
	*/

	/**
	Returns a new PaintedShape entity that styles this shape with the given brush.
	<br> Shorthand for: new jayus.PaintedShape(shape, brush);
	@method {PaintedShape} paintedWith
	@param {Object|Brush} brush
	*/

	paintedWith: function Shape_paintedWith(brush){
		return new jayus.PaintedShape(this, brush);
	}

	/**
	Returns the scope of the shape.
	<br> The scope is not guranteed to be tight, especially for paths, the scope may lie far outside the actual shape.
	@method {Rectangle} getScope
	*/

		//
		//  Intersection
		//________________//

	/**
	Returns whether this geometric intersects the sent point.
	<br> Used for cursor hit testing.
	@method {Boolean} intersectsAt
	@param {Number} x
	@param {Number} y
	*/

});
