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
Defines the List class.
@file List.js
*/

//
//  jayus.List()
//_________________//

/**
Represents a list of some objects.
<br> The documentation currently lists each method as taking or returning Entities, this needs to be updated as any object can be stored in the list.
<br> The objects in the list are referred to as elements(or items).
<br> Check the init method for construction options.
@class jayus.List
*/

jayus.List = jayus.createClass({

	//
	//  Properties
	//______________//

	shapeType: jayus.SHAPES.LIST,

	parent: null,

	items: null,

	//#ifdef DEBUG
	typeId: jayus.TYPES.DEFINED,
	//#end

	//
	//  Methods
	//___________//

	/**
	Initates the List object.
	@constructor List
	*/

	init: function List(parent) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.match('List', parent, 'parent', jayus.TYPES.OBJECT);
			//#end
			this.parent = parent;
		}
		this.items = [];
	},

	// Signals

	added: function List_added(item) {
		this.parent.listItemAdded(this, item);
	},

	addedMany: function List_addedMany(items) {
		this.parent.listItemsAdded(this, items);
	},

	removed: function List_removed(item) {
		this.parent.listItemRemoved(this, item);
	},

	removedMany: function List_removedMany(items) {
		this.parent.listItemsRemoved(this, items);
	},

		//
		//  Operations
		//______________//

	/**
	Returns the index of the sent element.
	<br> Returns -1 if the element is not in the list.
	@method {Number} indexOf
	@param {Entity|String} item
	*/

	indexOf: function List_indexOf(item) {
		var i;
		if(typeof item === 'string') {
			//#ifdef DEBUG
			jayus.debug.match('List.indexOf', item, 'item', jayus.TYPES.DEFINED);
			//#end
			for(i=this.items.length-1;i>=0;i--) {
				if(this.items[i].id === item) {
					return i;
				}
			}
			return -1;
		}
		//#ifdef DEBUG
		jayus.debug.match('List.indexOf', item, 'item', this.typeId);
		//#end
		return this.items.indexOf(item);
	},

	/**
	Returns whether or not the given element is in the list.
	@method {Boolean} has
	@param {Entity} item
	*/

	has: function List_has(item) {
		//#ifdef DEBUG
		jayus.debug.match('List.has', item, 'item', this.typeId);
		//#end
		return this.items.indexOf(item) >= 0;
	},

	/**
	Returns the number of objects in the list.
	@method {Number} count
	*/

	count: function List_count() {
		return this.items.length;
	},

		//
		//  Retrieval
		//_____________//

	/**
	Returns the item at the specified index.
	<br> Returns null if the index is invalid.
	@method {Entity} at
	@param {Number} index
	*/

	at: function List_at(index) {
		//#ifdef DEBUG
		jayus.debug.match('List.at', index, 'index', jayus.TYPES.NUMBER);
		//#end
		if(0 <= index && index < this.items.length) {
			return this.items[index];
		}
		return null;
	},

	/**
	Returns the item in the list with the specified id.
	@method {Boolean} get
	@param {*} id
	*/

	get: function List_get(id) {
		//#ifdef DEBUG
		jayus.debug.match('List.get', id, 'id', jayus.TYPES.DEFINED);
		//#end
		var i, item;
		for(i=this.items.length-1;i>=0;i--) {
			item = this.items[i];
			if(item.id === id) {
				return item;
			}
		}
		return null;
	},

	find: function List_find(id) {
		//#ifdef DEBUG
		jayus.debug.match('List.get', id, 'id', jayus.TYPES.DEFINED);
		//#end
		var i, item;
		for(i=this.items.length-1;i>=0;i--) {
			item = this.items[i];
			if(item.id === id) {
				return item;
			}
			if(item.isParent) {
				item = item.find(id);
				if(item !== null) {
					return item;
				}
			}
		}
	},

	/**
	Appends the sent object[s] to the list.
	<br> Any number of objects may be sent.
	@method {Self} add
	@param {Entity} item
	*/

	add: function List_add(item) {
		var tempItem;
		if(arguments.length === 1) {
			// Reassign item to tempItem, Chrome doesn't like assignments to parameters
			tempItem = item;
			if(typeof tempItem.frozen !== 'number') {
				tempItem = jayus.parse(tempItem);
			}
			//#ifdef DEBUG
			jayus.debug.match('List.add', item, 'item', this.typeId);
			//#end
			this.items.push(item);
			this.added(item);
		}
		else {
			//#ifdef DEBUG
			// jayus.debug.matchArray('List.add', items, 'items', this.typeId);
			//#end
			var items = Array.prototype.slice.call(arguments);
			// Loop through the arguments
			for(var i=0;i<items.length;i++) {
				// Assign to tempItem, assigning to item would mess up the argument array
				tempItem = items[i];
				if(typeof tempItem.frozen !== 'number') {
					tempItem = jayus.parse(tempItem);
					items[i] = tempItem;
				}
				this.items.push(tempItem);
			}
			this.addedMany(items);
		}
		return this;
	},

	/**
	Appends an array of objects to the list.
	@method {Self} append
	@param {Array} items
	*/

	append: function List_append(items) {
		//#ifdef DEBUG
		jayus.debug.matchArray('List.append', items, 'items', this.typeId);
		//#end
		for(var i=0;i<items.length;i++) {
			this.items.push(items[i]);
		}
		this.addedMany(items);
		return this;
	},

	/**
	Inserts the sent element into the list at the specified index.
	@method {Self} insert
	@param {Entity} item
	@param {Number} index
	*/

	insert: function List_insert(item, index) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('List.insert', arguments, 'item', this.typeId, 'index', jayus.TYPES.NUMBER);
		//#end
		this.items.splice(index, 0, item);
		this.added(item);
		return this;
	},

	/**
	Inserts the sent element into the list before another element.
	@method {Self} insertBefore
	@param {Entity} item
	@param {Entity} pivot
	*/

	insertBefore: function List_insertBefore(item, pivot) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('List.insertBefore', arguments, 'item', this.typeId, 'pivot', this.typeId);
		//#end
		var index = this.items.indexOf(pivot);
		if(index > 0) {
			this.items.splice(index-1, 0, item);
			this.added(item);
		}
		return this;
	},

	/**
	Inserts the sent element into the list after another element.
	@method {Self} insertAfter
	@param {Entity} item
	@param {Entity} pivot
	*/

	insertAfter: function List_insertAfter(item, pivot) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('List.insertAfter', arguments, 'item', this.typeId, 'pivot', this.typeId);
		//#end
		var index = this.items.indexOf(pivot);
		if(index !== -1) {
			this.items.splice(index, 0, item);
			this.added(item);
		}
		return this;
	},

			//
			//  Removal
			//___________//

		// COMP: Result of removing non-existant item, fail silently or loudly

	/**
	Removes the sent object[s] to the list.
	<br> Any number of objects may be sent.
	<br> Does nothing if the object is not present.
	@method {Self} remove
	@param {Object} item
	*/

	remove: function List_remove(item) {
		//#ifdef DEBUG
		jayus.debug.match('List.remove', item, 'item', this.typeId);
		//#end
		var i, index;
		if(arguments.length === 1) {
			// Get the index
			index = this.items.indexOf(item);
			if(index >= 0) {
				// Remove the item
				this.items.splice(index, 1);
				this.removed(item);
			}
		}
		else {
			// Loop through the arguments
			for(i=0;i<arguments.length;i++) {
				index = this.items.indexOf(arguments[i]);
				if(index >= 0) {
					// Remove the item
					this.items.splice(index, 1);
				}
			}
			this.removedMany(arguments);
		}
		return this;
	},

	/**
	Removes an element from the list at the given index.
	<br> Does nothing if the index is invalid.
	@method {Self} removeAt
	@param {Number} index
	*/

	removeAt: function List_removeAt(index) {
		//#ifdef DEBUG
		jayus.debug.match('List.removeAt', index, 'index', jayus.TYPES.NUMBER);
		//#end
		// Check the index
		if(0 <= index && index < this.items.length) {
			var item = this.items[index];
			this.items.splice(index, 1);
			this.removed(item);
		}
		return this;
	},

	/**
	Replaces an element in the list with another.
	@method {Self} replace
	@paramset 1
	@param {String} oldId
	@param {Object} newItem
	@paramset 2
	@param {Object} oldItem
	@param {Object} newItem
	*/

	replace: function List_replace(oldItem, newItem) {
		//#ifdef DEBUG
		if(typeof oldItem === 'string') {
			jayus.debug.matchArguments('List.replace', arguments, 'oldId', jayus.TYPES.STRING, 'newItem', this.typeId);
		}
		else {
			jayus.debug.matchArguments('List.replace', arguments, 'oldItem', this.typeId, 'newItem', this.typeId);
		}
		//#end
		return this.replaceAt(this.indexOf(oldItem), newItem);
	},

	/**
	Replaces an element in the list with another, adding the new element to the list if the old one did not exist.
	@method {Self} update
	@paramset 1
	@param {String} oldId
	@param {Object} newItem
	@paramset 2
	@param {Object} oldItem
	@param {Object} newItem
	*/

	update: function List_update(oldItem, newItem) {
		//#ifdef DEBUG
		if(typeof oldItem === 'string') {
			jayus.debug.matchArguments('List.update', arguments, 'oldId', jayus.TYPES.STRING, 'newItem', this.typeId);
		}
		else {
			jayus.debug.matchArguments('List.update', arguments, 'oldItem', this.typeId, 'newItem', this.typeId);
		}
		//#end
		var index = this.indexOf(oldItem);
		if(index === -1) {
			this.add(newItem);
		}
		else {
			this.replaceAt(index, newItem);
		}
		return this;
	},

	/**
	Replaces an element at the specified index in the list with another.
	@method {Self} replaceAt
	@param {Number} index
	@param {Object} newItem
	*/

	replaceAt: function List_replaceAt(index, newItem) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('List.replaceAt', arguments, 'index', jayus.TYPES.NUMBER, 'newItem', this.typeId);
		//#end
		// Get the index
		if(index >= 0) {
			this.removed(this.items[index]);
			this.items[index] = newItem;
			this.added(newItem);
		}
		return this;
	},

	/**
	Removes all elements from the list.
	@method {Self} purge
	*/

	purge: function List_purge() {
		var items = this.items;
		this.removedMany(items);
		this.items = [];
		if(this.parent.items === items) {
			this.parent.items = this.items;
		}
		return this;
	},

		//
		//  Utilities
		//_____________//

	/**
	Calls the specified method on all items in the collection with the given arguments.
	<br> The argument array is optional.
	@method {Self} onEach
	@param {String} method
	@param {Array} args Optional
	*/

	onEach: function List_onEach(method, args) {
		//#ifdef DEBUG
		jayus.debug.match('List.onEach', method, 'method', jayus.TYPES.STRING);
		jayus.debug.matchOptional('List.onEach', args, 'args', jayus.TYPES.ARRAY);
		//#end
		for(var i=0;i<this.items.length;i++) {
			this.items[i][method].apply(this.items[i], args);
		}
		return this;
	},

	/**
	Calls the given function on all items in the collection with the given arguments.
	<br> The argument array is optional.
	@method {Self} forEach
	@param {Function} func
	@param {Array} args Optional
	*/

	forEach: function List_forEach(func, args) {
		//#ifdef DEBUG
		jayus.debug.match('List.forEach', func, 'func', jayus.TYPES.FUNCTION);
		jayus.debug.matchOptional('List.forEach', args, 'args', jayus.TYPES.ARRAY);
		//#end
		var i, ret;
		for(i=0;i<this.items.length;i++) {
			ret = func.apply(this.items[i], args);
			if(ret !== undefined) {
				return ret;
			}
		}
		return null;
	},

	/**
	Calls the given function on all items under the collection with the given arguments.
	<br> The argument array is optional.
	@method {Self} forEvery
	@param {Function} func
	@param {Array} args Optional
	*/

	forEvery: function List_forEvery(func, args) {
		//#ifdef DEBUG
		jayus.debug.match('List.forEvery', func, 'func', jayus.TYPES.FUNCTION);
		jayus.debug.matchOptional('List.forEvery', args, 'args', jayus.TYPES.ARRAY);
		//#end
		var i, ret;
		for(i=0;i<this.items.length;i++) {
			ret = func.apply(this.items[i], args);
			if(ret !== undefined) {
				return ret;
			}
		}
		return null;
	},

	/**
	Sorts each child in the list using the given comparator function.
	@method {Self} sort
	@param {Function} comparator
	*/

	sort: function List_sort(comparator) {
		//#ifdef DEBUG
		jayus.debug.match('List.sort', comparator, 'comparator', jayus.TYPES.FUNCTION);
		//#end
		this.items.sort(comparator);
		this.parent.listItemsMoved();
		return this;
	}

});
