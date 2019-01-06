//https://codereview.stackexchange.com/questions/134030/typescript-dictionary-class

export interface Dictionary<K, V> {
    getKeys(): K[];
    getValues(): V[];
    get(key: K): V | null; // the key might not exist
    put(key: K, val: V): void; // or boolean?
  }
  
  
  export class JSDictionary<K extends string, V> implements Dictionary<K, V> {
  
    private internalDict: { [key in K]?: V };
  
    constructor() {
      this.internalDict = {};
    }
  
    public getKeys() {
      let keys: K[] = [];
      for(let key in this.internalDict) {
        keys.push(key);
      }
  
      return keys;
    }
  
    // Type predicate to ensure v exists
    private exists(v: V | undefined): v is V {
      return v != null && typeof v !== "undefined";
    }
  
    public getValues() {
      let vals: V[] = [];
  
      for(let key in this.internalDict) {
        let v = this.internalDict[key];
        if(this.exists(v)) {
          vals.push(v);
        }
      }
  
      return vals;
    }
  
    public get(key: K) {
      let v = this.internalDict[key];
      return this.exists(v)
        ? v
        : null;
    }
  
    public put(key: K, val: V): void {
      this.internalDict[key] = val;
    }
  
  }