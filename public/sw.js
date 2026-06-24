/* SomEducation PWA service worker */
const CACHE = "someducation-shell-v3";
const PRECACHE = ["/manifest.webmanifest", "/icon", "/apple-icon"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const url = new URL(event.request.url);
          const shouldCache =
            url.pathname.startsWith("/_next/static/") ||
            url.pathname === "/icon" ||
            url.pathname === "/apple-icon" ||
            url.pathname === "/manifest.webmanifest" ||
            url.pathname === "/sw.js";

          if (shouldCache) {
            void caches.open(CACHE).then((cache) => {
              void cache.put(event.request, response.clone());
            });
          }
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error()))
  );
});
