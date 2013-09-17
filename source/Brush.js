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
Defines the Brush class.
@file Brush.js
*/

//
//  jayus.Brush()
//_________________//

/**
Contains styling information to describe how entities will draw their components.
@class jayus.Brush
*/

/*

	The Brush class used to use a dirty-refresh system where the types/flags were refreshed only before applied to the context.
	However this was deemed overkill for a style, which will rarely be changed more than once between being applied to a context.
	Instead the style class was modified using the application method, then using a refresh method that refreshed EVERY flag on the style
	This also seemed to be overkill later on and was replaced with the setter archetype, the application method is still possible
		But uses the setters to apply the properties

	Archetype:	Having the brush paint the object
			+ Allows for flexibility
				Custom brushes
				Nested brushes?
			+ Can gain small performance boost from using fillRect/strokeRect
			-- Must account for too many variations
		The dealbreaker ended up being painting text
			The brush would either have to loop over the lines of text itself(which would be hard to make abstract, would have to know metrics)
			Or be forced to re-apply styling for each line draw
			Maybe later when text rendering is incorporated to a single interface/module

*/

//#ifdef DEBUG
jayus.debug.className = 'Brush';
//#endif

jayus.Brush = jayus.Dependency.extend({

	//
	//  Properties
	//______________//

	componentType: 'BRUSH',

		// Meta

	filling: false,
	stroking: false,

	fillType: 0,
	strokeType: 0,
	shadowType: 0,

		// General

	/**
	The opacity of the brush.
	<br> Default is 1.
	@property {Number} alpha
	*/

	alpha: 1,

	/**
	Whether to stroke or fill the shape first.
	<br> Default is false.
	@property {Boolean} strokeFirst
	*/

	strokeFirst: false,

		// Filling

	/**
	How to fill the shape.
	<br> Default is null.
	@property {String|jayus.Color} fill
	*/

	fill: null,

		// Stroking

	/**
	How to stroke the shape.
	<br> Default is null.
	@property {String|jayus.Color} stroke
	*/

	stroke: null,

	/**
	The line width(in pixels) of stroked paths.
	<br> Default is null.
	@property {Number} lineWidth
	*/

	lineWidth: null,

		// Line Caps

	/**
	How line endings are drawn.
	<br> Translates directly to the <a target="_blank" href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-linecap">context.lineCap</a> property.
	<br> The values 'butt', 'square', and 'round' are valid.
	<br> Default is null.
	@property {String} lineCap
	*/

	lineCap: null,

	/**
	How line segments are joined.
	<br> Translates directly to the <a target="_blank" href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-linejoin">context.lineJoin</a> property.
	<br> The values 'bevel', 'round', and 'miter' are valid.
	<br> Default is null.
	@property {String} lineJoin
	*/

	lineJoin: null,

	/**
	The miter limit property of stroked paths.
	<br> Translates directly to the <a target="_blank" href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-miterlimit">context.miterLimit</a> property.
	<br> Limits how far out the miter of two line's joining may be drawn.
	<br> Only applies if the lineJoin property is set to 'miter'.
	<br> Default is null.
	@property {Number} miterLimit
	*/

	miterLimit: null,

		// Dashed Lines

	/**
	The lineDash property.
	<br> How to draw dashed lines.
	<br> Default is null.
	@property {Array|null} lineDash
	*/

	lineDash: null,

	/**
	The lineDashOffset property.
	<br> The offset from which dashed lines are drawn.
	<br> Default is null.
	@property {Number} lineDashOffset
	*/

	lineDashOffset: null,

		// Shadows

	/**
	The color of the shadow to be drawn under the shape.
	<br> Default is null.
	@property {String} shadow
	*/

	shadow: null,

	/**
	The horizontal offset of the shadow drawn under the shape.
	<br> Default is null.
	@property {Number} shadowOffsetX
	*/

	shadowOffsetX: null,

	/**
	The vertical offset of the shadow drawn under the shape.
	<br> Default is null.
	@property {Number} shadowOffsetY
	*/

	shadowOffsetY: null,

	/**
	The amount by which to blur the shadow drawn under the shape.
	<br> Default is null.
	@property {Number} shadowBlur
	*/

	shadowBlur: null,

	//
	//  Methods
	//___________//

	init: function Brush_init(styling){
		// Apply the sent properties
		if(arguments.length){
			//#ifdef DEBUG
			jayus.debug.match('Brush.init', styling, 'styling', jayus.TYPES.OBJECT);
			//#endif
			this.apply(styling);
		}
	},

	componentDirtied: function Brush_componentDirtied(componentType, component, type){
		this.dirty(jayus.DIRTY.STYLE);
	},

	/**
	Applies the given styling properties to the brush.
	@method apply
	@param {Object} styling
	*/

	apply: function Brush_apply(styling){
		//#ifdef DEBUG
		jayus.debug.match('Brush.apply', styling, 'styling', jayus.TYPES.OBJECT);
		//#endif
		this.frozen++;
		for(var key in styling){
			if(styling.hasOwnProperty(key)){
				this['set'+key[0].toUpperCase()+key.slice(1)](styling[key]);
			}
		}
		this.frozen--;
		this.dirty(jayus.DIRTY.STYLE);
		return this;
	},

	// Define a helper function
	findStyleType: function Brush_findStyleType(style){
		if(style === null){
			return 0;
		}
		if(typeof style === 'string'){
			return 1;
		}
		if(style instanceof CanvasGradient){
			return 2;
		}
		if(style instanceof CanvasPattern){
			return 3;
		}
		if(style instanceof jayus.Color){
			return 4;
		}
		if(style instanceof jayus.LinearGradient){
			return 5;
		}
		if(style instanceof jayus.RadialGradient){
			return 6;
		}
		//#ifdef DEBUG
		throw new Error('Style.findStyleType() - Invalid fill/stroke style: '+jayus.debug.toString(style));
		//#endif
	},

	// A helper function
	getNativeStyle: function Brush_getNativeStyle(type, style){
		if(type <= 3){
			// 0: CSS Color String
			// 1: CanvasGradient
			// 2: CanvasPattern
			return style;
		}
		if(type === 4){
			// 4: jayus.Color
			return style.toCSS();
		}
		if(type === 5 || type === 6){
			// 5: jayus.LinearGradient
			// 6: jayus.RadialGradient
			return style.getNative();
		}
		//#ifdef DEBUG
		throw new Error('Style.applyTo() - Invalid fill/stroke type identifier: '+jayus.debug.toString(type));
		//#endif
	},

	/**
	Applies the styling to the given context.
	@method applyTo
	@param {Context} ctx
	*/

	applyTo: function Brush_applyTo(ctx){

		// Apply the alpha
		if(this.alpha !== 1){
			ctx.globalAlpha *= this.alpha;
		}

		// filling
		if(this.filling){
			// fillStyle
			ctx.fillStyle = this.getNativeStyle(this.fillType, this.fill);
		}

		// stroking
		if(this.stroking){
			// strokeStyle
			ctx.strokeStyle = this.getNativeStyle(this.strokeType, this.stroke);
			// Stroke properties
			if(this.lineWidth !== null){
				ctx.lineWidth = this.lineWidth;
			}
			if(this.lineCap !== null){
				ctx.lineCap = this.lineCap;
			}
			if(this.lineJoin !== null){
				ctx.lineJoin = this.lineJoin;
			}
			if(this.miterLimit !== null){
				ctx.miterLimit = this.miterLimit;
			}
			// Line dashing, if supported
			if(this.lineDash !== null && jayus.ua.lineDash){
				ctx.setLineDash(this.lineDash);
				if(this.lineDashOffset !== null){
					ctx.lineDashOffset = this.lineDashOffset;
				}
			}
		}

		// shadows
		if(this.shadowType){
			// shadowColor
			if(this.shadowType === 1){
				ctx.shadowColor = this.shadow;
			}
			else if(this.shadowType === 2){
				ctx.shadowColor = this.shadow.toCSS();
			}
			//#ifdef DEBUG
			else{
				throw new Error('Style.applyTo() - Invalid shadow type identifier: '+jayus.debug.toString(this.shadowType));
			}
			//#endif
			// Shadow properties
			if(this.shadowOffsetX !== null){
				ctx.shadowOffsetX = this.shadowOffsetX;
			}
			if(this.shadowOffsetY !== null){
				ctx.shadowOffsetY = this.shadowOffsetY;
			}
			if(this.shadowBlur !== null){
				ctx.shadowBlur = this.shadowBlur;
			}
		}



	},

	/**
	Draws the current path on the given canvas context.
	<br> The context state is not saved and restored within the method.
	@method paintShape
	@param {Context} ctx
	*/

	paintShape: function Brush_paintShape(ctx){
		// Apply my styling
		this.applyTo(ctx);
		// Check if stroking first
		if(this.stroking && this.strokeFirst){
			ctx.stroke();
		}
		// Fill the shape
		if(this.filling){
			ctx.fill();
		}
		// Check if stroking last
		if(this.stroking && !this.strokeFirst){
			ctx.stroke();
		}
	},

	/**
	Draws a rectangle onto the given canvas context.
	<br> The context state is saved and restored within this method.
	@method paintRect
	@param {Context} ctx
	@param {Number} x
	@param {Number} y
	@param {Number} width
	@param {Number} height
	*/

	paintRect: function Brush_paintRect(ctx, x, y, width, height){
		// Save the context and apply the styling
		ctx.save();
		this.applyTo(ctx);
		// Check if stroking first
		if(this.stroking && this.strokeFirst){
			ctx.strokeRect(x, y, width, height);
		}
		// Fill the shape
		if(this.filling){
			ctx.fillRect(x, y, width, height);
		}
		// Check if stroking last
		if(this.stroking && !this.strokeFirst){
			ctx.strokeRect(x, y, width, height);
		}
		// Restore the context
		ctx.restore();
	},

	//
	//  Getters/Setters
	//___________________//

	/**
	Sets the alpha property.
	<br> Send null to clear the property.
	@method setAlpha
	@param {Number} alpha
	*/

	setAlpha: function Brush_setAlpha(alpha){
		//#ifdef DEBUG
		if(alpha !== null){
			jayus.debug.match('Brush.setAlpha', alpha, 'alpha', jayus.TYPES.NUMBER);
		}
		//#endif
		if(alpha === null){
			alpha = 1;
		}
		if(this.alpha !== alpha){
			this.alpha = alpha;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the fill property.
	<br> Send null to clear the property.
	@method setFill
	@param {*} style
	*/

	setFill: function Brush_setFill(style){
		//#ifdef DEBUG
		if(style !== null){
			jayus.debug.match('Brush.setFill', style, 'style', jayus.TYPES.DEFINED);
		}
		//#endif
		// If the old style was a Dependency, detach self
		if(this.fillType >= 4){
			this.fill.detach(this);
		}
		// Set the new style and type
		this.fill = style;
		this.fillType = this.findStyleType(style);
		// If the new style is a Dependency, attach self
		if(this.fillType >= 4){
			this.fill.attach(this);
		}
		this.filling = !!this.fillType;
		this.dirty(jayus.DIRTY.STYLE);
		return this;
	},

	/**
	Sets the stroke property.
	<br> Send null to clear the property.
	@method setStroke
	@param {*} style
	*/

	setStroke: function Brush_setStroke(style){
		//#ifdef DEBUG
		if(style !== null){
			jayus.debug.match('Brush.setStroke', style, 'style', jayus.TYPES.DEFINED);
		}
		//#endif
		// If the old style was a Dependency, detach self
		if(this.strokeType >= 4){
			this.stroke.detach(this);
		}
		// Set the new style and type
		this.stroke = style;
		this.strokeType = this.findStyleType(style);
		// If the new style is a Dependency, attach self
		if(this.strokeType >= 4){
			this.stroke.attach(this);
		}
		this.stroking = !!this.strokeType;
		this.dirty(jayus.DIRTY.STYLE);
		return this;
	},

	/**
	Sets the lineWidth property.
	<br> Send null to clear the property.
	@method setLineWidth
	@param {Number} lineWidth
	*/

	setLineWidth: function Brush_setLineWidth(lineWidth){
		//#ifdef DEBUG
		if(lineWidth !== null){
			jayus.debug.match('Brush.setLineWidth', lineWidth, 'lineWidth', jayus.TYPES.NUMBER);
		}
		//#endif
		if(this.lineWidth !== lineWidth){
			this.lineWidth = lineWidth;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the lineCap property.
	<br> Send null to clear the property.
	@method setLineCap
	@param {String} lineCap
	*/

	setLineCap: function Brush_setLineCap(lineCap){
		//#ifdef DEBUG
		if(lineCap !== null){
			jayus.debug.match('Brush.setLineCap', lineCap, 'lineCap');
		}
		//#endif
		if(this.lineCap !== lineCap){
			this.lineCap = lineCap;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the lineJoin property.
	<br> Send null to clear the property.
	@method setLineJoin
	@param {String} lineJoin
	*/

	setLineJoin: function Brush_setLineJoin(lineJoin){
		//#ifdef DEBUG
		if(lineJoin !== null){
			jayus.debug.match('Brush.setLineJoin', lineJoin, 'lineJoin', jayus.TYPES.STRING);
		}
		//#endif
		if(this.lineJoin !== lineJoin){
			this.lineJoin = lineJoin;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the miterLimit property.
	<br> Send null to clear the property.
	@method setMiterLimit
	@param {Number} miterLimit
	*/

	setMiterLimit: function Brush_setMiterLimit(miterLimit){
		//#ifdef DEBUG
		if(miterLimit !== null){
			jayus.debug.match('Brush.setMiterLimit', miterLimit, 'miterLimit', jayus.TYPES.STRING);
		}
		//#endif
		if(this.miterLimit !== miterLimit){
			this.miterLimit = miterLimit;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the lineDash property.
	<br> Send null to clear the property.
	@method setLineDash
	@param {Array} lineDash
	*/

	setLineDash: function Brush_setLineDash(lineDash){
		//#ifdef DEBUG
		if(lineDash !== null){
			jayus.debug.matchArray('Style.setLineDash', lineDash, 'lineDash', jayus.TYPES.NUMBER);
		}
		//#endif
		this.lineDash = lineDash;
		this.dirty(jayus.DIRTY.STYLE);
		return this;
	},

	/**
	Sets the lineDashOffset property.
	<br> Send null to clear the property.
	@method setLineDashOffset
	@param {Number} lineDashOffset
	*/

	setLineDashOffset: function Brush_setLineDashOffset(lineDashOffset){
		//#ifdef DEBUG
		if(lineDashOffset !== null){
			jayus.debug.match('Brush.setLineDashOffset', lineDashOffset, 'lineDashOffset', jayus.TYPES.NUMBER);
		}
		//#endif
		if(this.lineDashOffset !== lineDashOffset){
			this.lineDashOffset = lineDashOffset;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the shadow property.
	<br> Send null to clear the property.
	@method setShadow
	@param {*} shadow
	*/

	setShadow: function Brush_setShadow(shadow){
		//#ifdef DEBUG
		if(shadow !== null){
			jayus.debug.match('Brush.setShadow', shadow, 'shadow', jayus.TYPES.DEFINED);
		}
		//#endif
		// If the old shadow was a Dependency, detach self
		if(this.shadowType === 2){
			this.shadow.detach(this);
		}
		// Set the new shadow and type
		this.shadow = shadow;
		if(shadow === null){
			this.shadowType = 0;
		}
		else if(typeof shadow === 'string'){
			this.shadowType = 1;
		}
		else if(shadow instanceof jayus.Color){
			this.shadowType = 2;
			this.shadow.attach(this);
		}
		//#ifdef DEBUG
		else{
			throw new Error('Style.setShadow() - Invalid shadow style: '+jayus.debug.toString(shadow));
		}
		//#endif
		this.dirty(jayus.DIRTY.STYLE);
		return this;
	},

	/**
	Sets the shadowOffsetX property.
	<br> Send null to clear the property.
	@method setShadowOffsetX
	@param {Number} shadowOffsetX
	*/

	setShadowOffsetX: function Brush_setShadowOffsetX(shadowOffsetX){
		//#ifdef DEBUG
		if(shadowOffsetX !== null){
			jayus.debug.match('Brush.setShadowOffsetX', shadowOffsetX, 'shadowOffsetX', jayus.TYPES.NUMBER);
		}
		//#endif
		if(this.shadowOffsetX !== shadowOffsetX){
			this.shadowOffsetX = shadowOffsetX;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the shadowOffsetY property.
	<br> Send null to clear the property.
	@method setShadowOffsetY
	@param {Number} shadowOffsetY
	*/

	setShadowOffsetY: function Brush_setShadowOffsetY(shadowOffsetY){
		//#ifdef DEBUG
		if(shadowOffsetY !== null){
			jayus.debug.match('Brush.setShadowOffsetY', shadowOffsetY, 'shadowOffsetY', jayus.TYPES.NUMBER);
		}
		//#endif
		if(this.shadowOffsetY !== shadowOffsetY){
			this.shadowOffsetY = shadowOffsetY;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	},

	/**
	Sets the shadowBlur property.
	<br> Send null to clear the property.
	@method setShadowBlur
	@param {Number} shadowBlur
	*/

	setShadowBlur: function Brush_setShadowBlur(shadowBlur){
		//#ifdef DEBUG
		if(shadowBlur !== null){
			jayus.debug.match('Brush.setShadowBlur', shadowBlur, 'shadowBlur', jayus.TYPES.NUMBER);
		}
		//#endif
		if(this.shadowBlur !== shadowBlur){
			this.shadowBlur = shadowBlur;
			this.dirty(jayus.DIRTY.STYLE);
		}
		return this;
	}

});