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

//#ifdef DEBUG
jayus.debug.className = 'TiledMap';
//#endif

jayus.TiledMap = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	Whether the tiled map file is loaded or not.
	<br> Do not modify.
	@property {Boolean} loaded
	*/

	loaded: false,

	/**
	The filename of the tiled map file.
	<br> Null until map is loaded.
	@property {String} filename
	*/

	filename: null,

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

	//
	//  Methods
	//___________//

	/**
	Initiates the map.
	@method init
	@param {String} filename
	*/

	init: function TiledMap_init(map){
		jayus.Entity.prototype.init.apply(this);
		if(arguments.length){
			this.setMap(map);
		}
	},

	//#ifdef DEBUG
	checkLoaded: function TiledMap_checkLoaded(){
		if(!this.loaded){
			throw new Error('TiledMap.checkLoaded() - Error, map not yet loaded');
		}
	},
	//#endif

	setMap: overloadArgumentType({

		object: function TiledMap_setMap(map){
			this.map = map;
			this.loaded = true;
			// this.setBuffering(true);
		},

		string: function TiledMap_setMap(filepath){
			this.map = jayus.objects.get(filepath);
			for(var i=0;i<this.map.tilesets.length;i++){
				var data = this.map.tilesets[i];
				jayus.images.load(data.image);
				var sheet = new jayus.SpriteSheet();
				// console.log(data);
				sheet.setSpriteSize(data.tilewidth, data.tileheight);
				jayus.images.get(data.image).sheet = sheet;
				this.tileWidth = data.tilewidth;
				this.tileHeight = data.tileheight;
			}
			this.loaded = true;
			this.changeSize(this.map.width*this.map.tilewidth, this.map.height*this.map.tileheight);

			// var req = new XMLHttpRequest();
			// var that = this;
			// req.onload = function(){
			// 	that.loaded = true;
			// 	that.map = JSON.parse(req.responseText);
			// 	for(var i=0;i<that.map.tilesets.length;i++){
			// 		var data = that.map.tilesets[i];
			// 		jayus.images.loadSheet(data.image,data.tilewidth,data.tileheight);
			// 	}
			// };
			// req.open('get',filename,true);
			// req.send();
			// this.setBuffering(true);
		}

	}),

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

	getTileAt: function TiledMap_getTileAt(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('TiledMap.getTileAt', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		x -= this.x;
		y -= this.y;
		return new jayus.Point(Math.floor(x/this.map.tilewidth), Math.floor(y/this.map.tileheight));
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

	getSlotFrame: function TiledMap_getSlotFrame(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('TiledMap.getSlotFrame', x, y);
		this.checkLoaded();
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return new jayus.Rectangle(this.x+x*this.map.tilewidth, this.y+y*this.map.tileheight, this.map.tilewidth, this.map.tileheight);
	},

		//
		//  Layers
		//__________//

	/**
	Returns whether the specified layer is visible.
	@method {Boolean} isLayerVisible
	@param {Number} index
	*/

	isLayerVisible: function TiledMap_isLayerVisible(index){
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.isLayerVisible', index, 'index', jayus.TYPES.NUMBER);
		this.checkLoaded();
		//#endif
		return this.map.layers[index].visible;
	},

	/**
	Returns whether the specified layer is visible.
	@method {Self} setLayerVisibility
	@param {Number} index
	@param {Boolean} visible
	*/

	setLayerVisibility: function TiledMap_setLayerVisibility(index, visible){
		//#ifdef DEBUG
		jayus.debug.matchArguments('TiledMap.setLayerVisibility', arguments, 'index', jayus.TYPES.NUMBER, 'visible', jayus.TYPES.BOOLEAN);
		this.checkLoaded();
		//#endif
		var layer = this.map.layers[index];
		if(layer.visible !== visible){
			layer.visible = visible;
			this.dirty();
		}
		return this;
	},

	/**
	Sets the specified layer as visible.
	@method {Self} showLayer
	@param {Number} index
	*/

	showLayer: function TiledMap_showLayer(index){
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.showLayer', index, 'index', jayus.TYPES.NUMBER);
		this.checkLoaded();
		//#endif
		return this.setLayerVisibility(index, true);
	},

	/**
	Sets the specified layer as visible.
	@method {Self} hideLayer
	@param {Number} index
	*/

	hideLayer: function TiledMap_hideLayer(index){
		//#ifdef DEBUG
		jayus.debug.match('TiledMap.hideLayer', index, 'index', jayus.TYPES.NUMBER);
		this.checkLoaded();
		//#endif
		return this.setLayerVisibility(index, false);
	},

		//
		//  Rendering
		//_____________//

	// FIXME: TiledMap.paintContents() - Allow for more than 1 tileset

	paintContents: function TiledMap_paintContents(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('TiledMap.paintContents', ctx);
		// Check if loaded
		if(!this.loaded){
			console.warn('TiledMap.paintContents() - Map data not loaded!');
		}
		//#endif

		var i,
			image,
			tileset = this.map.tilesets[0],
			tileSheet = jayus.images.get(tileset.image),
			sheetInfo = tileSheet.sheet,
			tileWidth = sheetInfo.spriteWidth,
			tileHeight = sheetInfo.spriteHeight,
			layer,
			tileY, tileX,
			index,
			sourceTileX, sourceTileY,
			x, y;

		// Check the tilesheets
		for(i=0;i<this.map.tilesets.length;i++){
			tileset = this.map.tilesets[i];
			if(!jayus.images.isLoaded(tileset.image)){
				console.warn('TiledMap.paintContents() - Tileset "'+tileset.image+'" not yet loaded');
			}
		}

		// Loop through each layer
		for(i=0;i<this.map.layers.length;i++){
			layer = this.map.layers[i];
			// Check if it's a tile layer and visible
			if(layer.type === 'tilelayer' && layer.visible){
				for(tileY=0;tileY<layer.height;tileY++){
					for(tileX=0;tileX<layer.width;tileX++){
						// Get the tile number, tiled indexes start from 1 not 0, so subtract it
						index = layer.data[tileY*layer.width+tileX] - 1;
						if(index !== -1){

							sourceTileX = index%(tileset.imagewidth/tileset.tilewidth);
							sourceTileY = (index-sourceTileX)/(tileset.imagewidth/tileset.tilewidth);

							x = sheetInfo.marginX + sourceTileX*(tileWidth);
							y = sheetInfo.marginY + sourceTileY*(tileHeight);

							ctx.drawImage(
								tileSheet,
								x,
								y,
								tileWidth,
								tileHeight,
								tileX*tileWidth,
								tileY*tileHeight,
								tileWidth,
								tileHeight
							);

							// ctx.fillStyle = 'green';
							// ctx.fillRect(x, y, tileWidth, tileHeight);

							// img = new jayus.Image(tileset.image,index-1);
							// img.setOrigin(tileX*tileset.tilewidth,tileY*tileset.tileheight);
							// img.drawOntoContext(ctx);
						}
					}
				}
			}
		}

	}

});
