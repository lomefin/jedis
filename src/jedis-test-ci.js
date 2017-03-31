// import Jedis from 'jedis';

class JedisTest{
  constructor(){
    this.jedis = new Jedis("jedisTest");
    this.testResults = [];
    this.testResultsByName = {};
  }

  up() {
  }

  down() {
    this.jedis.flushAll(true)
  }

  JSTest = (name, func, upOverride = null, downOverride = null) => {
    upOverride !== null ? upOverride() : this.up();

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
    downOverride !== null ? downOverride() : this.down();
    this.testResults.push(returnValue);
    this.testResultsByName[name] = returnValue;
    if(!returnValue) throw "FAIL";
  }

  testGroupFlushAll = () => {
    console.group("FLUSHALL");
    this.JSTest("FLUSHALL", ()=>{
      this.jedis.set("KEY-1", 1);
      this.jedis.set("KEY-2", 2);
      this.jedis.flushAll();
      var key1Nil = this.jedis.get("KEY-1") === null;
      var key2Nil = this.jedis.get("KEY-2") === null;
      return key1Nil && key2Nil;
    }, ()=>{}, ()=>{});
    console.groupEnd();
  }

  testGroupLocalStorage = () => {
    console.group("LOCALSTORAGE");
    this.JSTest("_SAVELSKEY", ()=>{
      this.jedis.set("TO_SAVE_IN_LOCALSTORAGE", "CAT");
      var fromLS = window.localStorage.getItem("jedisTest.keys");
      if(fromLS === null) { return false; }
      return fromLS === '{"TO_SAVE_IN_LOCALSTORAGE":{"value":"CAT","expiresAt":null}}';
    });

    this.JSTest("_LOADLSKEY", ()=>{
      var testObject = {name: "Bandai", colors: [1,2,3]};

      this.jedis.set("TO_SAVE_IN_LOCALSTORAGE", testObject);
      var fromLS = window.localStorage.getItem("jedisTest.keys");

      window.localStorage.clear();
      this.jedis.flushAll();

      window.localStorage.setItem("jedisTest.keys", fromLS);
      this.jedis._loadLSKey("keys");

      var fromJedis = this.jedis.get("TO_SAVE_IN_LOCALSTORAGE");

      return JSON.stringify(testObject) === JSON.stringify(fromJedis);
    });
    console.groupEnd();
  }

  testGroupKeys = () => {
    console.group("KEYS");

    this.JSTest("GET", () => {
      let getUnexistingKeyReturnsNull = this.jedis.get("UNEXISTING_KEY") === null;
      this.jedis.set("EXISTING_KEY", "EXISTING_VALUE");
      let getExistingKeyReturnsCorrectValue = this.jedis.get("EXISTING_KEY") === "EXISTING_VALUE";
      return (getUnexistingKeyReturnsNull && getExistingKeyReturnsCorrectValue);
    });

    this.JSTest("SET", () => {
      this.jedis.set("SET_VALUE","Set value");

      return (this.jedis.get("SET_VALUE") === "Set value");
    });

    this.JSTest("DEL", () => {
      this.jedis.set("EXISTING_VALUE", "exisiting value");
      this.jedis.del("EXISTING_VALUE");
      return this.jedis.get("EXISTING_VALUE") === null
    });

    console.groupEnd();
  }

  testGroupLists = () => {
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

    this.JSTest("RPOPLPUSH", ()=>{
       throw "Not yet implemented";
    })

    console.groupEnd();
  }

  testGroupSets = () => {
    console.group("SETS");

    console.groupEnd();
  }
};
