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
Defines the hBox and vBox entities.
@file Box.js
*/

//
//  jayus.Box()
//_______________//

/**
Base class for the hBox and vBox entities.
<br> This is an abstract class, use the hBox and vBox entities instead.
@class jayus.Box
@extends jayus.RectEntity
@extends jayus.Group
*/

jayus.Box = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	width: 100,

	height: 100,

	/**
	The amount of visible space between each slot.
	<br> Default is 8.
	<br> Do not modify.
	@property {Number} spacing
	*/

	spacing: 8,
	//#replace jayus.Box.prototype.space 8

	/**
	Whether to reverse the order of the children.
	<br> Default is false.
	<br> Do not modify.
	@property {Boolean} reversed
	*/

	reversed: false,
	//#replace jayus.Box.prototype.reversed false

	isParent: true,

	forming: false,

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	init: function Box(object) {
		jayus.Entity.prototype.init.apply(this,arguments);
		this.children = new jayus.List(this);
		this.items = this.children.items;
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#end
		this.addHandler('dirty', function Box_dirtyHandler(type) {
			if(type & jayus.DIRTY.SIZE) {
				this.formContents();
			}
		});
	},

	toObject: function Box_toObject() {
		var object = jayus.RectEntity.prototype.toObject.call(this);
		jayus.groupToObject.call(this, object);
		object.id = '__Box__';
		if(this.spacing !== jayus.Box.prototype.spacing) {
			object.spacing = this.spacing;
		}
		if(this.reversed !== jayus.Box.prototype.reversed) {
			object.reversed = this.reversed;
		}
		return object;
	},

	initFromObject: function Box_initFromObject(object) {
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		jayus.groupInitFromObject.call(this, object);
		if(typeof object.spacing === 'number') {
			this.setSpacing(object.spacing);
		}
		if(typeof object.reversed === 'boolean') {
			this.setReversed(object.reversed);
		}
		return this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Children
		//____________//

	componentDirtied: function Box_componentDirtied(component, type) {
		if(!this.forming) {
			this.dirty(jayus.DIRTY.ALL);
		}
	},

	listItemRemoved: function Box_listItemRemoved(list, item) {
		item.removeParent();
		this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Reversed
		//___________//

	/**
	Sets the reversed flag.
	@method {Self} setReversed
	@param {Boolean} on
	*/

	setReversed: function Box_setReversed(on) {
		//#ifdef DEBUG
		jayus.debug.match('Box.setReversed', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.reversed !== on) {
			this.reversed = on;
			this.formContents();
		}
		return this;
	},

		//
		//  Spacing
		//___________//

	/**
	Sets the amount of spacing.
	<br> Does not resize the box, but its children.
	@method {Self} setSpacing
	@param {Number} spacing
	*/

	setSpacing: function Box_setSpacing(spacing) {
		//#ifdef DEBUG
		jayus.debug.match('Box.setSpacing', spacing, 'spacing', jayus.TYPES.NUMBER);
		//#end
		if(this.spacing !== spacing) {
			this.spacing = spacing;
			this.formContents();
		}
		return this;
	},

		//
		//  Bounds
		//__________//

	findGreatestMinimalChildWidth: function Box_findGreatestMinimalChildWidth() {
		var width = 0;
		//Loop through every child, keeping track of the greatest requested width.
		for(var i=0;i<this.items.length;i++) {
			width = Math.max(width, this.items[i].minW);
		}
		return width;
	},

	findGreatestMinimalChildHeight: function Box_findGreatestMinimalChildHeight() {
		var height = 0;
		//Loop through every child, keeping track of the greatest requested height.
		for(var i=0;i<this.items.length;i++) {
			height = Math.max(height, this.items[i].minH);
		}
		return height;
	},

	paintContents: jayus.Scene.prototype.paintContents

});

jayus.applyObject(jayus.Group, jayus.Box.prototype);

//
//  jayus.hBox()
//__________________//

/**
An Entity that organizes its children into a horizontal row.
@class jayus.hBox
@extends jayus.Box
*/

