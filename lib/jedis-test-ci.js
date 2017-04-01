"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import Jedis from 'jedis';

var JedisTest = function () {
		function JedisTest() {
				var _this = this;

				_classCallCheck(this, JedisTest);

				this.JSTest = function (name, func) {
						var upOverride = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
						var downOverride = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

						upOverride !== null ? upOverride() : _this.up();

						console.log("Testing " + name);

						var returnValue = false;
						try {
								returnValue = func();
						} catch (e) {
								console.error("Error in running function.");
								console.debug(e);
								throw e;
						} finally {}

						returnValue ? console.log("PASS") : console.error("FAIL");
						downOverride !== null ? downOverride() : _this.down();
						_this.testResults.push(returnValue);
						_this.testResultsByName[name] = returnValue;
						if (!returnValue) throw "FAIL";
				};

				this.testGroupFlushAll = function () {
						console.log("FLUSHALL");
						_this.JSTest("FLUSHALL", function () {
								_this.jedis.set("KEY-1", 1);
								_this.jedis.set("KEY-2", 2);
								_this.jedis.flushAll();
								var key1Nil = _this.jedis.get("KEY-1") === null;
								var key2Nil = _this.jedis.get("KEY-2") === null;
								return key1Nil && key2Nil;
						}, function () {}, function () {});
				};

				this.testGroupLocalStorage = function () {
						console.log("LOCALSTORAGE");
						_this.JSTest("_SAVELSKEY", function () {
								_this.jedis.set("TO_SAVE_IN_LOCALSTORAGE", "CAT");
								var fromLS = window.localStorage.getItem("jedisTest.keys");
								if (fromLS === null) {
										return false;
								}
								return fromLS === '{"TO_SAVE_IN_LOCALSTORAGE":{"value":"CAT","expiresAt":null}}';
						});

						_this.JSTest("_LOADLSKEY", function () {
								var testObject = { name: "Bandai", colors: [1, 2, 3] };

								_this.jedis.set("TO_SAVE_IN_LOCALSTORAGE", testObject);
								var fromLS = window.localStorage.getItem("jedisTest.keys");

								window.localStorage.clear();
								_this.jedis.flushAll();

								window.localStorage.setItem("jedisTest.keys", fromLS);
								_this.jedis._loadLSKey("keys");

								var fromJedis = _this.jedis.get("TO_SAVE_IN_LOCALSTORAGE");

								return JSON.stringify(testObject) === JSON.stringify(fromJedis);
						});
				};

				this.testGroupKeys = function () {
						console.log("KEYS");

						_this.JSTest("GET", function () {
								var getUnexistingKeyReturnsNull = _this.jedis.get("UNEXISTING_KEY") === null;
								_this.jedis.set("EXISTING_KEY", "EXISTING_VALUE");
								var getExistingKeyReturnsCorrectValue = _this.jedis.get("EXISTING_KEY") === "EXISTING_VALUE";
								return getUnexistingKeyReturnsNull && getExistingKeyReturnsCorrectValue;
						});

						_this.JSTest("SET", function () {
								_this.jedis.set("SET_VALUE", "Set value");

								return _this.jedis.get("SET_VALUE") === "Set value";
						});

						_this.JSTest("DEL", function () {
								_this.jedis.set("EXISTING_VALUE", "exisiting value");
								_this.jedis.del("EXISTING_VALUE");
								return _this.jedis.get("EXISTING_VALUE") === null;
						});
				};

				this.testGroupLists = function () {
						console.log("LISTS");

						_this.JSTest("LRANGE", function () {
								var key = "LIST1";
								_this.jedis.lpush(key, "value1", "value2", "value3");

								var range = _this.jedis.lrange(key, 0, 0);
								if (range[0] !== "value3") return false;

								range = _this.jedis.lrange(key, 1, 1);
								if (range[0] !== "value2") return false;

								range = _this.jedis.lrange(key, 2, 2);
								if (range[0] !== "value1") return false;

								range = _this.jedis.lrange(key, -1, -1);
								if (range[0] !== "value1") return false;

								range = _this.jedis.lrange(key, -2, -2);
								if (range[0] !== "value2") return false;

								range = _this.jedis.lrange(key, -3, -3);
								if (range[0] !== "value3") return false;

								range = _this.jedis.lrange(key, 0, -1);
								if (range[0] !== "value3" || range[1] !== "value2" || range[2] !== "value1") return false;

								range = _this.jedis.lrange(key, 0, -2);
								if (range[0] !== "value3" || range[1] !== "value2") return false;

								range = _this.jedis.lrange(key, 0, -3);
								if (range[0] !== "value3") return false;

								range = _this.jedis.lrange(key, 10, -3);
								if (range[0] !== undefined) return false;

								range = _this.jedis.lrange(key, -6, 2);
								if (range[0] !== "value3" || range[1] !== "value2" || range[2] !== "value1") return false;

								range = _this.jedis.lrange(key, -1, 2);
								if (range[0] !== "value1") return false;

								range = _this.jedis.lrange("NON_EXISTENT_LIST", 0, 1);
								if (range[0] !== undefined) return false;

								return true;
						});

						_this.JSTest("LLEN", function () {
								var key = "LIST2";

								if (_this.jedis.llen(key) !== 0) return false;

								_this.jedis.lpush(key, "value1");
								if (_this.jedis.llen(key) !== 1) return false;

								_this.jedis.lpush(key, "value2", "value3");
								if (_this.jedis.llen(key) !== 3) return false;

								return true;
						});

						_this.JSTest("LPUSH", function () {
								var key = "LIST3";

								if (_this.jedis.llen(key) !== 0) return false;
								if (_this.jedis.lrange(key, 0, 0)[0] !== undefined) return false;

								_this.jedis.lpush(key, "value1");

								if (_this.jedis.llen(key) !== 1) return false;
								if (_this.jedis.lrange(key, 0, 0)[0] !== "value1") return false;

								_this.jedis.lpush(key, "value2", "value3");

								if (_this.jedis.llen(key) !== 3) return false;
								if (_this.jedis.lrange(key, 0, -1)[0] !== "value3" || _this.jedis.lrange(key, 0, -1)[1] !== "value2" || _this.jedis.lrange(key, 0, -1)[2] !== "value1") return false;

								return true;
						});

						_this.JSTest("RPUSH", function () {
								var key = "LIST4";

								if (_this.jedis.llen(key) !== 0) return false;
								if (_this.jedis.lrange(key, 0, 0)[0] !== undefined) return false;

								_this.jedis.rpush(key, "value1");

								if (_this.jedis.llen(key) !== 1) return false;
								if (_this.jedis.lrange(key, 0, 0)[0] !== "value1") return false;

								_this.jedis.rpush(key, "value2", "value3");

								if (_this.jedis.llen(key) !== 3) return false;
								if (_this.jedis.lrange(key, 0, -1)[0] !== "value1" || _this.jedis.lrange(key, 0, -1)[1] !== "value2" || _this.jedis.lrange(key, 0, -1)[2] !== "value3") return false;

								return true;
						});

						_this.JSTest("LPOP", function () {
								var key = "LIST5";

								_this.jedis.rpush(key, "one", "two", "three");

								var popped = _this.jedis.lpop(key);

								if (popped !== "one") return false;

								popped = _this.jedis.lpop("NON_EXISTENT_LIST");

								if (popped !== null) return false;

								return true;
						});

						_this.JSTest("RPOP", function () {
								var key = "LIST6";

								_this.jedis.rpush(key, "one", "two", "three");

								var popped = _this.jedis.rpop(key);

								if (popped !== "three") return false;

								popped = _this.jedis.rpop("NON_EXISTENT_LIST");

								if (popped !== null) return false;

								return true;
						});

						_this.JSTest("RPOPLPUSH", function () {
								var source = "LIST7";
								var destination = "LIST8";

								//Prueba con dos listas distintas, una de ellas vacia.
								_this.jedis.rpush(source, "one", "two", "three");
								var popped = _this.jedis.rpoplpush(source, destination);

								var sRange = _this.jedis.lrange(source, 0, -1);
								var dRange = _this.jedis.lrange(destination, 0, -1);

								if (popped !== "three" || sRange[0] !== "one" || sRange[1] !== "two" || sRange[2] !== undefined || dRange[0] !== "three" || dRange[1] !== undefined) {
										return false;
								}

								//Prueba con lista de origen no existente.
								if (_this.jedis.rpoplpush("NON_EXISTENT_LIST", destination) !== null) return false;

								//Prueba con lista de origen y destino siendo el mismo objeto (lista circular);
								popped = _this.jedis.rpoplpush(source, source);

								sRange = _this.jedis.lrange(source, 0, -1);

								if (popped !== "two" || sRange[0] !== "two" || sRange[1] !== "one") {
										return false;
								}

								return true;
						});
				};

				this.testGroupSets = function () {
						console.log("SETS");
				};

				this.jedis = new Jedis("jedisTest");
				this.testResults = [];
				this.testResultsByName = {};
		}

		_createClass(JedisTest, [{
				key: "up",
				value: function up() {}
		}, {
				key: "down",
				value: function down() {
						this.jedis.flushAll(true);
				}
		}]);

		return JedisTest;
}();

;