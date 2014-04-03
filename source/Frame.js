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
An entity that serves as a padded border around an entity.
<br> Whenever the frame is resized, it resizes its child to fit.
<br> Requires a resizable entity for a child.
@class jayus.Frame
@extends jayus.RectEntity
@extends jayus.Wrapper
*/

	/*

		Size Modes:
			resize self from child
			resize child from self

	*/

jayus.RESIZE_SELF = 0;
jayus.RESIZE_CHILD = 1;
jayus.RESIZE_MARGINS = 2;

jayus.Frame = jayus.RectEntity.extend(jayus.applyObject({

	//
	//  Properties
	//______________//

	flexible: false,

	forming: false,

	widthMode: 0,

	heightMode: 0,

	minWidthMode: 'child',

	minHeightMode: 'child',

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	/**
	Initiates the Frame object.
	@constructor Frame
	@param {Entity} child Optional
	*/

	init: function Frame(child) {
		jayus.Entity.prototype.init.apply(this);
		if(child !== undefined) {
			//#ifdef DEBUG
			jayus.debug.match('Frame', child, 'child', jayus.TYPES.ENTITY);
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
		this.addHandler('dirty', function(type) {
			// if(!this.flexible && (type & jayus.DIRTY.SIZE+jayus.DIRTY.POSITION)) {
				this.formContents();
			// }
		});
	},

	initFromObject: function Frame_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Frame.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		this.ignoreDirty++;
		// Apply parent properties
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		// Apply our own properties
		if(typeof object.marginLeft === 'number') {
			this.marginLeft = object.marginLeft;
		}
		if(typeof object.marginRight === 'number') {
			this.marginRight = object.marginRight;
		}
		if(typeof object.marginTop === 'number') {
			this.marginTop = object.marginTop;
		}
		if(typeof object.marginBottom === 'number') {
			this.marginBottom = object.marginBottom;
		}
		if(typeof object.widthMode === 'number') {
			this.widthMode = object.widthMode;
		}
		if(typeof object.heightMode === 'number') {
			this.heightMode = object.heightMode;
		}
		if(typeof object.child === 'object') {
			this.setChild(jayus.parse(object.child));
		}
		this.ignoreDirty--;
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	/**
	Sets the child.
	@method {Self} setChild
	@param {Entity} child
	*/

	setChild: function Frame_setChild(child) {
		jayus.Wrapper.setChild.call(this, child);
		if(!this.width) {
			this.setWidth(child.width + this.marginLeft + this.marginRight);
		}
		if(!this.height) {
			this.setHeight(child.height + this.marginTop + this.marginBottom);
		}
		if(typeof child.minWidth === 'number') {
			this.minWidth = child.minWidth + this.marginLeft + this.marginRight;
		}
		if(typeof child.minHeight === 'number') {
			this.minHeight = child.minHeight + this.marginTop + this.marginBottom;
		}
		this.formContents();
		return this;
	},

	componentDirtied: function Frame_componentDirtied(component, type) {
		if(type & jayus.DIRTY.SIZE) {
			if(this.minWidthMode === 'child' && typeof this.child.minWidth === 'number') {
				this.minWidth = this.child.minWidth + this.marginLeft + this.marginRight;
			}
			if(this.minHeightMode === 'child' && typeof this.child.minHeight === 'number') {
				this.minHeight = this.child.minHeight + this.marginTop + this.marginBottom;
			}
			if(!this.forming) {
				this.formContents();
			}
			// Set the frame's size then tell the parent
			// this.changeSize(this.child.width+this.marginLeft+this.marginRight, this.child.height+this.marginTop+this.marginBottom);
		}
		else {
			this.dirty(jayus.DIRTY.ALL);
		}
	},

		//
		//  Styling
		//___________//

	/**
	The brush used to draw the margins of the frame.
	@property {Brush} marginBrush
	*/

	marginBrush: null,

	/**
	Sets the brush used when drawing the margins of the frame.
	<br> Sets the entity as dirty.
	@method {Self} setMarginBrush
	@param {Object} brush
	*/

	setMarginBrush: function Frame_setMarginBrush(brush) {
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginBrush', brush, 'brush', jayus.TYPES.OBJECT);
		//#end
		// Detach self from the old brush
		if(this.marginBrush !== null) {
			this.marginBrush.detach(this);
		}
		// Set and attach self to the new brush
		if(!(brush instanceof jayus.Brush)) {
			brush = new jayus.Brush(brush);
		}
		this.marginBrush = brush;
		this.marginBrush.attach(this);
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Removes the margin brush.
	@method {Self} clearMarginBrush
	*/

	clearMarginBrush: function Frame_clearMarginBrush() {
		if(this.marginBrush !== null) {
			this.marginBrush.detach(this);
			this.marginBrush = null;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

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

	/**
	Sets the margins of the frame.
	@method {Self} setMargin
	@paramset Syntax 1
	@param {Number} margin
	@paramset Syntax 2
	@param {Number} left
	@param {Number} right
	@param {Number} top
	@param {Number} bottom
	*/

	setMargin: function Frame_setMargin(left, right, top, bottom) {
		if(arguments.length === 1) {
			//#ifdef DEBUG
			jayus.debug.match('Frame.setMargin', left, 'margin', jayus.TYPES.NUMBER);
			//#end
			bottom = top = right = left;
		}
		//#ifdef DEBUG
		else {
			jayus.debug.matchArgumentsAs('Frame.setMargin', arguments, jayus.TYPES.NUMBER, 'left', 'right', 'top', 'bottom');
		}
		//#end
		this.marginLeft = left;
		this.marginRight = right;
		this.marginTop = top;
		this.marginBottom = bottom;
		// Check to resize child first, else resize self and tell parent
		// this.child.ignoreDirty++;
		// if(this.child.hasFlexibleWidth) {
		// 	this.child.setWidth(this.width-this.marginLeft-this.marginRight);
		// }
		// else {
		// 	this.changeSize(this.child.width+left+right, this.child.height);
		// }
		// if(this.child.hasFlexibleHeight) {
		// 	this.child.setHeight(this.height-this.marginTop-this.marginBottom);
		// }
		// else {
		// 	this.changeSize(this.child.width, this.child.height+top+bottom);
		// }
		// this.child.ignoreDirty--;
		this.formContents();
		return this;
	},

	/**
	Sets the marginLeft property.
	<br> Sets the entity as dirty.
	@method {Self} setMarginLeft
	@param {Number} margin
	*/

	setMarginLeft: function Frame_setMarginLeft(margin) {
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

	setMarginRight: function Frame_setMarginRight(margin) {
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

	setMarginTop: function Frame_setMarginTop(margin) {
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

	setMarginBottom: function Frame_setMarginBottom(margin) {
		//#ifdef DEBUG
		jayus.debug.match('Frame.setMarginBottom', margin, 'margin', jayus.TYPES.NUMBER);
		//#end
		return this.setMargin(this.marginLeft, this.marginRight, this.marginTop, margin);
	},

		//
		//  Rendering
		//_____________//

	//@ Internal
	formContents: function Frame_formContents() {
		if(this.child !== null && !this.forming) {
			var child = this.child;
			this.forming = true;

			// // Set the childs origin
			child.setOrigin(this.marginLeft, this.marginTop);

			if(this.widthMode === jayus.RESIZE_SELF) {
				this.setWidth(child.width+this.marginLeft+this.marginRight);
			}
			else if(this.widthMode === jayus.RESIZE_CHILD) {
				child.setWidth(this.width-this.marginLeft-this.marginRight);
			}
			else {
				console.error('Frame.formContents() - Invalid widthMode: '+this.widthMode);
			}

			if(this.heightMode === jayus.RESIZE_SELF) {
				this.setHeight(child.height+this.marginTop+this.marginBottom);
			}
			else if(this.heightMode === jayus.RESIZE_CHILD) {
				child.setHeight(this.height-this.marginTop-this.marginBottom);
			}
			else {
				console.error('Frame.formContents() - Invalid heightMode: '+this.heightMode);
			}

 // || (typeof this.child.minHeight === 'number' && this.height-this.marginTop-this.marginBottom < this.child.minHeight)


 			if(this.width < this.minWidth) {
 				this.changeSize(this.minWidth, this.height);
 			}

 			if(this.height < this.minHeight) {
 				this.changeSize(this.width, this.minHeight);
 			}




			// child.domainWidth = this.width-this.marginLeft-this.marginRight;
			// child.domainHeight = this.height-this.marginTop-this.marginBottom;
			// // Set the childs origin
			// child.setOrigin(this.marginLeft, this.marginTop);
			// child.constrain();
			// if(this.flexible) {
			// 	// Set our own size
			// 	this.changeSize(child.width+this.marginLeft+this.marginRight, child.height+this.marginTop+this.marginBottom);
			// }
			// else {
			// 	// Set the child's size
			// 	child.setSize(this.width-this.marginLeft-this.marginRight, this.height-this.marginTop-this.marginBottom);
			// }


			this.forming = false;
		}
	},

	paintContents: function Frame_paintContents(ctx) {
		//#ifdef DEBUG
		jayus.debug.matchContext('Frame.paintContents', ctx);
		//#end
		// Draw the frame
		if(this.marginBrush !== null) {
			if(this.marginBrush.fill || this.marginBrush.stroking) {
				ctx.save();
				this.marginBrush.applyTo(ctx);
				// Etch the border
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(this.width, 0);
				ctx.lineTo(this.width, this.height);
				ctx.lineTo(0, this.height);
				ctx.lineTo(0, 0);
				ctx.moveTo(this.marginLeft, this.marginTop);
				ctx.lineTo(this.width-this.marginRight, this.marginTop);
				ctx.lineTo(this.width-this.marginRight, this.height-this.marginBottom);
				ctx.lineTo(this.marginLeft, this.height-this.marginBottom);
				ctx.lineTo(this.marginLeft, this.marginTop);
				// Check if stroking first
				if(this.marginBrush.stroking && this.marginBrush.strokeFirst) {
					ctx.stroke();
				}
				// Fill the shape
				if(this.marginBrush.filling) {
					ctx.fill();
				}
				// Check if stroking last
				if(this.marginBrush.stroking && !this.marginBrush.strokeFirst) {
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

//
//  jayus.FlexibleFrame()
//_________________________//

/**
A flexible version of the Frame entity.
<br> Whenever the child is resized, the frame resizes itself to match.
@class jayus.FlexibleFrame
@extends jayus.Frame
*/

jayus.FlexibleFrame = jayus.Frame.extend({

	flexible: true

});