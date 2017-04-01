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
    downOverride !== null ? downOverride() : this.down();
    this.testResults.push(returnValue);
    this.testResultsByName[name] = returnValue;
    if(!returnValue) throw "FAIL";
  }

  testGroupFlushAll = () => {
    console.log("FLUSHALL");
    this.JSTest("FLUSHALL", ()=>{
      this.jedis.set("KEY-1", 1);
      this.jedis.set("KEY-2", 2);
      this.jedis.flushAll();
      var key1Nil = this.jedis.get("KEY-1") === null;
      var key2Nil = this.jedis.get("KEY-2") === null;
      return key1Nil && key2Nil;
    }, ()=>{}, ()=>{});
  }

  testGroupLocalStorage = () => {
    console.log("LOCALSTORAGE");
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
  }

  testGroupKeys = () => {
    console.log("KEYS");

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
  }

  testGroupLists = () => {
    console.log("LISTS");

		this.JSTest("LRANGE", () => {
			let key = "LIST1";
			this.jedis.lpush(key,"value1","value2","value3");
      
			let range = this.jedis.lrange(key,  0,  0); 
			if(range[0] !== "value3") return false;
			
			range = this.jedis.lrange(key,  1,  1); 
			if(range[0] !== "value2") return false;
			
			range = this.jedis.lrange(key,  2,  2); 
			if(range[0] !== "value1") return false;
			
			range = this.jedis.lrange(key, -1, -1); 
			if(range[0] !== "value1") return false;
			
			range = this.jedis.lrange(key, -2, -2); 
			if(range[0] !== "value2") return false;
			
			range = this.jedis.lrange(key, -3, -3); 
			if(range[0] !== "value3") return false;
			
			range = this.jedis.lrange(key,  0, -1); 
			if(range[0] !== "value3" || range[1] !== "value2" || range[2] !== "value1") return false;
			
			range = this.jedis.lrange(key,  0, -2); 
			if(range[0] !== "value3" || range[1] !== "value2") return false;
			
			range = this.jedis.lrange(key,  0, -3); 
			if(range[0] !== "value3") return false;
			
			range = this.jedis.lrange(key, 10, -3); 
			if(range[0] !== undefined) return false;
			
			range = this.jedis.lrange(key, -6,  2); 
			if(range[0] !== "value3" || range[1] !== "value2" || range[2] !== "value1") return false;
			
			range = this.jedis.lrange(key, -1,  2); 
			if(range[0] !== "value1") return false;
			
			range = this.jedis.lrange("NON_EXISTENT_LIST",  0,  1); 
			if(range[0] !== undefined) return false;
			
			return true;
    });
		
		this.JSTest("LLEN", () => {
      const key = "LIST2";
			 
			if (this.jedis.llen(key) !== 0) return false;
			 
			this.jedis.lpush(key, "value1");
			if (this.jedis.llen(key) !== 1) return false;

			this.jedis.lpush(key, "value2", "value3");
			if (this.jedis.llen(key) !== 3) return false;

			return true;
    });

    this.JSTest("LPUSH", () => {
			const key = "LIST3";
			
			if (this.jedis.llen(key) !== 0) return false;
			if (this.jedis.lrange(key, 0, 0)[0] !== undefined) return false;
			
			this.jedis.lpush(key, "value1");
			
			if (this.jedis.llen(key) !== 1) return false;
			if (this.jedis.lrange(key, 0, 0)[0] !== "value1") return false;
			
			this.jedis.lpush(key, "value2", "value3");
			
			if (this.jedis.llen(key) !== 3) return false;
			if(this.jedis.lrange(key, 0, -1)[0] !== "value3" || this.jedis.lrange(key, 0, -1)[1] !== "value2" || this.jedis.lrange(key, 0, -1)[2] !== "value1") return false;
			
			return true;
    });

    this.JSTest("RPUSH", () => {
			const key = "LIST4";
			
			if (this.jedis.llen(key) !== 0) return false;
			if (this.jedis.lrange(key, 0, 0)[0] !== undefined) return false;
			
			this.jedis.rpush(key, "value1");
			
			if (this.jedis.llen(key) !== 1) return false;
			if (this.jedis.lrange(key, 0, 0)[0] !== "value1") return false;
			
			this.jedis.rpush(key, "value2", "value3");
			
			if (this.jedis.llen(key) !== 3) return false;
			if(this.jedis.lrange(key, 0, -1)[0] !== "value1" || this.jedis.lrange(key, 0, -1)[1] !== "value2" || this.jedis.lrange(key, 0, -1)[2] !== "value3") return false;
			
			return true;
    });

    this.JSTest("LPOP", ()=>{
      const key = "LIST5";
			 
			this.jedis.rpush(key, "one", "two", "three");
			
			let popped = this.jedis.lpop(key);
			
			if(popped !== "one") return false;
			
			popped = this.jedis.lpop("NON_EXISTENT_LIST");
			 
			if(popped !== null) return false;
			
			return true;
    });

    this.JSTest("RPOP", ()=>{
      const key = "LIST6";
			
			this.jedis.rpush(key, "one", "two", "three");
			
			let popped = this.jedis.rpop(key);
			
			if(popped !== "three") return false;
			
			popped = this.jedis.rpop("NON_EXISTENT_LIST");
			
			if(popped !== null) return false;
			
			return true;
    });
		
    this.JSTest("RPOPLPUSH", ()=>{
      const source = "LIST7";
			const destination = "LIST8";
			
			//Prueba con dos listas distintas, una de ellas vacia.
			this.jedis.rpush(source, "one", "two", "three");
			let popped = this.jedis.rpoplpush(source, destination);
			
			let sRange = this.jedis.lrange(source,0,-1);
			let dRange = this.jedis.lrange(destination, 0, -1);
			
			if (popped !== "three" || sRange[0] !== "one" || sRange[1] !== "two" || sRange[2] !== undefined || dRange[0] !== "three" ||  dRange[1] !== undefined){
				return false;
			}
			
			//Prueba con lista de origen no existente.
			if(this.jedis.rpoplpush("NON_EXISTENT_LIST",destination) !== null) return false;
			
			//Prueba con lista de origen y destino siendo el mismo objeto (lista circular);
			popped = this.jedis.rpoplpush(source,source);
			
			sRange = this.jedis.lrange(source,0,-1);
			
			if (popped !== "two" || sRange[0] !== "two" || sRange[1] !== "one"){
				return false;
			}
			
			return true;
    })
  }

  testGroupSets = () => {
    console.log("SETS");
  }
};
