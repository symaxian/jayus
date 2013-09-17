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
Defines the hStack and vStack Entities.
@file Stack.js
*/

//
//  jayus.Stack()
//_________________//

// Notes:

/**
Base class for the hStack and vStack entities.
<br> This is an abstract class, use the hStack and vStack classes instead.
@class jayus.Stack
@extends jayus.Group
*/

//#ifdef DEBUG
jayus.debug.className = 'Stack';
//#endif

jayus.Stack = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	The amount of visible space between each slot.
	<br> Default is 8
	@property {Number} spacing
	*/

	spacing: 8,

	reversed: false,

	isParent: true,

	//
	//  Methods
	//___________//

		//
		//  Children
		//____________//

	listItemAdded: function Stack_listItemAdded(list, item){
		this.formSelf();
	},

	listItemRemoved: function Stack_listItemRemoved(list, item){
		this.formSelf();
	},

	listItemsAdded: function Stack_listItemsAdded(list, items){
		for(var i=0;i<items.length;i++){
			this.listItemAdded(list, items[i]);
		}
	},

	listItemsRemoved: function Stack_listItemsRemoved(list, items){
		for(var i=0;i<items.length;i++){
			this.listItemRemoved(list, items[i]);
		}
	},

	childDirtied: function Stack_childDirtied(){
		this.dirty();
	},

	childMoved: function Stack_childMoved(){
		this.dirty();
	},

	childSizeChanged: function Stack_childSizeChanged(){
		this.formSelf();
	},

		//
		//  Initiation
		//______________//

	init: function Stack_init(){
		jayus.Entity.prototype.init.apply(this,arguments);
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#endif
	},

	hasFlexibleWidth: function Stack_hasFlexibleWidth(){
		return false;
	},

	hasFlexibleHeight: function Stack_hasFlexibleHeight(){
		return false;
	},

		//
		//  Reversed
		//____________//

	/**
	Sets the reversed flag on the stack.
	@method {Self} setReversed
	@param {Boolean} on
	*/

	setReversed: function Stack_setReversed(on){
		//#ifdef DEBUG
		jayus.debug.match('Stack.setReversed', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.reversed !== on){
			this.reversed = on;
			this.formSelf();
		}
		return this;
	},

		//
		//  Spacing
		//___________//

	/**
	Sets the amount of spacing between the elements in the box.
	@method {Self} setSpacing
	@param {Number} spacing
	*/

	setSpacing: function Stack_setSpacing(spacing){
		//#ifdef DEBUG
		jayus.debug.match('Stack.setSpacing', spacing, 'spacing', jayus.TYPES.NUMBER);
		//#endif
		if(this.spacing !== spacing){
			this.spacing = spacing;
			this.formSelf();
		}
		return this;
	},

		//
		//  Bounds
		//__________//

	findGreatestMinimalChildWidth: function Stack_findGreatestMinimalChildWidth(){
		var i, width = 0;
		//Loop through every child, keeping track of the greatest requested width.
		for(i=0;i<this.children.items.length;i++){
			width = Math.max(width, this.children.items[i].minW);
		}
		return width;
	},

	findGreatestMinimalChildHeight: function Stack_findGreatestMinimalChildHeight(){
		var i, height = 0;
		//Loop through every child, keeping track of the greatest requested height.
		for(i=0;i<this.children.items.length;i++){
			height = Math.max(height, this.children.items[i].minH);
		}
		return height;
	},

	reform: function Stack_reform(){
		this.formSelf(this.width, this.height);
	},

	paintContents: jayus.Scene.prototype.paintContents

});

jayus.applyObject(jayus.Group, jayus.Stack.prototype);

//
//  jayus.hStack()
//__________________//

/**
An Entity that organizes child widgets into a horizontal row.
@class jayus.hStack
@extends jayus.Stack
*/

jayus.hStack = jayus.Stack.extend({

	/**
	Whether or not the height of the stack is computed from its children.
	<br> If true, the height of the stack is the largest height of its children.
	<br> If false, the stack will always hold the fixed height.
	<br> Do not modify.
	<br> Default is false.
	@property {Boolean} automaticHeight
	*/

	automaticHeight: true,

	//
	//  Methods
	//___________//

	formSelf: function hStack_formSelf(){

		var w = 0,
			h = 0,
			newH,
			i, item;

		if(this.reversed){
			for(i=this.children.items.length-1;i>=0;i--){
				item = this.children.items[i];
				item.setX(w);
				w += item.width+this.spacing;
				if(this.automaticHeight){
					newH = item.height;
					if(newH > h){
						h = newH;
					}
				}
			}
		}
		else{
			for(i=0;i<this.children.items.length;i++){
				item = this.children.items[i];
				item.setX(w);
				w += item.width+this.spacing;
				if(this.automaticHeight){
					newH = item.height;
					if(newH > h){
						h = newH;
					}
				}
			}
		}

		var width = w-this.spacing,
			heigth = this.height;

		if(this.automaticHeight){
			height = h;
		}

		this.changeSize(width, height);

	}

});

//
//  jayus.vStack()
//__________________//

/**
A widget that organizes child widgets into a vertical column.
@class jayus.vStack
@extends jayus.Stack
*/

jayus.vStack = jayus.Stack.extend({

	/**
	Whether or not the height of the stack is computed from its children.
	<br> If true, the height of the stack is the largest height of its children.
	<br> If false, the stack will always hold the fixed height.
	<br> Do not modify.
	<br> Default is false.
	@property {Boolean} automaticWidth
	*/

	automaticWidth: true,

	/**
	Gets the automaticWidth flag on the stack.
	@method {Boolean} getAutomaticWidth
	*/

	getAutomaticWidth: function vStack_getAutomaticWidth(){
		return this.automaticWidth;
	},

	/**
	Sets the automaticWidth flag on the stack.
	@method {Self} setAutomaticWidth
	@param {Boolean} on
	*/

	setAutomaticWidth: function vStack_setAutomaticWidth(on){
		//#ifdef DEBUG
		jayus.debug.match('vStack.setAutomaticWidth', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.automaticWidth !== on){
			this.automaticWidth = on;
			this.reform();
		}
		return this;
	},

	//
	//  Methods
	//___________//

	formSelf: function vStack_formSelf(){

		var h = 0,
			w = 0;

		for(var i=0;i<this.children.items.length;i++){
			var item = this.children.items[i];
			item.frozen++;
			item.setY(h);
			item.frozen--;
			h += item.height+this.spacing;
			if(this.automaticWidth){
				var newW = item.width;
				if(newW > w){
					w = newW;
				}
			}
		}

		var height = h-this.spacing,
			width = this.width;

		if(this.automaticWidth){
			width = w;
		}

		this.changeSize(width, height);

	}

});