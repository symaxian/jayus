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
Defines the jayus.keyboard module.
@file keyboard.js
*/

//
//  jayus.keyboard
//__________________//

/**
The Jayus keyboard module.
@namespace jayus.keyboard
*/

jayus.keyboard = {

	//
	//  Properties
	//______________//

	/**
	Prevents key events from firing unless a jayus display is focused.
	<br> Default is true.
	@property {Boolean} requireFocus
	*/

	requireFocus: true,

	/**
	A set of booleans, whether that key is pressed or not.
	<br> The key id found in jayus.keyboard.keys indexes its state, so that jayus.keyboard.pressed['enter'] would return true, false, or undefined(which should be treated as false).
	<br> The state is set by the onkeydown event and the onkeyup event.
	@property {Object} pressed
	*/

	pressed: {},

	/**
	An array of key identifiers, indexed by the keyCode from the onkeydown and onkeyup events.
	<br> Entries at index's with unknown key id's hold the number 0.
	@property {Array} keys
	*/

	keys: [0,0,0,0,0,0,0,0,'backspace','tab',0,0,0,'enter',0,0,'shift','ctrl','alt','break','capsLock',0,0,0,0,0,0,'escape',0,0,0,0,'space','pageUp','pageDown','end','home','left','up','right','down',0,0,0,0,'insert','delete',0,'0','1','2','3','4','5','6','7','8','9',0,0,0,0,0,0,0,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','leftWin','rightWin','select',0,0,'num0','num1','num2','num3','num4','num5','num6','num7','num8','num9','numMultiply','numAdd',0,'numSubtract','numPeriod','numDivide','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'numLock','scrollLock',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'semicolon','equalSign','comma','dash','period','forwardSlash','grave',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'leftBracket','backslash','rightBracket','quote'],

	//@ Internal
	keyPressEventData: {},

	//@ Internal
	charTypeEventData: {},

	//
	//  Methods
	//___________//

	/**
	Defines the event handlers used to detect keyboard actions.
	<br> The event handlers are defined on the jayus.settings.keyboardEventListener object.
	@method init
	*/

	init: function jayus_keyboard_init(){

		// Add the key down handler
		document.addEventListener('keydown', function jayus_onkeydownHandler(e){
			//#ifdef DEBUG
			// Check to stop jayus on escape key
			if(jayus.debug.pauseOnEscape && e.keyCode === 27){
				jayus.debug.pause();
			}
			//#endif
			// Check if focused
			if(jayus.keyboard.requireFocus && jayus.hasFocus){
				// Get the key id
				var key = jayus.keyboard.keys[e.keyCode],
					data = jayus.keyboard.keyPressEventData;
				data.event = e;
				data.key = key;
				// Check if already pressed
				if(jayus.keyboard.pressed[key]){
					//Fire the keytap event, return true/false to allow/cancel the event
					return !jayus.fire('keyTap', data);
				}
				// Fire the press and tap events, return true/false to allow/cancel the event
				jayus.keyboard.pressed[key] = true;
				var cancel = jayus.fire('keyPress', data) || jayus.fire('keyTap', data);
				if(cancel){
					e.preventDefault();
					return false;
				}
			}

		});

		// Add the key up handler
		document.addEventListener('keyup', function jayus_onkeyupHandler(e){
			// Get the key id and data
			var key = jayus.keyboard.keys[e.keyCode],
				data = jayus.keyboard.keyPressEventData;
			data.event = e;
			data.key = key;
			// Check if pressed
			if(jayus.keyboard.pressed[key]){
				// Fire the depress event, return true/false to allow/cancel the event
				jayus.keyboard.pressed[key] = false;
				if(jayus.fire('keyRelease', data)){
					e.preventDefault();
					return false;
				}
			}
		});

		// Add the key press handler
		document.addEventListener('keypress', function jayus_onkeypressHandler(e){
			// Check if focused
			if(jayus.keyboard.requireFocus && jayus.hasFocus){
				var data = jayus.keyboard.charTypeEventData;
				data.event = e;
				data['char'] = String.fromCharCode(e.charCode);
				// Fire the charType event, return true/false to allow/cancel the event
				if(jayus.fire('charType', data)){
					e.preventDefault();
					return false;
				}
			}
		});

	},

		//
		//  Key State
		//_____________//

	/**
	Returns whether the specified key is currently pressed.
	<br> The specified keyId must be a string found within jayus.keyboard.keys.
	<br> Throws a RangeError when using the debug version and an unknown key id is sent.
	@method {Boolean} isPressed
	@param {String} id
	*/

	isPressed: function jayus_keyboard_isPressed(id){
		//#ifdef DEBUG
		jayus.debug.match('jayus.keyboard.isPressed', id, 'id', jayus.TYPES.STRING);
		if(!this.isKey(id)){
			throw new RangeError('jayus.keyboard.isPressed() - Invalid id'+jayus.debug.toString(id)+' sent, unknown id');
		}
		//#endif
		return !!this.pressed[id];
	},

	/**
	Returns whether or not the specified key id is valid.
	@method {Boolean} isKey
	@param {String} id
	*/

	isKey: function jayus_keyboard_isKey(id){
		//#ifdef DEBUG
		jayus.debug.match('jayus.keyboard.isKey', id, 'id', jayus.TYPES.STRING);
		//#endif
		return this.keys.indexOf(id) >= 0;
	}

};
