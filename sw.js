// Edge Lab offline cache: everything is stored on first visit, then served even with no connection.
var CACHE = 'edgelab-4cd1dcdb';
var ASSETS = ["./", "index.html", "manifest.json", "icon-180.png", "icon-512.png", "worker.js", "chess.js", "core.js", "content.js", "engine.js", "puzzles.js", "chess-app.js", "xq-engine.js", "xq.js", "poker.js", "mktdata.js", "tapedata.js", "momentum.js", "wisdom.js", "think.js", "macro.js", "tape.js", "markets.js", "roadmap.js"];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) { e.respondWith(fetch(e.request).catch(function () { return new Response('', { status: 204 }); })); return; }
  // app files: cache first (instant + offline), refresh the cache in the background when online
  e.respondWith(caches.open(CACHE).then(function (c) { return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(e.request).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(function () { return hit; });
    return hit || net;
  }); }));
});
