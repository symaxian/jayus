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
Defines the Scene entity.
@file Scene.js
*/

//
//  jayus.Scene()
//_________________//

/**
A entity for manipulating and rendering child entities within a fixed area.
<br> A Scene can have a custom bounds geometric.
@class jayus.Scene
@extends jayus.RectEntity
@extends jayus.Group
*/

//#ifdef DEBUG
jayus.debug.className = 'Scene';
//#endif

jayus.Scene = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

		// Box2D

	/**
	Whether this Scene has an associated Box2D world.
	@property {Boolean} hasWorld
	*/

	hasWorld: false,

	/**
	The Box2D world associated with this scene.
	@property {Object} world
	*/

	world: null,

	//
	//  Methods
	//___________//

	childrenAdded: null,

	componentDirtied: function Scene_componentDirtied(componentType, component, type){
		if(componentType === 'ENTITY'){
			if(type & jayus.DIRTY.SCOPE){
				component.scopeChanged = true;
			}
		}
		jayus.RectEntity.prototype.componentDirtied.call(this, componentType, component, type);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemAdded: function Scene_listItemAdded(list, item){
		if(this.childrenAdded === null){
			this.childrenAdded = [];
		}
		this.childrenAdded.push(item);
		item.prevScope = item.getScope();
		item.setParent(this);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsAdded: function Scene_listItemsAdded(list, items){
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

	listItemRemoved: function Scene_listItemRemoved(list, item){
		item.removeParent();
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsRemoved: function Scene_listItemsRemoved(list, items){
		for(var i=0;i<items.length;i++){
			items[i].removeParent();
		}
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	hasFlexibleWidth: function Scene_hasFlexibleWidth(){
		return true;
	},

	hasFlexibleHeight: function Scene_hasFlexibleHeight(){
		return true;
	},

	formContents: function Scene_formContents(width, height){
		if(this.buffered){
			this.canvas.width = width;
			this.canvas.height = height;
		}
	},

	/**
	Initiates the scene.
	<br> Size is optional.
	@constructor init
	@param {Number} width Optional
	@param {Number} height Optional
	*/

	init: function Scene_init(width, height){
		jayus.Entity.prototype.init.apply(this);
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#endif
		if(arguments.length){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Scene.init', arguments, jayus.TYPES.NUMBER, 'width', 'height');
			//#endif
			this.width = width;
			this.height = height;
		}
	},

		//
		//  Rendering
		//_____________//

	optimizeBuffering: false,

	groupDamagedRegions: true,

	damagedRegionPadding: 2,

	/**
	Sets the optimized buffering flag on the Scene.
	<br Only available if the scene is buffered.
	@method {Self} setOptimizedBuffering
	@param {Boolean} on
	*/

	setOptimizedBuffering: function Scene_setOptimizedBuffering(on){
		//#ifdef DEBUG
		jayus.debug.match('Scene.setOptimizedBuffering', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		if(this.optimizeBuffering !== on){
			this.optimizeBuffering = on;
			this.redrawAll = true;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

	//@ Internal
	refreshBuffer: function Scene_refreshBuffer(){
		if(this.buffered){
			// Some vars
			var width = this.width,
				height = this.height,
				canvas = this.canvas,
				ctx = this.context;
			// Resize the canvas if needed
			if(width !== canvas.width || height !== canvas.height){
				canvas.width = width;
				canvas.height = height;
			}
			// Check if optimized
			if(this.optimizeBuffering && !this.redrawAll){
				this.optimizedRefreshBuffer();
			}
			else{
				// Fully refresh the buffer
				this.fullyRefreshBuffer();
				this.redrawAll = false;
			}
			this.dirtied = false;
		}
	},

	//@ Internal
	optimizedRefreshBuffer: function Scene_optimizedRefreshBuffer(){
		if(this.buffered){

			// Some vars
			var ctx = this.context,
				i, item,
				region,
				damagedRegions = [];

			// Mark all children as clean
			// Add damaged regions from moved/dirtied children
			for(i=0;i<this.children.items.length;i++){
				item = this.children.items[i];
				item.clean = true;
				if(item.scopeChanged){
					damagedRegions.push(item.getScope().includeRectangle(item.prevScope));
					item.prevScope = item.getScope();
					item.scopeChanged = false;
					item.clean = false;
				}
				else if(item.dirtied){
					damagedRegions.push(item.getScope());
					item.dirtied = false;
					item.clean = false;
				}
			}

			// Group damaged regions
			var done = false;
			if(this.groupDamagedRegions){
				while(!done){
					done = true;
					for(i=0;i<damagedRegions.length;i++){
						region = damagedRegions[i];
						for(i2=0;i2<damagedRegions.length;i2++){
							region2 = damagedRegions[i2];
							if(region !== region2 && jayus.intersectTest(region, region2)){
								damagedRegions[i].includeRectangle(region2);
								damagedRegions.splice(i2, 1);
								done = false;
								if(i >= i2){
									i--;
								}
								i2--;
							}
						}
					}
				}
			}

			// Pad out the damaged regions
			var padding = this.damagedRegionPadding;
			for(i=0;i<damagedRegions.length;i++){
				region = damagedRegions[i];
				region.translate(-padding, -padding);
				region.setSize(region.width+padding*2, region.height+padding*2);
			}

			// Mark all children that intersect damaged regions as unclean
			for(i=0;i<damagedRegions.length;i++){
				region = damagedRegions[i];
				for(i2=0;i2<this.children.items.length;i2++){
					item = this.children.items[i2];
					if(item.clean && jayus.intersectTest(item, region)){
						item.clean = false;
					}
				}
			}

			//#ifdef DEBUG
			if(this.showDamage){
				this.clearDamage();
			}
			//#endif

			ctx.save();

			// Clear each damaged region
			for(i=0;i<damagedRegions.length;i++){
				region = damagedRegions[i];
				ctx.clearRect(region.x, region.y, region.width, region.height);
			}

			// Clip each damaged region
			ctx.beginPath();
			for(i=0;i<damagedRegions.length;i++){
				region = damagedRegions[i];
				ctx.rect(region.x, region.y, region.width, region.height);
			}
			ctx.clip();

			// Draw the background
			if(this.bufferBg && this.hasBg){
				if(this.alignBg){
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else{
					this.bg.paintRect(ctx, 0, 0, this.width, this.height);
				}
			}

			// Draw unclean children
			for(i=0;i<this.children.items.length;i++){
				item = this.children.items[i];
				if(!item.clean && item.visible){
					item.drawOntoContext(ctx);
					//#ifdef DEBUG
					if(this.showDamage){
						this.paintRedraw(item);
					}
					//#endif
				}
			}

			//#ifdef DEBUG
			if(this.showDamage){
				for(i=0;i<damagedRegions.length;i++){
					this.paintDamage(damagedRegions[i]);
				}
			}
			//#endif

			ctx.restore();

		}
	},

	//@ From RectEntity
	paintContents: function Scene_paintContents(ctx){
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

jayus.applyObject(jayus.Group, jayus.Scene.prototype);