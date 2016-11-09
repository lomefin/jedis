'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import Jedis from 'jedis';

var NewConsole = function () {
  function NewConsole() {
    _classCallCheck(this, NewConsole);

    this.body = document.getElementById('jedis-output');
    this.bodyStack = [this.body];
  }

  _createClass(NewConsole, [{
    key: 'header',
    value: function header(obj) {
      var header = document.getElementById('jedis-header');
      var oldBody = this.body;
      this.body = header;
      this.render(obj, "p", "text-info");
      this.body = oldBody;
    }
  }, {
    key: 'footer',
    value: function footer(msg) {
      var footer = document.getElementById('jedis-footer');
      var container = document.createElement("h3");
      container.className = "d-inline mr-1";
      var oldBody = this.body;
      footer.appendChild(container);
      this.body = container;
      this.render(msg, "span", "tag tag-default");
      this.body = oldBody;
    }
  }, {
    key: 'render',
    value: function render(obj, tag) {
      var textClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "text";

      var holder = document.createElement(tag);
      var text = document.createTextNode(obj);
      holder.className = textClass;
      holder.appendChild(text);
      this.body.appendChild(holder);
    }
  }, {
    key: 'group',
    value: function group(msg) {
      var newBody = document.createElement("section");
      this.bodyStack.push(newBody);
      this.body.appendChild(newBody);
      this.body = newBody;
      console.group(msg);
      this.render(msg, "h2");
    }
  }, {
    key: 'success',
    value: function success(msg) {
      console.log(msg);
      this.render(msg, "p", "text-success");
    }
  }, {
    key: 'error',
    value: function error(msg) {
      console.error(msg);
      this.render(msg, "p", "text-danger");
    }
  }, {
    key: 'debug',
    value: function debug(msg) {
      console.debug(msg, "p");
      this.render(msg, "p");
    }
  }, {
    key: 'warn',
    value: function warn(msg) {
      console.warn(msg, "p");
      this.render(msg, "p");
    }
  }, {
    key: 'groupEnd',
    value: function groupEnd() {
      console.groupEnd();
      this.bodyStack.pop();
      this.body = this.bodyStack[this.bodyStack.length - 1];
    }
  }]);

  return NewConsole;
}();

var JedisTest = function () {
  function JedisTest() {
    var _this = this;

    _classCallCheck(this, JedisTest);

    this.JSTest = function (name, func) {
      var upOverride = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var downOverride = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      upOverride !== null ? upOverride() : _this.up();

      _this.console.group("Testing " + name);

      var returnValue = false;
      try {
        returnValue = func();
      } catch (e) {
        _this.console.error("Error in running function.");
        _this.console.debug(e);
      } finally {}
      returnValue ? _this.console.success("PASS") : _this.console.error("FAIL");
      _this.console.groupEnd();
      downOverride !== null ? downOverride() : _this.down();
      _this.testResults.push(returnValue);
      _this.testResultsByName[name] = returnValue;
      return returnValue;
    };

    this.testGroupFlushAll = function () {
      _this.console.group("FLUSHALL");
      _this.JSTest("FLUSHALL", function () {
        _this.jedis.set("KEY-1", 1);
        _this.jedis.set("KEY-2", 2);
        _this.jedis.flushAll();
        var key1Nil = _this.jedis.get("KEY-1") === null;
        var key2Nil = _this.jedis.get("KEY-2") === null;
        return key1Nil && key2Nil;
      }, function () {}, function () {});
      _this.console.groupEnd();
    };

    this.testGroupLocalStorage = function () {
      _this.console.group("LOCALSTORAGE");
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
      _this.console.groupEnd();
    };

    this.testGroupKeys = function () {
      _this.console.group("KEYS");

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

      _this.console.groupEnd();
    };

    this.testGroupLists = function () {
      _this.console.group("LISTS");

      _this.JSTest("LPUSH", function () {
        _this.jedis.lpush("LIST", "simpleStringFromTheLeft");
      });

      _this.JSTest("RPUSH", function () {
        _this.jedis.rpush("LIST", "simpleStringFromTheRight");
      });

      _this.JSTest("LPOP", function () {
        throw "Not yet implemented";
      });

      _this.JSTest("RPOP", function () {
        throw "Not yet implemented";
      });

      _this.JSTest("RPOPLPUSH", function () {
        throw "Not yet implemented";
      });

      _this.console.groupEnd();
    };

    this.testGroupSets = function () {
      _this.console.group("SETS");

      _this.console.groupEnd();
    };

    this.go = function () {

      _this.testGroupFlushAll();

      _this.testGroupKeys();

      _this.testGroupLists();

      _this.testGroupSets();

      _this.testGroupLocalStorage();

      _this.afterMath();
    };

    this.afterMath = function () {
      var totalPasses = 0;
      var totalFails = 0;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _this.testResults[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var r = _step.value;

          r ? totalPasses++ : totalFails++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _this.console.header('Tests: ' + (totalPasses + totalFails) + '. Passed: ' + totalPasses + ', Failed: ' + totalFails + '.');
      console.log("TRBN", _this.testResultsByName);
      for (var r in _this.testResultsByName) {
        console.log(r);
        var val = _this.testResultsByName[r];
        if (val) {
          _this.console.footer(r);
        }
      }
    };

    this.jedis = new Jedis("jedisTest");
    this.console = new NewConsole();
    this.testResults = [];
    this.testResultsByName = {};
  }

  _createClass(JedisTest, [{
    key: 'up',
    value: function up() {}
  }, {
    key: 'down',
    value: function down() {
      this.jedis.flushAll(true);
    }
  }]);

  return JedisTest;
}();

;