export async function resolve(specifier, context, nextResolve) {
  if(specifier==='@netlify/blobs') return {url:new URL('./mock-blobs.mjs', import.meta.url).href,shortCircuit:true};
  return nextResolve(specifier,context);
}
