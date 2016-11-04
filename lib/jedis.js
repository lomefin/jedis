"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***

JEDIS



****/

var Jedis = function () {
  function Jedis() {
    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "jedis";

    _classCallCheck(this, Jedis);

    console.debug("Jedis starting! May the force be with us all.");
    this.prefix = prefix;
    this.ls = window.localStorage;
    this.keys = this._loadLSKey('keys');
    this.lists = this._loadLSKey('lists');
    this.sets = this._loadLSKey('sets');
  }

  _createClass(Jedis, [{
    key: "set",
    value: function set(key, value) {
      return this.setex(key, null, value);
    }
  }, {
    key: "setex",
    value: function setex(key) {
      var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var value = arguments[2];

      if (ttl === null) {
        return this.psetex(key, null, value);
      }

      if (!Number.isInteger(ttl)) {
        throw new TypeError("TTL is not Integer", typeof ttl === "undefined" ? "undefined" : _typeof(ttl));
      }

      return this.psetex(key, ttl * 1000, value);
    }
  }, {
    key: "psetex",
    value: function psetex(key) {
      var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var value = arguments[2];

      var expiry = null;
      if (ttl !== null) {
        if (!Number.isInteger(ttl)) {
          throw new TypeError("TTL is not Integer, but " + (typeof ttl === "undefined" ? "undefined" : _typeof(ttl)));
        }
        if (ttl < 0) {
          throw new RangeError("TTL is negative: " + ttl);
        }
        expiry = Date.now() + ttl;
      }
      this.keys[key] = { value: value, expiresAt: expiry };
      this._saveLSKey("keys");
      return "OK";
    }
  }, {
    key: "ttl",
    value: function ttl(key) {
      if (!(key in this.keys)) {
        return -2;
      }
      var el = this.keys[key];
      if (el.expiresAt === null) {
        return -1;
      }
      return el.expiresAt - Date.now();
    }
  }, {
    key: "get",
    value: function get(key) {
      if (!(key in this.keys)) {
        return null;
      }
      var el = this.keys[key];
      if (el.expiresAt == null) {
        return el.value;
      };
      if (el.expiresAt > Date.now()) {
        return el.value;
      };
      this.del(key);
      return null;
    }
  }, {
    key: "del",
    value: function del(key) {
      delete this.keys[key];
      this._saveLSKey("keys");
      return 1;
    }
  }, {
    key: "_saveLSKey",
    value: function _saveLSKey(key) {
      var structure = this[key];
      var json = JSON.stringify(structure);
      this.ls.setItem(this.prefix + "." + key, json);
    }
  }, {
    key: "_loadLSKey",
    value: function _loadLSKey(key) {
      var internalKeyValue = this.ls.getItem(this.prefix + "." + key);
      if (internalKeyValue === null) {
        return {};
      }
      try {
        return JSON.parse(internalKeyValue);
      } catch (se) {
        console.error("Failed to recover database structure due to SyntaxError on parse process.", se);
      }
      return {};
    }
  }]);

  return Jedis;
}();