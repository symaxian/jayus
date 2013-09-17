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
Defines the Matrix object.
@file Matrix.js
*/

//
//  jayus.Matrix
//________________//

/**
A two-dimensional transformation matrix.
@class jayus.Matrix
*/

//#ifdef DEBUG
jayus.debug.className = 'Matrix';
//#endif

jayus.Matrix = jayus.createClass({

	//	a	b	tx
	//	c	d	ty
	//	0	0	1

	a: 1,	b: 0,	tx: 0,
	c: 0,	d: 1,	ty: 0,

	/**
	Initializes the matrix.
	<br> Starts off as an identity matrix, unless initial values are specifie.
	<br> The initial values are optional.
	@method init
	@param {Number} a
	@param {Number} b
	@param {Number} tx
	@param {Number} c
	@param {Number} d
	@param {Number} ty
	*/

	init: function Matrix_init(a, b, tx, c, d, ty){
		if(arguments.length){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('Matrix.init', arguments, jayus.TYPES.NUMBER, 'a', 'b', 'tx', 'c', 'd', 'ty');
			//#endif
			this.a = a;
			this.b = b;
			this.tx = tx;
			this.c = c;
			this.d = d;
			this.ty = ty;
		}
	},

	/**
	Translates the matrix.
	@method {Self} translate
	@paramset 1
	@param {Point} point
	@paramset 2
	@param {Number} x
	@param {Number} y
	*/

	translate: function Matrix_translate(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Matrix.translate', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		this.tx += this.a*x + this.b*y;
		this.ty += this.d*y + this.c*x;
		return this;
	},

	/**
	Scales the matrix.
	@method {Self} scale
	@paramset Syntax 1
	@param {Number} scale
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	scale: function Matrix_scale(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Matrix.scale', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		this.a *= x;
		this.c *= x;
		this.d *= y;
		this.b *= y;
		return this;
	},

	/**
	Rotates the matrix.
	@method {Self} rotate
	@param {Number} angle
	*/

	rotate: function Matrix_rotate(angle){
		//#ifdef DEBUG
		jayus.debug.match('Matrix.rotate', angle, 'angle', jayus.TYPES.NUMBER);
		//#endif
		var sin = Math.sin(angle),
			cos = Math.cos(angle);
		// Modify ab
		var a = this.a*cos + this.b*sin;
		this.b = -this.a*sin + this.b*cos;
		this.a = a;
		// Modify cd
		var c = this.d*sin + this.c*cos;
		this.d = this.d*cos - this.c*sin;
		this.c = c;
		return this;
	},

	/**
	Returns a new matrix multiplied by this one and the sent one.
	@method {Matrix} multiply
	@param {Matrix} m1
	*/

	multiply: function Matrix_multiply(m1){
		//#ifdef DEBUG
		jayus.debug.match('Matrix.multiply', m1, 'm1', jayus.TYPES.MATRIX);
		//#endif
		m2 = this;
		// a, b, tx, c, d, ty
		return new jayus.Matrix(
			m1.a*m2.a + m1.b*m2.c,
			m1.a*m2.b + m1.b*m2.d,
			m1.a*m2.tx + m1.b*m2.ty + m1.tx,
			m1.c*m2.a + m1.d*m2.c,
			m1.c*m2.b + m1.d*m2.d,
			m1.c*m2.tx + m1.d*m2.ty + m1.ty
		);
	},

	/**
	Transforms the given coordinate.
	@method {Point} transformPoint
	@paramset Syntax 1
	@param {Number} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	transformPoint: function Matrix_transformPoint(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Matrix.transformPoint', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.transformPointOnto(x, y, new jayus.Point());
		// return new jayus.Point(x*this.a+y*this.b+this.tx, x*this.c+y*this.d+this.ty);
	},

	/**
	Transforms the given coordinate, storing the result into the ret parameter.
	@method transformPointOnto
	@param {Number} x
	@param {Number} y
	@param {Point} ret
	*/

	transformPointOnto: function Matrix_transformPointOnto(x, y, ret){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Matrix.transformPointOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y',jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#endif
		ret.x = x*this.a + y*this.b + this.tx;
		ret.y = x*this.c + y*this.d + this.ty;
		return ret;
	},

	/**
	Inverse transforms the given coordinate.
	@method {Point} inverseTransformPoint
	@paramset Syntax 1
	@param {Number} point
	@paramset Syntax 2
	@param {Number} x
	@param {Number} y
	*/

	inverseTransformPoint: function Matrix_inverseTransformPoint(x, y){
		//#ifdef DEBUG
		jayus.debug.matchCoordinate('Matrix.inverseTransformPoint', x, y);
		//#endif
		if(arguments.length === 1){
			y = x.y;
			x = x.x;
		}
		return this.inverseTransformPointOnto(x, y, new jayus.Point());
		// var det = this.getDeterminant();
		// if(det){
		// 	x -= this.tx;
		// 	y -= this.ty;
		// 	return new jayus.Point( (x*this.d - y*this.b)/det, (y*this.a - x*this.c)/det );
		// }
		// return null;
	},

	/**
	Inverse transforms the given coordinate, storing the result into the ret parameter.
	@method inverseTransformPointOnto
	@param {Number} x
	@param {Number} y
	@param {Point} ret
	*/

	inverseTransformPointOnto: function Matrix_inverseTransformPointOnto(x, y, ret){
		//#ifdef DEBUG
		jayus.debug.matchArguments('Matrix.inverseTransformPointOnto', arguments, 'x', jayus.TYPES.NUMBER, 'y',jayus.TYPES.NUMBER, 'ret', jayus.TYPES.POINT);
		//#endif
		var det = this.getDeterminant();
		if(det){
			x -= this.tx;
			y -= this.ty;
			ret.x = (x*this.d - y*this.b)/det;
			ret.y = (y*this.a - x*this.c)/det;
			return ret;
		}
		return null;
	},

		//
		//  Utilities
		//_____________//

	/**
	Reverts this matrix to the identity matrix.
	@method {Self} identity
	*/

	identity: function Matrix_identity(){
		this.a = this.d = 1;
		this.b = this.tx = this.c = this.ty = 0;
		return this;
	},

	/**
	Returns the determinant of this matrix.
	<br> An epsilon of 10e-12 is used.
	@method {Number} getDeterminant
	*/

	getDeterminant: function Matrix_getDeterminant(){
		var det = this.a*this.d - this.b*this.c;
		if(isFinite(det) && Math.abs(det) > 10e-12 && isFinite(this.tx) && isFinite(this.ty)){
			return det;
		}
		return null;
	},

	/**
	Returns a clone of this matrix.
	@method {Matrix} clone
	*/

	clone: function Matrix_clone(){
		//#ifdef DEBUG
		jayus.chart.tallyInit('Matrix', 'Matrix.clone()');
		//#endif
		return this.cloneOnto(new jayus.Matrix());
	},

	/**
	Clones this matrix onto the given matrix.
	@method clone
	@param {Matrix} ret
	*/

	cloneOnto: function Matrix_cloneOnto(ret){
		//#ifdef DEBUG
		jayus.debug.match('Matrix.cloneOnto', ret, 'ret', jayus.TYPES.MATRIX);
		//#endif
		ret.init(this.a, this.b, this.tx, this.c, this.d, this.ty);
		return ret;
	},

	//#ifdef DEBUG
	toString: function Matrix_toString(){
		return	'[ '+this.a+', '+this.b+', '+this.tx+' ]\n'+
				'[ '+this.b+', '+this.d+', '+this.ty+' ]\n'+
				'[ '+0+', '+0+', '+1+' ]';
	},
	//#endif

	/**
	Compares against another matrix for equality.
	@method {Boolean} equals
	@param {Matrix} mat
	*/

	equals: function Matrix_equals(mat){
		//#ifdef DEBUG
		jayus.debug.match('Matrix.equals', mat, 'mat', jayus.TYPES.MATRIX);
		//#endif
		return this.a === mat.a && this.b === mat.b && this.c === mat.c && this.d === mat.d && this.tx === mat.tx && this.ty === mat.ty;
	},

	/**
	Applies the transformation matrix to the given canvas context.
	@method applyToContext
	@param {Context} ctx
	*/

	applyToContext: function Matrix_applyToContext(ctx){
		//#ifdef DEBUG
		jayus.debug.matchContext('Matrix.applyToContext', ctx);
		//#endif
		ctx.transform(this.a, this.c, this.b, this.d, this.tx, this.ty);
	}

});