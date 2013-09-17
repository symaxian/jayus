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

//#ifdef DEBUG
jayus.debug.className = 'TextBox';
//#endif

jayus.TextBox = jayus.Text.extend({

	//
	//  Methods
	//___________//

	hasFlexibleWidth: function TextBox_hasFlexibleWidth(){
		return true;
	},

	hasFlexibleHeight: function TextBox_hasFlexibleHeight(){
		return true;
	},

		//
		//  Frame
		//_________//

	refreshMetrics: function TextBox_refreshMetrics(){

		if(this.fontDesc === null){
			this.fontDesc = jayus.getFontDescriptor(this.font);
		}

		var tempRet = {},

			font = this.font,

			getWordLen = function(str){
				return jayus.measureTextOnto(str, font, tempRet).width;
			},

			divideText = function(str, delims){
				var i, out = [],
					curr = '';
				for(i=0;i<str.length;i++){
					if(delims.indexOf(str[i]) >= 0){
						out.push(curr);
						out.push(str[i]);
						curr = '';
					}
					else{
						curr += str[i];
					}
				}
				out.push(curr);
				return out;
			},

			lines = [],
			lineWidths = [],
			words = divideText(this.text, ' \n'),
			i = 0,

			currentLine, currentLineLength, nextWord, nextWordLength;

		while(i !== words.length){

			currentLine = '\n';
			currentLineLength = 0;

			nextWord = words[i];
			nextWordLength = getWordLen(nextWord);

			do {

				if(nextWord === '\n'){
					i++;
					break;
				}

				// console.log(nextWord+' - '+nextWordLength);

				currentLine += nextWord;
				currentLineLength += nextWordLength;

				i++;

				if(i === words.length){
					break;
				}

				nextWord = words[i];
				nextWordLength = getWordLen(nextWord);

			} while(currentLineLength+nextWordLength < this.width);

			// console.log('LINE: '+currentLine+' - '+currentLineLength);

			// if(currentLine !== '\n'){
				// currentLine = currentLine.trim();
			// }

			if(currentLine.length){
				lines.push(currentLine);
				lineWidths.push(currentLineLength);
			}

		}

		this.lines = lines;
		this.lineWidths = lineWidths;

	}

});
