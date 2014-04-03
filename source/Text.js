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
Defines the Text entity.
@file Text.js
*/

//
//  jayus.Text()
//________________//

/**
Represents a single line of text.
@class jayus.Text
@extends jayus.RectEntity
*/

jayus.Text = jayus.RectEntity.extend({

	//
	//  Properties
	//______________//

	/**
	The text displayed by the entity.
	<br> Default is '';
	@property {String} text
	*/

	text: '',
	//#replace jayus.Text.prototype.text ''

	/**
	The font to draw the text in.
	<br> Default is '12pt sans-serif';
	@property {String} font
	*/

	font: '12pt sans-serif',
	// FIXME: Text.font - Applying the replace rule for this property breaks the parser

	/**
	How to draw the text.
	<br> Do not modify.
	@property {Brush} brush
	*/

	brush: null,
	//#replace jayus.Text.prototype.brush null

	/**
	The horizontal alignment of the text.
	<br> Do not modify.
	@property {Number} alignment
	*/

	alignment: 0,
	//#replace jayus.Text.prototype.alignment 0

	/*
	The font descriptor for the current font.
	@property {private Object} fontDesc
	*/

	fontDesc: null,

	/*
	An array of the text lines rendered by this Entity.
	<br> Do not modify.
	@property {private Array} lines
	*/

	lines: null,

	/*
	An array of the widths of the text lines.
	<br> Do not modify.
	@property {private Array} lineWidths
	*/

	lineWidths: null,

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	/**
	Initiates the text object.
	<br> All arguments are optional, but must be sent in-order.
	<br> So (text), (text, font), and (text, font, brush) are valid.
	@constructor Text
	@param {String} text Optional
	@param {String} font Optional
	@param {Object} brush Optional
	*/

	init: function Text(text, font, brush) {
		// Call the entity's init method
		jayus.Entity.prototype.init.apply(this);
		// Init some derived properties
		this.fontDesc = jayus.getFontDescriptor(this.font);
		this.lines = [];
		this.lineWidths = [];
		//#ifdef DEBUG
		// Check the arguments
		if(arguments.length === 1) {
			jayus.debug.match('Text', text, 'text', jayus.TYPES.STRING);
		}
		else if(arguments.length === 2) {
			jayus.debug.matchArguments('Text', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING);
		}
		else if(arguments.length === 3) {
			jayus.debug.matchArguments('Text', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING, 'brush', jayus.TYPES.OBJECT);
		}
		//#end
		// Set the properties
		if(arguments.length) {
			this.ignoreDirty++;
			this.setText(text);
			if(arguments.length > 1) {
				this.setFont(font);
				if(arguments.length > 2) {
					this.setBrush(brush);
				}
			}
			this.ignoreDirty--;
		}
		this.refreshMetrics();
	},

	toObject: function Text_toObject() {
		var object = jayus.RectEntity.prototype.toObject.apply(this);
		// Add our own properties
		object.type = 'Text';
		if(this.text !== jayus.Text.prototype.text) {
			object.text = this.text;
		}
		if(this.font !== jayus.Text.prototype.font) {
			object.font = this.font;
		}
		if(this.brush !== jayus.Text.prototype.brush) {
			object.brush = this.brush;
		}
		if(this.alignment !== jayus.Text.prototype.alignment) {
			object.alignment = this.alignment;
		}
		return object;
	},

	//@ From Parsable
	initFromObject: function Text_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Text.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		this.ignoreDirty++;
		// Apply parent properties
		jayus.RectEntity.prototype.initFromObject.call(this, object);
		// Apply our own properties
		if(typeof object.text === 'string') {
			this.setText(object.text);
		}
		if(typeof object.font === 'string') {
			this.setFont(object.font);
		}
		if(typeof object.brush !== 'undefined') {
			this.setBrush(object.brush);
		}
		if(typeof object.alignment === 'number') {
			this.setAlignment(object.alignment);
		}
		this.ignoreDirty--;
		this.refreshMetrics();
		// Set as dirty
		return this.dirty(jayus.DIRTY.ALL);
	},

	componentDirtied: function Text_componentDirtied() {
		this.dirty(jayus.DIRTY.CONTENT);
	},

		//
		//  Frame
		//_________//

	refreshMetrics: function Text_refreshMetrics() {

		var width,
			maxWidth = 0;

		for(var i=this.lines.length-1;i>=0;i--) {
			width = jayus.getTextWidth(this.lines[i], this.font);
			this.lineWidths[i] = width;
			if(width > maxWidth) {
				maxWidth = width;
			}
		}

		this.changeSize(maxWidth, this.lines.length*this.fontDesc.height);

		this.minWidth = this.width;
		this.minHeight = this.height;

	},

	getScope: function Text_getScope() {
		var scope = this.getFrame().getScope();
		if(this.brush !== null) {
			if(this.brush.stroking || this.brush.shadowing) {
				var scale = Math.max(this.xScale, this.yScale),
					left = 0,
					right = 0,
					top = 0,
					bottom = 0;
				// Check if stroking
				if(this.brush.stroking) {
					// This equation is derived from the distance formula
					// It expands the scope far enough to cover 90 degree angles
					// Any angle less than 90 degrees will result in clipping,
					//  a better equation must be used and take miterLimit into account
					var width = (this.brush.lineWidth*scale)/2;
					left = right = top = bottom = Math.sqrt(width*width*2);
				}
				// Check if shadowing
				if(this.brush.shadowing) {
					// Expand each side by the shadow size and offset
					left = Math.max(left, left+this.brush.shadowBlur-this.brush.shadowOffsetX);
					right = Math.max(right, right+this.brush.shadowBlur+this.brush.shadowOffsetX);
					top = Math.max(top, top+this.brush.shadowBlur-this.brush.shadowOffsetY);
					bottom = Math.max(bottom, bottom+this.brush.shadowBlur+this.brush.shadowOffsetY);
				}
				scope.setSize(scope.width+left+right, scope.height+top+bottom);
				scope.translate(-left,-top);
			}
		}
		return scope;
	},

		//
		//  Text
		//________//

	/**
	Sets the text represented by this object.
	@method {Self} setText
	@param {String} text
	*/

	setText: function Text_setText(text) {
		//#ifdef DEBUG
		jayus.debug.match('Text.setText', text, 'text', jayus.TYPES.STRING);
		//#end
		// Check that the text is different
		if(this.text !== text) {
			// Set the text
			this.text = text;
			this.lines = text.split('\n');
			this.lineWidths.length = this.lines.length;
			this.refreshMetrics();
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Font
		//________//

	/**
	Sets the font applied to the text.
	<br> Sets the entity as dirty.
	@method {Self} setFont
	@param {String} font
	*/

	setFont: function Text_setFont(font) {
		//#ifdef DEBUG
		jayus.debug.match('Text.setFont', font, 'font', jayus.TYPES.STRING);
		//#end
		// Check that the font is different
		if(this.font !== font) {
			// Set the font
			this.font = font;
			this.fontDesc = jayus.getFontDescriptor(font);
			// Refresh contents
			this.refreshMetrics();
		}
		return this;
	},

		//
		//  Alignment
		//_____________//

	/**
	Sets the horizontal alignment of the text.
	<br> Unless you have multiple lines of text, the alignment will not be recognized.
	@method {Self} setAlignment
	@param {Number} alignment From 0-1
	*/

	setAlignment: function TextBox_setAlignment(alignment) {
		//#ifdef DEBUG
		jayus.debug.match('TextBox.setAlignment', alignment, 'alignment', jayus.TYPES.NUMBER);
		//#end
		if(this.alignment !== alignment) {
			this.alignment = alignment;
			if(this.lines.length > 1) {
				this.refreshMetrics();
				this.dirty(jayus.DIRTY.CONTENT);
			}
		}
		return this;
	},

		//
		//  Styling
		//___________//

	/**
	Sets the brush used to paint the text.
	<br> Sets the entity as dirty.
	@method {Self} setBrush
	@param {Object} brush
	*/

	setBrush: function Text_setBrush(brush) {
		//#ifdef DEBUG
		jayus.debug.match('Text.setBrush', brush, 'brush', jayus.TYPES.OBJECT);
		//#end
		// Detach self from the old brush
		if(this.brush !== null) {
			this.brush.detach(this);
		}
		// Set and attach self to the new brush
		if(!(brush instanceof jayus.Brush)) {
			brush = new jayus.Brush(brush);
		}
		this.brush = brush;
		this.brush.attach(this);
		return this.dirty(jayus.DIRTY.ALL);
	},

	/**
	Removes the brush.
	@method {Self} clearBrush
	*/

	clearBrush: function Text_clearBrush() {
		if(this.brush !== null) {
			this.brush.detach(this);
			this.brush = null;
			this.dirty(jayus.DIRTY.ALL);
		}
		return this;
	},

		//
		//  Rendering
		//_____________//

	paintContents: function Text_paintContents(ctx) {

		// Cache some metrics
		var ascent = this.fontDesc.ascent,
			height = this.fontDesc.height;

		// Apply the brush and font
		//#ifdef DEBUG
		if(this.brush === null) {
			console.log(this);
			throw new Error('Text.paintContents() - Brush is null');
		}
		//#end
		this.brush.applyTo(ctx);
		ctx.font = this.font;

		// Loop for each line
		var i, line, x;
		for(i=0;i<this.lines.length;i++) {
			line = this.lines[i];
			// Get the x value from the alignment
			x = (this.width-this.lineWidths[i])*this.alignment;
			// Check if stroking first
			if(this.brush.stroking && this.brush.strokeFirst) {
				ctx.strokeText(line, x, ascent+i*height);
			}
			// Fill the text
			if(this.brush.filling) {
				ctx.fillText(line, x, ascent+i*height);
			}
			// Check if stroking last
			if(this.brush.stroking && !this.brush.strokeFirst) {
				ctx.strokeText(line, x, ascent+i*height);
			}
		}

	}

});