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
Defines the jayus.easing module.
@file easing.js
*/

//
//  jayus.easing
//________________//

/**
A set of easing functions for animations.
<br> An easing function determines how fast the animation should play across its duration.
<br> Each easing function works by taking a number from 0-1 as the current point in time across the animations duration and returning a number 0-1 representing the how far the animation should have progressed to that point.
<br> The easing functions are based on those from the jQuery Easing Plugin.
<br> A good demonstration of these effects can be found here: http://james.padolsey.com/demos/jquery/easing/
<br> More information can be found in easing.js
@namespace jayus.easing
*/

/*

Notes:

	Each function accepts a single argument, the current position of the animation's elapsed time
	... across its duration, between 0 and 1

	Each function then returns a number between 0 and 1, determining how far along the effects of
	... the animation should have progressed

	Helpful links:
		http://gsgd.co.uk/sandbox/jquery/easing/
		http://stackoverflow.com/questions/5916058/jquery-easing-function

*/

jayus.easing = {

	/**
	The linear easing function, which results in no easing.
	<br> Always returns the t parameter.
	@method {Number} linear
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	linear: function jayus_easing_linear(t){
		return t;
	},

	/**
	The easeInQuad easing function.
	@method {Number} easeInQuad
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInQuad: function jayus_easing_easeInQuad(t){
		return t*t;
	},

	/**
	The easeOutQuad easing function.
	@method {Number} easeOutQuad
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutQuad: function jayus_easing_easeOutQuad(t){
		return t*(2-t);
	},

	/**
	The easeInOutQuad easing function.
	@method {Number} easeInOutQuad
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutQuad: function jayus_easing_easeInOutQuad(t){
		return ((t/=0.5) < 1 ? t*t : (1-t)*(t-3)+1)/2;
	},

	/**
	The easeInCubic easing function.
	@method {Number} easeInCubic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInCubic: function jayus_easing_easeInCubic(t){
		return t*t*t;
	},

	/**
	The easeOutCubic easing function.
	@method {Number} easeOutCubic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutCubic: function jayus_easing_easeOutCubic(t){
		return --t*t*t+1;
	},

	/**
	The easeInOutCubic easing function.
	@method {Number} easeInOutCubic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutCubic: function jayus_easing_easeInOutCubic(t){
		return (t/=0.5) < 1 ? t*t*t/2 : (t-=2)*t*t/2+1;
	},

	/**
	The easeInQuart easing function.
	@method {Number} easeInQuart
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInQuart: function jayus_easing_easeInQuart(t){
		return t*t*t*t;
	},

	/**
	The easeOutQuart easing function.
	@method {Number} easeOutQuart
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutQuart: function jayus_easing_easeOutQuart(t){
		return --t*t*t*-t+1;
	},

	/**
	The easeInOutQuart easing function.
	@method {Number} easeInOutQuart
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutQuart: function jayus_easing_easeInOutQuart(t){
		return (t/=0.5) < 1 ? t*t*t*t/2 : 1-(t-=2)*t*t*t/2;
	},

	/**
	The easeInQuint easing function.
	@method {Number} easeInQuint
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInQuint: function jayus_easing_easeInQuint(t){
		return t*t*t*t*t;
	},

	/**
	The easeOutQuint easing function.
	@method {Number} easeOutQuint
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutQuint: function jayus_easing_easeOutQuint(t){
		return --t*t*t*t*t+1;
	},

	/**
	The easeInOutQuint easing function.
	@method {Number} easeInOutQuint
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutQuint: function jayus_easing_easeInOutQuint(t){
		return (t/=0.5) < 1 ? t*t*t*t*t/2 : (t-=2)*t*t*t*t/2+1;
	},

	/**
	The easeInSine easing function.
	@method {Number} easeInSine
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInSine: function jayus_easing_easeInSine(t){
		return 1-Math.cos(t*Math.PI/2);
	},

	/**
	The easeOutSine easing function.
	@method {Number} easeOutSine
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutSine: function jayus_easing_easeOutSine(t){
		return Math.sin(t*Math.PI/2);
	},

	/**
	The easeInOutSine easing function.
	@method {Number} easeInOutSine
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutSine: function jayus_easing_easeInOutSine(t){
		return 0.5-Math.cos(t*Math.PI)/2;
	},

	/**
	The easeInExpo easing function.
	@method {Number} easeInExpo
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInExpo: function jayus_easing_easeInExpo(t){
		return (t > 0)*Math.pow(2,10*t-10);
	},

	/**
	The easeOutExpo easing function.
	@method {Number} easeOutExpo
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutExpo: function jayus_easing_easeOutExpo(t){
		return 1-(t !== 1)*Math.pow(2,-10*t);
	},

	/**
	The easeInOutExpo easing function.
	@method {Number} easeInOutExpo
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutExpo: function jayus_easing_easeInOutExpo(t){
		if(!t || t === 1){
			return t;
		}
		return (t/=0.5) < 1 ? Math.pow(2,10*t-10)/2 : 1-Math.pow(2,10-10*t)/2;
	},

	/**
	The easeInCirc easing function.
	@method {Number} easeInCirc
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInCirc: function jayus_easing_easeInCirc(t){
		return 1-Math.sqrt(1-t*t);
	},

	/**
	The easeOutCirc easing function.
	@method {Number} easeOutCirc
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutCirc: function jayus_easing_easeOutCirc(t){
		return Math.sqrt(--t*-t+1);
	},

	/**
	The easeInOutCirc easing function.
	@method {Number} easeInOutCirc
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutCirc: function jayus_easing_easeInOutCirc(t){
		if((t/=0.5) < 1){
			return -(Math.sqrt(1 - t*t) - 1)/2;
		}
		return (Math.sqrt(1 - (t-=2)*t) + 1)/2;
	},

	/**
	The easeInElastic easing function.
	@method {Number} easeInElastic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInElastic: function jayus_easing_easeInElastic(t){
		if(!t || t === 1){
			return t;
		}
		var p = 0.3,
			s = p/(2*Math.PI)*Math.PI/2;
		return -Math.pow(2,10*--t)*Math.sin((t-s)*2*Math.PI/p);
	},

	/**
	The easeOutElastic easing function.
	@method {Number} easeOutElastic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutElastic: function jayus_easing_easeOutElastic(t){
		if(!t || t === 1){
			return t;
		}
		var p = 0.3,
			s = p/(2*Math.PI)*Math.PI/2;
		return Math.pow(2,-10*t)*Math.sin((t-s)*2*Math.PI/p)+1;
	},

	/**
	The easeInOutElastic easing function.
	@method {Number} easeInOutElastic
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutElastic: function jayus_easing_easeInOutElastic(t){
		if(!t || t === 1){
			return t;
		}
		var p = 0.3*1.5,
			s = p/(2*Math.PI)*Math.PI/2;
		return (t/=0.5) < 1 ? -Math.pow(2,10*--t)*Math.sin((t-s)*2*Math.PI/p)/2 : Math.pow(2,-10*--t)*Math.sin((t-s)*2*Math.PI/p)/2+1;
	},

	/**
	The easeInBack easing function.
	@method {Number} easeInBack
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInBack: function jayus_easing_easeInBack(t){
		var s = 1.70158;
		return t*t*(t*(s+1)-s);
	},

	/**
	The easeOutBack easing function.
	@method {Number} easeOutBack
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutBack: function jayus_easing_easeOutBack(t){
		var s = 1.70158;
		return --t*t*((s+1)*t+s)+1;
	},

	/**
	The easeInOutBack easing function.
	@method {Number} easeInOutBack
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutBack: function jayus_easing_easeInOutBack(t){
		var s = 1.70158;
		return (t/=0.5) < 1 ? t*t*(((s*=1.525)+1)*t-s)/2 : (t-=2)*t*(((s*=1.525)+1)*t+s)/2+1;
	},

	/**
	The easeInBounce easing function.
	@method {Number} easeInBounce
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInBounce: function jayus_easing_easeInBounce(t){
		return 1-jayus.easing.easeOutBounce(1-t);
	},

	/**
	The easeOutBounce easing function.
	@method {Number} easeOutBounce
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeOutBounce: function jayus_easing_easeOutBounce(t){
		if(t < 1/2.75){
			return 7.5625*t*t;
		}
		if(t < 2/2.75){
			return 7.5625*(t-=(1.5/2.75))*t+0.75;
		}
		if(t < 2.5/2.75){
			return 7.5625*(t-=(2.25/2.75))*t+0.9375;
		}
		return 7.5625*(t-=(2.625/2.75))*t+0.984375;
	},

	/**
	The easeInOutBounce easing function.
	@method {Number} easeInOutBounce
	@param {Number} t The percentage of the position of time the animation is at, from 0-1
	*/

	easeInOutBounce: function jayus_easing_easeInOutBounce(t){
		return t < 0.5 ? jayus.easing.easeInBounce(t*2)/2 : jayus.easing.easeOutBounce(t*2-1)/2+0.5;
	}

};