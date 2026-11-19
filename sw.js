const C='pdf-filler-v2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pdf-filler-v')&&k!==C).map(k=>caches.delete(k)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.includes('huggingface')||u.pathname.endsWith('.onnx'))return;
  const put=res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res};
  if(u.origin===location.origin){ // app files: network first so updates arrive, cache when offline
    e.respondWith(fetch(e.request).then(put).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else{ // libraries: cache first
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(put)));
  }
});
