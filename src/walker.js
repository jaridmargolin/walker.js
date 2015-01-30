/*!
 * walker.js
 * 
 * Copyright (c) 2014
 */

define(function (require) {

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// 3rd party
var isArray     = require('utl/isArray');
var isObject    = require('utl/isObject');
var isUndefined = require('utl/isUndefined');


/* -----------------------------------------------------------------------------
 * Walker
 * ---------------------------------------------------------------------------*/

/**
 * @global
 * @public
 * @constructor
 *
 * @desc Class used to interactively navigate through an object structure. Walk
 * active keys or search for a specific node.
 *
 * @example
 * var walker = new Walker({
 *   seperator : '.',
 *   location  : ''
 * });
 *
 * @param {object} opts - Walker options.
 * @param {string} [opts.seperator='.'] - Seperator used for tracking location.
 * @param {string} [opts.location=' '] - Current location. By default at root.
 */
var Walker = function (opts) {
  opts = opts || {};

  this.seperator = opts.seperator || '.';
  this.location  = opts.location || '';
};


/* -----------------------------------------------------------------------------
 * api
 * ---------------------------------------------------------------------------*/

/**
 * @public
 * @memberof Walker
 *
 * @desc Execute a specified iterator for each node in an object.
 *
 * @example
 * walker.each({
 *   'walk': { 'each': 'node' }
 * }, function (locaton, val) {
 *   console.log(location);
 *   console.log(val); 
 *   console.log('--');
 * });
 *
 * // walk
 * // { 'each': 'node' }
 * // --
 * // walk.each
 * // node
 * // --
 *
 * @param {object} obj - Object to traverse.
 * @param {function} iterator - Function called for each iteration. The
 *   function will be passed two arguments, `location` and `value`.
 */
Walker.prototype.each = function (obj, callback, curLocation) {
  var location = curLocation || this.location;

  for (var key in obj) {
    var val = obj[key];
    var newLocation = this._location(location, key);

    callback(newLocation, val);

    if (isObject(val) || isArray(val)) {
      this.each(val, callback, newLocation);
    }
  }
};

/**
 * @public
 * @memberof Walker
 *
 * @desc Execute a specified iterator for each parent node of the specified
 * query key. Callback will be passed a string representing the location
 * and the value at that location.
 *
 * @example
 * walker.bubble({
 *   'bubble': { 'from': { 'here': 'value' } }
 * }, 'bubble.from.here', function (locaton, val) {
 *   console.log(location);
 *   console.log(val);
 *   console.log('--');
 * });
 *
 * // bubble.from.here
 * // value
 * // --
 * // bubble.from
 * // { 'here': 'value' }
 * // --
 * // bubble
 * // { 'from': { 'here': 'value' } }
 * // --
 *
 * @param {object} obj - Object to traverse.
 * @param {string} query - Formatted string representing the property at which
 *   to begin bubbling from.
 * @param {function} iterator - Function executed at each level.
 */
Walker.prototype.bubble = function (obj, query, iterator) {
  var history = [];
  var location;

  this._eachPart(obj, query, function (val, key, obj) {
    if(isUndefined(val)) {
      return;
    }

    location = this._location(location, key);
    history.unshift({ location: location, val: val });
  });

  for (var i = 0, len = history.length; i < len; i++) {
    iterator(history[i].location, history[i].val);
  }
};

/**
 * @public
 * @memberof Walker
 *
 * @desc An interface to grab a specified node based on a query string. When a value
 * in the namespace if not found there are two options. By default undefined
 * will be returned. If you set the third parameter, `create`, to true an
 * empty object will be created at that node and walker will continue to
 * traverse the object tree.
 *
 * @example
 * var val = walker.search({
 *   'nested': { 'node': 'value' }
 * }, 'nested.node');
 *
 * console.log(val);
 * // value
 *
 * @param {object} obj - The object to search on.
 * @param {string} query - Formatted string representing a key in the obj.
 * @param {object} create - Flag for if we should create an empty object
 *   when an undefined property is found.
 */
Walker.prototype.search = function (obj, query, create) {
  var result;

  this._eachPart(obj, query, function (val, key, obj) {
    if(isUndefined(val) && !create) {
      return result = val;
    }

    result = { key: key, val: val, parent: obj };
  });

  return result;
};


/* -----------------------------------------------------------------------------
 * utils
 * ---------------------------------------------------------------------------*/

/**
 * @private
 *
 * @desc Helper utiltity to loop through each part of a query string. Used
 * internally by `bubble` and `search` methods.
 *
 * @param {object} obj - The object to loop over.
 * @param {string} query - Formatted string representing a key in the obj.
 * @param {function} callback - Iterator function to execute for each part of
 *   the query string.
 */
Walker.prototype._eachPart = function (obj, query, callback) {
  var parts = query.split(this.seperator);

  for (var i = 0, len = parts.length; i < len; i++) {
    var key = parts[i];
    var val = obj[key];

    if (!isUndefined(callback.call(this, val, key, obj))) {
      return;
    }

    obj = obj[key] = isUndefined(val) ? {} : val;
  }
};

/**
 * @private
 *
 * @desc Small utility helper used to properly append a key to the current location.
 *
 * @param {string} location - Location to append to.
 * @param {string} key - Key you would like to append to location.
 */
Walker.prototype._location = function (location, key) {
  location = location || this.location;

  return location
    ? location + this.seperator + key
    : key;
};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

return Walker;


});