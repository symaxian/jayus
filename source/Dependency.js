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
//#end

jayus.Dependency = jayus.Animatable.extend({

	//
	//  Properties
	//______________//

	/**
	The object's id.
	<br> Default is 0.
	@property {Number|String} id
	*/

	id: 0,

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
	Sets the entity's id.
	@method {Self} setId
	@param {Number|String} id
	*/

	setId: function Dependency_setId(id) {
		//#ifdef DEBUG
		jayus.debug.match('Dependency.setId', id, 'id', jayus.TYPES.DEFINED);
		//#end
		this.id = id;
		return this;
	},

	//@ From Parsable
	initFromObject: function Dependency_initFromObject(object) {
		//#ifdef DEBUG
		jayus.debug.match('Dependency.initFromObject', object, 'object', jayus.TYPES.OBJECT);
		//#end
		// Apply parent properties
		// Animatable isnt state based so ignore it for now
		// Apply our own properties
		this.id = id;
		this.dependents = object.dependents;
		if (this.dependents !== null) {
			// If there are any dependents, transform them from their id to the object
			// FIXME: When this dependency is created, all of its dependent objects might not yet be. So we might need to reperform this step once the entire JSON has been parsed
			this.dependentCount = object.dependents.length;
			for (var i=0;i<this.dependentCount;i++) {
				this.dependents[i] = jayus.getObject(this.dependents[i]);
			}
		}
		else {
			this.dependentCount = 0;
		}
		// Set as dirty
		this.dirty(jayus.DIRTY.ALL);
	},

	addToResult: function Dependency_addToResult(result) {
		if (jayus.isObjectInResult(result, this)) {
			return;
		}
		// Get object from parent
		var object = {};
		// Add our own properties
		object.__type__ = 'Dependency';
		object.id = this.id;
		result.objects.push(object);
		if (this.dependentCount) {
			object.dependents = [];
			for (var i=0;i<this.dependentCount;i++) {
				var val = this.dependents[i];
				val.addToResult(result);
				object.dependents.push(val.id);
			}
		}
		else {
			object.dependents = null;
		}
		return object;
	},

	/**
	Attaches a dependent.
	@method attach
	@param {Object} dependent
	*/

	attach: function Dependency_attach(dependent) {
		//#ifdef DEBUG
		jayus.debug.match('Dependency.attach', dependent, 'dependent', jayus.TYPES.OBJECT);
		//#end
		// If we have more than one, just append it
		if (!this.dependentCount) {
			this.dependents = [];
		}
		this.dependents.push(dependent);
		this.dependentCount++;
	},

	/**
	Detaches a dependent.
	@method detach
	@param {Object} dependent
	*/

	detach: function Dependency_detach(dependent) {
		// TODO: Check to see if dependent is actually attached
		if (this.dependentCount) {
			this.dependents.splice(this.dependents.indexOf(dependent), 1);
			this.dependentCount--;
		}
	},

	/**
	Alerts dependents that this component has been changed in the specified manner.
	@method {Self} dirty
	@param {Number} type
	*/

	dirty: function Dependency_dirty(type) {
		if (!this.frozen) {
			this.informDependents(type);
		}
	},

	/**
	Informs all dependents the object has been modified.
	@method informDependents
	*/

	informDependents: function Dependency_informDependents(type) {
		for(var i=0;i<this.dependentCount;i++) {
			//#ifdef DEBUG
			jayus.debug.verifyMethod(this.dependents[i], 'componentDirtied');
			//#end
			this.dependents[i].componentDirtied(this, type);
		}
	},

	forEachDependent: function Dependency_forEachDependent(func, args) {
		for(var i=0;i<this.dependentCount;i++) {
			func.apply(this.dependents[i], args);
		}
	}

});
