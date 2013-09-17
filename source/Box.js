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
Defines the hBox and vBox Entities.
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

// Notes:

		// Setting default policies
		// TODO: Find a better way:
		//		Add onto child when added, requires code duplication
		//		Use default if not there, requires lots of type checking

//#ifdef DEBUG
jayus.debug.className = 'Box';
//#endif

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

	/**
	Whether to reverse the order of the children.
	<br> Default is false.
	<br> Do not modify.
	@property {Boolean} reversed
	*/

	reversed: false,

	isParent: true,

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	init: function Box_init(){
		jayus.Entity.prototype.init.apply(this,arguments);
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#endif
	},

		//
		//  Children
		//____________//

	componentDirtied: function Box_componentDirtied(component, componentType, type){
		if(type === jayus.DIRTY.SIZE){
			this.reform();
		}
		else{
			this.dirty(jayus.DIRTY.CONTENT);
		}
	},

	listItemAdded: function Box_listItemAdded(list, item){
		item.setParent(this);
		this.reform();
	},

	listItemsAdded: function Box_listItemsAdded(list, items){
		for(var i=0;i<items.length;i++){
			items[i].setParent(this);
		}
		this.reform();
	},

	listItemRemoved: function Box_listItemRemoved(list, item){
		item.removeParent();
		this.reform();
	},

	listItemsRemoved: function Box_listItemsRemoved(list, items){
		for(var i=0;i<items.length;i++){
			items[i].removeParent();
		}
		this.reform();
	},

	reform: function Box_reform(){
		this.formContents(this.width, this.height);
		this.dirty(jayus.DIRTY.SIZE);
	},

		//
		//  Reversed
		//___________//

	/**
	Sets the reversed flag.
	@method {Self} setReversed
	@param {Boolean} on
	*/

	setReversed: function Box_setReversed(on){
		//#ifdef DEBUG
		jayus.debug.match('Box.setReversed', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.reversed !== on){
			this.reversed = on;
			this.reform();
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

	setSpacing: function Box_setSpacing(spacing){
		//#ifdef DEBUG
		jayus.debug.match('Box.setSpacing', spacing, 'spacing', jayus.TYPES.NUMBER);
		//#endif
		if(this.spacing !== spacing){
			this.spacing = spacing;
			this.reform();
		}
		return this;
	},

		//
		//  Bounds
		//__________//

	findGreatestMinimalChildWidth: function Box_findGreatestMinimalChildWidth(){
		var width = 0;
		//Loop through every child, keeping track of the greatest requested width.
		for(var i=0;i<this.children.items.length;i++){
			width = Math.max(width, this.children.items[i].minW);
		}
		return width;
	},

	findGreatestMinimalChildHeight: function Box_findGreatestMinimalChildHeight(){
		var height = 0;
		//Loop through every child, keeping track of the greatest requested height.
		for(var i=0;i<this.children.items.length;i++){
			height = Math.max(height, this.children.items[i].minH);
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

//#ifdef DEBUG
jayus.debug.className = 'hBox';
//#endif

jayus.hBox = jayus.Box.extend({

	//
	//  Methods
	//___________//

	hasFlexibleWidth: function hBox_hasFlexibleWidth(){
		if(!this.children.items.length){
			return true;
		}
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			if(item.hasFlexibleWidth()){
				return true;
			}
		}
		return false;
	},

	hasFlexibleHeight: function hBox_hasFlexibleHeight(){
		return true;
	},

	formContents: function hBox_formContents(width, height){

		var i, item,
			x = 0,
			space = width-(this.children.items.length-1)*this.spacing,
			totalWeight = 0,
			totalFixedSize = 0,
			itemWidth, itemHeight;

		// Tally up all the weights, fixed space, and extra space

		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Give the item the default size policy
			if(typeof item.policy !== 'object'){
				item.policy = new jayus.SizePolicy();
			}
			if(item.hasFlexibleWidth()){
				totalFixedSize += item.policy.size;
				if(item.policy.expand){
					totalWeight += item.policy.weight;
				}
			}
			else{
				totalFixedSize += item.width;
			}
		}

		var extraSpace = space-totalFixedSize;

		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Get the height
			if(item.hasFlexibleHeight()){
				itemHeight = height;
			}
			else{
				itemHeight = item.height;
			}
			// Get the width
			if(item.hasFlexibleWidth()){
				if(item.policy.expand){
					itemWidth = item.policy.size+extraSpace*(item.policy.weight/totalWeight);
				}
				else{
					itemWidth = item.policy.size;
				}
			}
			else{
				itemWidth = item.width;
			}
			item.x = x;
			x += itemWidth+this.spacing;
			// Set the item size
			item.frozen--;
			item.changeSize(itemWidth, itemHeight);
			item.frozen++;

		}

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

//#ifdef DEBUG
jayus.debug.className = 'vBox';
//#endif

jayus.vBox = jayus.Box.extend({

	//
	//  Methods
	//___________//

	hasFlexibleWidth: function vBox_hasFlexibleWidth(){
		return true;
	},

	hasFlexibleHeight: function vBox_hasFlexibleHeight(){
		if(!this.children.items.length){
			return true;
		}
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			if(item.hasFlexibleHeight()){
				return true;
			}
		}
		return false;
	},

	formContents: function vBox_formContents(width, height){

		var i, item,
			y = 0,
			space = height-(this.children.items.length-1)*this.spacing,
			totalWeight = 0,
			totalFixedSize = 0,
			itemWidth, itemHeight;

		// Tally up all the weights, fixed space, and extra space

		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Set the default policy
			if(typeof item.policy !== 'object'){
				item.policy = new jayus.SizePolicy();
			}
			if(item.hasFlexibleHeight()){
				totalFixedSize += item.policy.size;
				if(item.policy.expand){
					totalWeight += item.policy.weight;
				}
			}
			else{
				totalFixedSize += item.height;
			}
		}

		var extraSpace = space-totalFixedSize;

		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			// Get the width
			if(item.hasFlexibleWidth()){
				itemWidth = width;
			}
			else{
				itemWidth = item.width;
			}
			// Get the height
			if(item.hasFlexibleHeight()){
				if(item.policy.expand){
					itemHeight = item.policy.size+extraSpace*(item.policy.weight/totalWeight);
				}
				else{
					itemHeight = item.policy.size;
				}
			}
			else{
				itemHeight = item.height;
			}
			item.y = y;
			y += itemHeight+this.spacing;
			// Set the item size
			item.frozen--;
			item.changeSize(itemWidth, itemHeight);
			item.frozen++;
		}

	}

});