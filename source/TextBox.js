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
Defines the TextBox entity.
@file TextBox.js
*/

//
//  jayus.TextBox
//_________________//

/**
Represents multiple lines of text with word wrapping.
@class jayus.TextBox
@extends jayus.Text
*/

jayus.TextBox = jayus.Text.extend({

	//#ifdef DEBUG

	hasFlexibleWidth: true,

	hasFlexibleHeight: true,

	//#end

	//
	//  Methods
	//___________//

	init: function TextBox(text, font, brush) {
		// Call the entity's init method
		jayus.Entity.prototype.init.apply(this);
		// Init some derived properties
		this.fontDesc = jayus.getFontDescriptor(this.font);
		this.lines = [];
		this.lineWidths = [];
		//#ifdef DEBUG
		// Check the arguments
		if(arguments.length === 1) {
			jayus.debug.match('Text', text, 'text', jayus.TYPES.STRING);
		}
		else if(arguments.length === 2) {
			jayus.debug.matchArguments('Text', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING);
		}
		else if(arguments.length === 3) {
			jayus.debug.matchArguments('Text', arguments, 'text', jayus.TYPES.STRING, 'font', jayus.TYPES.STRING, 'brush', jayus.TYPES.OBJECT);
		}
		//#end
		// Set the properties
		if(arguments.length) {
			this.ignoreDirty++;
			this.setText(text);
			if(arguments.length > 1) {
				this.setFont(font);
				if(arguments.length > 2) {
					this.setBrush(brush);
				}
			}
			this.ignoreDirty--;
		}
		this.words = this.divideText(this.text);
		this.refreshMetrics();
		this.addHandler('dirty', function(type) {
			if(type & jayus.DIRTY.SIZE) {
				this.refreshMetrics();
			}
		});
	},

		//
		//  Frame
		//_________//

	//@From jayus.Text
	setText: function TextBox_setText(text) {
		//#ifdef DEBUG
		jayus.debug.match('TextBox.setText', text, 'text', jayus.TYPES.STRING);
		//#end
		// Check that the text is different
		if(this.text !== text) {
			// Set the text
			this.text = text;
			this.words = this.divideText(this.text);
			this.refreshMetrics();
			this.dirty(jayus.DIRTY.CONTENT);
		}
		return this;
	},

	divideText: function TextBox_divideText(str) {
		var i, c,
			out = [],
			curr = '';
		for(i=0;i<str.length;i++) {
			c = str[i];
			if(c === ' ' || c === '\n') {
				out.push(curr, c);
				curr = '';
			}
			else {
				curr += c;
			}
		}
		out.push(curr);
		return out;
	},

	refreshMetrics: function TextBox_refreshMetrics() {

		var font = this.font,
			lines = [],
			lineWidths = [],
			words = this.words,
			i = 0,
			currentLine, currentLineLength, nextWord, nextWordLength,
			minW = 0;

		while(i !== words.length) {

			currentLine = '';
			currentLineLength = 0;

			nextWord = words[i];
			if(nextWord === ' ' || nextWord === '\n') {
				nextWordLength = 0;
			}
			else {
				nextWordLength = jayus.getTextWidth(nextWord, font);
			}

			do {

				if(nextWord === '\n') {
					i++;
					break;
				}

				// console.log(nextWord+' - '+nextWordLength);

				currentLine += nextWord;
				currentLineLength += nextWordLength;

				i++;

				if(i === words.length) {
					break;
				}

				nextWord = words[i];
				nextWordLength = jayus.getTextWidth(nextWord, font);

				if(nextWordLength > minW) {
					minW = nextWordLength;
				}

			} while(currentLineLength+nextWordLength < this.width);

			// console.log('LINE: '+currentLine+' - '+currentLineLength);

			// if(currentLine !== '\n') {
				// currentLine = currentLine.trim();
			// }

			while(currentLine[0] === ' ' || currentLine[0] === '\n') {
				currentLine = currentLine.substr(1);
			}
			// if(currentLine.length) {
				// if(currentLine[0] === '\n') {
				// 	currentLine = '';
				// }
				lines.push(currentLine);
				lineWidths.push(currentLineLength);
			// }

		}

		this.minWidth = minW;

		this.lines = lines;
		this.lineWidths = lineWidths;

	}

});
