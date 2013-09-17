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

/**
Defines the global jayus object.
@file jayus.js
*/

//
//  jayus
//_________//

/*

TODO:

		Make debug panel better
			Resizable
			Scrolling
			More graphs
			Give some idea of what is being dirtied
			Give tally of inits within each routine

		Move away from Function.call and Function.apply for init?
			They're slower than regular function calls
			Move them out of the instance, into the constructor
			Instead send the object to init as the first one
				init: function(obj, param1, param2, ...)
				jayus.Entity.prototype.init.apply(this)
				jayus.Entity.init(this)

		Remove the static "events" from the chart
			Move to named ones
			chart.start('Cursor updating');
				chart.start('Displace: #2341');
				chart.end();
			chart.end();
			More flexible, and can reliably track nested events

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

		Allow custom transformation matrices

		Move to new transformation and shape systems!
			Finsh Polygon
			Finish Path

		Fix hit testing:
			More advanced, more options
			Options:
				See paper.js, they seem to have good hit-testing options
				Check stroke width
				Include tolerance
			Return a hitInfo object

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

		Events:
			Touch, Move, Resize
			Collision
				From Box2D?
			More properties on event objects!

		Finalize a decision on where the isClass flags are needed
			Keep only in debug mode?

Future TODO:

		Remove all possible interfaces to the browser
			Such as doing anything with the DOM tree or document
			Keeps it more simpler and modular, can be used with other libraries or outside of usual environment

		Automatically turn display background styling into CSS styling
			Using CSS for the background style can be much more efficient

		Use more enumerations:
			For bounds type, done.
			For dirty types, done.
			For component types, not done.
			For ID's, oblivious to jayus, dev is required to use their own.
			For events, not done, will require much work.
			For path segment identifiers, not too important, a bit of work to do.

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

		Debug Menu

			HUD
			Exposition
				Flesh out the debugRenderer properties
				Give default options for the debugRenderer properties
			Built-in Profiler

			What ImpactJS does:
				Shows map chunks
				Shows entity frame and velocity
				Forms a graph of the following routine times:
					Entity Updates
					Entity Checks & Collisions
					Rendering
					System Lag
	
			Graph routine times:
				Jayus is too flexible to have a set number of routines to analyze like ImpactJS
				Maybe watch for the slowest routines?
				Having the developer choose which routines to watch sounds very annoying
					Plus we already have the Chrome console
				Possible routines to watch:
					jayus.step();
						Updating animated entities
						Ticking running animators
						Step Box2D
						Update Box2D bound entities
						Refreshing displays
					jayus.fire();
					jayus.fireOnFocus();
					jayus.fireOnCursor();

		Prevent key events on unreliable keys
			Many keys(such as the function keys) cannot have their default actions prevented
			Some keys may remain in a sticky state and are thus unreliable, keydown is fired but not keyup
				jayus shouldn't fire these key events

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

		Fix transformations:

			What to do with framing/bounding/intersection/distance on transformed entities?
				Include no transformations on framing and bounds?
					Simple
					Transformations will not likely be used unless for the animation of objects that are already anchored in place
				Keep a boolean flag to transform frames?
	
			Bounding checks on geometric, or on the transformed geometric?
			Possible to elegantly implement both options?
				Keep a flag on each entity:
					+ Only 1 function needs to be kept for each intersection type
					+ Can easily switch between the two for different entities
					+ Many calculations need not be done if the entity isnt transformed
					- Added boolean check for each intersection check
					- Larger code size
	
			DECISION:
				Bounds are up to the Entity and are transformed with the entity
					Usually a Rectangle
				Frame is the axis-aligned rectangle that encompasses the bounds
				Scope is the axis-aligned rectangle that encompasses all rendering

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

		Personal Reminders:

			Inline function calls for speed
			Memoization of globals and deep members for speed, especially in loops
			The "tell" paradigm is much more elegant than "ask-then-act" when traversing,
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
@author Symaxian
@version alpha
@description A nimble, elegant HTML5 canvas scenegraph.
*/

/**
The global jayus object.
@namespace jayus
*/

