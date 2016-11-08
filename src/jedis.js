/***

JEDIS

Started in 2016 by Leonardo Luarte (@lomefin)

****/

class Jedis {

  constructor(prefix = "jedis"){
    console.debug("Jedis starting! May the force be with us all.");
    this.prefix = prefix;
    this.ls = window.localStorage;
    this._loadLSKey('keys');
    this._loadLSKey('lists');
    this._loadLSKey('sets');
  }

  set(key, value) {
    return this.setex(key, null, value);
  }

  setex(key, ttl = null, value) {
    if(ttl === null){
      return this.psetex(key, null, value);
    }

    if(!Number.isInteger(ttl)){
      throw new TypeError("TTL is not Integer", typeof ttl);
    }

    return this.psetex(key, ttl * 1000, value);
  }

  psetex(key, ttl = null, value) {
    let expiry = null;
    if(ttl !== null){
      if(!Number.isInteger(ttl)){
        throw new TypeError(`TTL is not Integer, but ${typeof ttl}`);
      }
      if(ttl < 0) {
        throw new RangeError(`TTL is negative: ${ttl}`);
      }
      expiry  = Date.now() + ttl;
    }
    this.keys[key] = { value: value, expiresAt: expiry};
    this._saveLSKey("keys");
    return "OK";
  }

  ttl(key) {
    if(!(key in this.keys)) { return -2; }
    let el = this.keys[key];
    if(el.expiresAt === null){ return -1; }
    return (el.expiresAt - Date.now());
  }

  get(key) {
    if(!(key in this.keys)) { return null; }
    let el = this.keys[key];
    if(el.expiresAt == null){ return el.value; };
    if(el.expiresAt > Date.now()){ return el.value; };
    this.del(key);
    return null;
  }

  del(key){
    delete this.keys[key];
    this._saveLSKey("keys");
    return 1;
  }

  flushAll(confirm = false){
    if(!confirm){
      console.warn("FlushAll requested.");
    }
    this.ls.clear();
    this._loadLSKey('keys');
    this._loadLSKey('lists');
    this._loadLSKey('sets');
  }

  _saveLSKey(key){
    let structure = this[key];
    let json = JSON.stringify(structure);
    this.ls.setItem(`${this.prefix}.${key}`, json);
  }

  _loadLSKey(key){
    let internalKeyValue = this.ls.getItem(`${this.prefix}.${key}`);
    if(internalKeyValue === null) { this[key] = {}; return; }
    var result = {}
    try{
      result = JSON.parse(internalKeyValue);
    }catch(se){
      console.error("Failed to recover database structure due to SyntaxError on parse process.", se);
    }
    this[key] = result;
  }
}
