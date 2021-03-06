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
Defines the Frame entity.
@file Frame.js
*/

//
//  jayus.Frame()
//________________//

/**
Allows a framed entity to be dragged and resized with the cursor.
@class jayus.EditableFrame
@extends jayus.Frame
*/

jayus.EditableFrame = jayus.Frame.extend({

	//
	//  Properties
	//______________//

		//
		//  Size
		//________//

	/**
	The maximum width of the child.
	<br> Default is Infinity.
	@property {Number} maxWidth
	*/

	maxWidth: Infinity,

	/**
	The maximum height of the child.
	<br> Default is Infinity.
	@property {Number} maxHeight
	*/

	maxHeight: Infinity,

	flexible: true,

		//
		//  Handles
		//___________//

	/**
	A set of integers denoting enabled resize handles.
	<br> The handles(property keys) are nw, n, ne, e, se, s, sw, and w.
	<br> Default is 1 for every handle.
	@property {Object} enabledHandles
	*/

	enabledHandles: {
		nw: 1,
		n: 1,
		ne: 1,
		e: 1,
		se: 1,
		s: 1,
		sw: 1,
		w: 1
	},

	/**
	The distance needed to brag a corner handle.
	<br> Default is 6
	@property {Number} cornerThreshold
	*/

	cornerThreshold: 6,

	/**
	The distance needed to grab an edge handle.
	<br> Default is 5
	@property {Number} edgeThreshold
	*/

	edgeThreshold: 5,

		// Temporary variables

	state: '',

	display: null,

	//
	//  Methods
	//___________//

		//
		//  Initiation
		//______________//

	/**
	Initiates the frame.
	@constructor EditableFrame
	@param {Entity} child
	*/

	init: function EditableFrame(child) {
		jayus.Frame.prototype.init.call(this, child);

		this.addHandler('cursorMove', function(e) {
			// Check if not currently dragging something
			if(!this.dragging) {
				this.state = '';
				// Save which display is used
				var cursor = e.display.cursor,
					varWidth = this.child.hasFlexibleWidth,
					varHeight = this.child.hasFlexibleHeight;
				// Check the distance to the corners
				if(varWidth && varHeight) {
					if(this.enabledHandles.nw && jayus.distance(this.getPosAt(0, 0), cursor) < this.cornerThreshold) {
						this.state = 'nw';
					}
					else if(this.enabledHandles.ne && jayus.distance(this.getPosAt(1, 0), cursor) < this.cornerThreshold) {
						this.state = 'ne';
					}
					else if(this.enabledHandles.sw && jayus.distance(this.getPosAt(0, 1), cursor) < this.cornerThreshold) {
						this.state = 'sw';
					}
					else if(this.enabledHandles.se && jayus.distance(this.getPosAt(1, 1), cursor) < this.cornerThreshold) {
						this.state = 'se';
					}
				}
				// Check the distance to the edges
				if(this.state === '' && varWidth) {
					if(this.enabledHandles.w && Math.abs(this.x-e.x) < this.edgeThreshold) {
						this.state = 'w';
					}
					else if(this.enabledHandles.e && Math.abs((this.x+this.width)-e.x) < this.edgeThreshold) {
						this.state = 'e';
					}
				}
				if(this.state === '' && varHeight) {
					if(this.enabledHandles.n && Math.abs(this.y-e.y) < this.edgeThreshold) {
						this.state = 'n';
					}
					else if(this.enabledHandles.s && Math.abs((this.y+this.height)-e.y) < this.edgeThreshold) {
						this.state = 's';
					}
				}
				// Set the cursor on the display if by a handle
				if(this.state !== '') {
					this.parentDisplay.setCursor(this.state+'-resize');
				}
				else {
					this.parentDisplay.resetCursor();
				}
			}
		});

		this.addHandler('cursorOut', function(e) {
			// Unless were dragging something, reset the cursor and state
			if(!this.dragging) {
				this.parentDisplay.resetCursor();
				this.state = '';
			}
		});

		this.addHandler('leftPress', function(e) {

			// The left mouse button was pressed, start dragging
			this.dragging = true;

			// Set the move cursor if we're not at a handle
			if(this.state === '') {
				this.parentDisplay.setCursor('move');
				this.fire('dragStart');
			}
			// Else save the position of the frame at the anchor point for the resize
			else if(this.state === 'nw') {
				this.start = this.getPosAt(1, 1);
			}
			else if(this.state === 'n' || this.state === 'e' || this.state === 'ne') {
				this.start = this.getPosAt(0, 1);
			}
			else if(this.state === 'sw' || this.state === 'w') {
				this.start = this.getPosAt(1, 0);
			}
			else if(this.state === 's' || this.state === 'se') {
				this.start = this.getPosAt(0, 0);
			}

			var that = this;

			// Clear the dragging flag if the button is released
			jayus.addHandler('leftRelease', function(data, options) {
				that.dragging = false;
				if(that.state === '') {
					that.fire('dragEnd');
					that.parentDisplay.resetCursor();
				}
				options.remove = true;
			});

			// 
			var dragHandler = function(e, options) {
				if(that.dragging) {
					if(that.state === '') {
						that.translate(e.deltaX, e.deltaY);
					}
					else {

						// Some vars, the new size, and the anchor point
						var width = null,
							height = null,
							anchorX = 0,
							anchorY = 0;

						// Discern the anchor point and new dimension from the handle point
						if(that.state === 'nw') {
							anchorX = 1;
							anchorY = 1;
							width = that.start.x-e.x;
							height = that.start.y-e.y;
						}
						else if(that.state === 'n') {
							anchorY = 1;
							height = that.start.y-e.y;
						}
						else if(that.state === 'ne') {
							anchorY = 1;
							width = e.x-that.start.x;
							height = that.start.y-e.y;
						}
						else if(that.state === 'sw') {
							anchorX = 1;
							width = that.start.x-e.x;
							height = e.y-that.start.y;
						}
						else if(that.state === 's') {
							height = e.y-that.start.y;
						}
						else if(that.state === 'se') {
							width = e.x-that.start.x;
							height = e.y-that.start.y;
						}
						else if(that.state === 'e') {
							width = e.x-that.start.x;
						}
						else if(that.state === 'w') {
							anchorX = 1;
							width = that.start.x-e.x;
						}

						// Get the position at the anchor point
						var pos = that.getPosAt(anchorX, anchorY);

						if(width !== null) {
							// Clamp the width to the min/max values
							if(width < that.minWidth) {
								width = that.minWidth;
							}
							else if(width > that.maxWidth) {
								width = that.maxWidth;
							}
						}

						if(height !== null) {
							// Clamp the height to the min/max values
							if(height < that.minHeight) {
								height = that.minHeight;
							}
							else if(height > that.maxHeight) {
								height = that.maxHeight;
							}
						}

						if(width !== null && height !== null) {
							that.setSize(width, height);
							width = that.width;
						}
						else if(height === null) {
							that.setWidth(width);
						}
						else {
							that.setHeight(height);
						}

						// Reposition the entity
						that.setPosAt(pos, anchorX, anchorY);

					}
					// Accept the event
					return true;
				}
				// Were no longer dragging, remove this handler
				options.remove = true;

			};
			e.display.addHandler('cursorMove', dragHandler);
			return true;
		});

	},

		//
		//  Minimum Size
		//________________//

	/**
	Sets the minimum size of the child of the frame.
	@method {Self} setMinimumSize
	@param {Number} width
	@param {Number} height
	*/

	setMinimumSize: function EditableFrame_setMinimumSize(width, height) {
		//#ifdef DEBUG
		jayus.debug.matchArgumentsAs('EditableFrame.setMinimumSize', arguments, jayus.TYPES.NUMBER, 'width', 'height');
		//#end
		this.minW = width;
		this.minH = height;
		return this;
	}

});