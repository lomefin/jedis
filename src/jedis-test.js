var Jedis = Jedis;

class JedisTest{


  constructor(){
    this.jedis = new Jedis("jedisTest");
  }

  up() {
  }

  down() {
    this.jedis.flushAll(true);
  }

  JSTest = (name, func, upOverride = null, downOverride = null) => {
    upOverride !== null ? upOverride() : this.up();
    console.group("Testing that " + name );
    var returnValue = false;
    try {
      returnValue = func();
    } catch (e) {
      console.error("Error in running function.");
      console.debug(e);
    } finally {

    }
    returnValue ? console.debug("PASS") : console.error("FAIL");
    console.groupEnd();
    downOverride !== null ? downOverride() : this.down();
    return returnValue;
  };

  go = () => {
    console.group("FLUSHALL");
    this.JSTest("flushes all data", ()=>{
      this.jedis.set("KEY-1", 1);
      this.jedis.set("KEY-2", 2);
      this.jedis.flushAll();
      var key1Nil = this.jedis.get("KEY-1") === null;
      var key2Nil = this.jedis.get("KEY-2") === null;
      return key1Nil && key2Nil;
    }, ()=>{}, ()=>{});
    console.groupEnd();

    console.group("LOCALSTORAGE");
    this.JSTest("data is being saved in localStorage", ()=>{
      this.jedis.set("TO_SAVE_IN_LOCALSTORAGE", "CAT");
      var fromLS = window.localStorage.getItem("jedisTest.keys");
      if(fromLS === null) { return false; }
      return fromLS === '{"TO_SAVE_IN_LOCALSTORAGE":{"value":"CAT","expiresAt":null}}';
    });

    this.JSTest("data is idempotent", ()=>{
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

    console.group("KEYS");

    this.JSTest("retrieving unexisting key returns null.", () => {
      return (this.jedis.get("UNEXISTING_KEY") === null);
    });

    this.JSTest("getting a set value is the same.", () => {
      this.jedis.set("SET_VALUE","Set value");

      return (this.jedis.get("SET_VALUE") === "Set value");
    });



    this.JSTest("deleting an existing key returns nil", () => {
      this.jedis.set("EXISTING_VALUE", "exisiting value");
      this.jedis.del("EXISTING_VALUE");
      return this.jedis.get("EXISTING_VALUE") === null
    });

    console.groupEnd();


  }



};
