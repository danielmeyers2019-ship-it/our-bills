// Minimal service worker — required (along with manifest.json) for Android/Chrome
// to treat this as an installable app. Uses network-first so you always get the
// latest version when online, only falling back to a cached copy if offline.
const CACHE_NAME = 'household-ledger-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(response){
      if(response && response.status === 200){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, copy); });
      }
      return response;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
