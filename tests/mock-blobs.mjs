const stores=new Map();
export function getStore(name) {
  if(!stores.has(name))stores.set(name,new Map());
  const map=stores.get(name);
  return {
    async get(key,opts){const v=map.get(key);if(v===undefined)return null;return opts?.type==='json'?structuredClone(v):v;},
    async setJSON(key,value){map.set(key,structuredClone(value));},
    async set(key,value){map.set(key,value);},
    async delete(key){map.delete(key);}
  };
}
export function reset(){stores.clear();}
