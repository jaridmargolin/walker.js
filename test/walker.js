/*!
 * test/walker.js
 * 
 * Copyright (c) 2014
 */

define([
  'proclaim',
  'walker'
], function (assert, Walker) {


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('walker.js', function () {

  /* ---------------------------------------------------------------------------
   * constructor
   * -------------------------------------------------------------------------*/

  describe('Walker()', function () {

    it('Should set opts on instance.', function () {
      var opts = { seperator: ':', location: 'some:location' };
      var walker = new Walker(opts);

      assert.equal(walker.seperator, opts.seperator);
      assert.equal(walker.location, opts.location);
    });

    it('Should use default opts.', function () {
      var walker = new Walker();

      assert.equal(walker.seperator, '.');
      assert.equal(walker.location, '');
    });

  });


  /* ---------------------------------------------------------------------------
   * each
   * -------------------------------------------------------------------------*/

  describe('Walker.each()', function () {

    it('Should execute the callback for each node.', function () {
      var walker = new Walker();
      var walkme = { 'nested': { 'value': 0, 'values': [0, 1] } };
      var results = {};

      walker.each(walkme, function (location, val) {
        results[location] = val;
      });

      assert.equal(results['nested'], walkme['nested']);
      assert.equal(results['nested.value'], walkme['nested']['value']);
      assert.equal(results['nested.values'], walkme['nested']['values']);
      assert.equal(results['nested.values.0'], walkme['nested']['values'][0]);
      assert.equal(results['nested.values.1'], walkme['nested']['values'][1]);
    });

    it('Should use instance `location` as base.', function () {
      var opts = { location: 'base.location' };
      var walker = new Walker(opts);
      var walkme = { 'nested': { 'value': 0 } };
      var results = {};

      walker.each(walkme, function (location, val) {
        results[location] = val;
      });

      assert.equal(results['base.location.nested'], walkme['nested']);
      assert.equal(results['base.location.nested.value'], walkme['nested']['value']);
    });

    it('Should use the instance `seperator`.', function () {
      var opts = { seperator: ':' };
      var walker = new Walker(opts);
      var walkme = { 'nested': { 'value': 0 } };
      var results = {};

      walker.each(walkme, function (location, val) {
        results[location] = val;
      });

      assert.equal(results['nested:value'], walkme['nested']['value']);
    });

  });


  /* ---------------------------------------------------------------------------
   * search
   * -------------------------------------------------------------------------*/

  describe('Walker.search()', function () {

    it('Should return an object containing `key`, `value`, and `parent`.', function () {
      var walker = new Walker();
      var searchme = { 'nested': { 'value': 0, 'values': [0, 1] } };

      var result = walker.search(searchme, 'nested.values.0');

      assert.equal(result.val, searchme['nested']['values'][0]);
      assert.equal(result.key, 0);
      assert.equal(result.parent, searchme['nested']['values']);
    });

    it('Should use the instance `seperator`.', function () {
      var opts = { seperator: ':' };
      var walker = new Walker(opts);
      var searchme = { 'nested': { 'value': 0, 'values': [0, 1] } };

      var result = walker.search(searchme, 'nested:values:0');

      assert.equal(result.val, searchme['nested']['values'][0]);
    });

    it('Should return undefined if unable to find final node.', function () {
      var walker = new Walker();
      var searchme = { 'value': 0 };

      var result = walker.search(searchme, 'nested.values.0');

      assert.isUndefined(result);
    });

    it('Should create nodes if specified and necessary.', function () {
      var walker = new Walker();
      var searchme = { 'value': 0 };

      var result = walker.search(searchme, 'nested.values.0', true);

      assert.isUndefined(result.val);
      assert.equal(result.key, 0);
      assert.equal(result.parent, searchme['nested']['values']);
    });

  });


  /* ---------------------------------------------------------------------------
   * bubble
   * -------------------------------------------------------------------------*/
  describe('Walker.bubble()', function () {

    it('Should execute the callback for each node bubbling up.', function () {
      var walker = new Walker();
      var bubbleme = { 'nested': { 'value': 0, 'values': [0, 1] } };

      var results = [];
      walker.bubble(bubbleme, 'nested.values.0', function (location, val) {
        results.push({ location: location, val: val });
      });

      assert.deepEqual(results[0], { location: 'nested.values.0', val: 0 });
      assert.deepEqual(results[1], { location: 'nested.values',  val: [0, 1] });
      assert.deepEqual(results[2], { location: 'nested', val: bubbleme['nested'] });
    });

    it('Should use instance `location` as base.', function () {
      var opts = { location: 'base.location' };
      var walker = new Walker(opts);
      var bubbleme = { 'nested': { 'value': 0 } };

      var results = [];
      walker.bubble(bubbleme, 'nested.value', function (location, val) {
        results.push(location);
      });

      assert.equal(results[0], 'base.location.nested.value');
    });

    it('Should use the instance `seperator`.', function () {
      var opts = { seperator: ':' };
      var walker = new Walker(opts);
      var bubbleme = { 'nested': { 'value': 0 } };

      var results = [];
      walker.bubble(bubbleme, 'nested:value', function (location, val) {
        results.push(location);
      });

      assert.equal(results[0], 'nested:value');
    });

    it('Should only bubble if keys exist.', function () {
      var opts = { seperator: ':' };
      var walker = new Walker(opts);
      var bubbleme = { 'nested': { 'value': 0 } };

      var results = [];
      walker.bubble(bubbleme, 'nest:values:0', function (location, val) {
        results.push(location);
      });

      assert.equal(results.length, 0);
    });

  });

});


});