jayus.hBox = jayus.Box.extend({

	//
	//  Methods
	//___________//

	toObject: function hBox_toObject() {
		var object = jayus.Box.prototype.toObject.call(this);
		object.type = 'hBox';
		return object;
	},

	listItemAdded: function hBox_listItemAdded(list, item) {
		// Give the item a blank width policy
		if(typeof item.widthPolicy !== 'object') {
			item.widthPolicy = new jayus.SizePolicy();
		}
		item.setParent(this);
		this.dirty(jayus.DIRTY.ALL);
	},

	listItemsAdded: function hBox_listItemsAdded(list, items) {
		var i, item;
		for(i=0;i<items.length;i++) {
			item = items[i];
			// Give the item a blank width policy
			if(typeof item.widthPolicy !== 'object') {
				item.widthPolicy = new jayus.SizePolicy();
			}
			item.setParent(this);
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	formContents: function hBox_formContents() {

		this.forming = true;

		var i, item,
			x = 0,
			space = this.width-(this.items.length-1)*this.spacing,
			totalWeight = 0,
			totalFixedSize = 0,
			itemWidth, itemHeight,
			minW,
			minH;

		// Tally up all the weights, fixed space, and extra space

		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			if(item.hasFlexibleWidth) {
				totalFixedSize += item.widthPolicy.size;
				if(item.widthPolicy.expand) {
					totalWeight += item.widthPolicy.weight;
				}
			}
			else {
				totalFixedSize += item.width;
			}
		}

		var extraSpace = space-totalFixedSize;

		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			// Get the height
			if(item.hasFlexibleHeight) {
				itemHeight = this.height;
			}
			else {
				itemHeight = item.height;
			}
			// Get the width
			if(item.hasFlexibleWidth) {
				if(item.widthPolicy.expand) {
					itemWidth = item.widthPolicy.size+extraSpace*(item.widthPolicy.weight/totalWeight);
				}
				else {
					itemWidth = item.widthPolicy.size;
				}
			}
			else {
				itemWidth = item.width;
			}
			item.x = x;
			x += itemWidth+this.spacing;
			// Set the item size
			// item.setSize(itemWidth, itemHeight);
			// item.frozen--;
			item.changeSize(itemWidth, itemHeight);
			// item.width = itemWidth;
			// item.height = itemHeight;
			// item.frozen++;

		}

		// Find out our minimum width/height
		// This must be done AFTER all the previous forming

		minW = -this.spacing;
		minH = 0;
		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			if(typeof item.minWidth === 'number') {
				minW += item.minWidth;
			}
			minW += this.spacing;
			if(typeof item.minHeight === 'number' && item.minHeight > minH) {
				minH = item.minHeight;
			}
		}

		this.minWidth = minW;
		this.minHeight = minH;

		if(this.width < this.minWidth) {
			this.changeSize(this.minWidth, this.height);
		}

		if(this.height < this.minHeight) {
			this.changeSize(this.width, this.minHeight);
		}

		this.forming = false;

	}

});

//
//  jayus.vBox()
//________________//

/**
A widget that organizes its children into a vertical column.
@class jayus.vBox
@extends jayus.Box
*/

jayus.vBox = jayus.Box.extend({

	//
	//  Methods
	//___________//

	toObject: function vBox_toObject() {
		var object = jayus.Box.prototype.toObject.call(this);
		object.type = 'vBox';
		return object;
	},

	listItemAdded: function vBox_listItemAdded(list, item) {
		// Give the item a blank height policy
		if(typeof item.heightPolicy !== 'object') {
			item.heightPolicy = new jayus.SizePolicy();
		}
		item.setParent(this);
		this.dirty(jayus.DIRTY.ALL);
	},

	listItemsAdded: function vBox_listItemsAdded(list, items) {
		var i, item;
		for(i=0;i<items.length;i++) {
			item = items[i];
			// Give the item a blank width policy
			if(typeof item.heightPolicy !== 'object') {
				item.heightPolicy = new jayus.SizePolicy();
			}
			item.setParent(this);
		}
		this.dirty(jayus.DIRTY.ALL);
	},

	formContents: function vBox_formContents() {

		if(this.forming) return;

		this.forming = true;

		var i, item,
			y = 0,
			space = this.height-(this.items.length-1)*this.spacing,
			totalWeight = 0,
			totalFixedSize = 0,
			itemWidth, itemHeight,
			minW, minH;

		// Tally up all the weights, fixed space, and extra space

		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			if(item.heightPolicy.flexible) {
				totalFixedSize += item.heightPolicy.size;
				if(item.heightPolicy.expand) {
					totalWeight += item.heightPolicy.weight;
				}
			}
			else {
				totalFixedSize += item.height;
			}
		}

		var extraSpace = space-totalFixedSize;

		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			// Get the width
			// if(item.widthPolicy.flexible) {
				itemWidth = this.width;
			// }
			// else {
			// 	itemWidth = item.width;
			// }
			// Get the height
			if(item.heightPolicy.flexible) {
				if(item.heightPolicy.expand) {
					itemHeight = item.heightPolicy.size+extraSpace*(item.heightPolicy.weight/totalWeight);
				}
				else {
					itemHeight = item.heightPolicy.size;
				}
			}
			else {
				itemHeight = item.height;
			}
			item.y = y;
			y += itemHeight+this.spacing;
			// Set the item size
			// item.setSize(itemWidth, itemHeight);
			// item.frozen--;
			item.setSize(itemWidth, itemHeight);
			// item.frozen++;
		}

		// Find out our minimum width/height
		// This must be done AFTER all the previous forming

		minW = 0;
		minH = -this.spacing;
		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			minH += this.spacing;
			if(typeof item.minWidth === 'number' && item.minWidth > minH) {
				minW = item.minWidth;
			}
			if(typeof item.minHeight === 'number') {
				minH += item.minHeight;
			}
		}

		this.minWidth = minW;
		this.minHeight = minH;

		if(this.width < this.minWidth) {
			this.changeSize(this.minWidth, this.height);
		}

		if(this.height < this.minHeight) {
			this.changeSize(this.width, this.minHeight);
		}

		this.forming = false;

	}

});