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
Defines the base Animator class.
@file Animator.js
*/

//
//  jayus.Animator
//__________________//

//TODO:

	// Event data
	// Event documentation on site

	// Fix copying, does not copy handlers

	// More animators

	// Tweening
		// Constructs a set of Animators to tween an entity from its current state to the target state
		// Requires:
			// Initial state
			// Final state
			// duration
		// Would return the set of animators

	// Testing

/**
An abstract class for an animator, an object that performs an animation.
<br> Animators should rarely be created manually.
<br> many Entity methods can be animated, in which case the method returns an Animator to perform the action rather than actually performing the action itself.
<br> Such as calling myRect.animate().translate(30, 30).setDuration(1000) returns an animator which will move then Entity 30x30 pixels over a period of one second after being started.
@class jayus.Animator
@extends jayus.Responder
*/

//#ifdef DEBUG
jayus.debug.className = 'Animator';
//#endif

jayus.Animator = jayus.Responder.extend({

	//
	//  Properties
	//______________//

	isAnimator: true,

	/**
	Whether or not the animation is running.
	<br> Do not modify.
	@property {Boolean} running
	*/

	running: false,

	/**
	The duration of the animation, in milliseconds.
	<br> Default is 1000(one second).
	<br> Do not modify.
	@property {Number} duration
	*/

	duration: 1000,

	/**
	The point in time when the animation was started, in milliseconds.
	<br> Do not modify.
	@property {Number} startTime
	*/

	startTime: null,

	/**
	The animator's easing function.
	<br> The easing function modifies the speed of the animation along its duration.
	<br> The default easing function is linear, with the animation keeping a consistent speed.
	<br> Can be replaced by any of the functions in jayus.easing or a custom one.
	<br> Default is jayus.easing.linear
	<br> Do not modify.
	@property {Function} easing
	*/

	easing: jayus.easing.linear,

	/**
	Whether or not to loop the animation continually.
	<br> Default is false.
	@property {Boolean} looped
	*/

	looped: false,

	/**
	Whether or not the animation is oscillatory.
	<br> Default is false.
	@property {Boolean} oscillate
	*/

	oscillate: false,

	//
	//  Methods
	//___________//

	/**
	Initiates the animator with the given updater function.
	@constructor init
	@param {Function} updater
	*/

	init: function Animator_init(updater){
		//#ifdef DEBUG
		jayus.debug.match('Animator.init', updater, 'updater', jayus.TYPES.FUNCTION);
		//#endif
		this.update = updater;
	},

	/**
	Starts the animator.
	<br> Also fires the "started" event.
	@method {Self} start
	*/

	start: function Animator_start(){
		if(!this.running){
			// Save the start time
			this.startTime = Date.now();
			// Set as running and add to the animator list
			this.running = true;
			jayus.animators.push(this);
			this.fire('started');
			// Update for the first time
			// This was originally to solve the bug of sprites not being sized to their sprite, but the entire spritesheet
			// But seems to fit across all animations so was placed here
			this.update(0);
		}
		//#ifdef DEBUG
		else{
			console.warn('Animator.start() - Started when already running');
		}
		//#endif
		return this;
	},

	/**
	Stops the animator.
	<br> This method does not set the target[s] to its final state.
	<br> Also fires the "stopped" event.
	@method {Self} stop
	*/

	stop: function Animator_stop(){
		if(this.running){
			// Set the flag and fire the event
			this.running = false;
			jayus.animators.splice(jayus.animators.indexOf(this), 1);
			this.fire('stopped');
		}
		//#ifdef DEBUG
		else{
			console.warn('Animator.stop() - Stopped when not running');
		}
		//#endif
		return this;
	},

	/**
	Finishes the animation.
	<br> This method does set the target[s] to its final state
	<br> Also fires the "finished" event.
	@method {Self} finish
	*/

	finish: function Animator_finish(){
		if(this.running){
			// Stop and finish the animation
			this.running = false;
			jayus.animators.splice(jayus.animators.indexOf(this), 1);
			this.update(1);
			// Fire the event
			this.fire('finished');
		}
		//#ifdef DEBUG
		else{
			console.warn('Animator.finish() - Finished when not running');
		}
		//#endif
		return this;
	},

	/**
	Sets the duration(in milliseconds).
	@method {Self} setDuration
	@param {Number} duration
	*/

	setDuration: function Animator_setDuration(duration){
		//#ifdef DEBUG
		jayus.debug.match('Animator.setDuration', duration, 'duration', jayus.TYPES.NUMBER);
		//#endif
		this.duration = duration;
		return this;
	},

	/**
	Sets the easing function
	<br> The easing names correspond to the functions in jayus.easing.
	<br> A custom easing function may also be given.
	@method {Self} setEasing
	@paramset 1
	@param {String} easing
	@paramset 2
	@param {Function} easing
	*/

	setEasing: function Animator_setEasing(easing){
		if(typeof easing === 'string'){
			//#ifdef DEBUG
			jayus.debug.match('Animator.setEasing', easing, 'easing', jayus.TYPES.STRING);
			//#endif
			easing = jayus.easing[easing];
		}
		//#ifdef DEBUG
		else{
			jayus.debug.match('Animator.setEasing', easing, 'easing', jayus.TYPES.FUNCTION);
		}
		//#endif
		this.easing = easing;
		return this;
	},

	/**
	Updates the animation to the specified epoch time(in milliseconds).
	<br> Finishes the animation if the elapsed time has exceeded the duration.
	<br> Called by jayus.step().
	@method {Self} tick
	@param {Number} time
	*/

	tick: function Animator_tick(time){
		// Check if the time is past the duration
		if(time-this.startTime < this.duration){
			// Update the position using the easing function
			var pos = this.easing((time-this.startTime)/this.duration);
			if(pos < 0){
				pos = 0;
			}
			if(this.oscillate){
				if(pos <= 0.5){
					pos *= 2;
				}
				else{
					pos = (pos-0.5)*2;
					pos = 1-pos;
				}
			}
			this.update(pos);
		}
		else if(this.looped){
			// Reset the start time
			this.startTime = Date.now();
		}
		else{
			// Animation has finished
			this.finish();
		}
	},

	/**
	Updates the animation to the specified position.
	<br> Does not check if the animation is running or finished.
	<br> The position argument represents the position of the animation's effect from start to finish, from 0 to 1.
	<br> Such that updating the position to 0 will remove the animation's effect and updating the position to 1 will set the target[s] to the animation's final state.
	<br> Must be implemented by a subclass.
	@method {Self} update
	@param {Number} pos
	*///@ Abstract Function

		//
		//  Flags
		//_________//

	/**
	Sets the looped flag.
	@method {Self} setLooped
	@param {Boolean} on
	*/

	setLooped: function Animator_setLooped(on){
		//#ifdef DEBUG
		jayus.debug.match('Animator.setLooped', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		this.looped = on;
		return this;
	},

	/**
	Sets the oscillate flag.
	@method {Self} setOscillate
	@param {Boolean} on
	*/

	setOscillate: function Animator_setOscillate(on){
		//#ifdef DEBUG
		jayus.debug.match('Animator.setOscillate', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		this.oscillate = on;
		return this;
	}

});

//
//  jayus.Animatable()
//______________________//

/**
An abstract class for objects that can be animated.
@class jayus.Animatable
*/

//#ifdef DEBUG
jayus.debug.className = 'Animatable';
//#endif

jayus.Animatable = jayus.createClass({

	/*
	The number of subsequent actions to animate.
	<br> Do not modify.
	@property {Number} actionsToAnimate
	*/

	actionsToAnimate: 0,

	/**
	Sets the next action performed on the entity to be animated.
	<br> Only applies to animatable methods.
	<br> When a function is set to be animated, instead of performing the action the method will return an animator that will perform that action when started.
	@method {Self} animate
	*/

	animate: function Animatable_animate(){
		this.actionsToAnimate++;
		return this;
	}

});

//
//  jayus.MethodAnimator()
//__________________________//

/**
An animator that continually calls a method on an object with numeric properties.
@class jayus.MethodAnimator
@extends jayus.Animator
*/

//#ifdef DEBUG
jayus.debug.className = 'MethodAnimator';
//#endif

jayus.MethodAnimator = jayus.Animator.extend({

	//
	//  Properties
	//______________//

	/**
	The entity to animate.
	@property {Object} target
	*/

	target: null,

	/**
	The method to animate.
	@property {Function} method
	*/

	method: null,

	/**
	The initial value[s] of the arguments.
	@property {Number|Array<Number>} initialValue
	*/

	initialValue: null,

	/**
	The final value[s] of the arguments.
	@property {Number|Array<Number>} finalValue
	*/

	finalValue: null,

	multipleParameters: false,

	values: null,

	/**
	Initiates the animator.
	<br> Can be invoked with either a single or array of values to serve as parameters to the function.
	@constructor init
	@param {Object} target
	@param {String} property
	@param {Number|Array<Number>} initialValue
	@param {Number|Array<Number>} finalValue
	*/

	init: function MethodAnimator_init(target, method, initialValue, finalValue){
		//#ifdef DEBUG
		jayus.debug.matchArguments('MethodAnimator.init', arguments,
			'target', jayus.TYPES.OBJECT,
			'method', jayus.TYPES.FUNCTION,
			'initialValue', jayus.TYPES.DEFINED,
			'finalValue', jayus.TYPES.DEFINED
		);
		//#endif
		// Set the properties
		this.target = target;
		this.method = method;
		this.initialValue = initialValue;
		this.finalValue = finalValue;
		if(initialValue instanceof Array){
			this.multipleParameters = true;
			this.values = [];
		}
	},

	//@ From Animator
	update: function MethodAnimator_update(pos){
		if(this.multipleParameters){
			// Update the values
			for(var i=0;i<this.initialValue.length;i++){
				this.values[i] = this.initialValue[i] + pos*(this.finalValue[i]-this.initialValue[i]);
			}
			// Call the method with the values
			this.method.apply(this.target, this.values);
		}
		else{
			// Call the method with the single value
			this.method.call(this.target, this.initialValue + pos*(this.finalValue-this.initialValue));
		}
	}

});


//
//  jayus.Animator.Discrete()
//_____________________________//

/**
A small extension to the Animator class that sends a discrete value(an integer) to a custom updater function.
<br> Takes a single target and the update function.
@class jayus.Animator.Discrete
@extends jayus.Animator
*/

//#ifdef DEBUG
jayus.debug.className = 'DiscreteAnimator';
//#endif

jayus.Animator.Discrete = jayus.Animator.extend({

	/*
	The number of discrete values to animate over.
	<br> Do not modify.
	@property {Number} count
	*/

	count: NaN,

	/*
	The discrete update method.
	<br> Do not modify.
	@property {Function} updater
	*/

	updater: null,

	/**
	Initiates the animator with the specified number of discrete values and updater function.
	<br> The integer values sent to the updater function range from 0 to count-1.
	@constructor init
	@param {Number} count
	@param {Function} updater
	*/

	init: function DiscreteAnimator_init(count, updater){
		//#ifdef DEBUG
		jayus.debug.matchArguments('DiscreteAnimator.init', arguments, 'count', jayus.TYPES.NUMBER, 'updater', jayus.TYPES.FUNCTION);
		//#endif
		this.count = count;
		this.updater = updater;
	},

	//@ From Animator
	update: function DiscreteAnimator_update(pos){
		pos = Math.floor(pos*this.count);
		if(pos === this.count){
			pos--;
		}
		this.updater(pos);
	}

});

//
//  jayus.Animator.Sequence()
//_____________________________//

// TODO: AnimatorSequence() -  Testing, examples
// TODO: AnimatorSequence() -  Get total duration from sum of child animators, take durations into account when updating

/**
Keeps a list of animators and can run them in sequence.
@class jayus.Animator.Sequence
@extends jayus.Animator
*/

//#ifdef DEBUG
jayus.debug.className = 'AnimatorSequence';
//#endif

jayus.Animator.Sequence = jayus.Animator.extend({

	//
	//  Properties
	//______________//

	/**
	A list of animators in the sequence.
	@property {jayus.List} animators
	*/

	animators: null,

	//
	//  Methods
	//___________//

	init: function AnimatorSequence_init(){
		this.animators = new jayus.List();
		//#ifdef DEBUG
		this.animators.typeId = jayus.TYPES.ANIMATOR;
		//#endif
	},

		//
		//  Operations
		//______________//

	//@ From Animator
	update: function AnimatorSequence_update(pos){
		var count = this.animators.items.length,
			index = Math.floor(pos*counts);
		if(index === counts){
			index--;
		}
		pos = pos*counts - index;
		this.animators.items[index].update(pos);
	}

});