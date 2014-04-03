/**
 * @preserve
 *
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

// Satisfy the ClosureCompiler

/** @type {Object} */
window.EquationParser=function(){var h={applyRule:function(a,c,f){var d,b,e,g;for(d=1;d<a.length;d++)if(g=a[d],g===c||g===f){b=a[d-1];e=a[d+1];if(43===g)b+=e;else if(45===g)b-=e;else if(42===g)b*=e;else if(47===g){if(0===e)throw"Division by zero";b/=e}else throw"Invalid argument";a.splice(d-1,3,b);d=-1}},parse:function(a){for(var c,f,d,b=[],e=0;-1!==a.indexOf("(")&&-1!==a.indexOf(")");)for(c=a.indexOf("(");c<a.length;c++)if(f=a.charCodeAt(c),40===f&&(e=c+1),40===f||41===f)40===d&&41===f&&(a=a.substr(0,e-
1)+h.parse(a.substr(e,c-e))+a.substr(c+1)),d=f;for(c=1;c<a.length;c++)if(f=a.charCodeAt(c),43===f||45===f||42===f||47===f)d=a.charCodeAt(c-1),43!==d&&45!==d&&42!==d&&47!==d&&(b.push(Number(a.substr(e,c-e)),f),e=c+1);if(0===b.length)return Number(a);0<e&&b.push(Number(a.substr(e)));h.applyRule(b,42,47);h.applyRule(b,43,45);return b.length?b[0]:0}};return h}();

/** @type {Object} */
var jayus;

/**
Defines the global jayus object.
@file jayus.js
*/

