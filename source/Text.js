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

//#ifdef DEBUG
jayus.debug.className = 'Text';
//#endif

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

	/**
	The font to draw the text in.
	<br> Default is '12pt sans-serif';
	@property {String} font
	*/

	font: '12pt sans-serif',

	/**
	How to draw the text.
	<br> Do not modify.
	@property {Brush} brush
	*/

	brush: null,

	/**
	Whether a brush is set or not.
	<br> Do not modify.
	@property {Boolean} hasBrush
	*/

	hasBrush: false,

	/**
	The horizontal alignment of the text.
	<br> Do not modify.
	@property {Number} alignment
	*/

	alignment: 0,

	/**
	The font descriptor for the current font.
	@property {Object} fontDesc
	*/

	fontDesc: null,

	/**
	An array of the text lines rendered by this Entity.
	<br> Do not modify.
	@property {Array} lines
	*/

	lines: null,

	/**
	An array of the widths of the text lines.
	<br> Do not modify.
	@property {Array} lineWidths
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
	@constructor init
	@paramset Syntax 1
	@param {String} text
	@paramset Syntax 2
	@param {String} text
	@param {String} font
	@paramset Syntax 3
	@param {String} text
	@param {String} font
	@param {Object} brush
	*/

	init: function Text_init(text, font, brush){
		// Call the entity's init method
		jayus.Entity.prototype.init.apply(this);
		//#ifdef DEBUG
		// Check the arguments
		if(arguments.length === 1){
			jayus.debug.match('Text.init', text, 'text', jayus.TYPES.STRING);
		}
		else if(arguments.length === 2){
			jayus.debug.matchArguments('Text.init', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING);
		}
		else if(arguments.length === 3){
			jayus.debug.matchArguments('Text.init', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING, 'brush', jayus.TYPES.OBJECT);
		}
		//#endif
		// Set the properties
		if(arguments.length){
			this.text = text;
			if(arguments.length > 1){
				this.font = font;
				if(arguments.length > 2){
					this.setBrush(brush);
				}
			}
		}
		this.refreshMetrics();
	},

	componentDirtied: function Text_componentDirtied(){
		this.dirty(jayus.DIRTY.CONTENT);
	},

		//
		//  Frame
		//_________//

	hasFlexibleWidth: function Text_hasFlexibleWidth(){
		return false;
	},

	hasFlexibleHeight: function Text_hasFlexibleHeight(){
		return false;
	},

	refreshMetrics: function Text_refreshMetrics(){

		if(this.fontDesc === null){
			this.fontDesc = jayus.getFontDescriptor(this.font);
		}

		this.lines = this.text.split('\n');

		if(this.lineWidths === null){
			this.lineWidths = [];
		}
		else{
			this.lineWidths.length = this.lines.length;
		}

		var tempRet = {};

		for(var i=0;i<this.lines.length;i++){
			this.lineWidths[i] = jayus.measureTextOnto(this.lines[i], this.font, tempRet).width;
		}

		this.changeSize(jayus.math.max(this.lineWidths), this.lines.length*this.fontDesc.height);

	},

	getScope: function Text_getScope(){
		var scope = this.getFrame().getScope();
		if(this.hasBrush){
			if(this.brush.stroking || this.brush.shadowing){
				var scale = Math.max(this.xScale, this.yScale),
					left = 0,
					right = 0,
					top = 0,
					bottom = 0;
				// Check if stroking
				if(this.brush.stroking){
					// This equation is derived from the distance formula
					// It expands the scope far enough to cover 90 degree angles
					// Any angle less than 90 degrees will result in clipping,
					//  a better equation must be used and take miterLimit into account
					var width = (this.brush.lineWidth*scale)/2;
					left = right = top = bottom = Math.sqrt(width*width*2);
				}
				// Check if shadowing
				if(this.brush.shadowing){
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

	setText: function Text_setText(text){
		//#ifdef DEBUG
		jayus.debug.match('Text.setText', text, 'text', jayus.TYPES.STRING);
		//#endif
		// Check that the text is different
		if(this.text !== text){
			// Set the text
			this.text = text;
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

	setFont: function Text_setFont(font){
		//#ifdef DEBUG
		jayus.debug.match('Text.setFont', font, 'font', jayus.TYPES.STRING);
		//#endif
		// Check that the font is different
		if(this.font !== font){
			// Set the font
			this.font = font;
			this.fontDesc = null;
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

	setAlignment: function TextBox_setAlignment(alignment){
		//#ifdef DEBUG
		jayus.debug.match('TextBox.setAlignment', alignment, 'alignment', jayus.TYPES.NUMBER);
		//#endif
		if(this.alignment !== alignment){
			this.alignment = alignment;
			if(this.lines.length > 1){
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

	setBrush: function Text_setBrush(brush){
		//#ifdef DEBUG
		jayus.debug.match('Text.setBrush', brush, 'brush', jayus.TYPES.OBJECT);
		//#endif
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
		return this.dirty(jayus.DIRTY.ALL);
	},

	/**
	Removes the brush.
	@method {Self} clearBrush
	*/

	clearBrush: function Text_clearBrush(){
		if(this.hasBrush){
			this.brush.detach(this);
			this.brush = null;
			this.hasBrush = false;
			this.dirty(jayus.DIRTY.ALL);
		}
		return this;
	},

		//
		//  Rendering
		//_____________//

	paintContents: function Text_paintContents(ctx){

		// Cache some metrics
		var ascent = this.fontDesc.ascent,
			height = this.fontDesc.height;

		// Apply the brush and font
		this.brush.applyTo(ctx);
		ctx.font = this.font;

		// Loop for each line
		var i, line, x;
		for(i=0;i<this.lines.length;i++){
			line = this.lines[i];
			// Get the x value from the alignment
			x = (this.width-this.lineWidths[i])*this.alignment;
			// Check if stroking first
			if(this.brush.stroking && this.brush.strokeFirst){
				ctx.strokeText(line, x, ascent+i*height);
			}
			// Fill the text
			if(this.brush.filling){
				ctx.fillText(line, x, ascent+i*height);
			}
			// Check if stroking last
			if(this.brush.stroking && !this.brush.strokeFirst){
				ctx.strokeText(line, x, ascent+i*height);
			}
		}
	}

});