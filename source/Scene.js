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

jayus.Scene = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	childrenAdded: null,

	/**
	Whether to clip the rendering of children to the scene's frame.
	<br> Default is false.
	@property {Boolean} clipChildrenToFrame
	*/

	clipChildrenToFrame: false,

	/**
	When performing optimized buffering, this flag specifies that for the next frame the entire buffer must be refreshed.
	<br> Do not modify.
	@property {private Boolean} redrawAll
	*/

	redrawAll: true,

	//
	//  Methods
	//___________//

	componentDirtied: function Scene_componentDirtied(component, type) {
		if(component instanceof jayus.Entity) {
			if(type & jayus.DIRTY.SCOPE) {
				component.scopeChanged = true;
			}
		}
		// From RectEntity
		if(component === this.bounds) {
			this.bounds.cloneOnto(this.boundsClone);
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemAdded: function Scene_listItemAdded(list, item) {
		if(this.childrenAdded === null) {
			this.childrenAdded = [];
		}
		this.childrenAdded.push(item);
		item.prevScope = item.getScope();
		if(item.trackCursor) {
			this.childCursorTrackingChanged(item, true);
		}
		item.setParent(this);
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsAdded: function Scene_listItemsAdded(list, items) {
		var i, item;
		if(this.childrenAdded === null) {
			this.childrenAdded = [];
		}
		for(i=0;i<items.length;i++) {
			item = items[i];
			this.childrenAdded.push(item);
			item.prevScope = item.getScope();
			if(item.trackCursor) {
				this.childCursorTrackingChanged(item, true);
			}
			item.setParent(this);
		}
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemRemoved: function Scene_listItemRemoved(list, item) {
		item.removeParent();
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	listItemsRemoved: function Scene_listItemsRemoved(list, items) {
		for(var i=0;i<items.length;i++) {
			items[i].removeParent();
		}
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Initiates the scene.
	<br> Size is optional.
	@constructor Scene
	@param {Number} width Optional
	@param {Number} height Optional
	*/

	init: function Scene(width, height) {
		jayus.Entity.prototype.init.apply(this);
		this.children = new jayus.List(this);
		this.items = this.children.items;
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		//#end
		if(arguments.length === 2) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Scene', arguments, jayus.TYPES.NUMBER, 'width', 'height');
			//#end
			this.width = width;
			this.height = height;
		}
	},

	toObject: function Scene_toObject() {
		var object = jayus.RectEntity.prototype.toObject.apply(this);
		jayus.groupToObject.call(this, object);
		// Add our own properties
		object.type = 'Scene';
		if(this.optimizeBuffering !== jayus.Scene.prototype.optimizeBuffering) {
			object.optimizeBuffering = this.optimizeBuffering;
		}
		if(this.groupDamagedRegions !== jayus.Scene.prototype.groupDamagedRegions) {
			object.groupDamagedRegions = this.groupDamagedRegions;
		}
		if(this.damagedRegionPadding !== jayus.Scene.prototype.damagedRegionPadding) {
			object.damagedRegionPadding = this.damagedRegionPadding;
		}
		return object;
	},

	initFromObject: function Scene_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Scene.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		this.ignoreDirty++;
		// Apply parent properties
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		jayus.groupInitFromObject.call(this, object);
		// Apply our own properties
		if(typeof object.clipChildrenToFrame === 'boolean') {
			this.clipChildrenToFrame = object.clipChildrenToFrame;
		}
		if(typeof object.optimizeBuffering === 'boolean') {
			this.optimizeBuffering = object.optimizeBuffering;
		}
		if(typeof object.groupDamagedRegions === 'boolean') {
			this.groupDamagedRegions = object.groupDamagedRegions;
		}
		if(typeof object.damagedRegionPadding === 'number') {
			this.damagedRegionPadding = object.damagedRegionPadding;
		}
		this.ignoreDirty--;
		// Set as dirty
		this.dirty(jayus.DIRTY.ALL);
	},

		//
		//  Rendering
		//_____________//

	optimizeBuffering: false,
	//#replace jayus.Scene.prototype.optimizeBuffering false

	groupDamagedRegions: true,
	//#replace jayus.Scene.prototype.groupDamagedRegions true

	damagedRegionPadding: 2,
	//#replace jayus.Scene.prototype.damagedRegionPadding 2

	/**
	Sets the optimized buffering flag on the Scene.
	<br Only available if the scene is buffered.
	@method {Self} setOptimizedBuffering
	@param {Boolean} on
	*/

	setOptimizedBuffering: function Scene_setOptimizedBuffering(on) {
		//#ifdef DEBUG
		jayus.debug.match('Scene.setOptimizedBuffering', on, 'on', jayus.TYPES.BOOLEAN);
		//#end
		if(this.optimizeBuffering !== on) {
			this.optimizeBuffering = on;
			this.redrawAll = true;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

	//@ Internal
	//@ From RectEntity, overridden so we can optionally select the optimized buffering routine
	refreshBuffer: function Scene_refreshBuffer() {
		if(this.buffered) {
			// Some vars
			var width = this.width,
				height = this.height,
				canvas = this.canvas,
				ctx = this.context;
			// Resize the canvas if needed
			if(width !== canvas.width || height !== canvas.height) {
				canvas.width = width;
				canvas.height = height;
			}
			// Check if optimized
			if(this.optimizeBuffering && !this.redrawAll) {
				this.optimizedRefreshBuffer();
			}
			else {
				// Fully refresh the buffer
				this.fullyRefreshBuffer();
				this.redrawAll = false;
			}
			this.dirtied = false;
		}
	},

	//@ Internal
	// Performs an optimized refresh of the buffer, only re-rendering dirty children
	optimizedRefreshBuffer: function Scene_optimizedRefreshBuffer() {
		if(this.buffered) {

			// Some vars
			var ctx = this.context,
				i, i2, item,
				region, region2,
				damagedRegions = [];

			// Mark all children as clean
			// Add damaged regions from moved/dirtied children
			for(i=0;i<this.items.length;i++) {
				item = this.items[i];
				item.clean = true;
				if(item.scopeChanged) {
					damagedRegions.push(item.getScope().includeRectangle(item.prevScope));
					item.prevScope = item.getScope();
					item.scopeChanged = false;
					item.clean = false;
				}
				else if(item.dirtied) {
					damagedRegions.push(item.getScope());
					item.dirtied = false;
					item.clean = false;
				}
			}

			// Group damaged regions
			var done = false;
			if(this.groupDamagedRegions) {
				while(!done) {
					done = true;
					for(i=0;i<damagedRegions.length;i++) {
						region = damagedRegions[i];
						for(i2=0;i2<damagedRegions.length;i2++) {
							region2 = damagedRegions[i2];
							if(region !== region2 && jayus.intersectTest(region, region2)) {
								damagedRegions[i].includeRectangle(region2);
								damagedRegions.splice(i2, 1);
								done = false;
								if(i >= i2) {
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
			for(i=0;i<damagedRegions.length;i++) {
				region = damagedRegions[i];
				region.translate(-padding, -padding);
				region.setSize(region.width+padding*2, region.height+padding*2);
			}

			// Mark all children that intersect damaged regions as unclean
			for(i=0;i<damagedRegions.length;i++) {
				region = damagedRegions[i];
				for(i2=0;i2<this.items.length;i2++) {
					item = this.items[i2];
					if(item.clean && jayus.intersectTest(item, region)) {
						item.clean = false;
					}
				}
			}

			//#ifdef DEBUG
			if(this.showDamage) {
				this.clearDamage();
			}
			//#end

			ctx.save();

			// Clear each damaged region
			for(i=0;i<damagedRegions.length;i++) {
				region = damagedRegions[i];
				ctx.clearRect(region.x, region.y, region.width, region.height);
			}

			// Clip each damaged region
			ctx.beginPath();
			for(i=0;i<damagedRegions.length;i++) {
				region = damagedRegions[i];
				ctx.rect(region.x, region.y, region.width, region.height);
			}
			ctx.clip();

			// Draw the background
			if(this.bufferBg && this.bg !== null) {
				if(this.alignBg) {
					this.bg.paintRect(
						ctx,
						0.5,
						0.5,
						Math.round(this.width),
						Math.round(this.height)
					);
				}
				else {
					this.bg.paintRect(ctx, 0, 0, this.width, this.height);
				}
			}

			// Draw unclean children
			for(i=0;i<this.items.length;i++) {
				item = this.items[i];
				if(!item.clean && item.visible) {
					item.drawOntoContext(ctx);
					//#ifdef DEBUG
					if(this.showDamage) {
						this.paintRedraw(item);
					}
					//#end
				}
			}

			//#ifdef DEBUG
			if(this.showDamage) {
				for(i=0;i<damagedRegions.length;i++) {
					this.paintDamage(damagedRegions[i]);
				}
			}
			//#end

			ctx.restore();

		}
	},

	//@ From RectEntity
	paintContents: function Scene_paintContents(ctx) {
		// Check to clip the children
		if(this.clipChildrenToFrame) {
			ctx.beginPath();
			ctx.rect(0, 0, this.width, this.height);
			ctx.clip();
		}
		if(this.contentsOriginX !== undefined) {
			ctx.translate(this.contentsOriginX, this.contentsOriginY);
		}
		// Draw the children onto the context
		var i, item;
		for(i=0;i<this.items.length;i++) {
			item = this.items[i];
			if(item.visible) {
				item.drawOntoContext(ctx);
			}
		}
	}

});

jayus.applyObject(jayus.Group, jayus.Scene.prototype);