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

	child: null,

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

	/*
	Used internally to update the known cursor position.
	<br> Used to propagate the cursorMove event through the scenegraph, firing the cursorOver and cursorOut events if applicable.
	@method updateCursorOnChildren
	@param {Number} x
	@param {Number} y
	*/

	updateCursorOnChildren: function Wrapper_updateCursorOnChildren(x, y){
		this.localX = x;
		this.localY = y;
		if(this.propagateCursor){
			// Translate point from parent to local coordinate space
			var pos = this.parentToLocal(x, y);
			jayus.util.updateCursorOnChild(this.child, pos.x, pos.y);
		}
	},

	/*
	Used internally to clear the cursor flag on all children.
	@method removeCursorFromChildren
	*/

	removeCursorFromChildren: function Wrapper_removeCursorFromChildren(){
		this.child.removeCursor();
	},

	findCursorAcceptor: function Group_findCursorAcceptor(){
		if(this.child.underCursor){
			if(this.child.isParent){
				var acceptor = this.child.findCursorAcceptor();
				if(acceptor !== null){
					return acceptor;
				}
				if(this.child.canAcceptCursor){
					return this.child;
				}
			}
			else{
				return this.child;
			}
		}
		return null;
	},

		//
		//  Child
		//_________//

	/**
	Returns the child.
	@method {Entity} getChild
	*/

	getChild: function Wrapper_getChild(){
		return this.child;
	},

	/**
	Returns whether the container is holding a child.
	@method {Boolean} hasChild
	*/

	hasChild: function Wrapper_hasChild(){
		return this.isParent;
	},

	/**
	Sets the child of the container.
	@method {Self} setChild
	@param {Entity} child
	*/

	setChild: function Wrapper_setChild(child){
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.setChild', child, 'child', jayus.TYPES.ENTITY);
		//#endif
		// Add the child
		this.child = child;
		// Set the parent
		child.setParent(this);
		this.isParent = true;
		return this;
	},

	/**
	Removes the child from the container.
	@method {Self} removeChild
	*/

	removeChild: function Wrapper_removeChild(){
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
	@method {Entity} findChild
	@param {String} id
	*/

	findChild: function Wrapper_findChild(id){
		if(this.isParent){
			if(this.child.id === id){
				return this.child;
			}
			if(this.child.isParent){
				return this.child.findChild(id);
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

	onEachChild: function Wrapper_onEachChild(method, args){
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.onEachChild', method, 'method', jayus.TYPES.STRING);
		//#endif
		return this.child[method].apply(this.child, args);
	},

	/**
	Calls the given function on the child in the container with the given arguments.
	<br> The argument array is optional.
	@method {*} forEachChild
	@param {Function} func
	@param {Array} args Optional
	*/

	forEachChild: function Wrapper_forEachChild(func, args){
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.forEachChild', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		return func.apply(this.child, args);
	},

	// TODO: Wrapper.runOnCursor() - Improve/document

	runOnCursor: function Wrapper_runOnCursor(func, args){
		// Check if the cursor is over the child
		if(this.child.underCursor){
			// If the child is a parent, run on its children
			if(this.child.isParent && this.child.runOnCursor(func, args)){
				return true;
			}
			// Run the function on the child, return true if accepted
			if(func.apply(this.child, args)){
				return true;
			}
		}
		return false;
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

	fireOnChildren: function Wrapper_fireOnChildren(event, data){
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.fireOnChildren', event, 'event', jayus.TYPES.STRING);
		//#endif
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

	fireOnCursor: function Wrapper_fireOnCursor(event,data){
		//#ifdef DEBUG
		jayus.debug.match('Wrapper.fireOnCursor', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Check if the cursor is tracked and over the child
		if(this.child.trackCursor && this.child.underCursor){
			// If the child is a parent, fire on its children
			if(this.child.isParent && this.child.fireOnCursor(event, data)){
				return true;
			}
			// Fire the event on the child, return true if accepted
			return this.child.fire(event, data);
		}
		return false;
	}

};
