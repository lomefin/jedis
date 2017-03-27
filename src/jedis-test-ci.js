// import Jedis from 'jedis';

class NewConsole{
  constructor(){
    this.body = document.getElementById('jedis-output');
    this.bodyStack = [this.body];
  }
  header(obj){
    var header = document.getElementById('jedis-header');
    var oldBody = this.body;
    this.body = header;
    this.render(obj,"p","text-info");
    this.body = oldBody;
  }

  footer(msg){
    var footer = document.getElementById('jedis-footer');
    var container = document.createElement("h3");
    container.className = "d-inline mr-1";
    var oldBody = this.body;
    footer.appendChild(container);
    this.body = container;
    this.render(msg,"span","tag tag-default");
    this.body = oldBody;
  }

  render(obj, tag, textClass = "text"){
    let holder = document.createElement(tag);
    let text = document.createTextNode(obj);
    holder.className = textClass;
    holder.appendChild(text);
    this.body.appendChild(holder);
  }
  group(msg){
    let newBody = document.createElement("section");
    this.bodyStack.push(newBody);
    this.body.appendChild(newBody);
    this.body = newBody;
    console.group(msg);
    this.render(msg,"h2");
  }
  success(msg){
    console.log(msg);
    this.render(msg, "p", "text-success");
  }
  error(msg){
    console.error(msg);
    this.render(msg, "p", "text-danger");
  }
  debug(msg){
    console.debug(msg, "p");
    this.render(msg, "p");
  }
  warn(msg){
    console.warn(msg, "p");
    this.render(msg, "p");
  }
  groupEnd(){
    console.groupEnd();
    this.bodyStack.pop();
    this.body = this.bodyStack[this.bodyStack.length - 1];
  }
}

class JedisTest{
  constructor(){
    this.jedis = new Jedis("jedisTest");
    this.console = new NewConsole();
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

    this.console.group("Testing " + name);

    var returnValue = false;
    try {
      returnValue = func();
    } catch (e) {
      this.console.error("Error in running function.");
      this.console.debug(e);
    } finally {

    }
    returnValue ? this.console.success("PASS") : this.console.error("FAIL");
    this.console.groupEnd();
    downOverride !== null ? downOverride() : this.down();
    this.testResults.push(returnValue);
    this.testResultsByName[name] = returnValue;
    return returnValue;
  }

  testGroupFlushAll = () => {
    this.console.group("FLUSHALL");
    this.JSTest("FLUSHALL", ()=>{
      this.jedis.set("KEY-1", 1);
      this.jedis.set("KEY-2", 2);
      this.jedis.flushAll();
      var key1Nil = this.jedis.get("KEY-1") === null;
      var key2Nil = this.jedis.get("KEY-2") === null;
      return key1Nil && key2Nil;
    }, ()=>{}, ()=>{});
    this.console.groupEnd();
  }

  testGroupLocalStorage = () => {
    this.console.group("LOCALSTORAGE");
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
    this.console.groupEnd();
  }

  testGroupKeys = () => {
    this.console.group("KEYS");

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

    this.console.groupEnd();
  }

  testGroupLists = () => {
    this.console.group("LISTS");

    this.JSTest("LPUSH", () => {
      this.jedis.lpush("LIST", "simpleStringFromTheLeft");
    });

    this.JSTest("RPUSH", () => {
      this.jedis.rpush("LIST", "simpleStringFromTheRight");
    });

    this.JSTest("LPOP", ()=>{
      throw "Not yet implemented";
    });

    this.JSTest("RPOP", ()=>{
      throw "Not yet implemented";
    });

    this.JSTest("RPOPLPUSH", ()=>{
      throw "Not yet implemented";
    })

    this.console.groupEnd();
  }

  testGroupSets = () => {
    this.console.group("SETS");

    this.console.groupEnd();
  }

  go = () => {

    this.testGroupFlushAll();

    this.testGroupKeys();

    this.testGroupLists();

    this.testGroupSets();

    this.testGroupLocalStorage();

    this.afterMath();
  }

  afterMath = () => {
    var totalPasses = 0;
    var totalFails = 0;

    for(var r of this.testResults){
      r ? totalPasses++ : totalFails++;
    }

    this.console.header(`Tests: ${totalPasses + totalFails}. Passed: ${totalPasses}, Failed: ${totalFails}.`);
    console.log("TRBN", this.testResultsByName);
    for(var r in this.testResultsByName){
      console.log(r);
      var val = this.testResultsByName[r];
      if(val){
        this.console.footer(r);
      }
    }
  }

};
