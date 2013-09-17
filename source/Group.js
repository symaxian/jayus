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
Defines the Parent mix-ins.
@file Entity.Group.js
*/

//
//  jayus.Parent
//_________________//

//TODO: Group find/search, traverse children for specific child/id

// TODO: Flesh out or remove the clipping region idea.

/*

Notes:

	Conflict:
		Use a placeholder dirty() method
			Requires placeholder dirty() in Group
			Requires actual dirty() in subclasses
		Use the actual dirty() method
			Requires rewriting any method that needs to call dirty() in subclasses
	Outcome: Use the actual dirty() method

*/

/**
An abstract class inherited by entities that hold and manage multiple children.
@class jayus.Group
*/

jayus.Group = {

	//
	//  Properties
	//______________//

	//@ From Entity
	isParent: true,

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
		//  Retrieval
		//_____________//

	/**
	Searches the group and all Entities below it for an Entity with the specified id.
	<br> Returns null if not found.
	@method {Entity} findChild
	@param {String} id
	*/

	findChild: function Group_findChild(id){
		//#ifdef DEBUG
		jayus.debug.match('Entity.setId', id, 'id', jayus.TYPES.DEFINED);
		//#endif
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			if(item.id === id){
				return item;
			}
			if(item.isParent){
				item = item.findChild(id);
				if(item !== null){
					return item;
				}
			}
		}
		return null;
	},

	/**
	Returns every child under the group in an array in the order they appear.
	<br> Essentially "flattens" the scene-graph under the group.
	<br> This group is not included in the array.
	<br> If parentsAfter is true then parents will appear after their children in the array, otherwise they come first.
	@method {Array} getAllChildren
	@param {Boolean} parentsAfter Optional
	*/

	getAllChildren: function Group_getAllChildren(parentsAfter){
		var i, item, children = [];
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			if(item.isParent){
				if(parentsAfter){
					children = children.concat(item, item.getAllChildren(parentsAfter));
				}
				else{
					children = children.concat(item.getAllChildren(parentsAfter), item);
				}
			}
			else{
				children.push(item);
			}
		}
		return children;
	},

		//
		//  Iteration
		//_____________//

	getChildrenUnderCursor: function Group_getChildrenUnderCursor(){
		var i, ret = [];
		for(i=0;i<this.children.items.length;i++){
			if(this.children.items[i].underCursor){
				ret.push(this.children.items[i]);
			}
		}
		return ret;
	},

	getChildrenAt: function Group_getChildrenAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Group.getChildrenAt', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		var i, ret = [];
		for(i=0;i<this.children.items.length;i++){
			if(this.children.items[i].intersectsAt(x, y)){
				ret.push(this.children.items[i]);
			}
		}
		return ret;
	},

	runOnCursor: function Group_runOnCursor(func, args){
		//#ifdef DEBUG
		jayus.debug.match('Group.runOnCursor', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		var i, item;
		// Loop through the children
		for(i=this.children.items.length-1;i>=0;i--){
			item = this.children.items[i];
			// Check if the cursor is over the child
			if(item.underCursor){
				// If the child is a parent, run on its children
				if(item.isParent && item.runOnCursor(func,args)){
					return true;
				}
				// Run the function on the child, return true if cancelled
				if(func.apply(item,args)){
					return true;
				}
			}
		}
		return false;
	},

	/**
	Calls the given function on the children in the container with the given arguments.
	<br> The argument array is optional.
	@method {*} forEachChild
	@param {Function} func
	@param {Array} args Optional
	*/

	forEachChild: function Scene_forEachChild(func,args){
		//#ifdef DEBUG
		jayus.debug.match('Scene.forEachChild', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		return this.children.forEach(func, args);
	},

		//
		//  Events
		//__________//

	/**
	Fires the given event on every child under the group.
	<br> Returns true if the event was cancelled.
	@method {Boolean} fireOnChildren
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnChildren: function Group_fireOnChildren(event, data){
		//#ifdef DEBUG
		jayus.debug.match('Group.fireOnChildren', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Loop through the children
		var i, item;
		// for(var item,i=this.children.items.length-1;i>=0;i--){
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// If the child is a parent, fire on its children
			if(item.isParent && item.fireOnChildren(event, data)){
				return true;
			}
			// Fire the event on the child, return true if cancelled
			if(item.fire(event, data)){
				return true;
			}
		}
		return false;
	},

	/**
	Fires the given event on every child under the group that intersect the cursor.
	<br> Returns true if the event was cancelled.
	@method {Boolean} fireOnCursor
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnCursor: function Group_fireOnCursor(event, data){
		//#ifdef DEBUG
		jayus.debug.match('Group.fireOnCursor', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Loop through the children
		var i, item;
		for(i=this.children.items.length-1;i>=0;i--){
		// for(;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Check if the cursor is over the child
			if(item.underCursor){
				// If the child is a parent, fire on its children
				if(item.isParent && item.fireOnCursor(event, data)){
					return true;
				}
				// Fire the event on the child, return true if cancelled
				if(item.fire(event, data)){
					return true;
				}
			}
		}
		return false;
	},

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

	updateCursorOnChildren: function Group_updateCursorOnChildren(x, y){
		var pos, i, item;
		if(this.propagateCursor){
			// Translate point from parent to local coordinate space
			pos = this.parentToLocal(x, y);
			// if(this.isTransformed){
			// 	pos = this.getMatrix().inverseTransformPoint(pos.x, pos.y);
			// }
			x = pos.x;
			y = pos.y;
			// this.localX = x;
			// this.localY = y;
			// Loop through the children
			for(i=this.children.items.length-1;i>=0;i--){
			// for(i=0;i<this.children.items.length;i++){
				item = this.children.items[i];
				if(item.trackCursor){
					item.updateCursor(x, y);
				}
			}
		}
	},

	findCursorAcceptor: function Group_findCursorAcceptor(){
		var i, item, acceptor;
		for(i=this.children.items.length-1;i>=0;i--){
			item = this.children.items[i];
			if(item.underCursor){
				if(item.isParent){
					acceptor = item.findCursorAcceptor();
					if(acceptor !== null){
						return acceptor;
					}
					if(item.canAcceptCursor){
						return item;
					}
				}
				else if(item.canAcceptCursor){
					return item;
				}
			}
		}
		return null;
	},

	/*
	Used internally to clear the cursor flag on all children.
	@method removeCursorFromChildren
	*/

	removeCursorFromChildren: function Group_removeCursorFromChildren(){
		// Loop through the children
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Check if the child has the cursor
			if(item.underCursor){
				// Clear the cursor flag and fire the cursorOut event
				item.underCursor = false;
				item.fire('cursorOut');
				// If its a group, call the removeCursorFromChildren() method
				if(item.isParent){
					item.removeCursorFromChildren();
				}
			}
		}
	}

};