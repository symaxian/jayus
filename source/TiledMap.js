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
Defines the TiledMap entity.
@file TiledMap.js
*/

//
//  jayus.TiledMap()
//____________________//

/**
A class that loads and displays a Tiled map editor map.
@class jayus.TiledMap
@extends jayus.RectEntity
*/

jayus.TiledMap = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	The filepath of the tiled map file, if initialized with a filepath.
	<br> Do not modify.
	@property {String} filepath
	*/

	filepath: '',

	/**
	The Tiled map object, as defined in the map file.
	<br> Null until map is loaded.
	@property {Object} map
	*/

	map: null,

	/**
	The width of each map tile.
	<br> Null until map is loaded.
	<br> Do not modify.
	@property {Number} tileWidth
	*/

	tileWidth: 0,

	/**
	The height of each map tile.
	<br> Null until map is loaded.
	<br> Do not modify.
	@property {Number} tileHeight
	*/

	tileHeight: 0,

	/**
	The visibility of each layer.
	<br> Null until map is loaded.
	<br> Defaults to the initial visiblity of the layer.
	<br> Do not modify.
	@property {Array} layerVisibility
	*/

	layerVisibility: null,

	/**
	Whether the map file is loaded or not.
	<br> Do not modify.
	@property {Boolean} mapLoaded
	*/

	mapLoaded: false,

	/**
	Whether the tileset images are loaded or not.
	<br> Do not modify.
	@property {Boolean} tilesetsLoaded
	*/

	tilesetsLoaded: false,

	/**
	Whether the map is fully loaded or not.
	<br> Do not modify.
	@property {Boolean} loaded
	*/

	loaded: false,

	/**
	Whether the entity is awaiting on the map file to be loaded.
	<br> Do not modify.
	@property {Boolean} pendingLoad
	*/

	pendingLoad: false,

	//
	//  Methods
	//___________//

	/**
	Initiates the map.
	@method init
	@paramset Syntax 1
	@param {String} filepath
	@paramset Syntax 1
	@param {Object} map
	*/

	init: function TiledMap(map) {
		jayus.Entity.prototype.init.apply(this);
		if(arguments.length) {
			this.setMap(map);
		}
	},

	//#ifdef DEBUG
	checkMapLoaded: function TiledMap_checkMapLoaded() {
		if(!this.mapLoaded) {
			throw new Error('TiledMap.checkMapLoaded() - Error, map file not yet loaded');
		}
	},
	//#end

	// TODO: TiledMap.setMap() - Document, clean up loaded flags

	setMap: function TiledMap_setMap(map) {
		//#ifdef DEBUG
		if(this.pendingLoad) {
			console.warn('TiledMap.setMap() - Called while still waiting for map file "'+filepath+'" to be loaded');
			return this;
		}
		//#end
		var that, filepath, filepaths, i, data;
		if(typeof map === 'string') {
			filepath = map;
			//#ifdef DEBUG
			if(filepath === this.filepath) {
				console.debug('TiledMap.setMap() - Called twice with same filepath: '+filepath);
				return this;
			}
			//#end
			this.filepath = filepath;
			// Check if not loaded
			if(!jayus.objects.isLoaded(filepath)) {
				// Set loaded flag to false
				this.mapLoaded = false;
				this.loaded = false;
				this.pendingLoad = true;
				// Load the file
				that = this;
				jayus.objects.whenLoaded(filepath, function(data) {
					// Clear the flags
					that.pendingLoad = false;
					// Set the map object
					that.setMap(data.object);
				});
				return this;
			}
			// Get the object
			map = jayus.objects.get(filepath);
		}
		//#ifdef DEBUG
		if(map === this.map) {
			console.debug('TiledMap.setMap() - Called twice with same map: '+map);
			return this;
		}
		//#end
		this.map = map;
		// Load the tileset images
		that = this;
		filepaths = [];
		for(i=0;i<this.map.tilesets.length;i++) {
			data = this.map.tilesets[i];
			filepaths.push(data.image);
			// When loaded, if it doesnt have an attached spritesheet, give it one
			jayus.images.whenLoaded(data.image, function(event) {
				if(typeof event.image.sheet !== 'object') {
					// var data = that.map.tilesets[i];
					var sheet = new jayus.SpriteSheet(event.filepath);
					sheet.setSpriteSize(data.tilewidth, data.tileheight);
				}
				that.dirty(jayus.DIRTY.ALL);
			});
		}
		// Set the size
		this.setSize(this.map.width*this.map.tilewidth, this.map.height*this.map.tileheight);
		// Construct the layerVisibility array
		this.layerVisibility = [];
		for(i=0;i<this.map.layers.length;i++) {
			this.layerVisibility.push(this.map.layers[i].visible);
		}
		// Wait until all the tilesets are loaded to continue
		this.mapLoaded = true;
		this.loaded = false;
		jayus.images.whenLoaded(filepaths, function() {
			that.tilesetsLoaded = true;
			that.loaded = true;
			that.fire('loaded');
		});
		return this;
	},

	/**
	Runs the callback handler once the map file is loaded.
	<br> Attaches a handler for the 'loaded' event, or the map file is already loaded it calls the function immediately.
	<br> The context for the handler is this entity.
	@method {Self} whenLoaded
	@param {Function} handler
	*/

	whenLoaded: function TiledMap_whenLoaded(handler) {
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.whenLoaded', handler, 'handler', jayus.TYPES.FUNCTION);
		//#end
		if(this.loaded) {
			handler.apply(this);
		}
		else {
			this.addHandler('loaded', function(data, options) {
				handler.apply(this);
				options.remove = true;
			});
		}
		return this;
	},

		//
		//  Tile Size
		//_____________//

	/**
	Returns the index of the slot under the given position.
	@method {Point} getTileAt
	@paramset Syntax 1
	@param {Point} position
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getTileAt: function TiledMap_getTileAt(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('TiledMap.getTileAt', x, y);
		//#end
		if(arguments.length === 1) {
			return this.getTileAt(x.x, x.y);
		}
		return new jayus.Point(Math.floor((x-this.x)/this.map.tilewidth), Math.floor((y-this.y)/this.map.tileheight));
	},

	/**
	Returns the frame of the given slot.
	@method {Rectangle} getSlotFrame
	@paramset Syntax 1
	@param {Point} position
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	getSlotFrame: function TiledMap_getSlotFrame(x, y) {
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('TiledMap.getSlotFrame', x, y);
		this.checkMapLoaded();
		//#end
		if(arguments.length === 1) {
			return this.getSlotFrame(x.x, x.y);
		}
		return new jayus.Rectangle(this.x+x*this.map.tilewidth, this.y+y*this.map.tileheight, this.map.tilewidth, this.map.tileheight);
	},

		//
		//  Layers
		//__________//

	/**
	Returns whether the specified layer is visible.
	<br> The returned visibility is specific to this Entity, not the actual map object.
	@method {Boolean} isLayerVisible
	@param {Number} index
	*/

	isLayerVisible: function TiledMap_isLayerVisible(index) {
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.isLayerVisible', index, 'index', jayus.TYPES.NUMBER);
		this.checkMapLoaded();
		//#end
		return this.layerVisibility[index];
	},

	/**
	Returns whether the specified layer is visible.
	<br> The modified visibility is specific to this Entity, not the actual map object.
	@method {Self} setLayerVisibility
	@param {Number} index
	@param {Boolean} visible
	*/

	setLayerVisibility: function TiledMap_setLayerVisibility(index, visible) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('TiledMap.setLayerVisibility', arguments, 'index', jayus.TYPES.NUMBER, 'visible', jayus.TYPES.BOOLEAN);
		this.checkMapLoaded();
		//#end
		if(this.layerVisibility[index] !== visible) {
			this.layerVisibility[index] = visible;
			this.dirty(jayus.DIRTY.ALL);
		}
		return this;
	},

	/**
	Sets the specified layer as visible.
	@method {Self} showLayer
	@param {Number} index
	*/

	showLayer: function TiledMap_showLayer(index) {
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.showLayer', index, 'index', jayus.TYPES.NUMBER);
		this.checkMapLoaded();
		//#end
		return this.setLayerVisibility(index, true);
	},

	/**
	Sets the specified layer as visible.
	@method {Self} hideLayer
	@param {Number} index
	*/

	hideLayer: function TiledMap_hideLayer(index) {
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.hideLayer', index, 'index', jayus.TYPES.NUMBER);
		this.checkMapLoaded();
		//#end
		return this.setLayerVisibility(index, false);
	},

		//
		//  Rendering
		//_____________//

	// FIXME: TiledMap.paintContents() - Allow for more than 1 tileset

	paintContents: function TiledMap_paintContents(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('TiledMap.paintContents', ctx);
		this.checkMapLoaded();
		//#end

		var i,
			tileset;

		// Check the tilesheets
		for(i=0;i<this.map.tilesets.length;i++) {
			tileset = this.map.tilesets[i];
			if(!jayus.images.isLoaded(tileset.image)) {
				console.error('TiledMap.paintContents() - Tileset "'+tileset.image+'" not yet loaded');
				return;
			}
		}

		tileset = this.map.tilesets[0];

		var layer,
			image = jayus.images.get(tileset.image),
			marginX = image.sheet.marginX,
			marginY = image.sheet.marginY,
			tileWidth = image.sheet.spriteWidth,
			tileHeight = image.sheet.spriteHeight,
			tilesPerRow = tileset.imagewidth/tileWidth,
			tileY, tileX,
			index,
			sourceTileX, sourceTileY;

		// Loop through each layer
		for(i=0;i<this.map.layers.length;i++) {
			layer = this.map.layers[i];
			// Check if it's a tile layer and visible
			if(layer.type === 'tilelayer' && this.layerVisibility[i]) {
				// Loop through each tile
				for(tileY=layer.height-1;tileY>=0;tileY--) {
					for(tileX=layer.width-1;tileX>=0;tileX--) {
						// Get the tile number, tiled indexes start from 1 not 0, so subtract it
						index = layer.data[tileY*layer.width+tileX] - 1;
						if(index !== -1) {

							// sourceTileX = index%(tileset.imagewidth/tileset.tilewidth);
							// sourceTileY = (index-sourceTileX)/(tileset.imagewidth/tileset.tilewidth);

							sourceTileX = index%tilesPerRow;
							sourceTileY = (index-sourceTileX)/tilesPerRow;

							// x = marginX + sourceTileX*tileWidth;
							// y = marginY + sourceTileY*tileHeight;

							ctx.drawImage(
								image,
								marginX + sourceTileX*tileWidth,
								marginY + sourceTileY*tileHeight,
								tileWidth,
								tileHeight,
								tileX*tileWidth,
								tileY*tileHeight,
								tileWidth,
								tileHeight
							);

						}
					}
				}
			}
		}

	}

});
