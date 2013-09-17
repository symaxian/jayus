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
Defines the Layer entity.
@file Layer.js
*/

//
//  jayus.Layer()
//_________________//

/**
A entity for manipulating and rendering child entities within a fixed area.
@class jayus.Layer
@extends jayus.Entity
@extends jayus.Group
*/

//#ifdef DEBUG
jayus.debug.className = 'Layer';
//#endif

jayus.Layer = jayus.Entity.extend({

	//
	//  Properties
	//______________//

	x: 0,

	y: 0,

	//
	//  Methods
	//___________//

	childrenAdded: null,

	componentDirtied: function Layer_componentDirtied(componentType, component, type){
		if(componentType === 'ENTITY'){
			if(type & jayus.DIRTY.SCOPE){
				component.scopeChanged = true;
			}
			this.scopeClean = false;
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemAdded: function Layer_listItemAdded(list, item){
		if(this.childrenAdded === null){
			this.childrenAdded = [];
		}
		this.childrenAdded.push(item);
		item.prevScope = item.getScope();
		item.setParent(this);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsAdded: function Layer_listItemsAdded(list, items){
		if(this.childrenAdded === null){
			this.childrenAdded = [];
		}
		for(var item,i=0;i<items.length;i++){
			item = items[i];
			item.setParent(this);
			this.childrenAdded.push(item);
			item.prevScope = item.getScope();
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemRemoved: function Layer_listItemRemoved(list, item){
		item.removeParent();
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsRemoved: function Layer_listItemsRemoved(list, items){
		for(var i=0;i<items.length;i++){
			items[i].removeParent();
		}
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Initiates the layer.
	@constructor init
	@paramset Syntax 1
	@paramset Syntax 2
	@param {Number} width
	@param {Number} height
	*/

	init: function Layer_init(width, height){
		jayus.Entity.prototype.init.apply(this);
		this.children = new jayus.List(this);
		this.scope = new jayus.Rectangle();
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#endif
		if(arguments.length === 2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Layer.init', arguments, jayus.TYPES.NUMBER, 'width', 'height');
			//#endif
			this.width = width;
			this.height = height;
		}
	},

	scope: null,

	scopeClean: false,

	getScope: function Layer_getScope(){
		var i, scope, x1, y1, x2, y2;
		if(!this.scopeClean){
			if(this.children.items.length){
				x1 = null;
				y1 = null;
				x2 = null;
				y2 = null;
				for(i=0;i<this.children.items.length;i++){
					scope = this.children.items[i].getScope();
					if(x1 === null || scope.x < x1){
						x1 = scope.x;
					}
					if(x2 === null || scope.x+scope.width > x2){
						x2 = scope.x+scope.width;
					}
					if(y1 === null || scope.y < y1){
						y1 = scope.y;
					}
					if(y2 === null || scope.y+scope.height > y2){
						y2 = scope.y+scope.height;
					}
				}
				this.scope.setFrame(x1, y1, x2-x1, y2-y1);
			}
			else{
				this.scope.setFrame(0, 0, 0, 0);
			}
		}
		return this.scope;
	},

	translate: function Layer_translate(x, y){
		// Draw the children onto the context
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			item.translate(x, y);
		}
	},

	intersectsAt: function Layer_intersectsAt(x, y){
		return true;
		// for(var i=0;i<this.children.items;i++){
		// 	this.children.items[i].intersectsAt(x, y);
		// }
	},

		//
		//  Rendering
		//_____________//

	//@ From RectEntity
	drawOntoContext: function Layer_drawOntoContext(ctx){
		// Draw the children onto the context
		var i, item;
		for(i=0;i<this.children.items.length;i++){
			item = this.children.items[i];
			if(item.visible){
				item.drawOntoContext(ctx);
			}
		}
	}

});

jayus.applyObject(jayus.Group, jayus.Layer.prototype);