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
Defines the Frame entity.
@file Frame.js
*/

//
//  jayus.Frame()
//________________//

/**
Represents padded border around an Entity.
@class jayus.Frame
@extends jayus.RectEntity
@extends jayus.Wrapper
*/

jayus.Frame = jayus.RectEntity.extend(jayus.applyObject({

	//
	//  Properties
	//______________//

	/**
	How to draw the border.
	@property {Brush} brush
	*/

	brush: null,

	/**
	Whether the border brush is set or not.
	@property {Boolean} hasBrush
	*/

	hasBrush: false,

		//
		//  Margins
		//___________//

	/**
	The left margin of the frame.
	<br> Default is 6.
	<br> Do not modify.
	@property {Number} marginLeft
	*/

	marginLeft: 6,

	/**
	The right margin of the frame.
	<br> Default is 6.
	<br> Do not modify.
	@property {Number} marginRight
	*/

	marginRight: 6,

	/**
	The top margin of the frame.
	<br> Default is 6.
	<br> Do not modify.
	@property {Number} marginTop
	*/

	marginTop: 6,

	/**
	The bottom margin of the frame.
	<br> Default is 6.
	<br> Do not modify.
	@property {Number} marginBottom
	*/

	marginBottom: 6,

	forming: false,

	//
	//  Methods
	//___________//

	updateCursorOnChildren: function Frame_updateCursorOnChildren(x, y){
		if(this.propagateCursor){
			// Translate point from parent to local coordinate space
			var pos = this.parentToLocal(x, y);
			x = pos.x;
			y = pos.y;
			this.localX = x;
			this.localY = y;
			this.child.updateCursor(x-this.marginLeft, y-this.marginTop);
		}
	},

		//
		//  Initiation
		//______________//

	/**
	Initiates the Frame object.
	@constructor init
	@param {Entity} child Optional
	*/

	init: function Frame_init(child) {
		jayus.Entity.prototype.init.apply(this);
		if (arguments.length) {
			//#ifdef DEBUG
			jayus.debug.match('Frame.init', child, 'child', jayus.TYPES.ENTITY);
			jayus.chart.tallyInit(jayus.TYPES.ENTITY);
			//#end
			this.setChild(child);
			// this.dirty(jayus.DIRTY.ALL);
			this.formContents();
			this.isParent = true;
		}
		else {
			this.isParent = false;
		}
		this.addHandler('dirty', function(type){
			if(type & jayus.DIRTY.SIZE || type & jayus.DIRTY.POSITION){
				this.formContents();
			}
		});
	},

	initFromObject: function Frame_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Frame.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		this.frozen++;
		// Apply parent properties
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		// Apply our own properties
		if (typeof object.marginLeft === 'number') {
			this.marginLeft = object.marginLeft;
		}
		if (typeof object.marginRight === 'number') {
			this.marginRight = object.marginRight;
		}
		if (typeof object.marginTop === 'number') {
			this.marginTop = object.marginTop;
		}
		if (typeof object.marginBottom === 'number') {
			this.marginBottom = object.marginBottom;
		}
		if (typeof object.child === 'object') {
			this.setChild(jayus.parse(object.child));
		}
		this.frozen--;
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	setChild: function Frame_setChild(child){
		jayus.Wrapper.setChild.call(this, child);
		this.changeSize(child.width+this.marginLeft+this.marginRight, child.height+this.marginTop+this.marginBottom);
		return this;
	},

	find: function Frame_find(id) {
		if (this.isParent && this.child.id === id) {
			return this.child;
		}
		return null;
	},

	componentDirtied: function Frame_componentDirtied(component, type){
		if(!this.forming){
			if(type & jayus.DIRTY.SIZE){
				// Set the frame's size then tell the parent
				this.changeSize(this.child.width+this.marginLeft+this.marginRight, this.child.height+this.marginTop+this.marginBottom);
			}
			else{
				this.dirty(jayus.DIRTY.ALL);
			}
		}
	},

		//
		//  Styling
		//___________//

	/**
	Sets the brush used when drawing the geometric.
	<br> Sets the entity as dirty.
	@method {Self} setBrush
	@param {Object} brush
	*/

	setBrush: function Frame_setBrush(brush){
		//#ifdef DEBUG
		jayus.debug.match('Frame.setBrush', brush, 'brush', jayus.TYPES.OBJECT);
		//#end
		// Detach self from the old brush
		if(this.hasBrush){
			this.brush.detach(this);
		}
		// Set and attach self to the new brush
		if(!(brush instanceof jayus.Brush)){
			brush = new jayus.Brush(brush);
		}
		this.brush = brush;
		this.brush.attach(this);
		this.hasBrush = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Removes the brush.
	@method {Self} clearBrush
	*/

	clearBrush: function Frame_clearBrush(){
		if(this.hasBrush){
			this.brush.detach(this);
			this.brush = null;
			this.hasBrush = false;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Margin
		//___________//

	formContents: function Frame_formContents(){
		this.forming = true;
		// Set the childs origin
		this.child.setOrigin(this.marginLeft, this.marginTop);
		// Set the childs size
		this.child.changeSize(this.width-this.marginLeft-this.marginRight, this.height-this.marginTop-this.marginBottom);
		this.forming = false;
	},

	/**
	Sets the margins on the frame.
	@method {Self} setMargin
	@paramset Syntax 1
	@param {Number} margin
	@paramset Syntax 2
	@param {Number} left
	@param {Number} right
	@param {Number} top
	@param {Number} bottom
	*/

	setMargin: function Frame_setMargin(left, right, top, bottom){
		if(arguments.length === 1){
			//#ifdef DEBUG
			jayus.debug.match('Frame.setMargin', left, 'margin', jayus.TYPES.NUMBER);
			//#end
			bottom = top = right = left;
		}
		//#ifdef DEBUG
		else{
			jayus.debug.matchArgumentsAs('Frame.setMargin', arguments, jayus.TYPES.NUMBER, 'left', 'right', 'top', 'bottom');
		}
		//#end
		this.marginLeft = left;
		this.marginRight = right;
		this.marginTop = top;
		this.marginBottom = bottom;
		// Check to resize child first, else resize self and tell parent
		this.child.frozen++;
		if(this.child.hasFlexibleWidth){
			this.child.setWidth(this.width-this.marginLeft-this.marginRight);
		}
		else{
			this.changeSize(this.child.width+left+right, this.child.height);
		}
		if(this.child.hasFlexibleHeight){
			this.child.setHeight(this.height-this.marginTop-this.marginBottom);
		}
		else{
			this.changeSize(this.child.width, this.child.height+top+bottom);
		}
		this.child.frozen--;
		return this;
	},

	/**
	Sets the marginLeft property.
	<br> Sets the entity as dirty.
	@method {Self} setMarginLeft
	@param {Number} margin
	*/

	setMarginLeft: function Frame_setMarginLeft(margin){
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginLeft', margin, 'margin', jayus.TYPES.NUMBER);
		//#end
		return this.setMargin(margin, this.marginRight, this.marginTop, this.marginBottom);
	},

	/**
	Sets the marginRight property.
	<br> Sets the entity as dirty.
	@method {Self} setMarginRight
	@param {Number} margin
	*/

	setMarginRight: function Frame_setMarginRight(margin){
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginRight', margin, 'margin', jayus.TYPES.NUMBER);
		//#end
		return this.setMargin(this.marginLeft, margin, this.marginTop, this.marginBottom);
	},

	/**
	Sets the marginTop property.
	<br> Sets the entity as dirty.
	@method {Self} setMarginTop
	@param {Number} margin
	*/

	setMarginTop: function Frame_setMarginTop(margin){
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginTop', margin, 'margin', jayus.TYPES.NUMBER);
		//#end
		return this.setMargin(this.marginLeft, this.marginRight, margin, this.marginBottom);
	},

	/**
	Sets the marginBottom property.
	<br> Sets the entity as dirty.
	@method {Self} setMarginBottom
	@param {Number} margin
	*/

	setMarginBottom: function Frame_setMarginBottom(margin){
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginBottom', margin, 'margin', jayus.TYPES.NUMBER);
		//#end
		return this.setMargin(this.marginLeft, this.marginRight, this.marginTop, margin);
	},

		//
		//  Rendering
		//_____________//

	paintContents: function Frame_paintContents(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('Frame.paintContents', ctx);
		//#end
		// Draw the frame
		if(this.hasBrush){
			if(this.brush.fill || this.brush.stroking){
				ctx.save();
				this.brush.applyTo(ctx);
				// Etch the border
				ctx.beginPath();
				ctx.rect(0, 0, this.width, this.height);
				// Check if stroking first
				if(this.brush.stroking && this.brush.strokeFirst){
					ctx.stroke();
				}
				// Fill the shape
				if(this.brush.filling){
					ctx.fill();
				}
				// Check if stroking last
				if(this.brush.stroking && !this.brush.strokeFirst){
					ctx.stroke();
				}
				ctx.restore();
			}
		}
		// Draw the child
		ctx.save();
		this.child.drawOntoContext(ctx);
		this.child.dirtied = false;
		ctx.restore();
	}

}, jayus.copyObject(jayus.Wrapper)));