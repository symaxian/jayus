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
Defines the FlowLayout entity.
@file FlowLayout.js
*/

/*

	TODO:
		Optimizations
			If more space is given, dont reform lines until the added space allows for an item to move to the previous line
			If space is taken, dont reform lines until we come across one that is longer than the new width

*/

//
//  jayus.FlowLayout
//____________________//

/**
Arranges children in a manner similar to that of word-wrapped text.
<br> Has a variable width, height is determined by allocation of children.
@class jayus.FlowLayout
@extends jayus.RectEntity
*/

//#ifdef DEBUG
jayus.debug.className = 'FlowLayout';
//#endif

jayus.FlowLayout = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	The horizontal alignment of the elements.
	<br> Do not modify.
	<br> Default is 0
	@property {Number} alignment
	*/

	alignment: 0,

	width: 100,

	height: 100,

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	init: function FlowLayout_init(){
		jayus.Entity.prototype.init.apply(this);
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#endif
	},

		//
		//  Size
		//________//

	hasFlexibleWidth: function Scene_hasFlexibleWidth(){
		return true;
	},

	hasFlexibleHeight: function Scene_hasFlexibleHeight(){
		return false;
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

	listItemAdded: function FlowLayout_listItemAdded(list, item){
		item.setParent(this);
		this.reform();
	},

	listItemsAdded: function FlowLayout_listItemsAdded(list, items){
		for(var i=0;i<items.length;i++){
			items[i].setParent(this);
		}
		this.reform();
	},

	listItemRemoved: function FlowLayout_listItemRemoved(list, item){
		item.removeParent();
		this.reform();
	},

	listItemsRemoved: function FlowLayout_listItemsRemoved(list, items){
		for(var i=0;i<items.length;i++){
			items[i].removeParent();
		}
		this.reform();
	},

		//
		//  Alignment
		//_____________//

	/**
	Sets the horizontal alignment of the elements.
	<br> Accepts a number between 0(align left) and 1(align right).
	@method {Self} setAlignment
	@param {Number} alignment
	*/

	setAlignment: function FlowLayout_setAlignment(alignment){
		//#ifdef DEBUG
		jayus.debug.match('FlowLayout.setAlignment', alignment, 'alignment', jayus.TYPES.NUMBER);
		//#endif
		if(this.alignment !== alignment){
			this.alignment = alignment;
			this.reform();
		}
		return this;
	},

	/**
	Returns the horizontal alignment of the elements.
	@method {Number} getAlignment
	*/

	getAlignment: function FlowLayout_getAlignment(){
		return this.alignment;
	},

		//
		//  Frame
		//_________//

	reform: function FlowLayout_reform(){
		this.formContents(this.width, this.height);
		this.dirty(jayus.DIRTY.SIZE);
	},

	formContents: function FlowLayout_formContents(width, height){

		// if(width > this.width && this.lineHeights.length === 1){
		// 	return;
		// }

		if(width === this.width && height > this.height){
			return;
		}

		var i = 0,
			j,
			y = 0,
			currentLine,
			currentLineWidth,
			h,
			x,
			item,
			nextItem,
			nextItemWidth,
			lineHeights = [];

		while(i !== this.children.items.length){

			currentLine = [];
			currentLineWidth = 0;
			h = 0;
			x = 0;
			nextItem = this.children.items[i];
			nextItemWidth = nextItem.width;

			do {

				nextItem.x = x;
				nextItem.y = y;
				currentLine.push(nextItem);
				currentLineWidth += nextItemWidth;

				x += nextItemWidth;

				if(nextItem.height > h){
					h = nextItem.height;
				}

				i++;

				if(i === this.children.items.length){
					break;
				}

				nextItem = this.children.items[i];
				nextItemWidth = nextItem.width;

			} while(currentLineWidth+nextItemWidth < width);

			// Re-align the lines if there is a non-left alignment
			if(this.alignment !== 0){
				for(j=0;j<currentLine.length;j++){
					item = currentLine[j];
					item.x += (width-currentLineWidth)*this.alignment;
				}
			}

			// Vertically re-align each item if they request it
			for(j=0;j<currentLine.length;j++){
				item = currentLine[j];
				if(typeof item.verticalAlign === 'number'){
					item.y = item.y + item.verticalAlign*(h-item.height);
				}
			}

			y += h;
			lineHeights.push(h);

		}

		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			item.fire('moved');
		}

		this.lineHeights = lineHeights;

	},

		//
		//  Rendering
		//_____________//

	paintContents: jayus.Scene.prototype.paintContents

});

jayus.applyObject(jayus.Group, jayus.FlowLayout.prototype);