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
Defines the Dependency class.
@file Dependency.js
*/

//
//  jayus.Dependency()
//______________________//

/**
An abstract class for helper objects that Entities depend on, such as styling and geometry.
@class jayus.Dependency
*/

/*
	Takes advantage of array deflation, the dependents property is not an array if there is only one dependent.
		- Extra code is required to automatically ensure it is converted to and from an array
		+ Can greatly reduce number of arrays instantiated, most objects only have one dependent
*/

//#ifdef DEBUG
jayus.debug.className = 'Dependency';
//#endif

jayus.Dependency = jayus.Animatable.extend({

	//
	//  Properties
	//______________//

	/**
	The dependent object[s].
	<br> Do not modify.
	@property {Object|Array} dependents
	*/

	dependents: null,

	/**
	The number of dependents.
	<br> Do not modify.
	@property {Number} dependentCount
	*/

	dependentCount: 0,

	/**
	Whether to inform dependents of dirty events.
	<br> Do not modify.
	@property {Number} frozen
	*/

	frozen: 0,

	//
	//  Methods
	//___________//

	/**
	Attaches a dependent.
	@method attach
	@param {Object} dependent
	*/

	attach: function Dependency_attach(dependent){
		//#ifdef DEBUG
		jayus.debug.match('Dependency.attach', dependent, 'dependent', jayus.TYPES.OBJECT);
		//#endif
		// Check if we already have a dependent
		if(this.dependentCount){
			// If we alredy have a single one, place them both into an array
			if(this.dependentCount === 1){
				this.dependents = [this.dependents, dependent];
			}
			// Else just append the new one
			else{
				this.dependents.push(dependent);
			}
		}
		else{
			this.dependents = dependent;
		}
		this.dependentCount++;
	},

	/**
	Detaches a dependent.
	@method detach
	@param {Object} dependent
	*/

	detach: function Dependency_detach(dependent){
		if(this.dependentCount){
			if(this.dependentCount === 1){
				this.dependents = null;
			}
			else if(this.dependenCount === 2){
				this.depdendents = this.dependents[1];
			}
			else{
				this.dependents.splice(this.dependents.indexOf(dependent), 1);
			}
			this.dependentCount--;
		}
	},

	/**
	Alerts dependents that this component has been changed in the specified manner.
	@method {Self} dirty
	@param {Number} type
	*/

	dirty: function Dependency_dirty(type){
		if(!this.frozen){
			this.informDependents(type);
		}
	},

	/**
	Informs all dependents the object has been modified.
	@method informDependents
	*/

	informDependents: function Dependency_informDependents(type){
		if(this.dependentCount){
			if(this.dependentCount === 1){
				//#ifdef DEBUG
				jayus.debug.verifyMethod(this.dependents, 'componentDirtied');
				//#endif
				this.dependents.componentDirtied(this.componentType, this, type);
			}
			else{
				for(var i=0;i<this.dependentCount;i++){
					//#ifdef DEBUG
					jayus.debug.verifyMethod(this.dependents[i], 'componentDirtied');
					//#endif
					this.dependents[i].componentDirtied(this.componentType, this, type);
				}
			}
		}
	},

	forEachDependent: function Dependency_forEachDependent(func, args){
		if(this.dependentCount === 1){
			func.apply(this.dependents, args);
		}
		else{
			for(var i=0;i<this.dependentCount;i++){
				func.apply(this.dependents[i], args);
			}
		}
	}

});
