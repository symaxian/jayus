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
Defines the Wrapper class.
@file Wrapper.js
*/

//
//  jayus.Wrapper()
//_____________________//

/**
An abstract class, inherited by entities that hold and manage one child.
@class jayus.Wrapper
*/

jayus.Wrapper = {

	//
	//  Properties
	//______________//

	isParent: false,

	/**
	Whether or not to propagate cursor events to children.
	<br> Default is true
	@property {Boolean} propagateCursor
	*/

	propagateCursor: true,

	//
	//  Methods
	//___________//

		//
		//  Cursor
		//__________//

	childCursorTrackingChanged: function Wrapper_childCursorTrackingChanged(child, trackCursor) {
		if(trackCursor) {
			this.propagateCursor = true;
			if(!this.trackCursor) {
				this.trackCursor = true;
				if(this.parent !== null) {
					this.parent.childCursorTrackingChanged(this, true);
				}
			}
		}
	},

	/*
	Used internally to update the known cursor position.
	<br> Used to propagate the cursorMove event through the scenegraph, firing the cursorOver and cursorOut events if applicable.
	@method updateCursorOnChildren
	@param {Number} x
	@param {Number} y
	*/

	updateCursorOnChildren: function Frame_updateCursorOnChildren(x, y) {
		if(this.child.trackCursor) {
			// Update on child
			this.child.updateCursor(x, y);
		}
	},

	/*
	Used internally to clear the cursor flag on all children.
	@method removeCursorFromChildren
	*/

	removeCursorFromChildren: function Wrapper_removeCursorFromChildren() {
		if(this.child.underCursor) {
			this.child.removeCursor();
		}
	},

	findCursorAcceptor: function Wrapper_findCursorAcceptor() {
		if(this.child.underCursor) {
			if(this.child.isParent) {
				var acceptor = this.child.findCursorAcceptor();
				if(acceptor !== null) {
					return acceptor;
				}
				if(this.child.canAcceptCursor) {
					return this.child;
				}
			}
			else {
				return this.child;
			}
		}
		return null;
	},

		//
		//  Child
		//_________//

	/**
	The sole child of the wrapper.
	<br> Do not modify.
	@property {Entity} child
	*/

	child: null,

	/**
	Sets the child of the container.
	@method {Self} setChild
	@param {Entity} child
	*/

	setChild: function Wrapper_setChild(child) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.setChild', child, 'child', jayus.TYPES.ENTITY);
		//#end
		// Add the child
		this.child = child;
		// Set the parent
		child.setParent(this);
		this.isParent = true;
		if(child.trackCursor) {
			this.childCursorTrackingChanged(child, true);
		}
		return this;
	},

	/**
	Removes the child from the container.
	@method {Self} removeChild
	*/

	removeChild: function Wrapper_removeChild() {
		this.child.removeParent();
		this.child = null;
		this.isParent = false;
		return this;
	},

		//
		//  Iteration
		//_____________//

	/**
	Searches the container and all entities below it for an Entity with the specified id.
	@method {Entity} find
	@param {String} id
	*/

	find: function Wrapper_find(id) {
		if(this.isParent) {
			if(this.child.id === id) {
				return this.child;
			}
			if(this.child.isParent) {
				return this.child.find(id);
			}
		}
		return null;
	},

	/**
	Calls the specified method on the child in the container with the given arguments.
	<br> The argument array is optional.
	@method {*} onEachChild
	@param {String} method
	@param {Array} args Optional
	*/

	onEachChild: function Wrapper_onEachChild(method, args) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.onEachChild', method, 'method', jayus.TYPES.STRING);
		//#end
		return this.child[method].apply(this.child, args);
	},

	/**
	Calls the given function on the child in the container with the given arguments.
	<br> The argument array is optional.
	@method {*} forEachChild
	@param {Function} func
	@param {Array} args Optional
	*/

	forEachChild: function Wrapper_forEachChild(func, args) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.forEachChild', func, 'func', jayus.TYPES.FUNCTION);
		//#end
		return func.apply(this.child, args);
	},

	/**
	Calls the given function on every child under the container with the given arguments.
	<br> The argument array is optional.
	@method {*} forEveryChild
	@param {Function} func
	@param {Array} args Optional
	*/

	forEveryChild: function Wrapper_forEveryChild(func, args) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.forEveryChild', func, 'func', jayus.TYPES.FUNCTION);
		//#end
		if(this.child.isParent) {
			this.child.forEveryChild(func, args);
		}
		return func.apply(this.child, args);
	},

		//
		//  Events
		//__________//

	/**
	Fires the given event on every child under the group.
	<br> Returns true if the event was accepted.
	@method {Boolean} fireOnChildren
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnChildren: function Wrapper_fireOnChildren(event, data) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.fireOnChildren', event, 'event', jayus.TYPES.STRING);
		//#end
		// Fire the event on the child, return true if accepted
		return this.child.fire(event, data);
	},

	/**
	Fires the given event on the child provided it intersects the cursor.
	<br> Returns true if the event was accepted.
	@method {Boolean} fireOnCursor
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnCursor: function Wrapper_fireOnCursor(event, data) {
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.fireOnCursor', event, 'event', jayus.TYPES.STRING);
		//#end
		// Check if the cursor is tracked and over the child
		if(this.isParent && this.child.underCursor) {
			// If the child is a parent, fire on its children
			if(this.child.isParent && this.child.fireOnCursor(event, data)) {
				return true;
			}
			// Fire the event on the child, return true if accepted
			return this.child.fire(event, data);
		}
		return false;
	}

};
