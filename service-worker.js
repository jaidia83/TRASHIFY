const CACHE_NAME = "trashify-cache-v1";

const urlsToCache = [
  "/",
  "/TRASHIFYHomePage.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/type-of-material.png"
];

// Install service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch cached files
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});