jayus = {

	//
	//  Properties
	//______________//

	/**
	Whether jayus is runnning or not.
	<br> Do not modify, use jayus.start() and jayus.stop().
	@property {Boolean} running
	*/

	running: false,

	/**
	Whether an upcoming call to jayus.step() is expected.
	<br> Do not modify.
	@property {Boolean} frameIntervalRunning
	*/

	frameIntervalRunning: false,

	/**
	The time(in epoch time) when the previous frame began, used in calculating frames per second.
	@property {Number} lastFrameTime
	*/

	lastFrameTime: 0,

	/**
	The id for the main frame loop interval.
	@property {Number} interval
	*/

	interval: null,

	/**
	Whether to use the requestAnimationFrame function if available.
	<br> If set to false or the requestAnimationFrame function is not available then then jayus will attempt to maintain the framerate found in jayus.framerate.
	@property {Boolean} useReqAnimFrame
	*/

	useReqAnimFrame: true,

	/**
	The desired framerate.
	<br> Default is 60
	@property {Number} framerate
	*/

	framerate: 60,

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

	//#replace jayus.DIRTY.VISIBILITY 1
	//#replace jayus.DIRTY.POSITION 2
	//#replace jayus.DIRTY.SIZE 4
	//#replace jayus.DIRTY.TRANSFORMS 8
	//#replace jayus.DIRTY.CONTENT 16

	DIRTY: {

		VISIBILITY: 1,
		POSITION: 2,
		SIZE: 4,
		TRANSFORMS: 8,
		CONTENT: 16,

		STYLE: 32,

		BACKGROUND: 16,

		FRAME: 6,

		SCOPE: 2+4+8,

		ALL: 127

	},

	//#replace jayus.SHAPES.LIST -1
	//#replace jayus.SHAPES.CUSTOM 0
	//#replace jayus.SHAPES.POINT 1
	//#replace jayus.SHAPES.CIRCLE 2
	//#replace jayus.SHAPES.RECTANGLE 4
	//#replace jayus.SHAPES.POLYGON 8
	//#replace jayus.SHAPES.PATH 16

	/**
	An enumeration of the types that the jayus.intersectTest() method can check against.
	<br> Values are:
		LIST,
		CUSTOM,
		POINT,
		CIRCLE,
		RECTANGLE,
		POLYGON,
		PATH.
	@property {Object} SHAPES
	*/

	SHAPES: {

		LIST: -1,

		CUSTOM: 0,

		POINT: 1,
		CIRCLE: 2,
		RECTANGLE: 4,
		POLYGON: 8,
		PATH: 16

	},

	//
	//  Methods
	//___________//

	/**
	Tests for the intersection of two Entities or Shape objects.
	<br> Each object must have a shapeType property corresponding to one found in jayus.SHAPES.
	@method {Boolean} intersectTest
	*/

	intersectTest: function jayus_intersectTest(a, b){
		var i, temp, ctx, ret,
			at = a.shapeType,
			bt = b.shapeType;
		// Get a's bounds if custom
		while(!at){
			//#ifdef DEBUG
			if(a.getBounds() === a){
				throw new Error('jayus.intersectTest() - a.getBounds() === a, indefinite loop would result');
			}
			//#end
			a = a.getBounds();
			at = a.shapeType;
		}
		// Get b's bounds if custom
		while(!bt){
			//#ifdef DEBUG
			if(b.getBounds() === b){
				throw new Error('jayus.intersectTest() - b.getBounds() === b, indefinite loop would result');
			}
			//#end
			b = b.getBounds();
			bt = b.shapeType;
		}
		// Loop over a if a List
		if(at === jayus.SHAPES.LIST){
			for(i=0;i<a.items.length;i++){
				if(this.intersectTest(a[i], b)){
					return true;
				}
			}
			return false;
		}
		// Loop over b if a List
		if(bt === jayus.SHAPES.LIST){
			for(i=0;i<b.items.length;i++){
				if(this.intersectTest(a, b[i])){
					return true;
				}
			}
			return false;
		}
		// Switch the shapes so the lesser one is always first
		if(at > bt){
			temp = a;
			a = b;
			b = temp;
		}
		// Sum and check the shape types
		switch(a.shapeType+b.shapeType){

			case jayus.SHAPES.POINT + jayus.SHAPES.POINT:
				// Point-Point
				return a.x === b.x && a.y === b.y;

			case jayus.SHAPES.POINT + jayus.SHAPES.CIRCLE:
				// Point-Circle
				return b.intersectsAt(a.x, a.y);
				// return ((a.x-b.x)*(a.x-b.x)) + ((a.y-b.y)*(a.y-b.y)) <= b.radius*b.radius;

			case jayus.SHAPES.CIRCLE + jayus.SHAPES.CIRCLE:
				// Circle-Circle
				// Compare the distances from the centers to the radii
				return ((a.x-b.x)*(a.x-b.x)) + ((a.y-b.y)*(a.y-b.y)) <= (a.radius+b.radius)*(a.radius+b.radius);

			case jayus.SHAPES.POINT + jayus.SHAPES.RECTANGLE:
				// Point-Rectangle
				return b.intersectsAt(a.x, a.y);
				// return (b.x <= a.x && a.x <= b.x+b.width) && (b.y <= a.y && a.y <= b.y+b.height);

			case jayus.SHAPES.CIRCLE + jayus.SHAPES.RECTANGLE:
				// Circle-Rectangle
				var x = Math.abs(a.x - (b.x+b.width/2)),
					y = Math.abs(a.y - (b.y+b.height/2));
				if(x > (b.width/2 + a.radius)){
					return false;
				}
				if(y > (b.height/2 + a.radius)){
					return false;
				}
				if(x <= (b.width/2)){
					return true;
				}
				if(y <= (b.height/2)){
					return true;
				}
				return (x-b.width/2)*(x-b.width/2) + (y-b.height/2)*(y-b.height/2) <= (a.radius*a.radius);

			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.RECTANGLE:
				// Rectangle-Rectangle
				return !((a.x+a.width) < b.x || (a.y+a.height) < b.y || a.x > (b.x+b.width) || a.y > (b.y+b.height));

			case jayus.SHAPES.POINT + jayus.SHAPES.POLYGON:
				// Point-Polygon
				return b.intersectsAt(a.x, a.y);

			case jayus.SHAPES.CIRCLE + jayus.SHAPES.POLYGON:
				// Circle-Polygon
				throw new Error('TODO: Circle intersects Polygon');

			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.POLYGON:
				// Rectangle-Polygon
				throw new Error('TODO: Rectangle intersects Polygon');

			case jayus.SHAPES.POINT + jayus.SHAPES.POLYGON:
				// Polygon-Polygon
				throw new Error('TODO: Polygon intersects Polygon');

			case jayus.SHAPES.POINT + jayus.SHAPES.PATH:
				// Point-Path
				return b.intersectsAt(a.x, a.y);

			case jayus.SHAPES.CIRCLE + jayus.SHAPES.PATH:
				// Circle-Path
				throw new Error('TODO: Circle intersects Path');

			case jayus.SHAPES.RECTANGLE + jayus.SHAPES.PATH:
				// Rectangle-Path
				throw new Error('TODO: Rectangle intersects Path');

			case jayus.SHAPES.POLYGON + jayus.SHAPES.PATH:
				// Polygon-Path
				throw new Error('TODO: Polygon intersects Path');

			case jayus.SHAPES.PATH + jayus.SHAPES.PATH:
				// Path-Path
				throw new Error('TODO: Circle intersects Path');

		}
	},

	/**
	Returns the distance between the points a and b.
	@method {Number} distance
	@param {Point} a
	@param {Point} b
	*/

	distance: function Point_distance(a, b){
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.distance', arguments, 'a', jayus.TYPES.POINT, 'b', jayus.TYPES.POINT);
		//#end
		var x = a.x-b.x,
			y = a.y-b.y;
		return Math.sqrt(x*x + y*y);
	},

		//
		//  Initialization
		//__________________//

	/**
	Returns a shallow copy of the given object.
	@method {Object} copyObject
	@param {Object} src
	*/

	copyObject: function jayus_copyObject(src){
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

	applyObject: function jayus_applyObject(src, dest){
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.applyObject', arguments, 'src', jayus.TYPES.OBJECT, 'dest', jayus.TYPES.OBJECT);
		//#end
		// Copy all the properties onto the destination
		for(var item in src){
			if(src.hasOwnProperty(item)){
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

	createClass: function jayus_createClass(props){
		// Create the constructor function, which just calls the init method
		var constructor = function(){
			this.init.apply(this, arguments);
		};
		//#ifdef DEBUG
		if(typeof jayus.debug.className === 'string'){
			constructor = eval('(function '+jayus.debug.className+'(){this.init.apply(this,arguments);})');
		}
		jayus.debug.className = null;
		//#end
		constructor.prototype = props;
		// Ensure that there is at least a dummy initializer function
		if(typeof constructor.prototype.init !== 'function'){
			constructor.prototype.init = function(){};
		}
		// Add a helper init function for subclasses
		constructor.init = function HelperInit(object, args){
			constructor.prototype.init.apply(object,args);
		};
		// Add the extend method to the constructor
		constructor.extend = jayus.extendMethod;
		// Return the constructor function
		return constructor;
	},

	extendMethod: function jayus_extendMethod(props){
		// Create the constructor function, which just calls the init method
		var constructor = function(){
			this.init.apply(this, arguments);
		};
		//#ifdef DEBUG
		if(typeof jayus.debug.className === 'string'){
			constructor = eval('(function '+jayus.debug.className+'(){this.init.apply(this,arguments);})');
		}
		jayus.debug.className = null;
		//#end
		constructor.prototype = Object.create(this.prototype);
		jayus.applyObject(props, constructor.prototype);
		// Ensure that there is at least a dummy initializer function
		if(typeof constructor.prototype.init !== 'function'){
			constructor.prototype.init = function(){};
		}
		// Create a helper init function for subclasses
		constructor.init = function HelperInit(object, args){
			constructor.prototype.init.apply(object,args);
		};
		// Add the extend method to the constructor
		constructor.extend = jayus.extendMethod;
		// Return the constructor function
		return constructor;
	},

	/**
	Initializes Jayus.
	<br> Note that this method does not start jayus, the display canvas will appear on the page but will be blank until jayus is started.
	<br> Jayus does not need to be running to accept input, input events should be tracked and fired from this point on.
	@method {Self} init
	*/

	init: function jayus_init(){
		// Check if canvas is supported
		var elem = document.createElement('canvas');
		if(!(typeof elem.getContext === 'function' && typeof elem.getContext('2d') === 'object')){
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
		for(var i=0;i<this.colors.displayNames.length;i++){
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

	detectBrowser: function jayus_detectBrowser(){
		var dataBrowser = [
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
		var dataOS = [
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
		var searchString = function(data){
			for(var i=0;i<data.length;i++){
				var dataString = data[i].src;
				var dataProp = data[i].prop;
				verString = data[i].ver || data[i].id;
				if(dataString){
					if(dataString.indexOf(data[i].str) !== -1){
						return data[i].id;
					}
				}
				else if(dataProp){
					return data[i].id;
				}
			}
		};
		var searchVersion = function(dataString){
			var index = dataString.indexOf(verString);
			if(index !== -1){
				return parseFloat(dataString.substring(index+verString.length+1));
			}
		};
		return {
			browser: searchString(dataBrowser) || null,
			version: searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || null,
			OS: searchString(dataOS) || null
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

	start: function jayus_start(){
		if(this.initialized){
			if(!this.running){
				// Set the running flag and start the interval
				this.running = true;
				if(!this.useReqAnimFrame || !this.ua.requestAnimationFrame){
					this.interval = setInterval(jayus.step, 1000/this.framerate);
				}
				// Execute the first step
				if(!this.frameIntervalRunning){
					this.lastFrameTime = Date.now();
					this.frameIntervalRunning = true;
					this.step();
				}
			}
			//#ifdef DEBUG
			else{
				console.warn('jayus.start() - Jayus is already running');
			}
			//#end
		}
		//#ifdef DEBUG
		else{
			console.warn('jayus.start() - Jayus is not initialized');
		}
		//#end
	},

	/**
	Stops jayus.
	<br> Input events are still received and handled.
	@method stop
	*/

	stop: function jayus_stop(){
		if(this.running){
			// Clear the running flag and the interval
			this.running = false;
			clearInterval(this.interval);
		}
		//#ifdef DEBUG
		else{
			console.warn('jayus.stop() - Called when not running');
		}
		//#end
	},

	/**
	Calls the main client function, updates any running animations, and refreshes the displays.
	<br> Procedure:
	<br> - Fire the frame event
	<br> - Update the fps
	<br> - Process any pending events
	<br> - Tick the running animators
	<br> - Step Box2D, if enabled
	<br> - Refresh the displays
	@method step
	*/

	step: function jayus_step(){
		if(jayus.running){
			// If using reqAnimFrame, request the next frame
			if(jayus.useReqAnimFrame && jayus.ua.requestAnimationFrame){
				window.requestAnimationFrame(jayus.step);
			}
			// Get some timing info and update the fps
			var i, item,
				now = Date.now(),
				elapsedMilliSecs = now-jayus.lastFrameTime,
				elapsedSecs = elapsedMilliSecs/1000;
			jayus.fps = 1000/elapsedMilliSecs;
			jayus.lastFrameTime = now;
			// Fire the event
			jayus.frameEventData.elapsed = elapsedSecs;
			if(!jayus.isHandler.frame || !jayus.fire('frame', jayus.frameEventData)){
				//#ifdef DEBUG
				jayus.chart.begin('cursor');
				//#end
				for(i=0;i<jayus.displays.length;i++){
					item = jayus.displays[i];
					if(item.hasPendingMousemoveEvent){
						item.processPendingMousemove();
						item.hasPendingMousemoveEvent = false;
					}
				}
				//#ifdef DEBUG
				jayus.chart.end();
				//#end

				//#ifdef DEBUG
				jayus.chart.begin('animation');
				//#end
				// Update the animators
				for(i=0;i<jayus.animators.length;i++){
					jayus.animators[i].tick(now, elapsedSecs);
				}
				//#ifdef DEBUG
				jayus.chart.end();
				//#end

				// Step Box2D
				if(jayus.box2d.enabled){
					jayus.box2d.step(elapsedSecs);
				}

				// Refresh the displays
				//#ifdef DEBUG
				jayus.chart.begin('render');
				//#end
				for(i=0;i<jayus.displays.length;i++){
					item = jayus.displays[i];
					if(item.dirtied){
						item.refreshBuffer();
					}
				}
				//#ifdef DEBUG
				// Draw Box2D debugging
				if(jayus.box2d.enabled){
					jayus.box2d.drawDebug();
				}
				jayus.chart.end();
				//#end

				//#ifdef DEBUG
				jayus.chart.update();
				//#end

			}
		}
		else{
			jayus.frameIntervalRunning = false;
		}
	},

	//
	//  Debug Panel
	//_______________//

	// TODO: Find better method? Document?
	addDefaultHandlers: function jayus_addDefaultHandlers(){
		jayus.addHandler('keyPress', function(e){
			if(e.key === 'grave' && e.event.ctrlKey){
				if(jayus.chart.isVisible()){
					jayus.chart.hide();
				}
				else{
					jayus.chart.show();
				}
				return true;
			}
		});
		jayus.addHandler('keyPress', function(e){
			if(e.key === 'backslash'){
				lol = Cel.wrappers[0].exportChart();
				document.body.appendChild(lol);
				return true;
			}
		});
	},

	chart: {

		routines: {
			render: {
				description: 'Rendering',
				time: 0,
				color: 'saddlebrown'
			},
			box2d: {
				description: 'Box2D updating',
				time: 0,
				color: 'blue'
			},
			animation: {
				description: 'Animation',
				time: 0,
				color: 'orange'
			},
			cursor: {
				description: 'Cursor events',
				time: 0,
				color: 'Chartreuse'
			}
		},

		routineNameStack: [],
		routineTimeStack: [],
		routineInitStack: [],

		// events: [],
		// timeStamps: [],

		markColor: 'grey',
		markFont: '10px sans-serif',

		display: null,

		graphSurface: null,

		topMS: 40,

		index: 0,

		width: 500,

		height: 380,

		visible: false,

		initialized: false,

		
		windowSize: 120,

		windowIndex: 0,

		barHeight: 20,

		barSpacing: 10,

		routineData: {},		// Data on known routines, see jayus.chart.end() for defaults

		getRoutineColor: function jayus_chart_getRoutineColor(name){
			switch(name){
				case 'render':
					return 'saddlebrown';
				case 'box2d':
					return 'blue';
				case 'cursor':
					return 'Chartreuse';
				case 'animation':
					return 'orange';
			}
			// TODO: jayus.chart.getRoutineColor() - Pick random new random colors
			return 'white';
		},

		begin: function jayus_chart_begin(routine){
			this.routineNameStack.push(routine);
			this.routineTimeStack.push(Date.now());
			this.routineInitStack.push(0);
			// this.events.push(routine);
			// this.timeStamps.push(Date.now());
		},

		end: function jayus_chart_end(){
			var time = Date.now()-this.routineTimeStack.pop(),
				name = this.routineNameStack.pop(),
				inits = this.routineInitStack.pop(),
				data, i;

			if(typeof this.routines[name] !== 'object'){
				this.routines[name] = {
					description: '',
					time: 0,
					color: 'red'
				};
			}

			if(this.initialized){
				data = this.routineData[name];
				if(data === undefined){
					// Create a new data object for the routine
					data = {
						visible: true,
						latencies: [],
						averageLatency: 0,
						inits: [],
						initTotal: 0,
						color: this.getRoutineColor(name),
						bar: new jayus.Scene(0, this.barHeight),
						label: new jayus.Text(name[0].toUpperCase()+name.slice(1), '16px sans-serif', { fill: 'black' }),
						tag: new jayus.Text('', '12px sans-serif', { fill: 'black' })
					};
					data.bar.setBg({ fill: data.color });
					for(i=0;i<this.windowSize;i++){
						data.latencies.push(0);
						data.inits.push(0);
					}
					this.routineData[name] = data;
					this.graph2.children.add(data.bar, data.label, data.tag);
				}

				data.time += time;
				data.latencyTotal -= data.latencies[this.windowIndex];
				data.latencies[this.windowIndex] = time;
				data.inits += inits;

			}

			this.routines[name].time += time;
		},

		tallyInit: function jayus_chart_tallyInit(type){
			this.routineInitStack[this.routineInitStack.length-1]++;
			// this.events.push('Create: '+object);
			// this.timeStamps.push(Date.now());
			// if(typeof this.inits[object] === 'undefined'){
			// 	this.inits[object] = {};
			// }
			// var labels = this.inits[object];
			// if(typeof labels[label] === 'undefined'){
			// 	labels[label] = 1;
			// }
			// else{
			// 	labels[label] += 1;
			// }
		},

		isVisible: function jayus_chart_isVisible(){
			return this.initialized && this.display.visible;
		},

		show: function jayus_chart_show(){

			if(!this.initialized){

				this.vBox = new jayus.vBox();
				this.vBox.setOrigin(2, 0).setSize(this.width, this.height);

				this.topLabel = new jayus.Text('', '13px sans-serif', { fill: '#DDD' });

				this.graph = new jayus.Scene();
				// FIXME: Enable optimized buffering, broken for some reason
				this.graph.setOptimizedBuffering(false);

				this.graph2 = new jayus.Scene().setBg({ fill: 'dimgrey' });
				this.graph2.setOptimizedBuffering(false);

				this.vBox.children.add(this.topLabel, this.graph, this.graph2);

				// Graph

				this.graphSurface = new jayus.Surface(this.graph.width, this.graph.height);

				this.graph.children.add(this.graphSurface);

				this.graph.addHandler('resized', function(){
					// Helper function
					var addLabel = function(ms){
						var y = jayus.chart.graph.height-(ms/jayus.chart.topMS)*jayus.chart.graph.height,
							line = new jayus.PaintedShape(
								new jayus.Polygon.Line(0, Math.floor(y)+0.5, jayus.chart.graph.width, Math.floor(y)+0.5),
								{ stroke: 'dimgrey' }
							),
							text = new jayus.Text(ms+' ms', '10px sans-serif', { fill: 'dimgrey' }).setOrigin(4, y-12);
						jayus.chart.graph.children.
							update(ms+'line', line.setId(ms+'line')).
							update(ms+'text', text.setId(ms+'text'));
					};
					// Add labels for 60 and 30 fps
					addLabel(16);
					addLabel(33);
					// Set the graph height
					jayus.chart.graphSurface.setHeight(this.height);
				});

				this.graph.fire('resized');

				this.display = new jayus.Display(this.width, this.height);
				this.display.children.add(this.vBox);

				var canvas = this.display.canvas,
					beingMoved = false,
					startX, startY;

				canvas.onmousemove = function(e){
					if(beingMoved){
						canvas.style.left = (e.pageX - startX) + 'px';
						canvas.style.top = (e.pageY - startY) + 'px';
					}
				};

				canvas.onmousedown = function(e){
					beingMoved = true;
					startX = e.layerX;
					startY = e.layerY;
				};

				canvas.onmouseup = function(){
					beingMoved = false;
				};

				canvas.style.position = 'absolute';
				canvas.style.border = '#aaa 1px solid';
				canvas.style.backgroundColor = 'black';
				this.display.setCursor('move');

				document.body.appendChild(canvas);

				canvas.style.left = '50px';
				canvas.style.top = '50px';

				this.initialized = true;

			}

			this.display.show();

		},

		hide: function jayus_chart_hide(){
			if(this.initialized){
				this.display.hide();
				this.graphSurface.clear();
				this.index = 0;
			}
		},

		mark: function jayus_chart_mark(text){
			if(this.isVisible()){
				var ctx = this.graphSurface.context,
					metrics = jayus.measureText(text, this.markFont);
				ctx.fillStyle = this.markColor;
				ctx.fillRect(this.index, 0, 1, this.graph.height-0.5);
				ctx.fillText(text, this.index-metrics.width-2, metrics.ascent);
			}
		},

		order: ['render', 'box2d', 'animation', 'cursor'],

		update: function jayus_chart_update(){
			if(this.isVisible()){

				var ctx = this.graphSurface.context,
					y = this.graphSurface.height,
					i,
					routine,
					data,
					width,
					height;

				if(this.routineData.render.time === 0){
					this.routineData.render.time = 1;
				}

				var labelColumnWidth = 0;
				var totalLatency = 0;
				var routineNames = [];

				// Calculate the average routine latencies
				for(routine in this.routineData){
					data = this.routineData[routine];
					routineNames.push(routine);
					data.averageLatency = jayus.math.average(data.latencies);
					totalLatency += data.averageLatency;
					width = data.label.width;
					if(width > labelColumnWidth){
						labelColumnWidth = width;
					}
					data.visible = data.averageLatency > 0;
				}

				labelColumnWidth += 10;

				// Sort the routines, descending
				routineNames.sort(function(a, b){
					return jayus.chart.routineData[a].averageLatency < jayus.chart.routineData[b].averageLatency;
				});

				// Draw the bars
				for(i=0;i<routineNames.length;i++){
					data = this.routineData[routineNames[i]];
					height = Math.floor((data.time/this.topMS)*this.graph.height);
					ctx.fillStyle = data.color;
					ctx.fillRect(this.index, y-height, 1, height-0.5);
					y -= height;
					data.time = 0;
					data.inits = 0;
				}

				// Draw the caret
				ctx.clearRect(this.index+1, 0, 2, this.graph.height);

				this.index++;
				if(this.index === this.graph.width){
					this.index = -1;
				}

				this.topLabel.setText('Framerate: '+(jayus.fps+'').substr(0, 4));

				for(i=0;i<routineNames.length;i++){
					data = this.routineData[routineNames[i]];
					var bar = data.bar;
					var offset = 10+i*(this.barSpacing+this.barHeight);
					if(data.visible){
						bar.setOrigin(labelColumnWidth, offset);
						bar.setWidth(data.averageLatency/totalLatency*(this.graph2.width-labelColumnWidth));

						data.label.setOrigin(5, bar.y+bar.height/2 - data.label.height/2);

						data.tag.setText(Math.round(data.averageLatency)+' ms');
						data.tag.setOrigin(bar.x+bar.width-data.tag.width-10, bar.y+bar.height/2 - data.tag.height/2);
						bar.show();
						data.label.show();
						data.tag.show();
					}
					else{
						bar.hide();
						data.label.hide();
						data.tag.hide();
					}

				}

				this.windowIndex++;
				if(this.windowIndex === this.windowSize){
					this.windowIndex = 0;
				}

				this.graphSurface.dirty(jayus.DIRTY.ALL);

				this.display.refreshBuffer();

			}
		}

	},

		//
		//  Text Utilities
		//__________________//

	/**
	Returns the font descriptor for the specified font.
	@method getFontDescriptor
	@param {String} font
	*/

	getFontDescriptor: function jayus_getFontDescriptor(font){
		//#ifdef DEBUG
		this.debug.match('jayus.getFontDescriptor', font, 'font', jayus.TYPES.STRING);
		//#end
		// Cache the font if needed
		if(!this.isFontCached(font)){
			this.cacheFont(font);
		}
		return this.fontCache[font];
	},

	/**
	Caches the dimensions of text in the specified font for quicker text measuring(and thus rendering).
	@method cacheFont
	@param {String} font
	*/

	cacheFont: function jayus_cacheFont(font){
		//#ifdef DEBUG
		this.debug.match('jayus.cacheFont', font, 'font', jayus.TYPES.STRING);
		//#end
		var i, ctx, charWidths, descriptor;
		// Check that the font isnt already cached
		if(!this.isFontCached(font)){
			// Create the array to store the glyph widths
			charWidths = [];
			// Get a context, save it
			ctx = this.getContext();
			ctx.save();
			// Set the font onto the context
			ctx.font = font;
			// Loop through the character codes to cache each character
			for(i=0;i<this.fontCacheMaxChar+1;i++){
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

	cacheFonts: function jayus_cacheFonts(fonts){
		//#ifdef DEBUG
		this.debug.matchArray('jayus.cacheFonts', fonts, 'fonts', jayus.TYPES.STRING);
		//#end
		for(var i=0;i<fonts.length;i++){
			this.cacheFont(fonts[i]);
		}
	},

	/**
	Returns whether or not the specified font is cached.
	@method {Boolean} isFontCached
	@param {String} font
	*/

	isFontCached: function jayus_isFontCached(font){
		//#ifdef DEBUG
		this.debug.match('jayus.isFontCached', font, 'font', jayus.TYPES.STRING);
		//#end
		// Check that the cache has the font
		return typeof this.fontCache[font] === 'object';
	},

	/**
	Returns an object holding the dimensions of the given text in the given font.
	<br> The font dimensions are cached if not already.
	@method measureText
	@returns {Object}
	@... {Number} width
	@... {Number} height
	@... {Number} ascent
	@... {Number} descent
	@param {String} text
	@param {String} font
	*/

	measureText: function jayus_measureText(text, font){
		return this.measureTextOnto(text, font, {});
	},

	measureTextOnto: function jayus_measureTextOnto(text, font, ret){
		//#ifdef DEBUG
		this.debug.matchArguments('jayus.measureTextOnto', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING, 'ret', jayus.TYPES.OBJECT);
		//#end
		// Ensure the font is cached
		this.cacheFont(font);
		// Get the font descriptor
		var descriptor = jayus.fontCache[font],
			charWidths = descriptor.charWidths,
			i, width = 0;
		// Sum the widths of each character in the text
		for(i=0;i<text.length;i++){
			width += charWidths[text.charCodeAt(i)];
		}
		// Modify and return the ret object
		ret.width = width;
		ret.ascent = descriptor.ascent;
		ret.descent = descriptor.descent;
		ret.height = descriptor.height;
		return ret;
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

	getVerticalFontMetrics: function jayus_getVerticalFontMetrics(font){

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

		addWorld: function jayus_box2d_addWorld(world){
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

		removeWorld: function jayus_box2d_removeWorld(world){
			this.worlds.splice(this.worlds.indexOf(this.world), 1);
		},

		step: function jayus_box2d_step(elapsedSecs){
			//#ifdef DEBUG
			jayus.chart.begin('box2d');
			//#end
			// Step Box2D worlds
			var i, world;
			for(i=0;i<this.worlds.length;i++){
				world = this.worlds[i];
				world.Step(elapsedSecs, this.velocityIterations, this.positionIterations);
				world.ClearForces();
			}
			// Update the entity position from its Box2D body
			for(i=0;i<this.physicalEntities.length;i++){
				this.physicalEntities[i].updateFromBody();
			}
			//#ifdef DEBUG
			jayus.chart.end();
			//#end
		},

		drawDebug: function jayus_box2d_drawDebug(){
			for(var i=0;i<this.worlds.length;i++){
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

	getContext: function jayus_getContext(){
		// Check if a display exists
		if(this.displays.length){
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

		is: function jayus_debug_is(type, v){
			switch(type){
				case jayus.TYPES.DEFINED:
					return typeof v !== 'undefined';
				case jayus.TYPES.BOOLEAN:
					return typeof v === 'boolean';
				case jayus.TYPES.STRING:
					return typeof v === 'string';
				case jayus.TYPES.FUNCTION:
					return typeof v === 'function';
				case jayus.TYPES.NUMBER:
					return typeof v === 'number' && isFinite(v);
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
					return	this.is(jayus.TYPES.POINT, v)
							|| this.is(jayus.TYPES.RECTANGLE, v)
							|| this.is(jayus.TYPES.CIRCLE, v)
							|| this.is(jayus.TYPES.POLYGON, v)
							|| this.is(jayus.TYPES.PATH, v);
				case jayus.TYPES.RECTANGLE:
					return v instanceof jayus.Rectangle || v.isRect;
				case jayus.TYPES.BUFFER:
					// Check if the ImageData constructor is defined
					if(typeof ImageData === 'function'){
						return v instanceof ImageData;
					}
					// Else check that the usual properties are in the object, not foolproof but the best we can do
					return	this.is(jayus.TYPES.OBJECT, v)
							&& this.is(jayus.TYPES.NUMBER, v.width)
							&& this.is(jayus.TYPES.NUMBER, v.height)
							&& this.is(jayus.TYPES.ARRAY, v.data);
				case jayus.TYPES.ANIMATOR:
					return !!v.isAnimator;
				case jayus.TYPES.CANVAS:
					return v instanceof HTMLCanvasElement;
			}
			throw new Error('jayus.debug.is() - Unknown type('+jayus.debug.types[type]+') specified');
		},

		match: function jayus_debug_match(method, value, name, type){
			if(!this.is(type, value)){
				throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' sent, '+jayus.debug.types[type]+' required');
			}
		},

		matchOptional: function jayus_debug_matchOptional(method, value, name, type){
			if(typeof value !== 'undefined' && !this.is(type, value)){
				throw new TypeError(method+'() - Invalid optional parameter '+name+this.toString(value)+' sent, '+jayus.debug.types[type]+' required');
			}
		},

		matchArray: function jayus_debug_matchArray(method, value, name, type){
			if(!this.is(jayus.TYPES.ARRAY, value)){
				throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' sent, Array of '+jayus.debug.types[type]+' required');
			}
			for(var i=0;i<value.length;i++){
				if(!this.is(type, value[i])){
					throw new TypeError(method+'() - Invalid parameter '+name+this.toString(value)+' array sent, element at '+i+'('+value[i]+') is required to be '+jayus.debug.types[type]);
				}
			}
		},

		matchArguments: function jayus_debug_matchArguments(name, args){
			var i, paramName, argValue, paramType;
			for(i=2;i<arguments.length;i+=2){
				argValue = args[i/2-1];
				paramName = arguments[i];
				paramType = arguments[i+1];
				if(!this.is(paramType, argValue)){
					throw new TypeError(name+'() - Invalid '+paramName+this.toString(argValue)+' sent, '+jayus.debug.types[paramType]+' required');
				}
			}
		},

		matchArgumentsAs: function jayus_debug_matchArgumentsAs(name, args, type){
			var i, paramName, argValue;
			for(i=3;i<arguments.length;i++){
				argValue = args[i-3];
				paramName = arguments[i];
				if(!this.is(type, argValue)){
					throw new TypeError(name+'() - Invalid '+paramName+this.toString(argValue)+' sent, '+jayus.debug.types[type]+' required');
				}
			}
		},

		// Quicker methods for often used method signatures

		matchContext: function jayus_debug_matchContext(method, value){
			if(!this.is(jayus.TYPES.CONTEXT, value)){
				throw new TypeError(method+'() - Invalid parameter ctx'+this.toString(value)+' sent, Context required');
			}
		},

		matchCoordinate: function jayus_debug_matchCoordinate(method, x, y){
			if(!this.is(jayus.TYPES.POINT, x) && !this.is(jayus.TYPES.NUMBER, x)){
				throw new TypeError(method+'() - Invalid parameter x'+this.toString(x)+' sent, Point or Number required');
			}
			if(this.is(jayus.TYPES.NUMBER, x) && !this.is(jayus.TYPES.NUMBER, y)){
				throw new TypeError(method+'() - Invalid parameter y'+this.toString(y)+' sent, Number required');
			}
		},

		matchSize: function jayus_debug_matchSize(method, x, y){
			if(!this.is(jayus.TYPES.ENTITY, x) && !this.is(jayus.TYPES.NUMBER, x)){
				throw new TypeError(method+'() - Invalid parameter width'+this.toString(x)+' sent, Entity or Number required');
			}
			if(this.is(jayus.TYPES.NUMBER, x) && !this.is(jayus.TYPES.NUMBER, y)){
				throw new TypeError(method+'() - Invalid parameter height'+this.toString(y)+' sent, Number required');
			}
		},

		matchRectangle: function jayus_debug_matchRectangle(method, a, b, c, d){
			switch(arguments.length){
				case 3:
					return jayus.debug.matchArguments(method, [a,b], 'origin', jayus.TYPES.POINT, 'entity', jayus.TYPES.ENTITY);
				case 4:
					return jayus.debug.matchArguments(method, [a,b,c], 'origin', jayus.TYPES.POINT, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
				case 5:
					return jayus.debug.matchArgumentsAs(method, [a,b,c,d], jayus.TYPES.NUMBER, 'x', 'y', 'width', 'height');
			}
			throw new TypeError(method+'() - Invalid number of arguments sent, 2, 3, or 4 required');
		},

		verifyMethod: function jayus_debug_verifyMethod(object, method){
			this.matchArguments('jayus.debug.verifyMethod', arguments, 'object', jayus.TYPES.OBJECT, 'method', jayus.TYPES.STRING);
			if(!this.is(jayus.TYPES.FUNCTION, object[method])){
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

		toString: function jayus_debug_toString(v){
			switch(typeof v){
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
					if(v === null){
						return '(null)';
					}
					// Check for an array
					if(v instanceof Array){
						return '(Array:['+v+'])';
					}
					// Check for an object that can toString itself
					if(typeof v.toString === 'function'){
						return v.toString();
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

		defaultDebugRenderer: function jayus_debug_defaultDebugRenderer(ctx){

			var item;
			
			ctx.save();

			ctx.lineWidth = 1;

			// Show the origin
			// if(this.isRect){
			// 	ctx.fillStyle = jayus.debug.exposedOriginColor;
			// 	ctx.fillRect(this.x, this.y, 3, 3);
			// }

			// Stroke the bounds
			if(this.shapeType === 0){
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
			if(this.isRect){
				// Stroke the transformed frame
				item = this.getFrame().alignToCanvas();
				item.etchOntoContext(ctx);
				ctx.strokeStyle = jayus.debug.exposedFrameColor;
				ctx.stroke();
				// Stroke the untransformed frame
				if(this.isTransformed){
					ctx.setLineDash(jayus.debug.exposedTransformedDashing);
					item = this.getUnFrame().alignToCanvas();
					ctx.strokeRect(item.x, item.y, item.width, item.height);
				}
			}

			ctx.restore();

		},

		showPoint: function jayus_debug_showPoint(display, x, y, duration){
			if(arguments.length === 3){
				duration = 1000;
			}
			var spec = new jayus.Scene(3, 3);
			spec.setBg({ fill: 'red' });
			spec.setOrigin(x, y);
			spec.animate().setAlpha(0).setDuration(duration).addHandler('finished', function(){
				display.children.remove(spec);
			}).start();
			display.children.add(spec);
		},

		pause: function jayus_debug_pause(){
			var i, display, ctx;
			if(jayus.running){
				// Stop jayus
				jayus.stop();
				// Draw an paused message on each display
				for(i=0;i<jayus.displays.length;i++){
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
			else{
				// Refresh the displays
				for(i=0;i<jayus.displays.length;i++){
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

		randomFrom: function jayus_math_randomFrom(array){
			//#ifdef DEBUG
			jayus.debug.match('jayus.math.randomFrom', array, 'array', jayus.TYPES.ARRAY);
			if(!array.length){
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

		randomBetween: function jayus_util_randomBetween(min, max){
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

		clamp: function jayus_math_clamp(min, num, max){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.clamp', arguments, jayus.TYPES.NUMBER, 'min', 'num', 'max');
			//#end
			if(num < min){
				return min;
			}
			if(num > max){
				return max;
			}
			return num;
		},

		/**
		Returns the smallest number in the sent array.
		@method {Number} min
		@param {Array} numbers
		*/

		min: function jayus_math_min(numbers){
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.min', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length){
				throw new RangeError('jayus.math.min() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			// Keep a variable of the smallest number
			var i, value,
				min = numbers[0];
			// Loop through the numbers
			for(i=1;i<numbers.length;i++){
				value = numbers[i];
				if(value < min){
					min = value;
				}
			}
			return min;
		},

		/**
		Returns the largest number in the sent array.
		@method {Number} max
		@param {Array} numbers
		*/

		max: function jayus_math_max(numbers){
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.max', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length){
				throw new RangeError('jayus.math.max() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			// Keep a variable of the largest number
			var i, value,
				max = numbers[0];
			// Loop through the numbers
			for(i=1;i<numbers.length;i++){
				value = numbers[i];
				if(value > max){
					max = value;
				}
			}
			return max;
		},

		/**
		Returns the average of the numbers in the sent array.
		@method {Number} average
		@param {Array} numbers
		*/

		average: function jayus_math_average(numbers){
			//#ifdef DEBUG
			jayus.debug.matchArray('jayus.math.average', numbers, 'numbers', jayus.TYPES.NUMBER);
			if(!numbers.length){
				throw new RangeError('jayus.math.average() - Invalid numbers sent'+jayus.debug.toString(numbers)+', length of at least 1 required');
			}
			//#end
			var i, total = 0;
			for(i=0;i<numbers.length;i++){
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

		toDegrees: function jayus_math_toDegrees(angle){
			return angle*(180/Math.PI);
		},

		/**
		Converts an angle from degrees to radians.
		@method {Number} toRadians
		@param {Number} angle In degrees
		*/

		toRadians: function jayus_math_toRadians(angle){
			return angle*(Math.PI/180);
		},

		/**
		Flips an angle vertically, across the x axis.
		@method {Number} vFlipAngle
		@param {Number} angle In radians
		*/

		vFlipAngle: function jayus_math_vFlipAngle(angle){
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

		hFlipAngle: function jayus_math_hFlipAngle(angle){
			//#ifdef DEBUG
			jayus.debug.match('jayus.math.hFlipAngle', angle, 'angle', jayus.TYPES.NUMBER);
			//#end
			// Flip the angle horizontally, across the y axis
			angle = Math.PI-angle;
			if(angle < 0){
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

		getCwAngleBetween: function jayus_math_getCwAngleBetween(angle1, angle2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.getCwAngleBetween', arguments, jayus.TYPES.NUMBER, 'angle1', 'angle2');
			//#end
			// Get the cw distance between the angles
			var distance = angle1-angle2;
			// If its less than 0, add 2PI to correct it
			if(distance < 0){
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

		getCcwAngleBetween: function jayus_math_getCcwAngleBetween(angle1, angle2){
			//#ifdef DEBUG
			jayus.debug.matchArgumentsAs('jayus.math.getCcwAngleBetween', arguments, jayus.TYPES.NUMBER, 'angle1', 'angle2');
			//#end
			// Get the ccw distance between the angles
			var distance = angle2-angle1;
			// If its less than 0, add 2PI to correct it
			if(distance < 0){
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

	}

};