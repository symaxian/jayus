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
	//#replace jayus.Stack.prototype.spacing 8

	/**
	Whether to reverse the order of the children or not.
	<br> Default is false
	@property {Boolean} reversed
	*/

	reversed: false,
	//#replace jayus.Stack.prototype.reversed 8

	isParent: true,

	//#ifdef DEBUG

	hasFlexibleWidth: false,

	hasFlexibleHeight: false,

	//#end

	//
	//  Methods
	//___________//

	init: function Stack_init(){
		jayus.RectEntity.prototype.init.apply(this, arguments);
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#end
		this.addHandler('dirty', function(type){
			if(type & jayus.DIRTY.SIZE){
				// this.formContents();
			}
		});
	},

	toObject: function Stack_toObject() {
		var object = jayus.RectEntity.prototype.toObject.apply(this);
		jayus.groupToObject.call(this, object);
		// Add our own properties
		object.type = 'Stack';
		if (this.spacing !== jayus.Stack.prototype.spacing) {
			object.spacing = this.spacing;
		}
		if (this.reversed !== jayus.Stack.prototype.reversed) {
			object.reversed = this.reversed;
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function Stack_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Stack.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		this.frozen++;
		// Apply parent properties
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		jayus.groupInitFromObject.call(this, object);
		// Apply our own properties
		if (typeof object.spacing === 'number') {
			this.spacing = object.spacing;
		}
		if (typeof object.reversed === 'boolean') {
			this.reversed = object.reversed;
		}
		this.frozen--;
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	componentDirtied: function Stack_componentDirtied(component, type){

		this.dirty(jayus.DIRTY.ALL);

	},

		//
		//  Children
		//____________//

	listItemAdded: function Stack_listItemAdded(list, item){
		this.formContents();
		item.setParent(this);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemRemoved: function Stack_listItemRemoved(list, item){
		this.formContents();
		item.removeParent();
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsAdded: function Stack_listItemsAdded(list, items){
		this.formContents();
		for(var i=0;i<items.length;i++){
			item = items[i];
			item.setParent(this);
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsRemoved: function Stack_listItemsRemoved(list, items){
		this.formContents();
		for(var i=0;i<items.length;i++){
			item = items[i];
			item.removeParent();
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsMoved: function Stack_listItemsMoved(){
		this.formContents();
		this.dirty(jayus.DIRTY.CONTENT);
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
		//#end
		if(this.reversed !== on){
			this.reversed = on;
			this.formContents();
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
		//#end
		if(this.spacing !== spacing){
			this.spacing = spacing;
			this.formContents();
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
		this.formContents(this.width, this.height);
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
	//#replace jayus.hStack.prototype.automaticHeight true

	//
	//  Methods
	//___________//

	toObject: function hStack_toObject() {
		var object = jayus.Stack.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'hStack';
		if (this.automaticHeight !== jayus.hStack.prototype.automaticHeight) {
			object.automaticHeight = this.automaticHeight.toObject();
		}
		return object;
	},

	formContents: function hStack_formContents(){

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
	//#replace jayus.hStack.prototype.automaticWidth true

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
		//#end
		if(this.automaticWidth !== on){
			this.automaticWidth = on;
			this.reform();
		}
		return this;
	},

	//
	//  Methods
	//___________//

	toObject: function vStack_toObject() {
		var object = jayus.Stack.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'vStack';
		if (this.automaticWidth !== jayus.hStack.prototype.automaticWidth) {
			object.automaticWidth = this.automaticWidth.toObject();
		}
		return object;
	},

	formContents: function vStack_formContents(){

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