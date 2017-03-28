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

      console.group("Testing " + name);

      var returnValue = false;
      try {
        returnValue = func();
      } catch (e) {
        console.error("Error in running function.");
        console.debug(e);
        throw e;
      } finally {}

      returnValue ? console.log("PASS") : console.error("FAIL");
      console.groupEnd();
      downOverride !== null ? downOverride() : _this.down();
      _this.testResults.push(returnValue);
      _this.testResultsByName[name] = returnValue;
      if (!returnValue) throw "FAIL";
    };

    this.testGroupFlushAll = function () {
      console.group("FLUSHALL");
      _this.JSTest("FLUSHALL", function () {
        _this.jedis.set("KEY-1", 1);
        _this.jedis.set("KEY-2", 2);
        _this.jedis.flushAll();
        var key1Nil = _this.jedis.get("KEY-1") === null;
        var key2Nil = _this.jedis.get("KEY-2") === null;
        return key1Nil && key2Nil;
      }, function () {}, function () {});
      console.groupEnd();
    };

    this.testGroupLocalStorage = function () {
      console.group("LOCALSTORAGE");
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
      console.groupEnd();
    };

    this.testGroupKeys = function () {
      console.group("KEYS");

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

      console.groupEnd();
    };

    this.testGroupLists = function () {
      console.group("LISTS");

      // this.JSTest("LPUSH", () => {
      //   throw "Not yet implemented";
      //   this.jedis.lpush("LIST", "simpleStringFromTheLeft");
      // });

      // this.JSTest("RPUSH", () => {
      //   throw "Not yet implemented";
      //   this.jedis.rpush("LIST", "simpleStringFromTheRight");
      // });

      // this.JSTest("LPOP", ()=>{
      //   throw "Not yet implemented";
      // });

      // this.JSTest("RPOP", ()=>{
      //   throw "Not yet implemented";
      // });

      // this.JSTest("RPOPLPUSH", ()=>{
      //   throw "Not yet implemented";
      // })

      console.groupEnd();
    };

    this.testGroupSets = function () {
      console.group("SETS");

      console.groupEnd();
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