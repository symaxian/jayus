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
Defines the Display class.
@file Display.js
*/

//
//  jayus.Display()
//___________________//

/**
A Scene that can be placed onto the page.
@class jayus.Display
@extends jayus.Scene
*/

// Notes:
//		The click events are only fired if the cursor has not moved since the last corresponding press event.
//		This is required to keep click events from being fired after moving across entities, as the browser treats the entire canvas as one element.
//		This is somewhat strict, it would be better to check that it hasn't moved within a certain number, though that doesn't entirely fix the problem of clicks bleeding into or out of entities.
//		A custom system could be implemented that would manually check previous and current entity cursor flags, but this might be slow/unresponsive.

//#ifdef DEBUG
jayus.debug.className = 'Display';
//#endif

jayus.Display = jayus.Scene.extend({

	//
	//  Properties
	//______________//

	buffered: true,

	/**
	The cursor's position within the display.
	<br> Do not replace.
	@property {Point} cursor
	*/

	cursor: new jayus.Point(),

	/**
	* Whether or not to keep the context menu from appearing when the canvas is right clicked on.
	<br> Default is true.
	@property {Boolean} suppressContextMenu
	*/

	suppressContextMenu: true,

	/**
	Whether or not to suppress the user from selecting the canvas element.
	<br> Uses the -webkit-user-select and -moz-user-select CSS attributes.
	<br> Default is true.
	@property {Boolean} suppressSelection
	*/

	suppressSelection: true,

	/**
	Whether or not to delay the processing of mousemove events until actually required.
	<br> Unless your application requires extreme cursor movement tracking accuracy, it is highly recommended to leave this option enabled.
		When enabled, the processing of the native mousemove event is postponed until either the start of the next frame, or when another cursor event is fired(such as a button press).
		Which can result in the a huge reduction of time and garbage spent processing and responding to redundant cursor movement events.
	<br> Default is true.
	@property {Boolean} pendMousemoveEvents
	*/

	pendMousemoveEvents: true,

	/**
	* Whether or not a mousemove event is currently waiting to be processed by jayus.
	<br> Do not modify.
	@property {Boolean} hasPendingMousemoveEvent
	*/

	hasPendingMousemoveEvent: false,

	/**
	* The native event object for the pending mousemove event.
	<br> Do not modify.
	@property {Object} pendingMousemoveEvent
	*/

	pendingMousemoveEvent: null,

	//
	//  Methods
	//___________//

	/**
	Initializes the Display.
	@method init
	@paramset 1
	@paramset 2
	@param {HTMLCanvasElement} canvas
	@paramset 3
	@param {Number} width
	@param {Number} height
	*/

	init: function Display_init(width, height){
		jayus.Entity.prototype.init.apply(this);
		// Create the children list
		this.children = new jayus.List(this);
		//#ifdef DEBUG
		this.children.typeId = jayus.TYPES.ENTITY;
		// Check the arguments
		if(arguments.length){
			if(arguments.length === 1){
				jayus.debug.match('Display.init', width, 'canvas', jayus.TYPES.CANVAS);
			}
			else if(arguments.length === 2){
				jayus.debug.matchArguments('Display.init', arguments, 'width', jayus.TYPES.NUMBER, 'height', jayus.TYPES.NUMBER);
			}
			else{
				throw new TypeError('Display.init() - Invalid number of arguments sent, 0, 1, or 2 required');
			}
		}
		//#endif
		// Check the argument count
		if(arguments.length === 1){
			// Use the sent canvas element
			var canvas = width;
			// Position fix, remove or elaborate
			canvas.parentElement.style.position = 'relative';
		}
		else{
			// Create a new canvas element
			var canvas = document.createElement('canvas');
			// Set the canvas size if specified
			if(arguments.length){
				canvas.width = width;
				canvas.height = height;
			}
		}
		// Set properties
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.context = canvas.getContext('2d');
		// Internal stuff
		jayus.displays.push(this);
		this.hookCursorListeners(this.canvas);
		this.addDefaultHandlers();
	},

	setBuffering: function Display_setBuffering(){},

		//
		//  Size
		//________//

	formContents: function RectEntity_formContents(width, height){
		this.canvas.width = width;
		this.canvas.height = height;
		this.redrawAll = true;
		this.dirty(jayus.DIRTY.SIZE);
	},

	processPendingMousemove: function Display_processPendingMousemove(e){
		this.hasPendingMousemoveEvent = false;
		return this.processMousemove(this.pendingMousemoveEvent);
	},

	processMousemove: function Display_processMousemove(e){
		// Grab if new
		// This is performed on every event so that the display "has" the cursor if the first action is not mousemove
		if(!this.underCursor){
			this.underCursor = true;
			this.fire('cursorOver');
		}
		// Get the mouse position within the canvas, create the event object
		var x = e.offsetX === undefined ? e.layerX : e.offsetX,
			y = e.offsetY === undefined ? e.layerY : e.offsetY,
			data = {
				display: this,
				event: e,
				x: x,
				y: y,
				deltaX: x-this.cursor.x,
				deltaY: y-this.cursor.y
			};
		// Update the cursor property
		this.cursor.x = x;
		this.cursor.y = y;
		if(this.cursor.dependentCount){
			this.cursor.dirty(jayus.DIRTY.POSITION);
		}
		// Fire the cursorMove event on children under the cursor, then on the display unless accepted
		if(!this.fireOnCursor('cursorMove', data)){
			this.fire('cursorMove', data);
		}
		// Check to fire the drag events
		// for(var i=0;i<3;i++){
		// 	var buttonName = ['left','middle','right'][i];
		// 	if(jayus[buttonName+'Down']){
		// 		// Fire on jayus then the display if not accepted
		// 		if(!jayus.fire(buttonName+'Drag', data)){
		// 			display.fireOnCursor(buttonName+'Drag', data);
		// 		}
		// 	}
		// }
		// Update the cursor on the entire scenegraph
		this.startCursorUpdate();
	},

	hookCursorListeners: function Display_hookCursorListeners(canvas){

		var display = this,

			// Keep and reuse a single event data object for button events
			// To keep from re-allocating a new one for every event
			cursorEventObject = {
				event: null,
				display: display,
				x: null,
				y: null
			},

			// Keep and reuse a single event data object for scroll events as well
			// To keep from re-allocating a new one for every event
			scrollEventObject = {
				event: null,
				display: display,
				x: null,
				y: null,
				scroll: null,
				xScroll: null,
				yScroll: null
			},

			// Refreshes the properties on the button event object from a native event object
			updateCursorEventObject = function(e){
				cursorEventObject.event = e;
				cursorEventObject.x = e.offsetX === undefined ? e.layerX : e.offsetX;
				cursorEventObject.y = e.offsetY === undefined ? e.layerY : e.offsetY;
			},

			// Refreshes the properties on the scroll event object from a native event object
			updateScrollEventObject = function(e, scroll, xScroll, yScroll){
				scrollEventObject.event = e;
				scrollEventObject.x = e.offsetX === undefined ? e.layerX : e.offsetX;
				scrollEventObject.y = e.offsetY === undefined ? e.layerY : e.offsetY;
				scrollEventObject.scroll = scroll;
				scrollEventObject.xScroll = xScroll;
				scrollEventObject.yScroll = yScroll;
			},

			getButtonName = function(e){
				if(e.button === 0){
					return 'left';
				}
				if(e.button === 1){
					return 'middle';
				}
				if(e.button === 2){
					return 'right';
				}
				return 'unknown';
			},

			mousemoveHandler = function Display_mousemoveHandler(e){
				// Check to defer the event
				if(display.pendMousemoveEvents){
					display.pendingMousemoveEvent = e;
					display.hasPendingMousemoveEvent = true;
				}
				else{
					display.processMousemove(e);
				}
			},

			mouseoutHandler = function Display_mouseoutHandler(e){
				// Process any pending events
				display.processPendingMousemove();
				// Release any pressed buttons
				updateCursorEventObject(e);
				for(var i=0, buttonName;i<3;i++){
					buttonName = getButtonName(i);
					if(jayus[buttonName+'Down']){
						jayus[buttonName+'Down'] = false;
						// Fire on jayus then the display
						jayus.fire(buttonName+'Release', cursorEventObject);
						display.fireOnCursor(buttonName+'Release', cursorEventObject);
					}
				}
				// Leave the focused entity
				if(jayus.cursorFocus !== null){
					jayus.cursorFocus.fire('cursorLeave');
					jayus.cursorFocus = null;
				}
				// Update the display cursor flags
				display.underCursor = false;
				display.fire('cursorOut');
				display.removeCursorFromChildren();
			};

		// mousemove » cursorMove
		canvas.addEventListener('mousemove', mousemoveHandler);

		// mouseout » cursorOut
		canvas.addEventListener('mouseleave', mouseoutHandler);

		// Disable user selection on the canvas
		if(this.suppressSelection){
			canvas.style.webkitUserSelect = 'none';
			canvas.style.mozUserSelect = 'none';
			canvas.onselectstart = function(){
				return false;
			};
		}

		canvas.addEventListener('focus', function(e){
			display.fire('focused', {
				event: e,
				display: display
			});
			display.focused = true;
			jayus.focusedDisplay = display;
			jayus.hasFocus = true;
		});

		canvas.addEventListener('blur', function(e){
			display.fire('blurred', {
				event: e,
				display: display
			});
			display.focused = false;
			jayus.focusedDisplay = null;
			jayus.hasFocus = false;
		});

		canvas.setAttribute('tabindex', '1');
		canvas.style.outline = 0;

		// onmousedown » leftPress, middlePress, rightPress
		canvas.addEventListener('mousedown', function Display_mousedownHandler(e){
			// Process any pending events
			if(display.hasPendingMousemoveEvent){
				display.processPendingMousemove();
			}
			// Focus
			display.focus();
			// Grab if new
			if(!display.underCursor){
				display.underCursor = true;
				display.fire('cursorOver');
			}
			// Update the event object
			updateCursorEventObject(e);
			var buttonName = getButtonName(e),
				eventName = buttonName+'Press';
			// Set the button property on jayus
			jayus[buttonName+'Down'] = true;
			// Until cancelled, fire on jayus, then the display's children, then the display
			if(jayus.fire(eventName, cursorEventObject) || display.fireOnCursor(eventName, cursorEventObject) || display.fire(eventName, cursorEventObject)){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});

		// mouseup » leftRelease, middleRelease, rightRelease
		canvas.addEventListener('mouseup', function Display_mouseupHandler(e){
			// Process any pending events
			if(display.hasPendingMousemoveEvent){
				display.processPendingMousemove();
			}
			// Update the event object
			updateCursorEventObject(e);
			var buttonName = getButtonName(e),
				eventName = buttonName+'Release';
			// Set the button property on jayus
			jayus[buttonName+'Down'] = false;
			// Fire on jayus then the display
			jayus.fire(eventName, cursorEventObject);
			display.fireOnCursor(eventName, cursorEventObject);
			display.fire(eventName, cursorEventObject);
		});

		// click » leftClick, middleClick, rightClick
		canvas.addEventListener('click', function Display_clickHandler(e){
			// Process any pending events
			if(display.hasPendingMousemoveEvent){
				display.processPendingMousemove();
			}
			// Grab if new
			if(!display.underCursor){
				display.canvas.focus();
				display.underCursor = true;
				display.fire('cursorOver');
			}
			// Get the event object and button name
			updateCursorEventObject(e);
			var buttonName = getButtonName(e);
			// Fire on jayus then the display if not accepted
			if(!jayus.fire(buttonName+'Click', cursorEventObject)){
				if(!display.fireOnCursor(buttonName+'Click', cursorEventObject)){
					display.fire(buttonName+'Click', cursorEventObject);
				}
			}
		});

		// dblclick » leftDoubleClick, middleDoubleClick, rightDoubleClick
		canvas.addEventListener('dblclick', function Display_dblclickHandler(e){
			// Process any pending events
			if(display.hasPendingMousemoveEvent){
				display.processPendingMousemove();
			}
			// Grab if new
			if(!display.underCursor){
				display.underCursor = true;
				display.fire('cursorOver');
			}
			// Get the event object and button name
			updateCursorEventObject(e);
			var buttonName = getButtonName(e);
			// Until cancelled, fire on jayus, then the display's children, then the display
			if(!jayus.fire(buttonName+'DoubleClick', cursorEventObject)){
				if(!display.fireOnCursor(buttonName+'DoubleClick', cursorEventObject)){
					display.fire(buttonName+'DoubleClick', cursorEventObject);
				}
			}

		});

		// contextmenu
		canvas.addEventListener('contextmenu', function Display_contextmenuHandler(e){
			if(display.suppressContextMenu){
				e.preventDefault();
			}
		});

		// mousewheel
		if(jayus.ua.browser === 'Firefox'){
			// For Firefox
			canvas.addEventListener('wheel', function Display_DOMMouseScrollHandler(e){
				// Process any pending events
				if(display.hasPendingMousemoveEvent){
					display.processPendingMousemove();
				}
				// Grab if new
				if(!display.underCursor){
					display.underCursor = true;
					display.fire('cursorOver');
				}
				// Construct the event object
				// Firefox sends *3
				// updateScrollEventObject(e, e.detail/3, e.detail/3, e.detail/3);
				updateScrollEventObject(e, NaN, e.deltaX, e.deltaY);
				// Fire on jayus, then the display's children, then the display
				if(jayus.fire('scroll', scrollEventObject) || display.fireOnCursor('scroll', scrollEventObject) || display.fire('scroll', scrollEventObject)){
					e.preventDefault();
				}
			});
		}
		else if(jayus.ua.browser === 'IE'){
			// For IE
			canvas.onmousewheel = function Display_onmousewheelHandler(e){
				// Process any pending events
				if(display.hasPendingMousemoveEvent){
					display.processPendingMousemove();
				}
				// Grab if new
				if(!display.underCursor){
					display.underCursor = true;
					display.fire('cursorOver');
				}
				// Construct the event object
				updateScrollEventObject(e, e.wheelDelta ,e.wheelDeltaX, e.wheelDeltaY);
				// Fire on jayus, then the display's children, then the display
				if(jayus.fire('scroll', scrollEventObject) || display.fireOnCursor('scroll', scrollEventObject) || display.fire('scroll', scrollEventObject)){
					return false;
				}
			};
		}
		else{
			// For Opera & Chrome
			canvas.addEventListener('mousewheel', function Display_mousewheelHandler(e){
				// Process any pending events
				if(display.hasPendingMousemoveEvent){
					display.processPendingMousemove();
				}
				// Grab if new
				if(!display.underCursor){
					display.underCursor = true;
					display.fire('cursorOver');
				}
				// Construct the event object
				// Chrome sends ±120, Opera?
				updateScrollEventObject(e, -e.wheelDelta/120, e.wheelDeltaX/120, -e.wheelDeltaY/120);
				// Fire on jayus, then the display's children, then the display
				if(jayus.fire('scroll', scrollEventObject) || display.fireOnCursor('scroll', scrollEventObject) || display.fire('scroll', scrollEventObject)){
					e.preventDefault();
				}
			});
		}

	},

	addDefaultHandlers: function Display_addDefaultHandlers(){
		//#ifdef DEBUG
		var display = this;
		jayus.addHandler('keyPress', function(e){
			if(display.underCursor && e.key === 'grave'){
				var i, target,
					targets = display.getChildrenUnderCursor();
				if(targets.length === 0){
					targets.push(display);
				}
				for(i=0;i<targets.length;i++){
					target = targets[i];
					if(e.event.shiftKey){
						if(target.exposingAll){
							target.exposeAll();
						}
						else{
							target.unexposeAll();
						}
					}
					else{
						if(target.debugRenderer === null){
							target.expose();
						}
						else{
							target.unexpose();
						}
					}
				}
			}
		});
		//#endif
	},

	startCursorUpdate: function Display_startCursorUpdate(){
		var acceptor;
		if(this.underCursor && this.propagateCursor){
			this.updateCursorOnChildren(this.cursor.x, this.cursor.y);
			acceptor = this.findCursorAcceptor();
			this.cursorFocus = acceptor;
			if(jayus.cursorFocus !== acceptor){
				if(jayus.cursorFocus === null || jayus.cursorFocus.canReleaseCursor){
					if(jayus.cursorFocus !== null){
						jayus.cursorFocus.fire('cursorLeave');
					}
					if(acceptor !== null){
						acceptor.fire('cursorEnter');
					}
					jayus.cursorFocus = acceptor;
				}
			}
		}
	},

	getTopCanvas: function Display_getTopCanvas(){
		return this.hasOverlay ? this.overlayCanvas : this.canvas;
	},

		//
		//  Overlay
		//___________//

	showDamage: false,

	hasOverlay: false,

	overlayCanvas: null,

	overlayContext: null,

	overlayFadeAnimator: null,

	initOverlay: function Display_initOverlay(){
		if(this.showDamage && !this.hasOverlay){
			var canvas = document.createElement('canvas');
			canvas.width = this.width;
			canvas.height = this.height;
			canvas.style.position = 'absolute';
			canvas.style.left = this.canvas.offsetLeft;
			canvas.style.top = this.canvas.offsetTop;
			canvas.style.opacity = '0.5';
			this.overlayCanvas = canvas;
			this.overlayContext = canvas.getContext('2d');
			this.overlayContext.lineWidth = 4;
			this.canvas.parentElement.appendChild(this.overlayCanvas);
			this.hasOverlay = true;
			this.hookCursorListeners(canvas);
			// Create the fade animator
			this.overlayFadeAnimator = new jayus.Animator(function update(pos){
				canvas.style.opacity = 0.5 - 0.5*pos;
			}).setDuration(500);
		}
	},

	clearDamage: function Display_clearDamage(){
		if(this.showDamage){
			this.initOverlay();
			var ctx = this.overlayContext;
			// Clear the canvas
			ctx.clearRect(0, 0, this.width, this.height);
		}
	},

	paintDamage: function Display_paintDamage(rect){
		this.paintOverlayRect(rect, 'red');
	},

	paintRedraw: function Display_paintRedraw(rect){
		this.paintOverlayRect(rect, 'yellow');
	},

	paintOverlayRect: function Display_paintOverlayRect(rect, color){
		if(this.showDamage){
			this.initOverlay();
			var ctx = this.overlayContext;
			// Draw the region
			ctx.fillStyle = color;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
			// Fade it out
			this.overlayCanvas.style.opacity = '0.5';
			this.overlayFadeAnimator.start();
		}
	},

		//
		//  Page Stuff
		//______________//

	//@ From Entity
	setVisible: function Display_setVisible(on){
		//#ifdef DEBUG
		jayus.debug.match('Display.setVisible', on, 'on', jayus.TYPES.BOOLEAN);
		//#endif
		this.visible = on;
		if(on){
			this.canvas.style.visibility = '';
		}
		else{
			this.canvas.style.visibility = 'hidden';
		}
		return this;
	},

	//@ From Entity
	setAlpha: function Display_setAlpha(alpha){
		//#ifdef DEBUG
		jayus.debug.match('Display.setAlpha', alpha, 'alpha', jayus.TYPES.NUMBER);
		//#endif
		// Check if animated
		if(this.actionsToAnimate){
			// Clear the animate flag and return the animator
			this.actionsToAnimate--;
			return new jayus.MethodAnimator(this, this.setAlpha, this.alpha, alpha);
		}
		// Set the alpha
		if(this.alpha !== alpha){
			this.alpha = alpha;
			this.canvas.style.opacity = alpha;
		}
		return this;
	},

	/**
	Sets the HTMLElement holding the display.
	Sets the positioning of the element as relative.
	@method {Self} setInto
	@param {HTMLElement} element
	*/

	setInto: function Display_setInto(element){
		// ???
		element.style.position = 'relative';
		// Append the canvas if visible
		if(this.visible){
			element.appendChild(this.canvas);
		}
		return this;
	},

	/**
	Focuses the canvas element.
	@method {Self} focus
	*/

	focus: function Display_focus(){
		this.canvas.focus();
		return this;
	},

	/**
	Blurs the canvas element.
	@method {Self} blur
	*/

	blur: function Display_blur(){
		this.canvas.blur();
		return this;
	},

	//
	//  FullScreen
	//______________//

	/**
	Returns whether the display is currently full-screened or not.
	@method {Boolean} isFullScreen
	*/

	isFullScreen: function Display_isFullScreen(){
		return (
			document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullScreenEnabled
		) && this.canvas ===
			(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullScreenElement);
	},

	/**
	Requests that the display be fullscreened.
	<br> Returns whether successful or not.
	<br> Some browsers will not allow a script to fullscreen an element unless executed by a user triggered event, such as a key press or mouse click.
	@method {Boolean} requestFullScreen
	*/

	requestFullScreen: function Display_requestFullScreen(){
		var canvas = this.canvas;
		if(canvas.requestFullScreen){
			canvas.requestFullScreen();
		}
		else if(canvas.mozRequestFullScreen){
			canvas.mozRequestFullScreen();
		}
		else if(canvas.webkitRequestFullScreen){
			canvas.webkitRequestFullScreen();
		}
		return this.isFullScreen();
	},

	/**
	Cancels the fullscreen status of the display.
	@method {Self} cancelFullScreen
	*/

	cancelFullScreen: function Display_cancelFullScreen(){
		if(document.cancelFullScreen){
			document.cancelFullScreen();
		}
		else if(document.mozCancelFullScreen){
			document.mozCancelFullScreen();
		}
		else if(document.webkitCancelFullScreen){
			document.webkitCancelFullScreen();
		}
		return this;
	},

		//
		//  Cursor
		//__________//

	// FIXME: Cursor's on Displays

	/**
	Returns the current cursor.
	<br> Returns the CSS cursor name or the surface if a custom icon is set.
	@method {String|Entity} getCursor
	*/

	getCursor: function Display_getCursor(){
		return this.customIcon ? this.customCursor : this.getTopCanvas().style.cursor;
	},

	/**
	Sets the cursor icon.
	@method {Self} setCursor
	@paramset Using a CSS cursor name
	@param {String} cursor
	@paramset Using an entity
	@param {Entity} entity
	*/

	setCursor: function Display_setCursor(cursor){
		if(typeof cursor === 'string'){
			//#ifdef DEBUG
			jayus.debug.match('Display.setCursor', cursor, 'cursor', jayus.TYPES.STRING);
			//#endif
			// Set the cursor
			this.getTopCanvas().style.cursor = cursor;
			this.hasCustomCursor = false;
		}
		else{
			//#ifdef DEBUG
			jayus.debug.match('Display.setCursor', cursor, 'cursor', jayus.TYPES.ENTITY);
			//#endif
			// Remove the cursor icon
			this.getTopCanvas().style.cursor = 'none';
			// Set the custom icon flag and cursor
			this.hasCustomCursor = true;
			this.customCursor = cursor;
		}
		return this;
	},

	/**
	Resets the cursor icon.
	@method resetCursor
	*/

	resetCursor: function Display_resetCursor(){
		// Reset the cursor
		this.getTopCanvas().style.cursor = '';
		this.hasCustomCursor = false;
		this.customCursor = null;
	}

});
