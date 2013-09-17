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
Defines the Grid entity.
@file Grid.js
*/

//
//  jayus.Grid()
//________________//

/**
A container that arranges it's children into a grid.
<br> Each slot has a fixed size.
<br> Empty slots(those without a Entity in them) are null.
<br> There must always be at least one slot.
@class jayus.Grid
@extends jayus.RectEntity
*/

/*

TODO:

	Clean up, row/col vs col/row vs i/j vs x/y and so on

	Children's parent properties

Possibilities:

	Keep row and column counts?
			- More code
			+ Prettier than items[0].length and items.length
		Nah, the dev is expected to use methods, no need to add more code.

*/

//#ifdef DEBUG
jayus.debug.className = 'Grid';
//#endif

jayus.Grid = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

		// Meta

	isParent: true,

		// Frame

	/**
	The width of each slot.
	<br> Default is 10.
	<br> Do not modify.
	@property {Number} slotWidth
	*/

	slotWidth: 10,

	/**
	The height of each slot.
	<br> Default is 10.
	<br> Do not modify.
	@property {Number} slotHeight
	*/

	slotHeight: 10,

	/**
	The amount of horizontal padding between each slot.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} xPadding
	*/

	xPadding: 0,

	/**
	The amount of vertical padding between each slot.
	<br> Default is 0.
	<br> Do not modify.
	@property {Number} yPadding
	*/

	yPadding: 0,

	/**
	A two-dimensional array holding the grid elements.
	@property {Array} items
	*/

	items: null,

	//
	//  Methods
	//___________//

	init: function Grid_init(){
		jayus.RectEntity.prototype.init.apply(this);
		this.items = [[null]];
	},

	childMoved: function(){
		this.dirty();
	},

	childDirtied: function(){
		this.dirty();
	},

		//
		//  Frame
		//_________//

	updateSize: function Grid_updateSize(){
		return this.updateWidth().updateHeight();
	},

	updateWidth: function Grid_updateWidth(){
		return this.setWidth(this.items[0].length*this.slotWidth + (this.items[0].length-1)*this.xPadding);
	},

	updateHeight: function Grid_updateHeight(){
		return this.setHeight(this.items.length*this.slotHeight + (this.items.length-1)*this.yPadding);
	},

		//
		//  Slot Size
		//_____________//

	/**
	Sets the slot width.
	@method {Self} setSlotWidth
	@param {Number} width
	*/

	setSlotWidth: function Grid_setSlotWidth(width){
		//#ifdef DEBUG
		jayus.debug.match('Grid.setSlotWidth', width, 'width', jayus.TYPES.NUMBER);
		//#endif
		if(this.slotWidth !== width){
			this.slotWidth = width;
			this.updateSize();
		}
		return this;
	},

	/**
	Sets the slot height.
	@method {Self} setSlotHeight
	@param {Number} height
	*/

	setSlotHeight: function Grid_setSlotHeight(height){
		//#ifdef DEBUG
		jayus.debug.match('Grid.setSlotHeight', height, 'height', jayus.TYPES.NUMBER);
		//#endif
		if(this.slotHeight !== height){
			this.slotHeight = height;
			this.updateSize();
		}
		return this;
	},

	/**
	Sets the slot size.
	@method {Self} setSlotSize
	@paramset 1
	@param {Size} size
	@paramset 2
	@param {Number} width
	@param {Number} height
	*/

	setSlotSize: function Grid_setSlotSize(width, height){
		//#ifdef DEBUG
		jayus.debug.matchSize('Grid.setSlotSize', width, height);
		//#endif
		if(arguments.length === 1){
			height = width.height;
			width = width.width;
		}
		if(this.slotWidth !== width || this.slotHeight !== height){
			this.slotWidth = width;
			this.slotHeight = height;
			this.updateSize();
		}
		return this;
	},

		//
		//  Padding
		//___________//

	/**
	Sets the slot padding.
	@method {Self} setPadding
	@paramset 1
	@param {Point} padding
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	setPadding: function Grid_setPadding(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Grid.setPadding', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		this.xPadding = x;
		this.yPadding = y;
	},

		//
		//  Verification
		//________________//

	/**
	Returns the number of Entities in the grid.
	@method {Number} count
	*/

	count: function Grid_count(){
		var i, j, count = 0;
		for(i=0;i<this.getRowCount();i++){
			for(j=0;j<this.getColumnCount();j++){
				if(this.items[i][j] !== null){
					count++;
				}
			}
		}
		return count;
	},

	/**
	Returns the number of slots in the grid.
	@method {Number} slotCount
	*/

	slotCount: function Grid_slotCount(){
		return this.items.length*this.items[0].length;
	},

	/**
	Returns whether or not the given row/col pair is valid.
	@method {Boolean} hasSlot
	@paramset Syntax 1
	@param {Point} index
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	hasSlot: function Grid_hasSlot(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Grid.hasSlot', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.hasColumn(x) && this.hasRow(y);
	},

	/**
	Returns whether or not the given col number is valid.
	@method {Boolean} hasColumn
	@param {Number} col
	*/

	hasColumn: function Grid_hasColumn(x){
		//#ifdef DEBUG
		jayus.debug.match('Grid.hasColumn', x, 'x', jayus.TYPES.NUMBER);
		//#endif
		return 0 <= x && x < this.items[0].length;
	},

	/**
	Returns whether or not the given row number is valid.
	@method {Boolean} hasRow
	@param {Number} row
	*/

	hasRow: function Grid_hasRow(y){
		//#ifdef DEBUG
		jayus.debug.match('Grid.hasRow', y, 'y', jayus.TYPES.NUMBER);
		//#endif
		return 0 <= y && y < this.items.length;
	},

		//
		//  Items
		//_________//

	/**
	Returns whether the given object is in the grid.
	@method {Boolean} hasChild
	@paramset Syntax 1
	@param {Entity} item
	@paramset Syntax 2
	@param {*} id
	*/

	hasChild: function Grid_hasChild(item){
		var i, j;
		if(item instanceof jayus.Entity){
			for(i=0;i<this.getRowCount();i++){
				if(this.items[0].indexOf(item) >= 0){
					return true;
				}
			}
		}
		else{
			for(i=0;i<this.getRowCount();i++){
				for(j=0;j<this.getColumnCount();j++){
					if(this.items[i][j].id === item){
						return true;
					}
				}
			}
		}
		return false;
	},

	/**
	Returns the index of the specified entity in the grid, else null.
	<br> The index object returned has two properties, row and col.
	@method {Object|null} indexOf
	@paramset Syntax 1
	@param {Entity} item
	@paramset Syntax 2
	@param {*} id
	*/

	indexOf: function Grid_indexOf(item){
		var i, j;
		if(item instanceof jayus.Entity){
			for(i=0;i<this.getRowCount();i++){
				j = this.items[0].indexOf(item);
				if(j >= 0){
					return new jayus.Point(j, i);
				}
			}
		}
		else{
			for(i=0;i<this.getRowCount();i++){
				for(j=0;j<this.getColumnCount();j++){
					if(this.get(j, i).id === id){
						return new jayus.Point(j, i);
					}
				}
			}
		}
		return null;
	},

	/**
	Returns the specified item.
	<br> Returns null if the slot is empty.
	@method {Entity|null} getChild
	@paramset Syntax 1
	@param {Point} index
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	@paramset Syntax 3
	@param {String} id
	*/

	getChild: overloadArgumentType({

		object: function Grid_getChild(index){
			//#ifdef DEBUG
			jayus.debug.match('Grid.getChild', index, 'index', jayus.TYPES.OBJECT);
			//#endif
			return this.getChild(index.y, index.x);
		},

		number: function Grid_getChild(x, y){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Grid.getChild', arguments, jayus.TYPES.NUMBER, 'row', 'column');
			//#endif
			if(this.hasSlot(x, y)){
				return this.items[y][x];
			}
			return null;
		},

		// FIXME Grid.getChild() - Id can be of any type
		string: function Grid_getChild(id){
			//#ifdef DEBUG
			jayus.debug.match('Grid.getChild', id, 'id', jayus.TYPES.DEFINED);
			//#endif
			var i, j;
			for(i=0;i<this.getRowCount();i++){
				for(j=0;j<this.getColumnCount();j++){
					if(this.getChildAt(j, i).id === id){
						return this.items[i][j];
					}
				}
			}
			return null;
		}

	}),

	/**
	Sets the given child at the specified slot in the grid.
	@method {Self} setChild
	@paramset Syntax 1
	@param {Point} index
	@param {Entity} child
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	@param {Entity} child
	*/

	setChild: overloadArgumentCount({

		2: function Grid_setChild(index, child){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Grid.setChild', arguments, 'index', jayus.TYPES.NUMBER, 'child', jayus.TYPES.ENTITY);
			//#endif
			return this.setChild(index.x, index.y, child);
		},

		3: function Grid_setChild(x, y, child){
			//#ifdef DEBUG
			jayus.debug.matchArguments('Grid.setChild', arguments, 'x', jayus.TYPES.NUMBER, 'y',jayus.TYPES.NUMBER, 'child', jayus.TYPES.ENTITY);
			//#endif
			if(this.hasSlot(x, y)){
				// Get and update the old child
				var old = this.items[y][x];
				if(old !== null){
					old.removeParent();
				}
				// Set the new child
				this.items[y][x] = child;
				// Update the new child
				if(child !== null){
					child.setParent(this);
					child.translate(x*this.slotWidth+x*this.xPadding, y*this.slotHeight+y*this.yPadding);
					// FIXME: Grid.setChild() - Update cursor on added child
				}
				this.dirty();
			}
			return this;
		}

	}),

		//
		//  Slot Intersection
		//_____________________//

	/**
	Returns the child under the given position, or null.
	@method {Entity|null} getChildAt
	@paramset Syntax 1
	@param {Point} position
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	// FIXME: Grid.getChildAt() - This is a horrible way to brute force this
	getChildAt: function Grid_getChildAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Grid.getChildAt', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		var child = null;
		this.forEach(function(){
			if(this.intersectsAt(x, y)){
				child = this;
				return null;
			}
		});
		return child;
	},

	/**
	Returns the index of the slot under the given position.
	<br> An array consisting of [row,col] is returned.
	@method {Slot} getSlotAt
	@paramset Syntax 1
	@param {Point} pos
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	// FIXME: Grid.getSlotAt() - Should this include transformations?
	// FIXME: Grid.getSlotAt() - Does not include padding
	getSlotAt: function Grid_getSlotAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Grid.getSlotAt', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		x -= this.x;
		y -= this.y;
		return new jayus.Point(Math.floor(x/this.slotWidth), Math.floor(y/this.slotHeight));
	},

	/**
	Returns the frame of the given slot.
	<br> Returns null if the slot does not exist.
	@method {Rect|null} getSlotFrame
	@paramset Syntax 1
	@param {Point} index
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getSlotFrame: function Grid_getSlotFrame(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Grid.getSlotFrame', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.hasSlot(x, y) ? new jayus.Rectangle(this.x+x*(this.slotWidth+this.xPadding), this.y+y*(this.slotHeight+this.yPadding), this.slotWidth, this.slotHeight) : null;
	},

		//
		//  Element Removal
		//___________________//

	/**
	Removes the specified entity from the grid, replacing it with null in that slot.
	@method {Self} removeChild
	@paramset Syntax 1
	@param {Entity} item
	@paramset Syntax 2
	@param {String} id
	@paramset Syntax 3
	@param {Number} row
	@param {Number} col
	*/

	removeChild: overloadArgumentType({

		object: function Grid_removeChild(child){
			for(var i=0;i<this.getRowCount();i++){
				for(var j=0;j<this.getColumnCount();j++){
					if(this.getChild(i,j) === child){
						// Clear the child's parent
						child.removeParent();
						// Remove the child
						this.items[i][j] = null;
						return this;
					}
				}
			}
			return this;
		},

		string: function Grid_removeChild(id){
			for(var i=0;i<this.getRowCount();i++){
				for(var j=0;j<this.getColumnCount();j++){
					if(this.getChild(i,j).id === id){
						// Cache the child
						var child = this.items[i][j];
						// Clear the child's parent
						child.removeParent();
						// Remove the child
						this.items[i][j] = null;
						return this;
					}
				}
			}
			return this;
		},

		number: function Grid_removeChild(row,col){
			if(this.has(row,col)){
				// Cache the item
				var item = this.items[row][col];
				// Clear the item's parent
				item.removeParent();
				// Remove the item
				this.items[row][col] = null;
			}
			return this;
		}

	}),

	// removeChild2: function Grid_removeChild2(a, b){
	// 	var row, col, item, checkId;
	// 	if(arguments.length === 1){
	// 		checkId = typeof a === 'string';
	// 		LOOP:for(row=0;row<this.getRowCount();row++){
	// 			for(col=0;col<this.getColumnCount();col++){
	// 				item = this.getChild(row, col);
	// 				if(checkId && item.id === a || !checkId && item === a){
	// 					break LOOP;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	else{
	// 		row = a;
	// 		col = b;
	// 		if(!this.has(row, col)){
	// 			// ERROR
	// 		}
	// 	}
	// 	// Get the item
	// 	item = this.items[row][col];
	// 	// Clear the item's parent
	// 	item.removeParent();
	// 	// Remove the item
	// 	this.items[row][col] = null;
	// 	return this;
	// },

		//
		//	Size
		//________//

	/**
	Sets the size of the grid.
	@method {Self} setGridSize
	@param {Number} columns
	@param {Number} rows
	*/

	setGridSize: function Grid_setGridSize(columns, rows){
		return this.setColumnCount(columns).setRowCount(rows);
	},

		//
		//  Rows
		//________//

	/**
	Returns the number of rows in the grid.
	@method {Number} getRowCount
	*/

	getRowCount: function Grid_getRowCount(){
		return this.items.length;
	},

	/**
	Sets the number of rows in the grid.
	@method {Self} setRowCount
	@param {Number} rows
	*/

	setRowCount: function Grid_setRowCount(rows){
		//#ifdef DEBUG
		jayus.debug.match('Grid.setRowCount', rows, 'rows', jayus.TYPES.NUMBER);
		//#endif
		while(rows < this.getRowCount()){
			this.removeRow();
		}
		while(rows > this.getRowCount()){
			this.addRow();
		}
		return this;
	},

	/**
	Appends the given row to the bottom of the grid.
	<br> The given row may be shorter than needed, if so it will be padded with null.
	@method {Self} addRow
	@param {Array} row Optional
	*/

	addRow: function Grid_addRow(row){
		if(!arguments.length){
			row = [];
		}
		while(row.length < this.getColumnCount()){
			row.push(null);
		}
		this.items.push(row);
		this.updateSize();
		return this.dirty();
	},

	/**
	Removes the specified row from the grid.
	@method {Self} removeRow
	@param {Number} row
	*/

	removeRow: function Grid_removeRow(index){
		//#ifdef DEBUG
		jayus.debug.match('Grid.removeRow', index, 'index', jayus.TYPES.NUMBER);
		//#endif
		this.forEachInRow(index, function(){
			this.removeParent();
		});
		if(this.getRowCount() > 1 && this.hasRow(index)){
			this.items.splice(index,1);
		}
		this.updateSize();
		return this.dirty();
	},

		//
		//  Cols
		//________//

	/**
	Returns the number of columns in the grid.
	@method {Number} getColumnCount
	*/

	getColumnCount: function Grid_getColumnCount(){
		return this.items[0].length;
	},

	/**
	Sets the number of columns in the grid.
	@method {Self} setColumnCount
	@param {Number} cols
	*/

	setColumnCount: function Grid_setColumnCount(cols){
		//#ifdef DEBUG
		jayus.debug.match('Grid.setColumnCount', cols, 'cols', jayus.TYPES.NUMBER);
		//#endif
		while(cols < this.getColumnCount()){
			this.removeColumn();
		}
		while(cols > this.getColumnCount()){
			this.addColumn();
		}
		return this;
	},

	/**
	Appends the given column to the end of the grid.
	<br> The given column may be shorter than needed, if so it will be padded with null.
	@method {Self} addColumn
	@param {Array} col Optional
	*/

	addColumn: function Grid_addColumn(col){
		if(!arguments.length){
			col = [];
		}
		while(col.length < this.getRowCount()){
			col.push(null);
		}
		for(var i=0;i<this.getRowCount();i++){
			this.items[i].push(col[i]);
		}
		this.updateSize();
		return this.dirty();
	},

	/**
	Removes the specified col from the grid.
	@method {Self} removeColumn
	@param {Number} col
	*/

	removeColumn: function Grid_removeColumn(index){
		//#ifdef DEBUG
		jayus.debug.match('Grid.removeColumn', index, 'index', jayus.TYPES.NUMBER);
		//#endif
		this.forEachInColumn(index, function(){
			this.removeParent();
		});
		if(this.getColumnCount() > 1 && this.hasColumn(index)){
			for(var i=0;i<this.getRowCount();i++){
				this.items[i].splice(index,1);
			}
		}
		this.updateSize();
		return this.dirty();
	},

		//
		//  Iteration
		//_____________//

	/**
	Calls the specified method on all children in the group with the given arguments.
	<br> The argument array is optional.
	@method {Self} onEach
	@param {String} method
	@param {Array} args Optional
	*/

	onEach: function Grid_onEach(method, args){
		//#ifdef DEBUG
		jayus.debug.match('Grid.onEach', method, 'method', jayus.TYPES.STRING);
		//#endif
		return this.forEachSlot(function(item){
			if(item !== null){
				item[method].apply(item, args);
			}
		});
	},

	/**
	Calls the given function on all children in the group with the given arguments.
	<br> The argument array is optional.
	@method {Self} forEach
	@param {Function} func
	@param {Array} args Optional
	*/

	forEach: function Grid_forEach(func, args){
		//#ifdef DEBUG
		jayus.debug.match('Grid.forEach', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		return this.forEachSlot(function(row, col, item){
			if(item !== null){
				func.call(this, row, col, item);
			}
		});
	},

	/**
	Calls the given function on all children in the specified row.
	<br> The argument array is optional.
	@method {Self} forEachInRow
	@param {Number} row
	@param {Function} func
	@param {Array} args Optional
	*/

	forEachInRow: function Grid_forEachInRow(row, func, args){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Grid.forEachInRow', arguments, 'row', jayus.TYPES.NUMBER, 'func', jayus.TYPES.FUNCTION);
		//#endif
		if(this.hasRow(row)){
			for(var j=0,item;j<this.getColumnCount();j++){
				item = this.items[row][j];
				if(item !== null){
					func.apply(item, args);
				}
			}
		}
		return this;
	},

	/**
	Calls the given function on all children in the specified column.
	<br> The argument array is optional.
	@method {Self} forEachInColumn
	@param {Number} col
	@param {Function} func
	@param {Array} args Optional
	*/

	forEachInColumn: function Grid_forEachInColumn(col, func, args){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Grid.forEachInColumn', arguments, 'col', jayus.TYPES.NUMBER, 'func', jayus.TYPES.FUNCTION);
		//#endif
		if(this.hasColumn(col)){
			for(var i=0,item;i<this.getRowCount();i++){
				item = this.items[i][col];
				if(item !== null){
					func.apply(item, args);
				}
			}
		}
		return this;
	},

	/**
	Calls the given function on each slot in the grid.
	<br> The arguments passed to the function are the rowIndex, columnIndex, and value at the slot(or null).
	@method {Self} forEachSlot
	@param {Function} func
	*/

	forEachSlot: function Grid_forEachSlot(func){
		//#ifdef DEBUG
		jayus.debug.match('Grid.forEachSlot', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		for(var i=0;i<this.items.length;i++){
			for(var j=0;j<this.items[0].length;j++){
				if(func.call(this, i, j, this.items[i][j]) === null){
					return this;
				}
			}
		}
		return this;
	},

		//
		//  Events
		//__________//

	findCursorAcceptor: function Grid_findCursorAcceptor(){
		var ret = null;
		this.forEach(function(x, y, item){
			if(item.underCursor){
				if(item.isParent){
					acceptor = item.findCursorAcceptor();
					if(acceptor !== null){
						ret = acceptor;
						return null;
					}
					if(item.canAcceptCursor){
						ret = item;
						return null;
					}
				}
				else if(item.canAcceptCursor){
					ret = item;
					return null;
				}
			}
			// if(child.underCursor && child.canAcceptCursor){
			// 	return child;
			// }
		});
		return ret;
	},

	/**
	Fires the given event on each child in the group.
	<br> The event is not fired on the group.
	<br> Returns true if the event was accepted.
	@method {Boolean} fireOnEach
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnEach: function Grid_fireOnEach(event, data){
		//#ifdef DEBUG
		jayus.debug.match('Grid.fireOnEach', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Loop through the children
		var i, j;
		for(i=0;i<this.getRowCount();i++){
			for(j=0;j<this.getColumnCount();j++){
				// Check for a child
				if(this.has(i, j)){
					// Fire the event on the child, return true if accepted
					if(this.get(i, j).fire(event, data)){
						return true;
					}
				}
			}
		}
		return false;
	},

	/**
	Fires the given event on the child under the cursor.
	<br> The event is not fired on the group.
	<br> Returns true if the event was accepted.
	@method {Boolean} fireOnCursor
	@param {String} event
	@param {Object} data Optional
	*/

	fireOnCursor: function Grid_fireOnCursor(event, data){
		// TODO: Grid.fireOnCursor() - Replace slow method
		//#ifdef DEBUG
		jayus.debug.match('Grid.fireOnCursor', event, 'event', jayus.TYPES.STRING);
		//#endif
		// Loop through the children
		var i, j, item;
		for(i=0;i<this.items.length;i++){
			for(j=0;j<this.items[i].length;j++){
				item = this.items[i];
				// Check if the cursor is over the child
				if(item.underCursor){
					// Check if the child is a group, fire the event on the group's children, return true if accepted
					if(item.isParent && item.fireOnCursor(event, data)){
						return true;
					}
					// Fire the event on the group, return true if accepted
					if(item.fire(event, data)){
						return true;
					}
				}
			}
		}
		return false;
	},

	// TODO: Grid.updateCursorOnChildren() - If we assume that no children overlap, this can be made faster

	updateCursorOnChildren:  function Grid_updateCursorOnChildren(x, y, data){
		// Translate point from parent to local coordinate space
		var pos = this.parentToLocal(x, y);
		if(this.isTransformed){
			pos = this.getMatrix().inverseTransformPoint(pos.x, pos.y);
		}
		x = pos.x;
		y = pos.y;
		this.forEach(function(i, j, item){
			if(item.trackCursor){
				jayus.util.updateCursorOnChild(item, x, y);
			}
		});
	},

	removeCursorFromChildren:  function Grid_removeCursorFromChildren(data){
		this.forEach(function(x, y, item){
			item.removeCursor();
		});
	},

	runOnCursor: function Grid_runOnCursor(func, args){
		//#ifdef DEBUG
		jayus.debug.match('Grid.runOnCursor', func, 'func', jayus.TYPES.FUNCTION);
		//#endif
		// Loop through the children
		this.forEach(function(i, j, item){
			// Check if the cursor is over the child
			if(item.underCursor){
				// If the child is a parent, run on its children
				if(item.isParent && item.runOnCursor(func, args)){
					return true;
				}
				// Run the function on the child, return true if cancelled
				if(func.apply(item, args)){
					return true;
				}
			}
		});
	},

		//
		//  Rendering
		//_____________//

	//@ From RectEntity
	paintContents: function Grid_paintContents(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('Grid.paintContents', ctx);
		//#endif
		// Loop through and draw the items
		var i, j, item;
		for(i=0;i<this.items.length;i++){
			for(j=0;j<this.items[i].length;j++){
				item = this.items[i][j];
				// Draw the item if exists and visible
				if(item !== null && item.visible){
					item.drawOntoContext(ctx);
				}
			}
		}
	}

});
