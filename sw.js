// carnx service worker: offline shell. Bump VERSION on every release.
const VERSION='carnx-v7';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // news.json: always network (fresh news), fall back to cache offline
  if(u.origin===location.origin&&u.pathname.endsWith('/news.json')){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(VERSION).then(ca=>ca.put(r,c));return x}).catch(()=>caches.match(r)));return}
  // pages: network first, fall back to cache (so updates arrive when online)
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(VERSION).then(ca=>ca.put('index.html',c));return x}).catch(()=>caches.match('index.html')));return}
  // same-origin assets and Google Fonts: cache first, refresh in background
  if(u.origin===location.origin||u.hostname.endsWith('gstatic.com')||u.hostname==='fonts.googleapis.com'){
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(VERSION).then(ca=>ca.put(r,c))}return x})));
  }
});
