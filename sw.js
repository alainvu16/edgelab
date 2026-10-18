// Edge Lab offline cache. Online: the app page always comes fresh from the site, so updates show on the next open.
// Offline: everything is served from the copy saved on this phone.
var CACHE = 'edgelab-leave1018-67';
var ASSETS = ["./", "index.html", "future.css", "fonts/jost-latin-400-normal.woff2", "fonts/jost-latin-500-normal.woff2", "fonts/jost-latin-600-normal.woff2", "fonts/jost-latin-700-normal.woff2", "manifest.json", "icon-180.png", "icon-512.png", "worker.js", "chess.js", "core.js", "respell.js", "glossary.js", "content.js", "distract.js", "engine.js", "puzzles.js", "chessrep.js", "chess-app.js", "xq-engine.js", "xqbook.js", "xq.js", "poker.js", "mktdata.js", "tapedata.js", "momentum.js", "sages.js", "wisdom.js", "think.js", "math.js", "streetdata.js", "street.js", "edge.js", "macro.js", "tape.js", "tonebot.js", "markets.js", "roadmap.js", "popmix.js"];
self.addEventListener('install', function (e) {
  // cache: 'reload' skips the browser's own short-term cache, so an update never saves old files
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ASSETS.map(function (u) { return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(u, r); }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
function fresh(req) { return fetch(new Request(req, { cache: 'no-store' })); }
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) { e.respondWith(fetch(e.request).catch(function () { return new Response('', { status: 204 }); })); return; }
  if (e.request.mode === 'navigate' || /[.]js$/.test(u.pathname) || u.pathname.slice(-1) === '/' || /index[.]html$/.test(u.pathname)) {
    // network first (3 s limit), saved copy if offline or slow
    e.respondWith(caches.open(CACHE).then(function (c) {
      var net = fresh(e.request).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; });
      var timer = new Promise(function (res) { setTimeout(res, 3000); });
      return Promise.race([net.catch(function () { return null; }), timer]).then(function (r) {
        return r || c.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || net; });
      });
    }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || fetch(e.request); }));
});
