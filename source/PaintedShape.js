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
Defines the base jayus.PaintedShape class.
@file PaintedShape.js
*/

//
//  jayus.PaintedShape()
//________________________//

/**
An Entity that holds a Shape and allows it to be added to the scenegraph.
<br> Adds position, transformation, and styling to the rendered shape.
@class jayus.PaintedShape
@extends jayus.Entity
*/

//#ifdef DEBUG
jayus.debug.className = 'PaintedShape';
//#endif

jayus.PaintedShape = jayus.Entity.extend({

	/**
	The shape to style/draw.
	<br> Do not modify.
	@property {Shape} shape
	*/

	shape: null,

	/**
	How to draw the shape.
	@property {Brush} brush
	*/

	brush: null,

	/**
	Whether a brush is set or not.
	@property {Boolean} hasBrush
	*/

	hasBrush: false,

	//
	//  Methods
	//___________//

	/**
	Initiates the painted shape.
	@method init
	@param {Shape} shape
	@param {Object} brush Optional
	*/

	init: function PaintedShape_init(shape, brush){
		// Call the inherited init method
		jayus.Entity.prototype.init.apply(this);
		this.shape = shape;
		shape.attach(this);
		if(brush !== undefined){
			this.setBrush(brush);
		}
	},

	componentDirtied: function PaintedShape_componentDirtied(componentType, component, type){
		this.dirty(jayus.DIRTY.CONTENT);
	},

	translate: function PaintedShape_translate(x, y){
		// Translate the shape
		this.shape.translate.call(this.shape, x, y);
		// Alert as moved
		this.dirty(jayus.DIRTY.POSITION);
	},

	//@ From Entity
	intersectsAt: function PaintedShape_intersectsAt(x, y){
		if(this.isTransformed){
			var pos = this.getMatrix().inverseTransformPoint(x, y);
			x = pos.x;
			y = pos.y;
		}
		return this.shape.intersectsAt(x, y);
	},

		//
		//  Shape
		//_________//

	/**
	Sets the shape to paint.
	<br> Sets the entity as dirty.
	@method {Self} setShape
	@param {Shape} shape
	*/

	setShape: function PaintedShape_setShape(shape){
		//#ifdef DEBUG
		jayus.debug.match('PaintedShape.setShape', shape, 'shape', jayus.TYPES.SHAPE);
		//#endif
		if(this.shape !== shape){
			this.shape.detach(this);
			this.shape = shape;
			shape.attach(this);	
			this.dirty(jayus.DIRTY.ALL);
		}
		return this;
	},

		//
		//  Styling
		//___________//

	/**
	Sets the brush used to draw the shape.
	<br> Sets the entity as dirty.
	@method {Self} setBrush
	@param {Brush} brush
	*/

	setBrush: function PaintedShape_setBrush(brush){
		//#ifdef DEBUG
		jayus.debug.match('PaintedShape.setBrush', brush, 'brush', jayus.TYPES.OBJECT);
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
		brush.attach(this);
		this.hasBrush = true;
		return this.dirty(jayus.DIRTY.CONTENT);
	},

	/**
	Removes the brush.
	@method {Self} clearBrush
	*/

	clearBrush: function PaintedShape_clearBrush(){
		if(this.hasBrush){
			this.brush.detach(this);
			this.brush = null;
			this.hasBrush = false;
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

		//
		//  Geometry
		//____________//

	//@ From Entity
	getScope: function PaintedShape_getScope(){
		if(!this.isTransformed){
			return this.shape.getScope();
		}
		var scope = this.shape.getScope().getTransformed(this.getMatrix()).getScope();
		// var scope = this.shape.getScope().getTransformed(this.getMatrix()).translate(this.x, this.y).getScope();
		if(this.brush.stroking || this.brush.shadowing){
			var scale = Math.max(this.xScale, this.yScale),
				left = 0,
				right = 0,
				top = 0,
				bottom = 0;
			// Check if stroking
			if(this.brush.stroking){
				// Old method
				// Derived from distance formula and doesn't work past 90 degree angles
				var width = (this.brush.lineWidth*scale)/2;
				left = right = top = bottom = Math.sqrt(width*width*2);
				// New method, works but is overkill for most shapes
				var miterLimit;
				if(this.brush.miterLimit === undefined){
					miterLimit = 10;
				}
				else{
					miterLimit = this.brush.miterLimit;
				}
				left = right = top = bottom = miterLimit*scale/1.5;
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
			scope.translate(-left, -top);
		}
		return scope;
	},

	//@ From Entity
	getBounds: function PaintedShape_getBounds(){
		return this.shape;
	},

		//
		//  Rendering
		//_____________//

	//@ From Entity
	drawOntoContext: function PaintedShape_drawOntoContext(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('PaintedShape.drawOntoContext', ctx);
		//#endif
		if(this.hasBrush){
			// Save the context
			ctx.save();
			if(this.alpha !== 1){
				ctx.globalAlpha *= this.alpha;
			}
			// Set the transformations
			this.applyTransforms(ctx);
			// Etch the shape
			this.shape.etchOntoContext(ctx);
			// Render the shape
			this.brush.paintShape(ctx);
			// Restore the context
			ctx.restore();
			// Run the debug renderer
			//#ifdef DEBUG
			if(this.debugRenderer !== null){
				this.debugRenderer(ctx);
			}
			//#endif
		}
	}

});