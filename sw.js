/* Guarda o jogo inteiro no aparelho para que ele abra sem internet. */
const CACHE = "freecell-v2";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(guardado => {
      const rede = fetch(e.request).then(resp => {
        if(resp && resp.status === 200 && resp.type === "basic")
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        return resp;
      }).catch(() => guardado || caches.match("./index.html"));
      return guardado || rede;
    })
  );
});