(function() {
'use strict';

//
//  jayus
//_________//

/*

TODO:

		Event propagation profiling
			In debug mode, can track and print the propagation of an event
			Mouse button not firing the leftPress event? Track it and check the path and stopping point

		Checkout stuff in the Render engine
			Giant sysInfo object, lots of data
			A global dependency management system?
				Could fire callbacks as needed
				Could even pinpoint slow/erroneous resources
			Particle system
			Physics?

		FIX SIZING:
			Sizing is a mess right now
			hasFlexibleWidth/Height is crap
			Some reforms come from size, some sizes come from reforms
			Theres a problem in only using 1 size property, requested vs actual
				User should set requested, not set actual
			We need requestedSize and actualSize
				Requested size could be a number(fixed size), a constraint(string), or even a policy(depends on parent)
				Actual size could be rounded to an integer for pixel alignment

		Finish fleshing out new Animators
			Fleshing out with FromTo, FromBy, and include the initFromObject/toObject methods

		Check for duplicate handlers
			In debug mode, when assigning a handler, diff it with existing ones, warn for very similar ones
			Something like assigning a handler twice is very easy to do(name mismatch) and very hard to debug

		What if jayus allowed Entities to hold the IDs of its dependencies rather than just references

			These ID's would resolve to the actual references to these IDs when needed, or throw an error
			This would allow for much more flexibility with declarative syntax, as we can declare something anywhere/anytime, and allow jayus to link it to objects where needed

			Such as JSON defining the UI Scene for a game, but all the brushes are just ID's:
				ui.json: {
					type: 'Scene',
					id: 'MainMenu',
					bg: 'UI_BgBrush'
				}
				themes/dark.json: {
					type: 'Brush',
					id: 'UI_BgBrush',
					fill: '#232323'
				}

			When to resolve dependencies?

				When property is set, try to resolve
				If not resolved, tell jayus to try again whenever a new item is added
				If property is accessed, just let it throw a type error?

			+ VERY powerful feature, allows for easy fragmentation and modularity of EVERY component
			- Requires we keep a listing of identified objects in jayus
			- Requires much more code to resolve these references from ID's
			- Can lead to dependency hell if not careful

		Make debug panel better
			Resizable
			Scrolling
			More graphs
			Give some idea of what is being dirtied
			Give tally of inits within each routine

		Allow custom transformation matrices

		Finsh Polygon
			Finish "LinkedPolygon" which uses an array of Point objects.

		Finish Path

		Fix misleading terminology of a Group being outside and inside of the scene, fix it on the site too
			Mainly found in the scene structure contracts article
			Group is referred to as having children that it renders, the Group class doesn't do that
			Change to Layer or something, though some Layer derived classes dont function like Layers so idk
			Maybe:
				Group » Collection or EntitySet				Set of entities
				Layer » Group & Layer						Group is base class for any group, Layer adds the Layer-specific methods

		Clipping paths
			What to place them on?

		Fix parent-child-container archetypes, mainly dealing with displacement and such.
			Infinite loops can be hard to avoid.
			Propagation of updates cannot just go one way
			Could we wait to reform the scene until the next frame?
			I believe I mostly have them solved, through the use of the frozen counter and dirty/displace
			Might move to dirty/move/displace
			Add in childDirtied()/childDisplaced()/childMoved()/childResized() functions on parents?
				parentResized()?

		Finalize a decision on where the isClass flags are needed
			Keep only in debug mode?

Future TODO:

		Cursor Tracking
			Clear the trackCursor flag as cursor events are removed
			Not terribly important, devs wont often add/remove cursor event too frequently

		Tweening
			Constructs a set of Animators to tween an entity from its current state to the target state
			Requires:
				Initial state
				Final state
				Duration
			Would return the set of animators

		Remove all possible interfaces to the browser
			Such as doing anything with the DOM tree or document
			Keeps it more simpler and modular, can be used with other libraries or outside of usual environment

		Use more enumerations:
			For component types, not done.
			For events, not done, will require much work.

		Touch Events - Fired on intersecting responders/entitys

			dragStart												Native in iOS, else must be custom implemented
			dragMove													Native in iOS, else must be custom implemented
			dragEnd													Native in iOS, else must be custom implemented

			dragPinch												Native in iOS, possibly Android?
			dragRotate												Native in iOS, possibly Android?

		Collision Events - Fired on the responding entity

			collision					When the entity collides with this one
			separation					When the entity no longer collides with this one
			distanceChanged				When the entity distance from this one changed

		Prevent key events on unreliable keys
			Many keys(such as the function keys) cannot have their default actions prevented
			Some keys may remain in a sticky state and are thus unreliable, keydown is fired but not keyup
				jayus shouldn't fire these key events

		Canvas spec additions:
			context.ellipse()
			Not yet implemented in most browsers:
				new DrawingStyle()
				new Path()
				TextMetrics
				drawSystemFocusRing()
				drawCustomFocusRing()
				scrollPathIntoView()
				Hit Regions

		Batching / State sorting?
			Basically comes down to:
				Dont re-apply same styling
				Dont re-apply same transforms
			Or something similar:
				Style tracking:
					Keep track of the previously applied Style
					Do not re-apply the new Style if it is the same as the old
					Does not work at topmost level of context stack
						Context is restored to default styling
						Could this be fixed with a preliminary push()?
				Style hierarchy:
					Could perform more grouping under styler nodes
					Styler node is responsible for setting styling, children then just draw themselves
					Map for images rather than Grid
					Could allow multiple shapes in a PaintedShape
			I think the best approach to this is to allow the user to easily specify the batches
				Such as a ShapeGroup class which can use the same style for many shapes
			The biggest benefit here is removing modifications to the expensive font property

Dilemmas:

		Prepend properties with underscores?
			+ Can reuse some property names as method names
			- Must use lots more underscores
			± Some properties should be public

		Remove the frame side getters/setters?
			Can be done with setPosAt() and getPosAt(), its just not as pretty

		Make the geometrics immutable?
			Doesn't make sense to set entities as immutable, they must stay in place under the parents.
			Keep two classes of geometrics? Shapes and EntityShapes?
			DECISION:
				Shapes such as Rectangle, Polygon, Path are just shapes
				The PaintedShape class is a wrapper to make a Shape an Entity

		With a range/not found error on collections, should we throw an error or do nothing?
				Throw an error:
					Might catch problems not otherwise found by the client
				Do nothing:
					Allows the client to leave off some checks, smaller and faster code
			Currently varied across classes

Notes:

		Comment tags:

			FIXME			Indicates that a specific functionality is broken, though expected to be working
			TODO			Indicates that some functionality is not yet implemented
			COMP			A semantic conundrum at this spot, a few options are available and a final decision has not been made
			???				This code/functionality has poor or nonexistant comments/documentation
			BROKEN			Denotes broken code, found in comments/documentation

		Notes on Interoperability:

			Use the event system, its there for convenience

			Do not base animation on framerate
				Animation is to be based off of the amount of time elapsed since the previous frame
					So as to catch-up to the current frame
				The framerate can be volatile, leading to volatile animations
				The framerate timing is ONLY for rendering frames

			Do not modify geometry in rendering functions

		Declarative Syntax:

			Allow declarative syntax WHEREVER POSSIBLE
			Declarative syntax is beautiful and can be much less buggy due to time-independence

		Personal Reminders:

			Inline function calls for speed
			Memoization of globals and deep members for speed, especially in loops
			The "tell" paradigm is much more elegant than "ask-then-act" when traversing a tree,
				but "ask then act" can be much faster due to inlining any conditionals

Styling & Transforms:

			Name				Type			Manner of Application To Context

		Entity - Applied to children through parentMatrix

			alpha				Number			Multiply

			xScale				Number			Multiply
			yScale				Number			Multiply

			rotation			Number			Add

		Style - By default not left on context

			fill				Color			Overwrite
			stroke				Color			Overwrite

			strokeFirst			Boolean			None

			lineWidth			Number			Overwrite
			lineCap				String			Overwrite
			lineJoin			String			Overwrite
			miterLimit			Number			Overwrite

			shadow				Color			Overwrite
			shadowX				Number			Overwrite
			shadowY				Number			Overwrite
			shadowBlur			Number			Overwrite

Debugging:

		Styling on one geometric is applied to another:
			Check that the styling object on each is not the same object.
			Check that the context is being restored between renderings.
			Check that the etch methods reset the current path with beginPath().

		Editing an entity is not reflected on the screen:
			If you edit an entity's properties manually, it will not be marked as dirty.
				This is especially true for a widget, where it needs to reform itself whenever certain properties are modified.

		Text is drawn very thick and pixelated:
			Ensure you arent creating multiple overlapping textual entities on top of one another.
			Also if you are manually drawing the text that you arent drawing it more than once.

Credits:

		cakejs
			Idea from Klass object
			General insight

		LimeJS, ImpactJS
			General insight

		jQuery Easing Plugin
			Easing functions

		http://www.quirksmode.org/
			Was a great help with compatibility

		irc.freenode.com
			Was a significant source of help

		jslint.com
		http://code.google.com/p/jgrousedoc/
		http://code.google.com/closure/compiler/
			For creating great JavaScript tools

		http://paulirish.com/2011/requestanimationframe-for-smart-animating/
			requestAnimationFrame polyfill

*/

/**
Jayus, the awesome scenegraph.
@project Jayus API documentation
@author symaxian
@version alpha
@description A nimble, elegant HTML5 canvas scenegraph.
*/

/**
The global jayus object.
@namespace jayus
*/

window.jayus = {

	//
	//  Properties
	//______________//

	/**
	Whether jayus is runnning or not.
	<br> Do not modify, use jayus.start() and jayus.stop().
	@property {Boolean} running
	*/

	running: false,

	/*
	Whether an upcoming call to jayus.frame() is expected.
	<br> Used to solve a race condition, where jayus is stopped then started again before the next invocation can stop itself.
	<br> Do not modify.
	@property {Boolean} frameIntervalRunning
	*/

	//@ Internal
	frameIntervalRunning: false,

	/**
	The time(in epoch time) when the previous frame was drawn, used in calculating frames per second.
	@property {Number} lastFrameTime
	*/

	lastFrameTime: 0,

	/**
	The time(in epoch time) when jayus was previously stepped(updated).
	@property {Number} lastStepTime
	*/

	lastStepTime: 0,

	/*
	The display refresh interval if used.
	<br> Do not modify.
	<br> The browsers requestAnimationFrame method will be used if possible, and this will remain null.
	@property {Number} frameInterval
	*/

	//@ Internal
	frameInterval: null,

	/*
	The cursor and animation refresh interval.
	<br> Do not modify.
	@property {Number} stepInterval
	*/

	//@ Internal
	stepInterval: null,

	/**
	Whether to use the requestAnimationFrame function if available.
	<br> If set to false or the requestAnimationFrame function is not available then then jayus will attempt to maintain the framerate found in jayus.framerate.
	@property {Boolean} useReqAnimFrame
	*/

	useReqAnimFrame: true,

	/**
	The desired framerate.
	<br> This framerate is only used if the browsers requestAnimationFrame() function is unavailable.
	<br> After changing this property jayus must be restarted if it is running.
	<br> Default is 60
	@property {Number} framerate
	*/

	framerate: 60,

	/**
	The desired animation steps per second.
	<br> After changing this property jayus must be restarted if it is running.
	<br> Default is 60
	@property {Number} steprate
	*/

	steprate: 60,

	/**
	An array of the jayus displays on the page.
	@property {Array<Display>} displays
	*/

	displays: [],

	/**
	Whether or not a jayus Display is the focused page element.
	@property {Boolean} hasFocus
	*/

	hasFocus: false,

	/**
	The focused display, or null.
	@property {Display} focusedDisplay
	*/

	focusedDisplay: null,

	/**
	The Entity that has cursor focus.
	@property {Entity} cursorFocus
	*/

	cursorFocus: null,

	/**
	An array of running animators.
	<br> Only animators in this array will be ticked(updated) by jayus.
	<br> Each animator adds itself to this array when started and is removed when finished.
	<br> Do not modify.
	@property {Array} jayus.animators
	*/

	animators: [],

	//@ Internal
	frameEventData: {},

		//
		//  Fonts
		//_________//

	/**
	Font cache storage.
	<br> Holds the character widths for each cached font.
	<br> Do not modify.
	@property {Object} fontCache
	*/

	fontCache: {},

	/**
	The upper bound for the codepoints of characters that will be cached when caching a font.
	<br> The characters cached are those with a codepoint between fontCacheMinChar and this property.
	<br> Default is 255.
	@property {Number} fontCacheMaxChar
	*/

	fontCacheMaxChar: 255,

	//
	//  Methods
	//___________//

		//
		//  Initialization
		//__________________//

	/**
	Returns a shallow copy of the given object.
	@method {Object} copyObject
	@param {Object} src
	*/

	copyObject: function jayus_copyObject(src) {
		//#ifdef DEBUG
		this.debug.match('jayus.copyObject', src, 'src', jayus.TYPES.OBJECT);
		//#end
		// Apply the source to a new object
		return this.applyObject(src, {});
	},

	/**
	Applies the properties of the source object to the destination object.
	<br> Returns the destination object.
	@method {Object} applyObject
	@param {Object} src
	@param {Object} dest
	*/

	applyObject: function jayus_applyObject(src, dest) {
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.applyObject', arguments, 'src', jayus.TYPES.OBJECT, 'dest', jayus.TYPES.OBJECT);
		//#end
		// Copy all the properties onto the destination
		for(var item in src) {
			if(src.hasOwnProperty(item)) {
				dest[item] = src[item];
			}
		}
		return dest;
	},

	/**
	Creates a constructor function, which in JavaScript is essentially a class.
	<br> The returned constructor function calls the init method with any arguments passed to it.
	<br> Any number of superclasses may be sent, the new constructor function will have inherited from all of them, in order.
	@method {Function} createClass
	@param {Object} props
	*/

	createClass: function jayus_createClass(props) {
		// Create a placeholder init method if none exists
		if(typeof props.init !== 'function') {
			props.init = function() {};
		}
		var constructor = props.init;
		constructor.prototype = props;
		// Add a helper init function for subclasses
		constructor.init = function HelperInit(object, args) {
			constructor.prototype.init.apply(object,args);
		};
		// Add the extend and fromObject methods to the constructor
		constructor.extend = window.jayus.extendMethod;
		constructor.fromObject = window.jayus.fromObjectMethod;
		// Return the constructor function
		return constructor;
	},

	//@ Internal
	extendMethod: function jayus_extendMethod(props) {
		// Get the constructor funfction, either the subclass init method, the superclass init method, or a placeholder function
		var constructor;
		if(typeof props.init === 'function') {
			constructor = props.init;
		}
		else if(typeof this.prototype.init === 'function') {
			constructor = function() {
				this.init.apply(this, arguments);
			};
		}
		else {
			constructor = function() {};
		}
		constructor.prototype = Object.create(this.prototype);
		jayus.applyObject(props, constructor.prototype);
		// Create a helper init function for subclasses
		constructor.init = function HelperInit(object, args) {
			constructor.prototype.init.apply(object,args);
		};
		// Add the extend and fromObject methods to the constructor
		constructor.extend = window.jayus.extendMethod;
		constructor.fromObject = window.jayus.fromObjectMethod;
		// Return the constructor function
		return constructor;
	},

	//@ Internal
	fromObjectMethod: function Constructor_fromObject(obj) {
		var entity = new this();
		entity.initFromObject(obj);
		return entity;
	},

	/**
	Returns the scenegraph described by the given object.
	@method {Entity} parse
	@param {Object} obj
	*/

	parse: function jayus_parse(obj) {
		// Return if already a Dependency
		// TODO: Can we find a better method?
		if(typeof obj.frozen === 'number') {
			return obj;
		}
		var type = obj.type;
		if(typeof jayus[type] !== 'function') {
			throw new Error('jayus.parse() - Unknown class '+type+', check the type property');
		}
		var ret = new jayus[type]();
		ret.initFromObject(obj);
		return ret;
	},

	//@ Internal
	groupToObject: function Group_toObject(object) {
		// Group property propagateCursor
		if(this.propagateCursor !== jayus.Group.propagateCursor) {
			object.propagateCursor = this.propagateCursor;
		}
		// Children
		if(this.children !== jayus.Group.children) {
			object.children = [];
			for(var i=0;i<this.items.length;i++) {
				object.children.push(this.items[i].toObject());
			}
		}
	},

	//@ Internal
	groupInitFromObject: function Group_initFromObject(object) {
		// Apply our own properties
		if(typeof object.propagateCursor === 'boolean') {
			this.propagateCursor = object.propagateCursor;
		}
		// Children
		if(typeof object.children === 'object') {
			this.children = new jayus.List(this);
			this.items = this.children.items;

			this.freeze();
			for(var i=0;i<object.children.length;i++) {
				var child = object.children[i];
				// FIXME: Why must we set this here before we parse?!
				// FIXME: Another test shows that setting the parent property here breaks it
				// child.parent = this;
				this.children.add(jayus.parse(child));
				// this.items.push(jayus.parse(child));
			}
			this.unfreeze();

			// for(var i=0;i<object.children.length;i++) {
			// 	object.children[i] = jayus.parse(object.children[i]);
			// }
			// this.children.append(object.children);
		}
	},

	executeFormula: function jayus_executeFormula(object, eq) {
		if(eq.indexOf('parent') >= 0) {
			if(object.parent === null) {
				console.error('jayus.executeFormula() - Parent property in formula, entity has no parent, returning 0', object, eq);
				return 0;
			}
			eq = eq.
				replace(/parent.x/g, object.parent.x).
				replace(/parent.y/g, object.parent.y).
				replace(/parent.width/g, object.parent.width).
				replace(/parent.height/g, object.parent.height);
		}
		if(eq.indexOf('domain') >= 0) {
			if(object.parent === null) {
				console.error('jayus.executeFormula() - Domain property in formula, entity has no parent, returning 0', object, eq);
				return 0;
			}
			eq = eq.
				replace(/domain.width/g, object.domainWidth).
				replace(/domain.height/g, object.domainHeight);
		}
		var answer = window.EquationParser.parse(
			eq.
				replace(/x/g, object.x).
				replace(/y/g, object.y).
				replace(/width/g, object.width).
				replace(/height/g, object.height)
		);
		if(typeof answer === 'string') {
			console.error('jayus.executeFormula() - Unknown error: "'+answer+'", returning 0');
			return 0;
		}
		return answer;
	},

	/**
	Determines whether children will be mapped onto their parent object as properties, using their ID as the key.
	<br> The child must have an ID and it may not collide with any pre-existing property, else an error will be displayed if using the 'debug' version of jayus.
	<br> One way ensure there are never any collisions with built-in properties is to capitalize all of your entity ID's.
	<br> Default is true.
	@property {Boolean} declareChildrenAsProperties
	*/

	declareChildrenAsProperties: true,

	/**
	Determines whether identified entities will be stored in jayus.identifiedObjects or not.
	<br> Default is false.
	@property {Boolean} keepTrackOfObjects
	*/

	keepTrackOfObjects: false,

	/**
	An array of identified objects.
	@property {Array} identifiedObjects
	*/

	identifiedObjects: [],

	/**
	Returns the object with the specified id, or null.
	<br> Only works if jayus.keepTrackOfObjects is true.
	@method {Object} getObject
	@param {String|Number} id
	*/

	getObject: function jayus_getObject(id) {
		for(var i=0;i<this.identifiedObjects.length;i++) {
			var object = this.identifiedObjects[i];
			if(object.id === id) {
				return object;
			}
		}
		return null;
	},

	/**
	Returns the object with the specified id, or throws an error if not found.
	<br> Only works if jayus.keepTrackOfObjects is true.
	@method {Object} mustGetObject
	@param {String|Number} id
	*/

	mustGetObject: function jayus_mustGetObject(id) {
		var object = this.getObject(id);
		if(object === null) {
			throw new Error('jayus.mustGetObject() - Object with id "'+id+'" not found');
		}
		return object;
	},

	/**
	Returns an object holding the parameters extracted from the current URL.
	@method {Object} getUrlParameters
	*/

	getUrlParameters: function jayus_getUrlParameters() {
		for(var i=0, vars = {}, param, paramArray = window.location.href.slice(window.location.href.indexOf('?')+1).split('&');i<paramArray.length;i++) {
			param = paramArray[i].split('=');
			vars[param[0]] = param[1];
		}
		return vars;
	},

	/**
	Initializes Jayus.
	<br> Note that this method does not start jayus, the display canvas will appear on the page but will be blank until jayus is started.
	<br> Jayus does not need to be running to accept input, input events should be tracked and fired from this point on.
	@method {Self} init
	*/

	init: function jayus_init() {
		// Check if canvas is supported
		var elem = document.createElement('canvas');
		if(!(typeof elem.getContext === 'function' && typeof elem.getContext('2d') === 'object')) {
			throw new Error('Fatal error, browser does not support the canvas element, unable to initiate Jayus');
		}
		// Apply the Responder class to jayus
		this.applyObject(this.Responder.prototype, this);
		this.addDefaultHandlers();
		// Run the browser detector and custom scripts
		this.ua = this.detectBrowser();
		this.ua.lineDash = typeof this.getContext().setLineDash === 'function';
		// Get the requestAnimationFrame
		window.requestAnimationFrame =	window.requestAnimationFrame ||
										window.webkitRequestAnimationFrame ||
										window.mozRequestAnimationFrame ||
										window.oRequestAnimationFrame ||
										window.msRequestAnimationFrame;
		this.ua.requestAnimationFrame = typeof window.requestAnimationFrame === 'function';
		// Initiate the keyboard module
		this.keyboard.init();
		// Construct the CSS color names array
		this.colors.cssNames = [];
		for(var i=0;i<this.colors.displayNames.length;i++) {
			this.colors.cssNames.push(this.colors.displayNames[i].replace(' ','').replace(' ','').toLowerCase());
		}
		// Set as initialized
		this.initialized = true;
	},

	/**
	Returns browser and OS info.
	<br> The returned object's properties(strings) are 'browser', 'version', and 'os'.
	<br> The value "unknown" is used if unable to detect a property.
	<br> Adapted from QuirkMode's detect browser script.
	@method {Object} detectBrowser
	*/

	detectBrowser: function jayus_detectBrowser() {
		var browserData = [
			{
				src: navigator.userAgent,
				str: "Chrome",
				id: "Chrome"
			},
			{	src: navigator.userAgent,
				str: "OmniWeb",
				ver: "OmniWeb/",
				id: "OmniWeb"
			},
			{
				src: navigator.vendor,
				str: "Apple",
				id: "Safari",
				ver: "Version"
			},
			{
				prop: window.opera,
				id: "Opera",
				ver: "Version"
			},
			{
				src: navigator.vendor,
				str: "iCab",
				id: "iCab"
			},
			{
				src: navigator.vendor,
				str: "KDE",
				id: "Konqueror"
			},
			{
				src: navigator.userAgent,
				str: "Firefox",
				id: "Firefox"
			},
			{
				src: navigator.vendor,
				str: "Camino",
				id: "Camino"
			},
			{		// for newer Netscapes (6+)
				src: navigator.userAgent,
				str: "Netscape",
				id: "Netscape"
			},
			{
				src: navigator.userAgent,
				str: "MSIE",
				id: "Explorer",
				ver: "MSIE"
			},
			{
				src: navigator.userAgent,
				str: "Gecko",
				id: "Mozilla",
				ver: "rv"
			},
			{		// for older Netscapes (4-)
				src: navigator.userAgent,
				str: "Mozilla",
				id: "Netscape",
				ver: "Mozilla"
			}
		];
		var osData = [
			{
				src: navigator.platform,
				str: "Win",
				id: "Windows"
			},
			{
				src: navigator.platform,
				str: "Mac",
				id: "Mac"
			},
			{
				src: navigator.userAgent,
				str: "iPhone",
				id: "iPhone/iPod"
			},
			{
				src: navigator.platform,
				str: "Linux",
				id: "Linux"
			}
		];
		var verString;
		var searchString = function(data) {
			for(var i=0;i<data.length;i++) {
				var dataString = data[i].src;
				verString = data[i].ver || data[i].id;
				if(dataString) {
					if(dataString.indexOf(data[i].str) !== -1) {
						return data[i].id;
					}
				}
				else if(data[i].prop) {
					return data[i].id;
				}
			}
		};
		var searchVersion = function(dataString) {
			var index = dataString.indexOf(verString);
			if(index !== -1) {
				return parseFloat(dataString.substring(index+verString.length+1));
			}
		};
		return {
			browser: searchString(browserData) || null,
			version: searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || null,
			OS: searchString(osData) || null
		};
	},

		//
		//  Runtime
		//___________//

	/*
	Feb 28, Have just diagnosed a very tricky and obscure race condition.
	Even though jayus is stopped, its restarted before the next step is executed and halted.
	So even though jayus.running was set to false, it was set back to true before the next step
	had a chance to see that it was false and stop the interval.

	running -> stop | start -> step -> step ...
				V
				step -> step -> step ...

	*/

	/**
	Starts jayus.
	@method start
	*/

	start: function jayus_start() {
		//#ifdef DEBUG
		if(!this.initialized) {
			console.error('jayus.start() - Jayus is not initialized');
			return;
		}
		//#end
		if(!this.running) {
			// Set the running flag
			this.running = true;
			// Setup an interval if we cant use the requestAnimationFrame function
			if(!this.useReqAnimFrame || !this.ua.requestAnimationFrame) {
				this.frameInterval = setInterval(jayus.frame, 1000/this.framerate);
			}
			// Execute the first step, but only if another execution of the interval is still pending
			else if(!this.frameIntervalRunning) {
				this.lastFrameTime = Date.now();
				this.lastStepTime = Date.now();
				this.frameIntervalRunning = true;
				this.frame();
			}
			// Setup the step interval
			this.stepInterval = setInterval(jayus.step, 1000/this.steprate);
		}
		//#ifdef DEBUG
		else {
			console.warn('jayus.start() - Jayus is already running');
		}
		//#end
	},

	/**
	Stops jayus.
	<br> Input events are still received and handled.
	@method stop
	*/

	stop: function jayus_stop() {
		if(this.running) {
			// Clear the running flag and the interval
			this.running = false;
			clearInterval(this.frameInterval);
			clearInterval(this.stepInterval);
			this.frameInterval = null;
			this.stepInterval = null;
		}
		//#ifdef DEBUG
		else {
			console.warn('jayus.stop() - Called when not running');
		}
		//#end
	},

	/**
	Updates any animations.
	<br> Procedure:
	<br> - Fire the step event
	<br> - Process any pending cursor events
	<br> - Tick the running animators
	@method step
	*/

	step: function jayus_step() {
		if(jayus.running) {
			//#ifdef DEBUG
			jayus.chart.begin('Frame');
			//#end
			// Get some timing info and update the fps
			var i, item,
				now = Date.now(),
				elapsedMilliSecs = now-jayus.lastStepTime,
				elapsedSecs = elapsedMilliSecs/1000;
			jayus.lastStepTime = now;
			// Fire the event
			if(!jayus.isHandler.step || !jayus.fire('step', elapsedSecs)) {

				//#ifdef DEBUG
				jayus.chart.begin('Cursor');
				//#end
				for(i=0;i<jayus.displays.length;i++) {
					item = jayus.displays[i];
					if(item.hasPendingMousemoveEvent) {
						item.processPendingMousemove();
						item.hasPendingMousemoveEvent = false;
					}
				}
				//#ifdef DEBUG
				jayus.chart.end();
				//#end

				//#ifdef DEBUG
				jayus.chart.begin('Animation');
				//#end
				// Update the animators
				for(i=0;i<jayus.animators.length;i++) {
					jayus.animators[i].tick(now, elapsedSecs);
				}
				//#ifdef DEBUG
				jayus.chart.end();
				//#end

				// Step Box2D
				if(jayus.box2d.enabled) {
					jayus.box2d.step(elapsedSecs);
				}

				//#ifdef DEBUG
				jayus.chart.update();
				//#end

			}
			//#ifdef DEBUG
			jayus.chart.end();
			//#end
		}
	},

	/**
	Refreshes the displays.
	<br> Procedure:
	<br> - Fire the frame event
	<br> - Update the fps
	<br> - Refresh the displays
	@method frame
	*/

	frame: function jayus_frame() {
		if(jayus.running) {
			//#ifdef DEBUG
			jayus.chart.begin('Frame');
			//#end
			// If using reqAnimFrame, request the next frame
			if(jayus.useReqAnimFrame && jayus.ua.requestAnimationFrame) {
				window.requestAnimationFrame(jayus.frame);
			}
			// Get some timing info and update the fps
			var i, item,
				now = Date.now(),
				elapsedMilliSecs = now-jayus.lastFrameTime;
			jayus.fps = 1000/elapsedMilliSecs;
			jayus.lastFrameTime = now;
			// Fire the event
			if(!jayus.isHandler.frame || !jayus.fire('frame', elapsedMilliSecs/1000)) {

				// Refresh the displays
				//#ifdef DEBUG
				jayus.chart.begin('Render');
				//#end
				for(i=0;i<jayus.displays.length;i++) {
					//#ifdef DEBUG
					jayus.chart.begin('Display: '+i);
					//#end
					item = jayus.displays[i];
					if(item.dirtied) {
						item.refreshBuffer();
					}
					//#ifdef DEBUG
					jayus.chart.end();
					//#end
				}
				//#ifdef DEBUG
				// Draw Box2D debugging
				if(jayus.box2d.enabled) {
					jayus.chart.begin('Box2D Debug');
					jayus.box2d.drawDebug();
					jayus.chart.end();
				}
				jayus.chart.end();
				//#end

				//#ifdef DEBUG
				jayus.chart.update();
				//#end

			}
			//#ifdef DEBUG
			jayus.chart.end();
			//#end
		}
		else {
			jayus.frameIntervalRunning = false;
		}
	},

	// TODO: Find better method? Document?
	addDefaultHandlers: function jayus_addDefaultHandlers() {
		jayus.isHandler = {
			step: false,
			frame: false
		};
		//#ifdef DEBUG
		jayus.addHandler('keyPress', function(e) {
			if(e.key === 'grave' && e.event.ctrlKey) {
				if(jayus.chart.visible) {
					jayus.chart.hide();
				}
				else {
					jayus.chart.show();
				}
				return true;
			}
		});
		//#end
	},

	// Draw each pixel individually, needed to counteract the antialiasing on canvas when scaled
	manuallyDrawImage: function jayus_manuallyDrawImage(source, destination, width, height) {
		// Check for the imageSmoothing property
		if(typeof destination.imageSmoothingEnabled === 'boolean') {
			// Disable smoothing and draw normally
			var prev = destination.imageSmoothingEnabled;
			destination.imageSmoothingEnabled = false;
			destination.drawImage(source.canvas, 0, 0);
			destination.imageSmoothingEnabled = prev;
		}
		else {
			// Grab the pixel data
			var data = source.getImageData(0, 0, width, height).data,
				x, y, pos;
			// Loop over every pixel in the source context
			for(y=height-1;y>=0;y--) {
				for(x=width-1;x>=0;x--) {
					// Set the pixel color
					pos = 4*(x+width*y);
					destination.fillStyle = 'rgba('+data[pos]+','+data[pos+1]+','+data[pos+2]+','+data[pos+3]/255+')';
					// Draw the pixel
					destination.fillRect(x, y, 1, 1);
				}
			}
		}
	},

	//#ifdef DEBUG

	//
	//  Debug Panel
	//_______________//

	chart: {

		markColor: 'grey',
		markFont: '10px sans-serif',

		display: null,

		graphSurface: null,

		topMS: 40,

		index: 0,

		width: 400,

		height: 380,

		visible: false,

		initialized: false,

		windowSize: 120,

		windowIndex: 0,

		rootRoutine: null,

		currentRoutine: null,

		timeLabelColumnWidth: 30,

		TIME_LABEL_COLUMN_WIDTH_PADDING: 8,
		//#replace jayus.chart.TIME_LABEL_COLUMN_WIDTH_PADDING 8

		TOP_STACK_HEIGHT: 20,
		//#replace jayus.chart.TOP_STACK_HEIGHT 20

		CHILD_ROW_SPACING: 8,
		//#replace jayus.chart.CHILD_ROW_SPACING 8

		LATENCY_DISPLAY_THRESHOLD: 0.5,
		//#replace jayus.chart.LATENCY_DISPLAY_THRESHOLD 0.5

		MAX_ROUTINE_DEPTH: 8,

		// Specific colors for built-in routines
		defaultRoutineColors: {
			'Total Latency': 'grey',
			'Render': 'saddlebrown',
			'Box2d': 'blue',
			'Cursor': 'Chartreuse',
			'Animation': 'orange',
			'DebugPanel': 'yellow'
		},

		init: function jayus_chart_init() {

			this.display = jayus.parse({
				type: 'Display',
				id: 'DebugPanelDisplay',
				width: this.width,
				height: this.height,
				children: [
					{
						id: 'vBox',
						type: 'vBox',
						constraints: {
							width: 'parent.width',
							height: 'parent.height'
						},
						children: [
							{
								id: 'TopRow',
								type: 'Scene',
								constraints: {
									width: 'parent.width'
								},
								height: 30,
								heightPolicy: {
									type: 'SizePolicy',
									size: 30,
									expand: false,
									flexible: false
								},
								bg: {
									fill: {
										type: 'LinearGradient',
										start: {
											x: 0,
											y: 0
										},
										end: {
											x: 0,
											y: 30
										},
										stopPositions: [0, 1],
										stopColors: ['#DDD', '#CCC']
									}
								},
								children: [
									{
										type: 'Text',
										id: 'fpsLabel',
										font: '12px sans-serif',
										x: 0,
										y: 4,
										brush: {
											fill: '#111'
										}
									}
								]
							},
							{
								id: 'Graph',
								type: 'Scene',
								// optimizedBuffering: false,		// FIXME: Optimized buffering breaks it
								children: [
									{
										id: 'graphSurface',
										type: 'Surface',
										constraints: {
											width: 'parent.width',
											height: 'parent.height'
										}
									},
									{
										id: 'line16ms',
										type: 'PaintedShape',
										brush: {
											stroke: 'dimgrey'
										},
										shape: new jayus.Polygon.Line(0,0,0,0)
									},
									{
										id: 'line33ms',
										type: 'PaintedShape',
										brush: {
											stroke: 'dimgrey'
										},
										shape: new jayus.Polygon.Line(0,0,0,0)
									},
									{
										id: 'text16ms',
										type: 'Text',
										font: '10px sans-serif',
										brush: {
											fill: 'dimgrey'
										}
									},
									{
										id: 'text33ms',
										type: 'Text',
										font: '10px sans-serif',
										brush: {
											fill: 'dimgrey'
										}
									}
								]
							},
							{
								type: 'FlexibleFrame',
								id: 'RoutineBoxFrame',
								marginLeft: 2,
								marginRight: 2,
								marginTop: 8,
								marginBottom: 8,
								constraints: {
									width: 'parent.width'
								},
								bg: {
									fill: 'white'
								},
								child: {
									id: 'RoutineBox',
									type: 'vStack',
									constraints: {
										width: 'parent.width'
									},
									spacing: 8
								}
							}
						]
					}
				]
			});

			jayus.displays.splice(jayus.displays.indexOf(this.display), 1);

			this.vBox = this.display.children.find('vBox');
			this.topRow = this.display.children.find('TopRow');
			this.graph = this.display.children.find('Graph');
			this.routineBox = this.display.children.find('RoutineBox');
			this.graphSurface = this.display.children.find('graphSurface');

			this.fpsLabel = this.topRow.children.find('fpsLabel');
			this.fpsLabel.ignoreDirty++;

			setInterval(function() {
				var label = jayus.chart.fpsLabel;
				var fps = (Math.round(jayus.fps*10)/10)+'';
				if(fps.length === 2) {
					fps += '.0';
				}
				label.setText('Framerate: '+fps);
				label.setX(label.parent.width-4-label.width);
			}, 100);

			var line16ms = this.display.children.find('line16ms'),
				line33ms = this.display.children.find('line33ms'),
				text16ms = this.display.children.find('text16ms'),
				text33ms = this.display.children.find('text33ms'),
				updateLabel = function GraphLabelUpdater(ms, line, text) {
					var y = jayus.chart.graph.height-(ms/jayus.chart.topMS)*jayus.chart.graph.height;
					line.shape.setPoint(0, 0, Math.floor(y)+0.5);
					line.shape.setPoint(1, jayus.chart.graph.width, Math.floor(y)+0.5);
					text.setText(ms+' ms');
					text.setOrigin(4, y-12);
				};

			// We can always ignore dirty events on the label lines and text
			line16ms.ignoreDirty++;
			line33ms.ignoreDirty++;
			text16ms.ignoreDirty++;
			text33ms.ignoreDirty++;

			this.graph.addHandler('dirty', function(dirty) {
				if(dirty & jayus.DIRTY.SIZE) {
					// Update labels for 60 and 30 fps
					updateLabel(16, line16ms, text16ms);
					updateLabel(33, line33ms, text33ms);
				}
				if(jayus.chart.rootRoutine !== null) {
					jayus.chart.rootRoutine.setFrameCount(jayus.chart.graphSurface.width);
				}
			});

			this.graph.dirty(jayus.DIRTY.SIZE);

			var div = document.createElement('div');

			var canvas = this.display.canvas;
			canvas.style.border = '#aaa 1px solid';
			canvas.style.backgroundColor = 'black';
			div.appendChild(canvas);

			$(div).dialog({
				title: 'Jayus Debug Panel',
				open: function() {
					$(this).data("width.dialog", $(canvas).width() + 60);
				},
				resize: function() {
					jayus.chart.display.setWidth($(jayus.chart.dialogContainer).width()-4);
					jayus.chart.display.setHeight($(jayus.chart.dialogContainer).height()-30);
					return false;
				},
				close: function() {
					jayus.chart.visible = false;
				}
			});

			jayus.chart.dialog = div.parentNode;

			jayus.chart.dialogContainer = jayus.chart.dialog.childNodes[1];

			this.initialized = true;

		},

		getRoutineColor: function jayus_chart_getRoutineColor(name) {
			if(typeof this.defaultRoutineColors[name] === 'string') {
				return this.defaultRoutineColors[name];
			}
			// TODO: jayus.chart.getRoutineColor() - Pick random new random colors
			return jayus.colors.cssNames[jayus.math.randomBetween(0, jayus.colors.count-1)];
		},

		begin: function jayus_chart_begin(name) {
			if(this.initialized) {

				var data;

				if(this.rootRoutine === null) {

					this.rootRoutine = this.createRoutineDataObject('Total Latency', null);
					this.currentRoutine = this.rootRoutine;

					// Add the routine row to the routine stack
					this.routineBox.children.add(this.rootRoutine.entity);
				}

				if(name === 'Frame') {
					data = this.rootRoutine;
				}
				else {

					data = this.currentRoutine.children[name];
					if(data === undefined) {

						data = this.createRoutineDataObject(name);

						// Add the routine row to the routine stack
						this.currentRoutine.childrenStack.children.add(data.entity);

						this.currentRoutine.children[name] = data;

					}

					this.currentRoutine = data;

				}

				data.startTime = Date.now();

			}
		},

		end: function jayus_chart_end() {

			var time, data;

			if(this.initialized) {

				data = this.currentRoutine;

				time = Date.now()-data.startTime;

				data.time += time;
				// data.latencyTotal -= data.latencies[this.index];
				data.latencies[this.index] = time;

				if(data !== this.rootRoutine) {
					this.currentRoutine = data.parent;
				}

			}

		},

		createRoutineDataObject: function jayus_chart_createRoutineDataObject(name, parent) {

			// Create a new data object for the routine
			var data = {
				name: name,
				latencies: [],
				inits: [],
				averageLatency: 0,
				initTotal: 0,
				color: this.getRoutineColor(name),
				parent: this.currentRoutine,
				children: {},
				sortedRoutineNames: [],
				depth: 0
			};

			if(this.currentRoutine !== null) {
				data.depth = this.currentRoutine.depth+1;
			}

			if(data.parent !== null) {
				data.parent.sortedRoutineNames.push(data.name);
			}

			// Fill the latencies and inits with 0
			for(var i=0;i<this.graphSurface.width;i++) {
				data.latencies.push(0);
				// data.inits.push(0);
			}

			var x;
			if(data.parent === null) {
				x = 0;
			}
			else {
				x = 20;
			}

			// Construct the entity that represents this routine in the debug panel
			data.entity = jayus.parse({
				type: 'Scene',
				x: x,
				parent: parent,
				constraints: {
					width: 'parent.width - x - 2'
				},
				heightPolicy: {
					type: 'SizePolicy',
					expand: true
				},
				bg: {
					fill: '#BBB',
					stroke: 'black',
					lineWidth: 2
				},
				children: [
					{
						type: 'Scene',
						x: 1,
						y: 1,
						height: jayus.chart.TOP_STACK_HEIGHT,
						constraints: {
							width: 'parent.width'
						},
						bg: {
						},
						children: [
							{
								id: 'label',
								type: 'Text',
								text: name,
								font: '12px sans-serif',
								brush: {
									fill: 'black'
								},
								constraints: {
									y: 'parent.height/2 - height/2'
								}
							},
							{
								id: 'bar',
								type: 'Scene',
								bg: {
									fill: data.color
								},
								width: 10,
								constraints: {
									height: 'parent.height - 2'
								}
							},
							{
								id: 'timeLabel',
								type: 'Text',
								text: '0 ms',
								font: '12px sans-serif',
								brush: {
									fill: 'black'
								},
								constraints: {
									y: 'parent.height/2 - height/2'
								}
							}
						]
					},
					{
						id: 'childrenStack',
						type: 'vStack',
						visible: true,
						x: 0,
						y: jayus.chart.TOP_STACK_HEIGHT+jayus.chart.CHILD_ROW_SPACING,
						height: 300,
						spacing: jayus.chart.CHILD_ROW_SPACING,
						constraints: {
							width: 'parent.width'
						}
					}
				]
			});

			data.label = data.entity.find('label');
			data.bar = data.entity.find('bar');
			data.timeLabel = data.entity.find('timeLabel');
			data.childrenStack = data.entity.find('childrenStack');

			data.label.ignoreDirty++;
			data.bar.ignoreDirty++;
			data.timeLabel.ignoreDirty++;
			// data.childrenStack.ignoreDirty++;

			data.bar.addHandler('leftClick', function() {
				// FIXME: IS NOT SETTING TRACKCURSOR FLAG
				data.color = jayus.chart.getRoutineColor(data.name);
				this.bg.setFill(data.color);
			});

			data.showChildren = true;
			data.label.data = data;
			data.label.handle({

				cursorOver: function() {
					this.setBg({fill: 'white'});
				},

				cursorOut: function() {
					this.clearBg();
				},

				leftClick: function() {
					this.data.showChildren = !this.data.showChildren;
				}

			});

			data.setFrameCount = function(count) {
				for(var i=count-1;i>=0;i--) {
					this.latencies[i] = -1;
				}
				for(var routine in this.children) {
					this.children[routine].setFrameCount(count);
				}
			};

			data.update = function() {

				if(this.depth > jayus.chart.MAX_ROUTINE_DEPTH) {
					return;
				}

				var i,
					routine,
					childData,
					width,
					val, total, count,
					labelColumnWidth = 0,
					childrenVisible = false;

				// Get the average latency
				total = 0;
				count = 0;
				for(i=0;i<this.latencies.length-1;i++) {
					val = this.latencies[i];
					if(val !== -1) {
						total += val;
						count++;
					}
				}
				this.averageLatency = total/count;

				for(routine in this.children) {
					childData = this.children[routine];
					width = childData.label.width;
					if(width > labelColumnWidth) {
						labelColumnWidth = width;
					}
				}

				// Calculate each child routine's average latency
				for(routine in this.children) {
					childData = this.children[routine];

					childData.labelColumnWidth = labelColumnWidth;

					childData.update();

					width = childData.timeLabel.width;
					if(width+jayus.chart.TIME_LABEL_COLUMN_WIDTH_PADDING > jayus.chart.timeLabelColumnWidth) {
						jayus.chart.timeLabelColumnWidth = width+jayus.chart.TIME_LABEL_COLUMN_WIDTH_PADDING;
					}

					if(childData.entity.visible) {
						childrenVisible = true;
					}

				}

				this.entity.averageLatency = this.averageLatency;
				this.entity.setVisible(this.averageLatency >= jayus.chart.LATENCY_DISPLAY_THRESHOLD);
				this.entity.setIncluded(this.averageLatency >= jayus.chart.LATENCY_DISPLAY_THRESHOLD);

				this.childrenVisible = childrenVisible && this.showChildren;

				if(this.entity.visible) {

					this.timeLabel.setText((Math.round(this.averageLatency*10)/10)+' ms');

					this.entity.children.at(0).setHeight(jayus.chart.TOP_STACK_HEIGHT);
					this.entity.children.at(1).setVisible(this.childrenVisible);
					this.entity.children.at(1).setIncluded(this.childrenVisible);

					if(this.childrenVisible) {

						// Set our height from the top row + spacing + child stack
						this.entity.setHeight(this.entity.children.at(0).height + jayus.chart.CHILD_ROW_SPACING + this.entity.children.at(1).height);

						// Sort the child routine names
						var children = this.children;
						this.sortedRoutineNames.sort(function(a, b) {
							return children[a].averageLatency < children[b].averageLatency;
						});

						// Sort the child routine rows
						this.childrenStack.children.sort(function(a, b) {
							return a.averageLatency < b.averageLatency;
						});

					}
					else {

						// Set our height only from the top row
						this.entity.setHeight(this.entity.children.at(0).height);

					}

					// Get the label column width, either set by parent or from label if at root
					if(this === jayus.chart.rootRoutine) {
						labelColumnWidth = this.label.width;
					}
					else {
						labelColumnWidth = this.labelColumnWidth;
					}
					// Add some whitespace to the labels
					labelColumnWidth += 10;

					// Reform the dimensions of the row scene
					this.label.setX(labelColumnWidth - this.label.width - 4);
					this.bar.setX(labelColumnWidth);
					width = this.entity.parent.width-labelColumnWidth-jayus.chart.timeLabelColumnWidth-4;
					if(this !== jayus.chart.rootRoutine) {
						width *= this.averageLatency/this.parent.averageLatency;
					}
					if(!isNaN(width) && isFinite(width)) {
						this.bar.setWidth(width);
					}
					this.timeLabel.setX(this.entity.width - this.timeLabel.width - 4);

				}

			};

			data.drawBars = function(ctx, y) {

				var totalHeight = Math.floor((this.time/jayus.chart.topMS)*jayus.chart.graph.height),
					childrenHeight = 0,
					selfHeight,
					temp;

				if(this.childrenVisible) {
					// Draw the graph bars
					var routineNames = this.sortedRoutineNames;
					for(i=0;i<routineNames.length;i++) {
						data = this.children[routineNames[i]];
						if(data.entity.visible) {
							// Draw the bar, keeping the height value returned
							temp = data.drawBars(ctx, y);
							// Subtract the height from the y index and add to the total children height
							y -= temp;
							childrenHeight += temp;
						}
					}
				}

				// Draw the latency graph bars
				selfHeight = totalHeight - childrenHeight;
				ctx.fillStyle = this.color;
				ctx.fillRect(jayus.chart.index, y-selfHeight, 1, selfHeight-0.5);
				this.time = 0;

				return totalHeight;

			};

			return data;
		},

		tallyInit: function jayus_chart_tallyInit(type) {
			// this.events.push('Create: '+object);
			// this.timeStamps.push(Date.now());
			// if(typeof this.inits[object] === 'undefined') {
			// 	this.inits[object] = {};
			// }
			// var labels = this.inits[object];
			// if(typeof labels[label] === 'undefined') {
			// 	labels[label] = 1;
			// }
			// else {
			// 	labels[label] += 1;
			// }
		},

		show: function jayus_chart_show() {
			if(!this.initialized) {
				this.init();
			}
			this.visible = true;
			$(jayus.chart.dialog).show();
			jayus.fire('debugPanelShown');
		},

		hide: function jayus_chart_hide() {
			if(this.initialized && this.visible) {
				$(jayus.chart.dialog).hide();
				this.graphSurface.clear();
				this.index = 0;
				this.visible = false;
			}
			jayus.fire('debugPanelHidden');
		},

		mark: function jayus_chart_mark(text) {
			if(this.visible) {
				var ctx = this.graphSurface.context,
					metrics = jayus.getTextMetrics(text, this.markFont);
				ctx.fillStyle = this.markColor;
				ctx.fillRect(this.index, 0, 1, this.graph.height-0.5);
				ctx.fillText(text, this.index-metrics.width-2, metrics.ascent);
			}
		},

		update: function jayus_chart_update() {
			if(this.visible) {

				this.begin('DebugPanel');

				var ctx = this.graphSurface.context,
					y = this.graphSurface.height,
					i,
					data,
					routineNames,
					height;

				// Process any pending mouseMove events
				// This would normally be done in the jayus step routine but the debug panel display is not "managed" by jayus
				if(this.display.hasPendingMousemoveEvent) {
					this.begin('MouseMoveEvent');
					this.display.processPendingMousemove();
					this.end();
				}

				// Update the routine tree
				this.begin('UpdateRoutineTable');
				this.rootRoutine.update();
				this.end();

				this.begin('Rendering');

				this.rootRoutine.drawBars(ctx, this.graphSurface.height);

				// // Draw the graph bars
				// routineNames = this.rootRoutine.sortedRoutineNames;
				// for(i=0;i<routineNames.length;i++) {
				// 	data = this.rootRoutine.children[routineNames[i]];
				// 	if(data.entity.visible) {

				// 		// Draw the latency graph bars
				// 		height = Math.floor((data.time/this.topMS)*this.graph.height);
				// 		ctx.fillStyle = data.color;
				// 		ctx.fillRect(this.index, y-height, 1, height-0.5);
				// 		y -= height;
				// 		data.time = 0;
				// 		// data.inits = 0;

				// 	}
				// }

				// Draw the latency graph caret, a vertical black line
				ctx.clearRect(this.index+1, 0, 2, this.graph.height);

				// Increment the latency graph index
				this.index++;
				if(this.index >= this.graph.width) {
					this.index = -1;
				}

				// Force a refresh of the display, since it's not managed by jayus
				this.display.refreshBuffer();

				this.end();

				this.end();

			}
		}

	},

	//#end

		//
		//  Text Utilities
		//__________________//

	/**
	Caches the dimensions of text in the specified font for quicker text measuring(and thus rendering).
	@method cacheFont
	@param {String} font
	*/

	cacheFont: function jayus_cacheFont(font) {
		//#ifdef DEBUG
		this.debug.match('jayus.cacheFont', font, 'font', jayus.TYPES.STRING);
		//#end
		var i, ctx, charWidths, descriptor;
		// Check that the font isnt already cached
		if(!this.isFontCached(font)) {
			// Create the array to store the glyph widths
			charWidths = [];
			// Get a context, save it
			ctx = this.getContext();
			ctx.save();
			// Set the font onto the context
			ctx.font = font;
			// Loop through the character codes to cache each character
			for(i=0;i<this.fontCacheMaxChar+1;i++) {
				// Cache the width of the character from that ascii code
				charWidths[i] = ctx.measureText(String.fromCharCode(i)).width;
			}
			// Restore the context
			ctx.restore();
			// Form and set the font descriptor
			descriptor = this.getVerticalFontMetrics(font);
			descriptor.charWidths = charWidths;
			this.fontCache[font] = descriptor;
		}
	},

	/**
	Caches the given fonts.
	@method cacheFonts
	@param {Array} fonts
	*/

	cacheFonts: function jayus_cacheFonts(fonts) {
		//#ifdef DEBUG
		this.debug.matchArray('jayus.cacheFonts', fonts, 'fonts', jayus.TYPES.STRING);
		//#end
		for(var i=0;i<fonts.length;i++) {
			this.cacheFont(fonts[i]);
		}
	},

	/**
	Returns whether or not the specified font is cached.
	@method {Boolean} isFontCached
	@param {String} font
	*/

	isFontCached: function jayus_isFontCached(font) {
		//#ifdef DEBUG
		this.debug.match('jayus.isFontCached', font, 'font', jayus.TYPES.STRING);
		//#end
		// Check that the cache has the font
		return typeof this.fontCache[font] === 'object';
	},

	/**
	Returns the font descriptor for the specified font.
	@method getFontDescriptor
	@param {String} font
	*/

	getFontDescriptor: function jayus_getFontDescriptor(font) {
		//#ifdef DEBUG
		this.debug.match('jayus.getFontDescriptor', font, 'font', jayus.TYPES.STRING);
		//#end
		// Cache the font if needed
		if(!this.isFontCached(font)) {
			this.cacheFont(font);
		}
		return this.fontCache[font];
	},

	/**
	Returns an object holding the dimensions of the given text in the given font.
	<br> The font dimensions are cached if not already.
	@method getTextMetrics
	@returns {Object}
	@... {Number} width
	@... {Number} height
	@... {Number} ascent
	@... {Number} descent
	@param {String} text
	@param {String} font
	*/

	getTextMetrics: function jayus_getTextMetrics(text, font) {
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.getTextMetrics', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING);
		//#end
		// Ensure the font is cached
		if(typeof this.fontCache[font] !== 'object') {
			this.cacheFont(font);
		}
		// Get the font descriptor
		var descriptor = jayus.fontCache[font],
			charWidths = descriptor.charWidths,
			i, width = 0;
		// Sum the widths of each character in the text
		for(i=text.length-1;i>=0;i--) {
			width += charWidths[text.charCodeAt(i)];
		}
		// Modify and return the ret object
		return {
			width: width,
			ascent: descriptor.ascent,
			descent: descriptor.descent,
			height: descriptor.height
		};
	},

	getTextWidth: function jayus_getTextWidth(text, font) {
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.getTextWidth', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING);
		//#end
		// Ensure the font is cached
		if(typeof this.fontCache[font] !== 'object') {
			this.cacheFont(font);
		}
		// Get the font descriptor
		var charWidths = jayus.fontCache[font].charWidths,
			i, width = 0;
		// Sum the widths of each character in the text
		for(i=text.length-1;i>=0;i--) {
			width += charWidths[text.charCodeAt(i)];
		}
		return width;
	},

	/**
	Returns an object holding the vertical dimensions of the specified font.
	@method getVerticalFontMetrics
	@returns {Object}
	@... {Number} height
	@... {Number} ascent
	@... {Number} descent
	@param {String} font
	*/

	getVerticalFontMetrics: function jayus_getVerticalFontMetrics(font) {

		var result = {},
			text = document.createElement('span'),
			block = document.createElement('div'),
			div = document.createElement('div');

		text.style.font = font;
		text.innerText = 'Hg';

		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0';

		div.appendChild(text);
		div.appendChild(block);

		document.body.appendChild(div);

		try {

			block.style.verticalAlign = 'baseline';
			result.ascent = block.offsetTop - text.offsetTop;

			block.style.verticalAlign = 'bottom';
			result.height = block.offsetTop - text.offsetTop;

			result.descent = result.height - result.ascent;

		}
		finally {
			document.body.removeChild(div);
		}

		return result;

	},

	//
	//  Box2D
	//_________//

	box2d: {

		/**
		Whether Box2D support is enabled.
		<br> Do not modify.
		@property {Boolean} jayus.box2d.enabled
		*/

		enabled: true,

		scale: 0.5,

		/**
		An array of Box2D worlds.
		<br> Do not modify.
		@property {Array} jayus.box2d.worlds
		*/

		worlds: [],

		/**
		The number of velocity iterations to step Box2D to.
		<br> Default is 10.
		<br> Do not modify.
		@property {Array} jayus.box2d.velocityIterations
		*/

		velocityIterations: 10,

		/**
		The number of position iterations to step Box2D to.
		<br> Default is 10.
		<br> Do not modify.
		@property {Array} jayus.box2d.positionIterations
		*/

		positionIterations: 10,

		/**
		An array of entities that have a Box2D body.
		<br> Do not modify.
		@property {Array} jayus.box2d.physicalEntities
		*/

		physicalEntities: [],

		/**
		Adds a Box2D world to be stepped by jayus.
		@method jayus.box2d.addWorld
		@param {Box2D.World} world
		*/

		addWorld: function jayus_box2d_addWorld(world) {
			//#ifdef DEBUG
			jayus.debug.match('jayus.box2d.addWorld', world, 'world', jayus.TYPES.OBJECT);
			//#end
			this.worlds.push(world);
		},

		/**
		Removes a Box2D world from jayus, it will no longer be updated.
		@method jayus.box2d.removeWorld
		@param {Box2D.World} world
		*/

		removeWorld: function jayus_box2d_removeWorld(world) {
			this.worlds.splice(this.worlds.indexOf(this.world), 1);
		},

		step: function jayus_box2d_step(elapsedSecs) {
			//#ifdef DEBUG
			jayus.chart.begin('Box2d');
			//#end
			// Step Box2D worlds
			var i, world;
			for(i=0;i<this.worlds.length;i++) {
				world = this.worlds[i];
				world.Step(elapsedSecs, this.velocityIterations, this.positionIterations);
				world.ClearForces();
			}
			// Update the entity position from its Box2D body
			for(i=0;i<this.physicalEntities.length;i++) {
				this.physicalEntities[i].updateFromBody();
			}
			//#ifdef DEBUG
			jayus.chart.end();
			//#end
		},

		drawDebug: function jayus_box2d_drawDebug() {
			for(var i=0;i<this.worlds.length;i++) {
				this.worlds[i].DrawDebugData();
			}
		}

	},

	//
	//  Utility
	//___________//

	/**
	Returns a canvas 2d Context object.
	<br> The context is not new nor guranteed to be "clean" in any way.
	<br> The context of the first display will be given, else a new context will be created.
	@method {Context} getContext
	*/

	getContext: function jayus_getContext() {
		// Check if a display exists
		if(this.displays.length) {
			return this.displays[0].context;
		}
		// Else create a new canvas and use its context
		return document.createElement('canvas').getContext('2d');
	},

		//
		//  Debug
		//_________//

	//#ifdef DEBUG

	//#replace jayus.TYPES.DEFINED 0
	//#replace jayus.TYPES.BOOLEAN 1
	//#replace jayus.TYPES.STRING 2
	//#replace jayus.TYPES.FUNCTION 3
	//#replace jayus.TYPES.NUMBER 4
	//#replace jayus.TYPES.OBJECT 5
	//#replace jayus.TYPES.ARRAY 6
	//#replace jayus.TYPES.CONTEXT 7
	//#replace jayus.TYPES.COLOR 8
	//#replace jayus.TYPES.BRUSH 9
	//#replace jayus.TYPES.MATRIX 10
	//#replace jayus.TYPES.LIST 11
	//#replace jayus.TYPES.ENTITY 12
	//#replace jayus.TYPES.POINT 13
	//#replace jayus.TYPES.CIRCLE 14
	//#replace jayus.TYPES.POLYGON 15
	//#replace jayus.TYPES.PATH 16
	//#replace jayus.TYPES.SURFACE 17
	//#replace jayus.TYPES.SCENE 18
	//#replace jayus.TYPES.SHAPE 19
	//#replace jayus.TYPES.RECTANGLE 20
	//#replace jayus.TYPES.BUFFER 21
	//#replace jayus.TYPES.ANIMATOR 22
	//#replace jayus.TYPES.CANVAS 23

	/**
	An enumeration of the types that the jayus.debug.is() method can check against.
	<br> Only found in the "debug" versions of jayus.
	<br> Values are:
		DEFINED,
		BOOLEAN,
		STRING,
		FUNCTION,
		NUMBER,
		OBJECT,
		ARRAY,
		CONTEXT,
		COLOR,
		BRUSH,
		MATRIX,
		LIST,
		ENTITY,
		POINT,
		CIRCLE,
		POLYGON,
		PATH,
		SURFACE,
		SCENE,
		SHAPE,
		RECTANGLE,
		BUFFER,
		ANIMATOR,
		CANVAS.
	@property {Object} TYPES
	*/

	TYPES: {
		DEFINED: 0,
		BOOLEAN: 1,
		STRING: 2,
		FUNCTION: 3,
		NUMBER: 4,
		OBJECT: 5,
		ARRAY: 6,
		CONTEXT: 7,
		COLOR: 8,
		BRUSH: 9,
		MATRIX: 10,
		LIST: 11,
		ENTITY: 12,
		POINT: 13,
		CIRCLE: 14,
		POLYGON: 15,
		PATH: 16,
		SURFACE: 17,
		SCENE: 18,
		SHAPE: 19,
		RECTANGLE: 20,
		BUFFER: 21,
		ANIMATOR: 22,
		CANVAS: 23
	},

	/**
	@end
	*/

	/**
	Holds properties and methods dedicated to debugging routines.
	<br> Only found in the "debug" versions of jayus.
	@namespace jayus.debug
	*/

	debug: {

		/**
		Whether or not to pause jayus when the Escape button is pressed in debug mode.
		<br> Default is true
		<br> This property and its functionality only exists in debug mode.
		@property {Boolean} pauseOnEscape
		*/

		pauseOnEscape: true,

			// Type Checking

		types: [
			'undefined',
			'boolean',
			'string',
			'function',
			'number',
			'object',
			'array',
			'Context',
			'Color',
			'Brush',
			'Matrix',
			'List',
			'Entity',
			'Point',
			'Circle',
			'Polygon',
			'Path',
			'Surface',
			'Scene',
			'Shape',
			'Rectangle',
			'Buffer',
			'Animator',
			'Canvas'
		],

		/**
		Returns whether or not the sent variable is of the specified type.
		<br> Types are specified using the jayus.TYPES enumerations.
		<br> Types include:
			Defined,
			Boolean,
			String,
			Function,
			Number,
			Object,
			Array,
			Context,
			Color,
			Brush,
			Matrix,
			List,
			Entity,
			Point,
			Circle,
			Polygon,
			Path,
			Surface,
			Scene,
			Shape,
			Rectangle,
			Buffer,
			Animator,
			Canvas.
		@method {Boolean} is
		@param {Number} type
		@param {*} v
		*/

		is: function jayus_debug_is(type, v) {
			switch(type) {
				case jayus.TYPES.DEFINED:
					return typeof v !== 'undefined';
				case jayus.TYPES.BOOLEAN:
					return typeof v === 'boolean';
				case jayus.TYPES.STRING:
					return typeof v === 'string';
				case jayus.TYPES.FUNCTION:
					return typeof v === 'function';
				case jayus.TYPES.NUMBER:
					return typeof v === 'number' && !isNaN(v);
				case jayus.TYPES.OBJECT:
					return typeof v === 'object' && v !== null;
				case jayus.TYPES.ARRAY:
					return v instanceof Array;
				case jayus.TYPES.CONTEXT:
					return v instanceof CanvasRenderingContext2D;
				case jayus.TYPES.BRUSH:
					return typeof v === 'object';
				case jayus.TYPES.COLOR:
				case jayus.TYPES.MATRIX:
				case jayus.TYPES.LIST:
				case jayus.TYPES.ENTITY:
				case jayus.TYPES.POINT:
				case jayus.TYPES.CIRCLE:
				case jayus.TYPES.POLYGON:
				case jayus.TYPES.PATH:
				case jayus.TYPES.SURFACE:
				case jayus.TYPES.SCENE:
					return typeof v === 'object' && v instanceof jayus[jayus.debug.types[type]];
				case jayus.TYPES.SHAPE:
					return	this.is(jayus.TYPES.POINT, v) ||
							this.is(jayus.TYPES.RECTANGLE, v) ||
							this.is(jayus.TYPES.CIRCLE, v) ||
							this.is(jayus.TYPES.POLYGON, v) ||
							this.is(jayus.TYPES.PATH, v);
				case jayus.TYPES.RECTANGLE:
					return v instanceof jayus.Rectangle || (typeof v.x === 'number' && typeof v.width === 'number');
				case jayus.TYPES.BUFFER:
					// Check if the ImageData constructor is defined
					if(typeof ImageData === 'function') {
						return v instanceof ImageData;
					}
					// Else check that the usual properties are in the object, not foolproof but the best we can do
					return	this.is(jayus.TYPES.OBJECT, v) &&
							this.is(jayus.TYPES.NUMBER, v.width) &&
							this.is(jayus.TYPES.NUMBER, v.height) &&
							this.is(jayus.TYPES.ARRAY, v.data);
				case jayus.TYPES.ANIMATOR:
					return !!v.isAnimator;
				case jayus.TYPES.CANVAS:
					return v instanceof HTMLCanvasElement;
			}
			throw new Error('jayus.debug.is() - Unknown type('+jayus.debug.types[type]+') specified');
		},

		match: function jayus_debug_match(method, value, name, type) {
			if(!this.is(type, value)) {
				throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' sent, '+jayus.debug.types[type]+' required');
			}
		},

		matchOptional: function jayus_debug_matchOptional(method, value, name, type) {
			if(typeof value !== 'undefined' && !this.is(type, value)) {
				throw new TypeError(method+'() - Invalid optional parameter '+name+this.toString(value)+' sent, '+jayus.debug.types[type]+' required');
			}
		},

		matchArray: function jayus_debug_matchArray(method, value, name, type) {
			if(!this.is(jayus.TYPES.ARRAY, value)) {
				throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' sent, Array of '+jayus.debug.types[type]+' required');
			}
			for(var i=0;i<value.length;i++) {
				if(!this.is(type, value[i])) {
					throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' array sent, element at '+i+'('+value[i]+') is required to be '+jayus.debug.types[type]);
				}
			}
		},

		matchArguments: function jayus_debug_matchArguments(name, args) {
			var i, paramName, argValue, paramType;
			for(i=2;i<arguments.length;i+=2) {
				argValue = args[i/2-1];
				paramName = arguments[i];
				paramType = arguments[i+1];
				if(!this.is(paramType, argValue)) {
					throw new TypeError(name+'() - Invalid '+paramName+this.toString(argValue)+' sent, '+jayus.debug.types[paramType]+' required');
				}
			}
		},

		matchArgumentsAs: function jayus_debug_matchArgumentsAs(name, args, type) {
			var i, paramName, argValue;
			for(i=3;i<arguments.length;i++) {
				argValue = args[i-3];
				paramName = arguments[i];
				if(!this.is(type, argValue)) {
					throw new TypeError(name+'() - Invalid '+paramName+this.toString(argValue)+' sent, '+jayus.debug.types[type]+' required');
				}
			}
		},

		// Quicker methods for often used method signatures

		matchContext: function jayus_debug_matchContext(method, value) {
			if(!this.is(jayus.TYPES.CONTEXT, value)) {
				throw new TypeError(method+'() - Invalid parameter ctx'+this.toString(value)+' sent, Context required');
			}
		},

		matchCoordinate: function jayus_debug_matchCoordinate(method, x, y) {
			if(!this.is(jayus.TYPES.POINT, x) && !this.is(jayus.TYPES.NUMBER, x)) {
				throw new TypeError(method+'() - Invalid parameter x'+this.toString(x)+' sent, Point or Number required');
			}
			if(this.is(jayus.TYPES.NUMBER, x) && !this.is(jayus.TYPES.NUMBER, y)) {
				throw new TypeError(method+'() - Invalid parameter y'+this.toString(y)+' sent, Number required');
			}
		},

		matchSize: function jayus_debug_matchSize(method, x, y) {
			if(!this.is(jayus.TYPES.ENTITY, x) && !this.is(jayus.TYPES.NUMBER, x)) {
				throw new TypeError(method+'() - Invalid parameter width'+this.toString(x)+' sent, Entity or Number required');
			}
			if(this.is(jayus.TYPES.NUMBER, x) && !this.is(jayus.TYPES.NUMBER, y)) {
				throw new TypeError(method+'() - Invalid parameter height'+this.toString(y)+' sent, Number required');
			}
		},

		matchRectangle: function jayus_debug_matchRectangle(method, a, b, c, d) {
			switch(arguments.length) {
				case 3:
					return jayus.debug.matchArguments(method, [a,b], 'origin', jayus.TYPES.POINT, 'entity', jayus.TYPES.ENTITY);
				case 4:
					return jayus.debug.matchArguments(method, [a,b,c], 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
				case 5:
					return jayus.debug.matchArgumentsAs(method, [a,b,c,d], jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
			}
			throw new TypeError(method+'() - Invalid number of arguments sent, 2, 3, or 4 required');
		},

		verifyMethod: function jayus_debug_verifyMethod(object, method) {
			this.matchArguments('jayus.debug.verifyMethod', arguments, 'object', jayus.TYPES.OBJECT, 'method', jayus.TYPES.STRING);
			if(!this.is(jayus.TYPES.FUNCTION, object[method])) {
				console.log(object);
				throw new TypeError('jayus.debug.verifyMethod() - Object'+this.toString(object)+' does not have method '+method);
			}
		},

		/**
		Returns a string representation of the given variable for debugging purposes.
		<br> Used in error logging, such as in the jayus.debug.matchArgumentsOLD() function.
		@method {String} toString
		@param {*} v
		*/

		toString: function jayus_debug_toString(v) {
			switch(typeof v) {
				// Check if undefined
				case 'undefined':
					return '(Undefined)';
				// Check for a boolean
				case 'boolean':
					return '(Boolean:'+v+')';
				// Check for a number
				case 'number':
					// Either NaN, Infinity, or a number
					return '(Number:'+v+')';
				// Check for a string
				case 'string':
					return '(String:"'+v+'")';
				// Check for an object
				case 'object':
					// Check for null
					if(v === null) {
						return '(null)';
					}
					// Check for an array
					if(v instanceof Array) {
						return '(Array:['+v+'])';
					}
					// Check for an object that can toString itself
					if(typeof v.toString === 'function') {
						return v.toString();
					}
					// Check for an entity to object method
					if(typeof v.toObject === 'function') {
						return JSON.stringify(v.toObject());
					}
					// Assume its a plain object
					return '(Object:'+v+')';
				// Check for a function
				case 'function':
					return '(Function:'+v+')';
			}
			return '(Unknown)';
		},

		exposedOriginColor: 'blue',

		exposedBoundsColor: 'red',

		exposedScopeColor: 'green',

		exposedFrameColor: 'orange',

		exposedTransformedDashing: [5, 5],

		defaultDebugRenderer: function jayus_debug_defaultDebugRenderer(ctx) {

			var item;
			
			ctx.save();

			ctx.lineWidth = 1;

			// Stroke the bounds
			if(this.shapeType === 0) {
				// Stroke the bounds
				item = this.getBounds().alignToCanvas();
				item.etchOntoContext(ctx);
				ctx.strokeStyle = jayus.debug.exposedBoundsColor;
				ctx.stroke();
			}

			// Stroke the scope
			ctx.strokeStyle = jayus.debug.exposedScopeColor;
			item = this.getScope().alignToCanvas();
			ctx.strokeRect(item.x, item.y, item.width, item.height);

			// Stroke the frame
			if(typeof this.getFrame === 'function') {
				// Stroke the transformed frame
				item = this.getFrame().alignToCanvas();
				item.etchOntoContext(ctx);
				ctx.strokeStyle = jayus.debug.exposedFrameColor;
				ctx.stroke();
				// Stroke the untransformed frame
				if(this.isTransformed) {
					ctx.setLineDash(jayus.debug.exposedTransformedDashing);
					item = this.getUnFrame().alignToCanvas();
					ctx.strokeRect(item.x, item.y, item.width, item.height);
				}
			}

			ctx.restore();

		},

		showPoint: function jayus_debug_showPoint(display, x, y, duration) {
			if(arguments.length === 3) {
				duration = 1000;
			}
			var spec = new jayus.Scene(3, 3);
			spec.setBg({ fill: 'red' });
			spec.setOrigin(x, y);
			spec.animate().setAlpha(0).setDuration(duration).addHandler('finished', function() {
				display.children.remove(spec);
			}).start();
			display.children.add(spec);
		},

		pause: function jayus_debug_pause() {
			var i, display, ctx;
			if(jayus.running) {
				// Stop jayus
				jayus.stop();
				// Draw an paused message on each display
				for(i=0;i<jayus.displays.length;i++) {
					// Cache vars
					display = jayus.displays[i];
					ctx = display.context;
					ctx.save();
					// Reset the transformation matrix
					ctx.setTransform(1,0,0,1,0,0);
					// Darken the canvas
					ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
					ctx.fillRect(0, 0, display.width, display.height);
					// Draw a "Stopped" message
					ctx.fillStyle = 'white';
					ctx.font = '24px sans-serif';
					ctx.textAlign = 'center';
					ctx.fillText('Paused', display.width/2, display.height/2);
					ctx.restore();
				}
			}
			else {
				// Refresh the displays
				for(i=0;i<jayus.displays.length;i++) {
					jayus.displays[i].fullyRefreshBuffer();
				}
				// Start jayus
				jayus.start();
			}
		}

	},

	/**
	@end
	*/

	//#end

	//
	//  Hit Testing
	//_______________//

	/*
	TODO: Hit testing
		More advanced, allow for options to be specified
		Options:
			Include stroke width?
			Include tolerance
			Have status returned
			Have intersection points returned
		Return a hitInfo object or place results into options?
		Should we keep two classes of hit-testing for performance in situations with no options?
	*/

	/**
	Tests for the intersection of two Entities or Shape objects.
	<br> Each object must have a shapeType property corresponding to one found in jayus.SHAPES.
	@method {Boolean} intersectTest
	*/

	intersectTest: function jayus_intersectTest(a, b) {
		var i, temp, ctx, ret,
			at = a.shapeType,
			bt = b.shapeType;
		// Get a's bounds if custom
		while(!at) {
			//#ifdef DEBUG
			if(a.getBounds() === a) {
				throw new Error('jayus.intersectTest() - a.getBounds() === a, indefinite loop would result');
			}
			//#end
			a = a.getBounds();
			at = a.shapeType;
		}
		// Get b's bounds if custom
		while(!bt) {
			//#ifdef DEBUG
			if(b.getBounds() === b) {
				throw new Error('jayus.intersectTest() - b.getBounds() === b, indefinite loop would result');
			}
			//#end
			b = b.getBounds();
			bt = b.shapeType;
		}
		// Loop over a if a List
		if(at === jayus.SHAPES.LIST) {
			for(i=0;i<a.items.length;i++) {
				if(this.intersectTest(a[i], b)) {
					return true;
				}
			}
			return false;
		}
		// Loop over b if a List
		if(bt === jayus.SHAPES.LIST) {
			for(i=0;i<b.items.length;i++) {
				if(this.intersectTest(a, b[i])) {
					return true;
				}
			}
			return false;
		}
		// Switch the shapes so the lesser one is always first
		if(at > bt) {
			temp = a;
			a = b;
			b = temp;
		}
		// Sum and check the shape types
		switch(a.shapeType+b.shapeType) {

			// Point - Point
			case jayus.SHAPES.POINT + jayus.SHAPES.POINT:
				return a.x === b.x && a.y === b.y;

			// Point - Circle
			case jayus.SHAPES.POINT + jayus.SHAPES.CIRCLE:
				return b.intersectsAt(a.x, a.y);
				// return ((a.x-b.x)*(a.x-b.x)) + ((a.y-b.y)*(a.y-b.y)) <= b.radius*b.radius;

			// Circle - Circle
			case jayus.SHAPES.CIRCLE + jayus.SHAPES.CIRCLE:
				// Compare the distances from the centers to the radii
				return ((a.x-b.x)*(a.x-b.x)) + ((a.y-b.y)*(a.y-b.y)) <= (a.radius+b.radius)*(a.radius+b.radius);

			// Point - Rectangle
			case jayus.SHAPES.POINT + jayus.SHAPES.RECTANGLE:
				return b.intersectsAt(a.x, a.y);
				// return b.x <= a.x && a.x <= b.x+b.width && b.y <= a.y && a.y <= b.y+b.height;

			// Circle - Rectangle
			case jayus.SHAPES.CIRCLE + jayus.SHAPES.RECTANGLE:
				// Multiplying x and y by 2 isnt really correct procedure, but is used to simplify the calculations below
				var x = 2*Math.abs(a.x - (b.x+b.width/2)),
					y = 2*Math.abs(a.y - (b.y+b.height/2));
				// if(x > (b.width/2 + a.radius) || y > (b.height/2 + a.radius)) {
				if(x > (b.width + 2*a.radius) || y > (b.height + 2*a.radius)) {
					return false;
				}
				// if(x <= (b.width/2) || y <= (b.height/2)) {
				if(x <= b.width || y <= b.height) {
					return true;
				}
				// return (x-b.width/2)*(x-b.width/2) + (y-b.height/2)*(y-b.height/2) <= (a.radius*a.radius);
				return (x-b.width)*(x-b.width) + (y-b.height)*(y-b.height) <= 4*a.radius*a.radius;

			// Rectangle - Rectangle
			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.RECTANGLE:
				return !((a.x+a.width) < b.x || (a.y+a.height) < b.y || a.x > (b.x+b.width) || a.y > (b.y+b.height));

			// Point - Polygon
			case jayus.SHAPES.POINT + jayus.SHAPES.POLYGON:
				return b.intersectsAt(a.x, a.y);

			// Circle - Polygon
			case jayus.SHAPES.CIRCLE + jayus.SHAPES.POLYGON:
				return this.intersectsPolygonPolygon(a.toPolygon(), b);

			// Rectangle - Polygon
			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.POLYGON:
				// PERF: Check without creating a new Polygon, requires new routine
				return this.intersectPolygonPolygon(a.toPolygon(), b);

			// Polygon - Polygon
			case jayus.SHAPES.POLYGON + jayus.SHAPES.POLYGON:
				return this.intersectsPolygonPolygon(a, b);

			// Point - Path
			case jayus.SHAPES.POINT + jayus.SHAPES.PATH:
				return b.intersectsAt(a.x, a.y);

			// Circle - Path
			case jayus.SHAPES.CIRCLE + jayus.SHAPES.PATH:
				return this.intersectsPolygonPolygon(a.toPolygon(), b.toPolygon());

			// Rectangle - Path
			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.PATH:
				return this.intersectsPolygonPolygon(a.toPolygon(), b.toPolygon());

			// Polygon - Path
			case jayus.SHAPES.POLYGON + jayus.SHAPES.PATH:
				return this.intersectsPolygonPolygon(a, b.toPolygon());

			// Path - Path
			case jayus.SHAPES.PATH + jayus.SHAPES.PATH:
				return this.intersectsPolygonPolygon(a.toPolygon(), b.toPolygon());

		}
	},

	/**
	Returns whether two lines intersect.
	@method {Boolean} intersectLineLine
	@param {Point} a1
	@param {Point} a2
	@param {Point} b1
	@param {Point} b2
	*/

	intersectLineLine: function jayus_intersectLineLine(a1, a2, b1, b2) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('jayus.intersectLineLine', arguments, jayus.TYPES.POINT, 'a1', 'a2', 'b1', 'b2');
		//#end
		var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
			ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
			u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
		if(u_b !== 0) {
			var ua = ua_t / u_b,
				ub = ub_t / u_b;
			return 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1;
		}
		return ua_t === 0 || ub_t === 0;
	},

	/**
	Returns whether a line and polygon intersect.
	@method {Boolean} intersectLinePolygon
	@param {Point} a1
	@param {Point} a2
	@param {Polygon} poly
	*/

	intersectLinePolygon: function jayus_intersectLinePolygon(a1, a2, poly) {
		//#ifdef DEBUG
		jayus.debug.matchArguments('jayus.intersectLinePolygon', arguments, 'a1', jayus.TYPES.POINT, 'a2', jayus.TYPES.POINT, 'poly', jayus.TYPES.POLYGON);
		//#end
		for(var i=poly.xPoints.length-1; i>=0; i--) {
			if(this.intersectLineLine(a1, a2, poly.xPoints[i], poly.yPoints[i])) {
				return true;
			}
		}
		return false;
	},

	/**
	Returns whether two polygons intersect.
	@method {Boolean} intersectPolygonPolygon
	@param {Polygon} poly1
	@param {Polygon} poly2
	*/

	intersectPolygonPolygon: function jayus_intersectPolygonPolygon(poly1, poly2) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('jayus.intersectPolygonPolygon', arguments, jayus.TYPES.POLYGON, 'poly1', 'poly2');
		//#end
		for(var i=poly1.xPoints.length-1; i>=0; i--) {
			if(this.intersectLinePolygon(poly1.xPoints[i], poly1.yPoints[i], poly2)) {
				return true;
			}
		}
		return false;
	},

	/**
	Returns the distance between two points.
	@method {Number} distance
	@param {Point} a
	@param {Point} b
	*/

	distance: function jayus_distance(a, b) {
		//#ifdef DEBUG
		this.debug.matchArgumentsAs('jayus.distance', arguments, jayus.TYPES.POINT, 'a', 'b');
		//#end
		var x = a.x-b.x,
			y = a.y-b.y;
		return Math.sqrt(x*x + y*y);
	},

	//
	//  jayus.math
	//______________//

	/**
	A small selection of math related functions.
	@namespace jayus.math
	*/

	math: {

		/**
		Returns a random item from the sent array.
		@method {*} randomFrom
		@param {Array} array
		*/

		randomFrom: function jayus_math_randomFrom(array) {
			//#ifdef DEBUG
			jayus.debug.match('jayus.math.randomFrom', array, 'array', jayus.TYPES.ARRAY);
			if(!array.length) {
				throw new RangeError('jayus.math.randomFrom() - Invalid array'+jayus.debug.toString(array)+' sent, array or at least length 1 required');
			}
			//#end
			// Return an item at a random slot
			return array[this.randomBetween(0, array.length-1)];
		},

		/**
		Returns a random integer within the sent range, including the end points.
		@method {Number} randomBetween
		@param {Number} min
		@param {Number} max
		*/

		randomBetween: function jayus_math_randomBetween(min, max) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.randomBetween', arguments, jayus.TYPES.NUMBER, 'min', 'max');
			//#end
			// Return a random number
			return min+Math.floor((max-min+1)*Math.random());
		},

		/**
		Returns the sent number clamped between the two specified values.
		@method {Number} clamp
		@param {Number} min
		@param {Number} num
		@param {Number} max
		*/

		clamp: function jayus_math_clamp(min, num, max) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.clamp', arguments, jayus.TYPES.NUMBER, 'min', 'num', 'max');
			//#end
			if(num < min) {
				return min;
			}
			if(num > max) {
				return max;
			}
			return num;
		},

		/**
		Returns the smallest number in the sent array.
		@method {Number} min
		@param {Array} numbers
		*/

		min: function jayus_math_min(numbers) {
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.min', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length) {
				throw new RangeError('jayus.math.min() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			// Keep a variable of the smallest number
			var i, val,
				min = numbers[0];
			// Loop through the numbers
			for(i=numbers.length-1;i>=1;i--) {
				val = numbers[i];
				if(val < min) {
					min = val;
				}
			}
			return min;
		},

		/**
		Returns the largest number in the sent array.
		@method {Number} max
		@param {Array} numbers
		*/

		max: function jayus_math_max(numbers) {
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.max', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length) {
				throw new RangeError('jayus.math.max() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			// Keep a variable of the largest number
			var i, val,
				max = numbers[0];
			// Loop through the numbers
			for(i=numbers.length-1;i>=1;i--) {
				val = numbers[i];
				if(val > max) {
					max = val;
				}
			}
			return max;
		},

		/**
		Returns the average of the numbers in the sent array.
		@method {Number} average
		@param {Array} numbers
		*/

		average: function jayus_math_average(numbers) {
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.average', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length) {
				throw new RangeError('jayus.math.average() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			var i, total = 0;
			for(i=numbers.length-1;i>=1;i--) {
				total += numbers[i];
			}
			return total/numbers.length;
		},

			//
			//  Angles
			//__________//

		/**
		Converts an angle from radians to degrees.
		@method {Number} toDegrees
		@param {Number} angle In radians
		*/

		toDegrees: function jayus_math_toDegrees(angle) {
			return angle*(180/Math.PI);
		},

		/**
		Converts an angle from degrees to radians.
		@method {Number} toRadians
		@param {Number} angle In degrees
		*/

		toRadians: function jayus_math_toRadians(angle) {
			return angle*(Math.PI/180);
		},

		/**
		Flips an angle vertically, across the x axis.
		@method {Number} vFlipAngle
		@param {Number} angle In radians
		*/

		vFlipAngle: function jayus_math_vFlipAngle(angle) {
			//#ifdef DEBUG
			jayus.debug.match('jayus.math.vFlipAngle', angle, 'angle', jayus.TYPES.NUMBER);
			//#end
			// Flip the angle vertically, across the x axis
			return 2*Math.PI-angle;
		},

		/**
		Flips an angle horizontally, across the y axis.
		@method {Number} hFlipAngle
		@param {Number} angle In radians
		*/

		hFlipAngle: function jayus_math_hFlipAngle(angle) {
			//#ifdef DEBUG
			jayus.debug.match('jayus.math.hFlipAngle', angle, 'angle', jayus.TYPES.NUMBER);
			//#end
			// Flip the angle horizontally, across the y axis
			angle = Math.PI-angle;
			if(angle < 0) {
				angle += 2*Math.PI;
			}
			return angle;
		},

		/**
		Returns the distance(in radians) given by traversing a circle from angle1 to angle2 in a clockwise direction.
		@method {Number} getCwAngleBetween
		@param {Angle} angle1 In radians
		@param {Angle} angle2 In radians
		*/

		getCwAngleBetween: function jayus_math_getCwAngleBetween(angle1, angle2) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.getCwAngleBetween', arguments, jayus.TYPES.NUMBER, 'angle1', 'angle2');
			//#end
			// Get the cw distance between the angles
			var distance = angle1-angle2;
			// If its less than 0, add 2PI to correct it
			if(distance < 0) {
				distance += 2*Math.PI;
			}
			return distance;
		},

		/**
		Returns the distance(in radians) given by traversing a circle from angle1 to angle2 in a counter-clockwise direction.
		@method {Number} getCcwAngleBetween
		@param {Angle} angle1 In radians
		@param {Angle} angle2 In radians
		*/

		getCcwAngleBetween: function jayus_math_getCcwAngleBetween(angle1, angle2) {
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.getCcwAngleBetween', arguments, jayus.TYPES.NUMBER, 'angle1', 'angle2');
			//#end
			// Get the ccw distance between the angles
			var distance = angle2-angle1;
			// If its less than 0, add 2PI to correct it
			if(distance < 0) {
				distance += 2*Math.PI;
			}
			return distance;
		}

	},

	//
	//  jayus.colors
	//________________//

	/**
	A listing of 140 named colors formally identified by W3C
	@namespace jayus.colors
	*/

	colors: {

		/**
		The number of known colors, 140.
		@property {Number} jayus.colors.count
		*/

		count: 140,

		/**
		The display names of the colors.
		<br> Ordered alphabetically.
		@property {Array} jayus.colors.displayNames
		*/

		displayNames: ['Alice Blue','Antique White','Aqua','Aquamarine','Azure','Beige','Bisque','Black','Blanched Almond','Blue','Blue Violet','Brown','Burly Wood','Cadet Blue','Chartreuse','Chocolate','Coral','Cornflower Blue','Cornsilk','Crimson','Cyan','Dark Blue','Dark Cyan','Dark Goldenrod','Dark Grey','Dark Green','Dark Khaki','Dark Magenta','Dark Olive Green','Dark Orange','Dark Orchid','Dark Red','Dark Salmon','Dark Sea Green','Dark Slate Blue','Dark Slate Grey','Dark Turquoise','Dark Violet','Deep Pink','Deep Sky Blue','Dim Grey','Dodger Blue','Firebrick','Floral White','Forest Green','Fuchsia','Gainsboro','Ghost White','Gold','Goldenrod','Grey','Green','Green Yellow','Honeydew','Hot Pink','Indian Red','Indigo','Ivory','Khaki','Lavender','Lavender Blush','Lawn Green','Lemon Chiffon','Light Blue','Light Coral','Light Cyan','Light Goldenrod','Light Green','Light Grey','Light Pink','Light Salmon','Light Sea Green','Light Sky Blue','Light Slate Grey','Light Steel Blue','Light Yellow','Lime','Lime Green','Linen','Magenta','Maroon','Medium Aquamarine','Medium Blue','Medium Orchid','Medium Purple','Medium Sea Green','Medium Slate Blue','Medium Spring Green','Medium Turquoise','Medium Violet Red','Midnight Blue','Mint Cream','Misty Rose','Moccasin','Navajo White','Navy','Old Lace','Olive','Olive Drab','Orange','Orange Red','Orchid','Pale Goldenrod','Pale Green','Pale Turquoise','Pale Violet Red','Papaya Whip','Peach Puff','Peru','Pink','Plum','Powder Blue','Purple','Red','Rosy Brown','Royal Blue','Saddle Brown','Salmon','Sandy Brown','Sea Green','Seashell','Sienna','Silver','Sky Blue','Slate Blue','Slate Grey','Snow','Spring Green','Steel Blue','Tan','Teal','Thistle','Tomato','Turquoise','Violet','Wheat','White','White Smoke','Yellow','Yellow Green'],

		/**
		The functional names of the colors, recognized by browsers.
		<br> Ordered alphabetically.
		<br> Not available until jayus is initialized.
		@property {Array} jayus.colors.cssNames
		*/

		cssNames: null,

		/**
		The red component values for the colors.
		@property {Array} jayus.colors.redComponents
		*/

		redComponents: [240,250,0,127,240,245,255,0,255,0,138,165,222,95,127,210,255,100,255,220,0,0,0,184,169,0,189,139,85,255,153,139,233,143,72,47,0,148,255,0,105,30,178,255,34,255,220,248,255,218,127,0,173,240,255,205,75,255,240,230,255,124,255,173,240,224,250,144,211,255,255,32,135,119,176,255,0,50,250,255,127,102,0,186,147,60,123,0,72,199,25,245,255,255,255,0,253,128,107,255,255,218,238,152,175,219,255,255,205,255,221,176,127,255,188,65,139,250,244,46,255,160,192,135,106,112,255,0,70,210,0,216,255,64,238,245,255,245,255,154],

		/**
		The green component values for the colors.
		@property {Array} jayus.colors.greenComponents
		*/

		greenComponents: [248,235,255,255,255,245,228,0,235,0,43,42,184,158,255,105,127,149,248,20,255,0,139,134,169,100,183,0,107,140,50,0,150,188,61,79,206,0,20,191,105,144,34,250,139,0,220,248,215,165,127,127,255,255,105,92,0,255,230,230,240,252,250,216,128,255,250,238,211,182,160,178,206,136,196,255,255,205,240,0,0,205,0,85,112,179,104,250,209,21,25,255,228,228,222,0,245,128,142,165,69,112,232,251,238,112,239,218,133,192,160,224,127,0,143,105,69,128,164,139,245,82,192,206,90,128,250,255,130,180,128,191,99,225,130,222,255,255,255,205],

		/**
		The blue component values for the colors.
		@property {Array} jayus.colors.blueComponents
		*/

		blueComponents: [255,215,255,212,255,220,196,0,205,255,226,42,135,160,0,30,80,237,220,60,255,139,139,11,169,0,107,139,47,0,204,0,122,143,139,79,209,211,147,255,105,255,34,240,34,255,220,255,0,32,127,127,47,240,180,92,130,240,140,250,245,0,205,230,128,255,210,144,211,193,122,170,250,153,222,224,0,50,230,255,127,170,205,211,219,113,238,154,204,133,112,250,225,181,173,128,230,0,35,0,0,214,170,152,238,147,213,185,63,203,221,230,0,0,143,225,19,114,96,87,238,45,192,235,205,144,250,127,180,140,128,216,71,208,238,179,255,245,0,50]

	},

	/**
	An enumeration of the types of dirty events.
	@namespace jayus.DIRTY
	*/

	//#replace jayus.DIRTY.VISIBILITY 1
	//#replace jayus.DIRTY.POSITION 2
	//#replace jayus.DIRTY.SIZE 4
	//#replace jayus.DIRTY.TRANSFORMS 8
	//#replace jayus.DIRTY.CONTENT 16
	//#replace jayus.DIRTY.STYLE 32
	//#replace jayus.DIRTY.BACKGROUND 16
	//#replace jayus.DIRTY.FRAME 6
	//#replace jayus.DIRTY.SCOPE 2+4+8
	//#replace jayus.DIRTY.ALL 127

	DIRTY: {

		/**
		Denotes a dirty event of the type: visibility.
		@property {Number} VISIBILITY
		*/
		VISIBILITY: 1,

		/**
		Denotes a dirty event of the type: position.
		@property {Number} POSITION
		*/
		POSITION: 2,

		/**
		Denotes a dirty event of the type: size.
		@property {Number} SIZE
		*/
		SIZE: 4,

		/**
		Denotes a dirty event of the type: transforms.
		@property {Number} TRANSFORMS
		*/
		TRANSFORMS: 8,

		/**
		Denotes a dirty event of the type: content.
		@property {Number} CONTENT
		*/
		CONTENT: 16,

		/**
		Denotes a dirty event of the type: style.
		@property {Number} STYLE
		*/
		STYLE: 32,

		/**
		Denotes a dirty event of the type: background.
		@property {Number} BACKGROUND
		*/
		BACKGROUND: 16,

		/**
		Denotes a dirty event of the type: frame.
		@property {Number} FRAME
		*/
		FRAME: 6,

		/**
		Denotes a dirty event of the type: scope.
		@property {Number} SCOPE
		*/
		SCOPE: 2+4+8,

		/**
		Denotes a dirty event of every type.
		@property {Number} ALL
		*/
		ALL: 127

	},

	/**
	An enumeration of the types that the jayus.intersectTest() method can check against.
	@namespace jayus.SHAPES
	*/

	//#replace jayus.SHAPES.LIST -1
	//#replace jayus.SHAPES.CUSTOM 0
	//#replace jayus.SHAPES.POINT 1
	//#replace jayus.SHAPES.CIRCLE 2
	//#replace jayus.SHAPES.RECTANGLE 4
	//#replace jayus.SHAPES.POLYGON 8
	//#replace jayus.SHAPES.PATH 16

	SHAPES: {

		/**
		Denotes the object has a list of bounds shapes.
		@property {Number} LIST
		*/
		LIST: -1,

		/**
		Denotes the object has a custom bounds shape.
		@property {Number} CUSTOM
		*/
		CUSTOM: 0,

		/**
		Denotes the object has a Point bounds shape.
		@property {Number} POINT
		*/
		POINT: 1,

		/**
		Denotes the object has a Circle bounds shape.
		@property {Number} CIRCLE
		*/
		CIRCLE: 2,

		/**
		Denotes the object has a Rectangle bounds shape.
		@property {Number} RECTANGLE
		*/
		RECTANGLE: 4,

		/**
		Denotes the object has a Polygon bounds shape.
		@property {Number} POLYGON
		*/
		POLYGON: 8,

		/**
		Denotes the object has a Path bounds shape.
		@property {Number} PATH
		*/
		PATH: 16

	}

};

})();