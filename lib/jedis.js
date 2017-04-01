"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***

JEDIS

Started in 2016 by Leonardo Luarte (@lomefin)

****/

var Jedis = function () {
		function Jedis() {
				var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "jedis";

				_classCallCheck(this, Jedis);

				console.debug("Jedis starting! May the force be with us all.");
				this.prefix = prefix;
				this.ls = window.localStorage;
				this._loadLSKey('keys');
				this._loadLSKey('lists');
				this._loadLSKey('sets');
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
				key: "flushAll",
				value: function flushAll() {
						var confirm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

						if (!confirm) {
								console.warn("FlushAll requested.");
						}
						this.ls.clear();
						this._loadLSKey('keys');
						this._loadLSKey('lists');
						this._loadLSKey('sets');
				}
		}, {
				key: "llen",
				value: function llen(key) {
						this._checkTypeList(key);

						if (!this.lists[key]) return 0;

						return this.lists[key].value.length;
				}
		}, {
				key: "lrange",
				value: function lrange(key, start, stop) {
						this._checkTypeList(key);

						var list = this.lists[key];
						if (!list) return [];

						var begin = start >= 0 ? start : list.value.length + start;
						var end = stop >= 0 ? stop : list.value.length + stop;

						return list.value.slice(begin, end + 1);
				}
		}, {
				key: "lpush",
				value: function lpush(key) {
						this._checkTypeList(key);

						if (!this.lists[key]) {
								this.lists[key] = { value: [] };
						}

						var i = void 0;

						for (var _len = arguments.length, value = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
								value[_key - 1] = arguments[_key];
						}

						for (i in value) {
								this.lists[key].value.unshift(value[i]);
						}this._saveLSKey('lists');
						return this.llen(key);
				}
		}, {
				key: "rpush",
				value: function rpush(key) {
						this._checkTypeList(key);

						if (!this.lists[key]) {
								this.lists[key] = { value: [] };
						}

						var i = void 0;

						for (var _len2 = arguments.length, value = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
								value[_key2 - 1] = arguments[_key2];
						}

						for (i in value) {
								this.lists[key].value.push(value[i]);
						}this._saveLSKey('lists');
						return this.llen(key);
				}
		}, {
				key: "lpop",
				value: function lpop(key) {
						this._checkTypeList(key);

						if (!this.lists[key]) {
								return null;
						}

						var popped = this.lists[key].value.shift();
						this._saveLSKey('lists');
						return popped;
				}
		}, {
				key: "rpop",
				value: function rpop(key) {
						this._checkTypeList(key);

						if (!this.lists[key]) {
								return null;
						}

						var popped = this.lists[key].value.pop();
						this._saveLSKey('lists');
						return popped;
				}
		}, {
				key: "rpoplpush",
				value: function rpoplpush(source, destination) {
						this._checkTypeList(source);

						if (!this.lists[source]) {
								return null;
						}

						this._checkTypeList(destination);

						if (!this.lists[destination]) {
								this.lists[destination] = { value: [] };
						}

						var popped = this.rpop(source);

						this.lpush(destination, popped);

						this._saveLSKey('lists');
						return popped;
				}
		}, {
				key: "_checkTypeList",
				value: function _checkTypeList(key) {
						if (this.keys[key] || this.sets[key]) throw new Error('(error) WRONGTYPE Operation against a key holding the wrong kind of value');
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
								this[key] = {};return;
						}
						var result = {};
						try {
								result = JSON.parse(internalKeyValue);
						} catch (se) {
								console.error("Failed to recover database structure due to SyntaxError on parse process.", se);
						}
						this[key] = result;
				}
		}]);

		return Jedis;
}();

// export default Jedis;